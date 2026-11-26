import { KEVIN } from '@/lib/seo/site';

/** The site's author by name: the person that the metadata and every JSON-LD node name as the author. */
export const AUTHOR = KEVIN.name;

/**
 * The byline that a project page's head note ends with (BookHead note): who
 * made the work the page shows. A partner is named where another person's
 * work shares the page, and the page's own text keeps the detail of that
 * person's part.
 */
export function byline(partner?: string): string {
  return `${AUTHOR} made the work on this page${partner ? ` with ${partner}` : ''}.`;
}
