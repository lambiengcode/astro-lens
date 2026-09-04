export interface BirthInput {
  name?: string;
  solarDate: string; // YYYY-MM-DD
  birthHour: number; // 0-12 from BIRTH_HOURS
  gender: 'male' | 'female';
  location?: string;
  selfDescription?: string; // User's self-description for cross-reference
}

// ── Bazi / Four Pillars (Tứ Trụ / Bát Tự) ──────────────────────────────────
export interface BaziPillar {
  chinese: string;    // e.g. "乙亥"
  element: string;    // Stem element e.g. "WOOD"
  animal: string;     // e.g. "Pig"
  branchElement: string; // Branch element e.g. "WATER"
}

export interface BaziInteraction {
  type: string;           // e.g. "StemClash", "BranchClash", "BranchPunishment"
  participants: string[]; // e.g. ["Month(壬)", "Day(丙)"]
  result?: string;        // e.g. potential element
}

export interface BaziLuckPillar {
  chinese: string;
  element: string;
  startAge: number;
}

export interface BaziData {
  pillarsString: string;       // e.g. "乙亥年 壬午月 丙子日 甲午時"
  yearPillar: BaziPillar;
  monthPillar: BaziPillar;
  dayPillar: BaziPillar;
  hourPillar: BaziPillar;
  dayMaster: { stem: string; element: string; nature: string };  // e.g. { stem: "丙", element: "FIRE", nature: "Yang" }
  dayMasterStrength: { strength: string; score: number };        // e.g. { strength: "Strong", score: 52.5 }
  fiveElements: Record<string, number>;    // e.g. { WOOD: 37, FIRE: 31, ... }
  favorableElements: string[];             // e.g. ["EARTH", "METAL", "WATER"]
  unfavorableElements: string[];           // e.g. ["WOOD", "FIRE"]
  nobleman: string[];                      // 貴人 branches
  peachBlossom: string;                    // 桃花 branch
  skyHorse: string;                        // 天馬 branch
  intelligence: string;                    // 文昌 branch
  interactions: BaziInteraction[];         // Clashes, combos, punishments
  luckPillars: BaziLuckPillar[];           // 10-year luck pillars
  luckDirection: number;                   // 1 = forward, -1 = backward
  luckStartAge: number | null;             // Age when first luck pillar starts
}

export interface PalaceData {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: StarData[];
  minorStars: StarData[];
  adjectiveStars: StarData[];
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  changsheng12: string;
  boshi12: string;
  decadalRange: string;
  decadalHeavenlyStem: string;
  decadalEarthlyBranch: string;
  ages: number[];
  suiqian12: string;
  jiangqian12: string;
}

export interface StarData {
  name: string;
  type: string;
  brightness?: string;
  mutagen?: string;
}

export interface ChartData {
  gender: string;
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  fiveElementsClass: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  soul: string;
  body: string;
  palaces: PalaceData[];
  horoscope?: HoroscopeData;
  bazi?: BaziData;
}

export interface HoroscopeData {
  decadal: HoroscopeItem;
  yearly: HoroscopeItem;
  monthly: HoroscopeItem;
}

export interface HoroscopeItem {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
}

export interface DecadalPeriod {
  palaceIndex: number;
  palaceName: string;
  range: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: StarData[];
  minorStars: StarData[];
  adjectiveStars: StarData[];
  mutagen: string[];
  isCurrentDecadal: boolean;
}

export interface AnalysisResult {
  chart: ChartData;
  interpretation: string;
  decadalPeriods: DecadalPeriod[];
}

// Candidate for unknown-birth-hour flow
export interface RectificationCandidate {
  timeIndex: number;
  /** The địa chi of the hour. Vocabulary — rendered through `term()`. */
  hourBranch: string;
  hourRange: string;
  menhEarthlyBranch: string;  // which earthly branch Mệnh lands on
  menhMajorStars: string[];   // major star names in Mệnh cung
  fiveElementsClass: string;
  soul: string;               // Mệnh chủ
}

export interface AnalyzeRequest {
  /** Reader's locale. Decides the reading's language — DESIGN.md §15.5. */
  locale?: string;
  input: BirthInput;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// ============================================================
// BIRTH HOURS — split Giờ Tý into two distinct options
// ============================================================
export const BIRTH_HOURS = [
  { value: 0 , branch: 'Tý',   range: '00:00–00:59' },
  { value: 1 , branch: 'Sửu',  range: '01:00–02:59' },
  { value: 2 , branch: 'Dần',  range: '03:00–04:59' },
  { value: 3 , branch: 'Mão',  range: '05:00–06:59' },
  { value: 4 , branch: 'Thìn', range: '07:00–08:59' },
  { value: 5 , branch: 'Tỵ',   range: '09:00–10:59' },
  { value: 6 , branch: 'Ngọ',  range: '11:00–12:59' },
  { value: 7 , branch: 'Mùi',  range: '13:00–14:59' },
  { value: 8 , branch: 'Thân', range: '15:00–16:59' },
  { value: 9 , branch: 'Dậu',  range: '17:00–18:59' },
  { value: 10, branch: 'Tuất', range: '19:00–20:59' },
  { value: 11, branch: 'Hợi',  range: '21:00–22:59' },
  { value: 12, branch: 'Tý',   range: '23:00–23:59' },
];
