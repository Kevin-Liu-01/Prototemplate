'use client';

import { useState } from 'react';

import type { GlobeRoundKey, GlobeVariantKey } from '@/app/d/blog-globe/_stage/rounds';
import GlobeFrame from '@/components/blog-globe/GlobeFrame';
import { VARIANT_NAMES, stageHref } from '@/components/blog-globe/figures';

import { Choice } from './controls';
import Plate from './Plate';

const ROUNDS: readonly { value: GlobeRoundKey; label: string }[] = [
  { value: 'r3', label: 'Round 3' },
  { value: 'r2', label: 'Round 2' },
  { value: 'r1', label: 'Round 1' },
];

/* the design review's order: D ranked first */
const VARIANTS: readonly GlobeVariantKey[] = ['d', 'a', 'b', 'c'];

/**
 * One blog globe figure, live, in its round's own document: GlobeFrame
 * loads /d/blog-globe (or /r1, /r2) with ?v=<variant>&embed=1 in a
 * same-origin frame, takes the height the figure posts, and passes the
 * docs theme on. Each round keeps its own stylesheets that way, and the
 * docs bundle carries none of the figures' code. Every figure inside keeps
 * its own controls: the underlined language names, the clickable cities
 * and the keyboard.
 */
export default function BlogGlobeDemo() {
  const [round, setRound] = useState<GlobeRoundKey>('r3');
  const [variant, setVariant] = useState<GlobeVariantKey>('d');
  const name = VARIANT_NAMES[variant];
  return (
    <Plate
      bare
      controls={
        <>
          <Choice label='Round' options={ROUNDS} value={round} onChange={setRound} />
          <Choice
            label='Direction'
            options={VARIANTS.map((v) => ({ value: v, label: `${v.toUpperCase()} ${VARIANT_NAMES[v]}` }))}
            value={variant}
            onChange={setVariant}
          />
          <a className='dmo-btn dmo-link' href={stageHref(round, variant)}>
            Open Stage
          </a>
        </>
      }
      fit
      label={`Blog globe direction ${variant.toUpperCase()}, the ${name} globe, from round ${round.slice(1)}`}
      stageClassName='dmo-blogglobe'
      tag={stageHref(round, variant)}
    >
      <GlobeFrame
        key={`${round}-${variant}`}
        layout='fit'
        round={round}
        title={`Blog globe direction ${variant.toUpperCase()}, the ${name} globe, round ${round.slice(1)}`}
        variant={variant}
      />
    </Plate>
  );
}
