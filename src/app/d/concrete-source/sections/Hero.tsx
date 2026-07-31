'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { createPrismaticField } from '@/lib/prismatic-field';

import {
  FLAGS,
  GLYPHS,
  HERO_ROTATIONS,
  STREAM_LEFT,
  STREAM_RIGHT,
  TRUSTED_BY,
  type StreamItem,
} from '../content';
import { STEP, thud } from '../components/motion';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function StreamCard({ item }: { item: StreamItem }) {
  const cls = ['uicard', item.card].filter(Boolean).join(' ');
  return (
    <div className={`s-item${item.mobileHide ? ' m-hide' : ''}`}>
      <div className={cls}>
        {item.theo ? (
          <>
            <div className='th-head'>
              <span className='th-av'>T</span>
              <span>
                <span className='th-name'>Theo</span>
                <br />
                <span className='th-role'>CEO, T3Chat</span>
              </span>
            </div>
            {item.theo}
          </>
        ) : (
          <>
            {item.bold ? <b>{item.bold}</b> : null}
            {item.text}
          </>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const icoRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const $ = <T extends Element>(s: string) => host.querySelector<T>(s);
      const $$ = <T extends Element>(s: string) => Array.from(host.querySelectorAll<T>(s));

      /* ============ PRISMATIC FIELD — hero preset 1 (wide horizontal burst)
         dimmed under the stream band. ============ */
      const canvas = $<HTMLCanvasElement>('#field');
      const heroField = canvas
        ? createPrismaticField(canvas, { preset: '1', dpr: 1, speed: 0.5, params: { exposureScale: 4200 } })
        : null;
      if (!heroField) host.classList.add('no-webgl');

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        return () => heroField?.destroy();
      }

      /* Left running for the same reason as the closing field (see Closing.tsx):
         the vendor's `resume()` kept the original creation timestamp, so the
         authored pause/resume gating never moved the shader clock — the shared
         lib's `resume()` does, which would replay the beam's opening frames
         every time the hero scrolled back into view. */

      /* ============ HERO STREAMS (flow-field lanes through the GT gate) ============
         Each item owns a vertical LANE (no stacking/z-fighting), spawns fully inside
         the frame (fade-in in place, never clipped at an edge), drifts gently, and
         dissolves at the gate / at the far edge. Ghost trails are rare, far behind,
         and capped at 12% alpha so they read as trails, not doubles. */
      const heroLoops: gsap.core.Tween[] = [];
      /* clones live outside gsap's context, so they are tracked and removed by
         hand — otherwise a re-run (strict mode, HMR) would stack trails */
      const ghosts: HTMLElement[] = [];
      const band = $<HTMLElement>('.stream-band');
      if (!band) return () => heroField?.destroy();

      const flow = (container: HTMLElement, dir: number) => {
        const items = $$<HTMLElement>(`#${container.id} .s-item`).filter((el) => el.offsetParent !== null);
        const n = items.length;
        const chips = items.filter((el) => !el.querySelector('.theo-card'));
        items.forEach((el, i) => {
          gsap.set(el, { visibility: 'visible' });
          const isBig = !!el.querySelector('.theo-card');
          const dur = gsap.utils.random(11, 16);
          const phase = (i * 1.7) % (Math.PI * 2);
          // lanes: Theo's card owns the BOTTOM band; chips interleave across the
          // top band (adjacent-in-time chips get distant lanes) — no stacking
          const ci = chips.indexOf(el);
          const chipMax = () => (band.clientHeight < 300 ? 0.32 : 0.58);
          const lane = () =>
            isBig ? 1 : chips.length > 1 ? (((ci * 2) % chips.length) / (chips.length - 1)) * chipMax() : 0;
          const st = { t: 0 };
          const apply = (t: number) => {
            const W = band.clientWidth;
            const H = band.clientHeight;
            const w = el.offsetWidth || 120;
            const h = el.offsetHeight || 34;
            const yMax = Math.max(8, H - h - 10);
            const y = Math.min(8 + lane() * (yMax - 8) + Math.sin(t * 3.2 + phase) * (isBig ? 4 : 8), yMax);
            let x0: number;
            let x1: number;
            if (dir > 0) {
              x0 = 8;
              x1 = Math.max(x0 + 40, W * 0.5 - w - 34);
            } else {
              x0 = W * 0.5 + 34;
              x1 = Math.max(x0 + 40, W - w - 8);
            }
            const x = x0 + t * (x1 - x0);
            const op = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;
            const sc = dir > 0 ? 1 - 0.06 * t : 1 - 0.16 * t;
            return { x, y, scale: sc, op };
          };
          const tick = () => {
            const p = apply(st.t);
            gsap.set(el, { x: p.x, y: p.y, scale: p.scale, opacity: p.op * 0.96 });
          };
          const tw = gsap.to(st, { t: 1, duration: dur, ease: 'none', repeat: -1, onUpdate: tick });
          tw.progress(((i + 0.5) / n) % 1);
          heroLoops.push(tw);
          // ghost trail — dark chips only, far behind, ≤12% alpha (echo, not double)
          if (!isBig && i % 3 === 1) {
            const ghost = el.cloneNode(true) as HTMLElement;
            ghost.setAttribute('aria-hidden', 'true');
            ghost.style.opacity = '0';
            container.appendChild(ghost);
            ghosts.push(ghost);
            const gst = { t: 0 };
            const gtick = () => {
              const p = apply(gst.t);
              gsap.set(ghost, { x: p.x, y: p.y, scale: p.scale, opacity: p.op * 0.12 });
            };
            const gtw = gsap.to(gst, { t: 1, duration: dur, ease: 'none', repeat: -1, onUpdate: gtick });
            gtw.progress(((((i + 0.5) / n) % 1) + 1 - 0.11) % 1);
            heroLoops.push(gtw);
          }
        });
      };

      const streamL = $<HTMLElement>('#stream-l');
      const streamR = $<HTMLElement>('#stream-r');
      if (streamL) flow(streamL, 1);
      if (streamR) flow(streamR, -1);

      // glyph particle cloud, right half only, always inside the frame
      $$<HTMLElement>('.glyph').forEach((g, i) => {
        gsap.set(g, { visibility: 'visible' });
        const st = { t: 0 };
        const lane = (i * 0.83 + 0.05) % 0.9;
        const dur = gsap.utils.random(6, 11);
        const apply = () => {
          const W = band.clientWidth;
          const H = band.clientHeight;
          const t = st.t;
          gsap.set(g, {
            x: W * 0.54 + t * (W * 0.4),
            y: (0.06 + lane) * (H - 30) + Math.sin(t * 5 + i) * 12,
            opacity: t < 0.15 ? (t / 0.15) * 0.45 : (1 - t) * 0.45,
            scale: 0.7 + (0.6 * ((i * 37) % 10)) / 10,
          });
        };
        const tw = gsap.to(st, { t: 1, duration: dur, ease: 'none', repeat: -1, onUpdate: apply });
        tw.progress((i / 12) % 1);
        heroLoops.push(tw);
      });

      // gate processing arc
      const arc = gsap.to('#gate-arc', {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 3.6,
        ease: 'none',
        repeat: -1,
      });
      heroLoops.push(arc);
      ScrollTrigger.create({
        trigger: host,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => heroLoops.forEach((l) => (self.isActive ? l.play() : l.pause())),
      });

      /* ============ FLAG MARQUEE ============ */
      const marq = $<HTMLElement>('#flag-marq');
      const track = $<HTMLElement>('#flag-marq .marq-track');
      if (marq && track) {
        const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 38 });
        ScrollTrigger.create({
          trigger: marq,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      }

      /* ============ LANGUAGE ROTATOR — whole-word HARD CUTS.
         Never a running scramble: any frozen frame must read a real language. */
      const rot = $<HTMLElement>('#rot');
      let wi = 0;
      const cycleHero = () => {
        gsap.delayedCall(2.2, () => {
          if (!rot) return;
          wi = (wi + 1) % HERO_ROTATIONS.length;
          rot.textContent = HERO_ROTATIONS[wi] ?? null;
          gsap.fromTo(
            rot,
            { backgroundColor: '#fff', color: '#080808' },
            { backgroundColor: 'rgba(255,255,255,0)', color: '#fff', duration: 0.32, ease: STEP(2) }
          );
          cycleHero();
        });
      };
      cycleHero();

      /* ============ THE STAMP (hero intro) ============ */
      gsap.set('[data-reveal]', { visibility: 'visible' });
      gsap.from('[data-reveal]', {
        scale: 1.6,
        autoAlpha: 0,
        duration: 0.22,
        ease: STEP(2),
        stagger: 0.09,
        delay: 0.15,
        onStart: () => thud($<HTMLElement>('.hero-copy')),
      });

      return () => {
        ghosts.forEach((g) => g.remove());
        heroField?.destroy();
      };
    },
    { scope: root }
  );

  const copyCommand = () => {
    const done = () => {
      if (icoRef.current) icoRef.current.textContent = '✓';
      setTimeout(() => {
        if (icoRef.current) icoRef.current.textContent = '⧉';
      }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('npx gt@latest').then(done).catch(done);
    } else done();
  };

  return (
    <header className='hero' id='top' ref={root}>
      <canvas id='field' aria-hidden='true' />
      <div className='hero-inner'>
        <div className='stream-band' aria-hidden='true'>
          <div className='hairline-v' />
          <div className='stream' id='stream-l'>
            {STREAM_LEFT.map((item, i) => (
              <StreamCard key={`l${i}`} item={item} />
            ))}
          </div>
          <div className='stream' id='stream-r'>
            {STREAM_RIGHT.map((item, i) => (
              <StreamCard key={`r${i}`} item={item} />
            ))}
          </div>
          <div className='stream' id='glyphs'>
            {GLYPHS.map((g, i) => (
              <span className='glyph' key={`g${i}`}>
                {g}
              </span>
            ))}
          </div>
          <div className='gate'>
            <svg viewBox='0 0 120 120' aria-hidden='true'>
              <circle
                cx='60'
                cy='60'
                r='52'
                fill='rgba(8,8,8,.72)'
                stroke='rgba(255,255,255,.24)'
                strokeWidth='2'
              />
              <circle
                id='gate-arc'
                cx='60'
                cy='60'
                r='52'
                fill='none'
                stroke='#fff'
                strokeWidth='3'
                strokeDasharray='82 245'
                strokeLinecap='butt'
              />
            </svg>
            <div className='gt-core'>
              <span>GT</span>
            </div>
            <span className='gate-num' style={{ top: '-14px', left: '8px' }}>
              1
            </span>
            <span className='gate-num' style={{ bottom: '-12px', right: '2px' }}>
              8
            </span>
            <span className='gate-num' style={{ top: '34px', right: '-18px' }}>
              9
            </span>
          </div>
        </div>

        <div className='hero-copy'>
          <button className='cmd-chip' id='cmd' type='button' aria-label='Copy npx gt@latest' onClick={copyCommand}>
            <span className='dollar'>$</span> npx gt@latest{' '}
            <span className='dollar' id='cmd-ico' ref={icoRef}>
              ⧉
            </span>
          </button>
          <h1 className='slab' data-reveal>
            LAUNCH IN EVERY
            <br />
            <span className='chrome'>LANGUAGE</span>
          </h1>
          <p className='hero-sub' data-reveal>
            General Translation helps developers localize apps into{' '}
            <span className='rot' id='rot'>
              Spanish
            </span>
            <br />— no painful refactors and no managing large JSON files.
          </p>
          <div className='hero-ctas' data-reveal>
            <a className='primary' href='#dashboard'>
              Get Started
            </a>
            <a className='ghost' href='#docs'>
              Docs
            </a>
          </div>
        </div>

        <div className='flags'>
          <span className='k'>100+ languages supported // production-ready locales</span>
          <div className='marq' id='flag-marq'>
            <div className='marq-track'>
              {FLAGS.map((flag, i) => (
                <span className='flag-chip' key={`f${i}`}>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='trust'>
          <span className='k'>Trusted by the world&apos;s best companies //</span>
          {TRUSTED_BY.map((name) => (
            <span className='wordmark' key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
