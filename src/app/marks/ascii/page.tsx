import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { ARMILLARY_FILES, ASCII_ARMILLARY_FILES, FILES, HEADER_FILES } from './content';
import AsciiViewer from './AsciiViewer';

const route = seoRoute({
  path: '/marks/ascii',
  title: PAGE_NAMES.ascii.name,
  kind: 'page',
  description: 'The General Translation header in round dots, the armillary set in characters and the armillary loader as GIFs, in both themes with their files.',
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/ascii'),
});

export const metadata = route.metadata;

const DIR = join(process.cwd(), 'public', FILES);
const HEADER_SVG = readFileSync(join(DIR, 'gt-ascii-header.svg'), 'utf8');
const [, , cols, rows] = (HEADER_SVG.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 0 0').split(' ').map(Number);
const sized = <T extends { file: string }>(files: readonly T[]) => files.map((f) => ({ ...f, bytes: statSync(join(DIR, f.file)).size }));

/**
 * /marks/ascii: the dot-matrix header, the ASCII armillary and the
 * armillary GIF. The server
 * reads each file's size and the plain text header, so the client loads
 * neither.
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
      />
    </>
  );
}
