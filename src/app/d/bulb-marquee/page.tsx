import Image from 'next/image';
import { Inter, JetBrains_Mono, Limelight } from 'next/font/google';
import type { CSSProperties } from 'react';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import './styles.css';

const display = Limelight({
  weight: '400',
  subsets: ['latin'],
  variable: '--bm-disp',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--bm-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--bm-mono',
});

export const metadata = {
  title: 'bulb-marquee — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * BULB MARQUEE: dither-focused art deco. A theatre marquee where every
 * surface is dots: the hero headline is dot-matrix lettering (a bulb-grid
 * gradient clipped to Limelight glyphs), panel edges carry chasing bulb
 * rows built from radial-gradient dots, and the <T> demo is the show now
 * playing in twelve languages, each hello lit in sequence by pure CSS.
 * Warm white and amber on deep charcoal, one vermilion accent, no images,
 * no client JS. prefers-reduced-motion freezes everything fully lit.
 */

type Hello = {
  text: string;
  locale: string;
  language: string;
  dir?: 'rtl';
};

const HELLOS: readonly Hello[] = [
  { text: 'Hola', locale: 'es', language: 'Spanish' },
  { text: 'Bonjour', locale: 'fr', language: 'French' },
  { text: 'Hallo', locale: 'de', language: 'German' },
  { text: 'Ciao', locale: 'it', language: 'Italian' },
  { text: 'Olá', locale: 'pt', language: 'Portuguese' },
  { text: 'こんにちは', locale: 'ja', language: 'Japanese' },
  { text: '안녕하세요', locale: 'ko', language: 'Korean' },
  { text: '你好', locale: 'zh', language: 'Chinese' },
  { text: 'مرحبا', locale: 'ar', language: 'Arabic', dir: 'rtl' },
  { text: 'नमस्ते', locale: 'hi', language: 'Hindi' },
  { text: 'Γεια', locale: 'el', language: 'Greek' },
  { text: 'Merhaba', locale: 'tr', language: 'Turkish' },
];

const RATES: readonly { workflow: string; rate: string }[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

const BEFORE_CODE = `export default function Page() {
  return (
    <main>
      <h1>Welcome to the show</h1>
      <p>Doors open at seven.</p>
    </main>
  );
}`;

const AFTER_CODE = `import { T } from 'gt-next';

export default function Page() {
  return (
    <T>
      <main>
        <h1>Welcome to the show</h1>
        <p>Doors open at seven.</p>
      </main>
    </T>
  );
}`;

/** A single horizontal run of marquee bulbs. Purely decorative. */
function Bulbs({ className }: { className: string }) {
  return <span aria-hidden className={className} />;
}

function TopNav() {
  return (
    <header className='bm-nav'>
      <div className='bm-wrap bm-nav-in'>
        <a className='bm-brand' href='#show'>
          <Image
            alt=''
            className='bm-brand-mark'
            height={22}
            src='/brand/no-bg-gt-logo-dark.png'
            width={22}
          />
          <span className='bm-brand-word'>General Translation</span>
        </a>

        <nav className='bm-nav-links'>
          <a href='#component'>Docs</a>
          <a href='#program'>Blog</a>
          <a href='#pricing'>Pricing</a>
          <a href='#pricing'>Enterprise</a>
        </nav>

        <div className='bm-nav-right'>
          <a href='#pricing'>Sign in</a>
          <a className='bm-btn bm-btn-solid bm-btn-sm' href='#pricing'>
            Get started
          </a>
        </div>
      </div>
      <Bulbs className='bm-bulbs bm-bulbs-h bm-bulbs-dim bm-nav-bulbs' />
    </header>
  );
}

function Hero() {
  return (
    <section className='bm-hero' id='show'>
      <div className='bm-wrap'>
        <div className='bm-marquee'>
          <Bulbs className='bm-bulbs bm-bulbs-h bm-edge-top' />
          <Bulbs className='bm-bulbs bm-bulbs-h bm-edge-bottom' />
          <Bulbs className='bm-bulbs bm-bulbs-v bm-edge-left' />
          <Bulbs className='bm-bulbs bm-bulbs-v bm-edge-right' />
          <span aria-hidden className='bm-fan bm-fan-tl' />
          <span aria-hidden className='bm-fan bm-fan-tr' />

          <div className='bm-marquee-in'>
            <p className='bm-sign'>
              <span aria-hidden className='bm-sign-gem'>
                ◆
              </span>
              Now showing in 30+ languages
              <span aria-hidden className='bm-sign-gem'>
                ◆
              </span>
            </p>

            <h1 className='bm-dothead'>
              Your app in
              <br />
              every language
            </h1>

            <p className='bm-lede'>
              General Translation is a full-stack localization platform. You wrap your components
              in <code>&lt;T&gt;</code>, run one command, and your app serves more than thirty
              languages from a global CDN. Locadex, the i18n agent, handles the setup.
            </p>

            <div className='bm-ctas'>
              <a className='bm-btn bm-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='bm-btn bm-btn-line' href='#component'>
                Read the docs
              </a>
              <span className='bm-cmd'>
                <span aria-hidden className='bm-cmd-prompt'>
                  $
                </span>
                npx gt@latest
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className='bm-sec' id='component'>
      <div className='bm-wrap'>
        <div className='bm-head'>
          <h2>The T component</h2>
          <p>
            You keep writing JSX. The <code>&lt;T&gt;</code> component marks what should be
            translated, the build translates it, and nothing about your rendering changes.
          </p>
        </div>

        <div className='bm-reel'>
          <figure className='bm-code'>
            <figcaption className='bm-code-bar'>
              <span aria-hidden className='bm-code-lamps' />
              <span className='bm-code-label'>Before</span>
            </figcaption>
            <pre>
              <code>{BEFORE_CODE}</code>
            </pre>
          </figure>

          <figure className='bm-code is-after'>
            <figcaption className='bm-code-bar'>
              <span aria-hidden className='bm-code-lamps is-lit' />
              <span className='bm-code-label'>After gt-next</span>
            </figcaption>
            <pre>
              <code>{AFTER_CODE}</code>
            </pre>
          </figure>
        </div>

        <div className='bm-acts'>
          <article className='bm-act'>
            <h3>
              <span className='bm-act-n'>Act I</span> Install
            </h3>
            <p>
              Run <code>npx gt@latest</code> in your repo. Locadex configures the provider, the
              middleware, and the locale routing for you.
            </p>
          </article>
          <article className='bm-act'>
            <h3>
              <span className='bm-act-n'>Act II</span> Wrap
            </h3>
            <p>
              Wrap JSX in <code>&lt;T&gt;</code> and strings in <code>useGT</code>. Your source
              language stays in your code, where you review it.
            </p>
          </article>
          <article className='bm-act'>
            <h3>
              <span className='bm-act-n'>Act III</span> Ship
            </h3>
            <p>
              Run <code>npx gt translate</code> in CI. Translations build before deploy and serve
              from the edge in every locale.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Program() {
  return (
    <section className='bm-sec' id='program'>
      <div className='bm-wrap'>
        <div className='bm-head'>
          <h2>Tonight&rsquo;s program</h2>
          <p>
            This board is one <code>&lt;T&gt;</code> component rendered twelve times. GT serves
            each rendition with the right locale and text direction, so Arabic reads right to left
            without any change to your markup.
          </p>
        </div>

        <ul className='bm-board'>
          {HELLOS.map((h, i) => (
            <li
              className='bm-cell'
              dir={h.dir}
              key={h.locale}
              lang={h.locale}
              style={{ '--i': String(i) } as CSSProperties}
            >
              <span aria-hidden className='bm-cell-bulb' />
              <span className='bm-cell-hello'>{h.text}</span>
              <span className='bm-cell-meta'>
                <span className='bm-cell-code'>{h.locale}</span>
                <span className='bm-cell-lang'>{h.language}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className='bm-board-note'>
          GT supports every CLDR locale, including regional variants such as pt-BR and zh-Hant.
          The twelve above are a sample.
        </p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='bm-sec' id='pricing'>
      <div className='bm-wrap'>
        <div className='bm-head'>
          <h2>Plans and rates</h2>
          <p>
            Translation is billed per token, and the rates are published. A usage limit is a hard
            cap that blocks billing even with auto-reload on.
          </p>
        </div>

        <div className='bm-rates'>
          <div aria-hidden className='bm-rate bm-rate-head'>
            <span>Workflow</span>
            <span>Rate</span>
          </div>
          {RATES.map((row) => (
            <div className='bm-rate' key={row.workflow}>
              <span className='bm-rate-name'>{row.workflow}</span>
              <span className='bm-rate-value'>{row.rate}</span>
            </div>
          ))}
        </div>

        <div className='bm-plans'>
          <article className='bm-plan'>
            <Bulbs className='bm-bulbs bm-bulbs-h bm-plan-bulbs' />
            <h3>Starter</h3>
            <p className='bm-plan-price'>
              $0 <small>per month</small>
            </p>
            <p className='bm-plan-copy'>
              Unlimited users, projects, and languages. The dashboard, the editor, GitHub
              integration, and Locadex are included. The minimum top-up is $10.
            </p>
            <ul className='bm-plan-list'>
              <li>Every SDK and the translation CLI</li>
              <li>Dashboard, glossaries, and the editor</li>
              <li>Locadex runs on your repo</li>
            </ul>
            <a className='bm-btn bm-btn-solid' href='#show'>
              Get started
            </a>
          </article>

          <article className='bm-plan'>
            <Bulbs className='bm-bulbs bm-bulbs-h bm-bulbs-dim bm-plan-bulbs' />
            <h3>Enterprise</h3>
            <p className='bm-plan-price'>
              Custom <small>annual</small>
            </p>
            <p className='bm-plan-copy'>
              Forward-deployed engineers, custom workflows for any format or framework, and shared
              context across your projects.
            </p>
            <ul className='bm-plan-list'>
              <li>SSO, RBAC, webhooks, custom SLA</li>
              <li>SOC 2 Type II, GDPR, ISO 27001</li>
              <li>Support from the engineers who build it</li>
            </ul>
            <a className='bm-btn bm-btn-line' href='#show'>
              Contact us
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className='bm-footer'>
      <Bulbs className='bm-bulbs bm-bulbs-h bm-bulbs-dim bm-footer-bulbs' />
      <div className='bm-wrap'>
        <div className='bm-foot-grid'>
          <div className='bm-foot-brand'>
            <Image
              alt='General Translation'
              height={26}
              src='/brand/no-bg-gt-logo-dark.png'
              width={26}
            />
            <p>End-to-end localization for the world&rsquo;s best companies.</p>
          </div>

          <div className='bm-foot-col'>
            <h4>Libraries</h4>
            <a href='#component'>gt-next</a>
            <a href='#component'>gt-react</a>
            <a href='#component'>Translation CLI</a>
            <a href='#component'>Locadex</a>
          </div>

          <div className='bm-foot-col'>
            <h4>Resources</h4>
            <a href='#component'>Documentation</a>
            <a href='#program'>Blog</a>
            <a href='#program'>Supported locales</a>
            <a href='#pricing'>Pricing</a>
          </div>

          <div className='bm-foot-col'>
            <h4>Company</h4>
            <a href='#show'>Careers</a>
            <a href='#show'>Contact</a>
            <a href='#show'>GitHub</a>
            <a href='#show'>Discord</a>
          </div>

          <div className='bm-foot-col'>
            <h4>Legal</h4>
            <a href='#show'>Terms of service</a>
            <a href='#show'>Privacy</a>
            <a href='#show'>Acceptable use</a>
          </div>
        </div>

        <div className='bm-fin'>
          <span aria-hidden className='bm-fin-chip'>
            Fin
          </span>
        </div>

        <p className='bm-foot-legal'>© 2026 General Translation, Inc.</p>
      </div>
    </footer>
  );
}

export default function BulbMarqueePage() {
  return (
    <>
      <div className={`${display.variable} ${body.variable} ${mono.variable} bulb-marquee-root`}>
        <TopNav />
        <Hero />
        <Proof />
        <Program />
        <Pricing />
        <SiteFooter />
      </div>
      <DirectionCorner slug='bulb-marquee' />
    </>
  );
}
