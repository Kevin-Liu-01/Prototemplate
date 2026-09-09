import type { ReactNode } from 'react';

import './GridView.css';

export type GridViewProps = {
  /** an item list (.pt-thumbs with its .pt-sec-label and .pt-thumb children) rendered for grid mode */
  children: ReactNode;
  label?: string;
};

/**
 * Every item at once. A paper scroll region over the stage; ViewerShell
 * renders a ThumbList of the route's sections inside it while the mode is
 * grid, as static captures, while the sidebar keeps its outline beside it.
 * On a site route the list is built with the sidebar's grouping (directive
 * 8.10, ThumbList's siteMap), so the grid's Shipped and Sites hold the same
 * captured pages the sidebar lists under those headers. The grid owns the
 * layout overrides for that list: an auto-fill grid, section labels
 * spanning every column, a 26px number column.
 */
export function GridView({ children, label = 'Every item as a grid' }: GridViewProps) {
  return (
    <div className='pt-grid pt-scroll' role='region' aria-label={label}>
      {children}
    </div>
  );
}
