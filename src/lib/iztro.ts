import { astro } from 'iztro';
import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind';
import { toDate } from 'date-fns-tz';
import type { BirthInput, ChartData, PalaceData, StarData, DecadalPeriod, BaziData } from '@/types';

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
// BAZI (TỨ TRỤ) EXTRACTION — via @aharris02/bazi-calculator-by-alvamind
// ============================================================

const BIRTH_HOUR_TO_HOUR: Record<number, number> = {
  0: 0, 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11,
  7: 13, 8: 15, 9: 17, 10: 19, 11: 21, 12: 23,
};

function extractBazi(input: BirthInput): BaziData | undefined {
  try {
    const [year, month, day] = input.solarDate.split('-').map(Number);
    const hour = BIRTH_HOUR_TO_HOUR[input.birthHour] ?? 12;
    const tz = 'Asia/Ho_Chi_Minh';

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`;
    const birthDate = toDate(dateStr, { timeZone: tz });

    const gender = input.gender === 'male' ? 'male' : 'female';
    const calc = new BaziCalculator(birthDate, gender, tz, true);
    const analysis = calc.getCompleteAnalysis();
    if (!analysis) return undefined;

    const mp = analysis.mainPillars;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsePillar = (p: any): import('@/types').BaziPillar => ({
      chinese: p?.chinese || '',
      element: p?.element || '',
      animal: p?.animal || '',
      branchElement: p?.branch?.element || '',
    });

    const ba = analysis.basicAnalysis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interactions = Object.values(analysis.interactions || {}).map((item: any) => ({
      type: item.type || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participants: (item.participants || []).map((p: any) => `${p.pillar}(${p.elementChar})`),
      result: item.potentialResultElement || undefined,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const luckPillars = (analysis.luckPillars?.pillars || []).map((lp: any) => ({
      chinese: `${lp?.heavenlyStem?.character || ''}${lp?.earthlyBranch?.character || ''}`,
      element: lp?.heavenlyStem?.elementType || '',
      startAge: lp?.ageStart ?? 0,
    }));

    return {
      pillarsString: calc.toString(),
      yearPillar: parsePillar(mp.year),
      monthPillar: parsePillar(mp.month),
      dayPillar: parsePillar(mp.day),
      hourPillar: parsePillar(mp.time),
      dayMaster: {
        stem: ba?.dayMaster?.stem || '',
        element: ba?.dayMaster?.element || '',
        nature: ba?.dayMaster?.nature || '',
      },
      dayMasterStrength: {
        strength: ba?.dayMasterStrength?.strength || '',
        score: ba?.dayMasterStrength?.score ?? 0,
      },
      fiveElements: { ...(ba?.fiveFactors || {}) } as Record<string, number>,
      favorableElements: ba?.favorableElements?.primary || [],
      unfavorableElements: ba?.favorableElements?.unfavorable || [],
      nobleman: ba?.nobleman || [],
      peachBlossom: ba?.peachBlossom || '',
      skyHorse: ba?.skyHorse || '',
      intelligence: ba?.intelligence || '',
      interactions,
      luckPillars,
      luckDirection: analysis.luckPillars?.incrementRule ?? 1,
      luckStartAge: analysis.luckPillars?.startAgeYears ?? null,
    };
  } catch (e) {
    console.warn('[Bazi] Extraction failed:', e);
    return undefined;
  }
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

  const bazi = extractBazi(input);

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
    bazi,
  };

  return { chart, decadalPeriods };
}
