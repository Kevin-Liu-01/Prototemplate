/**
 * BAYER FRIEZE — the page sections. Server components only; the copy is
 * plain declarative technical English and the ornaments come from
 * ornaments.tsx. Section anchors (proof, languages, platform, pricing)
 * back the top nav links.
 */

import {
  FanCorner,
  Frieze,
  Mark,
  Meander,
  StepCorner,
  Tile,
  Zigzag,
} from './ornaments';

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

export function TopNav() {
  return (
    <header className='bf-nav-wrap'>
      <Frieze steps={[16, 8, 1]} className='bf-selvage' />
      <div className='bf-container bf-nav'>
        <a className='bf-brand' href='#'>
          <Mark />
          <span className='bf-wordmark'>General Translation</span>
        </a>
        <nav className='bf-links' aria-label='Primary'>
          <a href='#proof'>Product</a>
          <a href='#languages'>Languages</a>
          <a href='#platform'>Platform</a>
          <a href='#pricing'>Pricing</a>
        </nav>
        <div className='bf-nav-cta'>
          <a className='bf-btn bf-btn-ghost' href='#'>
            Sign In
          </a>
          <a className='bf-btn bf-btn-jade' href='#pricing'>
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section className='bf-hero'>
      <div className='bf-hero-fans' aria-hidden='true'>
        <FanCorner />
        <FanCorner size={160} />
      </div>
      <div className='bf-container bf-hero-inner'>
        <h1 className='bf-h1'>Your app in thirty languages</h1>
        <p className='bf-lede'>
          General Translation is a full-stack localization platform for React
          and Next.js. Wrap your interface in the{' '}
          <span className='bf-t-inline'>{'<T>'}</span> component and ship it in
          more than thirty languages within minutes. Translations are served
          from a global CDN and reviewed by people in a dashboard built for
          that work.
        </p>
        <div className='bf-cta-row'>
          <a className='bf-btn bf-btn-jade bf-btn-lg' href='#pricing'>
            Start for Free
          </a>
          <a className='bf-btn bf-btn-line bf-btn-lg' href='#proof'>
            See How It Works
          </a>
        </div>
        <p className='bf-install'>
          <code>npm i gt-next</code>
          <span className='bf-install-sep' aria-hidden='true' />
          <code>npx gtx-cli init</code>
        </p>
      </div>
      <div className='bf-meander-band'>
        <Meander />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Product proof: source on the left, four locales on the right        */
/* ------------------------------------------------------------------ */

type Output = {
  locale: string;
  name: string;
  dir?: 'rtl';
  h: string;
  p: string;
};

const OUTPUTS: Output[] = [
  {
    locale: 'es',
    name: 'Spanish',
    h: 'Tu pedido ha sido enviado',
    p: 'Sigue el paquete desde la página de tu cuenta.',
  },
  {
    locale: 'ja',
    name: 'Japanese',
    h: 'ご注文の商品が発送されました',
    p: 'アカウントページから荷物を追跡できます。',
  },
  {
    locale: 'ar',
    name: 'Arabic',
    dir: 'rtl',
    h: 'تم شحن طلبك',
    p: 'تتبع الطرد من صفحة حسابك.',
  },
  {
    locale: 'de',
    name: 'German',
    h: 'Deine Bestellung wurde versandt',
    p: 'Verfolge das Paket über deine Kontoseite.',
  },
];

function CodeCard() {
  return (
    <figure className='bf-card bf-code-card'>
      <figcaption className='bf-card-head'>
        <Tile density={4} />
        <span>Source</span>
        <span className='bf-card-file'>app/order-status.tsx</span>
      </figcaption>
      <pre className='bf-code'>
        <code>
          <span className='tk-kw'>import</span>
          {' { '}
          <span className='tk-cmp'>T</span>
          {' } '}
          <span className='tk-kw'>from</span> <span className='tk-str'>'gt-next'</span>;{'\n\n'}
          <span className='tk-kw'>export default function</span>{' '}
          <span className='tk-fn'>OrderStatus</span>() {'{'}
          {'\n  '}
          <span className='tk-kw'>return</span> ({'\n    '}
          <span className='tk-tag'>{'<T>'}</span>
          {'\n      '}
          <span className='tk-tag'>{'<h2>'}</span>Your order has shipped
          <span className='tk-tag'>{'</h2>'}</span>
          {'\n      '}
          <span className='tk-tag'>{'<p>'}</span>Track the package from your account page.
          <span className='tk-tag'>{'</p>'}</span>
          {'\n    '}
          <span className='tk-tag'>{'</T>'}</span>
          {'\n  '});{'\n'}
          {'}'}
        </code>
      </pre>
    </figure>
  );
}

export function Proof() {
  return (
    <section id='proof' className='bf-section'>
      <div className='bf-container'>
        <header className='bf-sec-head'>
          <StepCorner />
          <div>
            <h2 className='bf-h2'>The {'<T>'} component</h2>
            <p className='bf-sec-lede'>
              You keep writing JSX. The component marks its children for
              translation, so there are no string keys to invent and no JSON
              catalogs to maintain. The CLI detects new content on each build
              and translates only what changed.
            </p>
          </div>
        </header>
        <div className='bf-proof'>
          <CodeCard />
          <div className='bf-vfrieze' aria-hidden='true'>
            <i className='bf-fv bf-f-4' />
            <i className='bf-fv bf-f-12' />
            <i className='bf-fv bf-f-4' />
          </div>
          <div className='bf-out-grid'>
            {OUTPUTS.map((o) => (
              <article
                key={o.locale}
                className='bf-out-card'
                lang={o.locale}
                dir={o.dir}
              >
                <header className='bf-out-head' lang='en' dir='ltr'>
                  <Tile density={8} size={14} />
                  <span>{o.name}</span>
                  <span className='bf-out-code'>{o.locale}</span>
                </header>
                <h3 className='bf-out-h'>{o.h}</h3>
                <p className='bf-out-p'>{o.p}</p>
              </article>
            ))}
          </div>
        </div>
        <p className='bf-caption'>
          The same component rendered in four locales. Text direction, plural
          rules, and formatting follow each locale.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Languages: real scripts set into the woven lattice                  */
/* ------------------------------------------------------------------ */

type Greeting = {
  text: string;
  lang: string;
  name: string;
  dir?: 'rtl';
};

const GREETINGS: Greeting[] = [
  { text: 'Hola', lang: 'es', name: 'Spanish' },
  { text: 'Bonjour', lang: 'fr', name: 'French' },
  { text: 'Hallo', lang: 'de', name: 'German' },
  { text: 'Ciao', lang: 'it', name: 'Italian' },
  { text: 'Olá', lang: 'pt', name: 'Portuguese' },
  { text: 'こんにちは', lang: 'ja', name: 'Japanese' },
  { text: '안녕하세요', lang: 'ko', name: 'Korean' },
  { text: '你好', lang: 'zh', name: 'Chinese' },
  { text: 'مرحبا', lang: 'ar', name: 'Arabic', dir: 'rtl' },
  { text: 'नमस्ते', lang: 'hi', name: 'Hindi' },
  { text: 'Γεια', lang: 'el', name: 'Greek' },
  { text: 'Merhaba', lang: 'tr', name: 'Turkish' },
];

/** Density chips step 1, 4, 8, 12 across the lattice like a woven course. */
const DENSITY_CYCLE: Array<1 | 4 | 8 | 12> = [1, 4, 8, 12];

export function Languages() {
  return (
    <section id='languages' className='bf-section bf-langs'>
      <div className='bf-zig-band' aria-hidden='true'>
        <Zigzag />
      </div>
      <div className='bf-container'>
        <header className='bf-sec-head'>
          <StepCorner />
          <div>
            <h2 className='bf-h2'>More than thirty languages</h2>
            <p className='bf-sec-lede'>
              Every supported locale ships with plural rules, number and date
              formatting, and the right text direction. Right-to-left scripts
              and CJK text render the way native readers expect.
            </p>
          </div>
        </header>
        <ul className='bf-greet-grid'>
          {GREETINGS.map((g, i) => (
            <li key={g.lang} className='bf-greet'>
              <span className='bf-greet-word' lang={g.lang} dir={g.dir}>
                {g.text}
              </span>
              <span className='bf-greet-meta'>
                <Tile density={DENSITY_CYCLE[i % 4]} size={12} />
                {g.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Platform: the four products                                         */
/* ------------------------------------------------------------------ */

type Product = {
  name: string;
  density: 4 | 8 | 12;
  jade?: boolean;
  body: string;
};

const PRODUCTS: Product[] = [
  {
    name: 'gt-next and gt-react',
    density: 4,
    body: 'Open-source libraries for Next.js and React. The <T> component and the useGT hook cover JSX, strings, variables, and plurals.',
  },
  {
    name: 'CLI',
    density: 8,
    body: 'gtx-cli scans your project, requests translations for new content, and writes the results back. It runs locally or in CI.',
  },
  {
    name: 'Dashboard',
    density: 12,
    body: 'Review every translated string in context, edit it, and publish the correction without a code change.',
  },
  {
    name: 'Locadex',
    density: 12,
    jade: true,
    body: 'An AI agent that performs the i18n setup itself. It reads your codebase, wraps the interface, and opens a pull request ready for review.',
  },
];

export function Platform() {
  return (
    <section id='platform' className='bf-section'>
      <div className='bf-container'>
        <header className='bf-sec-head'>
          <StepCorner />
          <div>
            <h2 className='bf-h2'>The platform</h2>
            <p className='bf-sec-lede'>
              Four parts share one translation pipeline. Use the libraries
              alone, or add the CLI, the dashboard, and Locadex as your
              project grows.
            </p>
          </div>
        </header>
        <div className='bf-prod-grid'>
          {PRODUCTS.map((p) => (
            <article key={p.name} className='bf-prod'>
              <i
                className={p.jade ? 'bf-f bf-f-j12' : `bf-f bf-f-${p.density}`}
                aria-hidden='true'
              />
              <div className='bf-prod-body'>
                <h3 className='bf-prod-name'>
                  <Tile density={p.density} jade={p.jade} size={16} />
                  {p.name}
                </h3>
                <p>{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

type Plan = {
  name: string;
  price: string;
  per: string;
  body: string;
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    per: 'per month',
    body: 'The open-source libraries plus hosted translation for development and small projects. Dashboard review included.',
    cta: 'Start for Free',
  },
  {
    name: 'Pro',
    price: 'Usage based',
    per: 'billed by the word',
    body: 'Production translation with CDN delivery, review tooling, and team projects. Pay for what you translate.',
    cta: 'Get Started',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: 'annual agreement',
    body: 'Custom terms, single sign-on, dedicated support, and security review for larger organizations.',
    cta: 'Contact Sales',
  },
];

export function Pricing() {
  return (
    <section id='pricing' className='bf-section bf-pricing'>
      <Frieze className='bf-divider' />
      <div className='bf-container'>
        <header className='bf-sec-head'>
          <StepCorner />
          <div>
            <h2 className='bf-h2'>Pricing</h2>
            <p className='bf-sec-lede'>
              Start free and pay for translation as usage grows.
            </p>
          </div>
        </header>
        <div className='bf-plans'>
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={p.featured ? 'bf-plan bf-plan-featured' : 'bf-plan'}
            >
              <Frieze
                steps={[4, 8, 16]}
                className={p.featured ? 'bf-frieze-jade' : ''}
              />
              <div className='bf-plan-body'>
                <h3 className='bf-plan-name'>{p.name}</h3>
                <p className='bf-plan-price'>{p.price}</p>
                <p className='bf-plan-per'>{p.per}</p>
                <p className='bf-plan-copy'>{p.body}</p>
                <a
                  className={
                    p.featured
                      ? 'bf-btn bf-btn-jade bf-btn-block'
                      : 'bf-btn bf-btn-line bf-btn-block'
                  }
                  href='#'
                >
                  {p.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer: the system inverted onto ink                                */
/* ------------------------------------------------------------------ */

type FooterCol = { title: string; links: string[] };

const FOOTER_COLS: FooterCol[] = [
  {
    title: 'Product',
    links: ['gt-next', 'gt-react', 'CLI', 'Dashboard', 'Locadex'],
  },
  {
    title: 'Developers',
    links: ['Documentation', 'Quickstart', 'API Reference', 'GitHub'],
  },
  { title: 'Company', links: ['Blog', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
];

export function SiteFooter() {
  return (
    <footer className='bf-footer'>
      <div className='bf-meander-band bf-meander-band-ink'>
        <Meander tone='cream' />
      </div>
      <div className='bf-container bf-foot-inner'>
        <div className='bf-foot-brand'>
          <p className='bf-brand bf-foot-brand-row'>
            <Mark tone='cream' />
            <span className='bf-wordmark'>General Translation</span>
          </p>
          <p className='bf-foot-tag'>
            Full-stack localization for React, from the component to the CDN.
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <nav key={col.title} className='bf-foot-col' aria-label={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href='#'>{l}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className='bf-container bf-foot-bottom'>
        <Frieze steps={[12, 4, 1]} className='bf-frieze-cream bf-foot-rule' />
        <p>© 2026 General Translation, Inc.</p>
      </div>
    </footer>
  );
}
