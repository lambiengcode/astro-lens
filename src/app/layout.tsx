import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Noto_Serif } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { HTML_LANG, SCRIPT_OF, type Script } from "@/lib/i18n/locales";
import { LocaleProvider } from "@/lib/i18n/context";

// Every family loads the `vietnamese` subset. Without it the browser falls back
// per-glyph and diacritics change weight mid-word — DESIGN.md §6.1.
//
// These three stay loaded in every locale, which is the point of DESIGN.md
// §15.4's fallback chain: Latin digits and ranges (`24–33`, `2017–2026`) keep
// coming from IBM Plex Mono so §6.2's tabular alignment survives, and only the
// CJK glyphs fall through to the CJK family per glyph.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// ── The CJK and Hangul families — DESIGN.md §15.4 ────────────────────────────
//
// These are NOT loaded through `next/font/google`. Google Fonts has no named
// subset for the CJK families (`next/font`'s own font-data lists only cyrillic,
// latin, latin-ext and vietnamese for Noto Sans SC/TC/KR), so `next/font` falls
// back to downloading and self-hosting *every* unicode-range slice the Google
// CSS names — several hundred files per family, from a stylesheet that is
// 226 KB before a single glyph is fetched. Six families of that is exactly the
// "megabytes per locale" DESIGN.md §15.7 forbids.
//
// The stylesheet link below is the delivery mechanism CJK webfonts are designed
// for: Google serves one @font-face per unicode-range, and the browser fetches
// only the slices whose glyphs are actually on the page — tens of kilobytes,
// not megabytes. One family is linked, for the active locale only; `vi` and
// `en` link nothing at all, so the Vietnamese screens are untouched.
const CJK_STYLESHEET: Partial<Record<Script, string>> = {
  hans: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@400;600&display=swap',
  hant: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600&family=Noto+Serif+TC:wght@400;600&display=swap',
  hangul: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600&family=Noto+Serif+KR:wght@400;600&display=swap',
};

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return {
    title: t.app.title,
    description: t.app.description,
    keywords: t.app.keywords,
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: '/icon.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const script = SCRIPT_OF[locale];
  const stylesheet = CJK_STYLESHEET[script];

  return (
    <html
      lang={HTML_LANG[locale]}
      data-script={script}
      className={`${plexSans.variable} ${plexMono.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* React 19 hoists these into <head>. Two things it insists on: they
            must sit inside the tree rather than directly under <html>, and a
            stylesheet must declare a `precedence` or React refuses to hoist it
            and logs a hydration error. Both were found by the console sweep in
            PARITY.md §9.3, which is why it is run per locale. */}
        {stylesheet && (
          <>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={stylesheet} precedence="default" />
          </>
        )}
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
