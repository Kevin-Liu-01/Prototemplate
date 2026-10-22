/**
 * The docs site's pages outside the handbook as the rest of the hub lists
 * them: the slug (the page's URL after /docs/, `components/dither`; folder
 * groups such as `(internals)` add no segment, and a folder's index is the
 * folder), the address, the title and the description each MDX file's
 * frontmatter carries, in the sidebar's order (the tabs of
 * content/docs/meta.json, each folder's meta.json in turn). The handbook's
 * pages (/docs/handbook) are
 * listed by the handbook registry (src/app/handbook/registry.ts) instead.
 * The docs routes read the MDX through fumadocs (src/lib/source.ts); this
 * list is for the modules that cannot, the shell's Documents rows
 * (src/lib/surfaces.ts), the search index and the agent files, since a
 * client module never reads content/docs. scripts/lint/registries.mjs
 * checks it against the frontmatter and meta.json, so a page added to the
 * docs adds its row here.
 */
export type DocsPageEntry = {
  /** the URL after /docs/; `index` is /docs, a folder's index its folder (`components`) */
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
    slug: 'components',
    href: '/docs/components',
    title: 'The component library',
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
    slug: 'components/dither-lab',
    href: '/docs/components/dither-lab',
    title: 'The dither lab',
    description:
      'Pictures, gradients and noise through ordered dither, error diffusion and halftone, side by side and live, with every screen and threshold exposed.',
  },
  {
    slug: 'components/dither-type',
    href: '/docs/components/dither-type',
    title: 'Dithered type and marks',
    description:
      'Type and marks set in dither cells: words built from Bayer tiers, a mark that erodes and resolves, and glyph screens drawn from the house face.',
  },
  {
    slug: 'components/dither-motion',
    href: '/docs/components/dither-motion',
    title: 'Dithered transitions and brushes',
    description:
      'Tone-mix wipes on one cell grid, a lens that reveals a picture under the screen, and a brush that paints in dither cells.',
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
    slug: 'components/blog-globe',
    href: '/docs/components/blog-globe',
    title: 'The blog globe figure',
    description:
      "Four directions for a blog figure that turns a globe to each city on the path of Euclid's Elements: the shared contract, the measurements and the ranking.",
  },
  {
    slug: 'components/three-scenes',
    href: '/docs/components/three-scenes',
    title: '3D scenes',
    description:
      'three.js scenes in the house material: an extruded GT mark, a lit globe and an isometric stack, each through a Bayer post pass with live controls.',
  },
  {
    slug: 'components/canvas-2d',
    href: '/docs/components/canvas-2d',
    title: '2D canvas pieces',
    description:
      'Canvas 2D pieces drawn in the house ink: particle fields, generative line work and glyph rain, each with its frame budget and its still.',
  },
  {
    slug: 'components/controls',
    href: '/docs/components/controls',
    title: 'Controls',
    description:
      'The shell and site controls live: segmented switches, toggles, sliders, steppers, the install field and copy buttons, with their states and keys.',
  },
  {
    slug: 'components/navigation',
    href: '/docs/components/navigation',
    title: 'Search, filters and menus',
    description:
      'The command search, the list filter, the language selector, the help card and the toast, each mounted with its keyboard behaviour.',
  },
  {
    slug: 'components/kinetic',
    href: '/docs/components/kinetic',
    title: 'Kinetic text and carousels',
    description:
      'Split-flap text, the language wheel and the carousel: moving pieces with their timing, their reduced-motion stills and their controls.',
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
    slug: 'components/artifact-pictures',
    href: '/docs/components/artifact-pictures',
    title: 'Artifact pictures',
    description:
      'Dithered photographs under the Blue Marble standard: the tone grid, the screen, the presets and both themes, cut live from a picture.',
  },
  {
    slug: 'components/covers-and-cards',
    href: '/docs/components/covers-and-cards',
    title: 'Covers and social cards',
    description:
      'Post covers, social cards and banners generated from a title and a field, at their export sizes, with the type and the mark set by the rules.',
  },
  {
    slug: 'components/films-and-sheets',
    href: '/docs/components/films-and-sheets',
    title: 'Films and contact sheets',
    description:
      'The film player, contact sheets of frames, and the report card: how the system presents a finished artifact on the page.',
  },
  {
    slug: 'components/rails-and-bands',
    href: '/docs/components/rails-and-bands',
    title: 'Rails, bands and spacers',
    description:
      'The landing grammar as live parts: one rail, full-width bands, hatch spacers and heads, with the widths and paddings at every breakpoint.',
  },
  {
    slug: 'components/grids-and-bentos',
    href: '/docs/components/grids-and-bentos',
    title: 'Grids and bentos',
    description:
      'Bento grids, feature grids and the viewer grid view, with their columns, gaps and spans adjustable and the line law holding at every junction.',
  },
  {
    slug: 'components/shells',
    href: '/docs/components/shells',
    title: 'Shells and frames',
    description:
      'The viewer shell, the sheet frame and the plate: the frames every hub page and figure sits in, taken apart and adjustable.',
  },
  {
    slug: 'components/page-gallery',
    href: '/docs/components/page-gallery',
    title: 'Page gallery',
    description:
      'Every shipped page of the production mirror, live in a frame at the desktop and the phone width in both themes, picked from one list.',
  },
  {
    slug: 'components/page-templates',
    href: '/docs/components/page-templates',
    title: 'Page templates',
    description:
      'The page types the hub builds from: the book page, the docs page, the article and the error page, each assembled from its parts.',
  },
  {
    slug: 'craft',
    href: '/docs/craft',
    title: 'Design numbers and traps',
    description:
      'The numbers, traps and reasons behind the rules the hub’s instruments follow: type, lines, SVG motion, dither, writing, interface details and films.',
  },
  {
    slug: 'craft/type',
    href: '/docs/craft/type',
    title: 'The correct Inter in practice',
    description:
      'Keeping the browser from replacing or degrading the rsms InterVariable 4.1: binding, features, optical size, tracking, measure, scripts and checks.',
  },
  {
    slug: 'craft/lines',
    href: '/docs/craft/lines',
    title: 'Lines and seams',
    description:
      'The arithmetic of 1px rules: composite greys, self-stacks, rails as borders, full-width rules, stacking contexts over seams and what the auditor counts.',
  },
  {
    slug: 'craft/svg-motion',
    href: '/docs/craft/svg-motion',
    title: 'SVG lines in motion',
    description:
      'Dash traps with their proofs, GSAP seen from outside the page, timing numbers, first-paint transitions, stretched viewBoxes, symbols and masks.',
  },
  {
    slug: 'craft/dither',
    href: '/docs/craft/dither',
    title: 'Dither in practice',
    description:
      'Why ordered dither, why cells are screen pixels, transitions on one grid, material strength, and the story and placement of dithered pictures.',
  },
  {
    slug: 'craft/writing',
    href: '/docs/craft/writing',
    title: 'Writing',
    description:
      'The house register with before and after rewrites, writing for a reader who knows nothing about the work, and the rules for slides and cards.',
  },
  {
    slug: 'craft/interface-details',
    href: '/docs/craft/interface-details',
    title: 'Interface details',
    description:
      'Glyph gaps, copy controls, tap slabs, layout-shift cases with measured jumps, third-party themes, contrast numbers, carousels and hit areas.',
  },
  {
    slug: 'craft/films',
    href: '/docs/craft/films',
    title: 'Deterministic films and sound',
    description:
      'Rendering films that match frame for frame: framemd5 pairs, the image race, fonts, chroma on odd pixels, thin lines over dither, the mix and speech.',
  },
  {
    slug: 'engineering',
    href: '/docs/engineering',
    title: 'Browser and build traps',
    description:
      'What breaks in a Next.js 16, fumadocs, canvas or SVG site, learned on this one: each trap with its symptom, its cause, the fix and the numbers.',
  },
  {
    slug: 'engineering/docs-traps',
    href: '/docs/engineering/docs-traps',
    title: 'Docs site traps on Next.js 16 and fumadocs',
    description:
      'Intermediate frames, marks lost at hydration, sidebar fixes, Markdown twins, stable highlighting, the cascade and builds on a fumadocs site.',
  },
  {
    slug: 'engineering/engines',
    href: '/docs/engineering/engines',
    title: 'Canvas and WebGL engines',
    description:
      'The context budget, shared canvases, readback, quality from frame time, what a field costs, galleries of live previews and engine lifecycles.',
  },
  {
    slug: 'engineering/verification',
    href: '/docs/engineering/verification',
    title: 'Proving a visual change',
    description:
      'Turning it looks right into readings: seam greys, probes before edits, the stress matrix, real gestures, WebKit and parity across an upgrade.',
  },
  {
    slug: 'engineering/performance',
    href: '/docs/engineering/performance',
    title: 'Performance without visual loss',
    description:
      'Measuring honestly, field against lab on a real docs site, bytes before scripts, shader and module weight, and judging dependencies on their merits.',
  },
  {
    slug: 'engineering/lottie',
    href: '/docs/engineering/lottie',
    title: 'Lottie on canvas',
    description:
      'Eight lottie-web canvas traps, each proven, with the before and after numbers and the recipe that proves a fix.',
  },
  {
    slug: 'engineering/i18n-routing',
    href: '/docs/engineering/i18n-routing',
    title: 'Localized routing',
    description:
      'Locale guards, the gt-next Link and an agent prompt that must run unchanged: routing traps on a localized Next.js site.',
  },
  {
    slug: 'engineering/dev-servers',
    href: '/docs/engineering/dev-servers',
    title: 'Dev servers and builds',
    description:
      'How next dev fails under load and after large pulls, with the symptom of each failure and the one-line fix.',
  },
  {
    slug: 'internals',
    href: '/docs/internals',
    title: 'How Prototemplate is built',
    description:
      'How the hub is built and changed: its routes and the deck, the skills, scripts and gates, the SEO system and the docs template.',
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
