import Image from 'next/image';
import { Inter, Marcellus } from 'next/font/google';
import type { ReactNode } from 'react';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import MosaicHero from './MosaicHero';

import './styles.css';

const marcellus = Marcellus({
  weight: '400',
  subsets: ['latin'],
  variable: '--gm-font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--gm-font-body',
  display: 'swap',
});

export const metadata = {
  title: 'glyph-mosaic — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * GLYPH MOSAIC — dither-focused art deco. The Chrysler lobby floor rebuilt
 * from language: the hero canvas sets the GT monogram from glyph tesserae in
 * eight writing systems on a sunburst ground, and a legend names each script
 * by color. Warm sand, terracotta, ink, and gold; Marcellus display over
 * Inter body; every ornament is CSS geometry or the one canvas. The product
 * sections keep the same thesis concrete: the T component renders one
 * sentence in ten locales, and twelve greeting tiles carry real scripts with
 * correct lang and dir.
 */

const LEGEND: readonly { key: string; glyph: string; name: string }[] = [
  { key: 'latin', glyph: 'G', name: 'Latin' },
  { key: 'greek', glyph: 'Γ', name: 'Greek' },
  { key: 'cyrillic', glyph: 'Б', name: 'Cyrillic' },
  { key: 'arabic', glyph: 'ع', name: 'Arabic' },
  { key: 'devanagari', glyph: 'अ', name: 'Devanagari' },
  { key: 'hangul', glyph: '한', name: 'Hangul' },
  { key: 'kana', glyph: 'あ', name: 'Kana' },
  { key: 'han', glyph: '文', name: 'Han' },
];

const RENDERINGS: readonly {
  code: string;
  lang: string;
  dir?: 'rtl';
  text: string;
}[] = [
  { code: 'ES', lang: 'es', text: 'Tus palabras llegan a cada lector.' },
  { code: 'FR', lang: 'fr', text: 'Vos mots parviennent à chaque lecteur.' },
  { code: 'DE', lang: 'de', text: 'Ihre Worte erreichen jeden Leser.' },
  { code: 'PT', lang: 'pt', text: 'Suas palavras chegam a cada leitor.' },
  { code: 'EL', lang: 'el', text: 'Τα λόγια σας φτάνουν σε κάθε αναγνώστη.' },
  { code: 'HI', lang: 'hi', text: 'आपके शब्द हर पाठक तक पहुँचते हैं।' },
  { code: 'AR', lang: 'ar', dir: 'rtl', text: 'تصل كلماتك إلى كل قارئ.' },
  { code: 'JA', lang: 'ja', text: 'あなたの言葉はすべての読者に届きます。' },
  { code: 'KO', lang: 'ko', text: '당신의 글은 모든 독자에게 닿습니다.' },
  { code: 'ZH', lang: 'zh', text: '你的文字抵达每一位读者。' },
];

const GREETINGS: readonly {
  text: string;
  lang: string;
  dir?: 'rtl';
  language: string;
  script: string;
}[] = [
  { text: 'Hola', lang: 'es', language: 'Spanish', script: 'Latin' },
  { text: 'Bonjour', lang: 'fr', language: 'French', script: 'Latin' },
  { text: 'Hallo', lang: 'de', language: 'German', script: 'Latin' },
  { text: 'Ciao', lang: 'it', language: 'Italian', script: 'Latin' },
  { text: 'Olá', lang: 'pt', language: 'Portuguese', script: 'Latin' },
  { text: 'Γεια', lang: 'el', language: 'Greek', script: 'Greek' },
  { text: 'مرحبا', lang: 'ar', dir: 'rtl', language: 'Arabic', script: 'Arabic' },
  { text: 'नमस्ते', lang: 'hi', language: 'Hindi', script: 'Devanagari' },
  { text: '안녕하세요', lang: 'ko', language: 'Korean', script: 'Hangul' },
  { text: 'こんにちは', lang: 'ja', language: 'Japanese', script: 'Kana' },
  { text: '你好', lang: 'zh', language: 'Chinese', script: 'Han' },
  { text: 'Merhaba', lang: 'tr', language: 'Turkish', script: 'Latin' },
];

const PRODUCTS: readonly { numeral: string; name: string; body: string }[] = [
  {
    numeral: 'I',
    name: 'Libraries',
    body: 'gt-next and gt-react provide components, hooks, and localized routing. The T component is the only API most apps need.',
  },
  {
    numeral: 'II',
    name: 'CLI',
    body: 'gtx-cli scans the project, sends new content for translation, and writes the results back to the repository. It runs locally or in CI.',
  },
  {
    numeral: 'III',
    name: 'Dashboard',
    body: 'Review every translation in context, edit strings by hand, and manage glossaries and brand terms with your team.',
  },
  {
    numeral: 'IV',
    name: 'Locadex',
    body: 'An AI agent that performs the i18n setup for you. Point it at a repository and it opens a pull request with the full integration.',
  },
];

const FOOTER_COLUMNS: readonly { title: string; links: readonly string[] }[] = [
  { title: 'Products', links: ['gt-next', 'gt-react', 'gtx-cli', 'Locadex'] },
  {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Pricing', 'Supported locales'],
  },
  { title: 'Company', links: ['Careers', 'Contact', 'GitHub', 'Discord'] },
  {
    title: 'Legal',
    links: ['Terms of service', 'Privacy', 'Acceptable use'],
  },
];

/** Section heading with the deco rule: line, diamond, line. */
function RuleHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className='gm-head'>
      <div className='gm-rulemark' aria-hidden>
        <i />
        <b />
        <i />
      </div>
      <h2>{title}</h2>
      <p>{lead}</p>
    </div>
  );
}

