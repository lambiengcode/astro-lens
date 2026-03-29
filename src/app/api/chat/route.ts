import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChartData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

=== VẬN HẠN HIỆN TẠI ===${horoscopeInfo}`;
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

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: `Bạn là chuyên gia Tử Vi Đẩu Số với hơn 30 năm kinh nghiệm. Quy tắc bất biến:
- Thời gian hiện tại đã được cung cấp trong ngữ cảnh — dùng nó để xác định đại hạn, lưu niên đang hoạt động.
- Chỉ nhận định dựa trên sao và cung CÓ TRONG dữ liệu lá số. KHÔNG bịa đặt sao.
- Khi phân tích vận hạn, bám sát đại hạn và lưu niên được cung cấp — không tự tính lại.
- Giọng văn: bình tĩnh, trung thực, không đe dọa, không xu nịnh.
- Mỗi nhận định phải dẫn chứng sao/cung cụ thể.
- Trả lời bằng tiếng Việt, súc tích (2-4 đoạn), dễ hiểu.`,
      generationConfig: {
        temperature: 0.65,
        topP: 0.92,
        maxOutputTokens: 4096,
      },
    });

    const chartContext = buildChartContext(body.chart, body.name);

    const historyText = body.history.slice(-6).map((h) =>
      `${h.role === 'user' ? 'Người hỏi' : 'Chuyên gia'}: ${h.content}`
    ).join('\n\n');

    const prompt = `${chartContext}

${historyText ? `=== LỊCH SỬ HỘI THOẠI GẦN NHẤT ===\n${historyText}\n\n` : ''}=== CÂU HỎI ===
${body.message}

Hãy trả lời dựa trên lá số và thời gian hiện tại ở trên. Dẫn chứng sao và cung cụ thể.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, reply: text });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
