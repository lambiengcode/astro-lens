import type { Messages } from './vi';

// ============================================================
// INTERFACE STRINGS — en
// ============================================================
//
// English is the one locale with no tradition behind it, so it translates for
// comprehension and carries the transliterated name alongside — DESIGN.md
// §15.1. It is also the international fallback, and the locale the Indian
// market is served in (captain's decision, PLAN.md §13b).

const en: Messages = {
  app: {
    brand: 'Zi Wei Dou Shu',
    title: 'Zi Wei Dou Shu — Purple Star Astrology Reading',
    description:
      'A deep Zi Wei Dou Shu (Purple Star) reading, cast by algorithm and interpreted with AI. Twelve palaces, five-element class, decade cycles and a direction you can act on.',
    keywords: ['zi wei dou shu', 'purple star astrology', 'ziwei chart', 'chinese astrology', 'natal chart', 'tu vi'],
  },

  nav: {
    home: 'Home',
    create: 'Cast a chart',
    language: 'Language',
  },

  footer: {
    tagline: '· cast by traditional algorithm, read with AI',
    disclaimer: 'For reference only · your data stays on your device',
  },

  hero: {
    eyebrow: 'Zi Wei Dou Shu · read by Gemini',
    line1: 'Your chart,',
    line2a: 'read with a ',
    line2em: 'measure',
    line3: 'and not with flattery.',
    sub:
      'Stars placed by the traditional algorithm, then read by AI against the actual twelve palaces, five elements and decade cycles. Nothing vague, nothing hedged — every sentence carries its evidence.',
    cta: 'Cast a chart now',
    free: 'Free',
    noAuth: 'No sign-up',
    dial: 'DOU SHU',
    dialAria: 'Ring of the twelve branches',
  },

  stats: [
    'palaces placed and read',
    'major and minor stars',
    'decade cycles, whole life',
    'of your data stays local',
  ],

  previews: [
    {
      step: 'Step 01',
      h: 'Stars placed exactly',
      p: 'Twelve palaces, major stars, minor stars, the four transformations and the twelve life stages — computed, never guessed.',
    },
    {
      step: 'Step 02',
      h: 'Decade cycles for life',
      p: 'Ten decade cycles, with the running one marked and its first and last year named.',
    },
    {
      step: 'Step 03',
      h: 'A reading with evidence',
      p: 'Every judgement points back at the palace and star that produced it. Readable, and checkable.',
    },
    {
      step: 'Step 04',
      h: 'Ask anything, afterwards',
      p: 'Talk directly to your own chart — not a general-purpose chatbot.',
    },
  ],

  form: {
    cardTitle: 'Birth details',
    cardTime: '~8 seconds',
    name: 'Name',
    optional: '(optional)',
    namePlaceholder: 'Enter your name…',
    date: 'Date of birth (Gregorian)',
    hour: 'Hour of birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    unknownHour: 'Hour of birth unknown',
    unknownHourNote: 'Casts 13 candidate charts and compares them so you can pick the closest hour.',
    location: 'Place of birth',
    locationDefault: '(defaults to Vietnam)',
    defaultLocation: 'Vietnam',
    self: 'About you',
    selfPlaceholder: 'Temperament, what you do now, where you are in relationships, what is on your mind…',
    selfNote: 'Helps the AI hold the chart against your actual life.',
    submit: 'Cast and read →',
    submitCandidates: 'See 13 Life Palaces →',
    errNoDate: 'Please choose a date of birth.',
    errGeneric: 'Something went wrong.',
    errNetwork: 'Could not reach the server. Please try again.',
    errCandidates: 'Could not build the candidate list.',
  },

  loading: {
    analysis: [
      'Casting the chart…',
      'Placing the twelve palaces…',
      'Checking major and minor stars…',
      'Deriving the five-element class…',
      'Laying out the ten decade cycles…',
      'Composing the reading…',
    ],
    candidates: [
      'Casting 13 candidate charts…',
      'Comparing the Life Palace of each hour…',
    ],
    sub: 'this takes about 15–30 seconds',
  },

  candidates: {
    head: '13 charts, one for each hour of birth',
    intro: 'Pick the chart whose Life Palace reads most like you.',
    groupLabel: 'Choose the hour of birth',
    menh: 'Life',
    back: '← Back',
    confirm: 'Cast with this hour →',
    hint: 'Not sure? Take the closest — you can always come back and try another hour.',
  },

  result: {
    loading: 'Loading the chart…',
    newChart: 'Cast a new chart',
    backNewChart: '← Cast a new chart',
    exportPdf: 'Export PDF',
    exporting: 'Exporting…',
    title: 'Zi Wei Chart',
    tabs: {
      overview: 'Overview',
      chart: '12 Palaces',
      daivan: 'Decades',
      interpretation: 'Reading',
      horoscope: 'Current',
    },
    highlights: 'What stands out',
    menhPalace: 'Life Palace',
    mutagenOfYear: 'Transformations, year',
    currentDecadal: 'Running decade',
    age: 'years',
    yearly: 'Year',
    monthly: 'Month',
    month: 'month',
    decadalNow: 'Running decade',
    yearOfDecadalPre: 'year',
    yearOfDecadalPost: 'of the decade',
    kvPalace: 'Palace',
    kvCanChi: 'Stem & branch',
    kvBorrowedStars: 'Borrowed stars',
    kvMajorStars: 'Major stars',
    kvMutagen: 'Transformations',
    none: 'None',
    noHoroscope: 'No current-cycle data for this chart.',
    menhAt: 'Life Palace at',
    askFab: 'Ask about this chart',
    askFabAria: 'Open the chart conversation',
    printPage1: 'Page 1 — Overview',
    printPage2: 'Page 2 — The twelve palaces',
  },

  summary: {
    title: 'Overview',
    solarDate: 'Gregorian',
    lunarDate: 'Lunar',
    chineseDate: 'Stem & branch',
    birthHour: 'Hour of birth',
    sign: 'Zodiac sign',
    zodiac: 'Animal',
    fiveElements: 'Five-element class',
    soulBody: 'Life ruler / Body ruler',
  },

  chart: {
    noData: 'no data',
    missing: 'Missing palaces:',
    dialDecadal: 'Decade',
    hour: 'hour',
    menh: 'Life',
    thanMark: '[ Body ]',
    cellAriaPre: 'Palace',
    cellAriaBranch: 'branch',
    tagXung: 'OPPOSE',
    tagHop: 'TRINE',
    legendMajor: 'Major stars',
    legendMinor: 'Minor stars · structure',
    legendAdjective: 'Lesser stars',
    legendKy: 'Adversity',
  },

  decadal: {
    title: 'Ten decade cycles',
    running: 'running',
    age: 'years',
    yearPre: 'year',
    ofTen: '/10',
  },

  palace: {
    titlePre: 'Palace',
    age: 'years',
    close: 'Close palace detail',
    majorStars: 'Major stars',
    minorStars: 'Minor stars',
    adjectiveStars: 'Lesser stars',
    none: 'None',
    opposite: 'Opposite palace',
    trine: 'Trine',
    noData: 'no data',
  },

  paper: {
    barTitle: 'Chart reading',
    words: 'words',
    exporting: '… Exporting',
    downloadImage: '↓ Save image',
    downloadPdf: '↓ Export PDF',
    docTitle: 'Zi Wei Chart',
    castOn: 'chart cast on',
    printLabel: 'Reading',
  },

  chat: {
    title: 'Ask about this chart',
    subPre: 'gemini ·',
    subPost: 'palaces loaded',
    close: 'Close the conversation',
    emptyPre: 'Ask anything about',
    emptyOf: '',
    emptyPost:
      "this chart — temperament, career, relationships, money. Every answer points back at the palace and star behind it.",
    typing: 'Composing an answer',
    suggestions: [
      'Money this year',
      'What to avoid',
      'Explain Adversity',
      'Relationships this year',
      'What work suits me',
    ],
    placeholder: 'Ask about your chart…',
    inputAria: 'Question about the chart',
    sendAria: 'Send the question',
    note: 'Enter sends · Shift+Enter for a new line',
    errPrefix: 'Sorry, something went wrong:',
    errNetwork: 'Could not connect. Please try again.',
  },

  api: {
    missingFields: 'Please give the date of birth, hour of birth and gender.',
    badDate: 'That date format is not valid. Please use YYYY-MM-DD.',
    badHour: 'That hour of birth is not valid.',
    incompleteChart: 'The chart does not have all twelve palaces. Please try again.',
    noApiKey:
      '⚠️ GEMINI_API_KEY is not configured. Add an API key to .env.local to receive the full AI reading.\n\nThe chart itself was cast successfully.',
    unknownError: 'An unknown error occurred.',
    analysisErrorPrefix: 'Analysis error:',
  },
};

export default en;
