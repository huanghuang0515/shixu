/**
 * 天干、地支與五虎遁規則。
 * 年干與月干的對照參考香港天文台〈天干和地支〉。
 */

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

/** 五行屬性，僅用於說明章節的文字補充 */
export const STEM_ELEMENTS: Record<string, string> = {
  甲: '木（陽）', 乙: '木（陰）',
  丙: '火（陽）', 丁: '火（陰）',
  戊: '土（陽）', 己: '土（陰）',
  庚: '金（陽）', 辛: '金（陰）',
  壬: '水（陽）', 癸: '水（陰）',
}

/** 五虎遁：年干分組與其寅月月干 */
export interface TigerRule {
  yearStems: [string, string]
  monthStem: string
  ganzhi: string
}

export const TIGER_RULES: readonly TigerRule[] = [
  { yearStems: ['甲', '己'], monthStem: '丙', ganzhi: '丙寅' },
  { yearStems: ['乙', '庚'], monthStem: '戊', ganzhi: '戊寅' },
  { yearStems: ['丙', '辛'], monthStem: '庚', ganzhi: '庚寅' },
  { yearStems: ['丁', '壬'], monthStem: '壬', ganzhi: '壬寅' },
  { yearStems: ['戊', '癸'], monthStem: '甲', ganzhi: '甲寅' },
]

/** 可選年度範圍：所選年立春至次年立春前 */
export const YEAR_MIN = 2024
export const YEAR_MAX = 2033
export const DEFAULT_YEAR = 2026
export const DEFAULT_TERM_ID = 'lichun'
