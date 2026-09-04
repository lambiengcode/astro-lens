'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import LocaleSwitcher from './LocaleSwitcher';

interface HeaderProps {
  /** Nav items that sit before the language selector. */
  actions?: React.ReactNode;
  /**
   * The page's primary action. It stays last in the bar — the language
   * selector sits immediately before it.
   */
  primary?: React.ReactNode;
}

export default function Header({ actions, primary }: HeaderProps) {
  const { t } = useI18n();
  return (
    <header className="appbar">
      <Link href="/" className="brand">
        <span className="mk" aria-hidden="true">✦</span>
        {/* The wordmark collapses to the mark alone on a narrow app bar — the
            switcher now takes its width out of the right-hand cluster, so at
            390px the brand no longer has room for the full wordmark beside it.
            PARITY.md §10 has the measurement. */}
        <span className="wm">{t.app.brand}</span>
      </Link>
      {/* Right-aligned cluster: nav links, then the language selector, then the
          primary action. Captain's instruction, 2026-09-04 — it supersedes the
          earlier middle placement, which was chosen to keep the app bar off the
          parity screens' geometry and is now history. PARITY.md §10. */}
      <nav>
        {actions ?? <Link href="/" className="on">{t.nav.home}</Link>}
        <LocaleSwitcher />
        {primary ?? <Link href="/#lap-la-so" className="btn gh">{t.nav.create}</Link>}
      </nav>
    </header>
  );
}
