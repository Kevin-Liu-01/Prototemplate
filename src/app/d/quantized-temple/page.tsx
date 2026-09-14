import Image from 'next/image';
import { Cinzel, Inter } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import DitherVeil from './DitherVeil';
import RenderProof from './RenderProof';

import './styles.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--qt-font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--qt-font-body',
  display: 'swap',
});

export const metadata = {
  title: 'quantized-temple — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * QUANTIZED TEMPLE: dither-focused art deco. Stepped ziggurat forms carry
 * silk-smoke gradients that quantize into ordered dither as they rise; the
 * top of every form dissolves into dots. Orange and gold on warm black.
 * Each section is a temple tier (numbered rules between them), the hero
 * monument is built from CSS steps with one small canvas for the smoke,
 * and the scripts section hangs real greetings in the drapery folds.
 */

/** Small stepped ziggurat mark, drawn once and reused as the icon system. */
function StepMark({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true' focusable='false'>
      <path d='M10 4 H14 V8 H18 V12 H22 V20 H2 V12 H6 V8 H10 Z' fill='currentColor' />
    </svg>
  );
}

/** The tier rule: a hairline pair meeting at a numbered plaque. */
function TierLine({ n }: { n: string }) {
  return (
    <div className='qt-tierline' aria-hidden='true'>
      <span className='qt-tierline-rule' />
      <span className='qt-tierline-mark'>{n}</span>
      <span className='qt-tierline-rule' />
    </div>
  );
}

/** The stepped dot band: four strips of rising sparsity, the CSS twin of the
    canvas dissolve. Flipped where a surface dissolves downward. */
function Dissolve({ flip = false }: { flip?: boolean }) {
  return (
    <div className={flip ? 'qt-dissolve is-flip' : 'qt-dissolve'} aria-hidden='true'>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function TopNav() {
  return (
    <header className='qt-nav'>
      <div className='qt-rail qt-nav-row'>
        <a className='qt-brand' href='#top'>
          <Image
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={26}
            height={26}
            className='qt-brand-mark'
          />
          <span className='qt-brand-name'>General Translation</span>
        </a>
        <nav className='qt-nav-links' aria-label='Site'>
          <a href='#proof'>Product</a>
          <a href='#scripts'>Languages</a>
          <a href='#platform'>Platform</a>
          <a href='#pricing'>Pricing</a>
        </nav>
        <div className='qt-nav-cta'>
          <a className='qt-btn qt-btn-line' href='#top'>
            Sign in
          </a>
          <a className='qt-btn qt-btn-solid' href='#pricing'>
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className='qt-hero' id='top'>
      <div className='qt-rail qt-hero-grid'>
        <div className='qt-hero-copy'>
          <h1>
            <span>Your app in</span>
            <span>every language</span>
          </h1>
          <p className='qt-hero-sub'>
            General Translation is a full stack localization platform. You wrap your components in{' '}
            <code className='qt-t'>{'<T>'}</code>, run one command, and the app ships in more than
            100 languages. The libraries are open source and setup takes minutes.
          </p>
          <div className='qt-hero-ctas'>
            <a className='qt-btn qt-btn-solid qt-btn-big' href='#pricing'>
              Get started
            </a>
            <a className='qt-btn qt-btn-line qt-btn-big' href='#proof'>
              See how it works
            </a>
          </div>
          <p className='qt-hero-cmd'>
            <span className='qt-cmd-prompt' aria-hidden='true'>
              $
            </span>{' '}
            npx gt@latest
          </p>
          <p className='qt-hero-proofline'>
            Teams at Cursor, Ramp, Mintlify, and ClickHouse run GT in production.
          </p>
        </div>

        <figure className='qt-monument' aria-hidden='true'>
          <DitherVeil className='qt-monument-smoke' />
          <div className='qt-monument-body'>
            <div className='qt-tier qt-tier-1' />
            <div className='qt-tier qt-tier-2' />
            <div className='qt-tier qt-tier-3'>
              <span className='qt-tier-glyph'>{'<T>'}</span>
            </div>
            <div className='qt-tier qt-tier-4' />
            <div className='qt-tier qt-tier-5' />
          </div>
        </figure>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className='qt-sec' id='proof'>
      <div className='qt-rail'>
        <TierLine n='II' />
        <h2>
          The <code className='qt-t qt-t-h'>{'<T>'}</code> component
        </h2>
        <p className='qt-lead'>
          The component is the unit of translation. You mark what people read, the CLI translates
          it at build time, and the runtime serves each visitor their own language.
        </p>

        <div className='qt-diff'>
          <figure className='qt-code'>
            <figcaption>Before</figcaption>
            <pre>
              <code>
                {'export default function Welcome() {\n'}
                {'  return (\n'}
                {'    <main>\n'}
                {'      <h1>Welcome back</h1>\n'}
                {'      <p>Your projects are ready.</p>\n'}
                {'    </main>\n'}
                {'  );\n'}
                {'}'}
              </code>
            </pre>
          </figure>
          <figure className='qt-code is-after'>
            <figcaption>With gt-next</figcaption>
            <pre>
              <code>
                <span className='qt-hl'>{"import { T } from 'gt-next';"}</span>
                {'\n\n'}
                {'export default function Welcome() {\n'}
                {'  return (\n'}
                {'    <main>\n'}
                <span className='qt-hl'>{'      <T>'}</span>
                {'\n'}
                {'        <h1>Welcome back</h1>\n'}
                {'        <p>Your projects are ready.</p>\n'}
                <span className='qt-hl'>{'      </T>'}</span>
                {'\n'}
                {'    </main>\n'}
                {'  );\n'}
                {'}'}
              </code>
            </pre>
          </figure>
        </div>

        <RenderProof />

        <div className='qt-steps'>
          <div className='qt-step'>
            <StepMark className='qt-step-mark' />
            <h3>One command</h3>
            <p>The CLI translates your project at build time and keeps translations current in CI.</p>
          </div>
          <div className='qt-step'>
            <StepMark className='qt-step-mark' />
            <h3>Human review</h3>
            <p>
              The dashboard shows every string in context, so your team can review and edit before
              release.
            </p>
          </div>
          <div className='qt-step'>
            <StepMark className='qt-step-mark' />
            <h3>Edge delivery</h3>
            <p>Translations are served from a CDN, so localized pages load as fast as the original.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

type Hello = {
  text: string;
  name: string;
  lang: string;
  rtl?: boolean;
};

const HELLOS: readonly Hello[] = [
  { text: 'Hola', name: 'Español', lang: 'es' },
  { text: 'Bonjour', name: 'Français', lang: 'fr' },
  { text: 'Hallo', name: 'Deutsch', lang: 'de' },
  { text: 'Ciao', name: 'Italiano', lang: 'it' },
  { text: 'Olá', name: 'Português', lang: 'pt' },
  { text: 'こんにちは', name: '日本語', lang: 'ja' },
  { text: '안녕하세요', name: '한국어', lang: 'ko' },
  { text: '你好', name: '中文', lang: 'zh' },
  { text: 'مرحبا', name: 'العربية', lang: 'ar', rtl: true },
  { text: 'नमस्ते', name: 'हिन्दी', lang: 'hi' },
  { text: 'Γεια', name: 'Ελληνικά', lang: 'el' },
  { text: 'Merhaba', name: 'Türkçe', lang: 'tr' },
];

function Scripts() {
  return (
    <section className='qt-sec qt-scripts' id='scripts'>
      <div className='qt-drape' aria-hidden='true' />
      <div className='qt-rail qt-scripts-inner'>
        <TierLine n='III' />
        <h2>Twelve ways to say hello</h2>
        <p className='qt-lead'>
          Languages are not a checklist. Each writing system carries its own shapes, direction, and
          rhythm, and the platform renders each one correctly.
        </p>

        <ul className='qt-hellos'>
          {HELLOS.map((h) => (
            <li className='qt-hello' key={h.lang}>
              <span className='qt-hello-word' lang={h.lang} dir={h.rtl ? 'rtl' : undefined}>
                {h.text}
              </span>
              <span className='qt-hello-name' lang={h.lang}>
                {h.name}
              </span>
            </li>
          ))}
        </ul>

        <p className='qt-scripts-note'>
          The runtime serves more than 100 locales with correct plural rules, number and date
          formats, and text direction.
        </p>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section className='qt-sec' id='platform'>
      <div className='qt-rail'>
        <TierLine n='IV' />
        <h2>The platform</h2>
        <p className='qt-lead'>
          The libraries, the CLI, the dashboard, and the agent share one pipeline and one set of
          project keys.
        </p>

        <div className='qt-plat'>
          <article className='qt-card'>
            <StepMark className='qt-card-mark' />
            <h3>Libraries</h3>
            <p>
              gt-next and gt-react are open source React libraries with the{' '}
              <code className='qt-t'>{'<T>'}</code> component and hooks for strings, numbers,
              dates, and plurals.
            </p>
          </article>
          <article className='qt-card'>
            <StepMark className='qt-card-mark' />
            <h3>CLI</h3>
            <p>
              One command translates the project, checks in the results, and keeps them current on
              every build.
            </p>
          </article>
          <article className='qt-card'>
            <StepMark className='qt-card-mark' />
            <h3>Dashboard</h3>
            <p>
              You can review every translation in context, edit strings, and manage glossaries with
              your team.
            </p>
          </article>
          <article className='qt-card'>
            <StepMark className='qt-card-mark' />
            <h3>Locadex</h3>
            <p>
              Locadex is an AI agent that sets up i18n for you. It wraps your components,
              configures the project, and opens the pull request.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='qt-sec' id='pricing'>
      <div className='qt-rail'>
        <TierLine n='V' />
        <h2>Pricing</h2>
        <p className='qt-lead'>
          You can start free and pay for what you translate. Both plans cover buildtime, runtime,
          and review.
        </p>

        <div className='qt-plans'>
          <article className='qt-plan'>
            <h3>Starter</h3>
            <p className='qt-price'>
              $0 <span>to start</span>
            </p>
            <p className='qt-plan-copy'>
              The free tier covers everything you need to localize a real product.
            </p>
            <ul className='qt-plan-list'>
              <li>Every SDK and the translation CLI</li>
              <li>Dashboard, glossaries, and the editor</li>
              <li>Locadex runs on your repository</li>
            </ul>
            <a className='qt-btn qt-btn-solid' href='#top'>
              Get started
            </a>
          </article>

          <article className='qt-plan is-enterprise'>
            <h3>Enterprise</h3>
            <p className='qt-price'>
              Custom <span>annual</span>
            </p>
            <p className='qt-plan-copy'>
              An engineer walks you through implementation, volume, and your security review.
            </p>
            <ul className='qt-plan-list'>
              <li>Volume pricing across projects</li>
              <li>SOC 2 Type II, GDPR, and ISO 27001</li>
              <li>Support from the engineers who build the product</li>
            </ul>
            <a className='qt-btn qt-btn-line' href='#top'>
              Contact us
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS: readonly { title: string; links: readonly string[] }[] = [
  { title: 'Guides', links: ['Locadex Agent', 'Next.js', 'React', 'React Native'] },
  { title: 'Resources', links: ['Documentation', 'Blog', 'Pricing', 'Supported Locales'] },
  { title: 'Company', links: ['Careers', 'Contact', 'GitHub', 'Discord'] },
  { title: 'Legal', links: ['Terms of Service', 'Privacy', 'Acceptable Use', 'Manage Cookies'] },
];

function SiteFooter() {
  return (
    <footer className='qt-footer'>
      <Dissolve flip />
      <div className='qt-rail'>
        <div className='qt-foot-grid'>
          <div className='qt-foot-brand'>
            <a className='qt-brand' href='#top'>
              <Image
                src='/brand/no-bg-gt-logo-dark.png'
                alt='General Translation'
                width={26}
                height={26}
                className='qt-brand-mark'
              />
              <span className='qt-brand-name'>General Translation</span>
            </a>
            <p>A full stack localization platform.</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div className='qt-foot-col' key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((label) => (
                  <li key={label}>
                    <a href='#top'>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className='qt-foot-legal'>© 2026 General Translation, Inc.</p>
      </div>
    </footer>
  );
}

export default function QuantizedTemplePage() {
  return (
    <>
      <div className={`${cinzel.variable} ${inter.variable} quantized-temple-root`}>
        <TopNav />
        <Hero />
        <Proof />
        <Scripts />
        <Platform />
        <Pricing />
        <SiteFooter />
      </div>
      <DirectionCorner slug='quantized-temple' />
    </>
  );
}
