/**
 * 羅盤幾何。
 *
 * 角度定義：以畫面正上方為 0°，順時針遞增。立春在正上方，寅月由此順時針展開。
 * 這是「時間索引」的排列角度，不是太陽黃經，也不是實際測得的方位。
 * 太陽黃經只在資訊面板以數值呈現，不在盤面標出度數刻度。
 */

export interface Point {
  x: number
  y: number
}

export const CENTER = 500

/** 每個節氣佔 15°，第 i 個節氣（立春為 0）位於 i × 15° */
export function termAngle(termIndex: number): number {
  return termIndex * 15
}

/** 第 m 個節月（寅月為 0）的起始角與終止角 */
export function monthAngles(monthIndex: number): [number, number] {
  return [monthIndex * 30, monthIndex * 30 + 30]
}

export function polar(radius: number, angleDeg: number, cx = CENTER, cy = CENTER): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

const n = (v: number) => Math.round(v * 100) / 100

/** 環形扇區（甜甜圈的一段）路徑 */
export function annularSector(
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const large = endDeg - startDeg > 180 ? 1 : 0
  const o1 = polar(outerR, startDeg)
  const o2 = polar(outerR, endDeg)
  const i2 = polar(innerR, endDeg)
  const i1 = polar(innerR, startDeg)
  return [
    `M ${n(o1.x)} ${n(o1.y)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${n(o2.x)} ${n(o2.y)}`,
    `L ${n(i2.x)} ${n(i2.y)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${n(i1.x)} ${n(i1.y)}`,
    'Z',
  ].join(' ')
}

/** 一組放射狀刻線，合併成單一 path，避免產生大量 SVG 節點 */
export function tickPath(
  innerR: number,
  outerR: number,
  count: number,
  offsetDeg = 0,
  step = 360 / count,
): string {
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    const a = offsetDeg + i * step
    const p1 = polar(innerR, a)
    const p2 = polar(outerR, a)
    parts.push(`M ${n(p1.x)} ${n(p1.y)} L ${n(p2.x)} ${n(p2.y)}`)
  }
  return parts.join(' ')
}

/** 以指定角度與半徑放一枚菱形標記 */
export function diamondPath(radius: number, angleDeg: number, size: number): string {
  const c = polar(radius, angleDeg)
  return `M ${n(c.x)} ${n(c.y - size)} L ${n(c.x + size)} ${n(c.y)} L ${n(c.x)} ${n(c.y + size)} L ${n(c.x - size)} ${n(c.y)} Z`
}

/* ------------------------------------------------------------------ */
/* 盤面紋樣。全部合併成單一 path，避免為了裝飾產生數百個 SVG 節點。      */
/* ------------------------------------------------------------------ */

/** 滾花邊：外緣一圈極細的放射短刻，讀起來像金屬器件的轉鈕 */
export function milledEdge(innerR: number, outerR: number, count = 240): string {
  return tickPath(innerR, outerR, count)
}

/** 連珠紋：一圈等距小圓，以 path 的弧線指令畫成，只佔一個節點 */
export function pearlBand(radius: number, dotR: number, count: number, offsetDeg = 0): string {
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    const c = polar(radius, offsetDeg + (i * 360) / count)
    const x = Math.round(c.x * 100) / 100
    const y = Math.round(c.y * 100) / 100
    parts.push(
      `M ${x - dotR} ${y}`,
      `a ${dotR} ${dotR} 0 1 0 ${dotR * 2} 0`,
      `a ${dotR} ${dotR} 0 1 0 ${-dotR * 2} 0`,
    )
  }
  return parts.join(' ')
}

/** 一圈菱形。用在鏨刻環帶的十二個節月位置。 */
export function diamondBand(radius: number, size: number, count: number, offsetDeg = 0): string {
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    parts.push(diamondPath(radius, offsetDeg + (i * 360) / count, size))
  }
  return parts.join(' ')
}

/**
 * 雲頭紋：每一格畫一道向外鼓起的淺弧，首尾相接繞成一圈。
 * 用於鏨刻環帶的內緣，讓邊框不是只有直線與圓。
 */
export function scallopBand(radius: number, depth: number, count: number, offsetDeg = 0): string {
  const step = 360 / count
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    const a1 = offsetDeg + i * step
    const a2 = a1 + step
    const p1 = polar(radius, a1)
    const p2 = polar(radius, a2)
    const mid = polar(radius + depth, a1 + step / 2)
    parts.push(
      `M ${Math.round(p1.x * 100) / 100} ${Math.round(p1.y * 100) / 100}`,
      `Q ${Math.round(mid.x * 100) / 100} ${Math.round(mid.y * 100) / 100}`,
      `${Math.round(p2.x * 100) / 100} ${Math.round(p2.y * 100) / 100}`,
    )
  }
  return parts.join(' ')
}

/** 日芒：由一點向外的細放射線，用在中央讀數上方 */
export function sunburst(cx: number, cy: number, innerR: number, outerR: number, count: number): string {
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    const a = ((i * 360) / count - 90) * (Math.PI / 180)
    const x1 = cx + innerR * Math.cos(a)
    const y1 = cy + innerR * Math.sin(a)
    const x2 = cx + outerR * Math.cos(a)
    const y2 = cy + outerR * Math.sin(a)
    parts.push(
      `M ${Math.round(x1 * 100) / 100} ${Math.round(y1 * 100) / 100}`,
      `L ${Math.round(x2 * 100) / 100} ${Math.round(y2 * 100) / 100}`,
    )
  }
  return parts.join(' ')
}

/** 四季牌：立春、立夏、立秋、立冬四個方位上的圓角方牌外框 */
export function cartouche(radius: number, angleDeg: number, halfW: number, halfH: number, r = 3): string {
  const c = polar(radius, angleDeg)
  const x = c.x - halfW
  const y = c.y - halfH
  const w = halfW * 2
  const h = halfH * 2
  return [
    `M ${Math.round((x + r) * 100) / 100} ${Math.round(y * 100) / 100}`,
    `h ${w - r * 2}`, `a ${r} ${r} 0 0 1 ${r} ${r}`,
    `v ${h - r * 2}`, `a ${r} ${r} 0 0 1 ${-r} ${r}`,
    `h ${-(w - r * 2)}`, `a ${r} ${r} 0 0 1 ${-r} ${-r}`,
    `v ${-(h - r * 2)}`, `a ${r} ${r} 0 0 1 ${r} ${-r}`,
    'Z',
  ].join(' ')
}
