import { Cormorant, Inter, Marcellus } from 'next/font/google';
import Image from 'next/image';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import './styles.css';

/* The three faces of the timetable: Marcellus carries every engraved
   heading, Cormorant italic carries the caption voice, Inter carries body
   copy and data. Each caller applies the variables on the root div. */
const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marcellus',
  display: 'swap',
});

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'liner-timetable — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/*
 * LINER TIMETABLE. 1930s ocean-liner and railway graphics on warm cream:
 * deep green and burgundy inks, gold rules, engraved double borders,
 * numbered plates. Localization restated as passage between languages.
 * The product proof is a departure pane and an arrival pane joined by a
 * gold route; the dashboard is a departures board; the locales are
 * luggage labels, each in its own script with its own route. All ornament
 * is CSS and inline SVG; all motion is CSS and gated by reduced motion.
 */

type Tok = { k?: 'kw' | 'gt' | 'str' | 'tag'; v: string };

/** The departure pane: nine lines of real gt-next, hand set. */
const CODE: readonly (readonly Tok[])[] = [
  [
    { k: 'kw', v: 'import' },
    { v: ' { ' },
    { k: 'gt', v: 'T' },
    { v: ' } ' },
    { k: 'kw', v: 'from' },
    { v: ' ' },
    { k: 'str', v: "'gt-next'" },
    { v: ';' },
  ],
  [],
  [{ k: 'kw', v: 'export default function' }, { v: ' Cabin() {' }],
  [{ v: '  ' }, { k: 'kw', v: 'return' }, { v: ' (' }],
  [{ v: '    ' }, { k: 'gt', v: '<T>' }],
  [
    { v: '      ' },
    { k: 'tag', v: '<h2>' },
    { v: 'Welcome aboard' },
    { k: 'tag', v: '</h2>' },
  ],
  [
    { v: '      ' },
    { k: 'tag', v: '<p>' },
    { v: 'Your booking is confirmed. We sail at seven.' },
    { k: 'tag', v: '</p>' },
  ],
  [{ v: '    ' }, { k: 'gt', v: '</T>' }],
  [{ v: '  ' }, { v: ');' }],
  [{ v: '}' }],
];

type Arrival = {
  code: string;
  lang: string;
  dir?: 'rtl';
  name: string;
  h: string;
  p: string;
};

/** The arrival pane cycles the same cabin card through four real renders. */
const ARRIVALS: readonly Arrival[] = [
  {
    code: 'EN',
    lang: 'en',
    name: 'English',
    h: 'Welcome aboard',
    p: 'Your booking is confirmed. We sail at seven.',
  },
  {
    code: 'ES',
    lang: 'es',
    name: 'Español',
    h: 'Bienvenido a bordo',
    p: 'Su reserva está confirmada. Zarpamos a las siete.',
  },
  {
    code: 'JA',
    lang: 'ja',
    name: '日本語',
    h: 'ご乗船ありがとうございます',
    p: 'ご予約を確認しました。出航は7時です。',
  },
  {
    code: 'AR',
    lang: 'ar',
    dir: 'rtl',
    name: 'العربية',
    h: 'مرحبا بكم على متن السفينة',
    p: 'تم تأكيد حجزكم. نبحر في الساعة السابعة.',
  },
];

type Step = { no: string; title: string; cmd: string; body: string };

const STEPS: readonly Step[] = [
  {
    no: '01',
    title: 'Install',
    cmd: 'npm i gt-next',
    body: 'Add the library and wrap your interface in the <T> component.',
  },
  {
    no: '02',
    title: 'Configure',
    cmd: 'npx gt@latest',
    body: 'The setup wizard sets your locales and the provider in one run.',
  },
  {
    no: '03',
    title: 'Translate',
    cmd: 'npx gt translate',
    body: 'Every build translates new strings and versions the result.',
  },
];

type BoardRow = {
  code: string;
  /** Native name, a real endonym, never machine-mangled text. */
  name: string;
  english: string;
  strings: string;
  cov: number;
  status: 'SAILED' | 'ON TIME' | 'BOARDING';
};

