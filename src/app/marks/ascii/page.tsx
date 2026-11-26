import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { ARMILLARY_FILES, ASCII_ARMILLARY_FILES, HEADER_FILES } from './content';
import AsciiViewer from './AsciiViewer';

const route = seoRoute({
  path: '/marks/ascii',
  title: PAGE_NAMES.ascii.name,
  kind: 'page',
  description: 'The General Translation header in round dots and the logo as an armillary sphere whose pieces turn on their own, as GIFs in both themes with their files.',
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/ascii'),
});

export const metadata = route.metadata;

/* a literal folder, so the bundler traces this one folder and not all of public (content.ts FILES names the same path) */
const DIR = join(process.cwd(), 'public/marks/ascii');
const HEADER_SVG = readFileSync(join(DIR, 'gt-ascii-header.svg'), 'utf8');
const [, , cols, rows] = (HEADER_SVG.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 0 0').split(' ').map(Number);
/* the armillary's lap, the numbers both of its GIFs are drawn from */
const LAP: number = JSON.parse(readFileSync(join(process.cwd(), 'scripts/build/armillary.json'), 'utf8')).lap.seconds;
const sized = <T extends { file: string }>(files: readonly T[]) => files.map((f) => ({ ...f, bytes: statSync(join(DIR, f.file)).size }));

/**
 * /marks/ascii: the dot-matrix header, the ASCII armillary and the
 * armillary GIF. The server reads each file's size, the plain text header
 * and the armillary's lap, so the client loads none of them.
 */
export default function AsciiPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <AsciiViewer
        updated={requireUpdated('/marks/ascii')}
        headerFiles={sized(HEADER_FILES)}
        asciiArmillaryFiles={sized(ASCII_ARMILLARY_FILES)}
        armillaryFiles={sized(ARMILLARY_FILES)}
        text={readFileSync(join(DIR, 'gt-ascii-header.txt'), 'utf8')}
        grid={{ cols, rows }}
        lap={LAP}
      />
    </>
  );
}
