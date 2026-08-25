/**
 * The shipped page's link table, verbatim from
 * apps/landing/src/components/pages/yc/yc-links.ts. Both CTAs on /yc point
 * at the claim record on the same page, so nothing here needs the concept
 * base and nothing leaves the route. The `location` slugs are the PostHog
 * cta_clicked contract upstream; this control renders plain anchors and
 * fires nothing, but the slugs stay on the record so the two pages can be
 * diffed line for line.
 */
export const YC_LINKS = {
  heroClaim: {
    href: '#claim-your-yc-deal',
    location: 'yc-hero-claim',
  },
  closeClaim: {
    href: '#claim-your-yc-deal',
    location: 'yc-close-claim',
  },
} as const;
