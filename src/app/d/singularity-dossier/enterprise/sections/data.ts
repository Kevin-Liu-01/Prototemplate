
import type { CustomerLogo, LabelValue } from './types';

export const ENTERPRISE_HERO_CTA = {
  href: '/enterprise/contact',
  location: 'services-cta-hero',
} as const;

export const customerLogos: CustomerLogo[] = [
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
  },
];

export const infrastructureProof: LabelValue[] = [
  {
    label: 'Ramp',
    value: (
      'Helping Ramp expand its AI finance platform into European markets'
    ),
  },
  {
    label: 'Cursor',
    value: (
      'Working with Cursor to internationalize their entire developer experience'
    ),
  },
  {
    label: 'Profound',
    value: (
      "Translating Profound's platform, docs, and education sites into 46 languages"
    ),
  },
  {
    label: 'Partiful',
    value: (
      "Localizing Partiful's event platform across web, iOS, and Android"
    ),
  },
  {
    label: 'Sierra',
    value: (
      'Helping Sierra internationalize to enter Latin American markets'
    ),
  },
];
