import type { Locale } from './locales';

// ============================================================
// DOMAIN VOCABULARY — DESIGN.md §15.2, PLAN.md §13b.3
// ============================================================
//
// One closed table, keyed by concept, five columns. Palace names, stars,
// brightness grades, tứ hóa, stems, branches, vòng Trường Sinh and vòng Bác Sĩ
// are domain vocabulary, not interface strings, and they live here — never
// scattered through components.
//
// SOURCING. Every cell below comes from `iztro`'s own shipped locale data
// (`iztro/lib/i18n/locales/{vi-VN,zh-CN,zh-TW,ko-KR,en-US}`), which is the
// primary source PLAN.md §13b.3 names. The table is generated from that data;
// the cells that depart from it are the ones iztro has no real entry for
// (Korean and English brightness, English tứ hóa), the ones DESIGN.md §15.2
// specifies differently (English palace and star names), and four Korean and
// Traditional cells where iztro's own data is defective. Every departure is
// listed in PARITY.md §9. Nothing here was written from memory.
//
// Traditional is iztro's authored `zh-TW` column, never transformed from
// Simplified — DESIGN.md §15.7. 命宫 / 命宮 differ, and so do 廟, 祿, 遷移 and
// thirty others.

export type Domain =
  | 'palace' | 'majorStar' | 'minorStar' | 'adjectiveStar'
  | 'changsheng' | 'boshi' | 'suiqian' | 'jiangqian'
  | 'brightness' | 'mutagen' | 'stem' | 'branch'
  | 'fiveElements' | 'zodiac' | 'sign' | 'gender' | 'relation';

/** `[domain, vi, zh-Hans, zh-Hant, ko, en]` — positional to keep the table readable. */
export type VocabRow = readonly [Domain, string, string, string, string, string];

const COL: Record<Locale, 1 | 2 | 3 | 4 | 5> = {
  vi: 1, 'zh-Hans': 2, 'zh-Hant': 3, ko: 4, en: 5,
};

