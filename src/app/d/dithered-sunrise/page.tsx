import { JetBrains_Mono, Jost, Poiret_One } from 'next/font/google';

import type { CSSProperties } from 'react';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import DawnArc from './DawnArc';
import SunriseCanvas from './SunriseCanvas';

import './styles.css';

export const metadata = {
  title: 'dithered-sunrise — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * DITHERED-SUNRISE — dither as the design language, deco as the structure.
 *
 * One rule governs every surface: light is quantized. The hero sunrise is a
 * live 8x8 Bayer field (SunriseCanvas); every section opens with an
 * ordered-dither dawn arc (DawnArc); leaders, bands and ornaments are rows of
 * discrete gold squares built from hard-stop CSS gradients. There is not one
 * smooth gradient on the page. Poiret One carries the deco display voice,
 * Jost (a Futura revival, period-correct) carries body copy, JetBrains Mono
 * carries code.
 */

const poiret = Poiret_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--ds-font-display',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--ds-font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--ds-font-mono',
  display: 'swap',
});

/* ------------------------------------------------------------------ data */

type Rendered = {
  lang: string;
  dir?: 'rtl';
  title: string;
  body: string;
};

/** The one source component, rendered by locale. Real translations. */
const RENDERED: readonly Rendered[] = [
  { lang: 'es', title: 'Buenos días', body: 'Tu proyecto está listo para revisar.' },
  { lang: 'fr', title: 'Bonjour', body: 'Votre projet est prêt à être relu.' },
  { lang: 'de', title: 'Guten Morgen', body: 'Dein Projekt ist bereit zur Überprüfung.' },
  { lang: 'ja', title: 'おはようございます', body: 'プロジェクトはレビューの準備ができています。' },
  { lang: 'ko', title: '좋은 아침입니다', body: '프로젝트를 검토할 준비가 되었습니다.' },
  { lang: 'ar', dir: 'rtl', title: 'صباح الخير', body: 'مشروعك جاهز للمراجعة.' },
];

type Greeting = { text: string; lang: string; dir?: 'rtl' };

