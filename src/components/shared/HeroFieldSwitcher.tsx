'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import PaperWarpField from '@/components/shared/PaperWarpField';
import { createGlyphField } from '@/lib/glyph-field';
import { createHorizonField } from '@/lib/horizon-field';
import { createPrismaticField } from '@/lib/prismatic-field';
import { createStudioField } from '@/lib/studio-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import './HeroFieldSwitcher.css';

/**
 * WORKING-REVIEW RIG — not product. Mounts the hero band's light field and a
 * quiet instrumentation ladder (mono indices, hairline pill, color only on
 * the active row) that swaps the field live between ten variants, so the
 * founder can compare engines on the real band. Slots 04–08 carry the
 * glyphfield studio materials (the founder's own shader studies, ported in
 * src/lib/studio-field.ts; 07 is the packaged Paper Warp). The pick persists
 * in localStorage under one key shared by every home that carries the rig;
 * the default is 01 — today's prismatic wash — so the shipped look is
 * unchanged until someone switches. Exactly one engine is alive at a time:
 * each switch remounts a fresh stage (keyed) and runs the previous engine's
 * destroy(); the canvas engines share the libraries' own session-singleton
 * GL contexts and the Paper mount loses its context on unmount, so cycling
 * variants never grows the context count.
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
    name: 'line-field',
    // The studio's line study: ruled lines, warped and lit — the house motif.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'lines' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '05',
    name: 'ink-dither',
    // The Bayer print-dither flow — the glyph field's own atlas grammar.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'dither' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '06',
    name: 'grain-wash',
    // Pigment drift with paper tooth: ink rising through the blues.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'grain' });
      return field ? () => field.destroy() : undefined;
    },
  },
  {
    id: '07',
    name: 'paper-warp',
    // The packaged Paper Warp: a ruled stripe field being translated.
    render: (className) => <PaperWarpField className={className} />,
  },
  {
    id: '08',
    name: 'topo-map',
    // Animated contour lines — the cartography of a global network.
    mount: (canvas) => {
      const field = createStudioField(canvas, { preset: 'topo' });
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

/** One stage, one engine: keyed per variant so every switch starts clean. */
function FieldStage({ variant }: { variant: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const def = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];
  const stageClass = `tc-hero-field tch-field hfs-stage${variant === '09' ? ' is-rain' : ''}`;

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
