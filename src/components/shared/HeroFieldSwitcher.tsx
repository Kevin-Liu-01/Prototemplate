'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import PaperGodRaysField from '@/components/shared/PaperGodRaysField';
import { createPrismaticField } from '@/lib/prismatic-field';
import { createStudioField } from '@/lib/studio-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import './HeroFieldSwitcher.css';

/**
 * WORKING-REVIEW RIG — not product. Mounts the hero band's light field and a
 * quiet instrumentation ladder (mono indices, hairline pill, color only on
 * the active row) that swaps the field live between ten variants, so the
 * founder can compare engines on the real band. The roster follows the
 * founder's strategy call — "dither is probably the strat": slots 01–05 are
 * five genuinely distinct DITHER patterns (print in the house inks, kin to
 * the glyph field's Bayer atlas), slots 06–10 are five LIGHT washes
 * (prismatic-adjacent flowing light, each a different pattern). The studio
 * materials are the founder's own glyphfield shader studies, ported in
 * src/lib/studio-field.ts; 09 is the packaged Paper God Rays. The pick
 * persists in localStorage under one key shared by every home that carries
 * the rig; the default is 01 — the Bayer flow, the dither that reads best
 * on the dossier band. Exactly one engine is alive at a time: each switch
 * remounts a fresh stage (keyed) and runs the previous engine's destroy();
 * the canvas engines share the libraries' own session-singleton GL contexts
 * and the Paper mount loses its context on unmount, so cycling variants
 * never grows the context count.
 */

const STORE_KEY = 'gt-hero-field-variant';

type Cleanup = () => void;

type Variant = {
  id: string;
  name: string;
  /** Canvas-engine variants mount a house engine onto the keyed canvas… */
  mount?: (canvas: HTMLCanvasElement) => Cleanup | undefined;
  /** …component variants render their own stage (the packaged Paper Warp). */
  render?: (className: string) => React.ReactElement;
};

const VARIANTS: readonly Variant[] = [
  /* — 01–05: the dither family (print) — */
  {
    id: '01',
    name: 'bayer-flow',
    // The 4×4 ordered matrix over a flowing tone field, at coarse print
    // cells — the glyph field's own atlas grammar, and the default.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'bayer' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '02',
    name: 'film-grain',
    // The same pigment flow through per-cell white-noise thresholds at
    // near-pixel scale — film stock, reseeded on a slow flicker clock.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'film' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '03',
    name: 'halftone-drift',
    // A rotated dot screen (the 14° printer's angle) whose dot gauge
    // carries the drifting tone — print's own screen.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'halftone' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '04',
    name: 'diffusion-ink',
    // Error-diffusion's organic read: serpentine value-noise thresholds
    // clustering the ink into worms instead of ordered cells.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'diffusion' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '05',
    name: 'contour-dither',
    // Topographic elevation lines pushed through the Bayer matrix — the
    // ruled-line motif rendered as dithered ink density.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'contour' });
      return field ? () => field.destroy() : undefined;
    },
  },
  /* — 06–10: the light family (washes) — */
  {
    id: '06',
    name: 'prismatic',
    // Yesterday's shipped look, verbatim: the toolchain hero's field —
    // it earns its light slot.
    mount: (canvas) => {
      const field = createPrismaticField(canvas, { preset: '1', speed: 0.5, params: { exposureScale: 3400 } });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '07',
    name: 'spectral-bloom',
    // The studio's featured bloom: soft currents converging into one
    // luminous field, blues under a white crest.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'spectral' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '08',
    name: 'mesh-wash',
    // Two orbiting focal blues breathing over the ink — the quietest wash.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'mesh' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '09',
    name: 'god-rays',
    // The packaged Paper God Rays: soft volumetric light spilling from
    // above the band, translucent blues rolling to white.
    render: (className) => <PaperGodRaysField className={className} />,
  },
  {
    id: '10',
    name: 'aurora',
    // The studio's aurora: curtain bands moving through a deep field.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'aurora' });
      return field ? () => field.destroy() : undefined;
    },
  },
];

/** One stage, one engine: keyed per variant so every switch starts clean. */
function FieldStage({ variant }: { variant: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const def = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];
  const stageClass = 'tc-hero-field tch-field hfs-stage';

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return def?.mount?.(canvas);
  }, [variant]);

  // Component variants own their stage; the shared classes still carry the
  // band's mask, blend and light-theme inversion.
  if (def?.render) return def.render(stageClass);

  return <canvas aria-hidden className={stageClass} key={variant} ref={canvasRef} />;
}

export default function HeroFieldSwitcher() {
  const [variant, setVariant] = useState('01');

  /* The saved pick loads after hydration so SSR and the first client frame
     agree on the 01 default. */
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
          outgoing engine's destroy (or the Paper context release) always
          runs before the incoming engine draws */}
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
