'use client';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import GtLogoText from './GtLogoText';
import EverySentence, {
  type EverySentenceHandle,
  type EveryWord,
} from '@/components/shared/EverySentence';
import StudioField from '@/components/shared/StudioField';

import TranslateWindow from './TranslateWindow';

import '@/app/d/toolchain/sections/hero-terminal.css';

/**
 * Trust-row entries. Each name is set as its own typographic mark — the
 * `mark` class keys its weight, case, size and tracking in the trust-row
 * CSS — and the row rules into six cells between the band's two hairlines.
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
   the sibling TranslateWindow component; this hero only sets the stack
   around it: card, band, trust row, and the headline's measuring hinge
   below. */

/* The primary CTA goes to the product, never an in-page hop: the shipped
   hero resolves getDashboardSignInHref(locale) (apps/landing/src/lib/
   dashboard.ts), which is the dashboard origin plus /[locale]/signin. This
   reproduction renders the en-US resolution of that URL. */
const SIGN_IN_HREF = 'https://dash.generaltranslation.com/en-US/signin';

/* The WHOLE headline in each of the window's belt locales — ONE CLOCK:
   the belt below reports whichever locale it centres
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
const WORD_EN: EveryWord = { text: 'Scale to every language', lang: 'en' };

const WORDS: Record<string, EveryWord> = {
  en: WORD_EN,
  es: { text: 'Crece en todos los idiomas', lang: 'es' },
  ja: { text: 'あらゆる言語に展開', lang: 'ja' },
  de: { text: 'In jeder Sprache wachsen', lang: 'de' },
  ko: { text: '모든 언어로 확장하세요', lang: 'ko' },
  fr: { text: 'Passez au multilingue, sans limite', lang: 'fr' },
  zh: { text: '让产品说每一种语言', lang: 'zh' },
  pt: { text: 'Cresça em todos os idiomas', lang: 'pt' },
  ru: { text: 'Развивайте продукт на всех языках', lang: 'ru' },
  it: { text: 'Cresci in ogni lingua', lang: 'it' },
  hi: { text: 'हर भाषा में आगे बढ़ें', lang: 'hi' },
  nl: { text: 'Groei in elke taal', lang: 'nl' },
  tr: { text: 'Her dile açılın', lang: 'tr' },
  sv: { text: 'Väx på alla språk', lang: 'sv' },
  id: { text: 'Tumbuh dalam setiap bahasa', lang: 'id' },
  pl: { text: 'Rośnij w każdym języku', lang: 'pl' },
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

  /* No entrance animation: the headline, sub and actions stand at first
     paint. The [data-hero-in] hooks stay on the markup but nothing tweens
     them; the belt's own choreography below is independent. */

  return (
    <section className='tc-sec tch-hero-sec' id='top'>
      {/* The hero stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        {/* the whole sentence is the morphing unit — the measuring
            guides flank the full line and the belt rewrites all of it.
            hops={1}: the dissolved cloud pours straight into the next
            sentence's ink — the form corridor's one re-spread beat is
            skipped on the hero; the dissolve itself never changes. */}
        <h1 data-hero-in>
          <span>
            <EverySentence hops={1} initial='en' ref={every} words={WORDS} />
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          <GtLogoText /> builds full-stack infrastructure for localizing apps,
          docs, and websites
        </p>

        <div className='tc-hero-acts' data-hero-in>
          {/* the primary CTA goes to the product, never an in-page hop */}
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href={SIGN_IN_HREF}>
              Get Started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs' rel='noreferrer' target='_blank'>
            Docs
          </a>
        </div>
      </div>

      {/* The terminal band is a dark plate washed with the field canvas —
          lit at the flanks, dark in the centre column where the transcript
          sits (a #101010 terminal flanked by lit panels). The band itself
          stays square and full-width; only the window inside it keeps the
          rounded top corners and ring. The flank mask and wash opacity
          live in hero-terminal.css (.tch-field). */}
      <div className='tc-hero-cell tch-band'>
        {/* the shipped material, no switcher: the bayer-8x8 field drawn
            through the studio library's session-singleton GL context */}
        <StudioField className='tc-hero-field tch-field' preset='bayer8' />
        {/* one clock: the window reports its belt's active locale and the
            headline above morphs to that locale's sentence */}
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
