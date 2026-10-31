import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GLOBE_CONCEPTS, HEMISPHERE_MARKS, MARKS } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import MarksViewer from './MarksViewer';
import type { DrawingSize } from './MarksViewer';

const route = seoRoute({
  path: '/marks',
  title: PAGE_NAMES.marks.name,
  kind: 'page',
  description:
    'The two General Translation marks in production, a shortlist of the marks chosen so far, and every family of marks by the idea it draws.',
});

export const metadata = route.metadata;

/** A public path (`/marks/x.svg`) read from the public folder at build time. */
function readSvg(publicPath: string): string {
  return readFileSync(join(process.cwd(), 'public', publicPath), 'utf8').trim();
}

/** An SVG file's viewBox width and height; a file without a viewBox counts as a unit square. */
function viewBoxSize(svg: string): DrawingSize {
  const match = /viewBox="([^"]+)"/.exec(svg);
  const parts = match ? match[1].trim().split(/[\s,]+/).map(Number) : [];
  const width = parts[2];
  const height = parts[3];
  if (!(width > 0) || !(height > 0)) return [1, 1];
  return [width, height];
}

/** The aspect of an SVG file's viewBox, width over height, so the viewer can size the mark by height. */
function viewBoxAspect(svg: string): number {
  const [width, height] = viewBoxSize(svg);
  return width / height;
}

/**
 * /marks opens the book at its head. The viewer draws every mark by mask
 * from its public file, so no SVG is inlined into the page; the server
 * reads each speed and picture mark's file only for the aspect of its
 * viewBox, which the viewer sizes the mark by, and the construction
 * drawing of each mark that has one for its viewBox, whose size and aspect
 * are its own. The marks in production carry their aspects in
 * src/lib/marks.ts, the hemispheres and globe concepts are 256 unit
 * squares, and every dynamic mark records its drawn box in the catalog.
 */
export default function MarksPage() {
  const aspects: Readonly<Record<string, number>> = Object.fromEntries(
    MARKS.map((mark) => [mark.id, viewBoxAspect(readSvg(mark.file))])
  );
  const drawingFiles = [...HEMISPHERE_MARKS, ...MARKS, ...GLOBE_CONCEPTS].flatMap((mark) =>
    mark.constructionFile ? [mark.constructionFile] : []
  );
  const drawings: Readonly<Record<string, DrawingSize>> = Object.fromEntries(
    drawingFiles.map((file) => [file, viewBoxSize(readSvg(file))])
  );
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <MarksViewer aspects={aspects} drawings={drawings} updated={requireUpdated('/marks')} />
    </>
  );
}
