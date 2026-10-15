import type { Metadata } from 'next';

/**
 * Every page under /d/ is a design study: GT's marketing copy, prices and
 * legal text reassembled in a direction's type and color. They stay
 * crawlable and out of search results, so stale prices and claims under
 * GT's name never rank on another domain (Kevin, 2026-10-14: every /d
 * exploration and site concept is noindex, follow). The design lab is
 * indexed through / and the /directions/<slug> pages instead.
 *
 * This layout renders nothing of its own; it only sets the default every
 * /d/ page inherits. A mirror page under /d/production that has a live
 * counterpart overrides it through seoRoute, which gives it index, follow
 * and its generaltranslation.com canonical (src/lib/seo/policy.ts).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function DesignStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
