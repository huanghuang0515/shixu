import { SEASON_LABEL } from '../data/solarTerms'
import type { AlmanacView } from '../lib/useAlmanac'

export function InfoPanel({ a }: { a: AlmanacView }) {
  const { term, segment, monthGanzhi, yearGanzhiText, startTerm, nextStartTerm } = a

  return (
    <div className="panel">
      <div className="panel__head">
        <h3 className="panel__term">{term.name}</h3>
        <span className="panel__kind" data-kind={term.kind}>{term.kind}</span>
      </div>
      <div className="panel__season-bar" />

      <dl className="facts">
        <div className="facts__row">
          <dt className="facts__k">季節</dt>
          <dd className="facts__v facts__v--season">{SEASON_LABEL[term.season]}</dd>
        </div>
        <div className="facts__row">
          <dt className="facts__k">地支月</dt>
          <dd className="facts__v facts__v--big">{segment.branch}月</dd>
        </div>
        <div className="facts__row">
          <dt className="facts__k">月干支</dt>
          <dd className="facts__v facts__v--big">
            {monthGanzhi.text}月
            <span className="facts__num" style={{ fontFamily: 'var(--sans)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginLeft: '0.6rem' }}>
              {a.year} {yearGanzhiText}年度
            </span>
          </dd>
        </div>
        <div className="facts__row">
          <dt className="facts__k">節月區間</dt>
          <dd className="facts__v">{startTerm.name}起，至{nextStartTerm.name}前</dd>
        </div>
        <div className="facts__row">
          <dt className="facts__k">太陽黃經</dt>
          <dd className="facts__v facts__num">{term.longitude}°</dd>
        </div>
      </dl>

      <ul className="panel__notes">
        {term.notes.map((n) => <li key={n}>{n}</li>)}
      </ul>

      <p className="panel__source">
        節氣名稱、節／中氣分類與太陽黃經依香港天文台〈二十四節氣〉；月干依〈天干和地支〉的年干推月干規則計算。
      </p>
    </div>
  )
}
