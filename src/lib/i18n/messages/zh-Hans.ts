import type { Messages } from './vi';

// ============================================================
// INTERFACE STRINGS — zh-Hans (简体中文, mainland conventions)
// ============================================================
//
// 紫微斗數 is this tradition's own name, so the Chinese reader is not reading a
// translation of a Vietnamese app — DESIGN.md §15.1. Domain terms below come
// from `../vocabulary.ts`'s Simplified column, never re-spelled here.

const zhHans: Messages = {
  app: {
    brand: '紫微斗数',
    title: '紫微斗数 — 命盘详解',
    description:
      '结合人工智能的紫微斗数深度解盘工具。分析十二宫、五行局、大限流年，并给出可执行的方向建议。',
    keywords: ['紫微斗数', '排盘', '命盘', '看紫微', '紫微解盘', '斗数命理'],
  },

  nav: {
    home: '首页',
    create: '排盘',
    language: '语言',
  },

  footer: {
    tagline: '· 以传统排盘算法与 AI 解读',
    disclaimer: '结果仅供参考 · 数据只留在你的设备上',
  },

  hero: {
    eyebrow: '紫微斗数 · Gemini 解盘',
    line1: '你的命盘，',
    line2a: '用',
    line2em: '尺度',
    line3: '来读，而不是用漂亮话。',
    sub:
      '按传统算法安星，再由 AI 依据十二宫、五行与大限的真实数据解读。不含糊、不两可 — 每一句都有依据。',
    cta: '立即排盘',
    free: '免费',
    noAuth: '无需注册',
    dial: '斗数',
    dialAria: '地支盘',
  },

  stats: [
    '宫位完整安星解读',
    '主星与辅星',
    '大限贯穿一生',
    '数据留在你的设备',
  ],

  previews: [
    {
      step: '第 01 步',
      h: '精准安星',
      p: '十二宫、主星、辅星、四化与长生十二神 — 依算法推排，不靠猜测。',
    },
    {
      step: '第 02 步',
      h: '一生大限',
      p: '十步大限，准确标出当前所行之限及其起讫年份。',
    },
    {
      step: '第 03 步',
      h: '有依据的解读',
      p: '每一条论断都回指所据的宫与星。读得懂，也查得到。',
    },
    {
      step: '第 04 步',
      h: '随时追问',
      p: '直接就你自己的命盘对话 — 不是泛泛而谈的聊天机器人。',
    },
  ],

  form: {
    cardTitle: '排盘所需资料',
    cardTime: '约 8 秒',
    name: '姓名',
    optional: '（选填）',
    namePlaceholder: '请输入姓名…',
    date: '阳历出生日期',
    hour: '出生时辰',
    gender: '性别',
    male: '男',
    female: '女',
    unknownHour: '不确定出生时辰',
    unknownHourNote: '推排 13 张候选命盘，对照后挑出最贴近的时辰。',
    location: '出生地',
    locationDefault: '（默认越南）',
    defaultLocation: '越南',
    self: '自我描述',
    selfPlaceholder: '性格、目前的工作、感情状况、正在困扰你的事…',
    selfNote: '帮助 AI 把命盘与你的实际情况相互对照。',
    submit: '安星并解盘 →',
    submitCandidates: '查看 13 个命宫 →',
    errNoDate: '请选择出生日期。',
    errGeneric: '发生错误。',
    errNetwork: '无法连接服务器，请重试。',
    errCandidates: '无法生成候选清单。',
  },

  loading: {
    analysis: [
      '正在推排命盘…',
      '正在安十二宫…',
      '正在核对主星与辅星…',
      '正在推算五行局…',
      '正在排布十步大限…',
      '正在汇总解读…',
    ],
    candidates: [
      '正在推排 13 张候选命盘…',
      '正在比对各时辰的命宫…',
    ],
    sub: '这个过程大约需要 15–30 秒',
  },

  candidates: {
    head: '13 张命盘，对应 13 个时辰',
    intro: '请选出命宫最贴近你性格的那一张。',
    groupLabel: '选择出生时辰',
    menh: '命宫',
    back: '← 返回',
    confirm: '用这个时辰排盘 →',
    hint: '还不确定？先选最接近的 — 你随时可以回来换一个时辰。',
  },

  result: {
    loading: '正在载入命盘…',
    newChart: '重新排盘',
    backNewChart: '← 重新排盘',
    exportPdf: '导出 PDF',
    exporting: '正在导出…',
    title: '紫微命盘',
    tabs: {
      overview: '总览',
      chart: '十二宫',
      daivan: '大限',
      interpretation: '解读',
      horoscope: '运限',
    },
    highlights: '重点',
    menhPalace: '命宫',
    mutagenOfYear: '四化 · 年干',
    currentDecadal: '当前大限',
    age: '岁',
    yearly: '流年',
    monthly: '流月',
    month: '月',
    decadalNow: '当前大限',
    yearOfDecadalPre: '第',
    yearOfDecadalPost: '年 · 本限',
    kvPalace: '宫位',
    kvCanChi: '干支',
    kvBorrowedStars: '借星',
    kvMajorStars: '主星',
    kvMutagen: '四化',
    none: '无',
    noHoroscope: '此命盘没有运限数据。',
    menhAt: '命宫安于',
    askFab: '就这张命盘提问',
    askFabAria: '打开命盘对话',
    printPage1: '第 1 页 — 总览资料',
    printPage2: '第 2 页 — 十二宫命盘',
  },

  summary: {
    title: '总览资料',
    solarDate: '阳历',
    lunarDate: '农历',
    chineseDate: '干支',
    birthHour: '出生时辰',
    sign: '星座',
    zodiac: '生肖',
    fiveElements: '五行局',
    soulBody: '命主 / 身主',
  },

  chart: {
    noData: '无数据',
    missing: '缺少宫位：',
    dialDecadal: '大限',
    hour: '时',
    menh: '命',
    thanMark: '［身］',
    cellAriaPre: '宫位',
    cellAriaBranch: '地支',
    tagXung: '冲照',
    tagHop: '三合',
    legendMajor: '主星',
    legendMinor: '辅星 · 结构',
    legendAdjective: '杂曜',
    legendKy: '化忌',
  },

  decadal: {
    title: '十步大限',
    running: '现行',
    age: '岁',
    yearPre: '第',
    ofTen: '/10 年',
  },

  palace: {
    titlePre: '宫',
    age: '岁',
    close: '关闭宫位详情',
    majorStars: '主星',
    minorStars: '辅星',
    adjectiveStars: '杂曜',
    none: '无',
    opposite: '对宫（冲照）',
    trine: '三合',
    noData: '无数据',
  },

  paper: {
    barTitle: '命盘解读',
    words: '字',
    exporting: '… 正在导出',
    downloadImage: '↓ 下载图片',
    downloadPdf: '↓ 导出 PDF',
    docTitle: '紫微命盘',
    castOn: '排盘日期',
    printLabel: '解读',
  },

  chat: {
    title: '就这张命盘提问',
    subPre: 'gemini ·',
    subPost: '宫已载入',
    close: '关闭对话',
    emptyPre: '关于这张命盘',
    emptyOf: '·',
    emptyPost:
      '你可以问任何事 — 性格、事业、感情、财务。每个回答都会回指所据的宫与星。',
    typing: '正在拟写回答',
    suggestions: [
      '今年的财运',
      '该避开什么',
      '解释化忌',
      '今年的感情',
      '适合什么职业',
    ],
    placeholder: '就你的命盘提问…',
    inputAria: '关于命盘的提问',
    sendAria: '发送提问',
    note: 'Enter 发送 · Shift+Enter 换行',
    errPrefix: '抱歉，出错了：',
    errNetwork: '无法连接，请重试。',
  },

  api: {
    missingFields: '请填写完整的出生日期、时辰与性别。',
    badDate: '日期格式不正确，请使用 YYYY-MM-DD。',
    badHour: '出生时辰无效。',
    incompleteChart: '命盘的十二宫不完整，请重试。',
    noApiKey:
      '⚠️ 尚未配置 GEMINI_API_KEY。请在 .env.local 中加入 API key 才能取得 AI 的详细解读。\n\n紫微命盘已成功生成。',
    unknownError: '发生未知错误。',
    analysisErrorPrefix: '解析错误：',
  },
};

export default zhHans;
