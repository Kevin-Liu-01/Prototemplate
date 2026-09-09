import type { ReactNode } from 'react';

import './GridView.css';

export type GridViewProps = {
  /** the sidebar's item list (.pt-thumbs with its .pt-sec-label and .pt-thumb children), re-parented here in grid mode */
  children: ReactNode;
  label?: string;
};

/**
 * Every item at once. A paper scroll region over the stage; ViewerShell
 * renders the sidebar's thumb list inside it while the mode is grid, the
 * way the deck viewer moved its list between the sidebar and the grid.
 * The grid owns the layout overrides for that list: an auto-fill grid,
 * section labels spanning every column, a 26px number column.
 */
export function GridView({ children, label = 'Every item as a grid' }: GridViewProps) {
  return (
    <div className='pt-grid pt-scroll' role='region' aria-label={label}>
      {children}
    </div>
  );
}
