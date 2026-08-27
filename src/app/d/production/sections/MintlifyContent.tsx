import { Code, FileText, FolderTree, Network, RefreshCw, Zap } from 'lucide-react';

/**
 * THE SHIPPED MDX BAND, reproduced.
 *
 * 1-1 with the `mintlify-content` section of MintlifyPage.tsx: the section
 * head, the docs/get-started.mdx exhibit — eight numbered lines, the two
 * frontmatter values and the closing sentence marked as localized content,
 * the CodeGroup block marked preserved, and the two-entry key underneath —
 * then the six-row capability ledger in the shipped order.
 */
export default function MintlifyContent() {
  return (
    <section className='tc-sec mintlify-content'>
      <div className='mintlify-section-head'>
        <h2>Translate Markdown and MDX</h2>
        <p>
          Locadex understands the structure of your Mintlify documentation. It
          translates content while preserving your formatting, code blocks, and
          metadata.
        </p>
      </div>

      <div className='mintlify-content-layout'>
        <div
          className='mintlify-content-diagram'
          role='img'
          aria-label='A Mintlify MDX file keeps code and components intact while its content and metadata are localized'
        >
          <div className='mintlify-code-bar' aria-hidden='true'>
            <span>docs/get-started.mdx</span>
            <code>translated</code>
          </div>
          <div className='mintlify-code-lines' aria-hidden='true'>
            <code>01</code>
            <span>---</span>
            <code>02</code>
            <span>
              title: <b>Get started</b>
            </span>
            <code>03</code>
            <span>
              description: <b>Build for every language</b>
            </span>
            <code>04</code>
            <span>---</span>
            <code>05</code>
            <span className='is-preserved'>{'<CodeGroup>'}</span>
            <code>06</code>
            <span className='is-preserved'>npm install gt-next</span>
            <code>07</code>
            <span className='is-preserved'>{'</CodeGroup>'}</span>
            <code>08</code>
            <span>
              <b>Ship documentation worldwide.</b>
            </span>
          </div>
          <div className='mintlify-code-key' aria-hidden='true'>
            <span className='is-localized'>localized content</span>
            <span className='is-code'>preserved code</span>
          </div>
        </div>

        <div className='mintlify-feature-ledger'>
          <article>
            <FileText aria-hidden='true' />
            <h3>Markdown and MDX</h3>
            <p>
              Translates all .md and .mdx files in your documentation, including
              headings, paragraphs, lists, tables, and callouts.
            </p>
          </article>
          <article>
            <Code aria-hidden='true' />
            <h3>Code blocks preserved</h3>
            <p>
              Code snippets, inline code, and syntax highlighting are left
              untouched. Only comments and documentation strings are translated.
            </p>
          </article>
          <article>
            <FolderTree aria-hidden='true' />
            <h3>Metadata and variables</h3>
            <p>
              Page titles, descriptions, and other frontmatter fields are
              translated so your SEO metadata works in every language.
            </p>
          </article>
          <article>
            <RefreshCw aria-hidden='true' />
            <h3>Automatic updates</h3>
            <p>
              When you push changes to your main branch, Locadex detects new and
              modified content and updates translations automatically.
            </p>
          </article>
          <article>
            <Network aria-hidden='true' />
            <h3>Internationalization routing</h3>
            <p>
              Locadex sets up internationalization routing and redirects within
              your Mintlify configuration so readers land on the right language.
            </p>
          </article>
          <article>
            <Zap aria-hidden='true' />
            <h3>Context-aware translations</h3>
            <p>
              Translations are powered by AI agents that understand technical
              terms and your codebase, preserving meaning and terminology across
              languages.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
