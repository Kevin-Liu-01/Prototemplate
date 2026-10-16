import { CRAFT_SECTIONS } from '@/app/craft/CraftArticle';
import { buildBook } from '@/components/book/book';
import type { DocPage } from '@/components/book/model';

/** The handbook document that carries the build log. */
export const LIBRARIES_SLUG = 'libraries';

/**
 * The handbook with the build log: the documents from buildBook, with the
 * build log (CRAFT_SECTIONS) as the last rows of docs/LIBRARIES.md, which
 * already names the build log as its living version. The rows are numbered
 * on from the document's own headings, so /handbook/libraries#horizon-field
 * opens a library's plate. It lives apart from book.tsx because
 * CRAFT_SECTIONS mounts the live library demos, and a module that imports
 * it ships their client code.
 */
export function buildHandbook(): readonly DocPage[] {
  return buildBook('handbook').map((doc) => {
    if (doc.slug !== LIBRARIES_SLUG) return doc;
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
