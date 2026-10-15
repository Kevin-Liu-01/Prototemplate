/**
 * The social card's address: the query /og reads and every head names.
 * seoRoute builds it, src/app/og/route.tsx parses it and
 * scripts/build/deck.mjs builds the deck's, so the three agree by
 * construction. Like policy.ts, this file imports nothing at runtime, so
 * a Node script loads it through type stripping.
 *
 *   /og?v=<version>&t=<title>&s=<section>&d=<description>&k=<kind>&p=<path>
 */

/** Changes when the card's design changes, so every cached card is fetched again. */
export const OG_VERSION = '1';

/** The generated card's size: 1.91 to 1, the size X and LinkedIn draw a large card at. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** The labels the card draws in its top band; any other value draws none. */
export const SEO_SECTIONS = ['Docs', 'Handbook', 'Skills', 'Directions', 'Shipped', 'Blog', 'Motion', 'Archive', 'Deck'] as const;
export type SeoSection = (typeof SEO_SECTIONS)[number];

/** What a route is, which decides its Open Graph type, its JSON-LD and its card. */
export const SEO_KINDS = ['page', 'article', 'skill', 'post', 'direction', 'mirror', 'error'] as const;
export type SeoKind = (typeof SEO_KINDS)[number];

/** The longest title and description the card draws; the route cuts longer ones. */
export const CARD_TITLE_MAX = 90;
export const CARD_DESCRIPTION_MAX = 200;

export type CardInput = {
  title: string;
  section?: SeoSection;
  description: string;
  kind: SeoKind;
  path: string;
};

/** Cuts a string to `max` characters on a word, with an ellipsis. */
export function cut(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max - 1);
  const space = head.lastIndexOf(' ');
  return `${(space > max * 0.6 ? head.slice(0, space) : head).replace(/[\s,.;:]+$/, '')}…`;
}

/** The card's path and query, relative to the site's origin. */
export function cardPath(input: CardInput): string {
  const query = new URLSearchParams();
  query.set('v', OG_VERSION);
  query.set('t', cut(input.title, CARD_TITLE_MAX));
  if (input.section) query.set('s', input.section);
  query.set('d', cut(input.description, CARD_DESCRIPTION_MAX));
  query.set('k', input.kind);
  query.set('p', input.path);
  return `/og?${query.toString()}`;
}

/** The card's fields from a request's query; unknown values fall back to a plain page card. */
export function parseCard(query: URLSearchParams): CardInput {
  const section = query.get('s') ?? '';
  const kind = query.get('k') ?? '';
  const path = query.get('p') ?? '/';
  return {
    title: cut(query.get('t') || 'Prototemplate', CARD_TITLE_MAX),
    section: (SEO_SECTIONS as readonly string[]).includes(section) ? (section as SeoSection) : undefined,
    description: cut(query.get('d') ?? '', CARD_DESCRIPTION_MAX),
    kind: (SEO_KINDS as readonly string[]).includes(kind) ? (kind as SeoKind) : 'page',
    path: path.startsWith('/') ? path.slice(0, 120) : '/',
  };
}