/* One project restated as a sailing list. Every locale measures against the
   same 1,208 source strings, and exactly one row is BOARDING. */
const BOARD: readonly BoardRow[] = [
  { code: 'ES', name: 'Español', english: 'Spanish', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'FR', name: 'Français', english: 'French', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'JA', name: '日本語', english: 'Japanese', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'DE', name: 'Deutsch', english: 'German', strings: '1,196 / 1,208', cov: 99, status: 'ON TIME' },
  { code: 'ZH', name: '中文', english: 'Chinese', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'KO', name: '한국어', english: 'Korean', strings: '1,183 / 1,208', cov: 98, status: 'ON TIME' },
  { code: 'PT', name: 'Português', english: 'Portuguese', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'AR', name: 'العربية', english: 'Arabic', strings: '1,166 / 1,208', cov: 97, status: 'ON TIME' },
  { code: 'HI', name: 'हिन्दी', english: 'Hindi', strings: '1,208 / 1,208', cov: 100, status: 'SAILED' },
  { code: 'TR', name: 'Türkçe', english: 'Turkish', strings: '302 / 1,208', cov: 25, status: 'BOARDING' },
];

type Port = {
  text: string;
  lang: string;
  dir?: 'rtl';
  route: string;
  name: string;
};

/** Twelve luggage labels, each a real greeting in its own script. */
const PORTS: readonly Port[] = [
  { text: 'Hola', lang: 'es', route: 'EN → ES', name: 'Español' },
  { text: 'Bonjour', lang: 'fr', route: 'EN → FR', name: 'Français' },
  { text: 'Hallo', lang: 'de', route: 'EN → DE', name: 'Deutsch' },
  { text: 'Ciao', lang: 'it', route: 'EN → IT', name: 'Italiano' },
  { text: 'Olá', lang: 'pt', route: 'EN → PT', name: 'Português' },
  { text: 'こんにちは', lang: 'ja', route: 'EN → JA', name: '日本語' },
  { text: '안녕하세요', lang: 'ko', route: 'EN → KO', name: '한국어' },
  { text: '你好', lang: 'zh', route: 'EN → ZH', name: '中文' },
  { text: 'مرحبا', lang: 'ar', dir: 'rtl', route: 'EN → AR', name: 'العربية' },
  { text: 'नमस्ते', lang: 'hi', route: 'EN → HI', name: 'हिन्दी' },
  { text: 'Γεια σας', lang: 'el', route: 'EN → EL', name: 'Ελληνικά' },
  { text: 'Merhaba', lang: 'tr', route: 'EN → TR', name: 'Türkçe' },
];

const TONES = ['green', 'burgundy', 'gold'] as const;

const FOOT_COLUMNS: readonly { title: string; links: readonly string[] }[] = [
  { title: 'Guides', links: ['Locadex Agent', 'Next.js', 'React', 'React Native'] },
  { title: 'Resources', links: ['Documentation', 'Blog', 'Pricing', 'Supported Locales'] },
  { title: 'Company', links: ['Careers', 'Contact', 'GitHub', 'Discord'] },
  { title: 'Legal', links: ['Terms of Service', 'Privacy', 'Acceptable Use', 'Manage Cookies'] },
];

/** A small gold diamond, the page's one separator glyph. */
function Dia() {
  return <span className='lt-dia' aria-hidden />;
}

/** The four rosettes pinned to a frame's inner gold rule. */
function Corners() {
  return (
    <>
      <span className='lt-corner is-tl' aria-hidden />
      <span className='lt-corner is-tr' aria-hidden />
      <span className='lt-corner is-bl' aria-hidden />
      <span className='lt-corner is-br' aria-hidden />
    </>
  );
}

/** A numbered section head: rules, a lozenge plate, the engraved title. */
function PlateHead({ no, title, sub }: { no: string; title: string; sub: string }) {
  return (
    <header className='lt-head'>
      <div className='lt-head-no' aria-hidden>
        <span className='lt-rule' />
        <span className='lt-lozenge'>Plate No. {no}</span>
        <span className='lt-rule is-flip' />
      </div>
      <h2>{title}</h2>
      <p>{sub}</p>
    </header>
  );
}

