'use client';

import type { ComponentType } from 'react';
import { useRef } from 'react';

import { Code, FileText, FolderTree, Network, RefreshCw, Zap } from 'lucide-react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "Translate Markdown and MDX" — the live page's content section. On the
 * left, its MDX exhibit redrawn on this direction's one dark artifact
 * surface: the same eight lines, the same split between localized content
 * and preserved code, the same key underneath. On the right, all six
 * capability entries, verbatim, filed as a ruled ledger instead of cards.
 */

type IconProps = {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

type Feature = { title: string; body: string; icon: ComponentType<IconProps> };

const FEATURES: readonly Feature[] = [
  {
    title: 'Markdown and MDX',
    body: 'Translates all .md and .mdx files in your documentation, including headings, paragraphs, lists, tables, and callouts.',
    icon: FileText,
  },
  {
    title: 'Code blocks preserved',
    body: 'Code snippets, inline code, and syntax highlighting are left untouched. Only comments and documentation strings are translated.',
    icon: Code,
  },
  {
    title: 'Metadata and variables',
    body: 'Page titles, descriptions, and other frontmatter fields are translated so your SEO metadata works in every language.',
    icon: FolderTree,
  },
  {
    title: 'Automatic updates',
    body: 'When you push changes to your main branch, Locadex detects new and modified content and updates translations automatically.',
    icon: RefreshCw,
  },
  {
    title: 'Internationalization routing',
    body: 'Locadex sets up internationalization routing and redirects within your Mintlify configuration so readers land on the right language.',
    icon: Network,
  },
  {
    title: 'Context-aware translations',
    body: 'Translations are powered by AI agents that understand technical terms and your codebase, preserving meaning and terminology across languages.',
    icon: Zap,
  },
];

export default function MintlifyContent() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='content' ref={root}>
      <div className='cp-head' data-reveal>
        <span className='cp-kicker'>The file</span>
        <h2>Translate Markdown and MDX</h2>
        <p>
          Locadex understands the structure of your Mintlify documentation. It translates
          content while preserving your formatting, code blocks, and metadata.
        </p>
      </div>

      <div className='cpm-content'>
        <div
          aria-label='A Mintlify MDX file keeps code and components intact while its content and metadata are localized'
          className='cpm-code'
          data-reveal
          role='img'
        >
          <div aria-hidden='true' className='cpm-code-bar'>
            <span>docs/get-started.mdx</span>
            <code>translated</code>
          </div>
          <div aria-hidden='true' className='cpm-code-lines'>
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
          <div aria-hidden='true' className='cpm-code-key'>
            <span className='is-localized'>localized content</span>
            <span className='is-code'>preserved code</span>
          </div>
        </div>

        <div className='cpm-feats'>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className='cpm-feat' data-reveal key={feature.title}>
                <Icon
                  aria-hidden
                  className='cpm-feat-glyph'
                  color='currentColor'
                  size={16}
                  strokeWidth={1.75}
                />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
