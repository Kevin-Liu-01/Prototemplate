import type { NextConfig } from 'next';

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
};

export default nextConfig;
