import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

/**
 * Files under public/ keep their names when their bytes change, so Next
 * serves them with max-age=0 and a repeat view revalidates every thumbnail,
 * poster and font. These folders hold the pictures and fonts a page loads:
 * a day fresh, then a week served from cache while it revalidates in the
 * background, so a file replaced under its name can show its old bytes
 * for a day and one visit more. `:path+` matches files only, never the
 * /brand and /graphics pages.
 */
const PUBLIC_ASSETS = ['/shots/:path+', '/media/:path+', '/static/:path+', '/graphics/:path+', '/brand/:path+', '/fonts/:path+'];
const DAY_THEN_REVALIDATE = 'public, max-age=86400, stale-while-revalidate=604800';

/**
 * The file trace. book.tsx (the Markdown twins, /llms-full.txt and
 * /AGENTS.md), marks/page.tsx, components/page.tsx, GT Atlas's article JSON
 * (atlas/[slug]/issue) and the motion pages read files
 * through paths computed at runtime, so Next's trace takes in the whole
 * checkout (public/, motion/, deck/) for these routes. Every one of them
 * prerenders, so nothing reads those files at request time. If one of
 * these routes turns dynamic, it must stop reading an excluded path.
 */
const UNTRACED = [
  'motion/**',
  'public/**',
  'deck/**',
  'graphics/**',
  'docs/reference-shots/**',
  'docs/composites/**',
  '.pagecheck/**',
  'tsconfig.tsbuildinfo',
];

/** Old /blog slugs and the live knowledge base article each now names (see redirects). */
const PRODUCTION_KB_REDIRECTS: readonly (readonly [from: string, article: string])[] = [
  ['best-localization-software', 'best-localization-software'],
  ['plurals', 'how-to-handle-plurals-in-react'],
  ['i18n-without-translation-files', 'i18n-without-translation-files'],
  ['nextjs-i18n-code-is-the-source-of-truth', 'i18n-without-translation-files'],
  ['multilingual-nextjs-seo', 'multilingual-nextjs-seo'],
  ['branch_vs_ternary', 'translate-conditional-jsx'],
];

/** The canon documents the /docs book served at /docs/<slug>; each now lives at /docs/handbook/<slug>. */
const CANON_MOVED = ['brand', 'design', 'architecture', 'ship-loop', 'libraries', 'graphics', 'artifact-pictures', 'tools', 'agents'];

/**
 * The Markdown twins' public addresses, rewritten to the one twin route.
 * Plain segments only, so a twin path never matches a page: /docs.md,
 * /docs/<slug>.md and /docs/<folder>/<slug>.md (the handbook and the
 * components), each also as .mdx.
 */
