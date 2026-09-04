// ============================================================
// LOCALES — DESIGN.md §15
// ============================================================

export const LOCALES = ['vi', 'zh-Hans', 'zh-Hant', 'ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Vietnamese is the origin locale and the parity regression baseline. */
export const DEFAULT_LOCALE: Locale = 'vi';

/**
 * Script family. The type floors in DESIGN.md §15.3 and the font stacks in
 * §15.4 key off this, not off the locale — `zh-Hant` and `ko` differ in font
 * but share every size rule.
 */
export type Script = 'latin' | 'hans' | 'hant' | 'hangul';

export const SCRIPT_OF: Record<Locale, Script> = {
  vi: 'latin',
  en: 'latin',
  'zh-Hans': 'hans',
  'zh-Hant': 'hant',
  ko: 'hangul',
};

/** `true` for the scripts DESIGN.md §15.3 raises the type floors for. */
export function isDenseScript(locale: Locale): boolean {
  return SCRIPT_OF[locale] !== 'latin';
}

/** What the language switcher shows — each endonym in its own script. */
export const LOCALE_NAMES: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ko: '한국어',
  en: 'English',
};

/** Short tag for the switcher's collapsed state. */
export const LOCALE_TAGS: Record<Locale, string> = {
  vi: 'VI', 'zh-Hans': '简', 'zh-Hant': '繁', ko: '한', en: 'EN',
};

/** BCP-47 tag for `<html lang>` and `Intl`. */
export const HTML_LANG: Record<Locale, string> = {
  vi: 'vi', 'zh-Hans': 'zh-Hans', 'zh-Hant': 'zh-Hant', ko: 'ko', en: 'en',
};

/** The `Intl` locale used for number and date formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  vi: 'vi-VN', 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-HK', ko: 'ko-KR', en: 'en-US',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Best supported locale for an arbitrary tag. Accepts the exact tags, the
 * region forms iztro and browsers use (`zh-CN`, `zh-TW`, `ko-KR`, `en-US`) and
 * the bare language. Anything unrecognised falls back to Vietnamese.
 */
export function normalizeLocale(tag: string | null | undefined): Locale {
  if (!tag) return DEFAULT_LOCALE;
  const t = tag.trim();
  if (isLocale(t)) return t;
  const lower = t.toLowerCase();
  if (lower.startsWith('vi')) return 'vi';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('zh')) {
    // Traditional is used in Taiwan, Hong Kong and Macau; everything else
    // Chinese defaults to Simplified.
    return /hant|\b(tw|hk|mo)\b/.test(lower) ? 'zh-Hant' : 'zh-Hans';
  }
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

/**
 * Pick a locale from an `Accept-Language` header. Quality values are honoured
 * so `zh-TW;q=0.9, en;q=0.8` resolves to `zh-Hant` rather than to whichever
 * tag happened to be written first.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.trim(), q: q ? parseFloat(q.split('=')[1]) || 0 : 1 };
    })
    .filter((r) => r.tag && r.tag !== '*')
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const lower = tag.toLowerCase();
    if (lower.startsWith('vi')) return 'vi';
    if (lower.startsWith('ko')) return 'ko';
    if (lower.startsWith('zh')) return /hant|-(tw|hk|mo)\b/.test(lower) ? 'zh-Hant' : 'zh-Hans';
    if (lower.startsWith('en')) return 'en';
  }
  return null;
}

/** Cookie the choice persists in, and the query parameter that sets it. */
export const LOCALE_COOKIE = 'tuvi_locale';
export const LOCALE_PARAM = 'lang';
/** Header the proxy uses to hand the resolved locale to the server render. */
export const LOCALE_HEADER = 'x-tuvi-locale';
