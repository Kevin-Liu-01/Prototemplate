/**
 * The partner credit offers of the shipped site, as a visitor reads them at
 * generaltranslation.com/enterprise/contact/<partner>. The copy is the
 * visible copy of gt-cloud's apps/landing/src/components/pages/<partner>/
 * <Partner>Page.tsx on origin/main (#4618 to #5273), and the title and
 * description are each route's metadata in
 * apps/landing/src/app/[locale]/(home)/enterprise/contact/<partner>/page.tsx.
 * The redemption codes live on the server and no page shows them, so none
 * is recorded here.
 */

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
  title: string;
  description: string;
};

export const PARTNER_OFFERS: Readonly<Record<PartnerSlug, PartnerOffer>> = {
  yc: {
    slug: 'yc',
    partnershipLabel: 'General Translation and Y Combinator',
    logo: { src: '/logos/yc-logo-orange.svg', width: 16, inverts: false },
    heading: '$5,000 in credits for YC startups',
    amount: 5000,
    term: '12 months',
    code: 'the code from YC',
    title: '$5,000 in General Translation credits for YC startups',
    description:
      'Eligible Y Combinator founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  mercury: {
    slug: 'mercury',
    partnershipLabel: 'General Translation and Mercury',
    logo: { src: '/logos/mercury-com-logo.svg', width: 16, inverts: true },
    heading: '$2,000 in credits for Mercury customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Mercury',
    title: '$2,000 in General Translation credits for Mercury customers',
    description:
      'Eligible Mercury customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
  slash: {
    slug: 'slash',
    partnershipLabel: 'General Translation and Slash',
    logo: { src: '/logos/slash-logo.svg', width: 47, inverts: true },
    heading: '$2,000 in credits for Slash customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Slash',
    title: '$2,000 in General Translation credits for Slash customers',
    description:
      'Eligible Slash customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
  speedrun: {
    slug: 'speedrun',
    partnershipLabel: 'General Translation and a16z speedrun',
    logo: { src: '/logos/speedrun-logo.svg', width: 84, inverts: true },
    heading: '$5,000 in credits for a16z speedrun startups',
    amount: 5000,
    term: '12 months',
    code: 'the a16z code from speedrun',
    title: '$5,000 in General Translation credits for a16z speedrun startups',
    description:
      'Eligible a16z speedrun founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  a16z: {
    slug: 'a16z',
    partnershipLabel: 'General Translation and Andreessen Horowitz',
    logo: { src: '/logos/a16z-logo-star.png', width: 38, inverts: true },
    heading: '$5,000 in credits for a16z startups',
    amount: 5000,
    term: '12 months',
    code: 'the code from a16z',
    title: '$5,000 in General Translation credits for a16z startups',
    description:
      'Eligible a16z founders can apply for $5,000 in General Translation credits, valid for 12 months.',
  },
  residency: {
    slug: 'residency',
    partnershipLabel: 'General Translation and The Residency',
    logo: { src: '/logos/the-residency-logo.svg', width: 67, inverts: true },
    heading: '$1,000 in credits for founders at The Residency',
    amount: 1000,
    term: '12 months',
    code: 'the code from The Residency',
    title: '$1,000 in General Translation credits for founders at The Residency',
    description:
      'Eligible founders at The Residency can apply for $1,000 in General Translation credits, valid for 12 months.',
  },
  rho: {
    slug: 'rho',
    partnershipLabel: 'General Translation and Rho',
    logo: { src: '/logos/rho-logo.svg', width: 35, inverts: true },
    heading: '$2,000 in credits for Rho customers',
    amount: 2000,
    term: 'six months',
    code: 'the code from Rho',
    title: '$2,000 in General Translation credits for Rho customers',
    description:
      'Eligible Rho customers can apply for $2,000 in General Translation credits, valid for six months.',
  },
};

/** The page's metadata: the live route's title and description, and the mirror's icon. */
export function partnerMetadata(slug: PartnerSlug) {
  const offer = PARTNER_OFFERS[slug];
  return {
    title: offer.title,
    description: offer.description,
    icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  };
}
