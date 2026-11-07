/**
 * 干支推算的純函式。所有畫面呈現都由這裡推導，不另存重複狀態。
 *
 * 年度 Y 指「Y 年立春至 Y+1 年立春前」，採立春換年的展示慣例，
 * 與以農曆正月初一換年的紀年不同。
 */
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, YEAR_MAX, YEAR_MIN } from '../data/stems'
import { MONTH_SEGMENTS } from '../data/monthSegments'
import { TERM_BY_ID } from '../data/solarTerms'

/** 正模，避免負年份取餘數為負 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function yearStemIndex(year: number): number {
  return mod(year - 4, 10)
}

export function yearBranchIndex(year: number): number {
  return mod(year - 4, 12)
}

export function yearStem(year: number): string {
  return HEAVENLY_STEMS[yearStemIndex(year)]!
}

export function yearBranch(year: number): string {
  return EARTHLY_BRANCHES[yearBranchIndex(year)]!
}

export function yearGanzhi(year: number): string {
  return yearStem(year) + yearBranch(year)
}

/**
 * 五虎遁：由年干索引求寅月月干索引。
 * 甲己→丙、乙庚→戊、丙辛→庚、丁壬→壬、戊癸→甲。
 */
export function tigerMonthStemIndex(stemIndexOfYear: number): number {
  return (mod(stemIndexOfYear, 5) * 2 + 2) % 10
}

/** 第 m 個節月（0 為寅月）的月干索引 */
export function monthStemIndex(year: number, monthIndex: number): number {
  return mod(tigerMonthStemIndex(yearStemIndex(year)) + monthIndex, 10)
}

/** 第 m 個節月的地支，寅起算 */
export function monthBranch(monthIndex: number): string {
  return EARTHLY_BRANCHES[mod(monthIndex + 2, 12)]!
}

export interface MonthGanzhi {
  stem: string
  branch: string
  /** 例：庚寅 */
  text: string
}

/** 核心純函式：所選年度第 monthIndex 個節月的月干支 */
export function computeMonthGanzhi(year: number, monthIndex: number): MonthGanzhi {
  const stem = HEAVENLY_STEMS[monthStemIndex(year, monthIndex)]!
  const branch = monthBranch(monthIndex)
  return { stem, branch, text: stem + branch }
}

/** 所選年度十二個節月的月干支，依節月順序 */
export function monthGanzhiOfYear(year: number): MonthGanzhi[] {
  return MONTH_SEGMENTS.map((seg) => computeMonthGanzhi(year, seg.index))
}

/* ------------------------------------------------------------------ */
/* 輸入驗證：URL 參數與選單值一律經過這裡                                */
/* ------------------------------------------------------------------ */

export function isValidTermId(id: unknown): id is string {
  return typeof id === 'string' && TERM_BY_ID.has(id)
}

export function isValidYear(year: unknown): year is number {
  return typeof year === 'number' && Number.isInteger(year) && year >= YEAR_MIN && year <= YEAR_MAX
}

export function parseYear(raw: string | null): number | null {
  if (raw === null || !/^\d{4}$/.test(raw)) return null
  const n = Number(raw)
  return isValidYear(n) ? n : null
}

export function parseTermId(raw: string | null): string | null {
  return isValidTermId(raw) ? raw : null
}

/** 年份清單 */
export function yearOptions(): number[] {
  const out: number[] = []
  for (let y = YEAR_MIN; y <= YEAR_MAX; y += 1) out.push(y)
  return out
}
