/**
 * 十二節月。區間採「起點包含、終點不包含」：
 * 從起始節開始，到下一個節之前為止。節月不等於公曆月份，也不等於農曆初一至月底。
 */
import type { Season } from './solarTerms'

export interface MonthSegment {
  /** 0 為寅月 */
  index: number
  /** 地支 */
  branch: string
  /** 起始節 */
  startTermId: string
  /** 本月中氣 */
  middleTermId: string
  /** 下一節，也是本區間的終點（不含） */
  nextStartTermId: string
  season: Season
}

export const MONTH_SEGMENTS: readonly MonthSegment[] = [
  { index: 0,  branch: '寅', startTermId: 'lichun',    middleTermId: 'yushui',      nextStartTermId: 'jingzhe',   season: 'spring' },
  { index: 1,  branch: '卯', startTermId: 'jingzhe',   middleTermId: 'chunfen',     nextStartTermId: 'qingming',  season: 'spring' },
  { index: 2,  branch: '辰', startTermId: 'qingming',  middleTermId: 'guyu',        nextStartTermId: 'lixia',     season: 'spring' },
  { index: 3,  branch: '巳', startTermId: 'lixia',     middleTermId: 'xiaoman',     nextStartTermId: 'mangzhong', season: 'summer' },
  { index: 4,  branch: '午', startTermId: 'mangzhong', middleTermId: 'xiazhi',      nextStartTermId: 'xiaoshu',   season: 'summer' },
  { index: 5,  branch: '未', startTermId: 'xiaoshu',   middleTermId: 'dashu',       nextStartTermId: 'liqiu',     season: 'summer' },
  { index: 6,  branch: '申', startTermId: 'liqiu',     middleTermId: 'chushu',      nextStartTermId: 'bailu',     season: 'autumn' },
  { index: 7,  branch: '酉', startTermId: 'bailu',     middleTermId: 'qiufen',      nextStartTermId: 'hanlu',     season: 'autumn' },
  { index: 8,  branch: '戌', startTermId: 'hanlu',     middleTermId: 'shuangjiang', nextStartTermId: 'lidong',    season: 'autumn' },
  { index: 9,  branch: '亥', startTermId: 'lidong',    middleTermId: 'xiaoxue',     nextStartTermId: 'daxue',     season: 'winter' },
  { index: 10, branch: '子', startTermId: 'daxue',     middleTermId: 'dongzhi',     nextStartTermId: 'xiaohan',   season: 'winter' },
  { index: 11, branch: '丑', startTermId: 'xiaohan',   middleTermId: 'dahan',       nextStartTermId: 'lichun',    season: 'winter' },
]
