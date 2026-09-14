import { Big_Shoulders, Marcellus } from 'next/font/google';
import Image from 'next/image';
import type { CSSProperties } from 'react';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import ElevatorRail from './ElevatorRail';

import './styles.css';

export const metadata = {
  title: 'spire-setbacks — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * SPIRE SETBACKS — a real Art Deco elevation. The page is a 1930 tower drawn
 * on cream limestone: each section is a stepped setback, framed in double ink
 * rules, and the page narrows as it descends, so scrolling down is riding the
 * tower up. The nav is the entrance canopy, a fixed elevator panel on the
 * right tracks the floor you are on, the locales section is a brass floor
 * directory where every language is a floor line in its own script, and the
 * elevation terminates in a stepped finial and mast. Jade and brass carry
 * the accents; Big Shoulders carries the tall condensed display; Inter
 * (the site's own) carries body copy; Marcellus carries the engraved
 * plaques. All ornament is CSS gradients and inline SVG.
 */

const display = Big_Shoulders({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-spire-display',
  display: 'swap',
});

const plaque = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-spire-plaque',
  display: 'swap',
});

/* ---------------------------------------------------------------- data */

const TENANTS = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'] as const;

const SOURCE_CODE = `import { T } from 'gt-next';

export function Welcome() {
  return (
    <T>
      <h2>Welcome back</h2>
      <p>Your project is ready.</p>
    </T>
  );
}`;

type Rendered = {
  tag: string;
  lang: string;
  title: string;
  body: string;
  rtl?: boolean;
  source?: boolean;
};

/* The one component rendered in five locales, stacked as its own small
   setbacks: the source card is the widest, each translation steps in. */
const RENDERED: readonly Rendered[] = [
  { tag: 'en', lang: 'en', title: 'Welcome back', body: 'Your project is ready.', source: true },
  { tag: 'es', lang: 'es', title: 'Bienvenido de nuevo', body: 'Tu proyecto está listo.' },
  { tag: 'de', lang: 'de', title: 'Willkommen zurück', body: 'Dein Projekt ist bereit.' },
  { tag: 'ja', lang: 'ja', title: 'おかえりなさい', body: 'プロジェクトの準備ができました。' },
  { tag: 'ar', lang: 'ar', rtl: true, title: 'مرحبًا بعودتك', body: 'مشروعك جاهز.' },
];

type FloorLine = {
  num: string;
  greeting: string;
  lang: string;
  name: string;
  tag: string;
  rtl?: boolean;
  source?: boolean;
};

/* The floor directory. Real greetings, correct lang and dir per line. */
const DIRECTORY: readonly FloorLine[] = [
  { num: '36', greeting: 'مرحبا', lang: 'ar', name: 'Arabic', tag: 'ar', rtl: true },
  { num: '33', greeting: '你好', lang: 'zh', name: 'Chinese', tag: 'zh' },
  { num: '30', greeting: 'Γεια', lang: 'el', name: 'Greek', tag: 'el' },
  { num: '27', greeting: 'नमस्ते', lang: 'hi', name: 'Hindi', tag: 'hi' },
  { num: '24', greeting: 'こんにちは', lang: 'ja', name: 'Japanese', tag: 'ja' },
  { num: '21', greeting: '안녕하세요', lang: 'ko', name: 'Korean', tag: 'ko' },
  { num: '18', greeting: 'Hallo', lang: 'de', name: 'German', tag: 'de' },
  { num: '15', greeting: 'Hola', lang: 'es', name: 'Spanish', tag: 'es' },
  { num: '12', greeting: 'Bonjour', lang: 'fr', name: 'French', tag: 'fr' },
  { num: '9', greeting: 'Ciao', lang: 'it', name: 'Italian', tag: 'it' },
  { num: '6', greeting: 'Olá', lang: 'pt', name: 'Portuguese', tag: 'pt' },
  { num: '3', greeting: 'Merhaba', lang: 'tr', name: 'Turkish', tag: 'tr' },
  { num: 'G', greeting: 'Hello', lang: 'en', name: 'English', tag: 'en', source: true },
];

