// ============================================================
// PROMPT PACKS — PLAN.md §13b.4, DESIGN.md §15.5
// ============================================================
//
// "A Korean interface wrapped around a Vietnamese reading is not Korean
// support." Everything the model is told, and everything it is told to say,
// is per locale: the instruction language, the output language, the section
// headings it emits, and the labels on the chart data it is handed.
//
// The chart *values* handed to the model are put through
// `vocabulary.term(…, locale)` by `buildDataContext`, so a Korean reading is
// reasoning over 자미 and 명궁, never over Tử Vi and Mệnh.

export interface DataLabels {
  now: string;
  timezoneNote: string;
  basics: string;
  name: string;
  gender: string;
  notGiven: string;
  solar: string;
  lunar: string;
  canChi: string;
  birthHour: string;
  sign: string;
  zodiac: string;
  fiveElements: string;
  soul: string;
  body: string;
  soulPalaceAt: string;
  bodyPalaceAt: string;
  twelvePalaces: string;
  bodyPalaceMark: string;
  canChiOf: string;
  changsheng: string;
  decadal: string;
  majorStars: string;
  minorStars: string;
  adjectiveStars: string;
  empty: string;
  none: string;
  horoscopeHead: string;
  decadalRow: string;
  yearlyRow: string;
  monthlyRow: string;
  mutagen: string;
  baziHead: string;
  /** Stated when the chart carries no Bazi — silence is what got filled in. */
  baziAbsent: string;
  baziPillars: string;
  baziYear: string;
  baziMonth: string;
  baziDay: string;
  baziHour: string;
  baziDayMasterMark: string;
  baziBranch: string;
  baziDayMaster: string;
  baziStrength: string;
  baziScore: string;
  baziFiveElements: string;
  baziFavorable: string;
  baziUnfavorable: string;
  baziUndetermined: string;
  baziNobleman: string;
  baziPeachBlossom: string;
  baziSkyHorse: string;
  baziIntelligence: string;
  baziInteractions: string;
  baziLuck: string;
  baziForward: string;
  baziBackward: string;
  baziStartAt: string;
  selfHead: string;
  /** Five-element names as the Bazi library emits them, per locale. */
  elements: Record<'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER', string>;
}

export interface PromptPack {
  /** Layer 1 — the methodology. Bundled into the per-locale context cache. */
  system: string;
  /** The user turn stored alongside the PDF in the cache. */
  cacheSeed: string;
  /** Layer 3 — chained reasoning, self-check, and the output template. */
  task: string;
  /** The chat route's own system instruction. */
  chat: string;
  /** Layer 2 field labels. */
  labels: DataLabels;
}
