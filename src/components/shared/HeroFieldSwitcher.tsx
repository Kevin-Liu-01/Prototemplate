'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import { BAYER_DEFAULT_ID, BAYER_PRESETS, createStudioField } from '@/lib/studio-field';
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

/* The roster moved to src/lib/studio-field.ts (BAYER_PRESETS) — the
   codified family, shared with the craft plate's switcher. */
const VARIANTS = BAYER_PRESETS;

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
  const [variant, setVariant] = useState(BAYER_DEFAULT_ID);

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
