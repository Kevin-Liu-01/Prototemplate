'use client';

import { useRef } from 'react';

import { mulberry32 } from '@/lib/math';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { onThemeChange } from '@/lib/theme';
import { useMountEffect } from '@/lib/use-mount-effect';

/* Port of the try-gt prototype's ambient hero field: seeded drifting
   glyphs, depth-graded, no assembled word. The shared glyph-field engine
   prints its "language" centerpiece, which collides with this hero's
   heading, so the page carries its own quiet field instead. The loop runs
   at 30 fps only while the field is on screen, holds its last frame when
   it leaves, and re-reads its ink when the theme flips; under reduced
   motion it draws one still. */

const GLYPHS = [
  'l',
  'a',
  'n',
  'g',
  'e',
  't',
  '语',
  '言',
  '文',
  '字',
  'ل',
  'غ',
  'ة',
  'भ',
  'ष',
  'म',
  'न',
  'я',
  'з',
  'ы',
  'к',
  '언',
  '어',
  '한',
  'γ',
  'λ',
  'σ',
  'α',
  'ภ',
  'า',
  'ษ',
];

type Mote = {
  nx: number;
  ny: number;
  size: number;
  alpha: number;
  speed: number;
  amp: number;
  phase: number;
  period: number;
  ch: string;
};

export default function TryField({
  className,
  canvasClassName,
}: {
  className: string;
  canvasClassName: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const hostOrNull = root.current;
    const canvasOrNull = canvasRef.current;
    const ctxOrNull = canvasOrNull?.getContext('2d');
    if (!hostOrNull || !canvasOrNull || !ctxOrNull) return;
    const host: HTMLDivElement = hostOrNull;
    const canvas: HTMLCanvasElement = canvasOrNull;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const reduceMotion = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rand = mulberry32(0x67746c67);
    const motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let count = 0;
    let raf = 0;
    let last = 0;
    /** the time of the frame on the canvas, redrawn when a resize or a theme flip lands while the loop is stopped */
    let shown = 0;
    /* resize() runs before any draw and reads the real ink and face from
       the host's computed style, so no literal placeholder is needed. */
    let ink = '';
    let family = 'sans-serif';

    function makeMote(): Mote {
      const depth = Math.pow(rand(), 0.82);
      return {
        nx: rand(),
        ny: rand(),
        size: depth < 0.14 ? 19 : depth < 0.6 ? 13 : 11,
        alpha: Math.min(0.36, (((1 - 0.6 * depth) * 48) / 255) * 1.9),
        speed: 2.2 + (1 - depth) * 7.5,
        amp: 1.5 + (1 - depth) * 2.5,
        phase: rand() * Math.PI * 2,
        period: 7000 + rand() * 8000,
        ch: GLYPHS[(rand() * GLYPHS.length) | 0] ?? 'a',
      };
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      for (let i = 0; i < count; i++) {
        const g = motes[i];
        if (!g) continue;
        const y = (((g.ny * h - (t / 1000) * g.speed) % h) + h) % h;
        const x =
          g.nx * w + Math.sin((t / g.period) * Math.PI * 2 + g.phase) * g.amp;
        ctx.globalAlpha = g.alpha;
        ctx.font = `500 ${g.size}px ${family}`;
        ctx.fillText(g.ch, x, y);
      }
      ctx.globalAlpha = 1;
    }

    function readStyle() {
      const styles = getComputedStyle(host);
      ink = styles.color;
      family = styles.fontFamily;
    }

    /* Resizes only re-project: motes keep normalized positions, so the
       field never visibly resets. */
    function resize() {
      const box = canvas.getBoundingClientRect();
      const nw = Math.max(1, box.width);
      const nh = Math.max(1, box.height);
      readStyle();
      if (count && Math.abs(nw - w) < 1 && Math.abs(nh - h) < 1) return;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.min(320, Math.max(60, Math.round((w * h) / 7000)));
      while (motes.length < count) motes.push(makeMote());
      /* setting the canvas size cleared it: a stopped field draws its frame again */
      if (!raf && (reduceMotion || shown > 0)) draw(shown);
    }

    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (t - last < 33) return;
      last = t;
      shown = t;
      draw(t);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const presence = new IntersectionObserver(([entry]) => {
      if (reduceMotion) return;
      if (entry?.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    presence.observe(host);

    const stopTheme = onThemeChange(() => {
      readStyle();
      if (!raf && (reduceMotion || shown > 0)) draw(shown);
    });

    return () => {
      observer.disconnect();
      presence.disconnect();
      stopTheme();
      if (raf) cancelAnimationFrame(raf);
    };
  });

  return (
    <div className={className} ref={root} aria-hidden='true'>
      <canvas className={canvasClassName} ref={canvasRef} />
    </div>
  );
}
