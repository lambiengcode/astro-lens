import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ChartData } from '@/types';
import { splitCitation } from '@/lib/citation';
import { getCachedContentName } from '@/lib/gemini-cache';
import { getMessages } from '@/lib/i18n/messages';
import { INTL_LOCALE, LOCALE_HEADER, normalizeLocale, type Locale } from '@/lib/i18n/locales';
import { term } from '@/lib/i18n/vocabulary';
import { getPrompt } from '@/lib/prompt';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ChatRequest {
  message: string;
  chart: ChartData;
  history: { role: 'user' | 'ai'; content: string }[];
  name?: string;
  locale?: string;
}

// The chart is generated once in `vi-VN`, so every domain value goes through
// `term()` on its way into the prompt — the model reasons in the reader's own
// vocabulary, never in Vietnamese. DESIGN.md §15.5.
function buildChartContext(chart: ChartData, locale: Locale, name?: string): string {
  const L = getPrompt(locale).labels;
  const v = (value: string | undefined | null, domain?: Parameters<typeof term>[2]) =>
    term(value, locale, domain);

  const palaceDetails = chart.palaces.map((p) => {
    const majors = p.majorStars.length > 0
      ? p.majorStars.map((s) => {
          let str = v(s.name, 'majorStar');
          if (s.brightness) str += `(${v(s.brightness, 'brightness')})`;
          if (s.mutagen) str += `[${v(s.mutagen, 'mutagen')}]`;
          return str;
        }).join(' \u00b7 ')
      : L.empty;

    const minors = p.minorStars.length > 0
      ? p.minorStars.map((s) => {
          let str = v(s.name, 'minorStar');
          if (s.mutagen) str += `[${v(s.mutagen, 'mutagen')}]`;
          return str;
        }).join(' \u00b7 ')
      : '';

    const adjectives = p.adjectiveStars.length > 0
      ? p.adjectiveStars.map((s) => v(s.name, 'adjectiveStar')).join(' \u00b7 ')
      : '';

    return `\u25b8 ${v(p.name, 'palace')}${p.isBodyPalace ? ` ${L.bodyPalaceMark}` : ''}  ${L.canChiOf}: ${v(p.heavenlyStem, 'stem')}${v(p.earthlyBranch, 'branch')}  ${L.changsheng}: ${v(p.changsheng12, 'changsheng')}  ${L.decadal}: ${p.decadalRange}
  ${L.majorStars}: ${majors}
  ${L.minorStars}: ${minors || L.none}
  ${L.adjectiveStars}: ${adjectives || L.none}`;
  }).join('\n');

  const mutagenList = (items: string[]) =>
    // Split on the FIRST space only: an entry is "<tứ hóa> <star>" and a star
    // name is usually two words ("Thiên Đồng"). Splitting on every space looked
    // each word up alone, so no multi-word star ever matched and the Chinese
    // and Korean data contexts carried Vietnamese — which the model then
    // faithfully quoted back. Found by the eval, EVAL.md §4.
    items.map((m) => {
      const at = m.indexOf(' ');
      if (at === -1) return v(m, 'mutagen');
      return `${v(m.slice(0, at), 'mutagen')} ${v(m.slice(at + 1))}`;
    })
      .join(' \u00b7 ') || L.none;

  let horoscopeInfo = '';
  if (chart.horoscope) {
    const { decadal, yearly, monthly } = chart.horoscope;
    horoscopeInfo = `
\u25b8 ${L.decadalRow}: ${v(decadal.name, 'palace')} (${v(decadal.heavenlyStem, 'stem')}${v(decadal.earthlyBranch, 'branch')}) | ${L.mutagen}: ${mutagenList(decadal.mutagen)}
\u25b8 ${L.yearlyRow}: ${v(yearly.name, 'palace')} (${v(yearly.heavenlyStem, 'stem')}${v(yearly.earthlyBranch, 'branch')}) | ${L.mutagen}: ${mutagenList(yearly.mutagen)}
\u25b8 ${L.monthlyRow}: ${v(monthly.name, 'palace')} (${v(monthly.heavenlyStem, 'stem')}${v(monthly.earthlyBranch, 'branch')}) | ${L.mutagen}: ${mutagenList(monthly.mutagen)}`;
  }

  // Current real-world date/time so the model knows the actual year
  const now = new Date();
  const currentDateTime = now.toLocaleString(INTL_LOCALE[locale], {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });

  const toEl = (e: string) => L.elements[e as keyof typeof L.elements] || e;

  return `=== ${L.now} ===
${currentDateTime} ${L.timezoneNote}

=== ${L.basics} ===
${L.name}: ${name || L.notGiven}  |  ${L.gender}: ${v(chart.gender, 'gender')}
${L.solar}: ${chart.solarDate}  |  ${L.lunar}: ${chart.lunarDate}
${L.canChi}: ${chart.chineseDate.split(/(\s+|\u00b7)/).map((part) => v(part)).join('')}  |  ${L.birthHour}: ${v(chart.time, 'branch')} (${chart.timeRange})
${L.zodiac}: ${v(chart.zodiac, 'zodiac')}  |  ${L.fiveElements}: ${v(chart.fiveElementsClass, 'fiveElements')}
${L.soul}: ${v(chart.soul)}  |  ${L.body}: ${v(chart.body)}
${L.soulPalaceAt}: ${v(chart.earthlyBranchOfSoulPalace, 'branch')}  |  ${L.bodyPalaceAt}: ${v(chart.earthlyBranchOfBodyPalace, 'branch')}

=== ${L.twelvePalaces} ===
${palaceDetails}

=== ${L.horoscopeHead} ===${horoscopeInfo}
${chart.bazi ? `
=== ${L.baziHead} ===
${L.baziPillars}: ${chart.bazi.pillarsString}
${L.baziDayMaster}: ${chart.bazi.dayMaster.stem} (${toEl(chart.bazi.dayMaster.element)}, ${chart.bazi.dayMaster.nature})
${L.baziStrength}: ${chart.bazi.dayMasterStrength.strength} (${L.baziScore}: ${chart.bazi.dayMasterStrength.score})
${L.baziFiveElements}: ${Object.entries(chart.bazi.fiveElements).map(([k, n]) => toEl(k) + ':' + n).join(' ')}
${L.baziFavorable}: ${chart.bazi.favorableElements.map(toEl).join(', ')}  |  ${L.baziUnfavorable}: ${chart.bazi.unfavorableElements.map(toEl).join(', ')}` : ''}`;
}


