/**
 * The shipped page's link table, from
 * apps/landing/src/components/pages/mintlify/mintlify-links.ts. Three of the
 * four destinations leave the site as far as this repo is concerned, so they
 * keep the real absolute URLs:
 *
 *   integration / heroGetStarted / closeConnect
 *     '/dashboard/api/integrations/github/start?returnTo=%2F' — the GitHub
 *     OAuth start redirect on the dashboard.
 *   guide
 *     '/docs/integrations/mintlify/quickstart' — fumadocs.
 *
 * closeDemo is an ordinary internal page, so it resolves against the
 * concept base at the call site (the `/enterprise/contact` path below is
 * appended to it) rather than pointing out of the concept. The `location`
 * slug is the PostHog cta_clicked contract upstream; this control fires
 * nothing but keeps the slug on the record.
 */
const GITHUB_INTEGRATION_HREF =
  'https://generaltranslation.com/dashboard/api/integrations/github/start?returnTo=%2F';

export const MINTLIFY_LINKS = {
  integration: {
    href: GITHUB_INTEGRATION_HREF,
  },
  heroGetStarted: {
    href: GITHUB_INTEGRATION_HREF,
  },
  guide: {
    href: 'https://generaltranslation.com/docs/integrations/mintlify/quickstart',
  },
  closeConnect: {
    href: GITHUB_INTEGRATION_HREF,
  },
  closeDemo: {
    path: '/enterprise/contact',
    location: 'mintlify-cta',
  },
} as const;
