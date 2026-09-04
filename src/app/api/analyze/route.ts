import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/iztro';
import { analyzeChart } from '@/lib/gemini';
import type { AnalyzeRequest, AnalyzeResponse } from '@/types';
import { getMessages } from '@/lib/i18n/messages';
import { LOCALE_HEADER, normalizeLocale } from '@/lib/i18n/locales';

// Simple in-memory cache
const cache = new Map<string, { data: AnalyzeResponse['data']; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// The reading is produced in the reader's language, so two locales are two
// different results for the same birth data — the locale belongs in the key.
function getCacheKey(input: AnalyzeRequest['input'], locale: string): string {
  return `${locale}:${input.solarDate}-${input.birthHour}-${input.gender}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { input } = body;
    // The body wins over the header so a client can ask for a locale
    // explicitly; the header is what the proxy resolved for this request.
    const locale = normalizeLocale(body.locale ?? request.headers.get(LOCALE_HEADER));
    const t = getMessages(locale);

    if (!input.solarDate || input.birthHour === undefined || !input.gender) {
      return NextResponse.json(
        { success: false, error: t.api.missingFields },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.solarDate)) {
      return NextResponse.json(
        { success: false, error: t.api.badDate },
        { status: 400 }
      );
    }

    if (input.birthHour < 0 || input.birthHour > 12) {
      return NextResponse.json(
        { success: false, error: t.api.badHour },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(input, locale);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    console.log('[API /analyze] Input:', { solarDate: input.solarDate, birthHour: input.birthHour, gender: input.gender });

    // Generate chart + decadal periods
    const { chart, decadalPeriods } = generateChart(input);

    if (!chart.palaces || chart.palaces.length !== 12) {
      console.error('[API /analyze] Chart has', chart.palaces?.length, 'palaces');
      return NextResponse.json(
        { success: false, error: t.api.incompleteChart },
        { status: 500 }
      );
    }

    console.log('[API /analyze] Chart OK:', { palaces: chart.palaces.length, decadals: decadalPeriods.length });

    let interpretation: string;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      interpretation = t.api.noApiKey;
    } else {
      interpretation = await analyzeChart(chart, locale, input.name, input.selfDescription);
    }

    const data = { chart, interpretation, decadalPeriods };

    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Analysis error:', error);
    const t = getMessages(normalizeLocale(request.headers.get(LOCALE_HEADER)));
    const message = error instanceof Error ? error.message : t.api.unknownError;
    return NextResponse.json(
      { success: false, error: `${t.api.analysisErrorPrefix} ${message}` },
      { status: 500 }
    );
  }
}
