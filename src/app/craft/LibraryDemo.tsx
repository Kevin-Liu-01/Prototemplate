'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import BayerDemo from './BayerDemo';
import DitherTextDemo from './DitherTextDemo';
import GlobeDemo from './GlobeDemo';
import IsoDemo from './IsoDemo';
import PillsDemo from './PillsDemo';
import ReassemblerDemo from './ReassemblerDemo';
import SeamDemo from './SeamDemo';
import ThreadsDemo from './ThreadsDemo';
import PrismaticField from '@/components/shared/PrismaticField';
import {
  createDitherLoop,
  gradientRamp,
  multiplyFields,
  streakBands,
  type DitherLoopHandle,
} from '@/lib/dither';
import { createInkField, type InkFieldHandle } from '@/app/d/glyph-rain/sections/band/inkField';
import { createGlyphField, type GlyphFieldHandle } from '@/lib/glyph-field';
import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

export type LibraryDemoKind =
  | 'horizon'
  | 'glyph'
  | 'ink'
  | 'prismatic'
  | 'dither'
  | 'bayer'
  | 'dithertext'
  | 'iso'
  | 'threads'
  | 'globe'
  | 'pills'
  | 'seam'
  | 'reassembler';

/**
 * One live demo plate per library — the page's dark surface in both themes.
 * Lifecycle: no engine mounts until the plate first approaches the viewport
 * (one IntersectionObserver, disconnected after it fires); from then on each
 * engine's own observer pauses its loop off-view, prefers-reduced-motion
 * renders each engine's sanctioned still, and unmount destroys the
 * subscription (the shared WebGL contexts persist for the session by design).
 * Static drawings (the iso kit, the sandwich stroke, the dithered type)
 * and DOM instruments (pills, the seam) render directly — there is
 * nothing to arm.
 */
export default function LibraryDemo({
  kind,
  tag,
  label,
}: {
  kind: LibraryDemoKind;
  /** the mono corner tag — the entry point's own name */
  tag: string;
  /** what the plate shows, for assistive tech */
  label: string;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(false);

  useGSAP(() => {
    const plate = plateRef.current;
    if (!plate) return;
    if (typeof IntersectionObserver === 'undefined') {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: '180px' }
    );
    io.observe(plate);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!armed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (kind === 'horizon') {
        const field: HorizonFieldHandle | null = createHorizonField(canvas, {
          speed: 0.5,
          /* white ink on the plate; exposure above default keeps it quiet */
          params: { ink: [1, 1, 1], exposure: 2.6 },
        });
        /* the documented gotcha, honored: the shader draws nothing until it
           is given a geometry — derive center/radius from the canvas box and
           re-derive on every resize */
        const fit = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (w < 2 || h < 2) return;
          field?.setParams({ center: [w / 2, h / 2], radius: Math.min(w, h) * 0.32 });
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(canvas);
        return () => {
          ro.disconnect();
          field?.destroy();
        };
      }

      if (kind === 'glyph') {
        /* the field draws with the page's own faces, resolved off the canvas;
           copy 'none' — the plate has no copy block, so the rain runs
           full-bleed and the word centers */
        const field: GlyphFieldHandle | null = createGlyphField({
          canvas,
          copy: 'none',
          displayFamily: getComputedStyle(canvas).fontFamily,
          monoFamily: getComputedStyle(canvas).getPropertyValue('--pt-mono').trim() || undefined,
        });
        return () => field?.destroy();
      }

      if (kind === 'ink') {
        /* the rising band material, flooded (no content clearing on a bare
           plate) and set to PLAY: glyphs shiver near the pointer, a click
           bursts the nearest one — the plate is the one interactive mount */
        const field: InkFieldHandle | null = createInkField({
          canvas,
          clearing: 'none',
          interactive: true,
          displayFamily: getComputedStyle(canvas).fontFamily,
        });
        return () => field?.destroy();
      }

      if (kind === 'dither') {
        /* the library's own defaults do the work: white ink, one device
           pixel per cell at scale 3, CSS upscaling it pixelated; a ramp
           multiplied in keeps the plate quiet under its corner tag */
        const loop: DitherLoopHandle = createDitherLoop(
          canvas,
          multiplyFields(
            streakBands({ bands: 18, duty: 0.4, waviness: 0.13, taper: 0.5 }),
            gradientRamp({ angle: Math.PI / 2, from: 0.1, to: 0.85, smooth: true })
          ),
          { scale: 3, paper: 'transparent', fps: 30 }
        );
        return () => loop.destroy();
      }

      return undefined;
    },
    [armed, kind]
  );

  /* the seam is a real slider, the bayer plate a real switch and the
     reassembler carries the hop ladder — groups with interactive
     children, never flattened images */
  const role = kind === 'seam' || kind === 'bayer' || kind === 'reassembler' ? 'group' : 'img';

  return (
    <div aria-label={label} className={`ptc-plate is-${kind}`} ref={plateRef} role={role}>
      {kind === 'prismatic' ? (
        armed ? (
          <PrismaticField
            className='ptc-plate-field'
            params={{ exposureScale: 4200 }}
            preset='2'
            speed={0.5}
          />
        ) : null
      ) : kind === 'globe' ? (
        armed ? (
          <GlobeDemo />
        ) : null
      ) : kind === 'bayer' ? (
        armed ? (
          <BayerDemo />
        ) : null
      ) : kind === 'dithertext' ? (
        <DitherTextDemo />
      ) : kind === 'iso' ? (
        <IsoDemo />
      ) : kind === 'threads' ? (
        <ThreadsDemo />
      ) : kind === 'pills' ? (
        <PillsDemo />
      ) : kind === 'seam' ? (
        <SeamDemo />
      ) : kind === 'reassembler' ? (
        armed ? (
          <ReassemblerDemo />
        ) : null
      ) : (
        <canvas className='ptc-plate-field' ref={canvasRef} aria-hidden='true' />
      )}
      <span className='ptc-plate-tag' aria-hidden='true'>
        {tag}
      </span>
    </div>
  );
}
