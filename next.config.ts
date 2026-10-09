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
 * The file trace. book.tsx, marks/page.tsx and the motion pages read files
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
  'docs/harness/**',
  '.pagecheck/**',
  'tsconfig.tsbuildinfo',
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
    qualities: [75, 95],
    // blog assets carry a ?v= cache stamp; everything else stays query-free
    localPatterns: [{ pathname: '/**', search: '' }, { pathname: '/static/blogs/**' }],
  },
  outputFileTracingExcludes: {
    '/': UNTRACED,
    '/docs{,/**}': UNTRACED,
    '/handbook{,/**}': UNTRACED,
    '/motion{,/**}': UNTRACED,
    '/marks': UNTRACED,
    '/graphics': UNTRACED,
  },
  async headers() {
    return [
      ...PUBLIC_ASSETS.map((source) => ({ source, headers: [{ key: 'Cache-Control', value: DAY_THEN_REVALIDATE }] })),
      // the deck's pictures are named by a hash of their bytes (scripts/build-deck.mjs)
      { source: '/deck-assets/:path+', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      // the deck's file address serves the same document as /deck, so only /deck is indexed
      { source: '/brand-deck.html', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
  async rewrites() {
    return [
      // /deck is the built deck itself (scripts/build-deck.mjs); its relative
      // deck-assets/ paths resolve from / at either address
      { source: '/deck', destination: '/brand-deck.html' },
    ];
  },
  async redirects() {
    return [
      // The raw skill files moved from /skills/<slug>.md (the generated
      // bodies under public/skills, retired) to the skill's own folder,
      // served by src/app/skills/[slug]/[...path]/route.ts. A retired slug
      // lands on that route's 404.
      { source: '/skills/:slug([a-z0-9-]+).md', destination: '/skills/:slug/SKILL.md', permanent: true },
      // The build log merged into the readme on /docs.
      { source: '/craft', destination: '/docs', permanent: true },
    ];
  },
};

export default nextConfig;
