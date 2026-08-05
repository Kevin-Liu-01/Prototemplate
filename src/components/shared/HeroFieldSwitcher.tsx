'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import { createGlyphField } from '@/lib/glyph-field';
import { createHorizonField } from '@/lib/horizon-field';
import { createPrismaticField } from '@/lib/prismatic-field';
import { createRayField } from '@/lib/ray-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import './HeroFieldSwitcher.css';

/**
 * WORKING-REVIEW RIG — not product. Mounts the hero band's light field and a
 * quiet instrumentation ladder (mono indices, hairline pill, color only on
 * the active row) that swaps the field live between ten variants, so the
 * founder can compare engines on the real band. The pick persists in
 * localStorage under one key shared by every home that carries the rig; the
 * default is 01 — today's prismatic wash — so the shipped look is unchanged
 * until someone switches. Exactly one engine is alive at a time: each switch
 * remounts a fresh canvas (keyed) and runs the previous engine's destroy();
 * the underlying GL contexts are the libraries' own session singletons, so
 * cycling variants never grows the context count.
 */

const STORE_KEY = 'gt-hero-field-variant';

type Cleanup = () => void;

type Variant = {
  id: string;
  name: string;
  mount: (canvas: HTMLCanvasElement) => Cleanup | undefined;
};

const VARIANTS: readonly Variant[] = [
  {
    id: '01',
    name: 'prismatic-1',
    // Today's mount, verbatim: the toolchain hero's field.
    mount: (canvas) => {
      const field = createPrismaticField(canvas, { preset: '1', speed: 0.5, params: { exposureScale: 3400 } });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '02',
    name: 'prismatic-2',
    mount: (canvas) => {
      const field = createPrismaticField(canvas, { preset: '2', speed: 0.5, params: { exposureScale: 2600 } });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '03',
    name: 'prismatic-bright',
    mount: (canvas) => {
      const field = createPrismaticField(canvas, { preset: '1', speed: 0.5, params: { exposureScale: 1800 } });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '04',
    name: 'rays-converge',
    mount: (canvas) => {
      const field = createRayField(canvas, { preset: 'converge' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '05',
    name: 'rays-shafts',
    mount: (canvas) => {
      const field = createRayField(canvas, { preset: 'shafts' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '06',
    name: 'rays-horizon',
    mount: (canvas) => {
      const field = createRayField(canvas, { preset: 'horizon' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '07',
    name: 'rays-dense',
    mount: (canvas) => {
      const field = createRayField(canvas, {
        preset: 'converge',
        params: {
          rayCount: 34,
          randomness: 0.12,
          pulseWidth: 0.055,
          trailLength: 0.5,
          motionBlur: 0.55,
          exposure: 1.35,
        },
      });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '08',
    name: 'rays-quiet',
    mount: (canvas) => {
      const field = createRayField(canvas, {
        preset: 'shafts',
        params: {
          rayCount: 9,
          pulseSpeed: 0.09,
          pulseCount: 2,
          pulseBrightness: 2.2,
          colorMix: 0.15,
          glow: 0.5,
          exposure: 1.25,
        },
      });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '09',
    name: 'glyph-rain',
    // The house rain at band intensity; it inks itself from --tc-ink resolved
    // off the canvas (pinned white by .is-rain) and self-sizes internally.
    mount: (canvas) => {
      const field = createGlyphField({ canvas, glyphScale: 0.9 });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '10',
    name: 'horizon',
    // createHorizonField draws NOTHING until it is given geometry — the
    // ResizeObserver feeds center/radius, seating the horizon on the left
    // flank so the window column stays clear.
    mount: (canvas) => {
      const field = createHorizonField(canvas, {
        params: {
          ink: [1, 1, 1],
          ruleAlpha: 0.05,
          ringAlpha: [0.07, 0.05, 0.03],
          lightGain: 1.5,
          exposure: 2.2,
          chroma: 0.4,
          core: [0.008, 0.01, 0.016],
        },
      });
      if (!field) return undefined;
      const seat = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        field.setParams({
          center: [w * 0.22, h * 0.55],
          radius: Math.min(h * 0.34, w * 0.15),
          worldOrigin: [0, 0],
        });
      };
      seat();
      let ro: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(seat);
        ro.observe(canvas);
      }
      return () => {
        ro?.disconnect();
        field.destroy();
      };
    },
  },
];

/** One canvas, one engine: keyed per variant so every switch starts clean. */
function FieldStage({ variant }: { variant: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const def = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];
    return def?.mount(canvas);
  }, [variant]);

  return (
    <canvas
      aria-hidden
      className={`tc-hero-field tch-field hfs-stage${variant === '09' ? ' is-rain' : ''}`}
      key={variant}
      ref={canvasRef}
    />
  );
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
      <FieldStage variant={variant} />
      <div aria-label='Hero field variant (review rig)' className='hfs' role='group'>
        {VARIANTS.map((v) => (
          <button
            className='hfs-chip'
            data-on={variant === v.id}
            key={v.id}
            onClick={() => pick(v.id)}
            type='button'
          >
            <i>{v.id}</i>
            <span>{v.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
