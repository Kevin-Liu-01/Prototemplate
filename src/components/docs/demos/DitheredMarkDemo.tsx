'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useId, useRef, useState } from 'react';

import DitheredMark, { shineTravel, type ShineCover } from '@/app/d/toolchain/diagrams/DitheredMark';
import { ISO_COS30, ISO_SIN30, plane } from '@/app/d/toolchain/diagrams/iso';
import { REFERENCE_MARK } from '@/lib/marks';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

gsap.registerPlugin(useGSAP);

type Seat = 'flat' | 'iso';
type Glint = 'ink' | 'accent';

/* the GT mark's outline (REFERENCE_MARK, the path GtMark.tsx draws), filled white inside the alpha mask */
const [VX, VY, VW, VH] = REFERENCE_MARK.viewBox.split(' ').map(Number) as [number, number, number, number];
const MARK_W = 150;
const S = MARK_W / VW;
const MARK_H = VH * S;

/** The mark centered on the origin of its seat, in the seat's own units. */
function MarkShape() {
  return (
    <path
      d={REFERENCE_MARK.d}
      fill='white'
      fillRule='evenodd'
      transform={`translate(${-MARK_W / 2} ${-MARK_H / 2}) scale(${S}) translate(${-VX} ${-VY})`}
    />
  );
}

/** The screen rect a seat's mark covers, padded, for the masked rects and the sweep. */
function coverOf(seat: Seat): ShineCover {
  const hw = MARK_W / 2 + 4;
  const hh = MARK_H / 2 + 4;
  if (seat === 'flat') return { x: -hw, y: -hh, w: hw * 2, h: hh * 2 };
  /* the iso plane maps plan (x, y) to (cos30 (x - y), sin30 (x + y)) */
  const corners = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ].map(([x = 0, y = 0]) => [ISO_COS30 * (x - y), ISO_SIN30 * (x + y)] as const);
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * DitheredMark, live: a mark held as an alpha mask with a specular band
 * swept through it, quantized by the 4x4 ordered Bayer screen into five
 * nested coverage tiers. The cells never move; two clip windows carry the
 * light across them, the counter-sheen half a lap behind. The host drives
 * the sweep: here one GSAP tween per band from shineTravel()'s endpoints,
 * at a constant speed in drawing units per second. Under reduced motion
 * the markup pose stays: the primary band mid-glyph, the counter-sheen
 * parked clear.
 */
export default function DitheredMarkDemo() {
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const root = useRef<SVGSVGElement>(null);
  const [seat, setSeat] = useState<Seat>('flat');
  const [glint, setGlint] = useState<Glint>('ink');
  const [speed, setSpeed] = useState(56);
  const [still, setStill] = useState(false);
  const cover = coverOf(seat);
  const half = Math.max(MARK_W, MARK_H) / 2;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || still || reduced) return;
      const { from, to } = shineTravel(cover);
      const lap = (to - from) / speed;
      const band = (attr: string) =>
        gsap.fromTo(
          el.querySelectorAll<SVGPathElement>(`[${attr}]`),
          { x: from },
          { x: to, duration: lap, ease: 'none', repeat: -1 }
        );
      const a = band('data-dmo-stripe');
      const b = band('data-dmo-stripe2').time(lap / 2);
      return () => {
        a.kill();
        b.kill();
        gsap.set(el.querySelectorAll('[data-dmo-stripe], [data-dmo-stripe2]'), { clearProps: 'transform' });
      };
    },
    { dependencies: [seat, speed, still, reduced], revertOnUpdate: true }
  );

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Seat'
            options={[
              { value: 'flat', label: 'Flat' },
              { value: 'iso', label: 'Iso plane' },
            ]}
            value={seat}
            onChange={setSeat}
          />
          <Choice
            label='Glint'
            options={[
              { value: 'ink', label: 'Ink' },
              { value: 'accent', label: 'Accent' },
            ]}
            value={glint}
            onChange={setGlint}
          />
          <Range format={(v) => `${v} units/s`} label='Sweep speed' max={160} min={16} step={4} value={speed} onChange={setSpeed} />
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={still || reduced}
            title='Show the pose a reader with reduced motion sees'
            onChange={setStill}
          />
        </>
      }
      height={280}
      label='The GT mark as masked ink with a dithered shine sweeping through it'
      moves
      phoneHeight={220}
      stageClassName={`dmo-shine is-${glint}`}
      tag='<DitheredMark maskContent={…} plane={…} />'
    >
      <svg aria-hidden='true' className='dmo-shine-svg' ref={root} viewBox='-130 -86 260 172'>
        <DitheredMark
          cover={cover}
          glintClassName='dmo-shine-glint'
          id={`${uid}-${seat}`}
          inkClassName='dmo-shine-ink'
          key={seat}
          markHalf={half}
          maskBox={{ x: -130, y: -86, w: 260, h: 172 }}
          maskContent={<MarkShape />}
          plane={seat === 'flat' ? 'translate(0 0)' : plane(0)}
          shineClassName='dmo-shine-band'
          stripeData={['data-dmo-stripe', 'data-dmo-stripe2']}
        />
      </svg>
    </Plate>
  );
}
