import { useCallback, useEffect, useRef, useState } from 'react'
import { SOLAR_TERMS, SEASON_LABEL, type Season } from '../data/solarTerms'
import { MONTH_SEGMENTS } from '../data/monthSegments'
import { computeMonthGanzhi } from '../lib/ganzhi'
import {
  annularSector, cartouche, diamondBand, milledEdge, monthAngles,
  pearlBand, polar, scallopBand, sunburst, termAngle, tickPath,
} from '../lib/geometry'

/** 盤面半徑。桌面與手機各一組，手機不是把桌面縮小，而是重新分配環帶厚度。 */
interface Radii {
  ruleOut: number; milledIn: number; ruleMid: number
  bezelIn: number; bezelDiamond: number; bezelPearl: number
  cartoucheR: number; cartoucheW: number; cartoucheH: number; cartoucheFont: number
  minorIn: number; minorOut: number
  jieIn: number; qiIn: number; tickOut: number; node: number
  termLabel: number; jieFont: number; qiFont: number
  bandIn: number; bandOut: number
  stemIn: number; stemOut: number; stemGlyph: number; stemFont: number
  branchIn: number; branchGlyph: number; branchFont: number
  core: number; burstY: number; burstIn: number; burstOut: number
  nameY: number; nameFont: number; ruleY: number; ruleW: number
  metaY: number; metaFont: number; ganzhiY: number; ganzhiFont: number
  hitIn: number
}

const WIDE: Radii = {
  ruleOut: 498, milledIn: 488, ruleMid: 488,
  bezelIn: 452, bezelDiamond: 470, bezelPearl: 458,
  cartoucheR: 471, cartoucheW: 21, cartoucheH: 23, cartoucheFont: 27,
  minorIn: 428, minorOut: 440,
  jieIn: 406, qiIn: 424, tickOut: 444, node: 449,
  termLabel: 378, jieFont: 29, qiFont: 22,
  bandIn: 318, bandOut: 350,
  stemIn: 258, stemOut: 316, stemGlyph: 287, stemFont: 30,
  branchIn: 186, branchGlyph: 222, branchFont: 41,
  core: 186, burstY: 400, burstIn: 14, burstOut: 43,
  nameY: 506, nameFont: 78, ruleY: 537, ruleW: 52,
  metaY: 566, metaFont: 23, ganzhiY: 598, ganzhiFont: 30,
  hitIn: 352,
}

const COMPACT: Radii = {
  ruleOut: 498, milledIn: 490, ruleMid: 490,
  bezelIn: 462, bezelDiamond: 477, bezelPearl: 466,
  cartoucheR: 477, cartoucheW: 18, cartoucheH: 20, cartoucheFont: 24,
  minorIn: 442, minorOut: 452,
  jieIn: 420, qiIn: 436, tickOut: 456, node: 460,
  termLabel: 410, jieFont: 29, qiFont: 22,
  bandIn: 384, bandOut: 420,
  stemIn: 294, stemOut: 378, stemGlyph: 336, stemFont: 48,
  branchIn: 210, branchGlyph: 252, branchFont: 58,
  core: 210, burstY: 398, burstIn: 16, burstOut: 46,
  nameY: 514, nameFont: 96, ruleY: 550, ruleW: 64,
  metaY: 582, metaFont: 31, ganzhiY: 618, ganzhiFont: 38,
  hitIn: 210,
}

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
/** 四季牌放在立春、立夏、立秋、立冬四個交界上，正好是每一季的起點 */
const SEASON_START_ANGLE: Record<Season, number> = { spring: 0, summer: 90, autumn: 180, winter: 270 }

/** 指標永遠走最短路徑，不會為了回到立春而倒轉一整圈 */
function useContinuousAngle(target: number): number {
  const [angle, setAngle] = useState(target)
  const ref = useRef(target)
  useEffect(() => {
    const delta = ((target - (ref.current % 360) + 540) % 360) - 180
    ref.current += delta
    setAngle(ref.current)
  }, [target])
  return angle
}

