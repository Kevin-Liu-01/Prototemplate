'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { STREAM_ITEMS, type StreamKind, type StreamSide } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hero stream (M1) — English UI falls into the gate along the same rays the
 * prismatic shader radiates along, and comes back out translated.
 *
 * Everything is placed in 3D on a ray through the vanishing point: `k` is the
 * normalized distance travelled from the outer edge (k=0, near the viewer,
 * large and sharp) to the lens rim (k=1, deep, small, blurred, chromatically
 * fringed). The two legs of a ray share the angle, so a component leaves on the
 * exact line it arrived on — light passing through a lens, not a conveyor belt.
 */

const FLATTEN = 0.55; // squashes the fan into the shader's horizontal band
const BEND = 0.34; // radians of curve added as a component nears the well
const RIM = 168; // px from centre where the lens swallows a component
const CYCLE = 15; // seconds for a full english → gate → translated round trip

type Dims = { out: number };

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** The locale tag, on the translated leg only — never a component-type label. */
function Tag({ side }: { side: StreamSide }) {
  if (!side.tag) return null;
  return <span className='bf-sc-tag'>{side.tag}</span>;
}

function CardBody({ kind, side }: { kind: StreamKind; side: StreamSide }) {
  if (kind === 'quote') {
    return (
      <>
        <Tag side={side} />
        <p className='bf-sc-quote'>{side.text}</p>
        <span className='bf-sc-who'>
          <i className='bf-sc-av'>T3</i>
          {side.sub}
        </span>
      </>
    );
  }
  if (kind === 'price') {
    return (
      <>
        <Tag side={side} />
        <span className='bf-sc-price'>
          <b>{side.text}</b>
          <em>{side.sub}</em>
        </span>
      </>
    );
  }
  if (kind === 'toast') {
    return (
      <>
        <Tag side={side} />
        <span className='bf-sc-toast'>
          <i className='bf-sc-tick'>✓</i>
          {side.text}
        </span>
      </>
    );
  }
  const bodyClass =
    kind === 'button'
      ? 'bf-sc-btn'
      : kind === 'field'
        ? 'bf-sc-field'
        : kind === 'nav'
          ? 'bf-sc-nav'
          : kind === 'welcome'
            ? 'bf-sc-welcome'
            : 'bf-sc-copy';
  return (
    <>
      <Tag side={side} />
      <span className={bodyClass}>{side.text}</span>
    </>
  );
}

export default function HeroStream() {
  const scene = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = scene.current;
      if (!host) return;

      const cards = gsap.utils.toArray<HTMLElement>('.bf-scard', host);
      const dims: Dims = { out: 900 };
      /* card half-extents, cached so the per-frame loop never reads layout */
      const half = new Map<HTMLElement, { w: number; h: number }>();
      const measure = () => {
        dims.out = Math.max(430, host.clientWidth * 0.5);
        for (const el of cards) {
          half.set(el, { w: (el.offsetWidth / 2) * 1.1 + 10, h: (el.offsetHeight / 2) * 1.1 + 10 });
        }
      };
      measure();

      const place = (el: HTMLElement, angleDeg: number, k: number, side: 1 | -1) => {
        const radius = RIM + (dims.out - RIM) * (1 - k);
        const angle = (angleDeg * Math.PI) / 180 + BEND * k * k * side;
        const x = side * Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * FLATTEN;
        const z = 140 - 640 * k;
        const scale = 1.08 - 0.34 * k;
        const stretch = 1 + k * 0.34; // tangential stretch at the rim
        /* A card must never be sliced by the bezel: it fades to nothing while
           its own bounding box is still clear of the frame, so the stream reads
           as light entering the scene rather than content cut off at an edge. */
        const hf = half.get(el);
        const limX = Math.max(70, host.clientWidth / 2 - (hf?.w ?? 120));
        const limY = Math.max(60, host.clientHeight / 2 - (hf?.h ?? 40));
        const edge =
          (1 - smoothstep(limX - 110, limX, Math.abs(x))) *
          (1 - smoothstep(limY - 70, limY, Math.abs(y)));
        const opacity = smoothstep(0, 0.12, k) * (1 - smoothstep(0.74, 0.96, k)) * edge;
        const chroma = smoothstep(0.42, 0.9, k);
        const blur = Math.round(chroma * 3.2 * 2) / 2;

        el.style.transform =
          `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px)` +
          ` rotateY(${(side * 26 * k).toFixed(2)}deg)` +
          ` scale(${(scale / stretch).toFixed(3)}, ${(scale * stretch).toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);

        const wanted =
          chroma > 0.02
            ? `blur(${blur}px) drop-shadow(${(3 * chroma).toFixed(1)}px 0 rgba(138,172,255,${(0.85 * chroma).toFixed(2)})) drop-shadow(${(-3 * chroma).toFixed(1)}px 0 rgba(255,206,150,${(0.7 * chroma).toFixed(2)}))`
            : 'none';
        if (el.dataset.fx !== wanted) {
          el.style.filter = wanted;
          el.dataset.fx = wanted;
        }
      };

      const tick = { t: 0 };
      const render = () => {
        for (const el of cards) {
          const angle = Number(el.dataset.angle);
          const phase = Number(el.dataset.phase);
          const leg = el.dataset.leg === 'tr' ? 1 : -1;
          const u = (tick.t + phase) % 1;
          if (leg === -1) {
            // english: outer edge → rim, slowing as the well takes hold
            const v = u < 0.5 ? u * 2 : -1;
            if (v < 0) {
              el.style.opacity = '0';
              continue;
            }
            place(el, angle, 1 - Math.pow(1 - v, 1.35), -1);
          } else {
            // translated: leaves the rim slowly, then accelerates outward
            const v = u >= 0.5 ? (u - 0.5) * 2 : -1;
            if (v < 0) {
              el.style.opacity = '0';
              continue;
            }
            place(el, angle, 1 - Math.pow(v, 1.35), 1);
          }
        }
      };

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        tick.t = 0.18;
        render();
        return;
      }

      const loop = gsap.to(tick, {
        t: 1,
        duration: CYCLE,
        repeat: -1,
        ease: 'none',
        onUpdate: render,
      });
      render();

      const trigger = ScrollTrigger.create({
        trigger: host,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      });

      const onResize = () => {
        measure();
        render();
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        trigger.kill();
      };
    },
    { scope: scene }
  );

  return (
    <div className='bf-stream' ref={scene} aria-hidden>
      {STREAM_ITEMS.map((item) => (
        <div key={item.id} className='bf-lane'>
          <div
            className={`bf-scard bf-scard-${item.kind}`}
            data-leg='en'
            data-angle={item.angle}
            data-phase={item.phase}
          >
            <CardBody kind={item.kind} side={item.en} />
          </div>
          <div
            className={`bf-scard bf-scard-${item.kind} bf-scard-tr`}
            data-leg='tr'
            data-angle={item.angle}
            data-phase={item.phase}
            dir={item.tr.rtl ? 'rtl' : undefined}
          >
            <CardBody kind={item.kind} side={item.tr} />
          </div>
        </div>
      ))}
    </div>
  );
}
