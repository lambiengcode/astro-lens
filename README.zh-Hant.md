# astro-lens

[English](README.md) · [Tiếng Việt](README.vi.md) · [简体中文](README.zh-Hans.md) · **繁體中文** · [한국어](README.ko.md)

一套紫微斗數排盤與命盤解讀產生器。你輸入出生日期、時辰與性別；程式在本機排出十二宮
命盤並繪製出來，再交由 Gemini 產生一篇結構完整的長篇解讀。所有內容——介面、術語，以及
解讀本身——都提供五種語言。

視覺體系名為 **Thiên Văn Đài（天文臺）**：深色、扁平、以字體為主，只有一種圓角半徑，
不用陰影也不用漸層。解讀單獨呈現在一張淺色「紙」面上——匯出的 PDF 擷取的正是這一面。

---

## 介面預覽

| | |
|---|---|
| **[首頁](public/screenshots/landing.png)**<br>出生資料表單、主視覺區與數據列。這就是程式第一屏的全貌——導覽只有兩項，它不是一個行銷網站。 | ![首頁](public/screenshots/landing.png) |
| **[十二宮命盤](public/screenshots/chart.png)**<br>命宮被選取、詳情抽屜展開的命盤。每一格包含主星及其廟旺得利平不陷、輔星與雜曜環、大限年齡區間，以及該宮的干支。 | ![命盤](public/screenshots/chart.png) |
| **[宮位關係浮層](public/screenshots/chart-relations.png)**<br>本程式的招牌互動。滑過某一宮，會在格線上畫出它的**沖照**（琥珀色，對宮）與**三合**（青色，另外兩角），每個目標都帶標籤。圖中滑過的是疾厄宮。 | ![宮位關係](public/screenshots/chart-relations.png) |
| **[大限時間軸](public/screenshots/daivan.png)**<br>以表格呈現的十步大限：年齡區間、宮名、宮內星曜、對應年份，以及現行大限的進度條。 | ![大限](public/screenshots/daivan.png) |
| **[命盤解讀](public/screenshots/reading.png)**<br>紙面上的解讀正文與匯出按鈕。縮排的區塊是**引證**——每一條都寫明該判斷所依據的宮與星。 | ![解讀](public/screenshots/reading.png) |
| **[追問對話](public/screenshots/chat.png)**<br>針對同一張命盤繼續追問。答案下方的等寬列（`↳ Cung Mệnh · Liêm Trinh (bình) · …`）是該答案的引證，已從正文中拆出獨立成列。 | ![對話](public/screenshots/chat.png) |
| **[韓文](public/screenshots/chart-ko.png)**<br>同一張盤在 `?lang=ko` 下的樣子。宮名、星名與廟陷狀態全部譯出——명궁、자미、칠살、왕/평/묘/함——因為被翻譯的是術語表本身，而不只是介面文字。 | ![韓文](public/screenshots/chart-ko.png) |

所有截圖都由內建的開發用範例命盤產生，因此不含任何真實人物的出生資料。用
`npm run screenshots` 重新產生。

---

## 快速開始

**先決條件**

- Node 20 或更新版本（開發環境為 24.4）。`package.json` 沒有鎖定引擎版本。
- 一把 Google Gemini API 金鑰。沒有金鑰時命盤仍然能正常計算與繪製——只有解讀和追問
  需要連網。

```bash
npm install
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env   # 建立 .env
npm run dev                                             # http://localhost:3000
```

接著開啟 <http://localhost:3000> 填寫表單。

