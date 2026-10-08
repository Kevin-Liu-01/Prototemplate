'use client';

import { IndexPanel } from '@/components/viewer/IndexPanel';
import { PreviewLayer } from '@/components/viewer/PreviewLayer';
import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { Sidebar } from '@/components/viewer/Sidebar';
import { SITE_SURFACES } from '@/lib/surfaces';
import type { SurfaceGroup } from '@/lib/surfaces';

/** The site map groups the list shows, in the shell's one order (Shipped after Pages, directive 8.10); the count names their rows. */
const LIST_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Knowledge', 'Shipped', 'Documents', 'Sites', 'Explorations', 'Archive'];

/** `44 pages`: the count at the end of the filter row, and the word its placeholder takes (`Filter pages`). */
const LIST_COUNT = `${SITE_SURFACES.filter((row) => LIST_GROUPS.includes(row.group)).length} pages`;

export type CornerLayersProps = {
  /** the list is wanted, or still sliding out */
  listShown: boolean;
  listState: ShellState;
  panelState: ShellState;
};

/**
 * The direction corner's panels (DirectionCorner.tsx): the list, the index
 * panel and the one preview layer for their rows and the search's. They
 * carry the site map and its captures, so the corner loads this module as
 * its own chunk when a reader first reaches for the corner (a hover, a
 * focus, a key), never with the prototype under it.
 */
export default function CornerLayers({ listShown, listState, panelState }: CornerLayersProps) {
  return (
    <>
      {listShown ? (
        <ShellContext value={listState}>
          <Sidebar title='Prototemplate' mark='pt' count={LIST_COUNT} sections={[]} thumb='row' siteMap />
        </ShellContext>
      ) : null}
      <ShellContext value={panelState}>
        <IndexPanel set='site' />
      </ShellContext>
      {/* the one preview layer (directive 8.6) for the list's, the index's and the search's rows */}
      <PreviewLayer />
    </>
  );
}
