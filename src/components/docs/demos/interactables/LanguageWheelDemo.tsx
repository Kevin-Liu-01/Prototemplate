'use client';

import { useState } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';

import { Choice, Range, Toggle } from '../controls';
import Plate from '../Plate';

import './interactables.css';

type Size = '180' | '244' | '300';

/* language names in their own scripts: the band the lens bends */
const BAND = ['Español', '日本語', 'العربية', 'हिन्दी', '한국어', 'Deutsch', 'עברית', 'Русский', 'ไทย', '中文'] as const;

/**
 * LanguageWheel, live on an ink stage: the machined bezel, the bright arc
 * that laps the dial, the script glyphs that orbit and sink toward it, and
 * the GT mark at the center. Lap sets the seconds per revolution and Arc
 * the share of the ring the arc covers. The lens stacks three
 * backdrop-filter shells, so a band of language names runs behind the
 * wheel for it to bend. Size remounts the wheel, since the orbit radii are
 * read from the dial's width when it mounts.
 */
export default function LanguageWheelDemo() {
  const [lap, setLap] = useState(3.6);
  const [sweep, setSweep] = useState(17);
  const [orbit, setOrbit] = useState(true);
  const [lens, setLens] = useState(true);
  const [size, setSize] = useState<Size>('244');

  return (
    <Plate
      controls={
        <>
          <Range format={(value) => `${value.toFixed(1)} s`} label='Lap' max={8} min={1.2} step={0.2} value={lap} onChange={setLap} />
          <Range format={(value) => `${value}%`} label='Arc' max={60} min={5} step={1} value={sweep} onChange={setSweep} />
          <Choice
            label='Size'
            options={[
              { value: '180', label: '180px' },
              { value: '244', label: '244px' },
              { value: '300', label: '300px' },
            ]}
            value={size}
            onChange={setSize}
          />
          <Toggle label='Orbit' pressed={orbit} title='The script glyphs that orbit the dial' onChange={setOrbit} />
          <Toggle label='Lens' pressed={lens} title='The three backdrop-filter shells' onChange={setLens} />
        </>
      }
      height={420}
      label='The language wheel with its arc, its orbiting glyphs and the GT mark'
      lazy
      moves
      night
      phoneHeight={380}
      stageClassName={`ixa-wheel is-${size}`}
      tag={`<LanguageWheel arcDuration={${lap.toFixed(1)}} arcSweep={${sweep}} />`}
    >
      <p aria-hidden='true' className='ixa-wheel-band'>
        {BAND.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </p>
      <LanguageWheel
        arcDuration={lap}
        arcSweep={sweep}
        className='ixa-wheel-dial'
        key={size}
        lens={lens}
        orbit={orbit}
        size={Number(size)}
      />
    </Plate>
  );
}
