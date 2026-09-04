'use client';

import { useI18n } from '@/lib/i18n/context';
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, LOCALE_PARAM, LOCALE_TAGS } from '@/lib/i18n/locales';

/**
 * The app-bar language selector — PLAN.md §13b.2, styled as the §8.3 input.
 * It is right-aligned, sitting between the nav links and the page's primary
 * action; `Header.tsx` places it. Captain's instruction, 2026-09-04.
 *
 * A native `<select>`, which is what DESIGN.md §8.3 already describes and what
 * the birth form's hour field already is.
 *
 * It is deliberately narrow, and shows the locale's TAG rather than its name:
 * each tag is written in its own script (VI · 简 · 繁 · 한 · EN), which reads as
 * a language control at a glance and costs 32px. The width still matters even
 * though the selector no longer has to squeeze into the middle of the bar: at
 * 390px it is what decides whether the wordmark can stay beside it, and 32px is
 * already past that point on the result page — see PARITY.md §10.3. The full
 * endonyms are on the options.
 *
 * Changing it writes the cookie and reloads the same URL with `?lang=`. The
 * reload is deliberate rather than lazy: the locale decides `<html lang>`, the
 * `data-script` type floors and which font stylesheet the document links, and
 * all three are resolved on the server before first paint. Swapping them
 * client-side would give exactly the flash of Vietnamese §13b.2 forbids.
 */
export default function LocaleSwitcher() {
  const { locale, t } = useI18n();

  return (
    <select
      className="lang-sel mono"
      value={locale}
      aria-label={t.nav.language}
      title={t.nav.language}
      onChange={(e) => {
        const next = e.target.value;
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        const url = new URL(window.location.href);
        url.searchParams.set(LOCALE_PARAM, next);
        window.location.assign(url.toString());
      }}
    >
      {LOCALES.map((l) => (
        // The tag is what the collapsed control shows; the name is what the
        // open list shows. `<option>` label/text does that in one element.
        <option key={l} value={l} label={LOCALE_TAGS[l]}>{LOCALE_NAMES[l]}</option>
      ))}
    </select>
  );
}
