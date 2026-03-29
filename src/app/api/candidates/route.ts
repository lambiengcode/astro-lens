import { NextRequest, NextResponse } from 'next/server';
import { astro } from 'iztro';
import { BIRTH_HOURS } from '@/types';
import type { RectificationCandidate } from '@/types';

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

    if (!solarDate) {
      return NextResponse.json({ success: false, error: 'Thiếu ngày sinh.' }, { status: 400 });
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
          hourLabel: hour.label,
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
    const message = error instanceof Error ? error.message : 'Lỗi không xác định.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
