import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GLOBE_CONCEPTS, HEMISPHERE_MARKS, MARKS } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import MarksViewer from './MarksViewer';

const route = seoRoute({
  path: '/marks',
  title: PAGE_NAMES.marks.name,
  kind: 'page',
  description: `The two General Translation marks in production, then ${HEMISPHERE_MARKS.length} hemispheres marks in five families, the bar monogram collection and ${MARKS.filter((mark) => mark.family === 'picture').length + GLOBE_CONCEPTS.length} other explorations.`,
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
 * /marks opens the book at its head. The viewer draws every mark by mask
 * from its public file, so no SVG is inlined into the page; the server
 * reads each speed and picture mark's file only for the aspect of its
 * viewBox, which the viewer sizes the mark by. A construction overlay
 * shares its mark's viewBox. The marks in production, the hemispheres
 * round and the globe concepts carry their aspects in src/lib/marks.ts.
 */
export default function MarksPage() {
  const aspects: Readonly<Record<string, number>> = Object.fromEntries(
    MARKS.map((mark) => [mark.id, viewBoxAspect(readSvg(mark.file))])
  );
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <MarksViewer aspects={aspects} updated={requireUpdated('/marks')} />
    </>
  );
}