type Product = { name: string; role: string; body: string };

const PRODUCTS: readonly Product[] = [
  {
    name: 'gt-next and gt-react',
    role: 'Libraries',
    body: 'Open source components for Next.js and React. <T> translates JSX in place, useGT covers plain strings, and plurals, variables, and branches follow ICU rules.',
  },
  {
    name: 'gtx-cli',
    role: 'CLI',
    body: 'The CLI collects strings at build time, requests translations, and writes them back to your repo or to the CDN. It runs the same way locally and in CI.',
  },
  {
    name: 'Dashboard',
    role: 'Review',
    body: 'Review every string, edit translations, manage glossaries, and approve releases with your team before they ship.',
  },
  {
    name: 'Locadex',
    role: 'Agent',
    body: 'An AI agent that does the i18n setup for you. It wraps your components, configures the project, and opens the pull request. You review the diff.',
  },
];

type Rate = { workflow: string; rate: string; gtLibs?: string };

/* The published rate ledger. These are the only rates that may appear. */
const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  {
    workflow: 'Project context surcharge',
    rate: '+$0.10 / 10k tokens per 500 tokens of context',
  },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

/* ----------------------------------------------------------- ornaments */

/** A rotated square, the deco separator glyph used across the elevation. */
function Dia() {
  return <span className='ss-dia' aria-hidden />;
}

/**
 * The engraved cartouche seated on each setback's top rule: floor label in
 * brass, section name in Marcellus caps. Decorative; the h2 carries meaning.
 */
function FloorPlate({ floor, name }: { floor: string; name: string }) {
  return (
    <div className='ss-plate' aria-hidden>
      <Dia />
      <span className='ss-plate-floor'>{floor}</span>
      <span className='ss-plate-name'>{name}</span>
      <Dia />
    </div>
  );
}

/**
 * The lobby sunburst: a fan of alternating jade and brass rays over a
 * stepped crown, drawn once as inline SVG. Two ray groups breathe against
 * each other in CSS; reduced motion holds them still.
 */
function Sunburst() {
  const cx = 400;
  const cy = 206;
  const rays = Array.from({ length: 27 }, (_, i) => {
    const angle = (Math.PI * (i + 1.5)) / 30;
    const r0 = 86;
    const r1 = i % 2 === 0 ? 196 : 162;
    return {
      key: i,
      odd: i % 2 !== 0,
      x1: (cx - Math.cos(angle) * r0).toFixed(1),
      y1: (cy - Math.sin(angle) * r0).toFixed(1),
      x2: (cx - Math.cos(angle) * r1).toFixed(1),
      y2: (cy - Math.sin(angle) * r1).toFixed(1),
    };
  });

  return (
    <svg className='ss-sunburst' viewBox='0 0 800 212' aria-hidden focusable='false'>
      <g className='ss-rays-a' stroke='var(--ss-jade)' strokeWidth='1.4'>
        {rays
          .filter((ray) => !ray.odd)
          .map((ray) => (
            <line key={ray.key} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
          ))}
      </g>
      <g className='ss-rays-b' stroke='var(--ss-brass)' strokeWidth='1'>
        {rays
          .filter((ray) => ray.odd)
          .map((ray) => (
            <line key={ray.key} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
          ))}
      </g>
      {/* the stepped crown the fan springs from */}
      <g fill='none' stroke='var(--ss-ink)' strokeWidth='1.2'>
        <path d='M270 211 v-10 h40 v-12 h40 v-12 h40 v-12 h20 v12 h40 v12 h40 v12 h40 v10' />
        <path d='M330 211 v-6 h140 v6' opacity='0.55' />
      </g>
      <rect
        x='394'
        y='168'
        width='12'
        height='12'
        transform='rotate(45 400 174)'
        fill='var(--ss-brass)'
        stroke='var(--ss-ink)'
        strokeWidth='1'
      />
    </svg>
  );
}