/** The poster: rays, sun, gulls, the liner, and the drifting sea. */
function LinerPoster() {
  const wave =
    'M-60 0 q30 -14 60 0' +
    ' t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0';
  return (
    <svg
      className='lt-poster'
      viewBox='0 0 720 340'
      role='img'
      aria-label='An ocean liner sailing before a rising sun'
    >
      <defs>
        <line id='lt-ray' x1='360' y1='188' x2='360' y2='16' />
        <path id='lt-wave' d={wave} />
      </defs>

      {/* sunrise fan */}
      <g className='lt-poster-rays' stroke='var(--lt-gold-2)' strokeWidth='2' opacity='0.5'>
        <use href='#lt-ray' transform='rotate(-80 360 188)' />
        <use href='#lt-ray' transform='rotate(-70 360 188)' />
        <use href='#lt-ray' transform='rotate(-60 360 188)' />
        <use href='#lt-ray' transform='rotate(-50 360 188)' />
        <use href='#lt-ray' transform='rotate(-40 360 188)' />
        <use href='#lt-ray' transform='rotate(-30 360 188)' />
        <use href='#lt-ray' transform='rotate(-20 360 188)' />
        <use href='#lt-ray' transform='rotate(-10 360 188)' />
        <use href='#lt-ray' />
        <use href='#lt-ray' transform='rotate(10 360 188)' />
        <use href='#lt-ray' transform='rotate(20 360 188)' />
        <use href='#lt-ray' transform='rotate(30 360 188)' />
        <use href='#lt-ray' transform='rotate(40 360 188)' />
        <use href='#lt-ray' transform='rotate(50 360 188)' />
        <use href='#lt-ray' transform='rotate(60 360 188)' />
        <use href='#lt-ray' transform='rotate(70 360 188)' />
        <use href='#lt-ray' transform='rotate(80 360 188)' />
      </g>

      {/* sun disc with an engraved inner ring */}
      <circle cx='360' cy='188' r='86' fill='none' stroke='var(--lt-gold)' strokeWidth='1.5' opacity='0.6' />
      <circle cx='360' cy='188' r='76' fill='var(--lt-gold-2)' />
      <circle cx='360' cy='188' r='60' fill='none' stroke='var(--lt-cream-2)' strokeWidth='2' opacity='0.85' />

      {/* gulls */}
      <path d='M116 118 q11 -9 22 0 q11 -9 22 0' fill='none' stroke='var(--lt-green)' strokeWidth='2' opacity='0.65' />
      <path d='M556 92 q8 -7 16 0 q8 -7 16 0' fill='none' stroke='var(--lt-green)' strokeWidth='2' opacity='0.5' />

      {/* smoke, two engraved curls drifting aft */}
      <path d='M290 174 q-20 -10 -14 -27 q5 -12 19 -12' fill='none' stroke='var(--lt-burgundy)' strokeWidth='2.5' opacity='0.35' />
      <path d='M344 172 q-26 -13 -18 -33 q6 -14 22 -14' fill='none' stroke='var(--lt-burgundy)' strokeWidth='2.5' opacity='0.28' />

      {/* hull, bow to starboard */}
      <path d='M598 250 L574 298 H176 Q152 298 156 272 L160 250 Z' fill='var(--lt-green-deep)' />
      <line x1='180' y1='291' x2='568' y2='291' stroke='var(--lt-burgundy)' strokeWidth='6' />
      <line
        x1='202'
        y1='266'
        x2='540'
        y2='266'
        stroke='var(--lt-cream-2)'
        strokeWidth='3.5'
        strokeDasharray='0.1 16'
        strokeLinecap='round'
        opacity='0.9'
      />

      {/* decks */}
      <rect x='216' y='234' width='300' height='16' fill='var(--lt-cream-2)' stroke='var(--lt-green-deep)' strokeWidth='1.5' />
      <rect x='244' y='220' width='238' height='14' fill='var(--lt-cream-2)' stroke='var(--lt-green-deep)' strokeWidth='1.5' />
      <rect x='420' y='206' width='62' height='14' fill='var(--lt-cream-2)' stroke='var(--lt-green-deep)' strokeWidth='1.5' />

      {/* three raked funnels with a gold lip */}
      <path d='M289 220 L311 220 L304 182 L282 182 Z' fill='var(--lt-burgundy)' />
      <line x1='282' y1='185' x2='304' y2='185' stroke='var(--lt-gold-2)' strokeWidth='2.5' />
      <path d='M341 220 L363 220 L356 182 L334 182 Z' fill='var(--lt-burgundy)' />
      <line x1='334' y1='185' x2='356' y2='185' stroke='var(--lt-gold-2)' strokeWidth='2.5' />
      <path d='M393 220 L415 220 L408 182 L386 182 Z' fill='var(--lt-burgundy)' />
      <line x1='386' y1='185' x2='408' y2='185' stroke='var(--lt-gold-2)' strokeWidth='2.5' />

      {/* masts and pennants */}
      <line x1='238' y1='234' x2='230' y2='150' stroke='var(--lt-green-deep)' strokeWidth='2.5' />
      <path d='M230 150 L256 157 L230 164 Z' fill='var(--lt-burgundy)' />
      <line x1='452' y1='206' x2='446' y2='140' stroke='var(--lt-green-deep)' strokeWidth='2.5' />
      <path d='M446 140 L470 146 L446 152 Z' fill='var(--lt-gold-2)' />

      {/* the sea, three drifting rules of scallops */}
      <g className='lt-poster-sea'>
        <use href='#lt-wave' y='302' fill='none' stroke='var(--lt-green)' strokeWidth='2.5' opacity='0.85' />
        <use href='#lt-wave' y='318' fill='none' stroke='var(--lt-gold)' strokeWidth='1.5' opacity='0.7' />
        <use href='#lt-wave' y='332' fill='none' stroke='var(--lt-green)' strokeWidth='2' opacity='0.45' />
      </g>
    </svg>
  );
}