/** The four scaffolding strings around a chat turn, per locale. */
const CHAT_TURN: Record<Locale, {
  user: string; expert: string; history: string; question: string; instruction: string;
}> = {
  vi: {
    user: 'Người hỏi', expert: 'Chuyên gia',
    history: 'LỊCH SỬ HỘI THOẠI GẦN NHẤT', question: 'CÂU HỎI',
    instruction: 'Hãy trả lời dựa trên lá số và thời gian hiện tại ở trên. Kết thúc câu trả lời bằng ĐÚNG MỘT dòng dẫn chứng riêng, bắt đầu bằng "> ", nêu đúng một cung và các sao THỰC SỰ nằm trong cung đó theo dữ liệu trên — ví dụ: "> Cung Phu Thê · Thiên Phủ (Đắc)". Dẫn chứng nêu sai sao còn tệ hơn không có dẫn chứng.',
  },
  'zh-Hans': {
    user: '提问者', expert: '命理师',
    history: '最近的对话记录', question: '问题',
    instruction: '请依据上方的命盘与当前时间作答。答案末尾另起一行给出恰好一行引证，以 "> " 开头，只谈一个宫，所列的星必须确实位于该宫 —— 例如："> 夫妻宫 · 天府(得)"。引证里出现不在该宫的星，比没有引证更糟。',
  },
  'zh-Hant': {
    user: '提問者', expert: '命理師',
    history: '最近的對話紀錄', question: '問題',
    instruction: '請依據上方的命盤與現時時間作答。答案末尾另起一行給出恰好一行引證，以 "> " 開頭，只談一個宮，所列的星必須確實位於該宮 —— 例如："> 夫妻宮 · 天府(得)"。引證裡出現不在該宮的星，比沒有引證更糟。',
  },
  ko: {
    user: '질문자', expert: '명리가',
    history: '최근 대화 기록', question: '질문',
    instruction: '위의 명반과 현재 시각을 근거로 답하십시오. 답변 끝에 전거를 정확히 한 줄, "> " 로 시작해 따로 적으십시오. 한 궁만 말하고, 위 데이터에서 실제로 그 궁에 있는 성만 적습니다 — 예: "> 부처궁 · 천부(득)". 그 궁에 없는 성을 적은 전거는 전거가 없는 것보다 나쁩니다.',
  },
  en: {
    user: 'Asked', expert: 'Master',
    history: 'RECENT CONVERSATION', question: 'QUESTION',
    instruction: 'Answer from the chart and the current time above. End with EXACTLY ONE citation line of its own, beginning "> ", naming one palace and only stars that ACTUALLY sit in it per the data above — for example: "> Spouse Palace (Phu Thê) · Tian Fu (gained)". A citation naming a star that is not in that palace is worse than no citation at all.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const locale = normalizeLocale(body.locale ?? request.headers.get(LOCALE_HEADER));
    const t = getMessages(locale);
    const pack = getPrompt(locale);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({ success: false, error: t.api.noApiKey }, { status: 500 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ success: false, error: t.chat.placeholder }, { status: 400 });
    }

    const chartContext = buildChartContext(body.chart, locale, body.name);

    const historyText = body.history.slice(-6).map((h) =>
      `${h.role === 'user' ? CHAT_TURN[locale].user : CHAT_TURN[locale].expert}: ${h.content}`
    ).join('\n\n');

    const prompt = `${chartContext}

${historyText ? `=== ${CHAT_TURN[locale].history} ===\n${historyText}\n\n` : ''}=== ${CHAT_TURN[locale].question} ===
${body.message}

${CHAT_TURN[locale].instruction}`;

    // Cache bundles PDF + this locale's system instruction; fallback to inline
    const cacheName = await getCachedContentName(locale);



    const result = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        // When cache available: system instruction is inside the cache
        // When cache unavailable: use inline system instruction as fallback
        ...(cacheName
          ? { cachedContent: cacheName }
          : { systemInstruction: pack.chat }),
        temperature: 0.7,
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 16384,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const { reply, cite } = splitCitation(result.text ?? '');

    return NextResponse.json({ success: true, reply, cite });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error
      ? error.message
      : getMessages(normalizeLocale(request.headers.get(LOCALE_HEADER))).api.unknownError;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
