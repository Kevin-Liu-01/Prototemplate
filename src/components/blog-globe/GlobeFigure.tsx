'use client';

import { useState } from 'react';

import {
  GLOBE_ROUNDS,
  type GlobeRoundKey,
  type GlobeVariantKey,
} from '@/app/d/blog-globe/_stage/rounds';
import GlobeFrame from '@/components/blog-globe/GlobeFrame';
import { VARIANT_NAMES, stageHref } from '@/components/blog-globe/figures';
import { Seg, type SegOption } from '@/components/viewer/Seg';

import './blog-globe.css';

/* the newest round first: it is the default, and Seg returns to its first
   option when the active one is clicked again */
const ROUND_OPTIONS: readonly SegOption<GlobeRoundKey>[] = [...GLOBE_ROUNDS].reverse().map((round) => ({
  value: round.key,
  label: `Round ${round.number}`,
  title: `Round ${round.number}, copied from commit ${round.commit}`,
}));

export type GlobeFigureProps = {
  variant: GlobeVariantKey;
  /** the round shown first; the latest by default */
  round?: GlobeRoundKey;
  /** a still for readers without JavaScript, such as the variant's contact sheet */
  fallback?: { src: string; alt: string };
};

/**
 * One globe figure, live, with a switch between its rounds. Each round
 * loads its own route in a fresh frame (GlobeFrame), so a round's
 * stylesheets never meet another's. The link opens the figure on its
 * round's stage, with the links between rounds around it.
 */
export default function GlobeFigure({ variant, round: initial = 'r3', fallback }: GlobeFigureProps) {
  const [round, setRound] = useState<GlobeRoundKey>(initial);
  const letter = variant.toUpperCase();
  const number = GLOBE_ROUNDS.find((entry) => entry.key === round)?.number ?? 3;
  return (
    <div className='bgf not-prose' data-testid={`docs-globe-${variant}`}>
      <div className='bgf-bar'>
        <Seg options={ROUND_OPTIONS} value={round} onChange={setRound} label={`Rounds of globe ${letter}`} />
        <a className='bgf-link' href={stageHref(round, variant)}>
          Open round {number} alone
        </a>
      </div>
      <GlobeFrame
        key={round}
        round={round}
        variant={variant}
        layout='fit'
        title={`Globe ${letter}, the ${VARIANT_NAMES[variant]} globe, round ${number}`}
      />
      {fallback ? (
        <noscript>
          <img className='bgf-still' src={fallback.src} alt={fallback.alt} />
        </noscript>
      ) : null}
    </div>
  );
}
