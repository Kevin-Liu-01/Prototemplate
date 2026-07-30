'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import {
  laneReach,
  lensPulse,
  PAIR_ITEMS,
  placeOnLane,
  type PairCopy,
  type PairItem,
  type PairKind,
} from '../lib/hero-stream';

gsap.registerPlugin(useGSAP);

/** Where along the lane the right-hand card re-letters itself. */
const MORPH_START = 0.11;
const MORPH_SPAN = 0.19;

export function PairCardBody({ kind, copy }: { kind: PairKind; copy: PairCopy }) {
  switch (kind) {
    case 'button':
      return <span className='kv-c-btn'>{copy.primary}</span>;
    case 'toast':
      return (
        <span className='kv-c-toast'>
          <span className='kv-c-ok'>✓</span>
          {copy.primary}
        </span>
      );
    case 'field':
      return (
        <>
          <span className='kv-c-label'>{copy.primary}</span>
          <span className='kv-c-input'>{copy.secondary}</span>
        </>
      );
    case 'price':
      return <span className='kv-c-price'>{copy.primary}</span>;
    case 'nav':
      return <span className='kv-c-nav'>{copy.primary}</span>;
    case 'line':
      return <span className='kv-c-line'>{copy.primary}</span>;
  }
}

type Side = 'src' | 'out';

function PairCard({ item, side }: { item: PairItem; side: Side }) {
  return (
    <div className='kv-lane' data-lane={side} data-item={item.id}>
      <div className={`kv-card kv-card-${item.kind}`} data-card>
        <div className='kv-card-layer' data-layer='en'>
          <PairCardBody kind={item.kind} copy={item.en} />
        </div>
        <div
          className='kv-card-layer kv-card-layer-tr'
          data-layer='tr'
          lang={item.lang}
          dir={item.rtl ? 'rtl' : undefined}
        >
          <PairCardBody kind={item.kind} copy={item.translated} />
        </div>
      </div>
    </div>
  );
}

type Measured = { widthEn: number; heightEn: number; widthTr: number; heightTr: number };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smooth = (n: number) => n * n * (3 - 2 * n);

/**
 * M1 — the paired stream, in the light's own perspective.
 *
 * Each pair is emitted from the mark on two mirrored lanes and travels
 * outward. Both instances are always at the same distance, so the English on
 * the left and its translation on the right sit at matching offsets and can be
 * read as one line across the dial. Depth is real: distance drives z, and the
 * stage's perspective turns that into scale — small, soft and dim at the mark,
 * large, sharp and opaque out at the frame edge, where a viewer actually
 * reads it.
 */
export default function PairStream() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const srcs = gsap.utils.toArray<HTMLElement>('[data-lane="src"]', host);
      const outs = gsap.utils.toArray<HTMLElement>('[data-lane="out"]', host);

      const measure = (wrapper: HTMLElement): Measured | null => {
        const card = wrapper.querySelector<HTMLElement>('[data-card]');
        const en = wrapper.querySelector<HTMLElement>('[data-layer="en"]');
        const tr = wrapper.querySelector<HTMLElement>('[data-layer="tr"]');
        if (!card || !en || !tr) return null;
        card.style.width = '';
        card.style.height = '';
        const widthEn = card.offsetWidth;
        const heightEn = card.offsetHeight;
        en.style.display = 'none';
        tr.style.position = 'static';
        const widthTr = card.offsetWidth;
        const heightTr = card.offsetHeight;
        en.style.display = '';
        tr.style.position = '';
        card.style.width = `${widthEn}px`;
        card.style.height = `${heightEn}px`;
        return { widthEn, heightEn, widthTr, heightTr };
      };

      let reach = laneReach(host.clientWidth / 2 || 560);

      const tracks = PAIR_ITEMS.map((item, i) => ({
        item,
        src: srcs[i],
        out: outs[i],
        srcCard: srcs[i]?.querySelector<HTMLElement>('[data-card]') ?? null,
        outCard: outs[i]?.querySelector<HTMLElement>('[data-card]') ?? null,
        srcSize: srcs[i] ? measure(srcs[i]) : null,
        outSize: outs[i] ? measure(outs[i]) : null,
        u: item.phase,
        emitted: true,
      }));

      const paint = (
        wrapper: HTMLElement | undefined,
        card: HTMLElement | null,
        item: PairItem,
        u: number,
        side: Side,
        size: Measured | null
      ) => {
        if (!wrapper) return;
        const mirror = side === 'src' ? -1 : 1;
        const p = placeOnLane(u, item.lane, reach);

        /* Legible for most of the run: it ramps up out of the mark, holds, and
           only lets go right at the frame edge. */
        const alpha = Math.min(clamp01(u / 0.15), clamp01((1 - u) / 0.1));
        const focus = clamp01(u / 0.34);

        wrapper.style.opacity = alpha.toFixed(3);
        wrapper.style.zIndex = u < 0.3 ? '1' : '3';
        wrapper.style.transform =
          `translate3d(${(p.x * mirror).toFixed(1)}px, ${p.y.toFixed(1)}px, ${p.z.toFixed(1)}px) ` +
          `translate(-50%, -50%)`;
        wrapper.style.filter =
          `blur(${((1 - focus) * 2.8).toFixed(2)}px) ` +
          `brightness(${(0.7 + focus * 0.34).toFixed(2)}) contrast(${(0.86 + focus * 0.22).toFixed(2)})`;

        if (!card) return;
        const mix = side === 'out' ? smooth(clamp01((u - MORPH_START) / MORPH_SPAN)) : 0;
        const en = card.querySelector<HTMLElement>('[data-layer="en"]');
        const tr = card.querySelector<HTMLElement>('[data-layer="tr"]');
        if (en) en.style.opacity = (1 - mix).toFixed(3);
        if (tr) tr.style.opacity = mix.toFixed(3);
        if (size) {
          card.style.width = `${(size.widthEn + (size.widthTr - size.widthEn) * mix).toFixed(1)}px`;
          card.style.height = `${(size.heightEn + (size.heightTr - size.heightEn) * mix).toFixed(1)}px`;
        }
      };

      const step = (dt: number) => {
        for (const track of tracks) {
          if (dt > 0) {
            track.u += dt / track.item.duration;
            while (track.u >= 1) {
              track.u -= 1;
              lensPulse.charge = 1;
            }
          }
          paint(track.src, track.srcCard, track.item, track.u, 'src', track.srcSize);
          paint(track.out, track.outCard, track.item, track.u, 'out', track.outSize);
        }
      };

      step(0);
      if (reduced) return;

      let visible = true;
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      });
      observer.observe(host);

      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        step(Math.min(deltaMs, 60) / 1000);
      };
      gsap.ticker.add(tick);

      const remeasure = () => {
        reach = laneReach(host.clientWidth / 2 || 560);
        tracks.forEach((track) => {
          if (track.src) track.srcSize = measure(track.src);
          if (track.out) track.outSize = measure(track.out);
        });
        step(0);
      };
      window.addEventListener('resize', remeasure);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener('resize', remeasure);
        observer.disconnect();
      };
    },
    { scope: root }
  );

  return (
    <div className='kv-pairstream' ref={root}>
      {PAIR_ITEMS.map((item) => (
        <PairCard item={item} key={`src-${item.id}`} side='src' />
      ))}
      {PAIR_ITEMS.map((item) => (
        <PairCard item={item} key={`out-${item.id}`} side='out' />
      ))}
    </div>
  );
}
