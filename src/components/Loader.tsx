import { useEffect, useRef, useState } from 'react'
import { SOLAR_TERMS } from '../data/solarTerms'
import { milledEdge, pearlBand, polar, tickPath } from '../lib/geometry'

/**
 * 開場：一座小羅盤把刻度對齊，外圈走完一圈二十四節氣後讓開。
 * 這段同時等字體就緒，中文網頁字體換入造成的回流因此發生在簾幕後面。
 * 偏好減少動態時整段跳過。
 */
export function Loader({ reducedMotion, onDone }: { reducedMotion: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>(reducedMotion ? 'gone' : 'in')
  const [tick, setTick] = useState(0)
  const started = useRef(performance.now())

  useEffect(() => {
    if (reducedMotion) { onDone(); return }
    document.body.classList.add('is-loading')
    let alive = true

    const spin = window.setInterval(() => setTick((t) => t + 1), 95)

    const fonts = document.fonts?.ready ?? Promise.resolve()
    const cap = new Promise((r) => window.setTimeout(r, 2600))

    void Promise.race([fonts, cap]).then(() => {
      const elapsed = performance.now() - started.current
      const wait = Math.max(0, 1500 - elapsed)
      window.setTimeout(() => {
        if (!alive) return
        setPhase('out')
        onDone()
        window.setTimeout(() => {
          if (!alive) return
          setPhase('gone')
          document.body.classList.remove('is-loading')
        }, 720)
      }, wait)
    })

    return () => {
      alive = false
      window.clearInterval(spin)
      document.body.classList.remove('is-loading')
    }
    // onDone 由呼叫端以 useCallback 固定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  if (phase === 'gone') return null

  const lit = tick % 24
  const term = SOLAR_TERMS[lit]!

  return (
    <div className={`loader${phase === 'out' ? ' loader--out' : ''}`} role="status" aria-live="polite">
      <span className="visually-hidden">網站載入中</span>
      <div className="loader__inner" aria-hidden="true">
        <svg className="loader__dial" viewBox="0 0 1000 1000">
          <circle className="bezel-rule bezel-rule--out" cx="500" cy="500" r="490" fill="none" />
          <path className="bezel-milled" d={milledEdge(470, 486, 120)} fill="none" />
          <circle className="bezel-rule" cx="500" cy="500" r="466" fill="none" />
          <path className="loader__spokes" d={tickPath(404, 440, 24)} fill="none" />
          <path className="loader__pearl" d={pearlBand(452, 4.5, 12)} />
          <circle className="ring-hair" cx="500" cy="500" r="398" fill="none" />
          {SOLAR_TERMS.map((t, i) => {
            const p = polar(398, i * 15)
            return (
              <circle key={t.id} className={`loader__node${i <= lit ? ' is-on' : ''}`}
                cx={p.x} cy={p.y} r="7" />
            )
          })}
          <g className="loader__needle" style={{ transform: `rotate(${lit * 15}deg)` }}>
            <line x1="500" y1="470" x2="500" y2="56" />
            <path d="M500 34 L513 70 L500 61 L487 70 Z" />
          </g>
          <circle className="loader__hub" cx="500" cy="500" r="11" />
        </svg>
        <p className="loader__term">{term.name}</p>
        <p className="loader__mark">四時有序 <span>SHI XU</span></p>
      </div>
    </div>
  )
}
