'use client';

import { BRAND_SHELL_SECTIONS } from '@/app/brand/brand-sections';
import { GridView } from '@/components/viewer/GridView';
import { ThumbShot } from '@/components/viewer/ThumbShot';

/** The ten /brand sections with their captures: the items the grid lays out. */
export const GRID_ITEMS = BRAND_SHELL_SECTIONS[0]?.items ?? [];

type ViewerGridProps = {
  /** how many of the items to show */
  count?: number;
  /** the item drawn as the current one */
  active?: string;
};

/**
 * The shell's grid view with the /brand sections in it: the live GridView
 * and its stylesheet, holding the markup ThumbList renders for a frame
 * (the number column, the 16:9 frame with its ThumbShot, the title). The
 * items are inert here, since the plate has no route to open them on.
 */
export default function ViewerGrid({ count = GRID_ITEMS.length, active = '' }: ViewerGridProps) {
  const label = BRAND_SHELL_SECTIONS[0]?.label ?? 'Sections';
  return (
    <GridView label='The /brand sections as a grid'>
      <div className='pt-thumbs'>
        <div className='pt-sec-label'>{label}</div>
        {GRID_ITEMS.slice(0, count).map((item) => (
          <div className={item.id === active ? 'pt-thumb is-active' : 'pt-thumb'} key={item.id}>
            <div className='n'>{item.n ?? ''}</div>
            <div className='pt-thumb-body'>
              <div className='pt-thumb-frame'>
                <ThumbShot item={item} />
              </div>
              <div className='pt-thumb-title'>{item.title}</div>
            </div>
          </div>
        ))}
      </div>
    </GridView>
  );
}
