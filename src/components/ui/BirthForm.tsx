'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadFixtureInput } from '@/lib/fixture';
import { BIRTH_HOURS } from '@/types';
import type { BirthInput, RectificationCandidate } from '@/types';
import LoadingScreen from './LoadingScreen';
import CandidateSelection from './CandidateSelection';
import { useI18n } from '@/lib/i18n/context';

type Step = 'form' | 'loading-candidates' | 'select-candidate' | 'loading-analysis';

export default function BirthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [unknownHour, setUnknownHour] = useState(false);
  const [candidates, setCandidates] = useState<RectificationCandidate[]>([]);
  const { locale, t, v } = useI18n();

  const [form, setForm] = useState<BirthInput>(
    () => {
      const fx = loadFixtureInput(searchParams.get('fixture'));
      // the mockup shows the name field on its placeholder
      return fx ? { ...fx, name: '' } : {
      name: '',
      solarDate: '',
      birthHour: 6,
      gender: 'male',
      location: t.form.defaultLocation,
      };
    },
  );

  const runAnalysis = async (timeIndex: number) => {
    setStep('loading-analysis');
    setError(null);
    const input: BirthInput = { ...form, birthHour: timeIndex };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, locale }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || t.form.errGeneric);
        setStep('form');
        return;
      }

      sessionStorage.setItem('tuvi_result', JSON.stringify(data.data));
      sessionStorage.setItem('tuvi_input', JSON.stringify(input));
      router.push('/result');
    } catch {
      setError(t.form.errNetwork);
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.solarDate) {
      setError(t.form.errNoDate);
      return;
    }

    if (!unknownHour) {
      await runAnalysis(form.birthHour);
      return;
    }

    setStep('loading-candidates');
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solarDate: form.solarDate, gender: form.gender }),
      });
      const data = await res.json();

      if (!data.success || !data.candidates?.length) {
        setError(data.error || t.form.errCandidates);
        setStep('form');
        return;
      }

      setCandidates(data.candidates);
      setStep('select-candidate');
    } catch {
      setError(t.form.errNetwork);
      setStep('form');
    }
  };

  if (step === 'loading-candidates' || step === 'loading-analysis') {
    return <LoadingScreen mode={step === 'loading-candidates' ? 'candidates' : 'analysis'} />;
  }

  if (step === 'select-candidate') {
    return (
      <CandidateSelection
        candidates={candidates}
        solarDate={form.solarDate}
        gender={form.gender}
        name={form.name}
        onSelect={(timeIndex) => runAnalysis(timeIndex)}
        onBack={() => setStep('form')}
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="err" role="alert">{error}</div>}

      <div className="field">
        <label htmlFor="bf-name">{t.form.name} <s>{t.form.optional}</s></label>
        <input
          id="bf-name" type="text" className="inp"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t.form.namePlaceholder}
        />
      </div>

      <div className="field">
        <label htmlFor="bf-date">{t.form.date} <i aria-hidden="true">*</i></label>
        <input
          id="bf-date" type="date" className="inp mono [color-scheme:dark]"
          value={form.solarDate}
          onChange={(e) => setForm({ ...form, solarDate: e.target.value })}
          required max={today} min="1920-01-01"
        />
      </div>

      <div className="two">
        <div className="field">
          <label htmlFor="bf-hour">{t.form.hour}</label>
          <select
            id="bf-hour" className="inp mono"
            value={form.birthHour}
            disabled={unknownHour}
            onChange={(e) => setForm({ ...form, birthHour: parseInt(e.target.value, 10) })}
          >
            {BIRTH_HOURS.map((h) => (
              <option key={h.value} value={h.value}>
                {v(h.branch, 'branch')} · {h.range}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label id="bf-gender-label">{t.form.gender} <i aria-hidden="true">*</i></label>
          <div className="seg" role="group" aria-labelledby="bf-gender-label">
            <button
              type="button"
              className={form.gender === 'male' ? 'on' : ''}
              aria-pressed={form.gender === 'male'}
              onClick={() => setForm({ ...form, gender: 'male' })}
            >
              {t.form.male}
            </button>
            <button
              type="button"
              className={form.gender === 'female' ? 'on' : ''}
              aria-pressed={form.gender === 'female'}
              onClick={() => setForm({ ...form, gender: 'female' })}
            >
              {t.form.female}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={unknownHour ? 'chk on' : 'chk'}
        aria-pressed={unknownHour}
        onClick={() => setUnknownHour((prev) => !prev)}
      >
        <span className="bx" aria-hidden="true">{unknownHour ? '✓' : ''}</span>
        <span className="tt">
          {t.form.unknownHour}
          <small>{t.form.unknownHourNote}</small>
        </span>
      </button>

      <div className="field">
        <label htmlFor="bf-loc">{t.form.location} <s>{t.form.locationDefault}</s></label>
        <input
          id="bf-loc" type="text" className="inp"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder={t.form.defaultLocation}
        />
      </div>

      <div className="field">
        <label htmlFor="bf-self">{t.form.self} <s>{t.form.optional}</s></label>
        <textarea
          id="bf-self" className="inp" rows={3} maxLength={500}
          value={form.selfDescription || ''}
          onChange={(e) => setForm({ ...form, selfDescription: e.target.value })}
          placeholder={t.form.selfPlaceholder}
        />
        <p className="hint-note" style={{ marginTop: 6, marginBottom: 0 }}>
          {t.form.selfNote}
        </p>
      </div>

      <button type="submit" className="btn pri wide">
        {unknownHour ? t.form.submitCandidates : t.form.submit}
      </button>
    </form>
  );
}
