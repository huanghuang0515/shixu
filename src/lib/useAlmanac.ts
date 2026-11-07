import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SOLAR_TERMS, TERM_BY_ID, type SolarTerm } from '../data/solarTerms'
import { MONTH_SEGMENTS, type MonthSegment } from '../data/monthSegments'
import { DEFAULT_TERM_ID, DEFAULT_YEAR } from '../data/stems'
import { computeMonthGanzhi, parseTermId, parseYear, yearGanzhi, type MonthGanzhi } from './ganzhi'

export interface AlmanacView {
  year: number
  termId: string
  term: SolarTerm
  termIndex: number
  segment: MonthSegment
  monthGanzhi: MonthGanzhi
  yearGanzhiText: string
  startTerm: SolarTerm
  middleTerm: SolarTerm
  nextStartTerm: SolarTerm
  setYear: (y: number) => void
  setTermId: (id: string) => void
  stepTerm: (delta: number) => void
}

function readUrl(): { year: number; termId: string } {
  if (typeof window === 'undefined') return { year: DEFAULT_YEAR, termId: DEFAULT_TERM_ID }
  const p = new URLSearchParams(window.location.search)
  return {
    year: parseYear(p.get('year')) ?? DEFAULT_YEAR,
    termId: parseTermId(p.get('term')) ?? DEFAULT_TERM_ID,
  }
}

/**
 * 單一狀態源：只保存 selectedYear 與 selectedTermId，
 * 節月、季節、月干支、對照表全部由這兩個值推導，避免資料不一致。
 */
export function useAlmanac(): AlmanacView {
  const initial = useRef(readUrl())
  const [year, setYearState] = useState(initial.current.year)
  const [termId, setTermIdState] = useState(initial.current.termId)

  // 由上一頁／下一頁觸發的狀態變更不可以再推入一筆新紀錄，
  // 否則歷史會被同一個值填滿，上一頁只能回一步。
  const fromHistory = useRef(false)
  useEffect(() => {
    const onPop = () => {
      const next = readUrl()
      fromHistory.current = true
      setYearState(next.year)
      setTermIdState(next.termId)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const first = useRef(true)
  const lastPush = useRef(0)
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('year', String(year))
    url.searchParams.set('term', termId)
    const next = `${url.pathname}${url.search}${url.hash}`

    if (fromHistory.current) {
      fromHistory.current = false
      return
    }
    const now = Date.now()
    // 連按上一個／下一個時合併紀錄，避免歷史被一步一筆塞滿
    if (first.current || now - lastPush.current < 700) {
      first.current = false
      window.history.replaceState(null, '', next)
    } else {
      window.history.pushState(null, '', next)
    }
    lastPush.current = now
  }, [year, termId])

  const term = TERM_BY_ID.get(termId) ?? SOLAR_TERMS[0]!
  const termIndex = SOLAR_TERMS.indexOf(term)
  const segment = MONTH_SEGMENTS[term.monthIndex]!

  // 季節配色由 body 屬性驅動，整頁同步
  useEffect(() => {
    document.body.dataset['season'] = term.season
  }, [term.season])

  const setTermId = useCallback((id: string) => {
    if (TERM_BY_ID.has(id)) setTermIdState(id)
  }, [])

  const setYear = useCallback((y: number) => {
    setYearState((prev) => (Number.isInteger(y) ? y : prev))
  }, [])

  const stepTerm = useCallback((delta: number) => {
    setTermIdState((prev) => {
      const i = SOLAR_TERMS.findIndex((t) => t.id === prev)
      const next = (i + delta + SOLAR_TERMS.length) % SOLAR_TERMS.length
      return SOLAR_TERMS[next]!.id
    })
  }, [])

  return useMemo<AlmanacView>(() => ({
    year,
    termId,
    term,
    termIndex,
    segment,
    monthGanzhi: computeMonthGanzhi(year, term.monthIndex),
    yearGanzhiText: yearGanzhi(year),
    startTerm: TERM_BY_ID.get(segment.startTermId)!,
    middleTerm: TERM_BY_ID.get(segment.middleTermId)!,
    nextStartTerm: TERM_BY_ID.get(segment.nextStartTermId)!,
    setYear,
    setTermId,
    stepTerm,
  }), [year, termId, term, termIndex, segment, setYear, setTermId, stepTerm])
}

/** 手機／桌面的版面切換，供需要改變結構（而非只改尺寸）的元件使用 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
