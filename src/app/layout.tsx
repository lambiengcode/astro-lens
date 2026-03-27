import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
