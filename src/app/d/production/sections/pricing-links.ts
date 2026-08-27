/**
 * The plan CTAs' destinations, as the shipped /pricing resolves them.
 *
 * On the real site the Starter CTA is `/signin?selected_plan=tier1` and the
 * Enterprise CTA is `/enterprise/contact`; both are landing-app paths that
 * this control has no counterpart for. The finished landing page of this
 * concept already settled the precedent in Deploy.tsx — Get Started goes to
 * the localized dashboard sign-in and Get a Demo keeps the real absolute
 * enterprise-contact URL — so the pricing CTAs follow the same resolution
 * rather than pointing at concept routes that do not exist.
 */
export const PLAN_CTAS = {
  starter: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  enterpriseContact: 'https://generaltranslation.com/enterprise/contact',
} as const;
