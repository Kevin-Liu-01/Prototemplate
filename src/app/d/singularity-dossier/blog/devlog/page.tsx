import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';
import { RELEASES } from '../../../singularity/company-sections/posts';
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
  title: 'gt-sanity@2.1.0 — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

const SLUG = 'gt-sanity_v2_1_0';
const POST = RELEASES.find((release) => release.slug === SLUG);

/* github-slugger over every heading in document order — the anchors
   rehype-slug assigns in the landing app, precomputed for the inlined
   prose below (depth 3 entries indent one clerk step deeper). */
const HEADINGS: Heading[] = [
  { id: 'overview', text: 'Overview', level: 2 },
  { id: 'whats-new', text: "What's new", level: 2 },
  { id: 'field-level-internationalized-array-localization', text: 'Field-level (internationalized array) localization', level: 3 },
  { id: 'generated-schema-types', text: 'Generated schema types', level: 3 },
  { id: 'inline-per-locale-editing-ui', text: 'Inline per-locale editing UI', level: 3 },
  { id: 'translationlevel-and-mixed-mode', text: 'translationLevel and mixed mode', level: 3 },
  { id: 'importing-in-place', text: 'Importing in place', level: 3 },
  { id: 'links', text: 'Links', level: 2 },
];

/**
 * Devlog post — the shipped gt-cloud redesign's article page on a
 * changelog entry: tag pills in the header rail, the Changelog
 * breadcrumb and related-card label, no dek (devlog frontmatter
 * carries no summary), and prev/next release navigation in the footer.
 */
