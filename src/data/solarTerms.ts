/**
 * 二十四節氣資料。
 * 順序由立春起算，與本站「以節分月、立春換年」的展示慣例一致。
 * 太陽黃經與節／中氣分類參考香港天文台〈二十四節氣〉。
 * 說明文字描述名稱字義與其在本站節月結構中的位置，不加入來源未支持的民俗延伸。
 */

export type TermKind = '節' | '中氣'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SolarTerm {
  /** 穩定代號，用於 URL 與狀態 */
  id: string
  /** 繁體名稱 */
  name: string
  /** 節或中氣 */
  kind: TermKind
  /** 太陽黃經（度）。此為天文定義，不等於羅盤畫面角度。 */
  longitude: number
  /** 所屬節月序號，0 為寅月 */
  monthIndex: number
  /** 傳統節令季節分類 */
  season: Season
  /** 兩句白話說明：名稱字義，以及在本站節月規則中的位置 */
  notes: [string, string]
}

export const SOLAR_TERMS: readonly SolarTerm[] = [
  {
    id: 'lichun', name: '立春', kind: '節', longitude: 315, monthIndex: 0, season: 'spring',
    notes: [
      '太陽來到黃經 315°，傳統上把這一刻視為春季的起點。',
      '在本站的節月規則裡，立春同時是寅月的開始，一年十二個節月由此起算。',
    ],
  },
  {
    id: 'yushui', name: '雨水', kind: '中氣', longitude: 330, monthIndex: 0, season: 'spring',
    notes: [
      '黃經 330°，名稱指降水形式由雪轉雨的時節。',
      '雨水是寅月的中氣，仍留在寅月之內；要到下一個節「驚蟄」才換入卯月。',
    ],
  },
  {
    id: 'jingzhe', name: '驚蟄', kind: '節', longitude: 345, monthIndex: 1, season: 'spring',
    notes: [
      '黃經 345°，名稱取自蟄伏的生物開始活動。',
      '驚蟄是卯月的起點，節月在這裡由寅轉卯。',
    ],
  },
  {
    id: 'chunfen', name: '春分', kind: '中氣', longitude: 0, monthIndex: 1, season: 'spring',
    notes: [
      '黃經 0°，太陽直射赤道，晝夜接近等長。',
      '春分是卯月的中氣。黃經在此歸零，但節月的順序仍從立春起算。',
    ],
  },
  {
    id: 'qingming', name: '清明', kind: '節', longitude: 15, monthIndex: 2, season: 'spring',
    notes: [
      '黃經 15°，名稱形容天氣轉為清朗的時節。',
      '清明是辰月的起點。',
    ],
  },
  {
    id: 'guyu', name: '穀雨', kind: '中氣', longitude: 30, monthIndex: 2, season: 'spring',
    notes: [
      '黃經 30°，名稱指適合穀物生長的雨水。',
      '穀雨是辰月的中氣，春季三個節月到此告一段落。',
    ],
  },
  {
    id: 'lixia', name: '立夏', kind: '節', longitude: 45, monthIndex: 3, season: 'summer',
    notes: [
      '黃經 45°，傳統上視為夏季的開始。',
      '立夏是巳月的起點。',
    ],
  },
  {
    id: 'xiaoman', name: '小滿', kind: '中氣', longitude: 60, monthIndex: 3, season: 'summer',
    notes: [
      '黃經 60°，名稱指穀物開始飽滿，但尚未成熟。',
      '小滿是巳月的中氣。',
    ],
  },
  {
    id: 'mangzhong', name: '芒種', kind: '節', longitude: 75, monthIndex: 4, season: 'summer',
    notes: [
      '黃經 75°，名稱與有芒作物的收成和播種有關。',
      '芒種是午月的起點。',
    ],
  },
  {
    id: 'xiazhi', name: '夏至', kind: '中氣', longitude: 90, monthIndex: 4, season: 'summer',
    notes: [
      '黃經 90°，北半球白晝最長的一天。',
      '夏至是午月的中氣，午月正好位在十二節月的中段。',
    ],
  },
  {
    id: 'xiaoshu', name: '小暑', kind: '節', longitude: 105, monthIndex: 5, season: 'summer',
    notes: [
      '黃經 105°，暑氣漸盛但尚未到最熱。',
      '小暑是未月的起點。',
    ],
  },
  {
    id: 'dashu', name: '大暑', kind: '中氣', longitude: 120, monthIndex: 5, season: 'summer',
    notes: [
      '黃經 120°，傳統上一年中最熱的時段。',
      '大暑是未月的中氣，夏季三個節月到此結束。',
    ],
  },
  {
    id: 'liqiu', name: '立秋', kind: '節', longitude: 135, monthIndex: 6, season: 'autumn',
    notes: [
      '黃經 135°，傳統上視為秋季的開始。',
      '立秋是申月的起點。',
    ],
  },
  {
    id: 'chushu', name: '處暑', kind: '中氣', longitude: 150, monthIndex: 6, season: 'autumn',
    notes: [
      '黃經 150°，「處」有止息之意，指暑氣將退。',
      '處暑是申月的中氣。',
    ],
  },
  {
    id: 'bailu', name: '白露', kind: '節', longitude: 165, monthIndex: 7, season: 'autumn',
    notes: [
      '黃經 165°，氣溫下降，夜間容易結露。',
      '白露是酉月的起點。',
    ],
  },
  {
    id: 'qiufen', name: '秋分', kind: '中氣', longitude: 180, monthIndex: 7, season: 'autumn',
    notes: [
      '黃經 180°，太陽再次直射赤道，晝夜接近等長。',
      '秋分是酉月的中氣，與春分在羅盤上正好相對。',
    ],
  },
  {
    id: 'hanlu', name: '寒露', kind: '節', longitude: 195, monthIndex: 8, season: 'autumn',
    notes: [
      '黃經 195°，露水轉寒的時節。',
      '寒露是戌月的起點。',
    ],
  },
  {
    id: 'shuangjiang', name: '霜降', kind: '中氣', longitude: 210, monthIndex: 8, season: 'autumn',
    notes: [
      '黃經 210°，名稱指氣溫降到容易結霜。',
      '霜降是戌月的中氣，秋季三個節月到此結束。',
    ],
  },
  {
    id: 'lidong', name: '立冬', kind: '節', longitude: 225, monthIndex: 9, season: 'winter',
    notes: [
      '黃經 225°，傳統上視為冬季的開始。',
      '立冬是亥月的起點。',
    ],
  },
  {
    id: 'xiaoxue', name: '小雪', kind: '中氣', longitude: 240, monthIndex: 9, season: 'winter',
    notes: [
      '黃經 240°，開始出現降雪的時節。',
      '小雪是亥月的中氣。',
    ],
  },
  {
    id: 'daxue', name: '大雪', kind: '節', longitude: 255, monthIndex: 10, season: 'winter',
    notes: [
      '黃經 255°，降雪的機會與雪量增加。',
      '大雪是子月的起點。',
    ],
  },
  {
    id: 'dongzhi', name: '冬至', kind: '中氣', longitude: 270, monthIndex: 10, season: 'winter',
    notes: [
      '黃經 270°，北半球白晝最短的一天。',
      '冬至是子月的中氣。子是地支的首位，但在節月順序裡排第十一。',
    ],
  },
  {
    id: 'xiaohan', name: '小寒', kind: '節', longitude: 285, monthIndex: 11, season: 'winter',
    notes: [
      '黃經 285°，寒氣加劇的時節。',
      '小寒是丑月的起點，也是本站一個年度裡最後一個節月的開始。',
    ],
  },
  {
    id: 'dahan', name: '大寒', kind: '中氣', longitude: 300, monthIndex: 11, season: 'winter',
    notes: [
      '黃經 300°，二十四節氣的最後一個。',
      '大寒是丑月的中氣。再往前就回到立春，進入下一個年度。',
    ],
  },
]

export const TERM_BY_ID: ReadonlyMap<string, SolarTerm> = new Map(
  SOLAR_TERMS.map((t) => [t.id, t]),
)

export const SEASON_LABEL: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}
