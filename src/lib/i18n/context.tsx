'use client';

import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, type Locale } from './locales';
import { getMessages, type Messages } from './messages';
import { term as lookup, type Domain } from './vocabulary';

interface LocaleValue {
  locale: Locale;
  t: Messages;
  /** A Vietnamese domain term in the active locale. Identity at `vi`. */
  v: (value: string | undefined | null, domain?: Domain) => string;
}

const LocaleContext = createContext<LocaleValue>({
  locale: DEFAULT_LOCALE,
  t: getMessages(DEFAULT_LOCALE),
  v: (value) => value ?? '',
});

/**
 * Seeded by the server from the proxy-resolved locale, so the first paint is
 * already in the reader's language — PLAN.md §13b.2, no flash of Vietnamese.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<LocaleValue>(() => ({
    locale,
    t: getMessages(locale),
    v: (input, domain) => lookup(input, locale, domain),
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleValue {
  return useContext(LocaleContext);
}