export default function LinerTimetablePage() {
  return (
    <div
      id='top'
      className={`${marcellus.variable} ${cormorant.variable} ${inter.variable} liner-timetable-root`}
    >
      {/* masthead */}
      <div className='lt-topline'>
        <span>Sailings daily</span>
        <Dia />
        <span>The General Translation line</span>
        <Dia />
        <span>30+ languages served</span>
      </div>

      <header className='lt-nav'>
        <div className='lt-wrap lt-nav-in'>
          <a className='lt-brand' href='#top'>
            <Image src='/brand/no-bg-gt-logo-light.png' alt='' width={24} height={24} />
            General Translation
          </a>
          <nav className='lt-nav-links' aria-label='Site'>
            <a href='#component'>Docs</a>
            <a href='#fares'>Pricing</a>
            <a href='#departures'>Blog</a>
            <a href='#ports'>Enterprise</a>
          </nav>
          <div className='lt-nav-right'>
            <a className='lt-nav-signin' href='#fares'>
              Sign in
            </a>
            <a className='lt-btn is-solid is-sm' href='#fares'>
              Get a demo
            </a>
          </div>
        </div>
      </header>

      {/* Plate No. 1, the poster cover */}
      <section className='lt-hero'>
        <div className='lt-wrap'>
          <div className='lt-frame lt-hero-frame'>
            <Corners />
            <div className='lt-hero-band' aria-hidden>
              <span>Plate No. 1</span>
              <span className='lt-hero-band-mid'>Full-stack localization</span>
              <span>Timetable 2026</span>
            </div>

            <h1>
              <span className='lt-h1-line'>Passage to</span>
              <span className='lt-h1-line'>every language</span>
            </h1>

            <p className='lt-hero-caption'>
              The line sails daily between English and thirty other languages.
            </p>

            <p className='lt-hero-body'>
              General Translation is a full-stack localization platform. Open-source
              libraries, an AI agent, and a review dashboard carry a product written
              in one language to every port on the map.
            </p>

            <div className='lt-hero-cta'>
              <a className='lt-btn is-solid' href='#component'>
                Get started
              </a>
              <a className='lt-btn is-line' href='#component'>
                Read the docs
              </a>
            </div>

            <LinerPoster />

            <div className='lt-hero-manifest' aria-label='The fleet'>
              <span>gt-next</span>
              <Dia />
              <span>gt-react</span>
              <Dia />
              <span>CLI</span>
              <Dia />
              <span>Dashboard</span>
              <Dia />
              <span>Locadex</span>
            </div>
          </div>
        </div>
      </section>

      {/* Plate No. 2, the component proof */}
      <section className='lt-sec' id='component'>
        <div className='lt-wrap'>
          <PlateHead
            no='2'
            title='One component, every language'
            sub='Wrap JSX in the <T> component. gt-next translates the content at build time, serves it from the CDN, and renders each locale natively.'
          />

          <div className='lt-proof-grid'>
            <div className='lt-plate lt-pane'>
              <div className='lt-pane-cap'>
                <span>Departure · page.tsx</span>
                <span>en-US</span>
              </div>
              <pre className='lt-code'>
                {CODE.map((line, i) => (
                  <div className='lt-code-line' key={i}>
                    <span className='lt-ln' aria-hidden>
                      {i + 1}
                    </span>
                    <code>
                      {line.length === 0
                        ? ' '
                        : line.map((tok, j) =>
                            tok.k ? (
                              <span className={`lt-t-${tok.k}`} key={j}>
                                {tok.v}
                              </span>
                            ) : (
                              tok.v
                            )
                          )}
                    </code>
                  </div>
                ))}
              </pre>
            </div>

            <div className='lt-route' aria-hidden>
              <span className='lt-route-line' />
              <span className='lt-route-badge'>
                <b>&lt;T&gt;</b>
              </span>
              <span className='lt-route-line' />
            </div>

            <div className='lt-plate lt-pane'>
              <div className='lt-pane-cap is-burgundy'>
                <span>Arrival · rendered</span>
                <span>via CDN</span>
              </div>
              <div className='lt-arrive'>
                <div className='lt-arrive-stage'>
                  {ARRIVALS.map((a) => (
                    <div className='lt-arrive-layer' key={a.code} lang={a.lang} dir={a.dir}>
                      <span className='lt-arrive-chip' dir='ltr'>
                        {a.code} · {a.name}
                      </span>
                      <h3>{a.h}</h3>
                      <p>{a.p}</p>
                    </div>
                  ))}
                </div>
                <p className='lt-arrive-note'>
                  The same component, served in the reader&rsquo;s language.
                </p>
              </div>
            </div>
          </div>

          <div className='lt-steps'>
            {STEPS.map((step) => (
              <div className='lt-step' key={step.no}>
                <span className='lt-step-no'>No. {step.no}</span>
                <h3>{step.title}</h3>
                <code className='lt-cmd'>{step.cmd}</code>
                <p>{step.body}</p>
              </div>
            ))}
          </div>

          <div className='lt-porter'>
            <div>
              <h3>Locadex, the porter</h3>
              <p>
                Locadex is an AI agent that carries the setup for you. It reads your
                repository, wraps your components, configures the provider, and opens
                a pull request you can review.
              </p>
            </div>
            <code className='lt-cmd is-dark'>npx locadex@latest start</code>
          </div>
        </div>
      </section>

      {/* Plate No. 3, the departures board */}
      <section className='lt-sec' id='departures'>
        <div className='lt-wrap'>
          <PlateHead
            no='3'
            title='Departures'
            sub='The dashboard tracks every locale like a sailing. Strings are counted, coverage is measured, and each translation leaves on schedule.'
          />

          <div className='lt-board-scroll'>
            <div className='lt-board'>
              <div className='lt-board-cap'>
                <span>Departures · acme/web · production</span>
                <span>Gate GT-01</span>
              </div>

              <div className='lt-board-row is-head' aria-hidden>
                <span>Route</span>
                <span>Destination</span>
                <span className='lt-board-strings'>Strings</span>
                <span>Coverage</span>
                <span className='lt-board-status-col'>Status</span>
              </div>

              {BOARD.map((row) => (
                <div className='lt-board-row' key={row.code}>
                  <span className='lt-board-route'>EN → {row.code}</span>
                  <span className='lt-board-name'>
                    {row.name}
                    <small>{row.english}</small>
                  </span>
                  <span className='lt-board-strings'>{row.strings}</span>
                  <span className='lt-board-cov'>
                    <span className='lt-board-track' aria-hidden>
                      <i style={{ width: `${row.cov}%` }} />
                    </span>
                    {row.cov}%
                  </span>
                  <span className='lt-board-status-col'>
                    <span
                      className={`lt-status${row.status === 'BOARDING' ? ' is-boarding' : ''}${
                        row.status === 'ON TIME' ? ' is-ontime' : ''
                      }`}
                    >
                      {row.status}
                    </span>
                  </span>
                </div>
              ))}

              <div className='lt-board-foot'>
                <span>118 locales served · 10 on the board</span>
                <span>Updated 2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plate No. 4, the luggage labels */}
      <section className='lt-sec' id='ports'>
        <div className='lt-wrap'>
          <PlateHead
            no='4'
            title='Ports of call'
            sub='Every label below is a real greeting in its own script. The library serves more than 30 languages, each rendered natively, right to left where the script asks for it.'
          />

          <div className='lt-ports-grid'>
            {PORTS.map((port, i) => (
              <div className='lt-tag' data-tone={TONES[i % 3]} key={port.lang}>
                <div className='lt-tag-in'>
                  <span className='lt-tag-hole' aria-hidden />
                  <span className='lt-tag-word' lang={port.lang} dir={port.dir}>
                    {port.text}
                  </span>
                  <span className='lt-tag-route' dir='ltr'>
                    {port.route}
                  </span>
                  <span className='lt-tag-name' lang={port.lang} dir={port.dir}>
                    {port.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plate No. 5, fares */}
      <section className='lt-sec' id='fares'>
        <div className='lt-wrap'>
          <PlateHead
            no='5'
            title='Fares'
            sub='Start free and upgrade when you ship. Usage pricing applies past the free tier.'
          />

          <div className='lt-fares-grid'>
            <div className='lt-plate lt-ticket'>
              <div className='lt-ticket-cap'>Starter fare</div>
              <div className='lt-ticket-body'>
                <div className='lt-ticket-price'>
                  $0 <small>to start</small>
                </div>
                <p>Everything you need to localize a real product.</p>
                <ul>
                  <li>Every SDK and the translation CLI</li>
                  <li>Dashboard, glossaries, and the editor</li>
                  <li>Locadex agent runs on your repo</li>
                </ul>
                <div className='lt-ticket-tear' aria-hidden />
                <a className='lt-btn is-solid' href='#top'>
                  Get started
                </a>
              </div>
            </div>

            <div className='lt-plate lt-ticket'>
              <div className='lt-ticket-cap is-burgundy'>Enterprise fare</div>
              <div className='lt-ticket-body'>
                <div className='lt-ticket-price'>
                  Custom <small>annual</small>
                </div>
                <p>Talk to an engineer about implementation, volume, and your security review.</p>
                <ul>
                  <li>Volume pricing across projects</li>
                  <li>SOC 2 Type II, GDPR, ISO 27001</li>
                  <li>Support from the engineers who build it</li>
                </ul>
                <div className='lt-ticket-tear' aria-hidden />
                <a className='lt-btn is-line' href='#top'>
                  Contact us
                </a>
              </div>
            </div>
          </div>

          <p className='lt-fares-compare'>
            <a href='#top'>Compare plans and usage pricing →</a>
          </p>
        </div>
      </section>

      <footer className='lt-foot'>
        <div className='lt-foot-rays' aria-hidden />
        <div className='lt-wrap lt-foot-in'>
          <div className='lt-foot-brand'>
            <Image src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' width={30} height={30} />
            <p>End-to-end localization for the world&rsquo;s best companies.</p>
          </div>
          <div className='lt-foot-cols'>
            {FOOT_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4>{column.title}</h4>
                <ul>
                  {column.links.map((label) => (
                    <li key={label}>
                      <a href='#top'>{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className='lt-wrap lt-foot-bar'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </footer>

      <DirectionCorner slug='liner-timetable' />
    </div>
  );
}
