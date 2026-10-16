/**
 * The docs site's ten pages as the rest of the hub lists them: the slug,
 * the address, the title and the description each MDX file's frontmatter
 * carries, in the sidebar's order (content/docs/meta.json). The docs routes
 * read the MDX through fumadocs (src/lib/source.ts); this list is for the
 * modules that cannot, the shell's Documents rows (src/lib/surfaces.ts),
 * the search index and the agent files, since a client module never reads
 * content/docs. scripts/lint/registries.mjs checks it against the
 * frontmatter and meta.json, so a page added to the docs adds its row here.
 */
export type DocsPageEntry = {
  /** the file's name in content/docs without .mdx; `index` is /docs */
  slug: string;
  href: string;
  title: string;
  description: string;
};

export const DOCS_PAGES: readonly DocsPageEntry[] = [
  {
    slug: 'index',
    href: '/docs',
    title: 'What Prototemplate is',
    description:
      "Prototemplate is Kevin Liu's hub and working wiki for General Translation work: what it holds, who reads it and the order to read it in.",
  },
  {
    slug: 'get-started',
    href: '/docs/get-started',
    title: 'Get started',
    description:
      'Clone the repository, install it, check the machine with the doctor, run the dev server, and work beside other sessions in a worktree.',
  },
  {
    slug: 'pages',
    href: '/docs/pages',
    title: 'Pages and the viewer shell',
    description:
      'Every route and what it holds, the viewer shell that frames most of them, the book page standard, and the registries a new page touches.',
  },
  {
    slug: 'directions',
    href: '/docs/directions',
    title: 'The design lab and the directions',
    description:
      'The 27 directions under /d: the explorations, the three site concepts, the production mirror, and how the gallery presents them.',
  },
  {
    slug: 'deck',
    href: '/docs/deck',
    title: 'The brand deck',
    description:
      'The brand deck in deck/: its slides on a 1600 by 900 sheet, the grammar they follow, and the build that serves it at /deck.',
  },
  {
    slug: 'skills',
    href: '/docs/skills',
    title: 'Skills',
    description:
      'The curated agent skills in skills/: the contract each one keeps, the build that checks it, where they are served and how to install them.',
  },
  {
    slug: 'scripts',
    href: '/docs/scripts',
    title: 'Scripts and generated files',
    description:
      'The scripts/ folders, the files the scripts generate, the rule that only a script changes them, and the one route list every browser tool reads.',
  },
  {
    slug: 'gates',
    href: '/docs/gates',
    title: 'Gates',
    description:
      'The checks that run before work lands: the static lints, the live audits, the page check, the type check and the build, with their exit codes.',
  },
  {
    slug: 'seo',
    href: '/docs/seo',
    title: 'The SEO system',
    description:
      'How every route gets its title, canonical, robots, card and structured data from one call, the indexing policy, the sitemap and the agent files.',
  },
  {
    slug: 'template',
    href: '/docs/template',
    title: 'Use these docs as a template',
    description:
      'Lift this docs site into another Next.js 16 project: the dependencies, the files to copy, the adapters for a design system, and adding a page.',
  },
];