export interface CompassProps {
  year: number
  /** 已選定的節氣 */
  termIndex: number
  monthIndex: number
  season: Season
  /** 卷二才顯示月干環；首屏先呈現固定結構，年度相關的一層留到下一章 */
  showStemRing: boolean
  /** 手機：外圈不放二十四個節氣字，改由盤下的真實控制項選取 */
  compact: boolean
  /** 首屏：指標自行巡行，游標移入時停在指到的位置 */
  sweep?: boolean
  /** 使用者偏好減少動態時不自轉 */
  reducedMotion?: boolean
  onSelectTerm: (termId: string) => void
  onSelectMonth: (monthIndex: number) => void
}

export function Compass(props: CompassProps) {
  const {
    year, termIndex, monthIndex, season, showStemRing, compact,
    sweep = false, reducedMotion = false, onSelectTerm, onSelectMonth,
  } = props

  const base = compact ? COMPACT : WIDE
  // 首屏沒有月干環，環帶有餘裕，字級放大才撐得住較小的盤徑
  const R: Radii = (!compact && !showStemRing)
    ? { ...base, jieFont: 34, qiFont: 27, branchFont: 46, nameFont: 84, metaFont: 25 }
    : base
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const needleRef = useRef<SVGGElement | null>(null)
  const dragging = useRef(false)

  /* ---------------- 首屏指標的自行巡行 ---------------- */
  const sweeping = sweep && !reducedMotion
  const [sweepIndex, setSweepIndex] = useState(termIndex)
  const angleRef = useRef(termAngle(termIndex))
  const lockedRef = useRef(false)
  const visibleRef = useRef(true)

  const activeIndex = sweeping ? sweepIndex : termIndex
  const activeTerm = SOLAR_TERMS[activeIndex]!
  const activeMonth = sweeping ? activeTerm.monthIndex : monthIndex
  const activeSeason = sweeping ? activeTerm.season : season

  useEffect(() => {
    if (!sweeping) return
    const el = svgRef.current
    if (!el) return

    const io = new IntersectionObserver(([e]) => { visibleRef.current = e?.isIntersecting ?? true })
    io.observe(el)

    let raf = 0
    let last = performance.now()
    let shown = -1
    const degPerMs = 360 / 44000 // 一圈約 44 秒

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      if (!lockedRef.current && visibleRef.current && !document.hidden) {
        angleRef.current = (angleRef.current + dt * degPerMs) % 360
        if (needleRef.current) needleRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
      const idx = Math.round(angleRef.current / 15) % 24
      if (idx !== shown) { shown = idx; setSweepIndex(idx) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [sweeping])

  /* ---------------- 角度計算，供巡行鎖定與滑鼠拖曳共用 ---------------- */
  const angleAt = useCallback((clientX: number, clientY: number): number => {
    const el = svgRef.current
    if (!el) return 0
    const b = el.getBoundingClientRect()
    const deg = (Math.atan2(clientX - (b.left + b.width / 2), (b.top + b.height / 2) - clientY) * 180) / Math.PI
    return (deg + 360) % 360
  }, [])

  /** 換算成 viewBox 單位的半徑，用來判斷指標是否落在可選取的環帶上 */
  const radiusAt = useCallback((clientX: number, clientY: number): number => {
    const el = svgRef.current
    if (!el) return 0
    const b = el.getBoundingClientRect()
    if (b.width === 0) return 0
    const dx = clientX - (b.left + b.width / 2)
    const dy = clientY - (b.top + b.height / 2)
    return (Math.hypot(dx, dy) / b.width) * 1000
  }, [])

  const lockTo = useCallback((clientX: number, clientY: number) => {
    if (!sweeping) return
    lockedRef.current = true
    angleRef.current = angleAt(clientX, clientY)
    if (needleRef.current) needleRef.current.style.transform = `rotate(${angleRef.current}deg)`
  }, [angleAt, sweeping])

  const release = useCallback(() => { lockedRef.current = false }, [])

  /* ---------------- 滑鼠拖曳（觸控維持原生捲動） ---------------- */
  const selectAtAngle = useCallback((clientX: number, clientY: number) => {
    const a = angleAt(clientX, clientY)
    if (compact) onSelectMonth(Math.floor(a / 30) % 12)
    else onSelectTerm(SOLAR_TERMS[Math.round(a / 15) % 24]!.id)
  }, [angleAt, compact, onSelectMonth, onSelectTerm])

  const downAt = useRef<{ x: number; y: number } | null>(null)
  const captured = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<SVGGElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    dragging.current = true
    captured.current = false
    downAt.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<SVGGElement>) => {
    lockTo(e.clientX, e.clientY)
    if (!dragging.current || !downAt.current) return
    // 先確定是拖曳才接管指標。一按就接管會讓 click 改派到接管的元素，
    // 單純點一下反而選不到。
    if (!captured.current) {
      const moved = Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y)
      if (moved < 6) return
      captured.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    selectAtAngle(e.clientX, e.clientY)
  }, [lockTo, selectAtAngle])

  const endDrag = useCallback((e: React.PointerEvent<SVGGElement>) => {
    if (!dragging.current) return
    dragging.current = false
    downAt.current = null
    if (captured.current) {
      captured.current = false
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
      return
    }
    // 沒有進入拖曳就是一次點選。在這裡處理，不依賴 click 的目標。
    const r = radiusAt(e.clientX, e.clientY)
    if (r >= R.hitIn && r <= 520) selectAtAngle(e.clientX, e.clientY)
  }, [R.hitIn, radiusAt, selectAtAngle])

  const onLeave = useCallback(() => { setHover(null); release() }, [release])

  /* ---------------- 衍生值 ---------------- */
  const needleAngle = useContinuousAngle(termAngle(termIndex))
  const [mStart, mEnd] = monthAngles(activeMonth)
  const wedgeOuter = showStemRing ? R.stemOut : R.bandIn - 3
  const branchGlyphR = showStemRing ? R.branchGlyph : (R.branchIn + R.bandIn) / 2
  const ganzhi = computeMonthGanzhi(year, activeMonth)
  const seasonFill = `var(--${activeSeason})`

  return (
    <svg
      ref={svgRef}
      className="dial"
      viewBox="0 0 1000 1000"
      aria-hidden="true"
      focusable="false"
      onPointerLeave={onLeave}
    >
      <circle cx="500" cy="500" r={R.ruleOut} fill="var(--paper)" />

      <g style={{ pointerEvents: 'none' }}>
        {/* ── 鏨刻外環 ───────────────────────────────── */}
        <g className="dial__fade-1">
          <circle className="bezel-field" cx="500" cy="500" r={R.ruleOut} />
          <circle cx="500" cy="500" r={R.bezelIn} fill="var(--paper)" />
          <circle className="bezel-rule bezel-rule--out" cx="500" cy="500" r={R.ruleOut} fill="none" />
          <path className="bezel-milled" d={milledEdge(R.milledIn, R.ruleOut - 1, compact ? 180 : 240)} fill="none" />
          <circle className="bezel-rule" cx="500" cy="500" r={R.ruleMid} fill="none" />
          <path className="bezel-scallop" d={scallopBand(R.bezelIn, 7, 36)} fill="none" />
          <path className="bezel-div" d={tickPath(R.bezelIn, R.ruleMid, 12)} fill="none" />
          <path className="bezel-pearl" d={pearlBand(R.bezelPearl, 1.7, 72)} />
          <path className="bezel-diamond" d={diamondBand(R.bezelDiamond, 5.5, 12, 15)} />
          <circle className="bezel-rule" cx="500" cy="500" r={R.bezelIn} fill="none" />

          {/* 四季牌：每一季的起點就是立春、立夏、立秋、立冬 */}
          {SEASONS.map((s) => {
            const a = SEASON_START_ANGLE[s]
            const c = polar(R.cartoucheR, a)
            return (
              <g key={s}>
                <path className="cartouche__fill" d={cartouche(R.cartoucheR, a, R.cartoucheW, R.cartoucheH)} />
                <path className="cartouche__line" d={cartouche(R.cartoucheR, a, R.cartoucheW, R.cartoucheH)} fill="none" />
                <path
                  className="cartouche__inner"
                  d={cartouche(R.cartoucheR, a, R.cartoucheW - 4, R.cartoucheH - 4, 2)}
                  fill="none"
                />
                <text
                  className={`label label--cartouche${s === activeSeason ? ' label--cartouche-on' : ''}`}
                  x={c.x} y={c.y} style={{ fontSize: R.cartoucheFont }}
                >
                  {SEASON_LABEL[s]}
                </text>
              </g>
            )
          })}
        </g>

        {/* ── 四季色帶 ───────────────────────────────── */}
        <g className="dial__fade-2">
          {SEASONS.map((s, i) => (
            <path
              key={s}
              className="band-season"
              d={annularSector(R.bandIn, R.bandOut, i * 90, i * 90 + 90)}
              fill={`var(--${s})`}
              fillOpacity={s === activeSeason ? 0.95 : 0.38}
            />
          ))}
          <path className="band-sep" d={tickPath(R.bandIn, R.bandOut, 12)} fill="none" />
          <circle className="ring-hair" cx="500" cy="500" r={R.bandOut} fill="none" />
          <circle className="ring-hair" cx="500" cy="500" r={R.bandIn} fill="none" />
        </g>

        {/* ── 選取的節月扇區 ─────────────────────────── */}
        <path className="wedge" d={annularSector(R.branchIn, wedgeOuter, mStart, mEnd)}
          fill={seasonFill} fillOpacity={0.4} />
        {hover !== null && hover !== activeMonth && (
          <path d={annularSector(R.branchIn, wedgeOuter, ...monthAngles(hover))}
            fill="var(--ink)" fillOpacity={0.045} />
        )}

        {/* ── 刻度帶 ─────────────────────────────────── */}
        <g className="dial__fade-1">
          <path className="tick-minor" d={tickPath(R.minorIn, R.minorOut, 120)} fill="none" />
          <path className="tick-qi" d={tickPath(R.qiIn, R.tickOut, 12, 15, 30)} fill="none" />
          <path className="tick-jie" d={tickPath(R.jieIn, R.tickOut, 12, 0, 30)} fill="none" />
          <path className="node-jie" d={diamondBand(R.node, 4.6, 12, 0)} />
          <path className="node-qi" d={pearlBand(R.node, 2.5, 12, 15)} fill="none" />
        </g>

        {/* ── 外環：二十四節氣。手機不放字，改以盤下控制項操作 ── */}
        {!compact && (
          <g className="dial__fade-3">
            {SOLAR_TERMS.map((t, i) => {
              const p = polar(R.termLabel, termAngle(i))
              const on = i === activeIndex
              return (
                <text
                  key={t.id}
                  className={`label ${t.kind === '節' ? 'label--jie' : 'label--qi'}${on ? ' label--on' : ''}`}
                  x={p.x} y={p.y}
                  style={{ fontSize: t.kind === '節' ? R.jieFont : R.qiFont, fontWeight: on ? 700 : undefined }}
                >
                  {t.name}
                </text>
              )
            })}
          </g>
        )}

        {/* ── 中環：十二個節月各自的月干 ─────────────── */}
        {showStemRing && (
          <g className="dial__fade-3">
            <circle className="ring-hair" cx="500" cy="500" r={R.stemOut} fill="none" />
            <path className="ring-spoke" d={tickPath(R.stemIn, R.stemOut, 12)} fill="none" />
            {MONTH_SEGMENTS.map((seg) => {
              const p = polar(R.stemGlyph, seg.index * 30 + 15)
              const on = seg.index === activeMonth
              return (
                <text key={seg.index}
                  className={`label label--stem${on ? ' label--stem-on' : ''}`}
                  x={p.x} y={p.y} style={{ fontSize: R.stemFont }}
                >
                  {computeMonthGanzhi(year, seg.index).stem}
                </text>
              )
            })}
          </g>
        )}

        {/* ── 內環：十二地支 ─────────────────────────── */}
        <g className="dial__fade-2">
          <circle className="ring-hair" cx="500" cy="500" r={R.branchIn} fill="none" />
          <path className="ring-pip" d={pearlBand(R.branchIn, 2.2, 12, 0)} />
          {MONTH_SEGMENTS.map((seg) => {
            const p = polar(branchGlyphR, seg.index * 30 + 15)
            const on = seg.index === activeMonth
            return (
              <text key={seg.index}
                className={`label label--branch${on ? ' label--branch-on' : ''}`}
                x={p.x} y={p.y} style={{ fontSize: R.branchFont }}
              >
                {seg.branch}
              </text>
            )
          })}
        </g>

        {/* ── 中央讀數 ───────────────────────────────── */}
        <g className="dial__fade-3" transform={showStemRing ? undefined : 'translate(0 14)'}>
          <circle cx="500" cy={500 - (showStemRing ? 0 : 14)} r={R.core} fill="var(--paper)" fillOpacity="0.94" />
          <path className="burst" d={sunburst(500, R.burstY, R.burstIn, R.burstOut, 48)} fill="none" />
          <circle className="burst-hub" cx="500" cy={R.burstY} r="3.2" />
          <text className="core__name" x="500" y={R.nameY} style={{ fontSize: R.nameFont }}>
            {activeTerm.name}
          </text>
          <line className="core__rule" x1={500 - R.ruleW} x2={500 - 9} y1={R.ruleY} y2={R.ruleY} />
          <line className="core__rule" x1={500 + 9} x2={500 + R.ruleW} y1={R.ruleY} y2={R.ruleY} />
          <path className="core__pip"
            d={`M 500 ${R.ruleY - 3.4} L 503.4 ${R.ruleY} L 500 ${R.ruleY + 3.4} L 496.6 ${R.ruleY} Z`} />
          <text className="core__meta" x="500" y={R.metaY} style={{ fontSize: R.metaFont }}>
            {SEASON_LABEL[activeSeason]}・{MONTH_SEGMENTS[activeMonth]!.branch}月
          </text>
          {showStemRing && (
            <text className="core__ganzhi" x="500" y={R.ganzhiY} style={{ fontSize: R.ganzhiFont }}>
              {ganzhi.text}月
            </text>
          )}
        </g>

        {/* ── 指標 ───────────────────────────────────── */}
        <g
          ref={needleRef}
          className={`needle${sweeping ? ' needle--free' : ''}`}
          style={sweeping ? { transform: `rotate(${angleRef.current}deg)` } : { transform: `rotate(${needleAngle}deg)` }}
        >
          <line className="needle__line" x1="500" y1={500 - R.core + 12} x2="500" y2={500 - R.ruleOut + 26} />
          <path className="needle__head" d={`M 500 ${500 - R.ruleOut + 6} L 509 ${500 - R.ruleOut + 24}
            L 500 ${500 - R.ruleOut + 19} L 491 ${500 - R.ruleOut + 24} Z`} />
          <circle className="needle__hub" cx="500" cy="500" r="6.5" />
        </g>
      </g>

      {/* 可點區。桌面 24 格，手機 12 格並改選該節月的節 */}
      <g
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {compact
          ? MONTH_SEGMENTS.map((seg) => (
              <path key={seg.index} className="dial__hit"
                d={annularSector(R.hitIn, 500, seg.index * 30, seg.index * 30 + 30)}
                onPointerEnter={() => setHover(seg.index)}
                onClick={() => onSelectMonth(seg.index)} />
            ))
          : SOLAR_TERMS.map((t, i) => (
              <path key={t.id} className="dial__hit"
                d={annularSector(R.hitIn, 500, i * 15 - 7.5, i * 15 + 7.5)}
                onPointerEnter={() => setHover(t.monthIndex)}
                onClick={() => onSelectTerm(t.id)} />
            ))}
      </g>
    </svg>
  )
}
