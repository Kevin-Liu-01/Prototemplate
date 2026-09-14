import { Fraunces, Inter } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import './styles.css';

export const metadata = {
  title: 'gilded-ledger — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * GILDED LEDGER — a 1928 annual report as a website. Ivory paper, warm ink,
 * gold-leaf rules, marbled endpaper bands at both ends of the "book",
 * monogram cartouches, double-rule frames around every figure. GT's
 * precision voice becomes fine bookmaking: the product demo is an engraved
 * plate with a caption, the locales are a colophon of scripts, the pricing
 * table is a two-page ledger spread. All ornament is CSS; the only motion
 * is a title-page rise and a gold sheen on the primary button, both
 * disabled under prefers-reduced-motion.
 */

const display = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-gl-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-gl-body',
  display: 'swap',
});

/* ---------------------------------------------------------------- data */

type TocRow = { no: string; title: string; ref: string; href: string };

const TOC: readonly TocRow[] = [
  { no: 'I', title: 'The component', ref: 'Plate I', href: '#plate' },
  { no: 'II', title: 'A colophon of scripts', ref: 'Plate II', href: '#colophon' },
  { no: 'III', title: 'The product line', ref: 'Ledger', href: '#products' },
  { no: 'IV', title: 'Rates and accounts', ref: 'Accounts', href: '#pricing' },
];

const CUSTOMERS: readonly string[] = [
  'Cursor',
  'Ramp',
  'Mintlify',
  'Profound',
  'Partiful',
  'ClickHouse',
];

/** One tokenized code line: [text, tint class suffix]. */
type Tok = readonly [text: string, cls?: string];

const CODE: readonly (readonly Tok[])[] = [
  [
    ['import', 'k'],
    [' { '],
    ['T', 't'],
    [' } '],
    ['from', 'k'],
    [' '],
    [`'gt-next'`, 's'],
    [';'],
  ],
  [[' ']],
  [
    ['export default function', 'k'],
    [' '],
    ['Welcome', 'f'],
    ['() {'],
  ],
  [['  '], ['return', 'k'], [' (']],
  [['    <'], ['T', 't'], ['>']],
  [['      <'], ['h1', 'g'], ['>Welcome</'], ['h1', 'g'], ['>']],
  [['      <'], ['p', 'g'], ['>Your account is ready.</'], ['p', 'g'], ['>']],
  [['    </'], ['T', 't'], ['>']],
  [['  );']],
  [['}']],
];

type Rendering = {
  tag: string;
  lang: string;
  rtl?: boolean;
  h: string;
  p: string;
};

const RENDERINGS: readonly Rendering[] = [
  { tag: 'en-US', lang: 'en', h: 'Welcome', p: 'Your account is ready.' },
  { tag: 'es-ES', lang: 'es', h: 'Bienvenido', p: 'Su cuenta está lista.' },
  { tag: 'ja-JP', lang: 'ja', h: 'ようこそ', p: 'アカウントの準備ができました。' },
  { tag: 'de-DE', lang: 'de', h: 'Willkommen', p: 'Ihr Konto ist bereit.' },
  { tag: 'ar-SA', lang: 'ar', rtl: true, h: 'مرحبا', p: 'حسابك جاهز.' },
  { tag: 'ko-KR', lang: 'ko', h: '환영합니다', p: '계정이 준비되었습니다.' },
];

type Entry = { no: string; name: string; text: string };

const ENTRIES: readonly Entry[] = [
  {
    no: 'Entry 1',
    name: 'Install',
    text: 'Add the library with npm i gt-next and register the provider once.',
  },
  {
    no: 'Entry 2',
    name: 'Mark',
    text: 'Wrap interface copy in the T component. Variables, plurals, and branches stay in your JSX.',
  },
  {
    no: 'Entry 3',
    name: 'Translate',
    text: 'Run npx gt translate in CI. New strings arrive translated before the deploy completes.',
  },
];

type Script = { text: string; name: string; tag: string; rtl?: boolean };

const SCRIPTS: readonly Script[] = [
  { text: 'Hola', name: 'Spanish', tag: 'es' },
  { text: 'Bonjour', name: 'French', tag: 'fr' },
  { text: 'Hallo', name: 'German', tag: 'de' },
  { text: 'Ciao', name: 'Italian', tag: 'it' },
  { text: 'Olá', name: 'Portuguese', tag: 'pt' },
  { text: 'こんにちは', name: 'Japanese', tag: 'ja' },
  { text: '안녕하세요', name: 'Korean', tag: 'ko' },
  { text: '你好', name: 'Chinese', tag: 'zh' },
  { text: 'مرحبا', name: 'Arabic', tag: 'ar', rtl: true },
  { text: 'नमस्ते', name: 'Hindi', tag: 'hi' },
  { text: 'Γεια', name: 'Greek', tag: 'el' },
  { text: 'Merhaba', name: 'Turkish', tag: 'tr' },
];

