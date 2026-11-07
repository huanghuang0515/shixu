export interface Source {
  title: string
  url: string
  use: string
}

export const SOURCES: readonly Source[] = [
  {
    title: '香港天文台〈二十四節氣〉',
    url: 'https://www.hko.gov.hk/tc/gts/time/24solarterms.htm',
    use: '二十四節氣名稱、節與中氣的分類，以及各節氣對應的太陽黃經。',
  },
  {
    title: '香港天文台〈天干和地支〉',
    url: 'https://www.hko.gov.hk/tc/gts/time/stemsandbranches.htm',
    use: '十天干、十二地支的次序，以及年干推月干的對照關係（五虎遁）。',
  },
  {
    title: '香港天文台〈今夕是何年？〉',
    url: 'https://www.hko.gov.hk/tc/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html',
    use: '說明以農曆正月初一換年與以立春換年兩種慣例的差別。本站採立春換年。',
  },
]
