import { GLOBE_REVIEW_ORDER, GLOBE_ROUNDS } from '@/app/d/blog-globe/_stage/rounds';
import GlobeFrame from '@/components/blog-globe/GlobeFrame';
import { PlateNearContext } from '@/components/docs/demos/hooks';
import { VARIANT_NAMES, stageHref } from '@/components/blog-globe/figures';

import './blog-globe.css';

/**
 * Every round of every globe figure at once: a row per variant in the
 * review's order (D, A, B, C) and a column per round, each cell a live
 * frame of that round's route. Each figure keeps the layout it was
 * reviewed in (the 712 px column) and is scaled down to its cell, so the
 * rounds compare side by side; a narrow page stacks the cells. Each
 * caption opens the figure on its round's stage at full size. The cells
 * arm one by one as they near the view, also where a host arms its plates
 * at once (PlateNearContext), so the grid never loads its frames together.
 */
export default function GlobeGrid() {
  return (
    <PlateNearContext.Provider value={false}>
      <div className='bgg not-prose' data-testid='docs-globe-grid'>
        <div className='bgg-grid'>
          {GLOBE_REVIEW_ORDER.flatMap((variant) =>
            GLOBE_ROUNDS.map((round) => {
              const letter = variant.toUpperCase();
              return (
                <figure key={`${variant}-${round.key}`} className='bgg-cell'>
                  <figcaption className='bgg-cap'>
                    <a href={stageHref(round.key, variant)}>
                      {letter}, round {round.number}
                    </a>
                  </figcaption>
                  <GlobeFrame
                    round={round.key}
                    variant={variant}
                    layout='scale'
                    title={`Globe ${letter}, the ${VARIANT_NAMES[variant]} globe, round ${round.number}`}
                  />
                </figure>
              );
            })
          )}
        </div>
      </div>
    </PlateNearContext.Provider>
  );
}
