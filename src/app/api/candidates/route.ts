import { NextRequest, NextResponse } from 'next/server';
import { astro } from 'iztro';
import { BIRTH_HOURS } from '@/types';
import type { RectificationCandidate } from '@/types';
import { getMessages } from '@/lib/i18n/messages';
import { LOCALE_HEADER, normalizeLocale } from '@/lib/i18n/locales';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function str(val: any): string {
  if (val == null) return '';
  if (typeof val === 'function') return val();
  return String(val);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solarDate, gender } = body as { solarDate: string; gender: 'male' | 'female' };
    const t = getMessages(normalizeLocale(request.headers.get(LOCALE_HEADER)));

    if (!solarDate) {
      return NextResponse.json({ success: false, error: t.api.missingFields }, { status: 400 });
    }

    const [year, month, day] = solarDate.split('-').map(Number);
    const formattedDate = `${year}-${month}-${day}`;
    const genderChar = gender === 'male' ? '男' : '女';

    const candidates: RectificationCandidate[] = [];

    for (const hour of BIRTH_HOURS) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const astrolabe = astro.bySolar(formattedDate, hour.value, genderChar, true, 'vi-VN') as any;
        const palaces: any[] = astrolabe.palaces || [];

        // Find the soul palace (Mệnh cung) — isOriginalPalace marks it
        const menhPalace = palaces.find((p: any) => p.isOriginalPalace) || palaces[0];

        const menhMajorStars: string[] = (menhPalace?.majorStars || [])
          .map((s: any) => str(s.name))
          .filter(Boolean);

        candidates.push({
          timeIndex: hour.value,
          hourBranch: hour.branch,
          hourRange: hour.range,
          menhEarthlyBranch: str(astrolabe.earthlyBranchOfSoulPalace),
          menhMajorStars,
          fiveElementsClass: str(astrolabe.fiveElementsClass),
          soul: str(astrolabe.soul),
        });
      } catch (e) {
        console.warn(`[candidates] Failed for timeIndex ${hour.value}:`, e);
      }
    }

    return NextResponse.json({ success: true, candidates });
  } catch (error) {
    console.error('Candidates error:', error);
    const message = error instanceof Error
      ? error.message
      : getMessages(normalizeLocale(request.headers.get(LOCALE_HEADER))).api.unknownError;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
