import { useState } from 'react'
import { SEASON_LABEL, TERM_BY_ID, type Season } from '../data/solarTerms'
import { MONTH_SEGMENTS } from '../data/monthSegments'
import { computeMonthGanzhi } from '../lib/ganzhi'
import type { AlmanacView } from '../lib/useAlmanac'

const FILTERS: { key: Season | 'all'; label: string }[] = [
  { key: 'all', label: '全年' },
  { key: 'spring', label: '春' },
  { key: 'summer', label: '夏' },
  { key: 'autumn', label: '秋' },
  { key: 'winter', label: '冬' },
]

export function YearTable({ a }: { a: AlmanacView }) {
  const [filter, setFilter] = useState<Season | 'all'>('all')
  const rows = MONTH_SEGMENTS.filter((seg) => filter === 'all' || seg.season === filter).map((seg) => ({
    seg,
    start: TERM_BY_ID.get(seg.startTermId)!,
    middle: TERM_BY_ID.get(seg.middleTermId)!,
    next: TERM_BY_ID.get(seg.nextStartTermId)!,
    ganzhi: computeMonthGanzhi(a.year, seg.index),
    on: seg.index === a.term.monthIndex,
  }))

  return (
    <>
      <div className="seasontabs" role="group" aria-label="依季節篩選節月">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="seasontab"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <table className="yeartable">
        <caption>
          {a.year} {a.yearGanzhiText}年度，{filter === 'all' ? '十二個節月' : `${SEASON_LABEL[filter]}季三個節月`}。選任何一列，羅盤與面板會跳到該節月的起始節。
        </caption>
        <colgroup>
          <col className="c-branch" />
          <col className="c-ganzhi" />
          <col className="c-term" />
          <col className="c-term" />
          <col className="c-season" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">地支月</th>
            <th scope="col">本年干支月</th>
            <th scope="col">節</th>
            <th scope="col">中氣</th>
            <th scope="col">季節</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.seg.index}
              data-on={r.on}
              onClick={() => a.setTermId(r.seg.startTermId)}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <button
                  type="button"
                  className="cellbtn"
                  onClick={(e) => { e.stopPropagation(); a.setTermId(r.seg.startTermId) }}
                  aria-pressed={r.on}
                >
                  <span className="cell-branch">{r.seg.branch}月</span>
                </button>
              </td>
              <td><span className="cell-ganzhi" style={{ paddingInline: '0.9rem' }}>{r.ganzhi.text}</span></td>
              <td>
                <span className="cell-term" style={{ paddingInline: '0.9rem' }}>
                  {r.start.name}
                  <span className="cell-note">起點・至{r.next.name}前</span>
                </span>
              </td>
              <td>
                <span className="cell-term" style={{ paddingInline: '0.9rem' }}>
                  {r.middle.name}
                  <span className="cell-note">中氣・仍屬{r.seg.branch}月</span>
                </span>
              </td>
              <td>
                <span className="cell-season" data-s={r.seg.season} style={{ paddingInline: '0.9rem' }}>
                  {SEASON_LABEL[r.seg.season]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 手機：一列一個節月的清單，欄位名稱仍然明確 */}
      <ul className="monthlist">
        {rows.map((r) => (
          <li key={r.seg.index}>
            <button
              type="button"
              className="monthrow"
              data-on={r.on}
              aria-pressed={r.on}
              onClick={() => a.setTermId(r.seg.startTermId)}
            >
              <span className="monthrow__branch">
                {r.seg.branch}
                <small>地支月</small>
              </span>
              <span className="monthrow__terms">
                {r.start.name}　{r.middle.name}
                <small>節・中氣（{SEASON_LABEL[r.seg.season]}）</small>
              </span>
              <span className="monthrow__ganzhi">{r.ganzhi.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
