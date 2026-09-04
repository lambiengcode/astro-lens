import type { Locale } from '../locales';
import type { Profile, Profiles } from './types';
import vi from './vi';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';
import ko from './ko';
import en from './en';

export type { Profile, Profiles };

export const PROFILES: Record<Locale, Profiles> = {
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ko,
  en,
};

/**
 * The profile for a Mệnh cung, from its chính tinh. Behaviour is unchanged from
 * the pre-P5 `CandidateSelection`: a named two-star pair wins in either order,
 * otherwise the first star's own profile, otherwise the vô chính diệu profile.
 */
export function getProfile(locale: Locale, stars: string[]): Profile {
  const table = PROFILES[locale] ?? vi;
  if (stars.length === 0) return table.empty;

  if (stars.length >= 2) {
    const combo = table.combo[`${stars[0]}+${stars[1]}`] ?? table.combo[`${stars[1]}+${stars[0]}`];
    if (combo) return combo;
  }

  return table.single[stars[0]] ?? table.empty;
}
