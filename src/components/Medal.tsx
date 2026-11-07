/** 章節徽記：置中圓牌夾在兩道細線之間 */
export function Medal({ no, name }: { no: string; name: string }) {
  return (
    <div className="medal" aria-hidden="true">
      <span className="medal__rule" />
      <span className="medal__body">
        <span className="medal__ring"><span className="medal__no">{no}</span></span>
        <span className="medal__name">{name}</span>
      </span>
      <span className="medal__rule" />
    </div>
  )
}
