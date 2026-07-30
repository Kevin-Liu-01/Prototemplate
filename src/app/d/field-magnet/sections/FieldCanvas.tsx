'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

type Filing = { x: number; y: number; a: number };
type Wave = { x: number; y: number; t0: number };
type Well = { x: number; y: number; r: number };

/** One ink, one length. Randomised greys and lengths made the lattice read as
 *  screen dirt; a single tick repeated on a regular pitch reads as material. */
const INK = 'rgba(146,149,158,';
const TICK_LEN = 9;
const TICK_W = 1.15;
/** Flow wavelength. Long enough that neighbouring ticks visibly agree, so the
 *  page carries field lines rather than scatter. */
const FLOW_X = 0.0021;
const FLOW_Y = 0.0027;

/**
 * The direction's signature: a page-wide iron-filing field.
 *
 * Filings orient to the pointer, ripple on CTA clicks, and — the part that
 * carries mandate M2 — are geometrically displaced around the hero lens, so the
 * lattice itself visibly bends into the gravity well instead of merely dimming.
 */
export default function FieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let filings: Filing[] = [];
    let dpr = 1;
    let px = -9999;
    let py = -9999;
    let tx = -9999;
    let ty = -9999;
    let active = false;
    let t = 0;
    let well: Well | null = null;
    const waves: Wave[] = [];

    const build = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      filings = [];
      const gap = window.innerWidth < 768 ? 46 : 54;
      for (let y = gap / 2; y < window.innerHeight; y += gap) {
        const row = Math.floor(y / gap) % 2;
        for (let x = gap / 2 + row * gap * 0.5; x < window.innerWidth; x += gap) {
          /* seeded from the flow field, not from noise: the lattice is already
             aligned on the first painted frame */
          filings.push({ x, y, a: Math.sin(x * FLOW_X) * 0.9 + Math.cos(y * FLOW_Y) * 0.9 });
        }
      }
    };

    const lensEl = document.querySelector<HTMLElement>('[data-lens]');
    const trackWell = () => {
      if (!lensEl) return;
      const r = lensEl.getBoundingClientRect();
      well =
        r.bottom > -120 && r.top < window.innerHeight + 120
          ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(210, r.width * 1.5) }
          : null;
    };

    const draw = (settle: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        if (w && now - w.t0 > 1300) waves.splice(i, 1);
      }

      for (const f of filings) {
        let target =
          Math.sin(f.x * FLOW_X + t * 0.2) * 0.9 + Math.cos(f.y * FLOW_Y - t * 0.14) * 0.9;
        let boost = 0;
        let dx = f.x;
        let dy = f.y;

        if (well) {
          const vx = well.x - f.x;
          const vy = well.y - f.y;
          const d = Math.hypot(vx, vy) || 0.001;
          if (d < well.r) {
            const pull = 1 - d / well.r;
            if (d < well.r * 0.3) continue; // swallowed by the core
            // Radial displacement toward the mass: the lattice compresses into a
            // bright ring at the rim instead of running straight past it.
            const disp = pull * pull * 54;
            dx = f.x + (vx / d) * disp;
            dy = f.y + (vy / d) * disp;
            target = Math.atan2(vy, vx) + Math.PI / 2;
            boost = pull * 0.55;
          }
        }

        if (active) {
          const vx = px - f.x;
          const vy = py - f.y;
          const d = Math.hypot(vx, vy);
          if (d < 250) {
            const s = 1 - d / 250;
            target = Math.atan2(vy, vx);
            boost = Math.max(boost, s * 0.5);
          }
        }

        for (const w of waves) {
          const r = (now - w.t0) * 0.9;
          const d = Math.hypot(w.x - f.x, w.y - f.y);
          if (Math.abs(d - r) < 90) {
            const s = 1 - Math.abs(d - r) / 90;
            target += s * 2.4;
            boost = Math.max(boost, s * 0.55);
          }
        }

        let diff = target - f.a;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        f.a += diff * (settle ? 1 : 0.09);
        const cos = Math.cos(f.a);
        const sin = Math.sin(f.a);
        ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dx * dpr, dy * dpr);
        ctx.fillStyle = `${INK}${(0.15 + boost).toFixed(2)})`;
        ctx.fillRect(-TICK_LEN / 2, -TICK_W / 2, TICK_LEN, TICK_W);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    build();
    trackWell();
    window.addEventListener('resize', build);

    if (reduced) {
      draw(true);
      return () => window.removeEventListener('resize', build);
    }

    const onPointer = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      active = true;
    };
    if (fine) window.addEventListener('mousemove', onPointer);

    const tick = (_time: number, deltaTime: number) => {
      t += Math.min(deltaTime, 64) / 1000;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      trackWell();
      if (!document.hidden) draw(false);
    };
    gsap.ticker.add(tick);

    /* chrome-ball cursor */
    let onCursor: ((e: MouseEvent) => void) | null = null;
    let onOver: ((e: Event) => void) | null = null;
    let onOut: ((e: Event) => void) | null = null;
    if (fine) {
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const qx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
      const qy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
      let shown = false;
      onCursor = (e: MouseEvent) => {
        if (!shown) {
          shown = true;
          gsap.to(cursor, { opacity: 1, duration: 0.3 });
        }
        qx(e.clientX);
        qy(e.clientY);
      };
      window.addEventListener('mousemove', onCursor);
      const hit = (e: Event) =>
        e.target instanceof Element ? e.target.closest('a,button,[data-mark],[data-openpr]') : null;
      onOver = (e: Event) => {
        if (hit(e)) gsap.to(cursor, { scale: 2.1, duration: 0.28 });
      };
      onOut = (e: Event) => {
        if (hit(e)) gsap.to(cursor, { scale: 1, duration: 0.28 });
      };
      document.addEventListener('mouseover', onOver);
      document.addEventListener('mouseout', onOut);
    }

    /* filing shockwave from solid CTAs */
    const onClick = (e: MouseEvent) => {
      const b = e.target instanceof Element ? e.target.closest('.fm-btn-solid') : null;
      if (!b) return;
      const r = b.getBoundingClientRect();
      waves.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, t0: performance.now() });
    };
    document.addEventListener('click', onClick);

    /* magnetic pull on interactive chrome */
    const magnets = gsap.utils.toArray<HTMLElement>('.field-magnet-root [data-magnetic]');
    const detach: (() => void)[] = [];
    if (fine) {
      for (const el of magnets) {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1,0.4)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1,0.4)' });
        let rect: DOMRect | null = null;
        const enter = () => {
          rect = el.getBoundingClientRect();
        };
        const move = (e: MouseEvent) => {
          if (!rect) return;
          xTo((e.clientX - (rect.left + rect.width / 2)) * 0.3);
          yTo((e.clientY - (rect.top + rect.height / 2)) * 0.3);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        detach.push(() => {
          el.removeEventListener('mouseenter', enter);
          el.removeEventListener('mousemove', move);
          el.removeEventListener('mouseleave', leave);
        });
      }
    }

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', build);
      if (onPointer) window.removeEventListener('mousemove', onPointer);
      if (onCursor) window.removeEventListener('mousemove', onCursor);
      if (onOver) document.removeEventListener('mouseover', onOver);
      if (onOut) document.removeEventListener('mouseout', onOut);
      document.removeEventListener('click', onClick);
      detach.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <canvas className='fm-filings' ref={canvasRef} aria-hidden />
      <div className='fm-grain' aria-hidden />
      <div className='fm-cursor' ref={cursorRef} aria-hidden />
    </>
  );
}
