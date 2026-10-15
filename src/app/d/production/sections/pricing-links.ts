/**
 * The plan CTAs' destinations. On the shipped /pricing the Starter CTA is
 * `/signin?selected_plan=tier1` and the Enterprise CTA is
 * `/enterprise/contact`, both on the landing app.
 *
 * PLAN_CTAS holds the live addresses, which the directions that borrow it
 * (apadana-grid, calendar-rings, screenfold-codex, raking-relief,
 * brick-lattice) keep. PROD_PLAN_CTAS holds the mirror's own sign-in and
 * enterprise contact pages, which the /d/production pricing page links.
 */
export const PLAN_CTAS = {
  starter: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  enterpriseContact: 'https://generaltranslation.com/enterprise/contact',
} as const;

export const PROD_PLAN_CTAS = {
  starter: '/d/production/signin?selected_plan=tier1',
  enterpriseContact: '/d/production/enterprise/contact',
} as const;
