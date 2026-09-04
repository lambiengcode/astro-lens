import { NextResponse, type NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, LOCALE_PARAM,
  localeFromAcceptLanguage, normalizeLocale,
} from '@/lib/i18n/locales';

// ============================================================
// LOCALE RESOLUTION — PLAN.md §13b.2
// ============================================================
//
// Next 16 renamed the `middleware` convention to `proxy`
// (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
//
// The three requirements §13b.2 sets, and how each is met:
//
//   resolvable on the server before first paint — the locale is decided here,
//     ahead of the render, and handed to the root layout on a request header.
//     Nothing is negotiated in the browser, so there is no flash of Vietnamese.
//   persists across navigation — it is written to a cookie on the way out.
//   `vi` stays the default and existing links keep working — the path is never
//     rewritten or redirected, so `/result?tab=chart&fixture=tuvi-ty` is the
//     same URL it was before this phase. That is also what lets the twelve
//     Vietnamese parity screens keep their addresses unchanged (§13b.6).
//
// `?lang=ko` overrides and is remembered, so a reader can still share a link in
// their own language without the app growing a `/[lang]` path segment.

export function proxy(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get(LOCALE_PARAM);
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;

  const locale = requested
    ? normalizeLocale(requested)
    : stored
      ? normalizeLocale(stored)
      : localeFromAcceptLanguage(request.headers.get('accept-language')) ?? DEFAULT_LOCALE;

  const forwarded = new Headers(request.headers);
  forwarded.set(LOCALE_HEADER, locale);

  const response = NextResponse.next({ request: { headers: forwarded } });

  if (locale !== stored) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  // Everything but Next's own assets and the favicon. API routes are included
  // deliberately: /api/analyze and /api/chat need the locale to pick the
  // prompt, and reading it from the same header keeps one resolution path.
  matcher: ['/((?!_next/static|_next/image|icon.svg|favicon.ico).*)'],
};
