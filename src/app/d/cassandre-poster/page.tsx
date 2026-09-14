import { Inter, Josefin_Sans } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import './styles.css';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'cassandre-poster — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * CASSANDRE POSTER — the A.M. Cassandre poster school (Normandie, Étoile du
 * Nord) as a landing page. Each section is a full-bleed poster panel:
 * one enormous geometric form, airbrushed CSS gradients, midnight blue,
 * vermilion and cream, and small precise caption type. The hero draws the
 * <T> component as a monumental ship prow cutting through a sea of world
 * scripts; the proof section is the Étoile du Nord rails, converging from
 * a single source string to the star through five locales. All ornament is
 * inline SVG and CSS gradients; motion is CSS only and gated behind
 * prefers-reduced-motion.
 */

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

const ROUTE = ['EN', 'FR', 'ES', 'DE', 'PT', 'IT', 'JA', 'KO', 'ZH', 'AR', 'HI', 'TR'];

const GREETINGS: { text: string; name: string; code: string; dir?: 'rtl' }[] = [
  { text: 'Hola', name: 'Spanish', code: 'es' },
  { text: 'Bonjour', name: 'French', code: 'fr' },
  { text: 'Hallo', name: 'German', code: 'de' },
  { text: 'Ciao', name: 'Italian', code: 'it' },
  { text: 'Olá', name: 'Portuguese', code: 'pt' },
  { text: 'Γεια', name: 'Greek', code: 'el' },
  { text: 'こんにちは', name: 'Japanese', code: 'ja' },
  { text: '안녕하세요', name: 'Korean', code: 'ko' },
  { text: '你好', name: 'Chinese', code: 'zh' },
  { text: 'مرحبا', name: 'Arabic', code: 'ar', dir: 'rtl' },
  { text: 'नमस्ते', name: 'Hindi', code: 'hi' },
  { text: 'Merhaba', name: 'Turkish', code: 'tr' },
];

/* Ordered near to far: the widest, largest row sits closest to the viewer.
   The ol renders in column-reverse, so DOM order stays source-first. */
const STATIONS: { code: string; lang: string; dir?: 'rtl'; text: string }[] = [
  { code: 'ES', lang: 'es', text: 'Comienza tu prueba gratuita' },
  { code: 'FR', lang: 'fr', text: 'Commencez votre essai gratuit' },
  { code: 'JA', lang: 'ja', text: '無料トライアルを開始' },
  { code: 'KO', lang: 'ko', text: '무료 체험 시작하기' },
  { code: 'AR', lang: 'ar', dir: 'rtl', text: 'ابدأ تجربتك المجانية' },
];

/* ------------------------------------------------------------------ */
/* Ornament: inline SVG only                                          */
/* ------------------------------------------------------------------ */

/** The GT prow monogram used in the nav and the footer. */
function BrandMark() {
  return (
    <svg className='cp-brandmark' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
      <path d='M12 1.5 L22 22.5 L17.4 22.5 L12 10.5 L6.6 22.5 L2 22.5 Z' fill='currentColor' />
    </svg>
  );
}

/**
 * The hero plate: a head-on liner prow in the Normandie composition.
 * Horizon glow, two searchlight beams, gulls, the hull with its stem
 * highlight and porthole rows, a vermilion boot-top band at the waterline,
 * cream bow waves, and the <T> mark set on the hull like a ship's name.
 */
