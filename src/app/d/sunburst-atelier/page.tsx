import { Cinzel, Inter, Poiret_One } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import { Frieze, HELLOS, ScriptWheel, SunburstCrown } from './ornaments';

import './styles.css';

export const metadata = {
  title: 'sunburst-atelier — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/** Display face: thin geometric deco capitals for headlines and the monogram. */
const poiret = Poiret_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poiret',
  display: 'swap',
});

/** Engraved face for nav links, locale tags, buttons, and numerals. */
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap',
});

/** Body face. The greetings fall back to system fonts for CJK, Arabic,
    and Devanagari, which is correct behavior for those scripts. */
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'greek'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * SUNBURST ATELIER. Real art deco: the Chrysler Building crown as a design
 * system. Black and champagne gold, strict symmetry, a radiating sunburst
 * fan crowning every section, stepped chevron friezes as dividers, and one
 * cream paper band mid-page for relief. The world-scripts section sets each
 * greeting on a ray of one shared sunburst, so languages literally radiate
 * from one center. That is the brand thesis drawn as geometry.
 */

const NAV_LEFT = [
  { label: 'Component', href: '#component' },
  { label: 'Languages', href: '#languages' },
  { label: 'Platform', href: '#platform' },
];

const NAV_RIGHT = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#top' },
  { label: 'Dashboard', href: '#top' },
];

const OUTPUTS = [
  { tag: 'ES', lang: 'es', text: 'Traducción de calidad para cada usuario' },
  { tag: 'FR', lang: 'fr', text: 'Une traduction de qualité pour chaque utilisateur' },
  { tag: 'DE', lang: 'de', text: 'Hochwertige Übersetzung für jeden Nutzer' },
  { tag: 'JA', lang: 'ja', text: 'すべてのユーザーに質の高い翻訳を' },
  { tag: 'KO', lang: 'ko', text: '모든 사용자를 위한 높은 품질의 번역' },
  { tag: 'AR', lang: 'ar', rtl: true, text: 'ترجمة عالية الجودة لكل مستخدم' },
];

const STEPS = [
  {
    numeral: 'I',
    title: 'Installation',
    body: 'Run npm i gt-next and wrap your app with the provider. The setup takes minutes, not a sprint.',
  },
  {
    numeral: 'II',
    title: 'Markup',
    body: 'Put the T component around your JSX. The CLI finds every wrapped string at build time.',
  },
  {
    numeral: 'III',
    title: 'Deployment',
    body: 'Run npx gtx-cli translate in CI. Translations version and deploy with your app.',
  },
];

const PRODUCTS = [
  {
    title: 'Open-source libraries',
    body: 'gt-next and gt-react are open-source SDKs. The T component, formatting utilities, and locale routing ship with them, and the CLI translates your project at build time.',
    mid: false,
  },
  {
    title: 'Locadex',
    body: 'Locadex is an AI agent that performs the internationalization setup for you. It reads your repository, wraps your components, and opens a pull request with your app internationalized.',
    mid: true,
  },
  {
    title: 'The dashboard',
    body: 'The dashboard holds every string for human review. Translation memory, glossaries, and edits live in one place, and approved translations publish to the edge network.',
    mid: false,
  },
];