export const VOCABULARY: Record<string, VocabRow> = {

  // ── palace · 14 ──
  soulPalace: ['palace', "Mệnh", "命宫", "命宮", "명궁", "Life Palace"],
  bodyPalace: ['palace', "Thân", "身宫", "身宮", "신궁", "Body Palace"],
  siblingsPalace: ['palace', "Huynh Đệ", "兄弟", "兄弟", "형제", "Siblings"],
  spousePalace: ['palace', "Phu Thê", "夫妻", "夫妻", "부처", "Spouse"],
  childrenPalace: ['palace', "Tử Nữ", "子女", "子女", "자녀", "Children"],
  wealthPalace: ['palace', "Tài Bạch", "财帛", "財帛", "재백", "Wealth"],
  healthPalace: ['palace', "Tật Ách", "疾厄", "疾厄", "질액", "Health"],
  surfacePalace: ['palace', "Thiên Di", "迁移", "遷移", "천이", "Travel"],
  friendsPalace: ['palace', "Nô Bộc", "仆役", "僕役", "노복", "Friends"],
  careerPalace: ['palace', "Quan Lộc", "官禄", "官祿", "관록", "Career"],
  propertyPalace: ['palace', "Điền Trạch", "田宅", "田宅", "전택", "Property"],
  spiritPalace: ['palace', "Phúc Đức", "福德", "福德", "복덕", "Fortune"],
  parentsPalace: ['palace', "Phụ Mẫu", "父母", "父母", "부모", "Parents"],
  originalPalace: ['palace', "Lai Nhân", "来因", "來因", "내인", "Origin Palace"],

  // ── majorStar · 14 ──
  ziweiMaj: ['majorStar', "Tử Vi", "紫微", "紫微", "자미", "Zi Wei"],
  tianjiMaj: ['majorStar', "Thiên Cơ", "天机", "天機", "천기", "Tian Ji"],
  taiyangMaj: ['majorStar', "Thái Dương", "太阳", "太陽", "태양", "Tai Yang"],
  wuquMaj: ['majorStar', "Vũ Khúc", "武曲", "武曲", "무곡", "Wu Qu"],
  tiantongMaj: ['majorStar', "Thiên Đồng", "天同", "天同", "천동", "Tian Tong"],
  lianzhenMaj: ['majorStar', "Liêm Trinh", "廉贞", "廉貞", "염정", "Lian Zhen"],
  tianfuMaj: ['majorStar', "Thiên Phủ", "天府", "天府", "천부", "Tian Fu"],
  taiyinMaj: ['majorStar', "Thái Âm", "太阴", "太陰", "태음", "Tai Yin"],
  tanlangMaj: ['majorStar', "Tham Lang", "贪狼", "貪狼", "탐랑", "Tan Lang"],
  jumenMaj: ['majorStar', "Cự Môn", "巨门", "巨門", "거문", "Ju Men"],
  tianxiangMaj: ['majorStar', "Thiên Tướng", "天相", "天相", "천상", "Tian Xiang"],
  tianliangMaj: ['majorStar', "Thiên Lương", "天梁", "天梁", "천량", "Tian Liang"],
  qishaMaj: ['majorStar', "Thất Sát", "七杀", "七殺", "칠살", "Qi Sha"],
  pojunMaj: ['majorStar', "Phá Quân", "破军", "破軍", "파군", "Po Jun"],

  // ── minorStar · 14 ──
  zuofuMin: ['minorStar', "Tả Phù", "左辅", "左輔", "좌보", "Zuo Fu"],
  youbiMin: ['minorStar', "Hữu Bật", "右弼", "右弼", "우필", "You Bi"],
  wenchangMin: ['minorStar', "Văn Xương", "文昌", "文昌", "문창", "Wen Chang"],
  wenquMin: ['minorStar', "Văn Khúc", "文曲", "文曲", "문곡", "Wen Qu"],
  lucunMin: ['minorStar', "Lộc Tồn", "禄存", "祿存", "록존", "Lu Cun"],
  tianmaMin: ['minorStar', "Thiên Mã", "天马", "天馬", "천마", "Tian Ma"],
  qingyangMin: ['minorStar', "Kình Dương", "擎羊", "擎羊", "경양", "Qing Yang"],
  tuoluoMin: ['minorStar', "Đà La", "陀罗", "陀羅", "타라", "Tuo Luo"],
  huoxingMin: ['minorStar', "Hỏa Tinh", "火星", "火星", "화성", "Huo Xing"],
  lingxingMin: ['minorStar', "Linh Tinh", "铃星", "鈴星", "령성", "Ling Xing"],
  tiankuiMin: ['minorStar', "Thiên Khôi", "天魁", "天魁", "천괴", "Tian Kui"],
  tianyueMin: ['minorStar', "Thiên Việt", "天钺", "天鉞", "천월", "Tian Yue"],
  dikongMin: ['minorStar', "Địa Không", "地空", "地空", "지공", "Di Kong"],
  dijieMin: ['minorStar', "Địa Kiếp", "地劫", "地劫", "지겁", "Di Jie"],

  // ── adjectiveStar · 37 ──
  jieshaAdj: ['adjectiveStar', "Kiếp Sát", "劫杀", "劫殺", "겁살", "Jie Sha"],
  tiankong: ['adjectiveStar', "Thiên Không", "天空", "天空", "천공", "Tian Kong"],
  tianxing: ['adjectiveStar', "Thiên Hình", "天刑", "天刑", "천형", "Tian Xing"],
  tianyao: ['adjectiveStar', "Thiên Diêu", "天姚", "天姚", "천요", "Tian Yao"],
  jieshen: ['adjectiveStar', "Giải Thần", "解神", "解神", "해신", "Jie Shen"],
  yinsha: ['adjectiveStar', "Âm Sát", "阴煞", "陰煞", "음살", "Yin Sha"],
  tianxi: ['adjectiveStar', "Thiên Hỷ", "天喜", "天喜", "천희", "Tian Xi"],
  tianguan: ['adjectiveStar', "Thiên Quan", "天官", "天官", "천관", "Tian Guan"],
  tianfu: ['adjectiveStar', "Thiên Phúc", "天福", "天福", "천복", "Tian Fu"],
  tianku: ['adjectiveStar', "Thiên Khốc", "天哭", "天哭", "천곡", "Tian Ku"],
  tianxu: ['adjectiveStar', "Thiên Hư", "天虚", "天虛", "천허", "Tian Xu"],
  longchi: ['adjectiveStar', "Long Trì", "龙池", "龍池", "용지", "Long Chi"],
  fengge: ['adjectiveStar', "Phụng Các", "凤阁", "鳳閣", "봉각", "Feng Ge"],
  hongluan: ['adjectiveStar', "Hồng Loan", "红鸾", "紅鸞", "홍란", "Hong Luan"],
  guchen: ['adjectiveStar', "Cô Thần", "孤辰", "孤辰", "고진", "Gu Chen"],
  guasu: ['adjectiveStar', "Quả Tú", "寡宿", "寡宿", "과숙", "Gua Su"],
  feilian: ['adjectiveStar', "Phi Liêm", "蜚廉", "蜚廉", "비렴", "Fei Lian"],
  posui: ['adjectiveStar', "Phá Toái", "破碎", "破碎", "파쇄", "Po Sui"],
  taifu: ['adjectiveStar', "Đài Phụ", "台辅", "台輔", "태보", "Tai Fu"],
  fenggao: ['adjectiveStar', "Phong Cáo", "封诰", "封誥", "봉고", "Feng Gao"],
  tianwu: ['adjectiveStar', "Thiên Vu", "天巫", "天巫", "천무", "Tian Wu"],
  tianyue: ['adjectiveStar', "Thiên Nguyệt", "天月", "天月", "천월", "Tian Yue"],
  santai: ['adjectiveStar', "Tam Thai", "三台", "三台", "삼태", "San Tai"],
  bazuo: ['adjectiveStar', "Bát Tọa", "八座", "八座", "팔좌", "Ba Zuo"],
  engguang: ['adjectiveStar', "Ân Quang", "恩光", "恩光", "은광", "En Guang"],
  tiangui: ['adjectiveStar', "Thiên Quý", "天贵", "天貴", "천귀", "Tian Gui"],
  tiancai: ['adjectiveStar', "Thiên Tài", "天才", "天才", "천재", "Tian Cai"],
  tianshou: ['adjectiveStar', "Thiên Thọ", "天寿", "天壽", "천수", "Tian Shou"],
  jiekong: ['adjectiveStar', "Triệt Không", "截空", "截空", "절공", "Jie Kong"],
  xunzhong: ['adjectiveStar', "Tuần Trung", "旬中", "旬中", "순중", "Xun Zhong"],
  xunkong: ['adjectiveStar', "Tuần Không", "旬空", "旬空", "순공", "Xun Kong"],
  kongwang: ['adjectiveStar', "Không Vong", "空亡", "空亡", "공망", "Kong Wang"],
  jielu: ['adjectiveStar', "Triệt Lộ", "截路", "截路", "절로", "Jie Lu"],
  yuede: ['adjectiveStar', "Nguyệt Đức", "月德", "月德", "월덕", "Yue De"],
  tianshang: ['adjectiveStar', "Thiên Thương", "天伤", "天傷", "천상", "Tian Shang"],
  tianshi: ['adjectiveStar', "Thiên Sứ", "天使", "天使", "천사", "Tian Shi"],
  tianchu: ['adjectiveStar', "Thiên Trù", "天厨", "天廚", "천주", "Tian Chu"],

  // ── changsheng · 12 ──
  changsheng: ['changsheng', "Trường Sinh", "长生", "長生", "장생", "Birth"],
  muyu: ['changsheng', "Mục Dục", "沐浴", "沐浴", "목욕", "Infancy"],
  guandai: ['changsheng', "Quan Đới", "冠带", "冠帶", "관대", "Adolescence"],
  linguan: ['changsheng', "Lâm Quan", "临官", "臨官", "임관", "Adulthood"],
  diwang: ['changsheng', "Đế Vượng", "帝旺", "帝旺", "제왕", "Prime"],
  shuai: ['changsheng', "Suy", "衰", "衰", "쇠", "Decline"],
  bing: ['changsheng', "Bệnh", "病", "病", "병", "Illness"],
  si: ['changsheng', "Tử", "死", "死", "사", "Death"],
  mu: ['changsheng', "Mộ", "墓", "墓", "묘", "Burial"],
  jue: ['changsheng', "Tuyệt", "绝", "絕", "절", "Extinction"],
  tai: ['changsheng', "Thai", "胎", "胎", "태", "Conception"],
  yang: ['changsheng', "Dưỡng", "养", "養", "양", "Nurture"],

  // ── boshi · 12 ──
  boshi: ['boshi', "Bác Sỹ", "博士", "博士", "박사", "Bo Shi"],
  lishi: ['boshi', "Lực Sỹ", "力士", "力士", "역사", "Li Shi"],
  qinglong: ['boshi', "Thanh Long", "青龙", "青龍", "청룡", "Qing Long"],
  xiaohao: ['boshi', "Tiểu Hao", "小耗", "小耗", "소모", "Xiao Hao"],
  jiangjun: ['boshi', "Tướng Quân", "将军", "將軍", "장군", "Jiang Jun"],
  zhoushu: ['boshi', "Tấu Thư", "奏书", "奏書", "주서", "Zou Shu"],
  faylian: ['boshi', "Phi Liêm", "飞廉", "飛廉", "비렴", "Fei Lian"],
  xishen: ['boshi', "Hỷ Thần", "喜神", "喜神", "희신", "Xi Shen"],
  bingfu: ['boshi', "Bệnh Phù", "病符", "病符", "병부", "Bing Fu"],
  dahao: ['boshi', "Đại Hao", "大耗", "大耗", "대모", "Da Hao"],
  fubing: ['boshi', "Phục Binh", "伏兵", "伏兵", "복병", "Fu Bing"],
  guanfu: ['boshi', "Quan Phủ", "官府", "官府", "관부", "Guan Fu"],

  // ── suiqian · 10 ──
  suijian: ['suiqian', "Tuế Kiện", "岁建", "歲建", "태세", "Sui Jian"],
  huiqi: ['suiqian', "Hối Khí", "晦气", "晦氣", "회기", "Hui Qi"],
  sangmen: ['suiqian', "Tang Môn", "丧门", "喪門", "상문", "Sang Men"],
  guansuo: ['suiqian', "Quán Tác", "贯索", "貫索", "관색", "Guan Suo"],
  gwanfu: ['suiqian', "Quan Phù", "官符", "官符", "관부", "Guan Fu"],
  longde: ['suiqian', "Long Đức", "龙德", "龍德", "용덕", "Long De"],
  baihu: ['suiqian', "Bạch Hổ", "白虎", "白虎", "백호", "Bai Hu"],
  tiande: ['suiqian', "Thiên Đức", "天德", "天德", "천덕", "Tian De"],
  diaoke: ['suiqian', "Điếu Khách", "吊客", "弔客", "조객", "Diao Ke"],
  suipo: ['suiqian', "Tuế Phá", "岁破", "歲破", "세파", "Sui Po"],

  // ── jiangqian · 12 ──
  jiangxing: ['jiangqian', "Tướng Tinh", "将星", "將星", "장성", "Jiang Xing"],
  panan: ['jiangqian', "Phan Án", "攀鞍", "攀鞍", "반안", "Pan An"],
  suiyi: ['jiangqian', "Tuế Dịch", "岁驿", "歲驛", "세역", "Sui Yi"],
  xiishen: ['jiangqian', "Tức Thần", "息神", "息神", "식신", "Xi Shen"],
  huagai: ['jiangqian', "Hoa Cái", "华盖", "華蓋", "화개", "Hua Gai"],
  jiesha: ['jiangqian', "Kiếp Sát", "劫煞", "劫煞", "겁살", "Jie Sha"],
  zhaisha: ['jiangqian', "Tai Sát", "灾煞", "災煞", "재살", "Zai Sha"],
  tiansha: ['jiangqian', "Thiên Sát", "天煞", "天煞", "천살", "Tian Sha"],
  zhibei: ['jiangqian', "Chỉ Bối", "指背", "指背", "지배", "Zhi Bei"],
  xianchi: ['jiangqian', "Hàm Trì", "咸池", "咸池", "함지", "Xian Chi"],
  yuesha: ['jiangqian', "Nguyệt Sát", "月煞", "月煞", "월살", "Yue Sha"],
  wangshen: ['jiangqian', "Vong Thần", "亡神", "亡神", "망신", "Wang Shen"],

  // ── brightness · 7 ──
  miao: ['brightness', "Miếu", "庙", "廟", "묘", "exalted"],
  wang: ['brightness', "Vượng", "旺", "旺", "왕", "prosperous"],
  de: ['brightness', "Đắc", "得", "得", "득", "gained"],
  li: ['brightness', "Lợi", "利", "利", "이", "benefited"],
  ping: ['brightness', "Bình", "平", "平", "평", "even"],
  bu: ['brightness', "Bất", "不", "不", "불", "weakened"],
  xian: ['brightness', "Hạn", "陷", "陷", "함", "fallen"],

  // ── mutagen · 4 ──
  sihuaLu: ['mutagen', "Lộc", "禄", "祿", "록", "Prosperity"],
  sihuaQuan: ['mutagen', "Quyền", "权", "權", "권", "Authority"],
  sihuaKe: ['mutagen', "Khoa", "科", "科", "과", "Merit"],
  sihuaJi: ['mutagen', "Kỵ", "忌", "忌", "기", "Adversity"],

  // ── stem · 10 ──
  jiaHeavenly: ['stem', "Giáp", "甲", "甲", "갑", "Jia"],
  yiHeavenly: ['stem', "Ất", "乙", "乙", "을", "Yi"],
  bingHeavenly: ['stem', "Bính", "丙", "丙", "병", "Bing"],
  dingHeavenly: ['stem', "Đinh", "丁", "丁", "정", "Ding"],
  wuHeavenly: ['stem', "Mậu", "戊", "戊", "무", "Wu"],
  jiHeavenly: ['stem', "Kỷ", "己", "己", "기", "Ji"],
  gengHeavenly: ['stem', "Canh", "庚", "庚", "경", "Geng"],
  xinHeavenly: ['stem', "Tân", "辛", "辛", "신", "Xin"],
  renHeavenly: ['stem', "Nhâm", "壬", "壬", "임", "Ren"],
  guiHeavenly: ['stem', "Quý", "癸", "癸", "계", "Gui"],

  // ── branch · 12 ──
  ziEarthly: ['branch', "Tý", "子", "子", "자", "Zi"],
  chouEarthly: ['branch', "Sửu", "丑", "丑", "축", "Chou"],
  yinEarthly: ['branch', "Dần", "寅", "寅", "인", "Yin"],
  maoEarthly: ['branch', "Mão", "卯", "卯", "묘", "Mao"],
  chenEarthly: ['branch', "Thìn", "辰", "辰", "진", "Chen"],
  siEarthly: ['branch', "Tỵ", "巳", "巳", "사", "Si"],
  wuEarthly: ['branch', "Ngọ", "午", "午", "오", "Wu"],
  weiEarthly: ['branch', "Mùi", "未", "未", "미", "Wei"],
  shenEarthly: ['branch', "Thân", "申", "申", "신", "Shen"],
  youEarthly: ['branch', "Dậu", "酉", "酉", "유", "You"],
  xuEarthly: ['branch', "Tuất", "戌", "戌", "술", "Xu"],
  haiEarthly: ['branch', "Hợi", "亥", "亥", "해", "Hai"],

  // ── fiveElements · 5 ──
  water2nd: ['fiveElements', "Thủy Nhị Cục", "水二局", "水二局", "수이국", "Water 2"],
  wood3rd: ['fiveElements', "Mộc Tam Cục", "木三局", "木三局", "목삼국", "Wood 3"],
  metal4th: ['fiveElements', "Kim Tứ Cục", "金四局", "金四局", "금사국", "Metal 4"],
  earth5th: ['fiveElements', "Thổ Ngũ Cục", "土五局", "土五局", "토오국", "Earth 5"],
  fire6th: ['fiveElements', "Hỏa Lục Cục", "火六局", "火六局", "화육국", "Fire 6"],

  // ── zodiac · 12 ──
  rat: ['zodiac', "Chuột", "鼠", "鼠", "쥐", "rat"],
  ox: ['zodiac', "Trâu", "牛", "牛", "소", "ox"],
  tiger: ['zodiac', "Hổ", "虎", "虎", "호랑이", "tiger"],
  rabbit: ['zodiac', "Mèo", "兔", "兔", "토끼", "rabbit"],
  dragon: ['zodiac', "Rồng", "龙", "龍", "용", "dragon"],
  snake: ['zodiac', "Rắn", "蛇", "蛇", "뱀", "snake"],
  horse: ['zodiac', "Ngựa", "马", "馬", "말", "horse"],
  sheep: ['zodiac', "Dê", "羊", "羊", "양", "sheep"],
  monkey: ['zodiac', "Khỉ", "猴", "猴", "원숭이", "monkey"],
  rooster: ['zodiac', "Gà", "鸡", "雞", "닭", "rooster"],
  dog: ['zodiac', "Chó", "狗", "狗", "개", "dog"],
  pig: ['zodiac', "Lợn", "猪", "豬", "돼지", "pig"],

  // ── sign · 12 ──
  aries: ['sign', "Cung Bạch Dương", "白羊座", "白羊座", "백양궁", "aries"],
  taurus: ['sign', "Cung Kim Ngưu", "金牛座", "金牛座", "금우궁", "taurus"],
  gemini: ['sign', "Cung Song Tử", "双子座", "雙子座", "쌍아궁", "gemini"],
  cancer: ['sign', "Cung Cự Giải", "巨蟹座", "巨蟹座", "거해궁", "cancer"],
  leo: ['sign', "Cung Sư Tử", "狮子座", "獅子座", "사자궁", "leo"],
  virgo: ['sign', "Cung Xử Nữ", "处女座", "處女座", "처녀궁", "virgo"],
  libra: ['sign', "Cung Thiên Bình", "天秤座", "天秤座", "천칭궁", "libra"],
  scorpio: ['sign', "Cung Thiên Yết", "天蝎座", "天蠍座", "천갈궁", "scorpio"],
  sagittarius: ['sign', "Cung Xạ Thủ", "射手座", "射手座", "인마궁", "sagittarius"],
  capricorn: ['sign', "Cung Ma Kết", "摩羯座", "摩羯座", "마갈궁", "capricorn"],
  aquarius: ['sign', "Cung Thủy Bình", "水瓶座", "水瓶座", "보병궁", "aquarius"],
  pisces: ['sign', "Cung Song Ngư", "双鱼座", "雙魚座", "쌍어궁", "pisces"],
  // ── gender · 6 ──
  // iztro's astrolabe reports the bare form; the reference chart carries the
  // âm/dương form, so both resolve.
  male: ['gender', 'Nam', '男', '男', '남성', 'Male'],
  female: ['gender', 'Nữ', '女', '女', '여자', 'Female'],
  yangMale: ['gender', 'Dương Nam', '阳男', '陽男', '양남', 'Yang Male'],
  yinMale: ['gender', 'Âm Nam', '阴男', '陰男', '음남', 'Yin Male'],
  yangFemale: ['gender', 'Dương Nữ', '阳女', '陽女', '양녀', 'Yang Female'],
  yinFemale: ['gender', 'Âm Nữ', '阴女', '陰女', '음녀', 'Yin Female'],

  // ── relation · 4, plus one star iztro omits ──
  // The concepts PLAN.md §13b.3 names that iztro carries no entry for.
  // Authored; listed in PARITY.md §9.
  voChinhDieu: ['relation', 'vô chính diệu', '无正曜', '無正曜', '무정요', 'no major star'],
  muon: ['relation', 'mượn', '借', '借', '차용', 'borrowed'],
  tamHop: ['relation', 'tam hợp', '三合', '三合', '삼합', 'trine'],
  xungChieu: ['relation', 'xung chiếu', '冲照', '沖照', '충조', 'opposition'],
  // 桃花 is on the reference chart but absent from iztro's star table.
  daoHoa: ['adjectiveStar', 'Đào Hoa', '桃花', '桃花', '도화', 'Tao Hua'],
};

