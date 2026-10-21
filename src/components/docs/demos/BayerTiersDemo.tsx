'use client';

import { useId, useState } from 'react';

import { BAYER4 } from '@/app/d/toolchain/diagrams/DitheredMark';
import { BAYER_8 } from '@/lib/dither';

import { Choice, Range } from './controls';
import Plate from './Plate';

type Order = '4' | '8';

const MATRICES: Record<Order, readonly (readonly number[])[]> = { '4': BAYER4, '8': BAYER_8 };

/** Every cell of the tile whose threshold sits under the coverage, as one path of unit squares. */
function tilePath(matrix: readonly (readonly number[])[], cover: number): string {
  const cells: string[] = [];
  matrix.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < cover) cells.push(`M${x} ${y}h1v1h-1Z`);
    });
  });
  return cells.join('');
}

/**
 * The ordered screen itself: the threshold matrix, a swatch tiled at one
 * coverage, and the full ramp of every tier. A cell is lit when its
 * threshold sits under the coverage, so each tier's lit cells are a subset
 * of the next tier's. That nesting is what lets the house fields mix tiers
 * on one grid without a cell ever being drawn twice.
 */
export default function BayerTiersDemo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [order, setOrder] = useState<Order>('4');
  const matrix = MATRICES[order];
  const n = matrix.length;
  const levels = n * n;
  const [cover, setCover] = useState(6);
  const k = Math.min(cover, levels);

  const change = (next: Order) => {
    const nextLevels = Number(next) * Number(next);
    setCover((c) => Math.round((c / levels) * nextLevels));
    setOrder(next);
  };

  return (
    <Plate
      bare
      controls={
        <>
          <Choice
            label='Matrix'
            options={[
              { value: '4', label: '4 by 4' },
              { value: '8', label: '8 by 8' },
            ]}
            value={order}
            onChange={change}
          />
          <Range
            format={(v) => `${v} of ${levels}`}
            label='Coverage'
            max={levels}
            min={0}
            step={1}
            value={k}
            onChange={setCover}
          />
        </>
      }
      height={300}
      label={`The ${n} by ${n} Bayer matrix at coverage ${k} of ${levels}`}
      phoneHeight={420}
      stageClassName='dmo-tiers'
      tag='BAYER_8'
    >
      <div className='dmo-tiers-matrix' style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} aria-hidden='true'>
        {matrix.flatMap((row, y) =>
          row.map((threshold, x) => (
            <span className={threshold < k ? 'dmo-tiers-token is-lit' : 'dmo-tiers-token'} key={`${x}-${y}`}>
              {threshold}
            </span>
          ))
        )}
      </div>
      <div className='dmo-tiers-right'>
        <svg aria-hidden='true' className='dmo-tiers-swatch' preserveAspectRatio='xMidYMid slice' viewBox='0 0 48 24'>
          <defs>
            <pattern height={n} id={`${uid}-tile`} patternUnits='userSpaceOnUse' width={n}>
              <path className='dmo-tiers-ink' d={tilePath(matrix, k)} shapeRendering='crispEdges' />
            </pattern>
          </defs>
          <rect fill={`url(#${uid}-tile)`} height='24' width='48' />
        </svg>
        <div className='dmo-tiers-ramp' style={{ gridTemplateColumns: `repeat(${Math.min(levels + 1, 17)}, 1fr)` }}>
          {Array.from({ length: Math.min(levels + 1, 17) }, (_, i) => {
            const tier = Math.round((i / Math.min(levels, 16)) * levels);
            return (
              <svg
                aria-hidden='true'
                className={tier === k ? 'dmo-tiers-step is-on' : 'dmo-tiers-step'}
                key={tier}
                viewBox={`0 0 ${n * 2} ${n * 2}`}
              >
                <path className='dmo-tiers-ink' d={tilePath(matrix, tier)} shapeRendering='crispEdges' />
                <path
                  className='dmo-tiers-ink'
                  d={tilePath(matrix, tier)}
                  shapeRendering='crispEdges'
                  transform={`translate(${n} 0)`}
                />
                <path
                  className='dmo-tiers-ink'
                  d={tilePath(matrix, tier)}
                  shapeRendering='crispEdges'
                  transform={`translate(0 ${n})`}
                />
                <path
                  className='dmo-tiers-ink'
                  d={tilePath(matrix, tier)}
                  shapeRendering='crispEdges'
                  transform={`translate(${n} ${n})`}
                />
              </svg>
            );
          })}
        </div>
      </div>
    </Plate>
  );
}
