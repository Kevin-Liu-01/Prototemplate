import { getDirection } from '@/lib/directions';

/**
 * The search description of each direction, used by its study at
 * /d/<slug> and by its presentation page at /directions/<slug>. A search
 * snippet shows 50 to 160 characters whole (lint:seo S3 and B1), so a
 * direction whose concept in src/lib/directions.ts runs inside that range
 * uses the concept as written, and a direction whose concept is longer or
 * shorter takes the sentence below, written from its concept.
 */
const WRITTEN: Record<string, string> = {
  'singularity-dossier':
    'The completed site concept: the every-stack argument folded into the hero terminal, over an enterprise page that reads as an evidence file.',
  'singularity-orbit':
    'A showcase of the previous generation: a one-line hero with the windowed translation demo, the toolchain bento, the gravity well and the pricing file.',
  'singularity-signal':
    'A showcase of the previous generation: a split-pane hero with the pinned story cinema, the review workspace and the self-typing transmission log.',
  'textile-block':
    'The General Translation landing page as a Frank Lloyd Wright textile-block relief wall, set in horizontal courses on one square cast module.',
  'stepped-fret':
    'Mitla fret strata: the page as a stack of registers bounded by five Zapotec frets, each block stepping right over a gutter of Bayer stone.',
  'glazed-bond':
    'General Translation as an Ishtar Gate elevation in the Babylonian revival of Art Deco, every section one course of glazed panels in brick.',
  'brick-lattice':
    'The whole page is one glazed-brick wall in running bond, and every brick is an ordered-dither cell that draws one ornament per section.',
  'screenfold-codex':
    'The landing page as a Maya screenfold: one strip of bark-paper cream folded into ten leaves, each cut into registers by red rules.',
  'raking-relief':
    'A bas-relief alabaster wall under a raking light from the left, every form carved by the one light with stepped Bayer shadows.',
  'calendar-rings':
    'A General Translation landing page as one concentric disk that works as an instrument, every ring of ground and dither reading something real.',
  'talud-tablero':
    'The General Translation landing page as a stepped platform in the Teotihuacan talud-tablero profile, every section one terrace module.',
  'apadana-grid':
    'The General Translation landing page as the floor plan of a hypostyle hall seen from above, the content held in the bays between the columns.',
  'clay-tablet':
    'The page is a museum case of clay tablets: every section one fired-clay slab ruled into registers, with a museum label beneath it.',
};

const MIN = 50;
const MAX = 160;

/** The direction's description for its head; throws on an unknown slug or a description outside 50 to 160 characters, so the build fails rather than ship one. */
export function directionDescription(slug: string): string {
  const direction = getDirection(slug);
  if (!direction) throw new Error(`directionDescription: no direction ${slug}`);
  const text = WRITTEN[slug] ?? direction.concept;
  if (text.length < MIN || text.length > MAX) {
    throw new Error(`directionDescription: ${slug} runs ${text.length} characters; write one of ${MIN} to ${MAX} in WRITTEN`);
  }
  return text;
}
