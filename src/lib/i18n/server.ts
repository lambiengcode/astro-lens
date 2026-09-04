import { headers, cookies } from 'next/headers';
import {
  DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, normalizeLocale, type Locale,
} from './locales';

/**
 * The locale for this request, resolved before first paint.
 *
 * `src/proxy.ts` has already done the work — query parameter, then cookie, then
 * `Accept-Language`, then `vi` — and handed the answer down on a request header.
 * The cookie is read as a fallback for the paths the proxy matcher skips.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get(LOCALE_HEADER);
  if (fromProxy) return normalizeLocale(fromProxy);

  const c = await cookies();
  const fromCookie = c.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return normalizeLocale(fromCookie);

  return DEFAULT_LOCALE;
}
