'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

type FaqRow = {
  /** the shipped AccordionItem value */
  value: string;
  question: string;
  answer: string;
};

/** The seven questions the shipped page files open, in its order. */
const FAQ: readonly FaqRow[] = [
  {
    value: 'translate',
    question:
      'How do I translate my Mintlify documentation into other languages?',
    answer:
      'Locadex is an AI agent that reads your Markdown and MDX files, translates the content while preserving formatting, code blocks, and frontmatter, then opens a pull request with the translated files. It also configures i18n routing in your Mintlify setup.',
  },
  {
    value: 'updates',
    question: 'How do I keep my Mintlify translations up to date?',
    answer:
      'Locadex watches your main branch for changes. When you push new or modified content, it automatically translates the updates and opens a new pull request. You always have full control to review changes before merging.',
  },
  {
    value: 'languages',
    question: 'What languages can I translate my Mintlify docs into?',
    answer:
      'Locadex supports all languages available in Mintlify, including Spanish, French, German, Japanese, Korean, Chinese, Portuguese, Arabic, and many more. You can choose any combination of target languages during setup.',
  },
  {
    value: 'code-blocks',
    question: 'Does General Translation preserve code blocks and API examples?',
    answer:
      'Code blocks, inline code, and API examples are preserved exactly as written. Only human-readable content like comments and documentation strings are translated, so your technical examples always remain correct.',
  },
  {
    value: 'i18n-setup',
    question: 'How do I set up internationalization for Mintlify?',
    answer:
      "Locadex handles everything through the GitHub integration — no CLI tools or config files needed. Connect your repository, choose your languages, and Locadex takes care of the rest, including setting up Mintlify's i18n routing and locale configuration.",
  },
  {
    value: 'formatting',
    question: 'Will translation break my Markdown formatting or MDX components?',
    answer:
      'No. Locadex parses your Markdown and MDX at the syntax level, so headings, lists, tables, callouts, links, and custom components come through exactly as authored. Only the human-readable text is translated — your file structure stays identical.',
  },
  {
    value: 'edit-translations',
    question: 'Can I edit my Mintlify translations after they are generated?',
    answer:
      "Yes. You can edit translations in General Translation's built-in editor, directly on Mintlify, or in version control. Changes made anywhere are preserved — Locadex won't overwrite your manual edits.",
  },
];

/**
 * THE SHIPPED FAQ BAND, reproduced.
 *
 * 1-1 with the `mintlify-faq` section of MintlifyPage.tsx: the head, then
 * the seven questions and answers, in order, word for word.
 *
 * The shipped list is the design system's Radix accordion at
 * type='single' collapsible — one panel open at a time, clicking the open
 * one closes it, nothing open on load. This repo has no Radix, so the same
 * behaviour and the same DOM shape (item div, h3 header, trigger button with
 * the chevron, content panel) are written out here; the item `value`s are
 * kept as the row keys so the two lists diff line for line. The only thing
 * lost is Radix's open/close height animation, which rode on Tailwind
 * keyframes this repo does not define.
 */
export default function MintlifyFaq() {
  const idBase = useId();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className='tc-sec mintlify-faq'>
      <div className='mintlify-section-head'>
        <h2>Frequently asked questions</h2>
      </div>
      <div className='mintlify-accordion'>
        {FAQ.map((row) => {
          const isOpen = open === row.value;
          const panelId = `${idBase}-${row.value}`;
          return (
            <div key={row.value}>
              <h3 className='flex'>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  id={`${panelId}-trigger`}
                  type='button'
                  onClick={() => setOpen(isOpen ? null : row.value)}
                >
                  {row.question}
                  <ChevronDown aria-hidden='true' />
                </button>
              </h3>
              {isOpen ? (
                <div
                  aria-labelledby={`${panelId}-trigger`}
                  id={panelId}
                  role='region'
                >
                  <div className='pt-0 pb-4'>
                    <p>{row.answer}</p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
