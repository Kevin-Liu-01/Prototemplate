import FeatureBento from '@/components/shared/FeatureBento';

/**
 * Act V — the platform grid. Four-up rather than two-up: eight modules read as
 * one dense slate wall instead of a long flat scroll of small drawings in very
 * large dark boxes.
 */
export default function Features() {
  return (
    <FeatureBento
      className='tb-features'
      id='tb-features'
      columns={4}
      heading='The whole stack, end to end'
      subheading='Eight modules on one pipeline: libraries, context, agents, routing, edge delivery, previews, runtime, and config.'
    />
  );
}
