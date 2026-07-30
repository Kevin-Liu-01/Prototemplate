'use client';

import FeatureBento, {
  DEFAULT_FEATURE_BENTO_ITEMS,
  type FeatureBentoItem,
} from '@/components/shared/FeatureBento';

/**
 * Every cell starts with its heading. The shared items carry a mono category
 * line above the title; this direction strips it, so a room is a name and a
 * drawing and nothing else.
 */
const ITEMS: FeatureBentoItem[] = DEFAULT_FEATURE_BENTO_ITEMS.map((item) => ({
  ...item,
  category: '',
}));

/**
 * Act V — the collection. Eight modules hung two-up on a single white sheet,
 * each one a line drawing rather than a screenshot.
 */
export default function Features() {
  return (
    <FeatureBento
      className='wg-features'
      id='features'
      heading='Eight rooms. One platform.'
      subheading='Every part of General Translation, drawn to the same scale.'
      items={ITEMS}
      columns={2}
    />
  );
}
