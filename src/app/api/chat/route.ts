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
  const palaces = chart.palaces.map((p) => {
    const majors = p.majorStars.map((s) => {
      let str = s.name;
      if (s.brightness) str += `(${s.brightness})`;
      if (s.mutagen) str += `[${s.mutagen}]`;
      return str;
    }).join(', ');
    return `${p.name}(${p.heavenlyStem}${p.earthlyBranch}): ${majors || 'trống'}`;
  }).join(' | ');

  return `Lá số Tử Vi Đẩu Số:
${name ? `Tên: ${name} | ` : ''}${chart.gender} | ${chart.solarDate} | ${chart.time}(${chart.timeRange}) | ${chart.zodiac} | ${chart.fiveElementsClass} | Mệnh chủ: ${chart.soul} | Thân chủ: ${chart.body}
${palaces}`;
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
- Chỉ nhận định dựa trên sao và cung CÓ TRONG dữ liệu lá số được cung cấp.
- KHÔNG bịa đặt sao, không suy diễn vượt quá dữ liệu.
- Giọng văn: bình tĩnh, trung thực, không đe dọa, không xu nịnh.
- Mỗi nhận định phải có căn cứ từ sao/cung cụ thể.
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

    const prompt = `=== LÁ SỐ ===
${chartContext}

${historyText ? `=== LỊCH SỬ HỘI THOẠI GẦN NHẤT ===\n${historyText}\n\n` : ''}=== CÂU HỎI ===
${body.message}

Hãy trả lời dựa trên lá số trên. Dẫn chứng sao và cung cụ thể.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, reply: text });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
