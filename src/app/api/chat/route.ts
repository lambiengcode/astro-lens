import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ChartData } from '@/types';
import { getCachedContentName } from '@/lib/gemini-cache';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ChatRequest {
  message: string;
  chart: ChartData;
  history: { role: 'user' | 'ai'; content: string }[];
  name?: string;
}

function buildChartContext(chart: ChartData, name?: string): string {
  // Full palace details — not just one-liners
  const palaceDetails = chart.palaces.map((p) => {
    const majors = p.majorStars.length > 0
      ? p.majorStars.map((s) => {
          let str = s.name;
          if (s.brightness) str += `(${s.brightness})`;
          if (s.mutagen) str += `[${s.mutagen}]`;
          return str;
        }).join(' · ')
      : '— trống —';

    const minors = p.minorStars.length > 0
      ? p.minorStars.map((s) => {
          let str = s.name;
          if (s.mutagen) str += `[${s.mutagen}]`;
          return str;
        }).join(' · ')
      : '';

    const adjectives = p.adjectiveStars.length > 0
      ? p.adjectiveStars.map((s) => s.name).join(' · ')
      : '';

    return `▸ ${p.name}${p.isBodyPalace ? ' [THÂN CUNG]' : ''}  Can/Chi: ${p.heavenlyStem}${p.earthlyBranch}  Trường sinh: ${p.changsheng12}  Đại hạn: ${p.decadalRange}
  Chính tinh: ${majors}
  Phụ tinh: ${minors || '(không có)'}
  Tạp diệu: ${adjectives || '(không có)'}`;
  }).join('\n');

  let horoscopeInfo = '';
  if (chart.horoscope) {
    const { decadal, yearly, monthly } = chart.horoscope;
    horoscopeInfo = `
▸ Đại hạn hiện tại: ${decadal.name} (${decadal.heavenlyStem}${decadal.earthlyBranch}) | Tứ hóa: ${decadal.mutagen.join(' · ') || 'không có'}
▸ Lưu niên: ${yearly.name} (${yearly.heavenlyStem}${yearly.earthlyBranch}) | Tứ hóa: ${yearly.mutagen.join(' · ') || 'không có'}
▸ Lưu nguyệt: ${monthly.name} (${monthly.heavenlyStem}${monthly.earthlyBranch}) | Tứ hóa: ${monthly.mutagen.join(' · ') || 'không có'}`;
  }

  // Current real-world date/time so AI knows the actual year
  const now = new Date();
  const currentDateTime = now.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });

  return `=== THỜI GIAN HIỆN TẠI ===
${currentDateTime} (GMT+7 — Việt Nam)

=== THÔNG TIN LÁ SỐ ===
Tên: ${name || '(không cung cấp)'}  |  Giới tính: ${chart.gender}
Dương lịch: ${chart.solarDate}  |  Âm lịch: ${chart.lunarDate}
Can Chi: ${chart.chineseDate}  |  Giờ sinh: ${chart.time} (${chart.timeRange})
Con giáp: ${chart.zodiac}  |  Ngũ hành cục: ${chart.fiveElementsClass}
Mệnh chủ: ${chart.soul}  |  Thân chủ: ${chart.body}
Cung Mệnh tại: ${chart.earthlyBranchOfSoulPalace}  |  Cung Thân tại: ${chart.earthlyBranchOfBodyPalace}

=== 12 CUNG ===
${palaceDetails}

=== VẬN HẠN HIỆN TẠI ===${horoscopeInfo}
${chart.bazi ? `
=== BÁT TỰ / TỨ TRỤ ===
Tứ trụ: ${chart.bazi.pillarsString}
Nhật chủ: ${chart.bazi.dayMaster.stem} (${chart.bazi.dayMaster.element}, ${chart.bazi.dayMaster.nature})
Cường/Nhược: ${chart.bazi.dayMasterStrength.strength} (Score: ${chart.bazi.dayMasterStrength.score})
Ngũ hành: ${Object.entries(chart.bazi.fiveElements).map(([k, v]) => k + ':' + v).join(' ')}
Dụng thần: ${chart.bazi.favorableElements.join(', ')}  |  Kỵ thần: ${chart.bazi.unfavorableElements.join(', ')}` : ''}`;
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
      model: 'gemini-3.1-pro-preview',
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
