'use client';

/* the shared item list lives in a client module, so reading it from a server
   component hands back a client reference instead of the array */

import FeatureBento, {
  DEFAULT_FEATURE_BENTO_ITEMS,
  type FeatureBentoItem,
} from '@/components/shared/FeatureBento';

/**
 * The shared item list ships a `category` kicker above each cell title. A cell
 * is a heading and its drawing, so the kicker is emptied here and the empty
 * `<small>` is collapsed in styles.css.
 */
const ITEMS: FeatureBentoItem[] = DEFAULT_FEATURE_BENTO_ITEMS.map((item) => ({
  ...item,
  category: '',
}));

/**
 * Act V — the foundry floor. Three machined columns with the first cell milled
 * to double width, so the grid reads as a bento rather than a table.
 */
export default function Features() {
  return (
    <FeatureBento
      className='bf-features'
      id='bf-features'
      heading={
        <>
          Full-stack language infrastructure.
          <br />
          <span className='bf-dim'>Every cell a machined part.</span>
        </>
      }
      subheading='Eight machined parts of one pipeline: libraries, context, agents, routing, edge delivery, previews, runtime, and config.'
      items={ITEMS}
      columns={3}
    />
  );
}
