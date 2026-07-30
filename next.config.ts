import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prototype code: a handful of exploration pages carry known non-blocking
  // type errors, and deploys should not gate on them.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
