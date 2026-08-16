import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../../singularity/sections/SiteFooter';
import TopNav from '../../../singularity/sections/TopNav';
import { FEATURED } from '../../../singularity/company-sections/posts';
import Article from '../Article';

import type { Heading } from '../TableOfContents';

/* no Frameworks on this route — the footer's marks need the sheet
   directly (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../styles.css';
import '../../blog-landing/blog-landing.css';
import '../blog-post.css';

export const metadata = {
  title: 'i18n without translation files — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/* github-slugger over every heading in document order — the anchors
   rehype-slug assigns in the landing app, precomputed for the inlined
   prose below. */
const HEADINGS: Heading[] = [
  { id: 'the-file-management-tax', text: 'The file management tax', level: 2 },
  { id: 'translating-code-directly', text: 'Translating code directly', level: 2 },
  { id: 'translations-as-build-output', text: 'Translations as build output', level: 2 },
  { id: 'what-changes-in-practice', text: 'What changes in practice', level: 2 },
  { id: 'where-i18n-libraries-are-heading', text: 'Where i18n libraries are heading', level: 2 },
  { id: 'the-tradeoff', text: 'The tradeoff', level: 2 },
  { id: 'getting-started', text: 'Getting started', level: 2 },
];

/**
 * Blog post — the shipped gt-cloud redesign's article page, mirrored
 * as the Dossier direction's essay layout: the newest essay
 * ("i18n without translation files"), its MDX body inlined static.
 */
export default function SingularityDossierBlogPostPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root sgd-blog sgd-post' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <Article
            post={FEATURED}
            postType='blog'
            dek={FEATURED.summary}
            headings={HEADINGS}
          >
            <p>
              Everyone who&apos;s internationalized a JavaScript app knows the
              workflow. You install an i18n library, create an{' '}
              <code>en.json</code> file, pull every user-facing string out of
              your components, assign each one a key, and reference the key
              where the string used to be. Then you duplicate that JSON file
              for every language you support. <code>es.json</code>,{' '}
              <code>fr.json</code>, <code>ja.json</code>.
            </p>
            <p>At first, it&apos;s fine. Thirty strings, three languages, 90 entries.</p>
            <p>
              Then your app grows. Six months later you have 400 strings and 12
              languages. 4,800 entries across a dozen files. A developer adds a
              new feature, writes five new strings, forgets to update three of
              the translation files. Nobody notices until a user in Tokyo sees
              English fallbacks in a Japanese interface. Someone suggests
              buying a translation management system.
            </p>
            <video
              src='https://assets.gtx.dev/i18n-no-translation.mp4'
              loop
              controls
              autoPlay
              playsInline
              className='h-auto w-full'
            />
            <h2 id='the-file-management-tax'>The file management tax</h2>
            <p>
              Translation files create a maintenance burden that scales with
              the number of languages you support. Change a string and you need
              to update a dozen files. Those files drift out of sync. Keeping
              them aligned requires tooling, automation, or discipline.
            </p>
            <p>
              The ecosystem of workarounds tells the story: VS Code extensions
              that auto-generate translation keys, type generators that
              validate your JSON against TypeScript interfaces, linters for
              unused keys, CI checks that verify all locales are in sync. You
              don&apos;t build this kind of tooling for a workflow that works
              well.
            </p>
            <p>
              Your UI says one thing, your translation files say another, and a
              key-based mapping holds the two together:
            </p>
            <figure className='blog-code'>
              <pre>
                <code>{`function CheckoutSummary({ itemCount, discount }) {
  const { t } = useTranslation('checkout');

  return (
    <div>
      <h2>{t('summary.title')}</h2>
      <p>{t('summary.item_count', { count: itemCount })}</p>
      {discount && <p>{t('summary.discount_applied', { percent: discount })}</p>}
      <p>{t('summary.total_label')}</p>
      <small>{t('summary.tax_notice')}</small>
    </div>
  );
}`}</code>
              </pre>
            </figure>
            <p>
              To understand what this component renders, you&apos;d have to
              open <code>checkout.json</code>, find the <code>summary</code>{' '}
              namespace, and cross-reference five keys. Across hundreds of
              components, code review becomes an exercise in file-hopping.
            </p>
            <p>
              ICU message syntax makes this worse. The format libraries like{' '}
              <code>i18next</code>, <code>react-intl</code>, and{' '}
              <code>next-intl</code> use for plurals, gender, and interpolation
              is its own mini-language embedded in JSON strings. A misplaced
              brace in{' '}
              <code>{'{count, plural, one {# item} other {# items}}'}</code>{' '}
              won&apos;t surface until runtime. Linters exist for this, but
              most teams skip them. Inline code, by contrast, gets checked by
              your TypeScript compiler and your IDE the moment you type it.
            </p>
            <h2 id='translating-code-directly'>Translating code directly</h2>
            <p>What if you didn&apos;t extract strings at all?</p>
            <figure className='blog-code'>
              <pre>
                <code>{`import { T } from 'gt-react';

function CheckoutSummary({ itemCount, discount }) {
  return (
    <T>
      <div>
        <h2>Order Summary</h2>
        <p>You have {itemCount} items in your cart.</p>
        {discount && <p>{discount}% discount applied!</p>}
        <p>Total (before tax):</p>
        <small>Tax calculated at checkout.</small>
      </div>
    </T>
  );
}`}</code>
              </pre>
            </figure>
            <p>
              The <code>&lt;T&gt;</code> component in{' '}
              <a href='https://generaltranslation.com/docs/react'>
                <code>gt-react</code>
              </a>{' '}
              marks a block of JSX for translation. The English stays in your
              component. When a user visits in Spanish, the content inside{' '}
              <code>&lt;T&gt;</code> is replaced with its Spanish equivalent.
              Structure and formatting carry over.
            </p>
            <p>
              There&apos;s no <code>t(&apos;checkout.summary.title&apos;)</code>,
              no <code>en.json</code>, no per-locale JSON files to keep in
              sync.
            </p>
            <h2 id='translations-as-build-output'>
              Translations as build output
            </h2>
            <p>
              They&apos;re generated at deploy time. The{' '}
              <a href='https://generaltranslation.com/docs/cli/reference/commands/translate'>
                GT CLI
              </a>{' '}
              scans your codebase for everything inside <code>&lt;T&gt;</code>{' '}
              components and produces translations for every target language.
              The output goes into a gitignored directory, like compiled CSS or
              bundled JavaScript.
            </p>
            <figure className='blog-code'>
              <figcaption>gt.config.json</figcaption>
              <pre>
                <code>{`{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "ko", "zh"],
  "files": {
    "gt": {
      "output": "public/_gt/[locale].json"
    }
  }
}`}</code>
              </pre>
            </figure>
            <figure className='blog-code'>
              <figcaption>.gitignore</figcaption>
              <pre>
                <code>{`public/_gt/`}</code>
              </pre>
            </figure>
            <p>
              In development, translations happen on-demand. Change a string,
              refresh, see it in Japanese immediately. In production,
              everything is pre-generated and served from a CDN. Translation
              files still exist on disk, but they&apos;re output artifacts, not
              something you author or maintain.
            </p>
            <h2 id='what-changes-in-practice'>What changes in practice</h2>
            <p>
              The difference shows up in daily work more than in architecture
              diagrams.
            </p>
            <p>
              A PR that adds a new section to a page reads like a PR that adds
              a new section to a page. The reviewer sees the actual words, not{' '}
              <code>checkout.summary.discount_applied_notice</code>. Code
              review stops requiring a side-by-side with a JSON file.
            </p>
            <p>
              Refactoring is less painful. Rename a component, move it, split
              it into pieces. Translations follow the content because there are
              no keys to remap. Adding a language is a one-line config change.
              Deleting a component means its translations quietly stop being
              generated, instead of leaving orphaned keys across 15 files that
              nobody wants to clean up.
            </p>
            <h2 id='where-i18n-libraries-are-heading'>
              Where i18n libraries are heading
            </h2>
            <p>
              The trend across the ecosystem is toward inline strings. Early
              i18n libraries like <code>i18next</code> and{' '}
              <code>react-intl</code> were built when machine translation
              wasn&apos;t viable and every string needed to be handed off to a
              human translator. Dictionaries made sense as an interchange
              format. That constraint is gone, and the developer experience
              cost of maintaining parallel string files is increasingly hard to
              justify.
            </p>
            <p>
              <code>next-intl</code> added{' '}
              <a href='https://next-intl.dev/docs/workflows/how-to-achieve-perfect-type-safety-with-next-intl#1-inline-messages'>
                non-dictionary <code>t()</code> calls
              </a>{' '}
              alongside its dictionary mode.{' '}
              <a href='https://lingui.dev/ref/swc-plugin'>
                Lingui&apos;s Compiler
              </a>{' '}
              extracts messages at build time from inline tagged templates.{' '}
              <a href='https://inlang.com/m/gerre34r/library-inlang-paraglideJs'>
                Paraglide
              </a>{' '}
              takes a different route, compiling from message files into
              per-locale tree-shakeable functions. The approaches differ, but
              content is moving closer to the component across all of them. GT
              takes this to its conclusion: your JSX is the source of truth,
              and translation is a compile step.
            </p>
            <h2 id='the-tradeoff'>The tradeoff</h2>
            <p>
              When you write content inline, you&apos;re writing in your native
              language. Your component structure, your sentence patterns, your
              UI flow all reflect how you think in English (or whatever your
              source language is). A dictionary-based approach like{' '}
              <code>next-intl</code> is more language-agnostic by design,
              because the component never contains a real sentence in any
              language, just a key that points elsewhere.
            </p>
            <p>
              But most developers are already thinking in one language when
              they build UI. The layout, the copy, the button labels are all
              conceived in English first. That bias is in the design whether
              the strings are inline or in a JSON file. We think the i18n
              framework should adapt to how you actually work. Build the app
              naturally, and let the framework handle translation, rather than
              abstracting content into keys for the sake of language
              neutrality.
            </p>
            <h2 id='getting-started'>Getting started</h2>
            <figure className='blog-code'>
              <pre>
                <code>{`npx gt@latest init`}</code>
              </pre>
            </figure>
            <p>
              The setup wizard configures your project, installs dependencies,
              and sets up translation hot reloading for development. Full
              walkthrough in the{' '}
              <a href='https://generaltranslation.com/docs/react'>
                quickstart guide
              </a>
              .
            </p>
            <p>
              <code>gt-react</code> is open source. For Next.js App Router,
              there&apos;s{' '}
              <a href='https://generaltranslation.com/docs/react/nextjs'>
                <code>gt-next</code>
              </a>
              . For React Native, there&apos;s{' '}
              <a href='https://generaltranslation.com/docs/react/react-native'>
                <code>gt-react-native</code>
              </a>
              .
            </p>
          </Article>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
