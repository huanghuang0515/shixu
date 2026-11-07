import { useCallback, useState, type CSSProperties } from 'react'
import { SEASON_LABEL } from './data/solarTerms'
import { HEAVENLY_STEMS, STEM_ELEMENTS, TIGER_RULES } from './data/stems'
import { SOURCES } from './data/sources'
import { MONTH_SEGMENTS } from './data/monthSegments'
import { computeMonthGanzhi, yearStem } from './lib/ganzhi'
import { useAlmanac, useMediaQuery } from './lib/useAlmanac'
import { useReveal } from './lib/useReveal'
import { Compass } from './components/Compass'
import { Controls } from './components/Controls'
import { InfoPanel } from './components/InfoPanel'
import { YearTable } from './components/YearTable'
import { SiteNav } from './components/SiteNav'
import { Medal } from './components/Medal'
import { Anno } from './components/Anno'
import { Seal } from './components/Seal'
import { Loader } from './components/Loader'

const GUIDE = [
  '外環是二十四節氣。字大、刻線長的是「節」，字小、刻線短的是「中氣」。',
  '內環是十二地支。每一個節從哪裡起算，那一段就叫什麼月，雨水仍在寅月，要到驚蟄才換卯月。',
  '中環是月干。它會隨你選的年度改變，和地支合起來就是那個月的干支。',
]

const d = (ms: number) => ({ '--rd': `${ms}ms` }) as CSSProperties

