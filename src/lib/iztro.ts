import { astro } from 'iztro';
import type { BirthInput, ChartData, PalaceData, StarData, DecadalPeriod } from '@/types';

// ============================================================
// DATA EXTRACTION HELPERS
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function str(val: any): string {
  if (val == null) return '';
  if (typeof val === 'function') return val();
  return String(val);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStars(stars: any[]): StarData[] {
  return (stars || []).map((star) => ({
    name: str(star.name),
    type: str(star.type),
    brightness: str(star.brightness) || undefined,
    mutagen: str(star.mutagen) || undefined,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPalaces(palaces: any[]): PalaceData[] {
  return palaces.map((p) => ({
    index: p.index as number,
    name: str(p.name),
    heavenlyStem: str(p.heavenlyStem),
    earthlyBranch: str(p.earthlyBranch),
    majorStars: extractStars(p.majorStars),
    minorStars: extractStars(p.minorStars),
    adjectiveStars: extractStars(p.adjectiveStars),
    isBodyPalace: p.isBodyPalace as boolean,
    isOriginalPalace: p.isOriginalPalace as boolean,
    changsheng12: str(p.changsheng12),
    boshi12: str(p.boshi12),
    decadalRange: p.decadal?.range ? `${p.decadal.range[0]}-${p.decadal.range[1]}` : '',
    decadalHeavenlyStem: p.decadal ? str(p.decadal.heavenlyStem) : '',
    decadalEarthlyBranch: p.decadal ? str(p.decadal.earthlyBranch) : '',
    ages: (p.ages as number[]) || [],
    suiqian12: str(p.suiqian12),
    jiangqian12: str(p.jiangqian12),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractHoroscopeItem(item: any) {
  return {
    index: item.index as number,
    name: str(item.name),
    heavenlyStem: str(item.heavenlyStem),
    earthlyBranch: str(item.earthlyBranch),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    palaceNames: (item.palaceNames || []).map((n: any) => str(n)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutagen: (item.mutagen || []).map((m: any) => str(m)),
  };
}

// ============================================================
// ĐẠI VẬN EXTRACTION
// ============================================================

function extractDecadalPeriods(
  palaces: PalaceData[],
  currentDecadalIndex: number | undefined
): DecadalPeriod[] {
  return palaces
    .filter((p) => p.decadalRange)
    .map((p) => {
      const [start, end] = p.decadalRange.split('-').map(Number);
      return {
        palaceIndex: p.index,
        palaceName: p.name,
        range: [start, end] as [number, number],
        heavenlyStem: p.decadalHeavenlyStem,
        earthlyBranch: p.decadalEarthlyBranch,
        majorStars: p.majorStars,
        minorStars: p.minorStars,
        adjectiveStars: p.adjectiveStars,
        mutagen: [],
        isCurrentDecadal: p.index === currentDecadalIndex,
      };
    })
    .sort((a, b) => a.range[0] - b.range[0]);
}

// ============================================================
// MAIN CHART GENERATION — NO TIMEZONE CONVERSION
// ============================================================

export function generateChart(input: BirthInput): {
  chart: ChartData;
  decadalPeriods: DecadalPeriod[];
} {
  // Pass date directly to iztro — no timezone conversion
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const formattedDate = `${year}-${month}-${day}`;
  const genderChar = input.gender === 'male' ? '男' : '女';

  // Map birthHour value to iztro timeIndex directly
  // values 0-11 map 1:1, value 12 (Tý 23:00-23:59) → timeIndex 12 (late Rat)
  const timeIndex = input.birthHour;

  console.log('[iztro] Input:', { date: formattedDate, timeIndex, gender: genderChar });

  const astrolabe = astro.bySolar(formattedDate, timeIndex, genderChar, true, 'vi-VN');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = astrolabe as any;

  const palaces = extractPalaces(a.palaces);

  if (palaces.length !== 12) {
    console.warn(`[iztro] Expected 12 palaces, got ${palaces.length}`);
  }
  console.log('[iztro] Palaces:', palaces.map((p) => `${p.index}:${p.name}(${p.earthlyBranch})`).join(', '));

  // Get current horoscope
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let horoscope;
  let currentDecadalIndex: number | undefined;
  try {
    const h = astrolabe.horoscope(todayStr);
    horoscope = {
      decadal: extractHoroscopeItem(h.decadal),
      yearly: extractHoroscopeItem(h.yearly),
      monthly: extractHoroscopeItem(h.monthly),
    };
    currentDecadalIndex = h.decadal.index;

    // Extract decadal mutagens for each period by iterating through ages
    // The horoscope.decadal gives current decadal mutagens
  } catch (e) {
    console.warn('[iztro] Horoscope extraction failed:', e);
  }

  const decadalPeriods = extractDecadalPeriods(palaces, currentDecadalIndex);

  // Enrich decadal periods with mutagen data from horoscope lookups
  for (const period of decadalPeriods) {
    try {
      // Use a year in the middle of this decadal range to get accurate mutagens
      const birthYear = year;
      const midAge = Math.floor((period.range[0] + period.range[1]) / 2);
      const targetYear = birthYear + midAge;
      const targetDate = `${targetYear}-6-15`;
      const h = astrolabe.horoscope(targetDate);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      period.mutagen = (h.decadal.mutagen || []).map((m: any) => str(m));
    } catch {
      // Fallback — no mutagen data for this period
    }
  }

  const chart: ChartData = {
    gender: str(a.gender),
    solarDate: str(a.solarDate),
    lunarDate: str(a.lunarDate),
    chineseDate: str(a.chineseDate),
    time: str(a.time),
    timeRange: str(a.timeRange),
    sign: str(a.sign),
    zodiac: str(a.zodiac),
    fiveElementsClass: str(a.fiveElementsClass),
    earthlyBranchOfSoulPalace: str(a.earthlyBranchOfSoulPalace),
    earthlyBranchOfBodyPalace: str(a.earthlyBranchOfBodyPalace),
    soul: str(a.soul),
    body: str(a.body),
    palaces,
    horoscope,
  };

  return { chart, decadalPeriods };
}
