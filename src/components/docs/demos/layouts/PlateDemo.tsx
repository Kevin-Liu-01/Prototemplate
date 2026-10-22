'use client';

import { useState } from 'react';

import { Range, Toggle } from '../controls';
import Plate from '../Plate';

import './shells.css';

/**
 * The plate taken apart, on itself: this plate's own props are the
 * controls under it, so the stage, the corner tag and the night ground
 * change as they are set. The stage lists the three parts with the values
 * they hold right now.
 */
export default function PlateDemo() {
  const [height, setHeight] = useState(260);
  const [night, setNight] = useState(false);
  const [fit, setFit] = useState(false);
  const [bare, setBare] = useState(false);

  const tag = `<Plate height={${height}}${night ? ' night' : ''}${fit ? ' fit' : ''}${bare ? ' bare' : ''} />`;
  const rows: [string, string][] = [
    ['Frame', 'A 1px --pt-hair border on the 6px card corner, around the stage and the controls row.'],
    [
      'Stage',
      fit
        ? 'The content’s own height, padded 52px over and 24px under, so the tag clears it.'
        : `${height}px tall at every width, in ${night ? 'ink in both themes' : 'the docs theme'}.`,
    ],
    ['Tag', bare ? 'Off: the drawing fills the stage edge to edge.' : 'The entry point’s name in the corner, on an opaque chip.'],
    ['Controls', 'This row, under the one --pt-hair rule the plate draws between the two.'],
  ];

  return (
    <Plate
      bare={bare}
      controls={
        <>
          <Range format={(v) => `${v}px`} label='Height' max={420} min={220} step={10} value={height} onChange={setHeight} />
          <Toggle label='Night' pressed={night} onChange={setNight} />
          <Toggle label='Fit' pressed={fit} onChange={setFit} />
          <Toggle label='Bare' pressed={bare} onChange={setBare} />
        </>
      }
      fit={fit}
      height={height}
      label='A plate whose own props are its controls'
      night={night}
      phoneHeight={Math.max(height, 340)}
      stageClassName={fit ? undefined : 'dmo-lay-pl-stage'}
      tag={tag}
    >
      <dl className='dmo-lay-pl'>
        {rows.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Plate>
  );
}
