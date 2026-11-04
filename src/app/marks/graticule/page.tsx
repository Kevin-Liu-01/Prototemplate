import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { PROGRESSIONS } from './content';
import GraticuleViewer from './GraticuleViewer';

const route = seoRoute({
  path: '/marks/graticule',
  title: PAGE_NAMES.graticule.name,
  kind: 'page',
  description: 'Every graticule mark, cut from the lines of a wireframe globe, and the four steps from a full globe to two of them.',
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/graticule'),
});

export const metadata = route.metadata;

/** A progression's viewBox aspect, width over height, read from its public file. */
function aspectOf(publicPath: string): number {
  const svg = readFileSync(join(process.cwd(), 'public', publicPath), 'utf8');
  const view = /viewBox="([^"]+)"/.exec(svg)?.[1]?.trim().split(/[\s,]+/).map(Number) ?? [];
  const [, , width, height] = view;
  return width > 0 && height > 0 ? width / height : 1;
}

/** /marks/graticule: every graticule mark of the catalog, then the two progressions, whose aspect the server reads from their files. */
export default function GraticulePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GraticuleViewer progressionAspect={aspectOf(PROGRESSIONS[0].file)} updated={requireUpdated('/marks/graticule')} />
    </>
  );
}
