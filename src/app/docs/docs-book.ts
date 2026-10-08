import { CRAFT_SECTIONS } from '@/app/craft/CraftArticle';

import { buildBook } from './book';
import type { DocPage } from './model';
import { README_SLUG } from './model';

/**
 * The /docs book: the repository documents from buildBook, with the build
 * log (CRAFT_SECTIONS) as the readme's last rows, numbered on from its own
 * headings. It lives apart from book.tsx because CRAFT_SECTIONS mounts the
 * live library demos, and a route that imports this module ships their
 * client code; /handbook builds its book from book.tsx alone.
 */
export function buildDocs(): readonly DocPage[] {
  return buildBook('docs').map((doc) => {
    if (doc.slug !== README_SLUG) return doc;
    const sections = [...doc.sections];
    for (const craft of CRAFT_SECTIONS) {
      sections.push({
        kind: 'craft',
        id: craft.id,
        n: `${Number(doc.n)}.${sections.length + 1}`,
        title: craft.title,
        body: craft.body,
      });
    }
    return { ...doc, sections };
  });
}
