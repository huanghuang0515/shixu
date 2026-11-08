# 四時有序 SHI XU

一座可轉動、可閱讀的東方時間羅盤。訪客選一個節氣，就能看見它歸在哪個地支月，
以及該年度這個月的月干支是什麼。

一頁式網站，四個章節加一段收尾：識四時 → 轉羅盤 → 讀干支 → 看對照 → 誌餘。

---

## 啟動方法

需要 Node.js 22 以上（開發機實測 v22.23.3、npm 10.9.9）。

安裝相依套件：

```bash
npm install
```

啟動開發伺服器（http://localhost:5173）：

```bash
npm run dev
```

執行干支邏輯測試（24 項）：

```bash
npm run test
```

型別檢查：

```bash
npm run typecheck
```

建置正式版到 `dist/`：

```bash
npm run build
```

在本機預覽建置結果（http://localhost:4173）：

```bash
npm run preview
```

---

## 部署

`.github/workflows/deploy.yml` 會在推送到 `main` 時自動型別檢查、跑測試、建置，
並發布到 GitHub Pages。

第一次使用前，要到 repo 的 **Settings → Pages → Build and deployment**，
把 **Source** 設為 **GitHub Actions**。設定完成後，網址會是：

```
https://huanghuang0515.github.io/shixu/
```

`vite.config.ts` 設定 `base: './'`，所以資源路徑是相對的，
放在子路徑（如 `/shixu/`）或網域根目錄都能運作，也可以直接改放到任何靜態主機。
不需要後端或資料庫。

---

## 技術組成

| 項目 | 版本 | 用途 |
|---|---|---|
| React | 19.3.1 | UI |
| TypeScript | 5.9.3 | 型別（`strict`、`noUncheckedIndexedAccess`） |
| Vite | 8.3.6 | 開發與建置 |
| Vitest | 5.1.0 | 純函式測試 |

**沒有安裝任何動畫套件。** 所有動態都用 CSS transition、一組 keyframes 與
單一 requestAnimationFrame 完成。羅盤是手寫的 SVG，文字全部是真實的 `<text>` 與 HTML，
沒有把中文烘焙進圖片。

### 專案結構

```
src/
  data/
    solarTerms.ts     二十四節氣：名稱、節／中氣、太陽黃經、節月序號、季節、說明
    monthSegments.ts  十二節月：地支、起始節、本月中氣、區間終點
    stems.ts          十天干、十二地支、五虎遁規則、年度範圍
    sources.ts        資料來源清單
  lib/
    ganzhi.ts         干支推算純函式（正模、年干支、五虎遁、月干支、輸入驗證）
    ganzhi.test.ts    24 項邏輯測試
    geometry.ts       羅盤幾何與紋樣（極座標、環形扇區、滾花、連珠、雲頭、日芒、四季牌）
    useAlmanac.ts     狀態、URL 同步、上一頁還原、媒體查詢
    useReveal.ts      捲動進場
  components/
    Compass.tsx       羅盤 SVG（桌面與手機兩組半徑配置、首屏指標巡行）
    Loader.tsx        開場載入頁
    Controls.tsx      年度選單、前後切換、節氣選單、手機節月籌碼
    InfoPanel.tsx     資訊面板
    YearTable.tsx     全年對照表（桌面表格／手機清單，含季節篩選）
    SiteNav.tsx       導覽、目前區段提示、年度牌
    Medal.tsx         章節徽記
    Anno.tsx          羅盤四周的引線註記
    Seal.tsx          朱印
  styles/
    tokens.css        色彩、字體、字級、間距、動態曲線
    base.css          重置、紙紋、焦點樣式、reduced-motion
    app.css           版面、紋樣、載入頁、進場
tools/
  og-source.html      產生 public/og.png 的來源頁
screenshots/          五種指定尺寸的首屏，取自正式建置版本
```

### 單一資料源

