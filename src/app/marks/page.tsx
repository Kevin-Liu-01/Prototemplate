import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GLOBE_CONCEPTS, MARKS } from '@/lib/marks';
import type { MarkArt } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import MarksViewer from './MarksViewer';

const route = seoRoute({
  path: '/marks',
  title: PAGE_NAMES.marks.name,
  kind: 'page',
  description: `${MARKS.length} GT marks: the speed set of seven in one register and two survivors of the earlier round, then ${GLOBE_CONCEPTS.length} globe concepts that were not chosen.`,
});

export const metadata = route.metadata;

/** A public path (`/marks/x.svg`) read from the public folder at build time. */
function readSvg(publicPath: string): string {
  return readFileSync(join(process.cwd(), 'public', publicPath), 'utf8').trim();
}

/**
 * The aspect of an SVG file's viewBox, width over height, so the viewer
 * can size the mark by height. A file without a viewBox counts as square.
 */
function viewBoxAspect(svg: string): number {
  const match = /viewBox="([^"]+)"/.exec(svg);
  if (!match) return 1;
  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  const width = parts[2];
  const height = parts[3];
  if (!(width > 0) || !(height > 0)) return 1;
  return width / height;
}

/**
 * /marks opens the book at its head. The SVG files under public/marks are
 * read here, on the server, and handed to the viewer as markup, so every
 * mark is inlined and takes currentColor from the plate it sits on; the
 * same files stay downloadable at their public paths. The construction
 * overlay is read only for the marks that have one (the two picture
 * marks); the aspect of each clean file's viewBox goes with it. The globe
 * concepts under public/marks/globe are not read here: the viewer draws
 * them by mask from their public paths.
 */
export default function MarksPage() {
  const art: Readonly<Record<string, MarkArt>> = Object.fromEntries(
    MARKS.map((mark) => {
      const clean = readSvg(mark.file);
      const entry: MarkArt = { clean, aspect: viewBoxAspect(clean) };
      if (mark.constructionFile) entry.construction = readSvg(mark.constructionFile);
      return [mark.id, entry];
    })
  );
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <MarksViewer art={art} updated={requireUpdated('/marks')} />
    </>
  );
}
