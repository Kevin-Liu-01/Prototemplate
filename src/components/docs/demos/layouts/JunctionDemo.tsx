'use client';

import { useState } from 'react';

import { Choice, Toggle } from '../controls';
import Plate from '../Plate';

import './rails.css';

type Seam = 'hatch' | 'section' | 'both' | 'overlap' | 'neither';

/* the crop: 28 by 18 pixels around the point where a seam meets the column's left line */
const COLS = 28;
const ROWS = 18;
const RAIL_X = 8;
/* the section's last row; the hatch spacer starts on the next */
const SEAM_Y = 8;
const HATCH_Y = SEAM_Y + 1;

type CropProps = { seam: Seam; clip: boolean; cross: boolean; grid: boolean };

/**
 * The crop, one SVG unit per CSS pixel, painted in the order the page
 * paints: the paper, the spacer's diagonals, the rules, the rail and the
 * cross. Every fill is a token, so translucent strokes composite in the
 * browser exactly as two borders on one seam would, in either theme.
 */
function Crop({ seam, clip, cross, grid }: CropProps) {
  const sectionRule = seam === 'section' || seam === 'both';
  const hatchRule = seam === 'hatch' || seam === 'both' || seam === 'overlap';
  /* without background-clip: padding-box the spacer's ground runs under its own rule */
  const groundTop = clip && hatchRule ? HATCH_Y + 1 : HATCH_Y;
  const diagonals: [number, number][] = [];
  for (let y = groundTop; y < ROWS; y += 1) {
    for (let x = RAIL_X + 1; x < COLS; x += 1) if ((((x - y) % 8) + 8) % 8 === 0) diagonals.push([x, y]);
  }
  const crossY = sectionRule && !hatchRule ? SEAM_Y : HATCH_Y;
  const inner = COLS - RAIL_X - 1;
  return (
    <>
      <rect className='dmo-lay-jx-paper' height={ROWS} width={COLS} />
      {diagonals.map(([x, y]) => (
        <rect className='dmo-lay-jx-hatch' height={1} key={`${x}-${y}`} width={1} x={x} y={y} />
      ))}
      {sectionRule ? <rect className='dmo-lay-jx-hair' height={1} width={inner} x={RAIL_X + 1} y={SEAM_Y} /> : null}
      {hatchRule ? <rect className='dmo-lay-jx-hair' height={1} width={inner} x={RAIL_X + 1} y={HATCH_Y} /> : null}
      {seam === 'overlap' ? <rect className='dmo-lay-jx-hair' height={1} width={inner} x={RAIL_X + 1} y={HATCH_Y} /> : null}
      <rect className='dmo-lay-jx-hair' height={ROWS} width={1} x={RAIL_X} y={0} />
      {cross && seam !== 'neither' ? (
        <>
          <rect className='dmo-lay-jx-cross' height={1} width={9} x={RAIL_X - 4} y={crossY} />
          <rect className='dmo-lay-jx-cross' height={4} width={1} x={RAIL_X} y={crossY - 4} />
          <rect className='dmo-lay-jx-cross' height={4} width={1} x={RAIL_X} y={crossY + 1} />
        </>
      ) : null}
      {grid ? (
        <path
          className='dmo-lay-jx-grid'
          d={[
            ...Array.from({ length: COLS - 1 }, (_, i) => `M${i + 1} 0V${ROWS}`),
            ...Array.from({ length: ROWS - 1 }, (_, i) => `M0 ${i + 1}H${COLS}`),
          ].join('')}
        />
      ) : null}
    </>
  );
}

const VERDICT: Record<Seam, (clip: boolean) => string> = {
  hatch: (clip) =>
    clip
      ? 'One rule, drawn by the hatch spacer. The section above draws none.'
      : 'Self-stack: the spacer paints its diagonals under its own rule, so the rule darkens where a diagonal crosses it.',
  section: () => 'One rule, drawn by the section. The spacer draws no top edge, as the hub article’s spacer does.',
  both: () => 'Doubled: two owners draw one seam on adjacent rows, and it reads as a 2px band.',
  overlap: () => 'Coincident: two strokes land on one row and composite darker than the structural hairline.',
  neither: () => 'Missing seam: nothing closes the junction, and the section runs into the spacer.',
};

/**
 * One junction under magnification: the column's left line, a section
 * above and a hatch spacer below. Seam picks who draws the rule, and each
 * of the auditor's defect classes (doubled, coincident, missing and
 * self-stacked lines) has a setting. The inset at the corner is the same
 * crop at its real size.
 */
export default function JunctionDemo() {
  const [seam, setSeam] = useState<Seam>('hatch');
  const [clip, setClip] = useState(true);
  const [cross, setCross] = useState(true);
  const verdict = VERDICT[seam](clip);

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Seam'
            options={[
              { value: 'hatch', label: 'Spacer' },
              { value: 'section', label: 'Section' },
              { value: 'both', label: 'Both' },
              { value: 'overlap', label: 'Overlap' },
              { value: 'neither', label: 'Neither' },
            ]}
            value={seam}
            onChange={setSeam}
          />
          <Toggle label='Clip Ground' pressed={clip} onChange={setClip} />
          <Toggle label='Cross' pressed={cross} onChange={setCross} />
          <p aria-live='polite' className='dmo-bar-status'>
            {verdict}
          </p>
        </>
      }
      fit
      label={`A seam between a section and a hatch spacer at the column's line, magnified. ${verdict}`}
      stageClassName='dmo-lay-stage'
      tag={`${COLS} × ${ROWS} px`}
    >
      <div className='dmo-lay-jx'>
        <svg aria-hidden='true' className='dmo-lay-jx-svg' shapeRendering='crispEdges' viewBox={`0 0 ${COLS} ${ROWS}`}>
          <Crop clip={clip} cross={cross} grid seam={seam} />
        </svg>
        <span className='dmo-lay-jx-chip is-tl'>Margin</span>
        <span className='dmo-lay-jx-chip is-tr'>Section</span>
        <span className='dmo-lay-jx-chip is-br'>Hatch spacer</span>
        <span className='dmo-lay-jx-real'>
          <svg aria-hidden='true' height={ROWS} shapeRendering='crispEdges' viewBox={`0 0 ${COLS} ${ROWS}`} width={COLS}>
            <Crop clip={clip} cross={cross} grid={false} seam={seam} />
          </svg>
          <span>1:1</span>
        </span>
      </div>
    </Plate>
  );
}
