'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "Frequently asked questions" — all seven entries of the live page's
 * accordion, question and answer verbatim. The accordion itself does not
 * survive the translation: this direction files answers open, in a ruled
 * ledger, the way the pricing FAQ does — the still frame carries the whole
 * argument.
 */

type FaqRow = { id: string; q: string; a: string };

const FAQ: readonly FaqRow[] = [
  {
    id: 'translate',
    q: 'How do I translate my Mintlify documentation into other languages?',
    a: 'Locadex is an AI agent that reads your Markdown and MDX files, translates the content while preserving formatting, code blocks, and frontmatter, then opens a pull request with the translated files. It also configures i18n routing in your Mintlify setup.',
  },
  {
    id: 'updates',
    q: 'How do I keep my Mintlify translations up to date?',
    a: 'Locadex watches your main branch for changes. When you push new or modified content, it automatically translates the updates and opens a new pull request. You always have full control to review changes before merging.',
  },
  {
    id: 'languages',
    q: 'What languages can I translate my Mintlify docs into?',
    a: 'Locadex supports all languages available in Mintlify, including Spanish, French, German, Japanese, Korean, Chinese, Portuguese, Arabic, and many more. You can choose any combination of target languages during setup.',
  },
  {
    id: 'code-blocks',
    q: 'Does General Translation preserve code blocks and API examples?',
    a: 'Code blocks, inline code, and API examples are preserved exactly as written. Only human-readable content like comments and documentation strings are translated, so your technical examples always remain correct.',
  },
  {
    id: 'i18n-setup',
    q: 'How do I set up internationalization for Mintlify?',
    a: 'Locadex handles everything through the GitHub integration — no CLI tools or config files needed. Connect your repository, choose your languages, and Locadex takes care of the rest, including setting up Mintlify’s i18n routing and locale configuration.',
  },
  {
    id: 'formatting',
    q: 'Will translation break my Markdown formatting or MDX components?',
    a: 'No. Locadex parses your Markdown and MDX at the syntax level, so headings, lists, tables, callouts, links, and custom components come through exactly as authored. Only the human-readable text is translated — your file structure stays identical.',
  },
  {
    id: 'edit-translations',
    q: 'Can I edit my Mintlify translations after they are generated?',
    a: 'Yes. You can edit translations in General Translation’s built-in editor, directly on Mintlify, or in version control. Changes made anywhere are preserved — Locadex won’t overwrite your manual edits.',
  },
];

export default function MintlifyFaq() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='faq' ref={root}>
      <div className='cp-head' data-reveal>
        <span className='cp-kicker'>Questions</span>
        <h2>Frequently asked questions</h2>
      </div>

      <dl className='cpm-faq'>
        {FAQ.map((row) => (
          <div className='cpm-faq-row' data-reveal key={row.id}>
            <dt>{row.q}</dt>
            <dd>{row.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