function HeroArt() {
  return (
    <svg
      className='cp-art'
      viewBox='0 0 1200 780'
      preserveAspectRatio='xMidYMax meet'
      role='img'
      aria-label='A monumental ship prow bearing the T component, cutting through a sea of world scripts'
    >
      <defs>
        <linearGradient id='cpHull' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#263b60' />
          <stop offset='0.55' stopColor='#152741' />
          <stop offset='1' stopColor='#0a1526' />
        </linearGradient>
        <radialGradient id='cpGlow' cx='0.5' cy='0.55' r='0.62'>
          <stop offset='0' stopColor='#f2e7d3' stopOpacity='0.34' />
          <stop offset='0.55' stopColor='#8fa5c5' stopOpacity='0.1' />
          <stop offset='1' stopColor='#8fa5c5' stopOpacity='0' />
        </radialGradient>
        <linearGradient id='cpBeam' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#f2e7d3' stopOpacity='0.13' />
          <stop offset='1' stopColor='#f2e7d3' stopOpacity='0' />
        </linearGradient>
      </defs>

      {/* horizon glow */}
      <ellipse cx='600' cy='640' rx='560' ry='330' fill='url(#cpGlow)' />

      {/* searchlight beams */}
      <path d='M600 120 L210 764 L334 764 Z' fill='url(#cpBeam)' />
      <path d='M600 120 L990 764 L866 764 Z' fill='url(#cpBeam)' />

      {/* gulls */}
      <g stroke='#f2e7d3' strokeWidth='3' fill='none' strokeLinecap='round' opacity='0.65'>
        <path d='M146 152 q 13 -14 26 -2 q 13 -12 26 0' />
        <path d='M958 108 q 12 -13 24 -2 q 12 -11 24 0' />
        <path d='M1032 168 q 9 -10 18 -1 q 9 -9 18 0' />
      </g>

      {/* hull */}
      <path
        d='M600 56 C 614 250 706 540 812 738 L812 764 L388 764 L388 738 C 494 540 586 250 600 56 Z'
        fill='url(#cpHull)'
      />
      {/* leading-edge highlight and stem line */}
      <path
        d='M600 56 C 586 250 494 540 388 738'
        stroke='#f2e7d3'
        strokeOpacity='0.4'
        strokeWidth='2.5'
        fill='none'
      />
      <path d='M600 68 L600 704' stroke='#f2e7d3' strokeOpacity='0.2' strokeWidth='2' fill='none' />

      {/* masthead star */}
      <path d='M600 268 L607 296 L634 302 L607 308 L600 336 L593 308 L566 302 L593 296 Z' fill='#ee5b33' />

      {/* the mark on the hull */}
      <text className='cp-hull-t' x='600' y='596' textAnchor='middle'>
        {'<T>'}
      </text>

      {/* porthole rows */}
      <g fill='#f2e7d3' opacity='0.5'>
        <circle cx='480' cy='652' r='4' />
        <circle cx='520' cy='652' r='4' />
        <circle cx='560' cy='652' r='4' />
        <circle cx='600' cy='652' r='4' />
        <circle cx='640' cy='652' r='4' />
        <circle cx='680' cy='652' r='4' />
        <circle cx='720' cy='652' r='4' />
        <circle cx='500' cy='684' r='3.5' />
        <circle cx='540' cy='684' r='3.5' />
        <circle cx='580' cy='684' r='3.5' />
        <circle cx='620' cy='684' r='3.5' />
        <circle cx='660' cy='684' r='3.5' />
        <circle cx='700' cy='684' r='3.5' />
      </g>

      {/* boot-top band at the waterline */}
      <rect x='392' y='736' width='416' height='28' fill='#c93d1f' />

      {/* bow waves */}
      <g className='cp-bowwave' fill='#f2e7d3'>
        <path d='M600 742 C 552 700 470 704 404 756 L600 764 Z' opacity='0.92' />
        <path d='M600 742 C 648 700 730 704 796 756 L600 764 Z' opacity='0.92' />
        <path d='M404 756 C 340 742 300 748 258 764 L404 764 Z' opacity='0.5' />
        <path d='M796 756 C 860 742 900 748 942 764 L796 764 Z' opacity='0.5' />
      </g>
    </svg>
  );
}

/** The Étoile du Nord rails: four lines and five sleepers converging on the star. */
function RailsArt() {
  return (
    <svg
      className='cp-rails-art'
      viewBox='0 0 800 640'
      preserveAspectRatio='none'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <radialGradient id='cpStarGlow' cx='0.5' cy='0.5' r='0.5'>
          <stop offset='0' stopColor='#f2e7d3' stopOpacity='0.4' />
          <stop offset='1' stopColor='#f2e7d3' stopOpacity='0' />
        </radialGradient>
      </defs>
      <g stroke='#f2e7d3' strokeOpacity='0.22' strokeWidth='1.5' fill='none'>
        <path d='M400 78 L20 640' />
        <path d='M400 78 L780 640' />
        <path d='M400 78 L230 640' />
        <path d='M400 78 L570 640' />
      </g>
      <g stroke='#f2e7d3' strokeOpacity='0.1' strokeWidth='1'>
        <path d='M310 220 L490 220' />
        <path d='M268 300 L532 300' />
        <path d='M222 390 L578 390' />
        <path d='M168 480 L632 480' />
        <path d='M108 575 L692 575' />
      </g>
      <circle className='cp-star-glow' cx='400' cy='78' r='72' fill='url(#cpStarGlow)' />
      <path
        className='cp-star'
        d='M400 6 L409 64 L452 78 L409 92 L400 150 L391 92 L348 78 L391 64 Z'
        fill='#f2e7d3'
      />
      <path d='M400 42 L404 74 L400 106 L396 74 Z' fill='#ee5b33' />
    </svg>
  );
}

/** Plate emblem: nested prow chevron. */
function EmblemProw() {
  return (
    <svg className='cp-emblem' viewBox='0 0 64 64' aria-hidden='true' focusable='false'>
      <path d='M32 4 L58 60 L45 60 L32 30 L19 60 L6 60 Z' fill='currentColor' />
      <path d='M32 40 L41 60 L23 60 Z' fill='currentColor' opacity='0.55' />
    </svg>
  );
}