// ── Aliases ──────────────────────────────────────────────────────────────────
// Spellings the app renders that differ from iztro's own Vietnamese column.
// Each points at the concept it is the same term as; none introduces a concept.
const ALIASES: Record<string, string> = {
  'mộc dục': 'muyu',          // iztro: "Mục Dục"
  'lực sĩ': 'lishi',          // iztro: "Lực Sỹ"
  'bác sĩ': 'boshi',          // iztro: "Bác Sỹ"
  'phượng các': 'fengge',     // iztro: "Phụng Các"
  'hãm': 'xian',              // iztro: "Hạn" — the chart legend uses hãm
  'tử tức': 'childrenPalace', // iztro: "Tử Nữ"
};

/** Lookup key: case-folded, with the sign column's "Cung " prefix dropped. */
function fold(value: string): string {
  return value.trim().toLowerCase().replace(/^cung\s+/, '');
}

const INDEX = new Map<string, VocabRow>();
const BY_DOMAIN = new Map<string, VocabRow>();

for (const row of Object.values(VOCABULARY)) {
  const key = fold(row[1]);
  // First writer wins, so the three genuine Vietnamese collisions
  // (Thân, Kiếp Sát, Phi Liêm) resolve to their first-listed sense unless a
  // caller passes the domain — which every call site that can, does.
  if (!INDEX.has(key)) INDEX.set(key, row);
  const scoped = `${row[0]} ${key}`;
  if (!BY_DOMAIN.has(scoped)) BY_DOMAIN.set(scoped, row);
}
for (const [alias, concept] of Object.entries(ALIASES)) {
  const row = VOCABULARY[concept];
  if (!row) continue;
  INDEX.set(alias, row);
  BY_DOMAIN.set(`${row[0]} ${alias}`, row);
}

