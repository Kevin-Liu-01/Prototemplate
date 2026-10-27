import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GLOBE_CONCEPTS, MARKS } from '@/lib/marks';

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
 * Every speed mark, picture mark and globe concept the marks picker
 * shows, each file read from public/marks at build time. MarksDemo hands
 * them to the plate on the docs marks page; /components/marks.json serves
 * them to the same plate on /components when its row mounts it.
 */
export function markEntries(): MarkEntry[] {
  return [
    ...MARKS.map((mark) => {
      const svg = readPublic(mark.file);
      return {
        id: mark.id,
        name: mark.name,
        group: mark.family,
        kind: mark.kind,
        svg,
        aspect: aspectOf(svg),
        /* the plate inlines each picture mark's construction drawing from public/marks, though /marks draws these two marks alone; the speed marks have none */
        construction: mark.family === 'picture' ? readPublic(`/marks/${mark.id}-construction.svg`) : undefined,
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
}
