'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import { createGlyphField, type GlyphFieldHandle } from '@/lib/glyph-field';
import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

export type LibraryDemoKind = 'horizon' | 'glyph' | 'prismatic';

/**
 * One live demo plate per library — the page's dark surface in both themes.
 * Lifecycle: nothing mounts until the plate first approaches the viewport
 * (one IntersectionObserver, disconnected after it fires); from then on each
 * engine's own observer pauses its loop off-view, prefers-reduced-motion
 * renders each engine's sanctioned still, and unmount destroys the
 * subscription (the shared WebGL contexts persist for the session by design).
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
        /* the field draws with the page's own faces, resolved off the canvas */
        const field: GlyphFieldHandle | null = createGlyphField({
          canvas,
          displayFamily: getComputedStyle(canvas).fontFamily,
          monoFamily: getComputedStyle(canvas).getPropertyValue('--pt-mono').trim() || undefined,
        });
        return () => field?.destroy();
      }

      return undefined;
    },
    [armed, kind]
  );

  return (
    <div className={`ptc-plate is-${kind}`} ref={plateRef} role='img' aria-label={label}>
      {kind === 'prismatic' ? (
        armed ? (
          <PrismaticField
            className='ptc-plate-field'
            params={{ exposureScale: 4200 }}
            preset='2'
            speed={0.5}
          />
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
