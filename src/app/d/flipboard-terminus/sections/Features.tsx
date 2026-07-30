'use client';

// The shared bento is a client module, so its default item list only resolves
// to a real array inside the client graph — read from a server component it
// arrives as a client-reference proxy.

import FeatureBento, {
  DEFAULT_FEATURE_BENTO_ITEMS,
  type FeatureBentoItem,
} from '@/components/shared/FeatureBento';

import FlapPhrase from '../components/FlapPhrase';

/**
 * Reading order for the board: the two modules a developer meets first take
 * the wide slabs on the top row, the six supporting modules run beneath them
 * in threes. Categories are blanked — a cell starts at its heading, never at
 * a kicker over it.
 */
const ORDER = [
  'code',
  'translation',
  'context',
  'routing',
  'delivery',
  'previews',
  'runtime',
  'config',
];

const ITEMS: FeatureBentoItem[] = ORDER.map((key) => {
  const item = DEFAULT_FEATURE_BENTO_ITEMS.find((candidate) => candidate.key === key);
  if (!item) throw new Error(`flipboard-terminus: unknown feature bento key "${key}"`);
  return { ...item, category: '' };
});

/** Act V — the eight platform modules, each cell a slab off the board. */
export default function Features() {
  return (
    <FeatureBento
      className='ft-features'
      id='ft-features'
      items={ITEMS}
      heading={
        <>
          Everything between your repo and <FlapPhrase text='THE WORLD' />
        </>
      }
      subheading='Eight modules on one pipeline: libraries, context, agents, routing, edge delivery, previews, runtime, and config.'
    />
  );
}
