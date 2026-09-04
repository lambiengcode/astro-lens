'use client';

import { useI18n } from '@/lib/i18n/context';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="foot-bar">
      <p><b>{t.app.brand}</b> {t.footer.tagline}</p>
      <p>{t.footer.disclaimer}</p>
    </footer>
  );
}
