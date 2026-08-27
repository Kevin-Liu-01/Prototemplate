import {
  BadgeCheck,
  Building2,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * The enterprise contact desks' copy, vendored from the landing app so the
 * design study never invents a promise. Every line below is verbatim from
 * apps/landing/src/components/pages/enterprise — the four pillars and the
 * Cursor quote from EnterpriseContactForm.tsx, the three YC assurances from
 * YcContactForm.tsx, the page titles and deks from the two route files'
 * generateMetadata. Nothing is written here that the live site does not say.
 *
 * The one thing this module adds is the set of live URLs: the study is not
 * wired to the contact API, so both desks name the real form that is.
 */

/** A line of assurance: one icon, one sentence. */
export type ContactAssurance = {
  icon: LucideIcon;
  body: string;
};

/** An assurance that also names itself — the enterprise pillars. */
export type ContactPillar = ContactAssurance & {
  title: string;
};

/** A quote on the record: who said it, where it stands. */
export type ContactQuote = {
  user: string;
  role: string;
  message: string;
  href: string;
};

/* ---- /enterprise/contact ---- */

export const ENTERPRISE_CONTACT_TITLE =
  'Talk to our team about full-stack localization';

export const ENTERPRISE_CONTACT_DEK =
  'See how General Translation can deliver full-stack localization for your project with dedicated engineering support.';

export const ENTERPRISE_CONTACT_HEADING =
  'Talk to our team about enterprise deployment';

export const ENTERPRISE_PILLARS: readonly ContactPillar[] = [
  {
    icon: Building2,
    title: 'Enterprise Platform.',
    body: 'Share translation context, glossaries, and custom prompts across every project and content source in your company.',
  },
  {
    icon: Workflow,
    title: 'Custom Workflows.',
    body: 'Reliable, scalable translation workflows across any file format or framework. Custom integrations, webhooks, and tailored automation.',
  },
  {
    icon: ShieldCheck,
    title: 'Security and Governance.',
    body: 'SSO, SOC 2, ISO 27001, audit logs, and custom roles.',
  },
  {
    icon: Rocket,
    title: 'Forward-Deployed Support.',
    body: 'Dedicated FDE hours with localization engineers to set up your system and bring localization to production.',
  },
];

export const CURSOR_QUOTE: ContactQuote = {
  user: 'Andrew Milich',
  role: 'Head of Engineering, Cursor',
  message:
    'General Translation is an incredible product, we are users at @cursor_ai',
  href: 'https://x.com/milichab/status/2010496967848370412',
};

/* ---- /enterprise/contact/yc ---- */

export const YC_CONTACT_TITLE = 'Claim the General Translation YC deal';

export const YC_CONTACT_HEADING = 'Claim your YC deal';

export const YC_CONTACT_DEK =
  'Verify your YC founder status to claim $5,000 in General Translation credits for 12 months.';

export const YC_ASSURANCES: readonly ContactAssurance[] = [
  {
    icon: ShieldCheck,
    body: 'Your YC verification link confirms eligibility before the request reaches our team.',
  },
  {
    icon: MessageSquareText,
    body: 'Tell us what you are building so we can prepare the right onboarding path.',
  },
  {
    icon: BadgeCheck,
    body: 'Verified claims go directly to the team for review and activation.',
  },
];

/* ---- the live site: where a real submission actually goes ---- */

export const LIVE_ENTERPRISE_CONTACT =
  'https://generaltranslation.com/enterprise/contact';

export const LIVE_YC_CONTACT =
  'https://generaltranslation.com/enterprise/contact/yc';

export const LIVE_TERMS = 'https://generaltranslation.com/legal/terms';

export const LIVE_PRIVACY =
  'https://generaltranslation.com/legal/privacy-policy';

export const YC_VERIFY = 'https://www.ycombinator.com/verify';
