'use client';

import { CRAFT_SECTIONS } from '@/app/craft/CraftArticle';

/**
 * The build log (src/app/craft/CraftArticle.tsx) on the libraries page of
 * the handbook: each section in a `section` under its own id, so the
 * anchors the hub links to (`#horizon-field`, `#the-libraries`) hold. Its
 * plates, engines and craft.css load through lazy.tsx with this module,
 * on that page alone. The page's table of contents takes the sections
 * from HANDBOOK_HEADINGS (src/lib/search-index.ts), since remark sees no
 * heading in them.
 */
export default function BuildLog() {
  return (
    <>
      {CRAFT_SECTIONS.map((section) => (
        <section key={section.id} id={section.id}>
          {section.body}
        </section>
      ))}
    </>
  );
}