const VARIANTS: readonly string[] = ['zh-Hans', 'zh-Hant', 'pt-BR', 'pt-PT', 'de-CH', 'ar-EG', 'fr-CA'];

type Product = { no: string; name: string; kind: string; text: string };

const PRODUCTS: readonly Product[] = [
  {
    no: 'I',
    name: 'gt-next',
    kind: 'Library',
    text: 'The Next.js library carries the T component, locale-aware routing, and static rendering support.',
  },
  {
    no: 'II',
    name: 'gt-react',
    kind: 'Library',
    text: 'The React library serves Vite, Create React App, and React Native projects.',
  },
  {
    no: 'III',
    name: 'CLI',
    kind: 'Tool',
    text: 'The command line tool sends new strings for translation from CI. A dry run prints what would change and bills zero tokens.',
  },
  {
    no: 'IV',
    name: 'Dashboard',
    kind: 'Platform',
    text: 'The dashboard holds review, editing, and approval. Glossaries keep terminology consistent across releases.',
  },
  {
    no: 'V',
    name: 'Locadex',
    kind: 'Agent',
    text: 'The AI agent performs the i18n setup on a repository and opens the pull request for review.',
  },
];

type Rate = { workflow: string; rate: string; gtLibs?: string };

const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

type FooterCol = { head: string; links: readonly string[] };

const FOOTER_COLS: readonly FooterCol[] = [
  { head: 'Product', links: ['gt-next', 'gt-react', 'CLI', 'Dashboard', 'Locadex'] },
  { head: 'Resources', links: ['Documentation', 'Guides', 'API reference', 'Status'] },
  { head: 'Company', links: ['Blog', 'Careers', 'Contact', 'Privacy', 'Terms'] },
];

/* ---------------------------------------------------------- ornaments */

/** The GT monogram cartouche: a double-ringed roundel, gold inner rule. */
function Monogram({ large }: { large?: boolean }) {
  return (
    <span className={large ? 'gl-monogram is-lg' : 'gl-monogram'} aria-hidden='true'>
      GT
    </span>
  );
}

/** Hairline pair with a central gold diamond, the section ornament. */
function Ornament() {
  return (
    <span className='gl-orn' aria-hidden='true'>
      <i />
      <b />
      <i />
    </span>
  );
}

/** The four gold corner diamonds of a double-rule frame. */
function Corners() {
  return (
    <>
      <i className='gl-corner is-tl' aria-hidden='true' />
      <i className='gl-corner is-tr' aria-hidden='true' />
      <i className='gl-corner is-bl' aria-hidden='true' />
      <i className='gl-corner is-br' aria-hidden='true' />
    </>
  );
}

function SectionHead({ numeral, title, note }: { numeral: string; title: string; note: string }) {
  return (
    <header className='gl-sechead'>
      <span className='gl-sc gl-sechead-no'>Section {numeral}</span>
      <h2>{title}</h2>
      <Ornament />
      <p>{note}</p>
    </header>
  );
}

/* ------------------------------------------------------------ sections */

function Masthead() {
  return (
    <header className='gl-mast'>
      <div className='gl-page'>
        <div className='gl-folio gl-sc'>
          <span>General Translation</span>
          <span className='gl-folio-mid'>Full-stack localization</span>
          <span>generaltranslation.com</span>
        </div>
        <div className='gl-mast-row'>
          <a className='gl-mast-brand' href='#top'>
            <Monogram />
            <span className='gl-mast-name'>General Translation</span>
          </a>
          <nav className='gl-mast-nav gl-sc' aria-label='Primary'>
            <a href='#plate'>Component</a>
            <a href='#colophon'>Colophon</a>
            <a href='#products'>Products</a>
            <a href='#pricing'>Rates</a>
          </nav>
          <div className='gl-mast-cta'>
            <a className='gl-btn' href='#top'>
              Sign in
            </a>
            <a className='gl-btn is-ink' href='#top'>
              Get started
            </a>
          </div>
        </div>
      </div>
      <div className='gl-mast-rule' aria-hidden='true' />
    </header>
  );
}

