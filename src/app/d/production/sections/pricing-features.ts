/**
 * The compare-plans grid's rows, vendored from the shipped feature grid's
 * data hook (packages/ui/src/components/pricing/PricingData.tsx) and
 * flattened to the two tiers /pricing actually mounts: Starter and
 * Enterprise. The shipped hook also carries a Free column that only the
 * dashboard's own grid renders, so those cells are dropped here rather
 * than reinterpreted.
 *
 * Pure data, no JSX: the group marks live with the section that draws them.
 */

/** A cell is a check, a cross, a real value, or the one rate-card link. */
export type Cell =
  | { kind: 'yes' }
  | { kind: 'no' }
  | { kind: 'text'; value: string }
  /** The Starter row's "View Rates ↗" link out to the usage page. */
  | { kind: 'rates' };

export type Feature = {
  id: string;
  name: string;
  /** The help bubble's copy, where the shipped row carries one. */
  tooltip?: string;
  /** The shipped grid's "New!" plate. */
  isNew?: boolean;
  starter: Cell;
  enterprise: Cell;
};

/** Group ids match the shipped hook's, so the marks stay keyed to them. */
export type FeatureGroupId = 'pricing' | 'core' | 'platform' | 'support';

export type FeatureGroup = {
  id: FeatureGroupId;
  name: string;
  features: readonly Feature[];
};

const YES: Cell = { kind: 'yes' };
const NO: Cell = { kind: 'no' };
const text = (value: string): Cell => ({ kind: 'text', value });

const UNLIMITED = text('Unlimited');
const CUSTOM = text('Custom');

export const PRICING_FEATURES: readonly FeatureGroup[] = [
  {
    id: 'pricing',
    name: 'Pricing',
    features: [
      {
        id: 'platform_fee',
        name: 'Platform Fee',
        starter: text('$0'),
        enterprise: CUSTOM,
      },
      {
        id: 'usage_rates',
        name: 'Usage Rates',
        tooltip: 'Pricing for translation and agent workflows.',
        starter: { kind: 'rates' },
        enterprise: CUSTOM,
      },
    ],
  },
  {
    id: 'core',
    name: 'Core Products',
    features: [
      {
        id: 'locadex',
        name: 'Locadex AI Agent',
        isNew: true,
        starter: YES,
        enterprise: text('Custom Workflows'),
      },
      { id: 'oss_sdks', name: 'Open-Source SDKs', starter: YES, enterprise: YES },
      {
        id: 'translation_cli',
        name: 'Translation CLI',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'translation_platform',
        name: 'Context Platform',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'translation_cdn',
        name: 'Translation CDN',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'branches',
        name: 'Version Branching',
        starter: YES,
        enterprise: YES,
      },
    ],
  },
  {
    id: 'platform',
    name: 'Platform',
    features: [
      {
        id: 'locales',
        name: 'Languages',
        starter: UNLIMITED,
        enterprise: UNLIMITED,
      },
      {
        id: 'projects',
        name: 'Projects',
        tooltip:
          'Apps and websites. Each project is equivalent to a React app.',
        starter: UNLIMITED,
        enterprise: UNLIMITED,
      },
      {
        id: 'users',
        name: 'Users',
        tooltip:
          'Developers, translators, and others who need to use the General Translation platform.',
        starter: UNLIMITED,
        enterprise: UNLIMITED,
      },
      {
        id: 'context_groups',
        name: 'Context Groups',
        tooltip:
          'Context groups are used to supply extra context to translation workflows and can be shared across projects.',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'glossary',
        name: 'Keyword Glossary',
        tooltip:
          'A list of key words and phrases that are translated as specified.',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'context_directives',
        name: 'Custom Prompts',
        tooltip:
          'Including custom tone, style, audience, and locale instructions that are applied to all translations.',
        starter: YES,
        enterprise: YES,
      },
      {
        id: 'editor',
        name: 'Translation Editor',
        starter: YES,
        enterprise: YES,
      },
      { id: 'roles', name: 'Custom Roles', starter: NO, enterprise: YES },
      { id: 'webhooks', name: 'Webhooks', starter: NO, enterprise: YES },
      {
        id: 'soc_compliance',
        name: 'SOC 2 Type II Certification',
        starter: NO,
        enterprise: YES,
      },
      {
        id: 'iso_compliance',
        name: 'ISO 27001 Certification',
        starter: NO,
        enterprise: YES,
      },
      {
        id: 'sso',
        name: 'SSO (SAML & OIDC)',
        starter: NO,
        enterprise: YES,
      },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    features: [
      { id: 'github', name: 'Support on GitHub', starter: YES, enterprise: YES },
      { id: 'email', name: 'Email Support', starter: YES, enterprise: YES },
      { id: 'discord', name: 'Discord Support', starter: YES, enterprise: YES },
      { id: 'slack', name: 'Slack Support', starter: NO, enterprise: YES },
      { id: 'phone', name: 'Phone Support', starter: NO, enterprise: YES },
    ],
  },
];
