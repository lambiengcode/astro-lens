import type { Locale } from '../i18n/locales';
import type { PromptPack } from './types';
import vi from './vi';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';
import ko from './ko';
import en from './en';

export type { PromptPack, DataLabels } from './types';

const PACKS: Record<Locale, PromptPack> = {
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ko,
  en,
};

export function getPrompt(locale: Locale): PromptPack {
  return PACKS[locale] ?? vi;
}
