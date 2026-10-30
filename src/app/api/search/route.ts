import { createFromSource } from 'fumadocs-core/search/server';

import { isLocked } from '@/lib/seo/policy';
import { source } from '@/lib/source';

/**
 * The docs site's search index: fumadocs' Orama index over content/docs,
 * built once with the site and served as one static JSON file. The search
 * dialog (RootProvider search type 'static') downloads it on first open and
 * searches in the browser, so it needs no server at request time. For ten
 * pages that is the whole job; gt-cloud runs Pagefind after next build
 * because it indexes hundreds of pages in many locales (/docs/template).
 * A locked page (src/lib/seo/policy.ts, LOCKED) is left out, since the
 * file is public and holds each page's text.
 */
export const revalidate = false;

const unlocked = { ...source, getPages: (language?: string) => source.getPages(language).filter((page) => !isLocked(page.url)) };

export const { staticGET: GET } = createFromSource(unlocked);
