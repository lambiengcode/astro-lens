import type { Messages } from './vi';

// ============================================================
// INTERFACE STRINGS — zh-Hant (繁體中文, 香港用語)
// ============================================================
//
// Cantonese in Traditional script, formal 書面語 — DESIGN.md §15.5. A Cantonese
// reader expects register here, not a transcription of speech, so this reads as
// written Chinese with Hong Kong lexicon: 資料 not 数据, 預設 not 默认,
// 伺服器 not 服务器, 匯出 not 导出.
//
// Authored, never transformed from `zh-Hans` — DESIGN.md §15.7. Domain terms
// come from `../vocabulary.ts`'s Traditional column.

const zhHant: Messages = {
  app: {
    brand: '紫微斗數',
    title: '紫微斗數 — 命盤詳解',
    description:
      '結合人工智能的紫微斗數深度解盤工具。分析十二宮、五行局、大限流年，並提出可實行的方向建議。',
    keywords: ['紫微斗數', '排盤', '命盤', '睇紫微', '紫微解盤', '斗數命理'],
  },

  nav: {
    home: '首頁',
    create: '排盤',
    language: '語言',
  },

  footer: {
    tagline: '· 以傳統排盤算法與 AI 解讀',
    disclaimer: '結果僅供參考 · 資料只留在你的裝置上',
  },

  hero: {
    eyebrow: '紫微斗數 · Gemini 解盤',
    line1: '你的命盤，',
    line2a: '用',
    line2em: '尺度',
    line3: '來讀，而不是用漂亮說話。',
    sub:
      '按傳統算法安星，再由 AI 依據十二宮、五行與大限的真實資料解讀。不含糊、不模稜兩可 — 每一句都有依據。',
    cta: '即時排盤',
    free: '免費',
    noAuth: '毋須註冊',
    dial: '斗數',
    dialAria: '地支盤',
  },

  stats: [
    '宮位完整安星解讀',
    '主星與輔星',
    '大限貫穿一生',
    '資料留在你的裝置',
  ],

  previews: [
    {
      step: '第 01 步',
      h: '精準安星',
      p: '十二宮、主星、輔星、四化與長生十二神 — 依算法推排，並非估算。',
    },
    {
      step: '第 02 步',
      h: '一生大限',
      p: '十步大限，準確標出現行之限及其起訖年份。',
    },
    {
      step: '第 03 步',
      h: '有依據的解讀',
      p: '每一項論斷都回指所據的宮與星。讀得明，亦查得到。',
    },
    {
      step: '第 04 步',
      h: '隨時追問',
      p: '直接就你自己的命盤對話 — 並非泛泛而談的聊天機械人。',
    },
  ],

  form: {
    cardTitle: '排盤所需資料',
    cardTime: '約 8 秒',
    name: '姓名',
    optional: '（選填）',
    namePlaceholder: '請輸入姓名…',
    date: '陽曆出生日期',
    hour: '出生時辰',
    gender: '性別',
    male: '男',
    female: '女',
    unknownHour: '不確定出生時辰',
    unknownHourNote: '推排 13 張候選命盤，對照之後揀出最貼近的時辰。',
    location: '出生地',
    locationDefault: '（預設越南）',
    defaultLocation: '越南',
    self: '自我描述',
    selfPlaceholder: '性格、目前的工作、感情狀況、正在困擾你的事…',
    selfNote: '協助 AI 將命盤與你的實際情況互相對照。',
    submit: '安星並解盤 →',
    submitCandidates: '查看 13 個命宮 →',
    errNoDate: '請選擇出生日期。',
    errGeneric: '發生錯誤。',
    errNetwork: '無法連接伺服器，請再試一次。',
    errCandidates: '無法產生候選清單。',
  },

  loading: {
    analysis: [
      '正在推排命盤…',
      '正在安十二宮…',
      '正在核對主星與輔星…',
      '正在推算五行局…',
      '正在排布十步大限…',
      '正在滙整解讀…',
    ],
    candidates: [
      '正在推排 13 張候選命盤…',
      '正在比對各時辰的命宮…',
    ],
    sub: '這個過程大約需時 15–30 秒',
  },

  candidates: {
    head: '13 張命盤，對應 13 個時辰',
    intro: '請揀出命宮最貼近你性格的一張。',
    groupLabel: '選擇出生時辰',
    menh: '命宮',
    back: '← 返回',
    confirm: '用這個時辰排盤 →',
    hint: '仲未肯定？先揀最接近的 — 你隨時可以返嚟換過一個時辰。',
  },

  result: {
    loading: '正在載入命盤…',
    newChart: '重新排盤',
    backNewChart: '← 重新排盤',
    exportPdf: '匯出 PDF',
    exporting: '正在匯出…',
    title: '紫微命盤',
    tabs: {
      overview: '總覽',
      chart: '十二宮',
      daivan: '大限',
      interpretation: '解讀',
      horoscope: '運限',
    },
    highlights: '重點',
    menhPalace: '命宮',
    mutagenOfYear: '四化 · 年干',
    currentDecadal: '現行大限',
    age: '歲',
    yearly: '流年',
    monthly: '流月',
    month: '月',
    decadalNow: '現行大限',
    yearOfDecadalPre: '第',
    yearOfDecadalPost: '年 · 本限',
    kvPalace: '宮位',
    kvCanChi: '干支',
    kvBorrowedStars: '借星',
    kvMajorStars: '主星',
    kvMutagen: '四化',
    none: '無',
    noHoroscope: '此命盤沒有運限資料。',
    menhAt: '命宮安於',
    askFab: '就這張命盤提問',
    askFabAria: '開啟命盤對話',
    printPage1: '第 1 頁 — 總覽資料',
    printPage2: '第 2 頁 — 十二宮命盤',
  },

  summary: {
    title: '總覽資料',
    solarDate: '陽曆',
    lunarDate: '農曆',
    chineseDate: '干支',
    birthHour: '出生時辰',
    sign: '星座',
    zodiac: '生肖',
    fiveElements: '五行局',
    soulBody: '命主 / 身主',
  },

  chart: {
    noData: '無資料',
    missing: '缺少宮位：',
    dialDecadal: '大限',
    hour: '時',
    menh: '命',
    thanMark: '［身］',
    cellAriaPre: '宮位',
    cellAriaBranch: '地支',
    tagXung: '沖照',
    tagHop: '三合',
    legendMajor: '主星',
    legendMinor: '輔星 · 結構',
    legendAdjective: '雜曜',
    legendKy: '化忌',
  },

  decadal: {
    title: '十步大限',
    running: '現行',
    age: '歲',
    yearPre: '第',
    ofTen: '/10 年',
  },

  palace: {
    titlePre: '宮',
    age: '歲',
    close: '關閉宮位詳情',
    majorStars: '主星',
    minorStars: '輔星',
    adjectiveStars: '雜曜',
    none: '無',
    opposite: '對宮（沖照）',
    trine: '三合',
    noData: '無資料',
  },

  paper: {
    barTitle: '命盤解讀',
    words: '字',
    exporting: '… 正在匯出',
    downloadImage: '↓ 下載圖片',
    downloadPdf: '↓ 匯出 PDF',
    docTitle: '紫微命盤',
    castOn: '排盤日期',
    printLabel: '解讀',
  },

  chat: {
    title: '就這張命盤提問',
    subPre: 'gemini ·',
    subPost: '宮已載入',
    close: '關閉對話',
    emptyPre: '關於這張命盤',
    emptyOf: '·',
    emptyPost:
      '你可以問任何事 — 性格、事業、感情、財務。每個回答都會回指所據的宮與星。',
    typing: '正在草擬回答',
    suggestions: [
      '今年的財運',
      '應該避開甚麼',
      '解釋化忌',
      '今年的感情',
      '適合甚麼職業',
    ],
    placeholder: '就你的命盤提問…',
    inputAria: '關於命盤的提問',
    sendAria: '傳送提問',
    note: 'Enter 傳送 · Shift+Enter 換行',
    errPrefix: '抱歉，出錯了：',
    errNetwork: '無法連接，請再試一次。',
  },

  api: {
    missingFields: '請填寫完整的出生日期、時辰與性別。',
    badDate: '日期格式不正確，請使用 YYYY-MM-DD。',
    badHour: '出生時辰無效。',
    incompleteChart: '命盤的十二宮並不完整，請再試一次。',
    noApiKey:
      '⚠️ 尚未設定 GEMINI_API_KEY。請在 .env.local 加入 API key，方能取得 AI 的詳細解讀。\n\n紫微命盤已成功產生。',
    unknownError: '發生不明錯誤。',
    analysisErrorPrefix: '解析錯誤：',
  },
};

export default zhHant;