function Hero() {
  return (
    <section className='gl-hero'>
      <div className='gl-page'>
        <div className='gl-titlepage'>
          <Corners />
          <div className='gl-fan' aria-hidden='true' />
          <Monogram large />
          <p className='gl-sc gl-kicker'>The General Translation platform</p>
          <h1>
            Your product, in <em>every language</em>
          </h1>
          <p className='gl-lede'>
            General Translation is a full-stack localization platform. The open-source libraries
            drop into React and Next.js, the CLI runs in your pipeline, the dashboard holds
            review, and Locadex, the AI agent, performs the setup. An application exists in
            thirty languages minutes after install.
          </p>
          <div className='gl-hero-cta'>
            <a className='gl-btn is-ink' href='#pricing'>
              Get started
            </a>
            <a className='gl-btn' href='#plate'>
              Read the documentation
            </a>
          </div>
          <nav className='gl-toc' aria-label='Contents'>
            <span className='gl-sc gl-toc-head'>Contents</span>
            {TOC.map((row) => (
              <a className='gl-toc-row' href={row.href} key={row.no}>
                <span className='gl-toc-title'>
                  <span className='gl-toc-no'>{row.no}.</span> {row.title}
                </span>
                <span className='gl-lead' aria-hidden='true' />
                <span className='gl-sc gl-toc-ref'>{row.ref}</span>
              </a>
            ))}
          </nav>
        </div>

        <p className='gl-sc gl-trust'>In production at</p>
        <ul className='gl-trust-row'>
          {CUSTOMERS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Plate() {
  return (
    <section className='gl-sec' id='plate'>
      <div className='gl-page'>
        <SectionHead
          numeral='I'
          title='The component'
          note='You keep writing JSX. The T component makes it exist in the reader’s language.'
        />

        <figure className='gl-figure'>
          <div className='gl-plate'>
            <Corners />
            <div className='gl-plate-pane is-source'>
              <span className='gl-sc gl-pane-label'>The source</span>
              <pre className='gl-code'>
                <code>
                  {CODE.map((line, i) => (
                    <span className='gl-code-line' key={i}>
                      {line.map((tok, j) => {
                        const [text, cls] = tok;
                        return cls ? (
                          <span className={`gl-tk-${cls}`} key={j}>
                            {text}
                          </span>
                        ) : (
                          <span key={j}>{text}</span>
                        );
                      })}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
            <div className='gl-plate-pane is-render'>
              <span className='gl-sc gl-pane-label'>The renderings</span>
              <ul className='gl-render-list'>
                {RENDERINGS.map((row) => (
                  <li
                    className='gl-render-row'
                    dir={row.rtl ? 'rtl' : undefined}
                    key={row.tag}
                    lang={row.lang}
                  >
                    <span className='gl-sc gl-render-tag' dir='ltr' lang='en'>
                      {row.tag}
                    </span>
                    <span className='gl-render-copy'>
                      <strong>{row.h}</strong>
                      <span>{row.p}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <figcaption className='gl-sc gl-caption'>
            Plate I · One source component, rendered in the reader’s language at request time
          </figcaption>
        </figure>

        <div className='gl-entries'>
          {ENTRIES.map((entry) => (
            <article className='gl-entry' key={entry.no}>
              <span className='gl-sc gl-entry-no'>
                {entry.no} · {entry.name}
              </span>
              <p>{entry.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Colophon() {
  return (
    <section className='gl-sec' id='colophon'>
      <div className='gl-page'>
        <SectionHead
          numeral='II'
          title='A colophon of scripts'
          note='GT ships more than one hundred locales. Every specimen below is a live string, not an image.'
        />

        <figure className='gl-figure'>
          <ul className='gl-scripts'>
            {SCRIPTS.map((s, i) => (
              <li className='gl-script' dir={s.rtl ? 'rtl' : undefined} key={s.tag} lang={s.tag}>
                <span className='gl-sc gl-script-no' dir='ltr' lang='en'>
                  No. {i + 1}
                </span>
                <span className='gl-script-word'>{s.text}</span>
                <span className='gl-sc gl-script-name' dir='ltr' lang='en'>
                  {s.name} · {s.tag}
                </span>
              </li>
            ))}
          </ul>
          <figcaption className='gl-sc gl-caption'>
            Plate II · Twelve of the writing systems the platform serves
          </figcaption>
        </figure>

        <div className='gl-variants'>
          <p>
            The catalogue records regional variants as separate entries. zh-Hans and zh-Hant are
            different lines in the ledger, and both ship.
          </p>
          <ul className='gl-variant-row'>
            {VARIANTS.map((tag) => (
              <li key={tag}>
                <code>{tag}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className='gl-sec' id='products'>
      <div className='gl-page'>
        <SectionHead
          numeral='III'
          title='The product line'
          note='Five instruments share one translation memory, so a term approved once stays approved everywhere.'
        />

        <div className='gl-ledger'>
          {PRODUCTS.map((row) => (
            <article className='gl-ledger-row' key={row.no}>
              <span className='gl-ledger-no'>{row.no}</span>
              <h3>{row.name}</h3>
              <p>{row.text}</p>
              <span className='gl-sc gl-ledger-kind'>{row.kind}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='gl-sec' id='pricing'>
      <div className='gl-page is-wide'>
        <SectionHead
          numeral='IV'
          title='Rates and accounts'
          note='Starter is free to begin. Usage is billed per token at the published rates, so the price of a translation is knowable before you run it.'
        />

        <div className='gl-spread'>
          <Corners />
          <div className='gl-spread-page'>
            <header className='gl-spread-head'>
              <span className='gl-sc'>Schedule of rates</span>
            </header>
            <ul className='gl-rates'>
              {RATES.map((row) => (
                <li className='gl-rate' key={row.workflow}>
                  <span className='gl-rate-name'>{row.workflow}</span>
                  <span className='gl-lead' aria-hidden='true' />
                  <span className='gl-rate-value'>
                    {row.rate}
                    {row.gtLibs ? <small>with GT libraries {row.gtLibs}</small> : null}
                  </span>
                </li>
              ))}
            </ul>
            <div className='gl-rates-foot'>
              <p>A usage limit is a hard cap. It blocks billing even with auto-reload on.</p>
              <p>
                <code>npx gt translate --dry-run</code> prints what would be translated and bills
                zero tokens.
              </p>
            </div>
          </div>

          <div className='gl-spread-page is-right'>
            <header className='gl-spread-head'>
              <span className='gl-sc'>Accounts</span>
            </header>

            <article className='gl-account'>
              <div className='gl-account-head'>
                <h3>Starter</h3>
                <p className='gl-account-price'>
                  $0 <span className='gl-sc'>per month</span>
                </p>
              </div>
              <p>
                Unlimited users, projects, and languages. The editor, the GitHub integration, and
                Locadex are included. The minimum top-up is $10.
              </p>
              <ul className='gl-account-list'>
                <li>Every SDK and the translation CLI</li>
                <li>Dashboard, glossaries, and the editor</li>
                <li>Locadex agent runs on your repo</li>
              </ul>
              <a className='gl-btn is-ink' href='#top'>
                Get started
              </a>
            </article>

            <article className='gl-account'>
              <div className='gl-account-head'>
                <h3>Enterprise</h3>
                <p className='gl-account-price'>
                  Custom <span className='gl-sc'>annual</span>
                </p>
              </div>
              <p>
                Forward-deployed engineers, custom workflows for any format or framework, and
                shared context across projects.
              </p>
              <ul className='gl-account-list'>
                <li>SSO, RBAC, webhooks, custom SLA</li>
                <li>SOC 2 Type II, GDPR, ISO 27001</li>
                <li>Support from the engineers who build it</li>
              </ul>
              <a className='gl-btn' href='#top'>
                Contact us
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='gl-footer'>
      <div className='gl-page'>
        <div className='gl-footer-grid'>
          <div className='gl-footer-brand'>
            <Monogram />
            <p>
              General Translation builds the localization stack: libraries, CLI, dashboard, and
              the Locadex agent.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <nav aria-label={col.head} className='gl-footer-col' key={col.head}>
              <span className='gl-sc gl-footer-head'>{col.head}</span>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href='#top'>{link}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className='gl-colophon'>
          <Ornament />
          <p className='gl-sc'>
            Set in Fraunces and Inter · Ornament drawn in CSS · © 2026 General Translation, Inc.
          </p>
        </div>
      </div>
      <div className='gl-marble' aria-hidden='true' />
    </footer>
  );
}

/* ---------------------------------------------------------------- page */

export default function GildedLedgerPage() {
  return (
    <>
      <div className={`gilded-ledger-root ${display.variable} ${body.variable}`} id='top'>
        <Masthead />
        <div className='gl-marble' aria-hidden='true' />
        <Hero />
        <Plate />
        <Colophon />
        <Products />
        <Pricing />
        <Footer />
      </div>
      <DirectionCorner slug='gilded-ledger' />
    </>
  );
}
