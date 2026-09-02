import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { encode as encodeToon } from '@toon-format/toon';
import type { ChartData, StarData } from '@/types';
import { getCachedContentName } from '@/lib/gemini-cache';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ChatRequest {
  message: string;
  chart: ChartData;
  history: { role: 'user' | 'ai'; content: string }[];
  name?: string;
}

function formatStars(stars: StarData[], includeBrightness: boolean): string {
  return stars
    .map((s) => {
      let str = s.name;
      if (includeBrightness && s.brightness) str += `(${s.brightness})`;
      if (s.mutagen) str += `[${s.mutagen}]`;
      return str;
    })
    .join(' · ');
}

function buildChartContext(chart: ChartData, name?: string): string {
  const now = new Date();
  const currentDateTime = now.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });

  const data: Record<string, unknown> = {
    thoiGianHienTai: `${currentDateTime} (GMT+7 — Việt Nam)`,
    thongTinLaSo: {
      ten: name || '(không cung cấp)',
      gioiTinh: chart.gender,
      duongLich: chart.solarDate,
      amLich: chart.lunarDate,
      canChi: chart.chineseDate,
      gioSinh: chart.time,
      khoangGio: chart.timeRange,
      conGiap: chart.zodiac,
      nguHanhCuc: chart.fiveElementsClass,
      menhChu: chart.soul,
      thanChu: chart.body,
      cungMenhTai: chart.earthlyBranchOfSoulPalace,
      cungThanTai: chart.earthlyBranchOfBodyPalace,
    },
    muoiHaiCung: chart.palaces.map((p) => ({
      cung: p.name,
      thanCung: p.isBodyPalace,
      canChi: `${p.heavenlyStem}${p.earthlyBranch}`,
      truongSinh: p.changsheng12,
      daiHan: p.decadalRange,
      chinhTinh: p.majorStars.length > 0 ? formatStars(p.majorStars, true) : '— trống —',
      phuTinh: p.minorStars.length > 0 ? formatStars(p.minorStars, false) : '(không có)',
      tapDieu: p.adjectiveStars.length > 0 ? p.adjectiveStars.map((s) => s.name).join(' · ') : '(không có)',
    })),
  };

  if (chart.horoscope) {
    const { decadal, yearly, monthly } = chart.horoscope;
    data.vanHanHienTai = {
      daiHan: { ten: decadal.name, canChi: `${decadal.heavenlyStem}${decadal.earthlyBranch}`, tuHoa: decadal.mutagen.join(' · ') || 'không có' },
      luuNien: { ten: yearly.name, canChi: `${yearly.heavenlyStem}${yearly.earthlyBranch}`, tuHoa: yearly.mutagen.join(' · ') || 'không có' },
      luuNguyet: { ten: monthly.name, canChi: `${monthly.heavenlyStem}${monthly.earthlyBranch}`, tuHoa: monthly.mutagen.join(' · ') || 'không có' },
    };
  }

  if (chart.bazi) {
    const b = chart.bazi;
    data.batTu = {
      tuTru: b.pillarsString,
      nhatChu: `${b.dayMaster.stem} (${b.dayMaster.element}, ${b.dayMaster.nature})`,
      cuongNhuoc: `${b.dayMasterStrength.strength} (Score: ${b.dayMasterStrength.score})`,
      nguHanh: Object.entries(b.fiveElements).map(([k, v]) => `${k}:${v}`).join(' '),
      dungThan: b.favorableElements.join(', '),
      kyThan: b.unfavorableElements.join(', '),
    };
  }

  return encodeToon(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình GEMINI_API_KEY.' }, { status: 500 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập câu hỏi.' }, { status: 400 });
    }

    const chartContext = buildChartContext(body.chart, body.name);

    const historyText = body.history.slice(-6).map((h) =>
      `${h.role === 'user' ? 'Người hỏi' : 'Chuyên gia'}: ${h.content}`
    ).join('\n\n');

    const prompt = `${chartContext}

${historyText ? `=== LỊCH SỬ HỘI THOẠI GẦN NHẤT ===\n${historyText}\n\n` : ''}=== CÂU HỎI ===
${body.message}

Hãy trả lời dựa trên lá số và thời gian hiện tại ở trên. Dẫn chứng sao và cung cụ thể.`;

    // Cache bundles PDF + system instruction; fallback to inline system instruction
    const cacheName = await getCachedContentName();

    const CHAT_SYSTEM_INSTRUCTION = `Bạn là ĐẠI SƯ TỬ VI ĐẨU SỐ — bậc thầy luận số hàng đầu với hơn 40 năm kinh nghiệm thực chiến, kết hợp trường phái Việt Nam, Đài Loan và tâm lý học hành vi hiện đại.

━━━ QUY TẮC BẤT BIẾN ━━━
- Thời gian hiện tại đã được cung cấp trong ngữ cảnh — dùng nó để xác định đại hạn, lưu niên, lưu nguyệt đang hoạt động. KHÔNG tự tính lại.
- Chỉ nhận định dựa trên sao và cung CÓ TRONG dữ liệu lá số. TUYỆT ĐỐI không bịa đặt sao.
- LUÔN phân tích đa tầng: nguyên cục → đại hạn → lưu niên → lưu nguyệt khi có liên quan.
- Mỗi nhận định PHẢI dẫn chứng sao + trạng thái + cung cụ thể.
- Phân tích tam phương tứ chính cho mọi cung trọng yếu liên quan câu hỏi.
- Tứ hóa: xác định Lộc/Quyền/Khoa/Kỵ ở cả nguyên cục + đại hạn + lưu niên, chú ý Song Lộc/Song Kỵ.
- Giọng văn: điềm tĩnh, sâu sắc, học thuật nhưng dễ hiểu, không đe dọa, không xu nịnh.
- Tiêu cực → kèm hóa giải cụ thể. Tích cực → kèm điều kiện phát huy.
- Trả lời bằng tiếng Việt, chi tiết và đầy đủ, ưu tiên chiều sâu hơn chiều rộng.
- Sử dụng kiến thức từ tài liệu tham khảo Tử Vi đã được cung cấp để phân tích chính xác hơn.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        // When cache available: system instruction is inside the cache
        // When cache unavailable: use inline system instruction as fallback
        ...(cacheName
          ? { cachedContent: cacheName }
          : { systemInstruction: CHAT_SYSTEM_INSTRUCTION }),
        temperature: 0.7,
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 16384,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = result.text ?? '';

    return NextResponse.json({ success: true, reply: text });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
