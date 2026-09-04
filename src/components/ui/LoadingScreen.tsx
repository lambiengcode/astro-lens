'use client';

import { useEffect, useState } from 'react';
import Astrolabe from './Astrolabe';
import { useI18n } from '@/lib/i18n/context';

/**
 * No mockup section — redesigned to the system as a reduced astrolabe with
 * mono status text (PLAN.md §6). The dial is the only thing that moves.
 */
export default function LoadingScreen({ mode = 'analysis' }: { mode?: 'analysis' | 'candidates' }) {
  const { t } = useI18n();
  const steps = mode === 'candidates' ? t.loading.candidates : t.loading.analysis;
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msg = setInterval(() => setI((p) => Math.min(p + 1, steps.length - 1)), 4000);
    const bar = setInterval(() => setProgress((p) => Math.min(p + 0.5, 95)), 200);
    return () => { clearInterval(msg); clearInterval(bar); };
  }, [steps.length]);

  return (
    <div className="load" role="status" aria-live="polite">
      <Astrolabe variant="loading" />
      <div>
        <p className="msg-line">{steps[i]}</p>
        <p className="sub-line">{t.loading.sub}</p>
      </div>
      <div className="track"><i style={{ width: `${progress}%` }} /></div>
      <div className="steps" aria-hidden="true">
        {steps.map((s, n) => <i key={s} className={n <= i ? 'on' : ''} />)}
      </div>
    </div>
  );
}