/**
 * A Vietnamese domain term in the reader's locale.
 *
 * The chart is always generated in `vi-VN` — see `src/lib/iztro.ts` — so the
 * Vietnamese column is the join key and `term(x, 'vi')` is the identity. That
 * is deliberate: it is what keeps the Vietnamese parity screens bit-identical
 * through this phase, and it means switching locale never regenerates a chart.
 *
 * A term with no row is returned unchanged. `tests/parity/locale.spec.ts`
 * sweeps the rendered DOM for Vietnamese diacritics in every non-`vi` locale,
 * so a missing row is a test failure rather than a silent leak.
 */
export function term(value: string | undefined | null, locale: Locale, domain?: Domain): string {
  if (!value) return '';
  if (locale === 'vi') return value;
  const key = fold(value);
  const row = (domain && BY_DOMAIN.get(`${domain} ${key}`)) || INDEX.get(key);
  return row ? row[COL[locale]] : value;
}

/** Every term in a list, e.g. the stars of one palace. */
export function terms(values: readonly string[], locale: Locale, domain?: Domain): string[] {
  return values.map((v) => term(v, locale, domain));
}

/** The concept keys in one domain — used by the completeness test. */
export function conceptsIn(domain: Domain): string[] {
  return Object.keys(VOCABULARY).filter((k) => VOCABULARY[k][0] === domain);
}
