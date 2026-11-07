import { SOLAR_TERMS, TERM_BY_ID } from '../data/solarTerms'
import { MONTH_SEGMENTS } from '../data/monthSegments'
import { yearGanzhi, yearOptions } from '../lib/ganzhi'
import type { AlmanacView } from '../lib/useAlmanac'

export function Controls({ a, mobile }: { a: AlmanacView; mobile: boolean }) {
  return (
    <div className="controls">
      <div className="controls__row">
        <label className="field">
          <span className="field__label">年度</span>
          <select
            className="select"
            value={a.year}
            onChange={(e) => a.setYear(Number(e.target.value))}
          >
            {yearOptions().map((y) => (
              <option key={y} value={y}>{`${y} ${yearGanzhi(y)}年度`}</option>
            ))}
          </select>
        </label>

        <div className="field" role="group" aria-label="前後節氣">
          <span className="field__label">前後</span>
          <div className="controls__step">
            <button
              type="button"
              className="btn btn--step"
              onClick={() => a.stepTerm(-1)}
              aria-label={`上一個節氣：${SOLAR_TERMS[(a.termIndex + 23) % 24]!.name}`}
            >
              ◀
            </button>
            <button
              type="button"
              className="btn btn--step"
              onClick={() => a.stepTerm(1)}
              aria-label={`下一個節氣：${SOLAR_TERMS[(a.termIndex + 1) % 24]!.name}`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <label className="field field--term">
        <span className="field__label">節氣</span>
        <select
          className="select"
          value={a.termId}
          onChange={(e) => a.setTermId(e.target.value)}
        >
          {MONTH_SEGMENTS.map((seg) => (
            <optgroup key={seg.index} label={`${seg.branch}月`}>
              {[seg.startTermId, seg.middleTermId].map((id) => {
                const t = TERM_BY_ID.get(id)!
                return (
                  <option key={id} value={id}>
                    {t.name}（{t.kind}）
                  </option>
                )
              })}
            </optgroup>
          ))}
        </select>
      </label>

      {mobile && (
        <div className="chipbar">
          <div>
            <span className="field__label">節月</span>
            <div className="chipscroll" role="group" aria-label="選擇節月">
              {MONTH_SEGMENTS.map((seg) => (
                <button
                  key={seg.index}
                  type="button"
                  className="chip"
                  aria-pressed={seg.index === a.term.monthIndex}
                  onClick={() => a.setTermId(seg.startTermId)}
                >
                  {seg.branch}
                  <small>{TERM_BY_ID.get(seg.startTermId)!.name}</small>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="field__label">本月的節與中氣</span>
            <div className="pair" role="group" aria-label="在目前節月內切換節與中氣">
              {[a.startTerm, a.middleTerm].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="pair__btn"
                  aria-pressed={t.id === a.termId}
                  onClick={() => a.setTermId(t.id)}
                >
                  <b>{t.name}</b>
                  <small>{t.kind}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