/** The fan's rays, one script per ray. */
const GREETINGS: readonly Greeting[] = [
  { text: 'Hola', lang: 'es' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hallo', lang: 'de' },
  { text: 'こんにちは', lang: 'ja' },
  { text: 'Olá', lang: 'pt' },
  { text: '안녕하세요', lang: 'ko' },
  { text: '你好', lang: 'zh' },
  { text: 'Ciao', lang: 'it' },
  { text: 'مرحبا', lang: 'ar', dir: 'rtl' },
  { text: 'नमस्ते', lang: 'hi' },
  { text: 'Γεια', lang: 'el' },
  { text: 'Merhaba', lang: 'tr' },
];

type Product = { name: string; kind: string; body: string };

const PRODUCTS: readonly Product[] = [
  {
    name: 'gt-next',
    kind: 'Library',
    body: 'The Next.js SDK with the <T> component, locale routing middleware, and static translation at build time.',
  },
  {
    name: 'gt-react',
    kind: 'Library',
    body: 'The same component model for any React app, with runtime loading for translations.',
  },
  {
    name: 'CLI',
    kind: 'Tool',
    body: 'npx gt translate reads your project, sends the content, and returns finished locales.',
  },
  {
    name: 'Dashboard',
    kind: 'App',
    body: 'Review, edit, and approve translations with glossaries and shared project context.',
  },
  {
    name: 'Locadex',
    kind: 'Agent',
    body: 'An AI agent that installs the library, wraps your components, and opens the pull request.',
  },
];

type Rate = { name: string; value: string };

const RATES: readonly Rate[] = [
  { name: 'Build time translation', value: '$10 / 10k input tokens' },
  { name: 'Runtime translation', value: '$1 / 10k input tokens' },
  { name: 'Locadex', value: '$5 / LCU' },
  { name: 'Credits', value: '$1 = 1,000,000 credits' },
];

/* -------------------------------------------------------------- sections */

function TopNav() {
  return (
    <nav aria-label='Main' className='ds-nav'>
      <a className='ds-brand' href='#top'>
        <span aria-hidden='true' className='ds-brand-tile'>
          GT
        </span>
        <span className='ds-brand-name'>General Translation</span>
      </a>
      <div className='ds-nav-links'>
        <a href='#proof'>Product</a>
        <a href='#languages'>Languages</a>
        <a href='#products'>Platform</a>
        <a href='#pricing'>Pricing</a>
      </div>
      <div className='ds-nav-cta'>
        <a className='ds-btn ds-btn-line ds-btn-sm' href='#top'>
          Sign in
        </a>
        <a className='ds-btn ds-btn-solid ds-btn-sm' href='#pricing'>
          Get started
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className='ds-hero'>
      <SunriseCanvas className='ds-hero-canvas' />
      <div className='ds-hero-inner'>
        <h1 className='ds-hero-title'>
          Your app
          <br />
          <span className='ds-hero-gold'>in every language</span>
        </h1>
        <p className='ds-hero-lede'>
          General Translation is a full-stack localization platform. Wrap a
          page in the <code className='ds-ic'>&lt;T&gt;</code> component and it
          renders in more than 30 languages minutes after install. The CLI
          translates at build time, the dashboard carries review, and Locadex
          does the setup on its own.
        </p>
        <div className='ds-cta-row'>
          <a className='ds-btn ds-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='ds-btn ds-btn-line' href='#proof'>
            Read the docs
          </a>
        </div>
        <code className='ds-chip-code'>npm i gt-next</code>
      </div>
    </header>
  );
}

function Proof() {
  return (
    <section className='ds-sec' id='proof'>
      <div className='ds-sechead'>
        <DawnArc className='ds-arc' id='ds-arc-proof' />
        <h2>One component, every locale</h2>
        <p className='ds-lede'>
          The <code className='ds-ic'>&lt;T&gt;</code> component marks JSX for
          translation in place. There are no extracted keys and no JSON
          catalogs to maintain. The CLI reads your components, translates the
          content, and writes every locale at build time.
        </p>
      </div>

      <div className='ds-proof-grid'>
        <div className='ds-panel'>
          <div className='ds-panel-title'>page.tsx</div>
          <pre className='ds-code'>
            <code>
              <span className='k'>import</span> <span className='p'>{'{'}</span>{' '}
              <span className='t'>T</span> <span className='p'>{'}'}</span>{' '}
              <span className='k'>from</span> <span className='s'>&apos;gt-next&apos;</span>
              <span className='p'>;</span>
              {'\n\n'}
              <span className='k'>export default function</span>{' '}
              <span className='f'>Morning</span>
              <span className='p'>() {'{'}</span>
              {'\n  '}
              <span className='k'>return</span> <span className='p'>(</span>
              {'\n    '}
              <span className='t'>{'<T>'}</span>
              {'\n      '}
              <span className='t'>{'<h1>'}</span>Good morning
              <span className='t'>{'</h1>'}</span>
              {'\n      '}
              <span className='t'>{'<p>'}</span>Your project is ready to review.
              <span className='t'>{'</p>'}</span>
              {'\n    '}
              <span className='t'>{'</T>'}</span>
              {'\n  '}
              <span className='p'>);</span>
              {'\n'}
              <span className='p'>{'}'}</span>
            </code>
          </pre>
        </div>

        <div className='ds-panel'>
          <div className='ds-panel-title'>Rendered output</div>
          <div className='ds-out'>
            {RENDERED.map((row) => (
              <div className='ds-out-row' dir={row.dir} key={row.lang} lang={row.lang}>
                <span className='ds-out-tag'>{row.lang}</span>
                <span className='ds-out-copy'>
                  <span className='ds-out-title'>{row.title}</span>
                  <span className='ds-out-body'>{row.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className='ds-proof-note'>
        Variables, plurals, and markup survive translation because the
        component carries structure, not strings.
      </p>

      <div className='ds-steps'>
        <div className='ds-step'>
          <span className='ds-step-n'>1</span>
          <span className='ds-step-t'>Install</span>
          <span className='ds-step-b'>
            npm i gt-next adds the components and the middleware.
          </span>
        </div>
        <div className='ds-step'>
          <span className='ds-step-n'>2</span>
          <span className='ds-step-t'>Mark</span>
          <span className='ds-step-b'>
            Wrap content in the <code className='ds-ic'>&lt;T&gt;</code>{' '}
            component. JSX stays JSX and variables stay live.
          </span>
        </div>
        <div className='ds-step'>
          <span className='ds-step-n'>3</span>
          <span className='ds-step-t'>Translate</span>
          <span className='ds-step-b'>
            npx gt translate builds every locale at deploy time.
          </span>
        </div>
      </div>
    </section>
  );
}

/** Custom-property style for one fan ray: its angle and its length. */
const rayStyle = (angle: number, len: string): CSSProperties =>
  ({ '--a': `${angle}deg`, '--len': len }) as CSSProperties;

function Atlas() {
  return (
    <section className='ds-sec ds-atlas' id='languages'>
      <div className='ds-sechead'>
        <DawnArc className='ds-arc' id='ds-arc-atlas' />
        <h2>Scripts as material</h2>
        <p className='ds-lede'>
          A localization platform should show the languages it serves. GT
          handles plural rules, number and date formats, and right to left
          layout through CLDR data, so Japanese, Arabic, and Hindi render
          correctly without extra configuration.
        </p>
      </div>

      <div className='ds-fan'>
        {GREETINGS.map((g, i) => (
          <div
            className='ds-ray'
            key={g.lang}
            style={rayStyle(-166 + (i * 152) / 11, i % 2 === 0 ? '47%' : '37%')}
          >
            <span aria-hidden='true' className='ds-ray-line' />
            <span className='ds-ray-label' dir={g.dir} lang={g.lang}>
              {g.text} <small className='ds-ray-tag'>{g.lang}</small>
            </span>
          </div>
        ))}
        <DawnArc className='ds-fan-hub' id='ds-arc-hub' />
      </div>

      <p className='ds-atlas-note'>
        Each label above is a real string in its own script, set with the
        correct lang and dir attributes. That is the standard the product
        holds your app to.
      </p>
    </section>
  );
}

function Products() {
  return (
    <section className='ds-sec' id='products'>
      <div className='ds-sechead'>
        <DawnArc className='ds-arc' id='ds-arc-products' />
        <h2>One platform, five surfaces</h2>
        <p className='ds-lede'>
          Every piece works on its own and they compound together, from the
          first component to continuous translation in CI.
        </p>
      </div>
      <div className='ds-cards'>
        {PRODUCTS.map((p) => (
          <article className='ds-card' key={p.name}>
            <span aria-hidden='true' className='ds-dotband' />
            <span className='ds-card-kind'>{p.kind}</span>
            <h3 className='ds-card-name'>{p.name}</h3>
            <p className='ds-card-body'>{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='ds-sec' id='pricing'>
      <div className='ds-sechead'>
        <DawnArc className='ds-arc' id='ds-arc-pricing' />
        <h2>Pricing</h2>
        <p className='ds-lede'>
          Plans start at zero and usage is billed per token, so the price of a
          translation is knowable before you run it.
        </p>
      </div>

      <div className='ds-rates'>
        {RATES.map((r) => (
          <div className='ds-rate' key={r.name}>
            <span className='ds-rate-name'>{r.name}</span>
            <span aria-hidden='true' className='ds-rate-dots' />
            <span className='ds-rate-value'>{r.value}</span>
          </div>
        ))}
      </div>

      <div className='ds-plans'>
        <div className='ds-plan'>
          <h3 className='ds-plan-name'>Starter</h3>
          <div className='ds-plan-price'>
            $0 <span className='ds-plan-per'>per month</span>
          </div>
          <p className='ds-plan-body'>
            Unlimited users, projects, and languages. The editor, the GitHub
            integration, and Locadex are included. The minimum top-up is $10.
          </p>
          <ul className='ds-plan-list'>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, glossaries, and the editor</li>
            <li>Locadex agent runs on your repo</li>
          </ul>
          <a className='ds-btn ds-btn-solid' href='#top'>
            Get started
          </a>
        </div>
        <div className='ds-plan'>
          <h3 className='ds-plan-name'>Enterprise</h3>
          <div className='ds-plan-price'>
            Custom <span className='ds-plan-per'>annual</span>
          </div>
          <p className='ds-plan-body'>
            Forward-deployed engineers, custom workflows for any format or
            framework, and shared context across projects.
          </p>
          <ul className='ds-plan-list'>
            <li>SSO, RBAC, webhooks, and a custom SLA</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build it</li>
          </ul>
          <a className='ds-btn ds-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>

      <p className='ds-price-note'>
        A usage limit is a hard cap. It blocks billing even with auto-reload
        on.
      </p>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className='ds-footer'>
      <DawnArc className='ds-footer-arc' id='ds-arc-set' />
      <div className='ds-footer-grid'>
        <div className='ds-footer-col ds-footer-brand'>
          <span className='ds-brand-name'>General Translation</span>
          <p>The localization platform for the AI era.</p>
        </div>
        <div className='ds-footer-col'>
          <h4>Products</h4>
          <a href='#products'>gt-next</a>
          <a href='#products'>gt-react</a>
          <a href='#products'>CLI</a>
          <a href='#products'>Dashboard</a>
          <a href='#products'>Locadex</a>
        </div>
        <div className='ds-footer-col'>
          <h4>Resources</h4>
          <a href='#top'>Docs</a>
          <a href='#top'>Blog</a>
          <a href='#top'>Status</a>
          <a href='#top'>GitHub</a>
        </div>
        <div className='ds-footer-col'>
          <h4>Company</h4>
          <a href='#top'>About</a>
          <a href='#top'>Careers</a>
          <a href='#top'>Contact</a>
          <a href='#top'>Trust</a>
        </div>
      </div>
      <div className='ds-footer-legal'>
        <span>© 2026 General Translation, Inc.</span>
        <span>SOC 2 Type II. GDPR. ISO 27001.</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ page */

export default function DitheredSunrisePage() {
  return (
    <>
      <div
        className={`dithered-sunrise-root ${poiret.variable} ${jost.variable} ${mono.variable}`}
        id='top'
      >
        <TopNav />
        <Hero />
        <Proof />
        <Atlas />
        <Products />
        <Pricing />
        <SiteFooter />
      </div>
      <DirectionCorner slug='dithered-sunrise' />
    </>
  );
}
