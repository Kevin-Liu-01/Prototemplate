'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/* The rain's alphabet: one glyph per writing system the platform ships. */
const GLYPHS = [
  'あ', '한', 'م', 'हि', '中', 'ñ', 'ю', 'ß', 'ไ', 'ع',
  'グ', 'Ω', 'ç', 'ø', 'ま', '文', 'ก', 'ע', 'é', 'ü',
] as const;

type Drop = {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
  glyph: string;
  phase: number;
};

/**
 * Ambient glyph rain for the ink bands: glyphs from twenty scripts fall
 * slowly through the dark, drifting a little toward the band's center as
 * if the hero's mass still had them. Pure decoration — pointer-inert,
 * paused offscreen and under reduced motion (one still frame).
 */
export default function GlyphRain({
  className,
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let drops: Drop[] = [];

    const seed = (i: number): Drop => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 9 + Math.random() * 22,
      size: 11 + Math.random() * 7,
      alpha: (0.1 + Math.random() * 0.22) * intensity,
      glyph: GLYPHS[i % GLYPHS.length] ?? 'あ',
      phase: Math.random() * Math.PI * 2,
    });

    const measure = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      drops = Array.from({ length: Math.min(90, Math.round(w / 16)) }, (_, i) => seed(i));
    };

    const draw = (timeSec: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.textBaseline = 'middle';
      for (const d of drops) {
        d.y += d.speed * dt;
        d.x += Math.sin(timeSec * 0.3 + d.phase) * 0.12 + (w / 2 - d.x) * 0.00022;
        if (d.y > h + 24) {
          d.y = -24;
          d.x = Math.random() * w;
        }
        const edge = Math.min(1, d.y / 90) * Math.min(1, (h - d.y) / 120);
        if (edge <= 0) continue;
        ctx.globalAlpha = d.alpha * Math.max(0, edge);
        ctx.font = `${d.size}px ui-monospace, 'SF Mono', Menlo, monospace`;
        ctx.fillStyle = '#ffffff'; /* the bands are ink in both themes */
        ctx.fillText(d.glyph, d.x, d.y);
      }
      ctx.globalAlpha = 1;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);

    if (reduced) {
      draw(42, 0);
      return () => ro.disconnect();
    }

    let active = true;
    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0] ? entries[0].isIntersecting : true;
      },
      { rootMargin: '120px' }
    );
    io.observe(host);

    let last = gsap.ticker.time;
    const tick = () => {
      const now = gsap.ticker.time;
      const dt = Math.min(now - last, 0.05);
      last = now;
      if (!active || document.hidden) return;
      draw(now, dt);
    };
    gsap.ticker.add(tick);

    return () => {
      ro.disconnect();
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  });

  return <canvas className={className} ref={canvasRef} aria-hidden />;
}
