'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BIRTH_HOURS } from '@/types';
import type { BirthInput } from '@/types';
import LoadingScreen from './LoadingScreen';

export default function BirthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<BirthInput>({
    name: '',
    solarDate: '',
    birthHour: 6, // default Ngọ (11:00–12:59)
    gender: 'male',
    location: 'Việt Nam',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.solarDate) {
      setError('Vui lòng chọn ngày sinh.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: form }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Đã xảy ra lỗi.');
        setLoading(false);
        return;
      }

      // Store result in sessionStorage for the result page
      sessionStorage.setItem('tuvi_result', JSON.stringify(data.data));
      sessionStorage.setItem('tuvi_input', JSON.stringify(form));
      router.push('/result');
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

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
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
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
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all [color-scheme:dark]"
        />
      </div>

      {/* Birth hour */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Giờ sinh <span className="text-danger">*</span>
        </label>
        <select
          value={form.birthHour}
          onChange={(e) => setForm({ ...form, birthHour: parseInt(e.target.value) })}
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none"
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
            className={`px-4 py-3 rounded-lg border text-center font-medium transition-all ${
              form.gender === 'male'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-card text-muted hover:border-border hover:bg-card-hover'
            }`}
          >
            ♂ Nam
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, gender: 'female' })}
            className={`px-4 py-3 rounded-lg border text-center font-medium transition-all ${
              form.gender === 'female'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-card text-muted hover:border-border hover:bg-card-hover'
            }`}
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
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 rounded-lg bg-gradient-to-r from-accent-dim to-accent text-white font-semibold text-lg hover:opacity-90 transition-all animate-pulse-glow"
      >
        ✦ Lập Lá Số Tử Vi
      </button>

      <p className="text-xs text-muted/60 text-center">
        Nhập ngày giờ sinh theo lịch dương. Giờ sinh theo giờ địa phương.
      </p>
    </form>
  );
}
