import type { Messages } from './vi';

// ============================================================
// INTERFACE STRINGS — ko (한국어)
// ============================================================
//
// 자미두수 has its own Korean tradition and vocabulary — DESIGN.md §15.1, so
// this is the tradition in Korean rather than a translation of Vietnamese.
// Domain terms come from `../vocabulary.ts`'s Korean column.

const ko: Messages = {
  app: {
    brand: '자미두수',
    title: '자미두수 — 명반 해석',
    description:
      '인공지능을 결합한 자미두수 심층 해석 도구. 십이궁과 오행국, 대한·유년을 분석하고 실행 가능한 방향을 제시합니다.',
    keywords: ['자미두수', '명반', '사주', '자미두수 해석', '명궁', '두수'],
  },

  nav: {
    home: '홈',
    create: '명반 작성',
    language: '언어',
  },

  footer: {
    tagline: '· 전통 포국 알고리즘과 AI 해석',
    disclaimer: '결과는 참고용입니다 · 데이터는 사용자 기기에만 남습니다',
  },

  hero: {
    eyebrow: '자미두수 · Gemini 해석',
    line1: '당신의 명반을',
    line2a: '미사여구가 아니라 ',
    line2em: '척도',
    line3: '로 읽습니다.',
    sub:
      '전통 알고리즘으로 포국하고, 십이궁·오행·대한의 실제 데이터 위에서 AI가 해석합니다. 모호하지 않고 양다리를 걸치지 않습니다 — 문장마다 근거가 있습니다.',
    cta: '바로 명반 작성',
    free: '무료',
    noAuth: '가입 불필요',
    dial: '두수',
    dialAria: '지지 원반',
  },

  stats: [
    '개 궁을 포국하고 해석',
    '주성과 보조성',
    '평생의 대한',
    '데이터는 내 기기에',
  ],

  previews: [
    {
      step: '01 단계',
      h: '정확한 포국',
      p: '십이궁, 주성, 보조성, 사화, 장생십이신 — 알고리즘으로 배치하며 추측하지 않습니다.',
    },
    {
      step: '02 단계',
      h: '평생의 대한',
      p: '열 개의 대한과 현재 진행 중인 대한, 그 시작과 끝 연도를 정확히 표시합니다.',
    },
    {
      step: '03 단계',
      h: '근거 있는 해석',
      p: '모든 판단이 그 근거가 된 궁과 성을 되짚습니다. 읽히고, 확인됩니다.',
    },
    {
      step: '04 단계',
      h: '무엇이든 다시 질문',
      p: '바로 자신의 명반 위에서 대화합니다 — 일반적인 챗봇이 아닙니다.',
    },
  ],

  form: {
    cardTitle: '명반 작성 정보',
    cardTime: '약 8초',
    name: '이름',
    optional: '(선택)',
    namePlaceholder: '이름을 입력하세요…',
    date: '양력 생년월일',
    hour: '출생 시진',
    gender: '성별',
    male: '남성',
    female: '여자',
    unknownHour: '출생 시진을 모름',
    unknownHourNote: '13개의 후보 명반을 작성해 비교한 뒤 가장 가까운 시진을 고릅니다.',
    location: '출생지',
    locationDefault: '(기본값 베트남)',
    defaultLocation: '베트남',
    self: '자기 소개',
    selfPlaceholder: '성격, 현재 하는 일, 관계 상황, 지금 고민하고 있는 것…',
    selfNote: 'AI가 명반과 실제 상황을 대조하는 데 도움이 됩니다.',
    submit: '포국하고 해석하기 →',
    submitCandidates: '13개의 명궁 보기 →',
    errNoDate: '생년월일을 선택해 주세요.',
    errGeneric: '오류가 발생했습니다.',
    errNetwork: '서버에 연결할 수 없습니다. 다시 시도해 주세요.',
    errCandidates: '후보 목록을 만들 수 없습니다.',
  },

  loading: {
    analysis: [
      '명반을 작성하는 중…',
      '십이궁을 배치하는 중…',
      '주성과 보조성을 확인하는 중…',
      '오행국을 산출하는 중…',
      '열 개의 대한을 배열하는 중…',
      '해석을 종합하는 중…',
    ],
    candidates: [
      '13개의 후보 명반을 작성하는 중…',
      '시진별 명궁을 비교하는 중…',
    ],
    sub: '약 15–30초가 걸립니다',
  },

  candidates: {
    head: '13개 시진에 대응하는 13개의 명반',
    intro: '명궁이 자신의 성격을 가장 잘 드러내는 명반을 고르세요.',
    groupLabel: '출생 시진 선택',
    menh: '명궁',
    back: '← 뒤로',
    confirm: '이 시진으로 명반 작성 →',
    hint: '아직 확실하지 않나요? 가장 가까운 것을 고르세요 — 언제든 돌아와 다른 시진을 시도할 수 있습니다.',
  },

  result: {
    loading: '명반을 불러오는 중…',
    newChart: '새 명반 작성',
    backNewChart: '← 새 명반 작성',
    exportPdf: 'PDF 내보내기',
    exporting: '내보내는 중…',
    title: '자미 명반',
    tabs: {
      overview: '개요',
      chart: '십이궁',
      daivan: '대한',
      interpretation: '해석',
      horoscope: '운한',
    },
    highlights: '핵심',
    menhPalace: '명궁',
    mutagenOfYear: '사화 · 연간',
    currentDecadal: '현재 대한',
    age: '세',
    yearly: '유년',
    monthly: '유월',
    month: '월',
    decadalNow: '현재 대한',
    yearOfDecadalPre: '대한',
    yearOfDecadalPost: '년째',
    kvPalace: '궁위',
    kvCanChi: '간지',
    kvBorrowedStars: '차용성',
    kvMajorStars: '주성',
    kvMutagen: '사화',
    none: '없음',
    noHoroscope: '이 명반에는 운한 데이터가 없습니다.',
    menhAt: '명궁 위치',
    askFab: '이 명반에 대해 질문하기',
    askFabAria: '명반 대화 열기',
    printPage1: '1쪽 — 개요 정보',
    printPage2: '2쪽 — 십이궁 명반',
  },

  summary: {
    title: '개요 정보',
    solarDate: '양력',
    lunarDate: '음력',
    chineseDate: '간지',
    birthHour: '출생 시진',
    sign: '별자리',
    zodiac: '띠',
    fiveElements: '오행국',
    soulBody: '명주 / 신주',
  },

  chart: {
    noData: '데이터 없음',
    missing: '누락된 궁:',
    centre: '자미두수',
    hour: '시',
    menh: '명',
    than: '신',
    thanMark: '［신］',
    hint: '궁을 눌러 상세 정보를 확인하세요',
    hintActivePre: '보는 중',
    cellAriaPre: '궁',
    cellAriaBranch: '지지',
    tagXung: '충조',
    tagHop: '삼합',
    legendMajor: '주성',
    legendMinor: '보조성 · 구조',
    legendAdjective: '잡요',
    legendKy: '화기',
  },

  decadal: {
    title: '열 개의 대한',
    running: '진행 중',
    age: '세',
    yearPre: '',
    ofTen: '/10년째',
  },

  palace: {
    titlePre: '궁',
    age: '세',
    close: '궁 상세 닫기',
    majorStars: '주성',
    minorStars: '보조성',
    adjectiveStars: '잡요',
    none: '없음',
    opposite: '대궁 (충조)',
    trine: '삼합',
    noData: '데이터 없음',
  },

  paper: {
    barTitle: '명반 해석',
    words: '자',
    exporting: '… 내보내는 중',
    downloadImage: '↓ 이미지 저장',
    downloadPdf: '↓ PDF 내보내기',
    docTitle: '자미 명반',
    castOn: '명반 작성일',
    printLabel: '해석',
  },

  chat: {
    title: '이 명반에 대해 질문하기',
    subPre: 'gemini ·',
    subPost: '개 궁 불러옴',
    close: '대화 닫기',
    emptyPre: '이 명반에 대해',
    emptyOf: '·',
    emptyPost:
      '무엇이든 물어보세요 — 성격, 직업, 인연, 재물. 모든 답변은 근거가 된 궁과 성을 되짚습니다.',
    typing: '답변을 작성하는 중',
    suggestions: [
      '올해의 재물운',
      '피해야 할 것',
      '화기 설명',
      '올해의 인연',
      '어떤 직업이 맞나',
    ],
    placeholder: '내 명반에 대해 질문하기…',
    inputAria: '명반에 대한 질문',
    sendAria: '질문 보내기',
    note: 'Enter 전송 · Shift+Enter 줄바꿈',
    errPrefix: '죄송합니다, 오류가 발생했습니다:',
    errNetwork: '연결할 수 없습니다. 다시 시도해 주세요.',
  },

  api: {
    missingFields: '생년월일, 출생 시진, 성별을 모두 입력해 주세요.',
    badDate: '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해 주세요.',
    badHour: '출생 시진이 올바르지 않습니다.',
    incompleteChart: '명반의 십이궁이 완전하지 않습니다. 다시 시도해 주세요.',
    noApiKey:
      '⚠️ GEMINI_API_KEY가 설정되지 않았습니다. AI의 상세 해석을 받으려면 .env.local에 API key를 추가해 주세요.\n\n자미 명반은 정상적으로 생성되었습니다.',
    unknownError: '알 수 없는 오류가 발생했습니다.',
    analysisErrorPrefix: '분석 오류:',
  },
};

export default ko;
