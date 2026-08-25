/* The enterprise page's data, carried over from the shipped page.
 *
 * Sources (gt-cloud, apps/landing/src):
 *   - customerLogos, infrastructureProof, ENTERPRISE_HERO_CTA:
 *     components/pages/enterprise/services-landing/data.ts
 *   - BADGES: components/landing/shell/footer-links.tsx
 *
 * The shipped modules wrap the prose in gt-next's msg() so the strings
 * resolve per locale; this reproduction renders the English resolution
 * plainly. Values, order and counts are the shipped ones — five
 * customers (Ramp, Cursor, Profound, Partiful, Sierra), one proof line
 * each, three certification marks.
 */

export type CustomerLogo = {
  name: string;
  href: string;
  lightSrc: string;
  darkSrc: string;
  className?: string;
};

export type LabelValue = {
  label: string;
  value: string;
};

export const ENTERPRISE_HERO_CTA = {
  href: '/enterprise/contact',
  location: 'services-cta-hero',
} as const;

export const customerLogos: readonly CustomerLogo[] = [
  {
    name: 'Ramp',
    href: 'https://ramp.com',
    lightSrc: '/logos/ramp.light.svg',
    darkSrc: '/logos/ramp.dark.svg',
  },
  {
    name: 'Cursor',
    href: 'https://www.cursor.com',
    lightSrc: '/logos/cursor.light.svg',
    darkSrc: '/logos/cursor.dark.svg',
  },
  {
    name: 'Profound',
    href: 'https://www.tryprofound.com',
    lightSrc: '/logos/profound.light.svg',
    darkSrc: '/logos/profound.dark.svg',
    className: 'origin-left scale-90',
  },
  {
    name: 'Partiful',
    href: 'https://www.partiful.com',
    lightSrc: '/logos/partiful.light.svg',
    darkSrc: '/logos/partiful.dark.svg',
  },
  {
    name: 'Sierra',
    href: 'https://sierra.ai',
    lightSrc: '/logos/sierra.light.svg',
    darkSrc: '/logos/sierra.dark.svg',
    className: 'is-sierra',
  },
];

export const infrastructureProof: readonly LabelValue[] = [
  { label: 'Ramp', value: '11+ locales across dashboard, landing page, iOS' },
  { label: 'Cursor', value: '14+ locales across web, docs' },
  { label: 'Profound', value: '47+ locales across platform, docs' },
  { label: 'Partiful', value: '2+ locales across web, iOS, Android' },
  { label: 'Sierra', value: '7+ locales across web, GTM' },
];

/* The compliance shields under the hero's ask — the same three files and
   the same alt text the footer carries. Inked for the light ground; the
   dark theme inverts them in enterprise.css. */
export const BADGES: readonly { alt: string; src: string }[] = [
  { alt: 'SOC 2 Type II', src: '/shields/soc-2-type-2.svg' },
  { alt: 'GDPR Compliant', src: '/shields/gdpr.svg' },
  { alt: 'ISO 27001 Certified', src: '/shields/iso-27001.svg' },
];
