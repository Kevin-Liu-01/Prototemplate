import { LIBRARIES } from '@/app/craft/libraries';
import { DOCS } from '@/app/docs/registry';
import { DIRECTIONS } from '@/lib/directions';

/**
 * The ⌘K palette's index — everything the site can jump to, assembled from
 * the same registries the pages render from: the doc set, the direction
 * registry, the LIBRARIES roster (whose anchors live on /docs), and the
 * brand book's sections. Pure data; the palette filters it client-side.
 */
export type SearchEntry = {
  title: string;
  href: string;
  kind: 'page' | 'doc' | 'site' | 'direction' | 'library' | 'brand';
  keywords?: string;
};

const PAGES: readonly SearchEntry[] = [
  { title: 'Index', href: '/', kind: 'page', keywords: 'home working file directions' },
  { title: 'Brand', href: '/brand', kind: 'page', keywords: 'identity book basement mark color type voice' },
  { title: 'Docs', href: '/docs', kind: 'page', keywords: 'readme build log craft libraries laws' },
  { title: 'Present', href: '/present', kind: 'page', keywords: 'deck presenter slides scoreboard' },
];

const BRAND_SECTIONS: readonly SearchEntry[] = [
  { title: 'The name', href: '/brand#the-name', kind: 'brand', keywords: 'general translation gt locadex naming' },
  { title: 'The idea', href: '/brand#the-idea', kind: 'brand', keywords: 'mission vision values vercel localization' },
  { title: 'The character', href: '/brand#the-character', kind: 'brand', keywords: 'personality voice scales aesthetic' },
  { title: 'The mark', href: '/brand#the-mark', kind: 'brand', keywords: 'logo monogram locadex rules' },
  { title: 'Color', href: '/brand#color', kind: 'brand', keywords: 'ink titanium paper accent palette' },
  { title: 'Type', href: '/brand#type', kind: 'brand', keywords: 'switzer inter typography fonts' },
  { title: 'Language as material', href: '/brand#language-as-material', kind: 'brand', keywords: 'glyphs pills reassembler devices' },
  { title: 'The completed reference', href: '/brand#the-completed-reference', kind: 'brand', keywords: 'dossier application' },
];

export const SEARCH_INDEX: readonly SearchEntry[] = [
  ...PAGES,
  ...DOCS.map(
    (doc): SearchEntry => ({
      title: doc.title,
      href: `/docs/${doc.slug}`,
      kind: 'doc',
      keywords: doc.blurb,
    })
  ),
  ...DIRECTIONS.map(
    (d): SearchEntry => ({
      title: d.name,
      href: `/d/${d.slug}`,
      kind: d.site ? 'site' : 'direction',
      keywords: `${d.slug} ${d.signature}`,
    })
  ),
  ...DIRECTIONS.filter((d) => d.site).map(
    (d): SearchEntry => ({
      title: `${d.name} — enterprise`,
      href: `/d/${d.slug}/enterprise`,
      kind: 'site',
      keywords: `${d.slug} enterprise`,
    })
  ),
  ...LIBRARIES.map(
    (lib): SearchEntry => ({
      title: lib.name,
      href: `/docs#${lib.name}`,
      kind: 'library',
      keywords: `${lib.role} ${lib.file}`,
    })
  ),
  ...BRAND_SECTIONS,
];