export default function SingularityDossierDevlogPostPage() {
  if (!POST) {
    throw new Error(`devlog mirror: ${SLUG} missing from RELEASES`);
  }

  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root sgd-blog sgd-post' id='top'>
        <V0Nav />
        <div className='tc-rail'>
          <Article post={POST} postType='devlog' headings={HEADINGS}>
            <h2 id='overview'>Overview</h2>
            <p>
              <code>gt-sanity</code> v2.1 adds{' '}
              <strong>field-level localization</strong>: instead of creating a
              separate document per locale, you can now store every
              language&apos;s value inside the same document using
              internationalized arrays. The plugin generates the schema types
              for you, ships an inline per-locale editing UI, and routes
              translation through the same GT workflow you already use —
              translated values are merged back into the source document in
              place.
            </p>
            <p>
              The data shape matches{' '}
              <a href='https://github.com/sanity-io/sanity-plugin-internationalized-array'>
                <code>sanity-plugin-internationalized-array</code>
              </a>{' '}
              (<code>{'[{ _key, _type, language, value }]'}</code>), so
              existing internationalized-array content works with zero
              migration.
            </p>
            <hr />
            <h2 id='whats-new'>What&apos;s new</h2>
            <h3 id='field-level-internationalized-array-localization'>
              Field-level (internationalized array) localization
            </h3>
            <p>
              Document-level translation remains the default: each locale gets
              its own document, linked via{' '}
              <code>@sanity/document-internationalization</code>. That model
              fits documents where everything varies by language.
            </p>
            <p>
              The new field-level model keeps a single document and localizes
              individual fields in place:
            </p>
            <figure className='blog-code'>
              <pre>
                <code>{`{
  _id: 'post-123',
  _type: 'post',
  title: [
    { _key: 'x1', _type: 'internationalizedArrayStringValue', language: 'en', value: 'Hello' },
    { _key: 'x2', _type: 'internationalizedArrayStringValue', language: 'es', value: 'Hola' },
  ],
}`}</code>
              </pre>
            </figure>
            <p>
              Enable it with the new <code>internationalizedArray</code> option
              (or its descriptive alias, <code>fieldLevelLocalization</code>):
            </p>
            <figure className='blog-code'>
              <figcaption>sanity.config.ts</figcaption>
              <pre>
                <code>{`import { defineConfig } from 'sanity';
import { gtPlugin } from 'gt-sanity';

export default defineConfig({
  plugins: [
    gtPlugin({
      sourceLocale: 'en',
      locales: ['es', 'fr', 'ja'],
      translateDocuments: [{ type: 'post' }],
      internationalizedArray: { enabled: true },
      translationLevel: 'internationalizedArray',
    }),
  ],
});`}</code>
              </pre>
            </figure>
            <h3 id='generated-schema-types'>Generated schema types</h3>
            <p>
              When enabled, the plugin generates{' '}
              <code>internationalizedArray*</code> schema types (e.g.{' '}
              <code>internationalizedArrayString</code>,{' '}
              <code>internationalizedArrayText</code>) from the same{' '}
              <code>sourceLocale</code> / <code>locales</code> you already pass
              to <code>gtPlugin</code> — locale identity is defined once. Use
              them in your schemas like any other type:
            </p>
            <figure className='blog-code'>
              <pre>
                <code>{`defineField({
  name: 'title',
  type: 'internationalizedArrayString',
});`}</code>
              </pre>
            </figure>
            <p>
              <code>fieldTypes</code> controls which types are generated. It
              defaults to <code>[&apos;string&apos;, &apos;text&apos;]</code>,
              accepts <code>&apos;block&apos;</code> for Portable Text, and
              accepts custom object definitions for arbitrary value shapes:
            </p>
            <figure className='blog-code'>
              <pre>
                <code>{`internationalizedArray: {
  enabled: true,
  fieldTypes: [
    'string',
    'text',
    'block',
    { name: 'seo', type: 'seoFields' }, // generates internationalizedArraySeo
  ],
},`}</code>
              </pre>
            </figure>
            <p>
              You can also customize the generated type names with{' '}
              <code>typePrefix</code> (compatibility aliases under the standard{' '}
              <code>internationalizedArray*</code> names are kept by default)
              and the locale labels shown in the Studio with{' '}
              <code>languageTitles</code> or <code>getLanguageTitle</code>.
            </p>
            <h3 id='inline-per-locale-editing-ui'>
              Inline per-locale editing UI
            </h3>
            <p>
              Generated types come with a purpose-built Studio input: each
              language renders as a labeled inline editor (no collapsed object
              rows or edit dialogs), with per-locale add buttons and remove
              buttons. The source language can&apos;t be removed.
            </p>
            <p>
              If you&apos;d rather bring your own UI, the{' '}
              <code>components</code> option lets you override the{' '}
              <code>input</code>, <code>item</code>, and <code>field</code>{' '}
              slots — or pass <code>false</code> to fall back to Sanity&apos;s
              default rendering. Translation is unaffected either way, since it
              operates on the stored data rather than the components.
            </p>
            <h3 id='translationlevel-and-mixed-mode'>
              <code>translationLevel</code> and mixed mode
            </h3>
            <p>
              Schema generation and translation routing are independent:
              enabling <code>internationalizedArray</code> only adds editable
              field types. The new <code>translationLevel</code> option
              controls how matched documents are translated:
            </p>
            <ul>
              <li>
                <code>&apos;document&apos;</code> (default) — whole-document
                translation with per-locale documents, unchanged from v2.0.
              </li>
              <li>
                <code>&apos;internationalizedArray&apos;</code> — all matched
                documents are localized in place via internationalized arrays.
              </li>
              <li>
                <code>&apos;mixed&apos;</code> — the document types listed in{' '}
                <code>fieldLevelDocuments</code> use the array strategy;
                everything else stays document-level.
              </li>
            </ul>
            <figure className='blog-code'>
              <pre>
                <code>{`gtPlugin({
  sourceLocale: 'en',
  locales: ['es', 'fr'],
  translateDocuments: [{ type: 'post' }, { type: 'siteSettings' }],
  internationalizedArray: { enabled: true },
  translationLevel: 'mixed',
  fieldLevelDocuments: [{ type: 'siteSettings' }], // localized in place
});`}</code>
              </pre>
            </figure>
            <p>
              Document types localized in place are automatically excluded from{' '}
              <code>@sanity/document-internationalization</code>, so they
              don&apos;t get language badges or per-locale document templates.
            </p>
            <h3 id='importing-in-place'>Importing in place</h3>
            <p>
              Field-level documents go through the same GT workflow you already
              use. On import, translated values are merged back into the same
              document: only the target locale is updated, and all other
              languages — including edits made while translation was running —
              are left untouched.
            </p>
            <p>
              Translation statuses in the Studio also now stay accurate after
              in-place imports and page refreshes, instead of showing completed
              translations as &quot;not started&quot;.
            </p>
            <hr />
            <h2 id='links'>Links</h2>
            <ul>
              <li>
                <a href='https://generaltranslation.com/docs/integrations/sanity/quickstart'>
                  Quickstart
                </a>
              </li>
              <li>
                <a href='https://generaltranslation.com/docs/integrations/sanity/guides/configuring-sanity'>
                  Configuration guide
                </a>
              </li>
              <li>
                <a href='https://generaltranslation.com/docs/integrations/sanity/reference/plugin-configuration'>
                  API reference
                </a>
              </li>
            </ul>
          </Article>
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
