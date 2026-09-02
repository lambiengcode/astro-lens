import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import GlassEffects from '@/components/ui/GlassEffects';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tử Vi Đẩu Số — Luận Giải Lá Số",
  description: "Ứng dụng luận giải Tử Vi Đẩu Số chuyên sâu, kết hợp trí tuệ nhân tạo. Phân tích 12 cung, ngũ hành, vận hạn và định hướng phát triển.",
  keywords: ["tử vi", "đẩu số", "tử vi đẩu số", "lá số tử vi", "xem tử vi", "luận giải tử vi"],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><GlassEffects /><div className="aurora" aria-hidden="true"><div className="aurora-blob aurora-azure" /><div className="aurora-blob aurora-violet" /><div className="aurora-blob aurora-gold" /><div className="aurora-blob aurora-fuchsia" /></div><div className="noise" aria-hidden="true" /><div className="stars-bg stars-global" aria-hidden="true" />{children}</body>
    </html>
  );
}
