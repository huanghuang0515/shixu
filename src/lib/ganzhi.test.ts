import { describe, expect, it } from 'vitest'
import {
  computeMonthGanzhi,
  mod,
  monthBranch,
  monthGanzhiOfYear,
  parseTermId,
  parseYear,
  tigerMonthStemIndex,
  yearGanzhi,
  yearStemIndex,
} from './ganzhi'
import { HEAVENLY_STEMS, TIGER_RULES } from '../data/stems'
import { SOLAR_TERMS } from '../data/solarTerms'
import { MONTH_SEGMENTS } from '../data/monthSegments'

describe('正模', () => {
  it('負數也回傳非負餘數', () => {
    expect(mod(-1, 10)).toBe(9)
    expect(mod(-13, 12)).toBe(11)
    expect(mod(0, 10)).toBe(0)
  })
  it('西元前年份仍可推算年干支', () => {
    expect(yearGanzhi(4)).toBe('甲子')
    expect(yearGanzhi(-56)).toBe('甲子')
  })
})

describe('年干支', () => {
  it('2026 為丙午年度', () => {
    expect(yearGanzhi(2026)).toBe('丙午')
  })
  it('2024 至 2033 的年干支依序遞移', () => {
    expect([2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map(yearGanzhi)).toEqual([
      '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    ])
  })
})

describe('五虎遁：五組年干的寅月起點', () => {
  it('公式與五虎遁對照表一致', () => {
    for (const rule of TIGER_RULES) {
      for (const stem of rule.yearStems) {
        const s = HEAVENLY_STEMS.indexOf(stem as (typeof HEAVENLY_STEMS)[number])
        expect(HEAVENLY_STEMS[tigerMonthStemIndex(s)]).toBe(rule.monthStem)
      }
    }
  })
  it('以實際年份驗證五組年干的寅月干支', () => {
    // 2024 甲辰 → 丙寅、2025 乙巳 → 戊寅、2026 丙午 → 庚寅、2027 丁未 → 壬寅、2028 戊申 → 甲寅
    expect(computeMonthGanzhi(2024, 0).text).toBe('丙寅')
    expect(computeMonthGanzhi(2025, 0).text).toBe('戊寅')
    expect(computeMonthGanzhi(2026, 0).text).toBe('庚寅')
    expect(computeMonthGanzhi(2027, 0).text).toBe('壬寅')
    expect(computeMonthGanzhi(2028, 0).text).toBe('甲寅')
    // 己、庚、辛、壬、癸 年
    expect(computeMonthGanzhi(2029, 0).text).toBe('丙寅') // 己酉
    expect(computeMonthGanzhi(2030, 0).text).toBe('戊寅') // 庚戌
    expect(computeMonthGanzhi(2031, 0).text).toBe('庚寅') // 辛亥
    expect(computeMonthGanzhi(2032, 0).text).toBe('壬寅') // 壬子
    expect(computeMonthGanzhi(2033, 0).text).toBe('甲寅') // 癸丑
  })
})

describe('月干十位循環', () => {
  it('2026 丙午年度的十二月干支與規格一致', () => {
    expect(monthGanzhiOfYear(2026).map((m) => m.text)).toEqual([
      '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑',
    ])
  })
  it('月干每月前進一位，跨越癸後回到甲', () => {
    for (let y = 2024; y <= 2033; y += 1) {
      for (let m = 1; m < 12; m += 1) {
        const prev = HEAVENLY_STEMS.indexOf(computeMonthGanzhi(y, m - 1).stem as (typeof HEAVENLY_STEMS)[number])
        const cur = HEAVENLY_STEMS.indexOf(computeMonthGanzhi(y, m).stem as (typeof HEAVENLY_STEMS)[number])
        expect(cur).toBe((prev + 1) % 10)
      }
    }
  })
  it('任何年度都不會出現十天干與十二節月一對一的錯誤配法', () => {
    const stems = monthGanzhiOfYear(2026).map((m) => m.stem)
    expect(new Set(stems).size).toBe(10) // 十二個月只用到十個天干，必有兩個重複
  })
})

describe('十二節月順序', () => {
  it('地支由寅到丑', () => {
    expect(MONTH_SEGMENTS.map((s) => s.branch)).toEqual(
      ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
    )
    expect(MONTH_SEGMENTS.map((s) => monthBranch(s.index))).toEqual(MONTH_SEGMENTS.map((s) => s.branch))
  })
  it('每個節月的終點等於下一個節月的起點，且首尾相接', () => {
    MONTH_SEGMENTS.forEach((seg, i) => {
      const next = MONTH_SEGMENTS[(i + 1) % 12]!
      expect(seg.nextStartTermId).toBe(next.startTermId)
    })
  })
  it('季節為每三個節月一季', () => {
    expect(MONTH_SEGMENTS.map((s) => s.season)).toEqual([
      'spring', 'spring', 'spring', 'summer', 'summer', 'summer',
      'autumn', 'autumn', 'autumn', 'winter', 'winter', 'winter',
    ])
  })
})

describe('二十四節氣資料完整且唯一', () => {
  it('共 24 項，id 與名稱皆不重複', () => {
    expect(SOLAR_TERMS).toHaveLength(24)
    expect(new Set(SOLAR_TERMS.map((t) => t.id)).size).toBe(24)
    expect(new Set(SOLAR_TERMS.map((t) => t.name)).size).toBe(24)
  })
  it('節與中氣各 12 個且交替排列', () => {
    expect(SOLAR_TERMS.filter((t) => t.kind === '節')).toHaveLength(12)
    expect(SOLAR_TERMS.filter((t) => t.kind === '中氣')).toHaveLength(12)
    SOLAR_TERMS.forEach((t, i) => {
      expect(t.kind).toBe(i % 2 === 0 ? '節' : '中氣')
    })
  })
  it('太陽黃經自立春 315° 起每 15° 遞增一次', () => {
    SOLAR_TERMS.forEach((t, i) => {
      expect(t.longitude).toBe((315 + i * 15) % 360)
    })
  })
  it('每個節月恰含一個節與一個中氣，且與 monthSegments 對應', () => {
    MONTH_SEGMENTS.forEach((seg) => {
      const inMonth = SOLAR_TERMS.filter((t) => t.monthIndex === seg.index)
      expect(inMonth).toHaveLength(2)
      expect(inMonth[0]!.id).toBe(seg.startTermId)
      expect(inMonth[0]!.kind).toBe('節')
      expect(inMonth[1]!.id).toBe(seg.middleTermId)
      expect(inMonth[1]!.kind).toBe('中氣')
      expect(inMonth[0]!.season).toBe(seg.season)
      expect(inMonth[1]!.season).toBe(seg.season)
    })
  })
})

describe('中氣不換節月', () => {
  it('雨水仍屬寅月，驚蟄才進卯月', () => {
    const yushui = SOLAR_TERMS.find((t) => t.id === 'yushui')!
    const jingzhe = SOLAR_TERMS.find((t) => t.id === 'jingzhe')!
    expect(yushui.monthIndex).toBe(0)
    expect(monthBranch(yushui.monthIndex)).toBe('寅')
    expect(jingzhe.monthIndex).toBe(1)
    expect(monthBranch(jingzhe.monthIndex)).toBe('卯')
  })
  it('每個中氣的節月都與其前一個節相同', () => {
    SOLAR_TERMS.filter((t) => t.kind === '中氣').forEach((zhongqi) => {
      const idx = SOLAR_TERMS.indexOf(zhongqi)
      expect(zhongqi.monthIndex).toBe(SOLAR_TERMS[idx - 1]!.monthIndex)
    })
  })
})

describe('年度切換', () => {
  it('切年只改月干，不改月支', () => {
    for (let m = 0; m < 12; m += 1) {
      expect(computeMonthGanzhi(2026, m).branch).toBe(computeMonthGanzhi(2031, m).branch)
    }
    expect(computeMonthGanzhi(2026, 0).stem).not.toBe(computeMonthGanzhi(2027, 0).stem)
  })
  it('年度跨界：2026 年度的丑月仍以 2026 年干起算，不可誤用 2027 年干', () => {
    // 丑月（小寒至立春前）實際落在 2027 年 1–2 月，但屬 2026 丙午年度
    expect(computeMonthGanzhi(2026, 11).text).toBe('辛丑')
    // 若誤用 2027 丁未年干，丑月會變成癸丑，這是要避免的錯誤
    expect(computeMonthGanzhi(2027, 11).text).toBe('癸丑')
    expect(computeMonthGanzhi(2026, 11).text).not.toBe(computeMonthGanzhi(2027, 11).text)
  })
  it('月干支只依年干，週期為 10 年；年干支週期為 60 年', () => {
    for (let m = 0; m < 12; m += 1) {
      expect(computeMonthGanzhi(2026, m).text).toBe(computeMonthGanzhi(2036, m).text)
    }
    expect(computeMonthGanzhi(2026, 3).text).not.toBe(computeMonthGanzhi(2027, 3).text)
    expect(yearGanzhi(2026)).toBe(yearGanzhi(2086))
    expect(yearGanzhi(2026)).not.toBe(yearGanzhi(2036))
  })
})

describe('無效輸入回復預設值', () => {
  it('年份超出範圍或格式錯誤時回傳 null', () => {
    expect(parseYear('2026')).toBe(2026)
    expect(parseYear('2023')).toBeNull()
    expect(parseYear('2034')).toBeNull()
    expect(parseYear('20xx')).toBeNull()
    expect(parseYear('')).toBeNull()
    expect(parseYear(null)).toBeNull()
    expect(parseYear('2026.5')).toBeNull()
  })
  it('節氣代號不在白名單時回傳 null', () => {
    expect(parseTermId('lichun')).toBe('lichun')
    expect(parseTermId('LICHUN')).toBeNull()
    expect(parseTermId('__proto__')).toBeNull()
    expect(parseTermId('<script>')).toBeNull()
    expect(parseTermId(null)).toBeNull()
  })
})

describe('年干索引', () => {
  it('以 (Y-4) mod 10 推得', () => {
    expect(yearStemIndex(2024)).toBe(0) // 甲
    expect(yearStemIndex(2026)).toBe(2) // 丙
    expect(yearStemIndex(2033)).toBe(9) // 癸
  })
})
