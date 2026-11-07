/** 羅盤四周的引線註記。說明每一環是什麼，桌面寬度才顯示。 */
export function Anno({ side, slot, title, desc }: {
  side: 'l' | 'r'
  slot: 1 | 2
  title: string
  desc: string
}) {
  return (
    <span className={`anno anno--${side} anno--${side}${slot}`} aria-hidden="true">
      <span className="anno__text">
        <b className="anno__t">{title}</b>
        <span className="anno__d">{desc}</span>
      </span>
      <span className="anno__rule" />
    </span>
  )
}
