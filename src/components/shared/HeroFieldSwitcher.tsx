'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import { createStudioField, type StudioPreset } from '@/lib/studio-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import './HeroFieldSwitcher.css';

/**
 * WORKING-REVIEW RIG — not product. Mounts the hero band's field and a
 * quiet instrumentation ladder (mono indices, hairline pill, color only on
 * the active row) that swaps the field live between ten variants, so the
 * founder can compare materials on the real band. The roster is THE BAYER
 * FAMILY — the founder picked 01 bayer dither from the first survey and
 * asked for "a bunch of options based off of this instead": slot 01 is that
 * material untouched, slots 02–10 are nine variations that move along real
 * axes — matrix order (2×2/4×4/8×8), cell scale (poster ↔ near-grain), the
 * tone field under the matrix (flow, contours, flank radials, sweeps,
 * interference, breath), motion, and palette balance (ink-dominant,
 * blue-forward, white-hot). All ten live in src/lib/studio-field.ts. The
 * pick persists in localStorage under one key shared by every home that
 * carries the rig; the default is 02 (bayer-8x8, the founder pick). Exactly one engine is alive at a
 * time: each switch remounts a fresh keyed stage and runs the previous
 * field's destroy(), and every variant draws through the studio library's
 * one session-singleton GL context, so cycling variants never grows the
 * context count.
 */

const STORE_KEY = 'gt-hero-field-variant';

type Variant = {
  id: string;
  name: string;
  preset: StudioPreset;
};

const VARIANTS: readonly Variant[] = [
  {
    id: '01',
    name: 'bayer-flow',
    // THE PICK, byte-identical: the 4×4 ordered matrix over flow-clouds
    // at coarse print cells — the glyph field's own atlas grammar.
    preset: 'bayer',
  },
  {
    id: '02',
    name: 'bayer-8x8',
    // Matrix-order twin: the same flow through an 8×8 matrix at
    // near-grain cells — smooth dithered gradients where 01 steps.
    preset: 'bayer8',
  },
  {
    id: '03',
    name: 'bayer-contour',
    // Quantized elevation bands drifting downslope — the topographic
    // motif as terraced ink.
    preset: 'bayerContour',
  },
  {
    id: '04',
    name: 'bayer-radial',
    // Two radial glows breathing at the FLANKS, centered off the window
    // column; blue-forward palette. The center stays ink by construction.
    preset: 'bayerRadial',
  },
  {
    id: '05',
    name: 'bayer-sweep',
    // Long diagonal beams crossing laminar, broken by a slow pigment
    // churn — the pressroom read, frame counter-rotated from 01.
    preset: 'bayerSweep',
  },
  {
    id: '06',
    name: 'bayer-waves',
    // Two circular wave systems interfering — crests meet as chips,
    // troughs sink to ink; the slowest clock in the family.
    preset: 'bayerWaves',
  },
  {
    id: '07',
    name: 'bayer-chunk',
    // The 2×2 matrix at coarse poster cells — four thresholds, chunky
    // mosaic, the loudest print.
    preset: 'bayerChunk',
  },
  {
    id: '08',
    name: 'bayer-pulse',
    // The flow field inhaling and exhaling on a ~16s clock — near-ink at
    // rest, full bloom at the crest.
    preset: 'bayerPulse',
  },
  {
    id: '09',
    name: 'bayer-ink',
    // Ink-dominant print: tone biased hard toward ground, sparse blue,
    // no bright chip in the palette — the quietest variant.
    preset: 'bayerInk',
  },
  {
    id: '10',
    name: 'bayer-hot',
    // Wandering heat cores lift the crests to pure white through the
    // fine 8×8 screen — the one variant allowed white.
    preset: 'bayerHot',
  },
];

/** One stage, one engine: keyed per variant so every switch starts clean. */
function FieldStage({ variant }: { variant: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const def = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas || !def) return;
    const field = createStudioField(canvas, { preset: def.preset });
    return field ? () => field.destroy() : undefined;
  }, [variant]);

  // The shared classes carry the band's mask, blend and light-theme
  // inversion for every variant alike.
  return <canvas aria-hidden className='tc-hero-field tch-field hfs-stage' key={variant} ref={canvasRef} />;
}

export default function HeroFieldSwitcher() {
  const [variant, setVariant] = useState('02');

  /* The saved pick loads after hydration so SSR and the first client frame
     agree on the 02 default. */
  useMountEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORE_KEY);
      if (saved && VARIANTS.some((v) => v.id === saved)) setVariant(saved);
    } catch {
      /* storage unavailable — the default stands */
    }
  });

  const pick = (id: string) => {
    setVariant(id);
    try {
      window.localStorage.setItem(STORE_KEY, id);
    } catch {
      /* storage unavailable — the pick still applies live */
    }
  };

  return (
    <>
      {/* keyed at the stage: every switch is a full unmount/mount, so the
          outgoing field's destroy always runs before the incoming one draws */}
      <FieldStage key={variant} variant={variant} />
      <div aria-label='Hero field variant (review rig)' className='hfs' role='group'>
        {VARIANTS.map((v) => (
          <button
            className='hfs-chip'
            data-on={variant === v.id}
            key={v.id}
            type='button'
            onClick={() => pick(v.id)}
          >
            <i>{v.id}</i>
            <span>{v.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