/** The terminal ornament: stepped ziggurat, mast, and lamp closing the elevation. */
function Finial() {
  return (
    <svg className='ss-finial' viewBox='0 0 340 168' aria-hidden focusable='false'>
      <g fill='var(--ss-cream)' stroke='var(--ss-ink)' strokeWidth='1.2'>
        <rect x='20' y='0' width='300' height='22' />
        <rect x='50' y='22' width='240' height='22' />
        <rect x='80' y='44' width='180' height='22' />
        <rect x='115' y='66' width='110' height='20' />
        <rect x='148' y='86' width='44' height='18' />
      </g>
      <g stroke='var(--ss-ink)' strokeWidth='1.4'>
        <line x1='170' y1='104' x2='170' y2='148' />
      </g>
      <g stroke='var(--ss-brass)' strokeWidth='1'>
        <line x1='156' y1='150' x2='184' y2='150' opacity='0.9' />
        <line x1='150' y1='118' x2='162' y2='118' />
        <line x1='178' y1='118' x2='190' y2='118' />
      </g>
      <circle cx='170' cy='152' r='5' fill='var(--ss-jade)' stroke='var(--ss-ink)' strokeWidth='1' />
      <rect
        x='165'
        y='108'
        width='10'
        height='10'
        transform='rotate(45 170 113)'
        fill='var(--ss-brass)'
        stroke='var(--ss-ink)'
        strokeWidth='1'
      />
    </svg>
  );
}

/* ------------------------------------------------------------ sections */

