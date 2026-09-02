'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Đang lập lá số tử vi...',
  'Đang phân tích 12 cung...',
  'Đang xem xét chính tinh & phụ tinh...',
  'Đang luận giải ngũ hành...',
  'Đang phân tích đại vận...',
  'Đang tổng hợp & viết luận giải...',
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, MESSAGES.length - 1));
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 0.5, 95));
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#060a13]/98 backdrop-blur-xl">
      {/* Background stars */}
      <div className="absolute inset-0 stars-bg opacity-20" />

      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#3b5bdb]/[0.06] rounded-full blur-[80px] animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] bg-[#9775cd]/[0.05] rounded-full blur-[60px]" />

      <div className="relative text-center px-10 py-12 rounded-3xl glass-strong">
        {/* Spinning rings */}
        <div className="relative w-36 h-36 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border border-[#3b5bdb]/20 animate-spin-slow" />
          <div className="absolute inset-3 rounded-full border border-[#9775cd]/15 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          <div className="absolute inset-6 rounded-full border border-[#e8b339]/10 animate-spin-slow" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-9 rounded-full border border-[#3b5bdb]/25 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '8s' }} />

          {/* Center symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-float text-glow-accent select-none">✦</span>
          </div>

          {/* Orbiting particles */}
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-[#5b8af5]" style={{ animation: 'orbit 4s linear infinite' }} />
          <div className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-[#e8b339]" style={{ animation: 'orbit 6s linear infinite reverse' }} />
        </div>

        {/* Message */}
        <p className="text-lg text-[#e2e8f0] font-medium mb-2 transition-all duration-500">
          {MESSAGES[messageIndex]}
        </p>
        <p className="text-sm text-[#4a5568] mb-6">Quá trình này có thể mất 15-30 giây</p>

        {/* Progress bar */}
        <div className="w-64 mx-auto h-1 rounded-full bg-[#1a2236] overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3b5bdb] via-[#9775cd] to-[#e8b339] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= messageIndex
                  ? 'w-6 bg-[#3b5bdb]'
                  : 'w-1.5 bg-[#1e2538]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
