// ============================================================
// INTERFACE STRINGS — vi (the origin locale)
// ============================================================
//
// Every string here is the exact text the components carried before P5, so
// rendering at `vi` is byte-identical to the pre-i18n build. That identity is
// what the parity harness checks — PLAN.md §13b.6. Do not "improve" a string
// here without re-running `npm run parity`.
//
// Domain vocabulary (palace names, stars, brightness, tứ hóa, stems, branches)
// is NOT here — it lives in `../vocabulary.ts`. DESIGN.md §15.2.

const vi = {
  app: {
    brand: 'Tử Vi Đẩu Số',
    title: 'Tử Vi Đẩu Số — Luận Giải Lá Số',
    description:
      'Ứng dụng luận giải Tử Vi Đẩu Số chuyên sâu, kết hợp trí tuệ nhân tạo. Phân tích 12 cung, ngũ hành, vận hạn và định hướng phát triển.',
    keywords: ['tử vi', 'đẩu số', 'tử vi đẩu số', 'lá số tử vi', 'xem tử vi', 'luận giải tử vi'],
  },

  nav: {
    home: 'Trang chủ',
    create: 'Lập lá số',
    language: 'Ngôn ngữ',
  },

  footer: {
    tagline: '· luận giải bằng thuật toán cổ truyền và AI',
    disclaimer: 'Kết quả mang tính tham khảo · dữ liệu ở lại trên máy bạn',
  },

  hero: {
    eyebrow: 'Tử Vi Đẩu Số · Gemini luận giải',
    line1: 'Lá số của bạn,',
    line2a: 'đọc bằng ',
    line2em: 'thước đo',
    line3: 'chứ không bằng lời hoa mỹ.',
    sub:
      'An sao theo thuật toán cổ truyền, luận giải bằng AI trên đúng dữ liệu 12 cung, ngũ hành và đại vận. Không mơ hồ, không nước đôi — có căn cứ ở từng câu.',
    cta: 'Lập lá số ngay',
    free: 'Miễn phí',
    noAuth: 'Không cần đăng ký',
    /** The astrolabe's centre readout when no chart is loaded. */
    dial: 'ĐẨU SỐ',
    dialAria: 'Vòng địa chi',
  },

  stats: [
    'cung được an và luận',
    'chính tinh và phụ tinh',
    'đại vận suốt đời',
    'dữ liệu ở lại máy bạn',
  ],

  previews: [
    {
      step: 'Bước 01',
      h: 'An sao chính xác',
      p: '12 cung, chính tinh, phụ tinh, tứ hóa và vòng Trường Sinh — dựng theo thuật toán, không đoán.',
    },
    {
      step: 'Bước 02',
      h: 'Đại vận suốt đời',
      p: 'Mười đại vận, đánh dấu chính xác vận đang đi và năm bắt đầu, kết thúc.',
    },
    {
      step: 'Bước 03',
      h: 'Luận giải có căn cứ',
      p: 'Mỗi nhận định dẫn lại cung và sao đã sinh ra nó. Đọc được, kiểm được.',
    },
    {
      step: 'Bước 04',
      h: 'Hỏi lại bất cứ điều gì',
      p: 'Trò chuyện trực tiếp trên chính lá số của bạn — không phải chatbot chung chung.',
    },
  ],

  form: {
    cardTitle: 'Thông tin lập lá số',
    cardTime: '~8 giây',
    name: 'Họ và tên',
    optional: '(không bắt buộc)',
    namePlaceholder: 'Nhập họ tên…',
    date: 'Ngày sinh dương lịch',
    hour: 'Giờ sinh',
    gender: 'Giới tính',
    male: 'Nam',
    female: 'Nữ',
    unknownHour: 'Không rõ giờ sinh',
    unknownHourNote: 'Dựng 13 lá số ứng viên và đối chiếu để chọn giờ đúng nhất.',
    location: 'Nơi sinh',
    locationDefault: '(mặc định Việt Nam)',
    defaultLocation: 'Việt Nam',
    self: 'Mô tả bản thân',
    selfPlaceholder: 'Tính cách, công việc hiện tại, tình trạng tình cảm, điều bạn đang trăn trở…',
    selfNote: 'Giúp AI đối chiếu lá số với thực tế của bạn.',
    submit: 'An sao và luận giải →',
    submitCandidates: 'Xem 13 cung Mệnh →',
    errNoDate: 'Vui lòng chọn ngày sinh.',
    errGeneric: 'Đã xảy ra lỗi.',
    errNetwork: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
    errCandidates: 'Không thể tạo danh sách ứng viên.',
  },

  loading: {
    analysis: [
      'Đang lập lá số tử vi…',
      'Đang an 12 cung…',
      'Đang xét chính tinh và phụ tinh…',
      'Đang luận ngũ hành cục…',
      'Đang dựng mười đại vận…',
      'Đang tổng hợp luận giải…',
    ],
    candidates: [
      'Đang dựng 13 lá số ứng viên…',
      'Đang so cung Mệnh của từng giờ…',
    ],
    sub: 'quá trình này mất khoảng 15–30 giây',
  },

  candidates: {
    head: '13 lá số ứng với 13 giờ sinh',
    intro: 'Chọn lá số có cung Mệnh phản ánh đúng tính cách bạn nhất.',
    groupLabel: 'Chọn giờ sinh',
    menh: 'Mệnh',
    back: '← Quay lại',
    confirm: 'Lập lá số với giờ này →',
    hint: 'Chưa chắc? Chọn cái gần nhất — bạn luôn có thể quay lại thử giờ khác.',
  },

  result: {
    loading: 'Đang tải lá số…',
    newChart: 'Lập lá số mới',
    backNewChart: '← Lập lá số mới',
    exportPdf: 'Xuất PDF',
    exporting: 'Đang xuất…',
    title: 'Lá Số Tử Vi',
    tabs: {
      overview: 'Tổng quan',
      chart: '12 Cung',
      daivan: 'Đại Vận',
      interpretation: 'Luận giải',
      horoscope: 'Vận hạn',
    },
    highlights: 'Điểm nổi bật',
    menhPalace: 'Mệnh cung',
    mutagenOfYear: 'Tứ hóa năm',
    currentDecadal: 'Đại vận hiện tại',
    age: 'tuổi',
    yearly: 'Lưu niên',
    monthly: 'Lưu nguyệt',
    month: 'tháng',
    decadalNow: 'Đại hạn hiện tại',
    yearOfDecadalPre: 'năm thứ',
    yearOfDecadalPost: 'của đại vận',
    kvPalace: 'Cung',
    kvCanChi: 'Can chi',
    kvBorrowedStars: 'Sao mượn',
    kvMajorStars: 'Chính tinh',
    kvMutagen: 'Tứ hóa',
    none: 'Không có',
    noHoroscope: 'Không có dữ liệu vận hạn cho lá số này.',
    menhAt: 'Mệnh an tại',
    askFab: 'Hỏi trên lá số này',
    askFabAria: 'Mở trò chuyện về lá số',
    printPage1: 'Trang 1 — Thông tin tổng quan',
    printPage2: 'Trang 2 — Lá số 12 cung',
  },

  summary: {
    title: 'Thông tin tổng quan',
    solarDate: 'Ngày dương',
    lunarDate: 'Ngày âm',
    chineseDate: 'Can chi',
    birthHour: 'Giờ sinh',
    sign: 'Cung giáp',
    zodiac: 'Con giáp',
    fiveElements: 'Ngũ hành cục',
    soulBody: 'Mệnh chủ / Thân chủ',
  },

  chart: {
    noData: 'không có dữ liệu',
    missing: 'Thiếu cung:',
    dialDecadal: 'Đại vận',
    hour: 'giờ',
    menh: 'Mệnh',
    thanMark: '[ Thân ]',
    cellAriaPre: 'Cung',
    cellAriaBranch: 'địa chi',
    tagXung: 'XUNG',
    tagHop: 'TAM HỢP',
    legendMajor: 'Chính tinh',
    legendMinor: 'Phụ tinh · cấu trúc',
    legendAdjective: 'Sao lẻ',
    legendKy: 'Hóa Kỵ',
  },

  decadal: {
    title: 'Mười đại vận',
    running: 'đang đi',
    age: 'tuổi',
    yearPre: 'năm',
    ofTen: '/10',
  },

  palace: {
    titlePre: 'Cung',
    age: 'tuổi',
    close: 'Đóng chi tiết cung',
    majorStars: 'Chính tinh',
    minorStars: 'Phụ tinh',
    adjectiveStars: 'Sao lẻ',
    none: 'Không có',
    opposite: 'Cung xung chiếu',
    trine: 'Tam hợp',
    noData: 'không có dữ liệu',
  },

  paper: {
    barTitle: 'Luận giải lá số',
    words: 'chữ',
    exporting: '… Đang xuất',
    downloadImage: '↓ Tải ảnh',
    downloadPdf: '↓ Xuất PDF',
    docTitle: 'Lá Số Tử Vi',
    castOn: 'lá số lập ngày',
    printLabel: 'Luận giải',
  },

  chat: {
    title: 'Hỏi trên lá số này',
    subPre: 'gemini ·',
    subPost: 'cung đã nạp',
    close: 'Đóng trò chuyện',
    emptyPre: 'Hỏi bất kỳ điều gì về lá số',
    emptyOf: 'của',
    emptyPost:
      '— tính cách, sự nghiệp, tình duyên, tài chính. Mỗi câu trả lời dẫn lại cung và sao đã sinh ra nó.',
    typing: 'Đang soạn câu trả lời',
    suggestions: [
      'Tài chính năm nay',
      'Nên tránh điều gì',
      'Giải thích Hóa Kỵ',
      'Tình duyên năm nay',
      'Nghề gì phù hợp',
    ],
    placeholder: 'Hỏi về lá số của bạn…',
    inputAria: 'Câu hỏi về lá số',
    sendAria: 'Gửi câu hỏi',
    note: 'Enter gửi · Shift+Enter xuống dòng',
    errPrefix: 'Xin lỗi, có lỗi xảy ra:',
    errNetwork: 'Không thể kết nối. Vui lòng thử lại.',
  },

  api: {
    missingFields: 'Vui lòng nhập đầy đủ ngày sinh, giờ sinh và giới tính.',
    badDate: 'Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD.',
    badHour: 'Giờ sinh không hợp lệ.',
    incompleteChart: 'Lá số không đầy đủ 12 cung. Vui lòng thử lại.',
    noApiKey:
      '⚠️ Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key vào file .env.local để nhận luận giải chi tiết từ AI.\n\nLá số Tử Vi đã được tạo thành công.',
    unknownError: 'Đã xảy ra lỗi không xác định.',
    analysisErrorPrefix: 'Lỗi phân tích:',
  },
};

export default vi;

/** The catalogue shape every other locale must satisfy, exactly. */
export type Messages = typeof vi;
