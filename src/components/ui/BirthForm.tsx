'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BIRTH_HOURS } from '@/types';
import type { BirthInput, RectificationCandidate } from '@/types';
import CandidateSelection from './CandidateSelection';

type Step = 'form' | 'loading-candidates' | 'select-candidate' | 'loading-analysis';

export default function BirthForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [unknownHour, setUnknownHour] = useState(false);
  const [candidates, setCandidates] = useState<RectificationCandidate[]>([]);

  useEffect(() => {
    const pendingCandidates = sessionStorage.getItem('tuvi_candidates_state');
    const pendingError = sessionStorage.getItem('tuvi_error');
    if (pendingCandidates) {
      const parsed = JSON.parse(pendingCandidates) as { form: BirthInput; candidates: RectificationCandidate[] };
      setForm(parsed.form);
      setCandidates(parsed.candidates);
      setUnknownHour(true);
      setStep('select-candidate');
      sessionStorage.removeItem('tuvi_candidates_state');
    }
    if (pendingError) {
      setError(pendingError);
      sessionStorage.removeItem('tuvi_error');
    }
  }, []);

  const [form, setForm] = useState<BirthInput>({
    name: '',
    solarDate: '',
    birthHour: 6,
    gender: 'male',
    location: 'Việt Nam',
  });

  // ── Run full analysis with a specific timeIndex ────────────────────────────
  const runAnalysis = async (timeIndex: number) => {
    const input: BirthInput = { ...form, birthHour: timeIndex };
    sessionStorage.setItem('tuvi_pending_action', JSON.stringify({ action: 'analysis', input }));
    router.push('/loading');
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.solarDate) {
      setError('Vui lòng chọn ngày sinh.');
      return;
    }

    // Known hour → go straight to analysis
    if (!unknownHour) {
      await runAnalysis(form.birthHour);
      return;
    }

    sessionStorage.setItem('tuvi_pending_action', JSON.stringify({ action: 'candidates', solarDate: form.solarDate, gender: form.gender, form }));
    router.push('/loading');
  };

  // ── Render states ──────────────────────────────────────────────────────────
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

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Họ và tên <span className="text-muted/50">(không bắt buộc)</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nhập họ tên..."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Date of birth */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Ngày sinh dương lịch <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          value={form.solarDate}
          onChange={(e) => setForm({ ...form, solarDate: e.target.value })}
          required
          max={new Date().toISOString().split('T')[0]}
          min="1920-01-01"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all [color-scheme:dark]"
        />
      </div>

      {/* Birth hour + unknown toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted">
            Giờ sinh {!unknownHour && <span className="text-danger">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setUnknownHour((v) => !v)}
            className={`chip-glass press-spring flex items-center gap-1.5 text-xs px-3 py-1 transition-colors ${
              unknownHour ? 'text-[#5b8af5]' : 'text-[#4a5568] hover:text-[#6b7a94]'
            }`}
            style={unknownHour ? { borderColor: 'rgba(59,91,219,0.5)', backgroundColor: 'rgba(59,91,219,0.12)' } : undefined}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${unknownHour ? 'bg-[#5b8af5]' : 'bg-[#3d4a5c]'}`} />
            Không biết giờ sinh
          </button>
        </div>

        {unknownHour ? (
          <div className="px-4 py-3 rounded-lg glass-1 text-sm text-[#6b7a94] leading-relaxed">
            Hệ thống sẽ tạo <span className="text-[#5b8af5] font-medium">13 lá số</span> ứng với 13 giờ sinh — bạn chọn cung Mệnh phản ánh đúng tính cách nhất.
          </div>
        ) : (
          <>
            <select
              value={form.birthHour}
              onChange={(e) => setForm({ ...form, birthHour: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none"
            >
              {BIRTH_HOURS.map((hour) => (
                <option key={hour.value} value={hour.value}>
                  {hour.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted/50 mt-1.5">
              Giờ Tý có 2 lựa chọn: 23:00–23:59 (cùng ngày) và 00:00–00:59 (đầu ngày mới).
            </p>
          </>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Giới tính <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, gender: 'male' })}
            className={`chip-glass press-spring px-4 py-3 text-center font-medium transition-colors ${
              form.gender === 'male' ? 'text-accent' : 'text-muted hover:text-foreground'
            }`}
            style={form.gender === 'male' ? { borderColor: 'rgba(59,91,219,0.5)', backgroundColor: 'var(--accent-glow)' } : undefined}
          >
            ♂ Nam
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, gender: 'female' })}
            className={`chip-glass press-spring px-4 py-3 text-center font-medium transition-colors ${
              form.gender === 'female' ? 'text-accent' : 'text-muted hover:text-foreground'
            }`}
            style={form.gender === 'female' ? { borderColor: 'rgba(59,91,219,0.5)', backgroundColor: 'var(--accent-glow)' } : undefined}
          >
            ♀ Nữ
          </button>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Nơi sinh <span className="text-muted/50">(mặc định Việt Nam)</span>
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Việt Nam"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Self description */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Mô tả bản thân <span className="text-muted/50">(không bắt buộc)</span>
        </label>
        <textarea
          value={form.selfDescription || ''}
          onChange={(e) => setForm({ ...form, selfDescription: e.target.value })}
          placeholder="Tính cách, công việc hiện tại, tình trạng tình cảm, sức khỏe, điều bạn đang trăn trở..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none text-sm leading-relaxed"
        />
        <p className="text-xs text-muted/50 mt-1.5">
          Giúp AI đối chiếu lá số với thực tế của bạn — phân tích sẽ chính xác và cá nhân hóa hơn.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 rounded-full press-spring bg-gradient-to-r from-accent-dim to-accent text-white font-semibold text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_30px_rgba(59,91,219,0.25)] animate-pulse-glow"
      >
        {unknownHour ? '◎ Xem 13 Cung Mệnh' : '✦ Lập Lá Số Tử Vi'}
      </button>

      <p className="text-xs text-muted/60 text-center">
        Nhập ngày giờ sinh theo lịch dương. Giờ sinh theo giờ địa phương.
      </p>
    </form>
  );
}
