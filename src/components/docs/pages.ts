/**
 * The docs site's pages outside the handbook as the rest of the hub lists
 * them: the slug (the path under content/docs, `components/dither`; a
 * folder's index is the folder's path), the address, the title and the
 * description each MDX file's frontmatter carries, in the sidebar's order
 * (content/docs/meta.json, with each `...folder` row lifting that folder's
 * own meta.json in). The handbook's pages (content/docs/handbook) are
 * listed by the handbook registry (src/app/handbook/registry.ts) instead.
 * The docs routes read the MDX through fumadocs (src/lib/source.ts); this
 * list is for the modules that cannot, the shell's Documents rows
 * (src/lib/surfaces.ts), the search index and the agent files, since a
 * client module never reads content/docs. scripts/lint/registries.mjs
 * checks it against the frontmatter and meta.json, so a page added to the
 * docs adds its row here.
 */
export type DocsPageEntry = {
  /** the file's path under content/docs without .mdx; `index` is /docs, a folder's index its folder (`components`) */
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
    slug: 'components',
    href: '/docs/components',
    title: 'Components',
    description:
      "Prototemplate's live component library: every instrument mounted on its page with controls, its import path, its props and its reduced-motion still.",
  },
  {
    slug: 'components/dither',
    href: '/docs/components/dither',
    title: 'Dither and the studio field',
    description:
      "The 1-bit material live: the CPU dither loop with its field factories, the Bayer screen's coverage tiers, and the ten studio field presets on WebGL.",
  },
  {
    slug: 'components/fields',
    href: '/docs/components/fields',
    title: 'Horizon and prismatic fields',
    description:
      'The two light fields on the shared WebGL engine, live: the event-horizon shader and the prismatic burst, with their cursor effects and their stills.',
  },
  {
    slug: 'components/glyph-field',
    href: '/docs/components/glyph-field',
    title: 'Glyph field and ink field',
    description:
      'The eight-script glyph rain that condenses into the word for language, and its inverse on ink that bursts where the reader clicks, both live.',
  },
  {
    slug: 'components/lines',
    href: '/docs/components/lines',
    title: 'Doubled lines and connectors',
    description:
      "The brand's doubled line as a component, with live gauge, gap, two-tone and pulse controls, and the production connector that carries a translation.",
  },
  {
    slug: 'components/iso',
    href: '/docs/components/iso',
    title: 'Isometric drawings',
    description:
      'The isometric kit live: one 30 degree projection, one corner radius and one light, with boxes and prisms built on a slab and a mark seated on a face.',
  },
  {
    slug: 'components/globes',
    href: '/docs/components/globes',
    title: 'Globes and maps',
    description:
      'Every globe in the library, live: the edge delivery globe, the dithered globe field in two looks, and the blog globe directions from all three rounds.',
  },
  {
    slug: 'components/language',
    href: '/docs/components/language',
    title: 'Locale tags and language pieces',
    description:
      'Locale chips with their flags, the two flag resolvers side by side, and seven animated language diagrams built from real text in real scripts.',
  },
  {
    slug: 'components/motion',
    href: '/docs/components/motion',
    title: 'Reveal seam and sentence motion',
    description:
      'The slide-to-reveal seam between a rendered string and its served file, and the headline that dissolves into glyphs and reassembles in the next language.',
  },
  {
    slug: 'components/marks',
    href: '/docs/components/marks',
    title: 'Speed marks and the GT mark',
    description:
      'The speed marks and the globe concepts at every size on paper and ink, the GT mark set inline as a word, and a mark with a dithered shine.',
  },
  {
    slug: 'components/heads',
    href: '/docs/components/heads',
    title: 'Badges and heads',
    description:
      'The badge that cuts through the GT monograms after the Brand title, and the book head every hub page opens with, live at two widths.',
  },
  {
    slug: 'blog-globe',
    href: '/docs/blog-globe',
    title: 'The blog globe figure',
    description:
      "Four directions for a blog figure that turns a globe to each city on the path of Euclid's Elements: the shared contract, the measurements and the ranking.",
  },
  {
    slug: 'template',
    href: '/docs/template',
    title: 'Use these docs as a template',
    description:
      'Lift this docs site into another Next.js 16 project: the dependencies, the files to copy, the adapters for a design system, and adding a page.',
  },
];
