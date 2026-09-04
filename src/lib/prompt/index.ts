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

/** What the chart and the request actually carry. */
export interface Available {
  bazi: boolean;
  selfDescription: boolean;
}

/**
 * The task layer with its conditional parts kept or REMOVED — P7 step 2.
 *
 * Sections 10 (Bát Tự) and 11 (self-description) are conditional, and the
 * prompt said so in words: *"only write this section if the data appears
 * above; if it does not, skip it entirely."* Measured, four of five locales
 * ignored that and invented the Four Pillars for a chart that had none
 * (EVAL.md §3.2). An instruction the model can talk itself past is not a
 * constraint.
 *
 * So the conditional is now structural instead. When there is no Bazi data the
 * model never sees section 10's heading, its [J] reasoning step or its
 * self-check line — there is nothing to copy. Same for the self-description.
 * The markers are authored into each locale's task and never reach the model.
 */
export function renderTask(task: string, has: Available): string {
  const region = (text: string, tag: string, keep: boolean) =>
    text.replace(
      // The trailing newline is optional: the last closing marker sits at the
      // very end of the template literal, with nothing after it.
      new RegExp(`⟦${tag}⟧\\n?([\\s\\S]*?)⟦/${tag}⟧\\n?`, 'g'),
      keep ? '$1' : '',
    );
  return region(region(task, 'BAZI', has.bazi), 'SELF', has.selfDescription);
}