const FOOTER_COLUMNS = [
  {
    title: 'Guides',
    links: ['Locadex Agent', 'Next.js', 'React', 'React Native'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Pricing', 'Supported Locales'],
  },
  {
    title: 'Company',
    links: ['Careers', 'Contact', 'GitHub', 'Discord'],
  },
  {
    title: 'Legal',
    links: ['Terms of Service', 'Privacy', 'Acceptable Use'],
  },
];

/** The chrome monogram roundel; size is set by the wrapper class. */
function Roundel({ small }: { small?: boolean }) {
  return (
    <span className={small ? 'sa-roundel is-small' : 'sa-roundel'} aria-hidden='true'>
      <span className='sa-roundel-chrome' />
      <span className='sa-roundel-core'>GT</span>
    </span>
  );
}

/** Conic-gradient sunburst fan that crowns a section heading. */
function FanCrest({ small }: { small?: boolean }) {
  return (
    <div className={small ? 'sa-fan is-small' : 'sa-fan'} aria-hidden='true'>
      <i />
    </div>
  );
}

export default function SunburstAtelierPage() {
  return (
    <>
      <div id='top' className={`${poiret.variable} ${cinzel.variable} ${inter.variable} sunburst-atelier-root`}>
        {/* ---------------- top nav ---------------- */}
        <header className='sa-nav'>
          <nav className='sa-nav-side is-left' aria-label='Primary'>
            {NAV_LEFT.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className='sa-nav-mark' href='#top' aria-label='General Translation, back to top'>
            <Roundel small />
          </a>
          <nav className='sa-nav-side is-right' aria-label='Secondary'>
            {NAV_RIGHT.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        {/* ---------------- hero ---------------- */}
        <section className='sa-hero'>
          <div className='sa-crown-wrap'>
            <SunburstCrown />
            <Roundel />
          </div>
          <p className='sa-wordmark'>General Translation</p>
          <h1>Every language from one source</h1>
          <p className='sa-lead'>
            General Translation is a full-stack localization platform. You wrap your interface in one
            component, and your app exists in more than thirty languages within minutes.
          </p>
          <div className='sa-cta-row'>
            <a className='sa-btn is-solid' href='#component'>
              Get Started
            </a>
            <a className='sa-btn' href='#platform'>
              Read the Docs
            </a>
          </div>
          <p className='sa-hero-plaque'>
            <code>npm i gt-next</code>
            <span>gt-next and gt-react are open source</span>
          </p>
        </section>

        <Frieze />

        {/* ---------------- product proof, on the cream band ---------------- */}
        <section className='sa-sec sa-cream' id='component'>
          <FanCrest />
          <h2>The T component</h2>
          <p className='sa-sec-lead'>
            You keep writing JSX. The T component marks it as translatable, and the platform does the
            rest. There are no extraction steps and no JSON catalogs to maintain.
          </p>

          <div className='sa-proof'>
            <div className='sa-panel'>
              <p className='sa-panel-label'>You write this once</p>
              <pre className='sa-code'>
                <code>
                  <span className='sa-k'>import</span>
                  {' { T } '}
                  <span className='sa-k'>from</span> <span className='sa-s'>&apos;gt-next&apos;</span>;{'\n\n'}
                  <span className='sa-k'>export default function</span> Hero() {'{\n'}
                  {'  '}
                  <span className='sa-k'>return</span> ({'\n    '}
                  <span className='sa-t'>{'<T>'}</span>
                  {'\n      '}
                  <span className='sa-t'>{'<h1>'}</span>
                  Quality translation for every user
                  <span className='sa-t'>{'</h1>'}</span>
                  {'\n    '}
                  <span className='sa-t'>{'</T>'}</span>
                  {'\n  '});{'\n'}
                  {'}'}
                </code>
              </pre>
            </div>

            <div className='sa-panel'>
              <p className='sa-panel-label'>Your users read this</p>
              <ul className='sa-outputs'>
                <li className='is-source'>
                  <span className='sa-loc'>EN</span>
                  <span className='sa-out-text' lang='en'>
                    Quality translation for every user
                  </span>
                </li>
                {OUTPUTS.map((row) => (
                  <li key={row.tag}>
                    <span className='sa-loc'>{row.tag}</span>
                    <span className='sa-out-text' lang={row.lang} dir={row.rtl ? 'rtl' : undefined}>
                      {row.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='sa-steps'>
            {STEPS.map((step) => (
              <div className='sa-step' key={step.numeral}>
                <span className='sa-step-numeral'>{step.numeral}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Frieze />

        {/* ---------------- world scripts on one sunburst ---------------- */}
        <section className='sa-sec' id='languages'>
          <FanCrest />
          <h2>The world from one center</h2>
          <p className='sa-sec-lead'>
            Each greeting below is a real string served by the platform. The source is written once at
            the center, and every ray is a locale that renders from it. The platform supports more than
            one hundred locales, with the regional variants that naive tools flatten.
          </p>

          <div className='sa-wheel'>
            <ScriptWheel />
          </div>

          <ul className='sa-hello-chips' aria-label='Greetings in twelve languages'>
            {HELLOS.map((hello) => (
              <li key={hello.tag}>
                <span lang={hello.lang} dir={hello.rtl ? 'rtl' : undefined}>
                  {hello.text}
                </span>
                <small>{hello.tag}</small>
              </li>
            ))}
          </ul>

          <p className='sa-wheel-caption'>
            The T component at the center. Twelve locales on the rays. Right-to-left scripts, CJK line
            breaking, and plural rules are handled by the SDK, not by your team.
          </p>
        </section>

        <Frieze />

        {/* ---------------- products ---------------- */}
        <section className='sa-sec' id='platform'>
          <FanCrest />
          <h2>The platform</h2>
          <p className='sa-sec-lead'>
            Three parts cover the whole path from source code to a reviewed translation in production.
          </p>

          <div className='sa-cards'>
            {PRODUCTS.map((product) => (
              <article className={product.mid ? 'sa-card is-mid' : 'sa-card'} key={product.title}>
                <FanCrest small />
                <h3>{product.title}</h3>
                <p>{product.body}</p>
              </article>
            ))}
          </div>
        </section>

        <Frieze />

        {/* ---------------- pricing ---------------- */}
        <section className='sa-sec' id='pricing'>
          <FanCrest />
          <h2>Pricing</h2>
          <p className='sa-sec-lead'>
            Full-stack localization across buildtime, runtime, and review, with usage-based rates
            published on the pricing page.
          </p>

          <div className='sa-plans'>
            <div className='sa-plan'>
              <h3>Starter</h3>
              <p className='sa-price'>
                $0 <small>to start</small>
              </p>
              <p className='sa-plan-body'>
                Start free and upgrade when you ship. Everything you need to localize a real product is
                included.
              </p>
              <ul>
                <li>Every SDK and the translation CLI</li>
                <li>Dashboard, glossaries, and the editor</li>
                <li>Locadex agent runs on your repo</li>
              </ul>
              <a className='sa-btn is-solid' href='#top'>
                Get Started
              </a>
            </div>

            <div className='sa-plan-divider' aria-hidden='true'>
              <span />
            </div>

            <div className='sa-plan'>
              <h3>Enterprise</h3>
              <p className='sa-price'>
                Custom <small>annual</small>
              </p>
              <p className='sa-plan-body'>
                Talk to an engineer about implementation, volume, and your security review. SOC 2 Type
                II, GDPR, and ISO 27001 reports are available.
              </p>
              <ul>
                <li>Volume pricing across projects</li>
                <li>Single sign-on and audit logs</li>
                <li>Support from the engineers who build it</li>
              </ul>
              <a className='sa-btn' href='#top'>
                Contact Us
              </a>
            </div>
          </div>

          <p className='sa-compare'>
            <a href='#top'>Compare plans and usage pricing</a>
          </p>
        </section>

        <Frieze />

        {/* ---------------- footer ---------------- */}
        <footer className='sa-footer'>
          <Roundel small />
          <p className='sa-footer-name'>General Translation</p>
          <p className='sa-footer-tag'>End-to-end localization for the world&rsquo;s best companies.</p>

          <div className='sa-footer-cols'>
            {FOOTER_COLUMNS.map((column) => (
              <div className='sa-footer-col' key={column.title}>
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

          <p className='sa-footer-legal'>© 2026 General Translation, Inc.</p>
        </footer>
      </div>
      <DirectionCorner slug='sunburst-atelier' />
    </>
  );
}
