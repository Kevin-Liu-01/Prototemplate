import type { DocEntry } from '@/app/docs/registry';

/**
 * The handbook registry: the documents /handbook serves, in reading order,
 * read from docs/handbook/ at build time by the docs book builder
 * (src/app/docs/book.tsx). The handbook's readme (docs/handbook/README.md)
 * opens the book at /handbook, the way the repository readme opens /docs.
 * scripts/build-updated.mjs dates /handbook from docs/handbook/ and this
 * route, and skills/prototemplate/scripts/check-registries.mjs reads the
 * `slug` and `file` lines here against HANDBOOK_HEADINGS in
 * src/lib/search-index.ts, so keep one entry per object in this shape.
 */
export const HANDBOOK_README: DocEntry = {
  slug: 'readme',
  file: 'docs/handbook/README.md',
  title: 'Readme',
  blurb: 'What the handbook is, who reads it, the order to read it in, and how it relates to the skills.',
};

export const HANDBOOK: readonly DocEntry[] = [
  {
    slug: 'operating-principles',
    file: 'docs/handbook/operating-principles.md',
    title: 'Operating principles',
    blurb:
      'The eighteen standing rules behind Kevin’s corrections, each with how to apply it, the skill that holds its procedure and the dated directive it comes from.',
  },
  {
    slug: 'quality-bar',
    file: 'docs/handbook/quality-bar.md',
    title: 'Quality bar',
    blurb:
      'The measurable bar for each kind of artifact (pages, motion, graphics, copy, pull requests, performance, films, charts, repositories) and for done, each row with its owner.',
  },
  {
    slug: 'multi-session-playbook',
    file: 'docs/handbook/multi-session-playbook.md',
    title: 'Multi-session playbook',
    blurb:
      'How many agent sessions share one machine: lanes, forked sessions, one instruction to several sessions, shared checkouts, collisions, Claude and Codex on one main, relays and resumption.',
  },
  {
    slug: 'gt-product-map',
    file: 'docs/handbook/gt-product-map.md',
    title: 'GT product and architecture map',
    blurb:
      'What General Translation sells and to whom, how the products fit together, the copy that must be exact, the CLI and agent entry points, and where each part lives.',
  },
  {
    slug: 'glossary',
    file: 'docs/handbook/glossary.md',
    title: 'Glossary',
    blurb: 'The terms in Kevin’s messages, the skills and the code, each defined in a sentence or two with where it lives.',
  },
  {
    slug: 'decisions',
    file: 'docs/handbook/decisions.md',
    title: 'Decisions log',
    blurb:
      'Kevin’s dated rulings on process, product, design and the repositories, what each replaced, his words and the lint, gate or skill that holds it.',
  },
] as const;

export function getHandbookDoc(slug: string): DocEntry | undefined {
  return HANDBOOK.find((d) => d.slug === slug);
}
