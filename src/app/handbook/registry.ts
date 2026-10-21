/**
 * The handbook registry: the documents the handbook section of the docs
 * site shows, in reading order, each on its page under /docs/handbook
 * (content/docs/handbook/<slug>.mdx, which includes the file). The
 * handbook's readme (docs/handbook/README.md) is the section's index at
 * /docs/handbook; the six handbook documents follow it, then the canon:
 * the agent guide, the brand and design canons, the architecture map, the
 * ship loop, the tools, the libraries (with the build log, mounted by its
 * page), the graphics pipeline and the artifact pictures. Each blurb is
 * the page's description, so it runs 50 to 160 characters.
 * scripts/lint/registries.mjs holds each page's title, description,
 * include tag and sidebar order to its entry, and its `slug` and `file`
 * lines against HANDBOOK_HEADINGS in src/lib/search-index.ts, so keep one
 * entry per object in this shape. The links between the files
 * (src/components/book/links.ts), the search rows and the captures read
 * this list too.
 */
export type DocEntry = {
  slug: string;
  file: string;
  title: string;
  blurb: string;
};

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
      'The eighteen standing rules behind Kevin’s corrections, each with how to apply it, the skill that holds it and its dated directive.',
  },
  {
    slug: 'quality-bar',
    file: 'docs/handbook/quality-bar.md',
    title: 'Quality bar',
    blurb:
      'The measurable bar for each kind of artifact, from pages and motion to copy, pull requests and films, and for done, each row with its owner.',
  },
  {
    slug: 'multi-session-playbook',
    file: 'docs/handbook/multi-session-playbook.md',
    title: 'Multi-session playbook',
    blurb:
      'How many agent sessions share one machine: lanes, forked sessions, shared checkouts, collisions, Claude and Codex on one main, and resumption.',
  },
  {
    slug: 'gt-product-map',
    file: 'docs/handbook/gt-product-map.md',
    title: 'GT product and architecture map',
    blurb:
      'What General Translation sells and to whom, how the products fit together, the copy that must be exact, and where each part lives.',
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
      'Kevin’s dated rulings on process, product, design and the repositories, what each replaced, his words and the gate that holds it.',
  },
  {
    slug: 'agents',
    file: 'AGENTS.md',
    title: 'Agent guide',
    blurb:
      'The entry point for an agent: the read order, the principles in brief, the skill for each task, the house rules and using the hub elsewhere.',
  },
  {
    slug: 'brand',
    file: 'BRAND.md',
    title: 'Brand',
    blurb:
      'The identity canon: the name, the idea, the character and voice, the mark, color, type, language as material, and where the identity ships.',
  },
  {
    slug: 'design',
    file: 'DESIGN.md',
    title: 'Design system',
    blurb:
      'The design canon: the four-color system, the line law, rails and seams, the doubled line, iso, the 1-bit language, moving type and motion.',
  },
  {
    slug: 'architecture',
    file: 'ARCHITECTURE.md',
    title: 'Architecture',
    blurb:
      'The code map: the direction registry, the toolchain as the single source and fork rescoping, the componentized instruments, the mirror.',
  },
  {
    slug: 'ship-loop',
    file: 'docs/SHIP-LOOP.md',
    title: 'Ship loop',
    blurb:
      'The verify-and-ship procedure every round runs: the line audit, the page check, the ratchets, types, captures and the gated build.',
  },
  {
    slug: 'tools',
    file: 'docs/TOOLS.md',
    title: 'Tools',
    blurb:
      'Every pnpm command in the repository and the scripts the skills bundle, each with what it does. Written by pnpm build:tools.',
  },
  {
    slug: 'libraries',
    file: 'docs/LIBRARIES.md',
    title: 'Libraries',
    blurb:
      'The index of the componentized instruments, then the build log: every library running live with its plates and API snippets.',
  },
  {
    slug: 'graphics',
    file: 'docs/GRAPHICS.md',
    title: 'Graphics pipeline',
    blurb:
      'How the blog illustrations are made with the toolchain in graphics/: captures, labelled crops, the sizing rules, clips, export and hand-off.',
  },
  {
    slug: 'artifact-pictures',
    file: 'docs/ARTIFACT-PICTURES.md',
    title: 'Artifact pictures',
    blurb:
      'The standard for the dithered photographs: the rules, the Blue Marble tone grid and screen, the cutter, adding a picture and its lint.',
  },
] as const;

export function getHandbookDoc(slug: string): DocEntry | undefined {
  return HANDBOOK.find((d) => d.slug === slug);
}