整站只保存兩個狀態：`selectedYear` 與 `selectedTermId`。
節月、季節、月干支、全年對照表、首屏讀數、配色全部由這兩個值推導，
所以羅盤、面板與表格不可能互相矛盾。

`computeMonthGanzhi(year, monthIndex)` 是純函式，不依賴畫面狀態，可獨立測試。

首屏指標巡行時顯示的節氣是**預覽**，只存在於該元件內部，不會改動全站狀態；
點一下才真正選定。

### URL 狀態

`?year=2026&term=lichun`。年份限制在 2024–2033，節氣代號比對白名單，
任何無效值都回到預設（2026 丙午年度、立春）並改寫網址。
上一頁／下一頁可還原選取；連續按前後切換時會合併歷史紀錄。

### 重新產生 OG 圖片

`public/og.png`（1200×630）由 `tools/og-source.html` 以 headless Chrome 擷取：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=9000 --screenshot=public/og.png "file://$PWD/tools/og-source.html"
```

`index.html` 的 `og:image` 使用相對路徑 `./og.png`。部署到正式網域後，
建議改成完整網址，部分抓取器對相對路徑的支援較不一致。

---

## 採用的曆法慣例

本站是結構對照的探索模式，不做精確時刻的推算。

1. **以節分月。** 二十四節氣中的十二個「節」是節月的起點，到下一個節之前為止
   （起點包含、終點不包含）。節月不等於公曆月份，也不等於農曆初一至月底。
2. **中氣不換節月。** 每個節月含一個節與其後的中氣。雨水仍屬寅月，
   要到驚蟄才進卯月。
3. **節月依序對應寅、卯、辰、巳、午、未、申、酉、戌、亥、子、丑。**
   地支的標準次序由子起算，但節月由寅起算，所以冬至所在的子月排在第十一。
4. **立春換年。** 「2026 年度」指 2026 年立春至 2027 年立春前，
   與以農曆正月初一換年的紀年不同，站內有明確標示。
   因此 2026 年度的丑月雖然落在 2027 年 1–2 月，月干仍以 2026 年的年干推算。
5. **月干由年干推得（五虎遁）。** 年干索引 = 正模(Y−4, 10)；
   寅月月干索引 = ((s mod 5) × 2 + 2) mod 10；
   第 m 個節月月干索引 = (寅月月干索引 + m) mod 10。
   十天干絕不與十二節氣一對一配對。
6. **盤面角度不是太陽黃經。** 羅盤上每格 15° 代表節氣的排列順序，
   立春在正上方、順時針展開。太陽黃經只在資訊面板以數值呈現，
   盤面不標任何度數刻度。這是時間索引的示意圖，不是實體磁羅盤，也不代表實際方位。
7. **不顯示今日節氣、交節日期與倒數。** 本站沒有收錄可追溯的精確交節時刻表，
   因此這項功能停用。若日後加入，需保存 UTC timestamp、來源與有效年份，
   以 `start <= now < nextStart` 判定，並以 Asia/Taipei 顯示。

---

## 資料來源

- 香港天文台〈二十四節氣〉 — 節氣名稱、節／中氣分類、太陽黃經
  https://www.hko.gov.hk/tc/gts/time/24solarterms.htm
- 香港天文台〈天干和地支〉 — 天干地支次序、年干推月干
  https://www.hko.gov.hk/tc/gts/time/stemsandbranches.htm
- 香港天文台〈今夕是何年？〉 — 農曆正月初一換年與立春換年的差別
  https://www.hko.gov.hk/tc/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html

站內未加入來源未支持的民俗延伸，也沒有藏干、納音、神煞或八卦方位。

---

## 其他文件

- [DESIGN-DECISIONS.md](DESIGN-DECISIONS.md) — 本案專屬的設計決策與理由
- [TEST-REPORT.md](TEST-REPORT.md) — 實際執行的檢查、發現的問題、修正與未驗證項目
