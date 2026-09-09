import type { ReactNode } from 'react';

import './GridView.css';

export type GridViewProps = {
  /** an item list (.pt-thumbs with its .pt-sec-label and .pt-thumb children) rendered for grid mode */
  children: ReactNode;
  label?: string;
};

/**
 * Every item at once. A paper scroll region over the stage; ViewerShell
 * renders a second ThumbList inside it while the mode is grid, and the
 * sidebar unmounts its own list for the same span, so the page holds one
 * set of items at a time (the deck viewer moved one list between the two
 * boxes; React remounts instead). The grid owns the layout overrides for
 * that list: an auto-fill grid, section labels spanning every column, a
 * 26px number column.
 */
export function GridView({ children, label = 'Every item as a grid' }: GridViewProps) {
  return (
    <div className='pt-grid pt-scroll' role='region' aria-label={label}>
      {children}
    </div>
  );
}
