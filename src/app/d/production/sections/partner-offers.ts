/**
 * The partner credit offers of the shipped site, as a visitor reads them at
 * generaltranslation.com/enterprise/contact/<partner>. The copy is the
 * visible copy of gt-cloud's apps/landing/src/components/pages/<partner>/
 * <Partner>Page.tsx on origin/main (#4618 to #5273), and the description
 * is each route's metadata in
 * apps/landing/src/app/[locale]/(home)/enterprise/contact/<partner>/page.tsx.
 * The head comes from seoRoute with partnerSeo's fields.
 * The redemption codes live on the server and no page shows them, so none
 * is recorded here.
 */

import type { SeoRouteInput } from '@/lib/seo/route';

export type PartnerSlug =
  | 'yc'
  | 'mercury'
  | 'slash'
  | 'speedrun'
  | 'a16z'
  | 'residency'
  | 'rho';

export type PartnerOffer = {
  slug: PartnerSlug;
  /** The lockup's accessible name, such as 'General Translation and Slash'. */
  partnershipLabel: string;
  /** The partner's logo file under public/logos, drawn 16px tall. */
  logo: { src: string; width: number; inverts: boolean };
  heading: string;
  /** The grant in whole US dollars. */
  amount: number;
  /** How long the credits last after activation, as the fine print words it. */
  term: '12 months' | 'six months';
  /** Whose code the visitor enters, the end of the How to apply sentence. */
  code: string;
  /** The page's name in the mirror, as SHIPPED_PAGES (src/lib/surfaces.ts) lists it. */
  name: string;
  /** The live route's meta description. */
  description: string;
};

export const PARTNER_OFFERS: Readonly<Record<PartnerSlug, PartnerOffer>> = {
  yc: {
    slug: 'yc',
    name: 'YC credits',
    partnershipLabel: 'General Translation and Y Combinator',
    logo: { src: '/logos/yc-logo-orange.svg', width: 16, inverts: false },
    heading: '$5,000 in credits for YC startups',
    amount: 5000,
    term: '12 months',
    code: 'the code from YC',
    description:
      'Eligible Y Combinator founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  mercury: {
    slug: 'mercury',
    name: 'Mercury credits',
    partnershipLabel: 'General Translation and Mercury',
    logo: { src: '/logos/mercury-com-logo.svg', width: 16, inverts: true },
    heading: '$2,000 in credits for Mercury customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Mercury',
    description:
      'Eligible Mercury customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
  slash: {
    slug: 'slash',
    name: 'Slash credits',
    partnershipLabel: 'General Translation and Slash',
    logo: { src: '/logos/slash-logo.svg', width: 47, inverts: true },
    heading: '$2,000 in credits for Slash customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Slash',
    description:
      'Eligible Slash customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
  speedrun: {
    slug: 'speedrun',
    name: 'Speedrun credits',
    partnershipLabel: 'General Translation and a16z speedrun',
    logo: { src: '/logos/speedrun-logo.svg', width: 84, inverts: true },
    heading: '$5,000 in credits for a16z speedrun startups',
    amount: 5000,
    term: '12 months',
    code: 'the a16z code from speedrun',
    description:
      'Eligible a16z speedrun founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  a16z: {
    slug: 'a16z',
    name: 'a16z credits',
    partnershipLabel: 'General Translation and Andreessen Horowitz',
    logo: { src: '/logos/a16z-logo-star.png', width: 38, inverts: true },
    heading: '$5,000 in credits for a16z startups',
    amount: 5000,
    term: '12 months',
    code: 'the code from a16z',
    description:
      'Eligible a16z founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  residency: {
    slug: 'residency',
    name: 'Residency credits',
    partnershipLabel: 'General Translation and The Residency',
    logo: { src: '/logos/the-residency-logo.svg', width: 67, inverts: true },
    heading: '$1,000 in credits for founders at The Residency',
    amount: 1000,
    term: '12 months',
    code: 'the code from The Residency',
    description:
      'Eligible founders at The Residency can apply for $1,000 in General Translation credits, valid for 12 months.',
  },
  rho: {
    slug: 'rho',
    name: 'Rho credits',
    partnershipLabel: 'General Translation and Rho',
    logo: { src: '/logos/rho-logo.svg', width: 35, inverts: true },
    heading: '$2,000 in credits for Rho customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Rho',
    description:
      'Eligible Rho customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
};

/**
 * The page's seoRoute input less its path: the mirror's name as the title,
 * the live route's description and kind mirror, which the policy gives
 * generaltranslation.com/en-US/enterprise/contact/<partner> as canonical.
 * Each page passes its own path literal, so lint:seo can check it.
 */
export function partnerSeo(slug: PartnerSlug): Omit<SeoRouteInput, 'path'> {
  const offer = PARTNER_OFFERS[slug];
  return { title: offer.name, section: 'Shipped', kind: 'mirror', description: offer.description };
}
