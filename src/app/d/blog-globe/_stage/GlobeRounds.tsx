import { T, Var } from '@/app/d/blog-globe/_shared/i18n';
import { getGT } from '@/app/d/blog-globe/_shared/i18n';

import RoundFrame from '@/app/d/blog-globe/_stage/RoundFrame';
import {
  GLOBE_REVIEW_ORDER,
  GLOBE_ROUNDS,
} from '@/app/d/blog-globe/_stage/rounds';

import './rounds-grid.css';

/* Every round of every variant at once: a row per variant in the review's
   order, a column per round. Each cell frames that round's own route
   (?v=<x>&embed=1), so each round keeps its own stylesheets and stays live.
   The caption links to the round's stage for that variant. */
export default async function GlobeRounds({ base }: { base: string }) {
  const gt = await getGT();
  return (
    <div className='grr-grid'>
      {GLOBE_REVIEW_ORDER.flatMap((variant) =>
        GLOBE_ROUNDS.map((round) => {
          const href = `${base}${round.path}?v=${variant}`;
          const letter = variant.toUpperCase();
          return (
            <figure key={`${variant}-${round.key}`} className='grr-cell'>
              <figcaption className='grr-caption'>
                <a href={href}>
                  {round.commit ? (
                    <T>
                      Variant <Var>{letter}</Var>, round{' '}
                      <Var>{round.number}</Var> (<Var>{round.commit}</Var>)
                    </T>
                  ) : (
                    <T>
                      Variant <Var>{letter}</Var>, round{' '}
                      <Var>{round.number}</Var> (live)
                    </T>
                  )}
                </a>
              </figcaption>
              <RoundFrame
                src={`${href}&embed=1`}
                title={gt('Globe variant {letter}, round {number}', {
                  letter,
                  number: round.number,
                })}
              />
            </figure>
          );
        })
      )}
    </div>
  );
}
