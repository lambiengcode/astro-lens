import type { Locale } from '../locales';
import vi, { type Messages } from './vi';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';
import ko from './ko';
import en from './en';

export type { Messages };

/**
 * All five catalogues, statically imported. They are a few kilobytes each and
 * the switcher has to be able to change locale without a round trip, so there
 * is nothing to gain from splitting them — unlike the fonts, which are the
 * thing DESIGN.md §15.4 actually cares about not shipping all at once.
 */
export const MESSAGES: Record<Locale, Messages> = {
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ko,
  en,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? vi;
}
