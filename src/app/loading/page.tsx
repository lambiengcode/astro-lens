'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('tuvi_pending_action');
    if (!raw) { router.replace('/'); return; }

    let action: { action: 'analysis' | 'candidates'; input?: unknown; solarDate?: string; gender?: string; form?: unknown };
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || (parsed.action !== 'analysis' && parsed.action !== 'candidates')) {
        throw new Error('Invalid pending action');
      }
      action = parsed;
    } catch {
      sessionStorage.removeItem('tuvi_pending_action');
      sessionStorage.setItem('tuvi_error', 'Không thể khôi phục yêu cầu. Vui lòng thử lại.');
      router.replace('/#lap-la-so');
      return;
    }

    const run = async () => {
      try {
        const endpoint = action.action === 'analysis' ? '/api/analyze' : '/api/candidates';
        const body = action.action === 'analysis' ? { input: action.input } : { solarDate: action.solarDate, gender: action.gender };
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        if (!data.success || (action.action === 'candidates' && !data.candidates?.length)) throw new Error(data.error || 'Không thể hoàn tất yêu cầu.');

        if (action.action === 'analysis') {
          sessionStorage.setItem('tuvi_result', JSON.stringify(data.data));
          sessionStorage.setItem('tuvi_input', JSON.stringify(action.input));
          router.replace('/result');
        } else {
          sessionStorage.setItem('tuvi_candidates_state', JSON.stringify({ form: action.form, candidates: data.candidates }));
          router.replace('/#lap-la-so');
        }
      } catch (error) {
        sessionStorage.setItem('tuvi_error', error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        router.replace('/#lap-la-so');
      } finally {
        sessionStorage.removeItem('tuvi_pending_action');
      }
    };
    void run();
  }, [router]);

  return <LoadingScreen />;
}