/** Cut-corner deco tile: the outer layer paints the gold edge, the inner
    layer paints the fill, both clipped to the same octagon. */
function Tile({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`gm-tile ${className ?? ''}`}>
      <div className='gm-tile-in'>{children}</div>
    </div>
  );
}

export default function GlyphMosaicPage() {
  return (
    <>
      <div
        className={`glyph-mosaic-root ${marcellus.variable} ${inter.variable}`}
        id='top'
      >
        <header className='gm-nav'>
          <div className='gm-rail gm-nav-in'>
            <a className='gm-brand' href='#top'>
              <Image
                src='/brand/no-bg-gt-logo-light.png'
                alt='General Translation'
                width={26}
                height={26}
              />
              <span>General Translation</span>
            </a>
            <nav className='gm-nav-links' aria-label='Site'>
              <a href='#component'>Docs</a>
              <a href='#platform'>Products</a>
              <a href='#pricing'>Pricing</a>
              <a href='#scripts'>Blog</a>
            </nav>
            <div className='gm-nav-cta'>
              <a className='gm-signin' href='#pricing'>
                Sign in
              </a>
              <a className='gm-btn gm-btn-solid gm-btn-sm' href='#pricing'>
                <span>Get started</span>
              </a>
            </div>
          </div>
        </header>

        <section className='gm-hero'>
          <div className='gm-rail'>
            <h1>Your app in every language</h1>
            <p className='gm-hero-lead'>
              General Translation is a full-stack localization platform for
              React and Next.js. Install the library, wrap your interface in
              the T component, and your app renders in more than thirty
              languages.
            </p>
            <div className='gm-hero-cta'>
              <a className='gm-btn gm-btn-solid' href='#pricing'>
                <span>Start free</span>
              </a>
              <a className='gm-btn gm-btn-line' href='#component'>
                <span>Read the docs</span>
              </a>
            </div>

            <figure className='gm-mosaic'>
              <div className='gm-mosaic-frame'>
                <MosaicHero />
              </div>
              <figcaption className='gm-mosaic-caption'>
                The GT monogram, set from about three thousand glyph tesserae.
                Each color names a writing system the platform ships.
              </figcaption>
              <ul className='gm-legend'>
                {LEGEND.map((s) => (
                  <li key={s.key} className='gm-legend-chip'>
                    <span
                      className='gm-legend-glyph'
                      style={{ color: `var(--gm-s-${s.key})` }}
                      aria-hidden
                    >
                      {s.glyph}
                    </span>
                    <span className='gm-legend-name'>{s.name}</span>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        </section>

        <div className='gm-frieze' aria-hidden />

        <section className='gm-sec' id='component'>
          <div className='gm-rail'>
            <RuleHead
              title='One component'
              lead='The T component marks JSX for translation in place. You keep writing the interface in English and the library renders it in every configured locale. There are no extraction scripts and no catalog files to maintain.'
            />

            <div className='gm-proof'>
              <div className='gm-proof-col'>
                <h3 className='gm-proof-label'>What you write</h3>
                <Tile className='gm-code-tile'>
                  <pre className='gm-code'>
                    <code>
                      <span className='gm-tok-kw'>import</span>
                      {' { '}
                      <span className='gm-tok-tag'>T</span>
                      {' } '}
                      <span className='gm-tok-kw'>from</span>{' '}
                      <span className='gm-tok-str'>&#39;gt-next&#39;</span>;
                      {'\n\n'}
                      <span className='gm-tok-kw'>export function</span>{' '}
                      Welcome() {'{\n'}
                      {'  '}
                      <span className='gm-tok-kw'>return</span> ({'\n'}
                      {'    '}&lt;<span className='gm-tok-tag'>T</span>&gt;
                      {'\n'}
                      {'      '}&lt;<span className='gm-tok-tag'>p</span>
                      &gt;Your words reach every reader.&lt;/
                      <span className='gm-tok-tag'>p</span>&gt;{'\n'}
                      {'    '}&lt;/<span className='gm-tok-tag'>T</span>&gt;
                      {'\n'}
                      {'  '});{'\n'}
                      {'}'}
                    </code>
                  </pre>
                </Tile>
              </div>

              <div className='gm-proof-col'>
                <h3 className='gm-proof-label'>What your readers get</h3>
                <Tile className='gm-render-tile'>
                  <ul className='gm-renderings'>
                    <li className='gm-render-row is-source' lang='en'>
                      <span className='gm-render-code'>EN</span>
                      <span className='gm-render-text'>
                        Your words reach every reader.
                      </span>
                    </li>
                    {RENDERINGS.map((r) => (
                      <li
                        key={r.code}
                        className='gm-render-row'
                        lang={r.lang}
                        dir={r.dir}
                      >
                        <span className='gm-render-code' dir='ltr'>
                          {r.code}
                        </span>
                        <span className='gm-render-text'>{r.text}</span>
                      </li>
                    ))}
                  </ul>
                </Tile>
              </div>
            </div>

            <ol className='gm-steps'>
              <li>
                <span className='gm-step-cmd'>npm i gt-next</span>
                <p>Add the library to your project.</p>
              </li>
              <li>
                <span className='gm-step-cmd'>&lt;T&gt;...&lt;/T&gt;</span>
                <p>Wrap the components you want translated.</p>
              </li>
              <li>
                <span className='gm-step-cmd'>npx gtx-cli translate</span>
                <p>Translate at build time and deploy. A new locale is one
                line of config.</p>
              </li>
            </ol>
          </div>
        </section>

        <div className='gm-frieze' aria-hidden />

        <section className='gm-sec gm-sec-sunk' id='scripts'>
          <div className='gm-rail'>
            <RuleHead
              title='Writing systems'
              lead='Localization is more than word replacement. The library handles plural rules, number and date formats, and right-to-left layout, so each greeting below reads correctly in its own script.'
            />
            <ul className='gm-greetings'>
              {GREETINGS.map((g) => (
                <li key={g.lang}>
                  <Tile className='gm-greet-tile'>
                    <span
                      className='gm-greet-word'
                      lang={g.lang}
                      dir={g.dir}
                    >
                      {g.text}
                    </span>
                    <span className='gm-greet-meta'>
                      <span className='gm-greet-lang'>{g.language}</span>
                      <span className='gm-greet-script'>{g.script}</span>
                    </span>
                  </Tile>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className='gm-frieze' aria-hidden />

        <section className='gm-sec' id='platform'>
          <div className='gm-rail'>
            <RuleHead
              title='The platform'
              lead='Four pieces cover the whole path from source code to reviewed translation. They share one dashboard and one set of glossaries.'
            />
            <div className='gm-products'>
              {PRODUCTS.map((p) => (
                <Tile key={p.name} className='gm-product-tile'>
                  <span className='gm-product-numeral' aria-hidden>
                    {p.numeral}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.body}</p>
                </Tile>
              ))}
            </div>
          </div>
        </section>

        <div className='gm-frieze' aria-hidden />

        <section className='gm-sec gm-sec-sunk' id='pricing'>
          <div className='gm-rail'>
            <RuleHead
              title='Pricing'
              lead='Full-stack localization across buildtime, runtime, and review. Start free and pay for usage when you ship.'
            />
            <div className='gm-plans'>
              <Tile className='gm-plan'>
                <h3>Starter</h3>
                <div className='gm-plan-price'>
                  $0 <small>to start</small>
                </div>
                <p>
                  Everything you need to localize a production app, free until
                  your usage grows.
                </p>
                <ul className='gm-plan-list'>
                  <li>Every SDK and the translation CLI</li>
                  <li>Dashboard, glossaries, and the review editor</li>
                  <li>Locadex runs on your repository</li>
                </ul>
                <a className='gm-btn gm-btn-solid' href='#top'>
                  <span>Get started</span>
                </a>
              </Tile>
              <Tile className='gm-plan'>
                <h3>Enterprise</h3>
                <div className='gm-plan-price'>
                  Custom <small>annual</small>
                </div>
                <p>
                  Talk to an engineer about implementation, volume, and your
                  security review.
                </p>
                <ul className='gm-plan-list'>
                  <li>Volume pricing across projects</li>
                  <li>SOC 2 Type II, GDPR, and ISO 27001</li>
                  <li>Support from the engineers who build the product</li>
                </ul>
                <a className='gm-btn gm-btn-line' href='#top'>
                  <span>Contact us</span>
                </a>
              </Tile>
            </div>
          </div>
        </section>

        <footer className='gm-footer'>
          <div className='gm-footer-frieze' aria-hidden>
            {LEGEND.map((s) => (
              <span key={s.key} style={{ color: `var(--gm-s-${s.key})` }}>
                {s.glyph}
              </span>
            ))}
            {LEGEND.map((s) => (
              <span
                key={`${s.key}-2`}
                style={{ color: `var(--gm-s-${s.key})` }}
              >
                {s.glyph}
              </span>
            ))}
          </div>
          <div className='gm-rail gm-footer-grid'>
            <div className='gm-footer-brand'>
              <Image
                src='/brand/no-bg-gt-logo-light.png'
                alt='General Translation'
                width={30}
                height={30}
              />
              <p>End-to-end localization for the world&rsquo;s best companies.</p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className='gm-footer-col'>
                <h3>{col.title}</h3>
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
          <div className='gm-rail gm-footer-base'>
            <span>&copy; 2026 General Translation, Inc.</span>
            <span>Set in Marcellus and Inter.</span>
          </div>
        </footer>
      </div>
      <DirectionCorner slug='glyph-mosaic' />
    </>
  );
}
