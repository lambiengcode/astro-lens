import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/iztro';
import { analyzeChart, analyzeHighlights } from '@/lib/gemini';
import type { AnalyzeRequest, AnalyzeResponse, InterpretationHighlights } from '@/types';
import { INTERPRETATION_CATEGORIES } from '@/types';

const FALLBACK_HIGHLIGHTS: InterpretationHighlights = {
  strength: 'Cần cấu hình GEMINI_API_KEY để nhận điểm mạnh cá nhân hóa.',
  caution: 'Cần cấu hình GEMINI_API_KEY để nhận lưu ý cá nhân hóa.',
  favorablePeriod: 'Cần cấu hình GEMINI_API_KEY để nhận thời điểm thuận lợi cá nhân hóa.',
  categoryInsights: Object.fromEntries(
    INTERPRETATION_CATEGORIES.map((category) => [category, 'Chưa có insight — vui lòng cấu hình GEMINI_API_KEY.'])
  ) as InterpretationHighlights['categoryInsights'],
};

// Simple in-memory cache
const cache = new Map<string, { data: AnalyzeResponse['data']; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(input: AnalyzeRequest['input']): string {
  return `${input.solarDate}-${input.birthHour}-${input.gender}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { input } = body;

    if (!input.solarDate || input.birthHour === undefined || !input.gender) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ ngày sinh, giờ sinh và giới tính.' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.solarDate)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    if (input.birthHour < 0 || input.birthHour > 12) {
      return NextResponse.json(
        { success: false, error: 'Giờ sinh không hợp lệ.' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(input);
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
        { success: false, error: 'Lá số không đầy đủ 12 cung. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    console.log('[API /analyze] Chart OK:', { palaces: chart.palaces.length, decadals: decadalPeriods.length });

    let interpretation: string;
    let highlights: InterpretationHighlights;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      interpretation = '⚠️ Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key vào file .env.local để nhận luận giải chi tiết từ AI.\n\nLá số Tử Vi đã được tạo thành công.';
      highlights = FALLBACK_HIGHLIGHTS;
    } else {
      [interpretation, highlights] = await Promise.all([
        analyzeChart(chart, input.name, input.selfDescription),
        analyzeHighlights(chart, input.name),
      ]);
    }

    const data = { chart, interpretation, highlights, decadalPeriods };

    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
    return NextResponse.json(
      { success: false, error: `Lỗi phân tích: ${message}` },
      { status: 500 }
    );
  }
}
