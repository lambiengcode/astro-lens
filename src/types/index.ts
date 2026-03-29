export interface BirthInput {
  name?: string;
  solarDate: string; // YYYY-MM-DD
  birthHour: number; // 0-12 from BIRTH_HOURS
  gender: 'male' | 'female';
  location?: string;
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
  hourLabel: string;
  hourRange: string;
  menhEarthlyBranch: string;  // which earthly branch Mệnh lands on
  menhMajorStars: string[];   // major star names in Mệnh cung
  fiveElementsClass: string;
  soul: string;               // Mệnh chủ
}

export interface AnalyzeRequest {
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
  { value: 0,  label: 'Tý (00:00 – 00:59)',  range: '00:00–00:59' },
  { value: 1,  label: 'Sửu (01:00 – 02:59)', range: '01:00–02:59' },
  { value: 2,  label: 'Dần (03:00 – 04:59)',  range: '03:00–04:59' },
  { value: 3,  label: 'Mão (05:00 – 06:59)',  range: '05:00–06:59' },
  { value: 4,  label: 'Thìn (07:00 – 08:59)', range: '07:00–08:59' },
  { value: 5,  label: 'Tỵ (09:00 – 10:59)',   range: '09:00–10:59' },
  { value: 6,  label: 'Ngọ (11:00 – 12:59)',  range: '11:00–12:59' },
  { value: 7,  label: 'Mùi (13:00 – 14:59)',  range: '13:00–14:59' },
  { value: 8,  label: 'Thân (15:00 – 16:59)', range: '15:00–16:59' },
  { value: 9,  label: 'Dậu (17:00 – 18:59)',  range: '17:00–18:59' },
  { value: 10, label: 'Tuất (19:00 – 20:59)', range: '19:00–20:59' },
  { value: 11, label: 'Hợi (21:00 – 22:59)',  range: '21:00–22:59' },
  { value: 12, label: 'Tý (23:00 – 23:59)',   range: '23:00–23:59' },
];