/** Plate emblem: the north star. */
function EmblemStar() {
  return (
    <svg className='cp-emblem' viewBox='0 0 64 64' aria-hidden='true' focusable='false'>
      <path d='M32 2 L37 26 L56 32 L37 38 L32 62 L27 38 L8 32 L27 26 Z' fill='currentColor' />
    </svg>
  );
}

/** Plate emblem: sunburst. */
function EmblemBurst() {
  return (
    <svg className='cp-emblem' viewBox='0 0 64 64' aria-hidden='true' focusable='false'>
      <g stroke='currentColor' strokeWidth='4' strokeLinecap='round'>
        <path d='M32 4 L32 18' />
        <path d='M32 46 L32 60' />
        <path d='M4 32 L18 32' />
        <path d='M46 32 L60 32' />
        <path d='M12 12 L22 22' />
        <path d='M42 42 L52 52' />
        <path d='M52 12 L42 22' />
        <path d='M22 42 L12 52' />
      </g>
      <circle cx='32' cy='32' r='9' fill='currentColor' />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                           */
/* ------------------------------------------------------------------ */

function TopNav() {
  return (
    <header className='cp-nav'>
      <a className='cp-nav-brand' href='#top'>
        <BrandMark />
        General Translation
      </a>
      <nav className='cp-nav-links' aria-label='Site'>
        <a href='#component'>Component</a>
        <a href='#languages'>Languages</a>
        <a href='#platform'>Platform</a>
        <a href='#pricing'>Pricing</a>
      </nav>
      <div className='cp-nav-right'>
        <a href='#pricing'>Sign in</a>
        <a className='cp-btn cp-btn-solid cp-btn-sm' href='#pricing'>
          Get started
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className='cp-hero' id='top'>
      <p className='cp-hero-line'>Full-stack localization</p>

      <div className='cp-hero-artwrap'>
        <HeroArt />
      </div>

      {/* the sea: a slow band of world scripts under the waterline */}
      <div className='cp-sea' aria-hidden='true'>
        <div className='cp-sea-track'>
          {[0, 1].map((run) => (
            <div className='cp-sea-run' key={run}>
              {GREETINGS.map((g) => (
                <span key={g.code} dir={g.dir ?? 'ltr'} lang={g.code}>
                  {g.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='cp-hero-name'>
        <p className='cp-route' aria-label='Supported locales'>
          {ROUTE.map((r, i) => (
            <span key={r}>
              {i > 0 && <em aria-hidden='true'>·</em>}
              {r}
            </span>
          ))}
        </p>
        <h1>General Translation</h1>
        <div className='cp-rule-double' aria-hidden='true' />
        <p className='cp-hero-caption'>
          General Translation is a full-stack localization platform. Open-source libraries, a
          translation dashboard, and the Locadex agent take your app from one language to more than
          thirty.
        </p>
        <div className='cp-hero-cta'>
          <a className='cp-btn cp-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='cp-btn cp-btn-line' href='#component'>
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className='cp-proof' id='component'>
      <header className='cp-head'>
        <p className='cp-kicker'>01</p>
        <h2>One component</h2>
        <p className='cp-lead'>
          You wrap existing JSX in the T component from gt-next. The CLI translates the project at
          build time, and the runtime serves each visitor their own language.
        </p>
      </header>

      <div className='cp-rails'>
        <RailsArt />
        <ol className='cp-stations'>
          {STATIONS.map((s) => (
            <li key={s.code} lang={s.lang} dir={s.dir ?? 'ltr'}>
              <span className='cp-station-code' dir='ltr'>
                {s.code}
              </span>
              <span className='cp-station-text'>{s.text}</span>
            </li>
          ))}
        </ol>

        <pre className='cp-code' aria-label='Example usage of the T component'>
          <code>
            <span className='cp-code-tag'>{'<T>'}</span>
            {'\n  <button>'}
            <span className='cp-code-str'>Start your free trial</span>
            {'</button>\n'}
            <span className='cp-code-tag'>{'</T>'}</span>
          </code>
        </pre>
      </div>

      <p className='cp-caption'>
        One button, written once in English, arrives in every configured locale.
      </p>
    </section>
  );
}

function Scripts() {
  return (
    <section className='cp-scripts' id='languages'>
      <header className='cp-head'>
        <p className='cp-kicker'>02</p>
        <h2>Writing systems</h2>
        <p className='cp-lead'>
          The T component carries more than words. Plural rules, number and date formats, and text
          direction follow each locale, so Arabic renders right to left from the same source.
        </p>
      </header>

      <div className='cp-scripts-grid'>
        <div className='cp-glyph-wrap'>
          <span className='cp-glyph' lang='zh' aria-hidden='true'>
            文
          </span>
          <span className='cp-glyph-label'>U+6587 · Writing</span>
        </div>

        <ul className='cp-ledger'>
          {GREETINGS.map((g) => (
            <li key={g.code} lang={g.code} dir={g.dir ?? 'ltr'}>
              <span className='cp-ledger-word'>{g.text}</span>
              <span className='cp-ledger-meta' dir='ltr'>
                {g.name} · {g.code}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className='cp-products' id='platform'>
      <header className='cp-head'>
        <p className='cp-kicker'>03</p>
        <h2>The platform</h2>
        <p className='cp-lead'>
          Three parts cover the whole workflow. Each one works alone, and together they take a
          project from first commit to production in every language.
        </p>
      </header>

      <div className='cp-triptych'>
        <article className='cp-plate cp-plate-cream'>
          <EmblemProw />
          <h3>Libraries</h3>
          <p>
            gt-next and gt-react are open-source libraries for Next.js and React. The T component
            marks JSX for translation, and string functions cover everything else.
          </p>
          <a href='#top'>Read the docs →</a>
        </article>

        <article className='cp-plate cp-plate-verm'>
          <EmblemStar />
          <h3>Dashboard and CLI</h3>
          <p>
            The gtx-cli command translates your project at build time. The dashboard holds every
            string, so your team reviews and edits translations without a code change.
          </p>
          <a href='#top'>Open the dashboard →</a>
        </article>

        <article className='cp-plate cp-plate-navy'>
          <EmblemBurst />
          <h3>Locadex</h3>
          <p>
            Locadex is an AI agent for i18n setup. It reads your repository, wraps your components,
            and opens a pull request with the finished integration.
          </p>
          <a href='#top'>Meet the agent →</a>
        </article>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='cp-pricing' id='pricing'>
      <header className='cp-head'>
        <p className='cp-kicker'>04</p>
        <h2>Pricing</h2>
        <p className='cp-lead'>
          Start free and upgrade when you ship. Usage pricing is published on the pricing page.
        </p>
      </header>

      <div className='cp-plans'>
        <article className='cp-plan cp-plan-cream'>
          <h3>Starter</h3>
          <p className='cp-price'>
            <strong>$0</strong>
            <span>to start</span>
          </p>
          <p className='cp-plan-body'>
            Everything you need to localize a real product, from the first component to review.
          </p>
          <ul>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, glossaries, and review</li>
            <li>Locadex runs on your repository</li>
          </ul>
          <a className='cp-btn cp-btn-ink' href='#top'>
            Get started
          </a>
        </article>

        <article className='cp-plan cp-plan-navy'>
          <h3>Enterprise</h3>
          <p className='cp-price'>
            <strong>Custom</strong>
            <span>annual</span>
          </p>
          <p className='cp-plan-body'>
            Talk to an engineer about implementation, volume, and your security review.
          </p>
          <ul>
            <li>Volume pricing across projects</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build GT</li>
          </ul>
          <a className='cp-btn cp-btn-line' href='#top'>
            Contact us
          </a>
        </article>
      </div>

      <p className='cp-compare'>
        <a href='#top'>Compare plans and usage pricing →</a>
      </p>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className='cp-footer'>
      <div className='cp-footer-rule' aria-hidden='true' />
      <div className='cp-footer-grid'>
        <div className='cp-footer-brand'>
          <p className='cp-footer-mark'>
            <BrandMark />
            General Translation
          </p>
          <p>
            General Translation builds localization tools for modern software. The libraries are
            open source.
          </p>
        </div>

        <nav aria-label='Product'>
          <h4>Product</h4>
          <a href='#component'>gt-next</a>
          <a href='#component'>gt-react</a>
          <a href='#platform'>gtx-cli</a>
          <a href='#platform'>Dashboard</a>
          <a href='#platform'>Locadex</a>
        </nav>

        <nav aria-label='Resources'>
          <h4>Resources</h4>
          <a href='#component'>Docs</a>
          <a href='#pricing'>Pricing</a>
          <a href='#top'>Blog</a>
          <a href='#pricing'>Enterprise</a>
        </nav>

        <nav aria-label='Company'>
          <h4>Company</h4>
          <a href='#top'>GitHub</a>
          <a href='#top'>X</a>
          <a href='#top'>Discord</a>
          <a href='#top'>Contact</a>
        </nav>
      </div>

      <div className='cp-footer-base'>
        <p>© 2026 General Translation, Inc.</p>
        <p>Set in Josefin Sans and Inter</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function CassandrePosterPage() {
  return (
    <>
      <div className={`cassandre-poster-root ${josefin.variable} ${inter.variable}`}>
        <TopNav />
        <Hero />
        <Proof />
        <Scripts />
        <Products />
        <Pricing />
        <SiteFooter />
      </div>
      <DirectionCorner slug='cassandre-poster' />
    </>
  );
}
