import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GLOBE_CONCEPTS, MARKS } from '@/lib/marks';

import { MarksPlate } from './lazy';
import type { MarkEntry } from './MarksPlate';

/** A public file's text, read at build time like /marks reads it. */
function readPublic(publicPath: string): string {
  return readFileSync(join(process.cwd(), 'public', publicPath), 'utf8').trim();
}

/** The aspect of an SVG's viewBox, width over height; 1 when it has none. */
function aspectOf(svg: string): number {
  const box = /viewBox="([^"]+)"/.exec(svg)?.[1]?.trim().split(/[\s,]+/).map(Number);
  const w = box?.[2];
  const h = box?.[3];
  return w && h ? w / h : 1;
}

/**
 * The marks picker's server half: it reads every speed mark, picture mark
 * and globe concept from public/marks at build time and hands the files to
 * the client plate, so the page ships the marks inline in currentColor and
 * fetches nothing.
 */
export default function MarksDemo() {
  const entries: MarkEntry[] = [
    ...MARKS.map((mark) => {
      const svg = readPublic(mark.file);
      return {
        id: mark.id,
        name: mark.name,
        group: mark.family,
        kind: mark.kind,
        svg,
        aspect: aspectOf(svg),
        /* the picture marks' drawings are near square and small enough to inline; the speed marks' drawings are wide sheets that /marks shows across a card */
        construction: mark.family === 'picture' ? readPublic(mark.constructionFile) : undefined,
      };
    }),
    ...GLOBE_CONCEPTS.map((concept) => {
      const svg = readPublic(concept.file);
      return {
        id: concept.id,
        name: concept.name,
        group: 'globe' as const,
        kind: 'monogram' as const,
        svg,
        aspect: aspectOf(svg),
      };
    }),
  ];
  return <MarksPlate entries={entries} />;
}