若想不花費 API 呼叫就看看介面，在 `/` 或 `/result` 後面加上 `?fixture=tuvi-ty`——
參見下文的[開發用範例命盤](#開發用範例命盤)。

### 環境變數

| 變數 | 是否必要 | 用途 |
|---|---|---|
| `GEMINI_API_KEY` | 產生解讀時必要 | Google Gemini 金鑰。放進 `.env`（已被 gitignore）。請用你自己的金鑰——絕對不要把金鑰提交進版控。 |
| `PARITY_PORT` | 否 | 視覺比對工具自備 dev server 的連接埠，預設 `3100`。 |
| `SHOT_PORT` | 否 | 截圖工具自備 dev server 的連接埠，預設 `3200`。 |
| `SHOT_ONLY` | 否 | 以逗號分隔的截圖名稱，用來只重拍其中幾張。 |

---

## npm 指令

| 指令 | 作用 |
|---|---|
| `npm run dev` | 在 3000 連接埠啟動 Next dev server。 |
| `npm run build` | 正式建置。**與 `dev` 共用 `.next`**——見下文的已知問題。 |
| `npm start` | 執行正式建置的產物。 |
| `npm run lint` | ESLint。「乾淨」的意思是*只*剩下文列出的三個已知錯誤。 |
| `npm run typecheck` | `tsc --noEmit`。 |
| `npm run test` | Vitest——245 個單元測試。快、不連網，可以隨時反覆跑。 |
| `npm run test:watch` | 同上，監看模式。 |
| `npm run parity` | Playwright。把十二個繪製出的畫面與設計參照稿比對，另含各語言的版面壓力測試與減弱動效測試。自備 dev server。 |
| `npm run eval` | **解讀品質評測。**真的呼叫 Gemini，約 20 分鐘，花真錢。絕不接進 `test` 或 CI。詳見下文。 |
| `npm run screenshots` | 重新產生 `public/screenshots/`。其中對話那張會花掉一次 Gemini 呼叫。 |
| `./tests/tools/token-audit.sh` | 掃描樣式表中違反設計體系的寫法：多餘的圓角、token 以外的顏色、陰影、漸層。 |

---

## 架構

### 命盤在本機計算

`src/lib/iztro.ts` 包裝了 [iztro](https://github.com/SylarLong/iztro)，真正的命理
計算由它完成：國曆轉農曆、十二宮、十四主星、輔星與雜曜環、廟旺狀態、四化，以及大限與
流年的疊加。整個過程不連網，也不需要金鑰。

**無論介面是什麼語言，命盤一律以 `vi-VN` 產生**，翻譯發生在繪製階段。這是刻意的選擇：
它讓越南語輸出成為其餘一切的連接鍵，也意味著切換語言永遠不必重新排盤。

`src/lib/branches.ts` 收著介面在 iztro 之外還需要的地支運算——`xung()` 求對宮、
`tamHop()` 求三合的另外兩角——宮位關係浮層畫的正是這些。`src/lib/bazi.ts` 加上可選的
八字四柱計算，作為輔助體系併入提示詞。

### 解讀由三層提示詞組成

`src/lib/gemini.ts` 用三個部分組出一次請求：

1. **系統指令**——方法論。與一份參考 PDF（`astro-lens.pdf`）一起打包進 Gemini 的
   *context cache*，因此只上傳一次，而不是每次請求都送。
2. **資料脈絡**——命盤，以帶標籤的文字呈現，每個值都經過術語表轉換，好讓服務韓文讀者
   的模型在 자미 和 명궁 上推理，而不是在 Tử Vi 和 Mệnh 上推理。
3. **任務層**——鏈式推理流程、自我檢查清單，以及輸出範本。每次請求都會送出。

`src/lib/prompt/<locale>.ts` 按語言收著這三層；`src/lib/gemini-cache.ts` 為每種語言
管理一份快取。

這一層有兩件事很容易弄錯，而且兩件都真的出過事：

- **只要快取還在，改系統指令就完全沒有作用。**快取只用*顯示名稱*尋找，從不比對內容，
  而且 TTL 長達 90 天。隨請求變動的規則要寫在任務層。
- **有條件的段落必須刪掉，而不是勸阻。**八字段落與自述段落被 `⟦BAZI⟧` / `⟦SELF⟧`
  標記包住，資料不存在時由 `renderTask()` 整段剔除。實測顯示，「若無資料則略過本節」
  這類指令會被五種語言中的四種無視，然後模型自己把資料編出來。

### 引證

解讀裡每一項實質判斷都帶一列引證，寫明它依據的宮與星。在解讀正文裡它們是 markdown
引言區塊，繪製成截圖中看到的縮排區塊。在追問對話裡，答案末尾的引證由
`src/lib/citation.ts` 拆出來，獨立占一列顯示，因為對話泡泡刻意不繪製引言區塊。

兩個介面共用同一個區塊級 markdown 解析器 `src/lib/markdown.ts`，所以答案裡的標題和
清單會被排版出來，而不是把 `###` 和 `*` 原樣顯示。兩者只差在變體：`document` 輸出真正
的標題與 `.sealq` 引證區塊；`bubble` 把標題變成泡泡自身字級的一列粗體引導句，並把 `>`
開頭的一列當成一般內文。

一條引證可能寫到兩個宮——在這門術數裡對宮本來就是依據的一部分——所以任何要解析引證的
程式，都必須把每顆星歸給*緊接在它前面*的那個宮，而不是該列的第一個宮。

### 多語系

三類文字，三個不同的歸處。把其中一類放進另一類的檔案，正是這套結構要防止的錯誤：

| | 位置 | 規則 |
|---|---|---|
| 介面文字 | `src/lib/i18n/messages/<locale>.ts` | `vi.ts` 是型別來源；其餘四份必須完全滿足同一個介面。 |
| 領域術語 | `src/lib/i18n/vocabulary.ts` | 單一一張表，約 193 個概念 × 5 種語言，取自 iztro 自身的語言資料，而不是憑記憶寫出來的。 |
| 模型提示詞 | `src/lib/prompt/<locale>.ts` | 指令語言、輸出語言與術語，全部隨讀者而變。 |

繪製術語值時一律走 `useI18n().v(value, domain)`，不要直接用原始值。

繁體那一欄是 iztro 自己撰寫的 `zh-TW` 資料，絕不是從簡體轉換而來——命宫 / 命宮 有別，
廟、祿、遷移和另外三十來個字也是。

**語言判定**發生在 `src/proxy.ts`——它就是 Next 16 為原本的 `middleware.ts` 取的新
名字。順序是 `?lang=` → cookie → `Accept-Language` → `vi`。它從不重寫路徑，因此所有
網址維持原樣，判定出的語言透過請求標頭傳給繪製層。

### 設計體系是 CSS，不是工具類別

整套視覺體系以語意化的元件類別寫在 `src/app/globals.css` 裡——`.pal`、`.maj`、
`.centre`、`.tl-row`、`.paper`、`.sealq`、`.kv`、`.card`。元件只輸出這些類別名稱，而
不是就地重寫樣式。專案裝了 Tailwind，用來處理零星版面沒有問題，但**新的畫面應該沿用
既有的元件類別，或往 `globals.css` 裡新增一個。**

那些不能妥協的約束由 `./tests/tools/token-audit.sh` 機械檢查：只有一種圓角（`3px`），
不得使用模糊、光暈、立體陰影或漸層文字，顏色只能取自 CSS 變數，凡是計數或寫日期的地方
一律用等寬字族。改過樣式之後請跑一遍這個檢查。

---

## 五種語言

`vi`（預設）· `zh-Hans` · `zh-Hant` · `ko` · `en`。

支援是一路貫通到底的。介面、星名宮名，以及產生的解讀，都使用讀者的語言——韓文使用者
拿到的是一篇用韓文星名推理的韓文解讀，而不是一層裹在越南語解讀外面的韓文外殼。

用 `?lang=ko`（或 `zh-Hans`、`zh-Hant`、`en`、`vi`）切換，也可以用應用列裡的語言選單。
選擇結果記在 cookie 裡。

---

## 測試

### `npm run test` —— 245 個單元測試

宮位關係運算、地支對映、大限進度、術語表的完整性、提示詞包的結構、列印變體，以及解讀
品質檢查器本身。不連網。這是你應該經常跑的那一個。

請注意：**評測用的檢查器自己也有單元測試**，用的是帶有刻意錯誤的合成解讀。絕對不要為
了證明某個檢查器能動而花掉一次 API 呼叫。

### `npm run eval` —— 解讀品質

這是唯一檢驗模型*實際說了什麼*的工具，而且是拿它收到的那張命盤來對照。它會跑兩張凍結
的標準命盤 × 五種語言 = 十篇真實解讀。

> **耗時約 20 分鐘，並產生真實的 API 費用。**它被刻意排除在 `npm run test` 之外，
> 也絕對不能加進 CI。

五項決定性檢查，全部透過術語表運作，因此在五種語言下都成立，而不是去比對越南語字串：

| 檢查 | 驗證什麼 |
|---|---|
| 1 · 憑空捏造 | **星曜落宮。**解讀放進某宮的每一顆主星都必須真的在那一宮，空宮借星的情況予以接受。它問的不是「這顆星在不在盤上」——一張完整的命盤早就把二十八顆主星與輔星都安在某處，那樣問毫無意義。 |
| 2 · 涵蓋度 | 十二宮是否都確實談到了。 |
| 3 · 語言 | 正文是否使用讀者的文字系統，以及有沒有夾帶從命盤資料漏出來的越南語。 |
| 4 · 長度 | 正文是否達到它自己的提示詞所要求的篇幅。 |
| 5 · 結構 | 編號段落是否齊全且順序正確、有條件的段落是否只在對應資料存在時出現，以及論斷段落是否帶有引證。 |

常用參數：`--locale`、`--chart`、`--tag`，以及 `--reuse`——用已存下的解讀重跑檢查，
**完全不**呼叫 API。解讀檔寫入 `tests/eval/out/<tag>/`。[EVAL.md](EVAL.md) 記錄了歷次
執行的發現，也包括促成多次檢查器改寫的那些實測數字。

### `npm run parity` —— 視覺還原度

十二個畫面在兩種視窗尺寸下繪製並與一份凍結的設計參照稿比對，另有二十項各語言版面壓力
測試和一套減弱動效測試。

**判定標準是幾何，不是像素。**測試會回報像素差異百分比，但那個數字只是近似指標，有幾
個畫面超過 0.5% 的門檻是完全合理的。真正做決定的是*方框*有沒有對齊——每個畫面選擇器
清單中各元素的位置、尺寸與間距——因為這與字形怎麼被點陣化無關。[PARITY.md](PARITY.md)
記下了每一項測量、每一處被接受的偏差及其理由。**改動任何視覺內容之前請先讀它**；有好
幾處看起來像「缺陷」的地方，其實是有來龍去脈的既定決策。

這個工具會先停掉正在執行的 dev server 再啟動自己的，因為 Next 16 規定每個專案目錄只
能有一個 dev server，而且若不這麼做，Turbopack 會把過期的樣式表送給無頭瀏覽器。

### 開發用範例命盤

在 `/` 或 `/result` 上加 `?fixture=tuvi-ty`，會從 `src/lib/fixture.ts` 載入一張預先
備好的教科書式命盤，含一篇事先寫好的解讀，並把大限的參照日期釘死，讓快照不會在跨年時
失效。視覺比對畫面與本 README 的截圖正是靠它維持可重現。

當 `NODE_ENV === 'production'` 時 `loadFixture` 回傳 `null`，因此在部署出去的建置裡
碰不到它。

---

## 已知限制與粗糙之處

以下都是真實且現行有效的情況。它們並不神祕，寫下來是為了讓你不必重新踩一遍。

- **一篇完整解讀大約要三分鐘。**這是一次高推理強度的長篇結構化生成。介面會顯示等待
  狀態；除非讓解讀變短，否則沒有辦法讓它變快。
- **改動快取的顯示名稱會讓舊快取被棄置。**Gemini 只按顯示名稱尋找 context cache，因此
  修改 `src/lib/gemini-cache.ts` 裡的 `CACHE_DISPLAY_NAME` 會無聲無息地丟掉現有的
  90 天快取，並逼參考 PDF 重新上傳。在快取重新暖起來之前，每種語言的第一篇解讀都會比
  較慢。專案改名為 `astro-lens` 時發生的正是這件事。
- **`npm run lint` 報三個錯誤是預期狀態。**它們是 `src/app/api/candidates/route.ts`
  中早就存在的三處 `@typescript-eslint/no-explicit-any`（第 35、38、41 行）。只剩這三
  條時 lint 就算「乾淨」。除此之外的任何輸出都是你帶進來的。
- **`next build` 與 `next dev` 共用 `.next`。**先建置再在同一個目錄啟動 dev server，
  可能讓 dev server 對所有路由都回 404。`rm -rf .next` 之後重啟即可。
- **CJK 字型來自 Google Fonts 樣式表，而不是 `next/font`。**`next/font/google` 沒有
  Noto 系列的 CJK 子集，會在建置時把每一個 unicode-range 切片都自行託管一遍。根版面
  改成按當前語言引入一份樣式表，後面墊一套系統 CJK 字族。
- **越南語聲調符號需要留意。**字型必須載入 `vietnamese` 子集；給帶動畫的越南語文字直接
  加 `overflow: hidden` 會把 dấu nặng 和 dấu hỏi 裁掉——請用 `globals.css` 裡已有的
  padding／負 margin 組合。
- **TOON 編碼試過，已經刪掉。**[EVAL.md](EVAL.md) §4 留著實測數字：它把命盤資料脈絡
  壓縮了 22.6%，但那一段只佔提示詞的 4.3%，整次呼叫因此只動了 1.79%，實際耗時紋風不動。
  若要重新考慮，請先讀 §4。

---

## 專案結構

```
src/
  app/                 Next App Router —— 頁面與三個 API 路由
    api/analyze/       產生解讀
    api/chat/          追問對話
    api/candidates/    出生時辰未知時的候選命盤
  components/
    chart/             命盤格線、詳情抽屜、大限表格、解讀正文
    chat/              對話面板
    ui/                表單、頁首、頁尾、載入畫面
  lib/
    iztro.ts           排盤
    bazi.ts            可選的八字四柱
    branches.ts        沖照／三合運算
    chart-derived.ts   空宮借星
    rel-overlay.ts     宮位關係連線
    citation.ts        從對話答案中拆出引證
    markdown.ts        兩個介面共用的區塊 markdown 解析器
    gemini.ts          提示詞組裝
    gemini-cache.ts    按語言劃分的 context cache
    prompt/            五套提示詞包
    i18n/              介面文字、術語表、語言判定
    fixture.ts         開發用範例命盤
  proxy.ts             語言判定（Next 16 的 middleware）
tests/
  unit/                vitest
  parity/              Playwright 視覺比對
  eval/                解讀品質評測工具
  tools/               截圖、PDF 匯出、無障礙與設計 token 檢查
```

延伸閱讀，都在本專案裡：[AGENTS.md](AGENTS.md) 是動手改任何東西之前值得先知道的慣例，
[PARITY.md](PARITY.md) 是視覺紀錄及其既定決策，[EVAL.md](EVAL.md) 則是模型輸出實際被
量出來的表現。
