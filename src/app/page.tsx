import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import PrismaticField from '@/components/shared/PrismaticField';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { DIRECTIONS } from '@/lib/directions';

import PrototemplateHero from './PrototemplateHero';

import './prototemplate.css';

/* The nameplate speaks two voices, neither of them Switzer: Fraunces for the
   working model, Space Grotesk for the reusable form. The page's CONTENT runs
   Switzer display with Rasmus Andersson's Inter as the non-primary text face. */
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'Prototemplate',
  description:
    'Prototype × template — the working index of General Translation redesign directions.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** The presenter's actual running order. */
const DECK = [
  { n: '01', name: 'Intro', note: 'the nameplate' },
  { n: '02', name: 'Why', note: 'the case for a redesign' },
  { n: '03', name: 'Principles', note: 'the rules the system runs on' },
  { n: '04', name: 'Craft', note: 'the details, measured' },
  { n: '05', name: 'Type detail', note: 'letterforms at working size' },
  { n: '06', name: 'Prototypes', note: 'every direction, live' },
  { n: '07', name: 'Scoreboard', note: 'how each round was judged' },
] as const;

export default function IndexPage() {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <div className='pt-rail'>
        <header className='pt-nav'>
          <Link className='pt-nav-brand' href='/'>
            <span className='pt-mark' aria-hidden>
              <i className='pt-mark-line is-h is-top' />
              <i className='pt-mark-line is-h is-bot' />
              <i className='pt-mark-line is-v is-l' />
              <i className='pt-mark-line is-v is-r' />
              <i className='pt-mark-fill' />
            </span>
            <span className='pt-brand-word'>
              <b className='pt-face-serif'>proto</b>
              <b className='pt-face-grot'>template</b>
            </span>
          </Link>
          <div className='pt-nav-right'>
            <ThemeToggle className='pt-nav-theme' />
            <Link href='/present'>Present</Link>
            <Link href='/present?d=toolchain'>Toolchain</Link>
          </div>
        </header>

        <section className='pt-sec'>
          <PrototemplateHero />
        </section>

        <div className='pt-hatch' aria-hidden='true' />

        <section className='pt-sec pt-feature-sec'>
          <div className='pt-feature'>
            <PrismaticField className='pt-feature-field' preset='1' speed={0.4} params={{ exposureScale: 4600 }} />
            <div>
              <h2>Present.</h2>
              <p>
                The full walkthrough — one deck through the storyboard, the principles, every live
                prototype, and the scoreboard that picked the winners.
              </p>
              <Link className='pt-feature-cta' href='/present'>
                ▶ Open the deck
              </Link>
            </div>
            <div className='pt-deck'>
              {DECK.map((slide) => (
                <div className='pt-deck-row' key={slide.n}>
                  <b>
                    {slide.n} {slide.name}
                  </b>
                  <span>{slide.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className='pt-hatch' aria-hidden='true' />

        <section className='pt-sec'>
          <header className='pt-index-head'>
            <h2>Every direction.</h2>
            <span>{DIRECTIONS.length} directions · one storyboard</span>
          </header>

          <div className='pt-rows'>
            {DIRECTIONS.map((direction) => (
              <Link className='pt-row' href={`/present?d=${direction.slug}`} key={direction.slug}>
                <span className='pt-row-label'>{direction.label}</span>
                <span className='pt-row-main'>
                  <h3>{direction.name}</h3>
                  <p>{direction.concept}</p>
                </span>
                <span className='pt-row-tone'>{direction.tone}</span>
                <span className='pt-row-sig'>{direction.signature}</span>
              </Link>
            ))}
          </div>
        </section>

        <footer className='pt-foot'>
          <span>Prototemplate</span>
          <span className='pt-foot-right'>
            prototype × template
            <a
              href='https://x.com/sabosugi/status/2081742206847828171'
              rel='noreferrer'
              target='_blank'
            >
              prismatic shader by @sabosugi ↗
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
