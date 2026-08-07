'use client';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';


import TranslateWindow from '@/app/d/_v0/TranslateWindow';
import EverySentence, {
  type EverySentenceHandle,
  type EveryWord,
} from '@/components/shared/EverySentence';
import HeroFieldSwitcher from '@/components/shared/HeroFieldSwitcher';

import '@/app/d/toolchain/sections/hero-terminal.css';

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* The windowed demo itself — data, timelines, inspector, seam — lives in
   the shared TranslateWindow (src/app/d/_v0/TranslateWindow.tsx); this
   hero only sets the stack around it: card, band, trust row, and the
   headline's measuring hinge below. */

/* The WHOLE headline in each of the window's belt locales — ONE CLOCK
   (founder round: "make the whole sentence translate and retranslate
   itself"): the belt below reports whichever locale it centres
   (TranslateWindow's onLocaleChange) and the em morphs the entire
   sentence to that locale, so the headline never runs a timer of its
   own and the line up here always speaks the locale on screen. The
   morph engine itself is the shared EverySentence component (dissolve
   to dust, disperse, reassemble, print-front absorb); this hero owns
   only the roster and the belt wiring. The belt leads with en, so the
   resting SSR sentence is also the belt's first stop. Each sentence
   carries its BCP-47 tag so the hidden measurer and the live line
   shape with the same fonts; none of the sixteen are RTL (the roster
   excludes ar/he until the seam mirrors), but the rtl wiring — probe
   dir, bidi isolate, reading-side wipe — lives on in the component
   for the day one arrives. */
const WORD_EN: EveryWord = { text: 'Launch in every language', lang: 'en' };

const WORDS: Record<string, EveryWord> = {
  en: WORD_EN,
  es: { text: 'Lanza en todos los idiomas', lang: 'es' },
  ja: { text: 'あらゆる言語でローンチ', lang: 'ja' },
  fr: { text: 'Lancez dans toutes les langues', lang: 'fr' },
  ko: { text: '모든 언어로 출시하세요', lang: 'ko' },
  de: { text: 'In jeder Sprache launchen', lang: 'de' },
  zh: { text: '用每种语言发布', lang: 'zh' },
  pt: { text: 'Lance em todos os idiomas', lang: 'pt' },
  ru: { text: 'Запускайтесь на любом языке', lang: 'ru' },
  it: { text: 'Lancia in ogni lingua', lang: 'it' },
  hi: { text: 'हर भाषा में लॉन्च करें', lang: 'hi' },
  nl: { text: 'Lanceer in elke taal', lang: 'nl' },
  tr: { text: 'Her dilde yayına alın', lang: 'tr' },
  sv: { text: 'Lansera på alla språk', lang: 'sv' },
  id: { text: 'Luncurkan dalam setiap bahasa', lang: 'id' },
  pl: { text: 'Uruchamiaj w każdym języku', lang: 'pl' },
};

export default function HomeHero() {
  /* the belt's hand on the headline: TranslateWindow calls
     handleBeltLocale once on mount and on every active-locale change;
     the EverySentence engine consumes it. The component buffers calls
     that land before its own effect has run, so mount order is safe. */
  const every = useRef<EverySentenceHandle>(null);
  const handleBeltLocale = (loc: string) => {
    every.current?.setLocale(loc);
  };

  /* no entrance: the hero stands the moment it paints (founder) — the
     headline engine in EverySentence carries all the motion this fold
     needs, on the belt's clock */

  return (
    <section className='tc-sec tch-hero-sec' id='top'>
      {/* The founder's stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        {/* Two authored lines rather than a wrap: "Launch in / every language."
            — the accented word opens line two, on the hinge of the sentence. */}
        {/* the whole sentence is the morphing unit now — the measuring
            guides flank the full line and the belt rewrites all of it.
            hops={1} (founder: "for the home page hero, let's just do 1
            hop"): the dissolve pours straight into the next sentence's
            ink — no intermediate cloud pose on the hero. */}
        <h1>
          <span>
            <EverySentence hops={1} initial='en' ref={every} words={WORDS} />
          </span>
        </h1>

        <p className='tc-hero-sub'>
          <img alt='General Translation' className='tch-sub-mark is-light' src='/brand/no-bg-gt-logo-light-96.png' width={96} height={96} /><img alt='' aria-hidden className='tch-sub-mark is-dark' src='/brand/no-bg-gt-logo-dark-96.png' width={96} height={96} /> builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts'>
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href='#deploy'>
              Get started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs' rel='noreferrer' target='_blank'>
            Docs
          </a>
        </div>
      </div>

      {/* The first viewport commits to a material the way the references do:
          the terminal band is a dark plate washed with the prismatic field —
          lit at the flanks, dark in the centre column where the transcript
          sits (the viteplus grammar: a #101010 terminal flanked by lit panels).
          The band itself stays square and full-width; only the window inside
          it keeps the measured top corners and ring. exposureScale is raised
          (= dimmer) so the flanks wash rather than saturate. */}
      <div className='tc-hero-cell tch-band'>
        {/* the band's field + the founder's review ladder: the ten-slot
            Bayer family (BAYER_PRESETS), default 02 = bayer-8x8, the
            founder pick */}
        <HeroFieldSwitcher />
        {/* one clock: the window reports its belt's active locale and the
            headline above morphs to that locale's word for "language" */}
        <TranslateWindow onLocaleChange={handleBeltLocale} />
      </div>

      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