export default function App() {
  const a = useAlmanac()
  const mobile = useMediaQuery('(max-width: 699px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [guideOpen, setGuideOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const onLoaderDone = useCallback(() => setReady(true), [])
  useReveal()

  const selectMonth = useCallback(
    (m: number) => a.setTermId(MONTH_SEGMENTS[m]!.startTermId),
    [a],
  )

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const yinGanzhi = computeMonthGanzhi(a.year, 0)
  const currentYearStem = yearStem(a.year)

  return (
    <div className={`shell${ready ? ' is-ready' : ''}`} id="top">
      <Loader reducedMotion={reducedMotion} onDone={onLoaderDone} />
      <a className="skip-link" href="#main">跳到主要內容</a>
      <SiteNav year={a.year} ganzhi={a.yearGanzhiText} />

      <main id="main">
        {/* ── 卷首 ─────────────────────────────────────────── */}
        <section className="chapter hero" id="shi-sishi" aria-labelledby="h-hero">
          <div className="wrap">
            <div className="hero__head">
              <p className="hero__eyebrow enter">四時有序・東方時間圖譜</p>
              <h1 className="display hero__title enter" id="h-hero" style={d(120)}>
                <span>轉一輪四時，</span><span>讀懂干支與節氣。</span>
              </h1>
              <p className="hero__sub enter" style={d(230)}>
                從立春到大寒，沿著十二地支，看看一年如何展開。
              </p>
            </div>

            <div className="hero__figure enter enter--still" style={d(330)}>
              <div className="hero__dial">
                <Compass
                  year={a.year}
                  termIndex={a.termIndex}
                  monthIndex={a.term.monthIndex}
                  season={a.term.season}
                  showStemRing={false}
                  compact={mobile}
                  sweep
                  reducedMotion={reducedMotion}
                  onSelectTerm={a.setTermId}
                  onSelectMonth={selectMonth}
                />
              </div>
              <Anno side="l" slot={1} title="二十四節氣" desc="字大為節，字小為中氣" />
              <Anno side="l" slot={2} title="十二地支" desc="每一個節起算一個節月" />
              <Anno side="r" slot={1} title="四時" desc="立春立夏立秋立冬為界" />
              <Anno side="r" slot={2} title="指標" desc="移入停住，移開續行" />
              <p className="anno anno--foot" aria-hidden="true">
                <span className="anno__text">時間索引示意・非方位測量</span>
              </p>
            </div>

            <div className="hero__foot enter" style={d(780)}>
              <div className="hero__actions">
                <button type="button" className="btn btn--frame" onClick={() => goto('zhuan-luopan')}>
                  轉動四時羅盤
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-expanded={guideOpen}
                  aria-controls="guide"
                  onClick={() => setGuideOpen((v) => !v)}
                >
                  {guideOpen ? '收起導讀' : '先看怎麼讀'}
                </button>
              </div>

              {guideOpen && (
                <ol className="caveats hero__guide" id="guide">
                  {GUIDE.map((g, i) => (
                    <li key={g} style={{ paddingLeft: '2.4rem' }}>
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute', left: 0, top: 0,
                          fontFamily: 'var(--serif)', color: 'var(--brass-ink)', letterSpacing: '0.1em',
                        }}
                      >
                        {['其一', '其二', '其三'][i]}
                      </span>
                      {g}
                    </li>
                  ))}
                </ol>
              )}

              <p className="hero__status">
                <span>目前</span>
                <b>{a.term.name}</b>
                <span className="hero__status-sep">／</span>
                <b>{SEASON_LABEL[a.term.season]}・{a.segment.branch}月</b>
                <span className="hero__status-sep">／</span>
                <b>{a.year} {a.yearGanzhiText}年度・{a.monthGanzhi.text}月</b>
              </p>
            </div>
          </div>
        </section>

        {/* ── 壹 ───────────────────────────────────────────── */}
        <section className="chapter chapter--sunk" id="zhuan-luopan" aria-labelledby="h-explore">
          <div className="wrap">
            <div className="reveal"><Medal no="壹" name="轉羅盤" /></div>
            <h2 className="h2 reveal" id="h-explore" style={d(80)}>一個羅盤，三層關係。</h2>
            <p className="lead reveal" style={{ ...d(150), marginTop: '0.9rem' }}>
              外環是二十四節氣，中環是這一年的十二個月干，內環是十二地支。
              選任何一個節氣，三層與下方的對照表會一起更新。
            </p>

            <div className="explore__grid" style={{ marginTop: 'var(--gap-block)' }}>
              <div className="explore__dial bracket bracket--pad reveal reveal--still" style={d(210)}>
                <span className="bracket__b1" /><span className="bracket__b2" />
                <Compass
                  year={a.year}
                  termIndex={a.termIndex}
                  monthIndex={a.term.monthIndex}
                  season={a.term.season}
                  showStemRing
                  compact={mobile}
                  reducedMotion={reducedMotion}
                  onSelectTerm={a.setTermId}
                  onSelectMonth={selectMonth}
                />
                <p className="plate">
                  <span>四時羅盤</span>
                  <span>十二節月 × 二十四節氣</span>
                  <span>立春起・順時針</span>
                </p>
              </div>

              <div className="explore__aside reveal" style={d(280)}>
                <Controls a={a} mobile={mobile} />
                <InfoPanel a={a} />
                <p className="note-line" style={{ marginTop: '1.1rem' }}>
                  這是結構對照的探索模式。本站沒有精確的交節時刻資料，
                  因此不顯示今日節氣、交節日期或倒數。
                  盤面角度是節氣的排列順序，不是太陽黃經，也不是實際測得的方位；
                  視覺羅盤為時間索引，並非實體磁羅盤。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 貳 ───────────────────────────────────────────── */}
        <section className="chapter" id="du-ganzhi" aria-labelledby="h-explain">
          <div className="wrap">
            <div className="reveal"><Medal no="貳" name="讀干支" /></div>
            <h2 className="h2 reveal" id="h-explain" style={d(80)}>十、十二與二十四，如何相遇。</h2>
            <p className="lead reveal" style={{ ...d(150), marginTop: '0.9rem' }}>
              三個數字不是硬湊在一起的。它們分屬三層：切分、命名，以及逐年推算。
            </p>

            <div className="steps">
              <div className="step reveal" style={d(60)}>
                <div className="step__count">十二<small>節・切分</small></div>
                <div className="step__body">
                  <h3 className="h3">一年先切成十二段</h3>
                  <p className="prose">
                    二十四節氣裡，有十二個是「節」。每一個節是一段時間的起點，
                    到下一個節之前為止，這一段就是一個節月。節月不是公曆月份，
                    也不是農曆的初一到月底。
                  </p>
                </div>
                <p className="step__demo">
                  第一段從 <b>{a.startTerm.name}</b> 起算，<br />至 <b>{a.nextStartTerm.name}</b> 之前。
                </p>
              </div>

              <div className="step reveal" style={d(140)}>
                <div className="step__count">十二<small>支・命名</small></div>
                <div className="step__body">
                  <h3 className="h3">用寅到丑為這十二段命名</h3>
                  <p className="prose">
                    十二地支的標準次序由子起算，但節月的次序由寅起算。
                    所以立春開始的第一段叫寅月，冬至所在的子月反而排在第十一。
                    每一段裡的中氣不另起一個月：雨水仍是寅月。
                  </p>
                </div>
                <p className="step__demo">
                  目前選的是 <b>{a.term.name}</b>（{a.term.kind}），<br />落在 <b>{a.segment.branch}月</b>。
                </p>
              </div>

              <div className="step reveal" style={d(220)}>
                <div className="step__count">十<small>干・推算</small></div>
                <div className="step__body">
                  <h3 className="h3">月干依年干起算，循環一位</h3>
                  <p className="prose">
                    地支月固定，月干不固定。先用年干查出寅月的天干，
                    之後每過一個節月，天干往下一位，走到癸就回到甲。
                    十個天干配十二個節月，所以一年之中必有兩個天干各出現兩次。
                  </p>
                </div>
                <p className="step__demo">
                  {a.year} 是 <b>{currentYearStem}</b> 年，<br />寅月為 <b>{yinGanzhi.text}</b>，<br />
                  往後每月天干進一位。
                </p>
              </div>
            </div>

            <div className="explain__grid">
              <div className="reveal" style={d(60)}>
                <h3 className="h3">十天干的完整次序</h3>
                <p className="prose" style={{ marginTop: '0.6rem' }}>
                  目前這個節月用到的天干已標示出來。十二個節月只會用到十個天干，
                  因此羅盤的中環是十二個「月干位置」，不是把十天干均分成十格的裝飾圈。
                </p>
                <div className="stemstrip">
                  {HEAVENLY_STEMS.map((s) => (
                    <div key={s} className="stemstrip__cell" data-on={s === a.monthGanzhi.stem}>
                      <span className="stemstrip__glyph">{s}</span>
                      <small>{STEM_ELEMENTS[s]}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reveal" style={d(140)}>
                <h3 className="h3">年干定寅月：五虎遁</h3>
                <p className="prose" style={{ marginTop: '0.6rem' }}>
                  五組年干各自對應一個寅月起點。目前所選年度的那一組已標示出來。
                </p>
                <table className="tiger">
                  <caption>年干與寅月干支對照</caption>
                  <thead>
                    <tr>
                      <th scope="col">年干</th>
                      <th scope="col">寅月月干</th>
                      <th scope="col">寅月干支</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIGER_RULES.map((r) => (
                      <tr key={r.ganzhi} data-on={r.yearStems.includes(currentYearStem)}>
                        <td>{r.yearStems[0]}、{r.yearStems[1]}</td>
                        <td>{r.monthStem}</td>
                        <td>{r.ganzhi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── 參 ───────────────────────────────────────────── */}
        <section className="chapter chapter--sunk" id="kan-duizhao" aria-labelledby="h-table">
          <div className="wrap">
            <div className="reveal"><Medal no="參" name="看對照" /></div>
            <h2 className="h2 reveal" id="h-table" style={d(80)}>把一年的流轉，慢慢讀懂。</h2>
            <p className="lead reveal" style={{ ...d(150), marginTop: '0.9rem' }}>
              同一份資料換一種讀法。十二列對應羅盤的十二個扇區，
              點任何一列，羅盤與面板會跟著移動。
            </p>
            <div className="reveal" style={d(210)}>
              <YearTable a={a} />
            </div>
          </div>
        </section>

        {/* ── 誌餘 ─────────────────────────────────────────── */}
        <section className="chapter" id="zhi-yu" aria-labelledby="h-colophon">
          <div className="wrap">
            <p className="rule-orn reveal" aria-hidden="true"><i /></p>
            <h2 className="colophon__line reveal" id="h-colophon" style={d(80)}>
              歲時流轉，各有其序。<Seal size={26} />
            </h2>

            <div className="colophon__grid">
              <div className="reveal" style={d(150)}>
                <p className="prose">
                  這座羅盤只做一件事：把節氣、節月與干支之間的關係攤開來看。
                  它不預測，也不排盤。
                </p>
                <div className="colophon__actions">
                  <button
                    type="button"
                    className="btn btn--frame"
                    onClick={() => { a.setYear(2026); a.setTermId('lichun'); goto('top') }}
                  >
                    重新探索
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => { setGuideOpen(true); goto('shi-sishi') }}
                  >
                    顯示導讀
                  </button>
                </div>

                <ul className="caveats">
                  <li>節月以節分界，不等於公曆月份，也不等於農曆初一至月底。</li>
                  <li>年度採立春換年：{a.year} 年度指 {a.year} 年立春至 {a.year + 1} 年立春前。這與以農曆正月初一換年的紀年不同。</li>
                  <li>因此 {a.year} 年度的丑月（小寒之後）雖然落在 {a.year + 1} 年，月干仍由 {a.year} 年的年干 {currentYearStem} 推算，為 {computeMonthGanzhi(a.year, 11).text}。</li>
                  <li>羅盤是時間索引的示意圖。盤面角度代表節氣的排列順序，不是太陽黃經，也不是實際方位。</li>
                  <li>本站未收錄精確交節時刻，因此不提供今日節氣、交節日期與倒數。</li>
                </ul>
              </div>

              <div className="reveal" style={d(220)}>
                <h3 className="h3">資料來源</h3>
                <ul className="srclist" style={{ marginTop: '1rem' }}>
                  {SOURCES.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a>
                      <span>{s.use}</span>
                      <span>{s.url}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__inner">
          <span className="foot__mark"><Seal size={16} />四時有序 SHI XU・東方時間圖譜</span>
          <span>節氣與干支資料依香港天文台公開資料整理</span>
        </div>
      </footer>

      <p className="liveregion" aria-live="polite">
        {a.term.name}，{SEASON_LABEL[a.term.season]}，{a.segment.branch}月，{a.monthGanzhi.text}月
      </p>
    </div>
  )
}
