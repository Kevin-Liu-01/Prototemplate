'use client';

import { useRef, type PointerEvent } from 'react';

/**
 * The two faces of one site — the toolchain home and the singularity
 * enterprise page — overlaid, with the house doubled-thread seam between
 * them. Drag anywhere on the stage (or use the hidden range control) to
 * sweep back and forth; the seam position lives in a CSS var so nothing
 * re-renders while it moves.
 */
export default function SiteCompare({ slug, name }: { slug: string; name: string }) {
  const box = useRef<HTMLDivElement>(null);

  const set = (pct: number) => {
    const el = box.current;
    if (!el) return;
    const v = Math.min(100, Math.max(0, pct));
    el.style.setProperty('--cut', `${v}%`);
    const input = el.querySelector('input');
    if (input) input.value = String(Math.round(v));
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    set(((e.clientX - r.left) / r.width) * 100);
  };

  return (
    <div className='pt-compare' ref={box} style={{ ['--cut' as never]: '55%' }}>
      <div
        className='pt-compare-stage'
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) fromPointer(e);
        }}
      >
        {/* draggable=false everywhere: one native image-drag would steal the
            pointer stream and freeze the seam mid-sweep */}
        <span className='pt-compare-face is-ent' aria-hidden>
          <img alt='' className='is-light' draggable={false} loading='lazy' src={`/shots/light/${slug}-enterprise.jpg`} />
          <img alt='' className='is-dark' draggable={false} loading='lazy' src={`/shots/dark/${slug}-enterprise.jpg`} />
        </span>
        <span className='pt-compare-face is-home' aria-hidden>
          <img alt='' className='is-light' draggable={false} loading='lazy' src={`/shots/light/${slug}.jpg`} />
          <img alt='' className='is-dark' draggable={false} loading='lazy' src={`/shots/dark/${slug}.jpg`} />
        </span>
        <span className='pt-compare-seam' aria-hidden />
        <span className='pt-compare-tag is-home'>home</span>
        <span className='pt-compare-tag is-ent'>enterprise</span>
        <input
          type='range'
          min={0}
          max={100}
          defaultValue={55}
          aria-label={`Sweep between the ${name} home and enterprise pages`}
          onChange={(e) => set(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
