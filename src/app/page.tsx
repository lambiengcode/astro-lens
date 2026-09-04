import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import BirthForm from '@/components/ui/BirthForm';
import Astrolabe from '@/components/ui/Astrolabe';
import StatStrip from '@/components/ui/StatStrip';
import Reveal from '@/components/ui/Reveal';
import { Suspense } from 'react';
import { getLocale } from '@/lib/i18n/server';
import { getMessages } from '@/lib/i18n/messages';

/** Glyphs are locale-independent; the copy beside each comes from the catalogue. */
const PREVIEW_GLYPHS = ['◇', '⟳', '✦', '☯'];

export default async function Home() {
  const t = getMessages(await getLocale());
  return (
    <>
      <div className="app">
        <Header />
        <main className="flex-1">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">◈ {t.hero.eyebrow}</span>
              {/* Each line is clipped for the reveal, with the padding/negative
                  margin pair that keeps dấu nặng inside the box — DESIGN.md §6.4 */}
              <h1>
                <span className="ln"><i>{t.hero.line1}</i></span>
                <span className="ln"><i>{t.hero.line2a}<span className="em">{t.hero.line2em}</span></i></span>
                <span className="ln"><i>{t.hero.line3}</i></span>
              </h1>
              <p className="sub">{t.hero.sub}</p>
              <div className="acts">
                <a href="#lap-la-so" className="btn pri">{t.hero.cta}</a>
                <span className="micro"><s>✓</s> {t.hero.free} · <s>✓</s> {t.hero.noAuth}</span>
              </div>
            </div>
            <Astrolabe />
          </div>
        </section>

        <StatStrip />

        <section className="band" id="lap-la-so" data-rv>
          <div className="card">
            <div className="card-h">
              <span className="ix">01</span>
              <h3>{t.form.cardTitle}</h3>
              <span className="sp">{t.form.cardTime}</span>
            </div>
            <div className="card-b">
              <Suspense fallback={null}><BirthForm /></Suspense>
            </div>
          </div>

          <div className="prev-grid">
            {t.previews.map((p, i) => (
              <div className="prev" key={p.step}>
                <div className="ph">{PREVIEW_GLYPHS[i]} {p.step}</div>
                <h4>{p.h}</h4>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </section>
        </main>
      </div>
      <Footer />
      <Reveal />
    </>
  );
}