function Canopy() {
  return (
    <header className='ss-nav'>
      <div className='ss-nav-in'>
        <a className='ss-brand' href='#lobby'>
          <Image src='/brand/no-bg-gt-logo-light.png' alt='' width={22} height={22} />
          <span>General Translation</span>
        </a>

        <nav className='ss-nav-links' aria-label='Site'>
          <a href='#component'>Docs</a>
          <a href='#rates'>Pricing</a>
          <a href='#platform'>Products</a>
          <a href='#rates'>Enterprise</a>
        </nav>

        <div className='ss-nav-right'>
          <a className='ss-nav-signin' href='#rates'>
            Sign in
          </a>
          <a className='ss-btn ss-btn-solid ss-btn-sm' href='#component'>
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

function Lobby() {
  return (
    <section className='ss-sec fl-0 ss-lobby' id='lobby'>
      <FloorPlate floor='G' name='Lobby' />
      <Sunburst />

      <h1 className='ss-h1'>
        <span className='ss-h1-line'>Your app</span>
        <span className='ss-h1-mid'>
          <span className='ss-h1-rule' aria-hidden />
          in every
          <span className='ss-h1-rule' aria-hidden />
        </span>
        <span className='ss-h1-line'>language</span>
      </h1>

      <p className='ss-lede'>
        General Translation is a full stack localization platform. Add the {'<T>'} component to
        your React app, run one command, and ship in more than 100 languages.
      </p>

      <div className='ss-cta-row'>
        <a className='ss-btn ss-btn-solid' href='#component'>
          Get started
        </a>
        <a className='ss-btn ss-btn-line' href='#platform'>
          Read the docs
        </a>
      </div>

      <p className='ss-cmd'>
        <span className='ss-cmd-prompt' aria-hidden>
          $
        </span>
        <code>npx gtx-cli@latest init</code>
      </p>

      <p className='ss-lobby-base'>
        The libraries are open source. The free tier has no seat limits and no language limits.
      </p>
    </section>
  );
}

function Tenants() {
  return (
    <section className='ss-sec fl-1' id='tenants'>
      <FloorPlate floor='2' name='Tenants' />
      <h2 className='ss-h2'>Teams building on General Translation</h2>
      <p className='ss-sub'>
        These products serve their users in dozens of languages through this pipeline.
      </p>
      <ul className='ss-tenants'>
        {TENANTS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}

function Component() {
  return (
    <section className='ss-sec fl-2' id='component'>
      <FloorPlate floor='3' name='The T component' />
      <h2 className='ss-h2'>One component, every locale</h2>
      <p className='ss-sub'>
        Wrap JSX in {'<T>'}. At build time the CLI collects every string inside it, translates the
        new ones, and writes the results back. There are no keys and no JSON files.
      </p>

      <div className='ss-proof-grid'>
        <figure className='ss-draft'>
          <figcaption className='ss-panel-label'>
            Source <code>en</code>
          </figcaption>
          <pre className='ss-code'>
            <code>{SOURCE_CODE}</code>
          </pre>
        </figure>

        <div className='ss-render'>
          <p className='ss-panel-label is-ink'>Rendered</p>
          <ul className='ss-render-stack'>
            {RENDERED.map((card, i) => (
              <li
                className={card.source ? 'ss-render-card is-source' : 'ss-render-card'}
                key={card.tag}
                lang={card.lang}
                dir={card.rtl ? 'rtl' : undefined}
                style={{ '--rc': i } as CSSProperties}
              >
                <span className='ss-render-tag' dir='ltr'>
                  {card.tag}
                </span>
                <strong>{card.title}</strong>
                <span className='ss-render-body'>{card.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='ss-terminal'>
        <p>
          <span className='ss-cmd-prompt' aria-hidden>
            $
          </span>
          <code>npx gtx-cli translate</code>
        </p>
        <p className='ss-terminal-out'>
          <code>✓ 30 locales published to the CDN</code>
        </p>
      </div>

      <ol className='ss-steps'>
        <li>
          <span className='ss-step-num' aria-hidden>
            1
          </span>
          <h3>Install</h3>
          <p className='ss-step-cmd'>
            <code>npm install gt-next</code>
          </p>
          <p>One package for Next.js. gt-react covers everything else built in React.</p>
        </li>
        <li>
          <span className='ss-step-num' aria-hidden>
            2
          </span>
          <h3>Wrap</h3>
          <p className='ss-step-cmd'>
            <code>{'<T>…</T>'}</code>
          </p>
          <p>Put the component around your JSX. Variables, plurals, and branches keep working.</p>
        </li>
        <li>
          <span className='ss-step-num' aria-hidden>
            3
          </span>
          <h3>Translate</h3>
          <p className='ss-step-cmd'>
            <code>npx gtx-cli translate</code>
          </p>
          <p>Run it locally or in CI. Translations ship to your repo or to the GT CDN.</p>
        </li>
      </ol>
    </section>
  );
}

function Directory() {
  return (
    <section className='ss-sec fl-3' id='directory'>
      <FloorPlate floor='4' name='Directory' />
      <h2 className='ss-h2'>Floor directory</h2>
      <p className='ss-sub'>
        More than 100 languages, each with the regional variants that matter. Every line below is a
        real string in its own script and direction.
      </p>

      <ol className='ss-dir'>
        {DIRECTORY.map((line) => (
          <li className={line.source ? 'ss-dir-row is-ground' : 'ss-dir-row'} key={line.tag}>
            <span className='ss-dir-num' aria-hidden>
              {line.num}
            </span>
            <span className='ss-dir-greet' lang={line.lang} dir={line.rtl ? 'rtl' : undefined}>
              {line.greeting}
            </span>
            <span className='ss-dir-lead' aria-hidden />
            <span className='ss-dir-name'>
              {line.name}
              {line.source ? <em className='ss-dir-note'>source</em> : null}
            </span>
            <code className='ss-dir-tag'>{line.tag}</code>
          </li>
        ))}
      </ol>

      <p className='ss-dir-foot'>
        Variants are separate things here. zh-Hans is not zh-Hant, and pt-BR is not pt-PT. All of
        them ship.
      </p>
    </section>
  );
}

function Platform() {
  return (
    <section className='ss-sec fl-4' id='platform'>
      <FloorPlate floor='5' name='Platform' />
      <h2 className='ss-h2'>The platform</h2>
      <p className='ss-sub'>Four products share one translation pipeline.</p>

      <ul className='ss-cols'>
        {PRODUCTS.map((product) => (
          <li className='ss-col' key={product.name}>
            <span className='ss-col-cap' aria-hidden />
            <p className='ss-col-role'>{product.role}</p>
            <h3>{product.name}</h3>
            <p className='ss-col-body'>{product.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rates() {
  return (
    <section className='ss-sec fl-5' id='rates'>
      <FloorPlate floor='6' name='Rates' />
      <h2 className='ss-h2'>Published rates</h2>
      <p className='ss-sub'>
        Start at $0 and pay per token. The price of a translation is knowable before you run it.
      </p>

      <div className='ss-rates'>
        <div className='ss-rate is-head' aria-hidden>
          <span>Workflow</span>
          <span>Rate</span>
          <span>GT libraries</span>
        </div>
        {RATES.map((row) => (
          <div className='ss-rate' key={row.workflow}>
            <span className='ss-rate-name'>{row.workflow}</span>
            <span className='ss-rate-value'>{row.rate}</span>
            <span className='ss-rate-gt'>{row.gtLibs ?? '·'}</span>
          </div>
        ))}
      </div>

      <div className='ss-plans'>
        <div className='ss-plan'>
          <h3>Starter</h3>
          <p className='ss-plan-price'>
            $0 <small>per month</small>
          </p>
          <p>
            Unlimited users, projects, and languages. Editor, GitHub integration, and Locadex
            included. Minimum top-up of $10.
          </p>
          <ul className='ss-plan-list'>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, glossaries, and the editor</li>
            <li>Locadex agent runs on your repo</li>
          </ul>
          <a className='ss-btn ss-btn-solid' href='#component'>
            Get started
          </a>
        </div>

        <div className='ss-plan'>
          <h3>Enterprise</h3>
          <p className='ss-plan-price'>
            Custom <small>annual</small>
          </p>
          <p>
            Forward-deployed engineers, custom workflows for any format or framework, and shared
            context across projects.
          </p>
          <ul className='ss-plan-list'>
            <li>SSO, RBAC, webhooks, custom SLA</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build it</li>
          </ul>
          <a className='ss-btn ss-btn-line' href='#roof'>
            Contact us
          </a>
        </div>
      </div>

      <p className='ss-rates-foot'>
        A usage limit is a hard cap and blocks billing even with auto-reload on.{' '}
        <code>npx gt translate --dry-run</code> prints what would be translated and bills 0 tokens.
      </p>
    </section>
  );
}

function Roof() {
  return (
    <footer className='ss-sec fl-6 ss-roof' id='roof'>
      <FloorPlate floor='R' name='Roof' />
      <div className='ss-roof-grid'>
        <div className='ss-roof-brand'>
          <Image src='/brand/no-bg-gt-logo-light.png' alt='' width={26} height={26} />
          <p>General Translation</p>
          <p className='ss-roof-tag'>Full stack localization for React and Next.js.</p>
        </div>

        <nav className='ss-roof-col' aria-label='Product'>
          <h3>Product</h3>
          <a href='#platform'>gt-next</a>
          <a href='#platform'>gt-react</a>
          <a href='#platform'>gtx-cli</a>
          <a href='#platform'>Dashboard</a>
          <a href='#platform'>Locadex</a>
        </nav>

        <nav className='ss-roof-col' aria-label='Resources'>
          <h3>Resources</h3>
          <a href='#component'>Docs</a>
          <a href='#directory'>Supported locales</a>
          <a href='#rates'>Pricing</a>
          <a href='#tenants'>Customers</a>
        </nav>

        <nav className='ss-roof-col' aria-label='Company'>
          <h3>Company</h3>
          <a href='#rates'>Enterprise</a>
          <a href='#roof'>Careers</a>
          <a href='#roof'>Privacy</a>
          <a href='#roof'>Terms</a>
        </nav>
      </div>

      <div className='ss-roof-base'>
        <span>© 2026 General Translation, Inc.</span>
        <span className='ss-roof-compliance'>SOC 2 Type II · GDPR · ISO 27001</span>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- page */

export default function SpireSetbacksPage() {
  return (
    <>
      <div className={`spire-setbacks-root ${display.variable} ${plaque.variable}`}>
        <Canopy />

        <main className='ss-elevation'>
          <Lobby />
          <Tenants />
          <Component />
          <Directory />
          <Platform />
          <Rates />
          <Roof />
          <Finial />
        </main>

        <ElevatorRail />
      </div>
      <DirectionCorner slug='spire-setbacks' />
    </>
  );
}