const TWIN_REWRITES = [
  { source: '/docs.:ext(md|mdx)', destination: '/md/docs' },
  { source: '/docs/:slug([a-z0-9-]+).:ext(md|mdx)', destination: '/md/docs/:slug' },
  { source: '/docs/:dir([a-z0-9-]+)/:slug([a-z0-9-]+).:ext(md|mdx)', destination: '/md/docs/:dir/:slug' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prototype code: a handful of exploration pages carry known non-blocking
  // type errors, and deploys should not gate on them.
  typescript: { ignoreBuildErrors: true },
  images: {
    // The blog column is 720px (or the viewport below 760px) and its
    // graphics are 3840px masters. A browser shrinking a far larger bitmap
    // blurs the artwork, so the ladder gives every 1x, 2x and 3x screen a
    // variant near its device-pixel width.
    deviceSizes: [640, 680, 720, 750, 828, 900, 960, 1080, 1200, 1360, 1440, 1620, 1920, 2048, 2160, 3840],
    // 95 keeps the dither and text edges through the re-encode
    qualities: [75, 85, 95],
    // blog assets carry a ?v= cache stamp; everything else stays query-free
    localPatterns: [{ pathname: '/**', search: '' }, { pathname: '/static/blogs/**' }],
  },
  outputFileTracingExcludes: {
    '/': UNTRACED,
    '/md/[...path]': UNTRACED,
    '/llms-full.txt': UNTRACED,
    '/AGENTS.md': UNTRACED,
    '/motion{,/**}': UNTRACED,
    '/marks': UNTRACED,
    '/graphics': UNTRACED,
    '/components': UNTRACED,
    '/atlas/[slug]/issue': UNTRACED,
  },
  async headers() {
    return [
      ...PUBLIC_ASSETS.map((source) => ({ source, headers: [{ key: 'Cache-Control', value: DAY_THEN_REVALIDATE }] })),
      // the deck's pictures are named by a hash of their bytes (scripts/build/deck.mjs)
      { source: '/deck-assets/:path+', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      // the deck's file address serves the same document as /deck, so only /deck is indexed
      { source: '/brand-deck.html', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
  async rewrites() {
    return [
      // /deck is the built deck itself (scripts/build/deck.mjs); its relative
      // deck-assets/ paths resolve from / at either address
      { source: '/deck', destination: '/brand-deck.html' },
      // The Markdown twins (src/app/md/[...path]/route.ts): a docs page plus
      // .md or .mdx answers its processed Markdown
      ...TWIN_REWRITES,
    ];
  },
  async redirects() {
    return [
      // The raw skill files moved from /skills/<slug>.md (the generated
      // bodies under public/skills, retired) to the skill's own folder,
      // served by src/app/skills/[slug]/[...path]/route.ts. A retired slug
      // lands on that route's 404.
      { source: '/skills/:slug([a-z0-9-]+).md', destination: '/skills/:slug/SKILL.md', permanent: true },
      // gt-isometric merged into gt-diagrams on 2026-10-10; its page, its
      // SKILL.md and its reference files all land on the merged skill.
      { source: '/skills/gt-isometric', destination: '/skills/gt-diagrams', permanent: true },
      { source: '/skills/gt-isometric/:path*', destination: '/skills/gt-diagrams', permanent: true },
      // The build log hangs off the libraries document in the handbook.
      { source: '/craft', destination: '/docs/handbook/libraries', permanent: true },
      // GT Atlas moved from /press to /atlas on 2026-10-23, the path it has on
      // generaltranslation.com; every page and picture under /press answers
      // with the same one under /atlas.
      { source: '/press/:path*', destination: '/atlas/:path*', permanent: true },
      // The handbook moved into the docs site on 2026-10-20: the book at
      // /handbook and each document, with its Markdown twin, answer with the
      // same page under /docs/handbook. A fragment rides along; the pages
      // print the same headings with the same ids, except the one DESIGN.md
      // heading with a slash (svh/dvh), which the docs slug without it.
      { source: '/handbook', destination: '/docs/handbook', permanent: true },
      { source: '/handbook/:slug([a-z0-9-]+)', destination: '/docs/handbook/:slug', permanent: true },
      { source: '/handbook.:ext(md|mdx)', destination: '/docs/handbook.:ext', permanent: true },
      { source: '/handbook/:slug([a-z0-9-]+).:ext(md|mdx)', destination: '/docs/handbook/:slug.:ext', permanent: true },
      // The repository documents moved from the /docs book to the handbook
      // when the docs site replaced it (2026-10-15), and with the handbook
      // into /docs/handbook on 2026-10-20.
      ...CANON_MOVED.map((slug) => ({ source: `/docs/${slug}`, destination: `/docs/handbook/${slug}`, permanent: true })),
      // The blog globe figure moved into the Components tab, beside Globes
      // and maps, when the docs took tabs (2026-10-21).
      { source: '/docs/blog-globe', destination: '/docs/components/blog-globe', permanent: true },
      { source: '/docs/blog-globe.:ext(md|mdx)', destination: '/docs/components/blog-globe.:ext', permanent: true },
      // The live site renamed its report card from /try to /report-card
      // (gt-cloud #4557) and redirects the old path; the mirror does the same.
      { source: '/d/production/try', destination: '/d/production/report-card', permanent: true },
      // The live site's partner short links (gt-cloud apps/landing
      // next.config.ts): /yc and the six beside it answer 308 with the
      // partner's credit page, so the mirror's do too.
      {
        source: '/d/production/:partner(yc|mercury|slash|speedrun|a16z|residency|rho)',
        destination: '/d/production/enterprise/contact/:partner',
        permanent: true,
      },
      // The live site's other redirects (gt-cloud apps/landing
      // next.config.ts): devlog posts moved under /blog, the old pricing
      // catalog address, and the short legal addresses. Live answers 308
      // for the permanent ones and 307 for /pricing-catalog.
      { source: '/d/production/devlog/:slug*', destination: '/d/production/blog/:slug*', permanent: true },
      // The live site's knowledge base redirects (gt-cloud apps/landing
      // src/lib/kb-redirects.ts): each old /blog slug a kb article names in
      // its redirectFrom answers 308 with that article. The knowledge base
      // is not mirrored, so these land on the live article. The pairs are
      // the redirectFrom lines of kb/*.mdx in generaltranslation/content
      // at befd13c1, the content gt-cloud origin/main pins.
      ...PRODUCTION_KB_REDIRECTS.map(([from, article]) => ({
        source: `/d/production/blog/${from}`,
        destination: `https://generaltranslation.com/en-US/kb/${article}`,
        permanent: true,
      })),
      { source: '/d/production/pricing-catalog', destination: '/d/production/pricing', permanent: false },
      { source: '/d/production/privacy', destination: '/d/production/legal/privacy-policy', permanent: true },
      { source: '/d/production/terms', destination: '/d/production/legal/terms', permanent: true },
      { source: '/d/production/legal/terms-of-service', destination: '/d/production/legal/terms', permanent: true },
      { source: '/d/production/data-processing', destination: '/d/production/legal/data-processing', permanent: true },
    ];
  },
};

/** fumadocs-mdx compiles content/docs (source.config.ts) into .source/ and lets the routes import MDX. */
const withMDX = createMDX();

export default withMDX(nextConfig);
