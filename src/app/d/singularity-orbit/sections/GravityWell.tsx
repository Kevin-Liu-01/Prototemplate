'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

const SATELLITES = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
] as const;

/**
 * The gravity well: a second, smaller horizon in a dark band with the five
 * customers riding a real orbit around it — placement by rotation, marks
 * counter-rotated so the wordmarks never invert. The band is permanently
 * dark, so the shader's ink is pinned white and never re-themed.
 */
export default function GravityWell() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      let field: HorizonFieldHandle | null = null;
      let ro: ResizeObserver | null = null;
      if (canvas) {
        field = createHorizonField(canvas, {
          speed: 0.45,
          /* no CSS rule layer in the band to hand off to — pure accretion */
          params: { ringAlpha: [0, 0, 0], ruleAlpha: 0, ink: [1, 1, 1] },
        });
        /* the shader draws nothing until it is given a geometry: center the
           rim in the canvas and re-derive it on every resize */
        const fit = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (w < 2 || h < 2) return;
          field?.setParams({ center: [w / 2, h / 2], radius: Math.min(w, h) * 0.33 });
        };
        fit();
        ro = new ResizeObserver(fit);
        ro.observe(canvas);
      }
      return () => {
        ro?.disconnect();
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-band sgo-well' aria-label='Customers in orbit' ref={root}>
      <div className='sgo-well-in'>
        <header className='sgo-well-head'>
          <h2>The gravity is real.</h2>
          <p>
            Five engineering teams in orbit — every locale they ship falls through one
            pipeline. Nothing has reached escape velocity.
          </p>
        </header>
        <div className='sgo-stage' aria-hidden>
          <canvas className='sgo-core' ref={canvasRef} />
          <span className='sgo-orbit-line' />
          <div className='sgo-ring'>
            {SATELLITES.map((s, i) => (
              <span
                className='sgo-sat'
                key={s.name}
                style={{ ['--a' as never]: `${(i * 360) / SATELLITES.length}deg` }}
              >
                <i className={`sgo-sat-wm ${s.mark}`} title={s.name} />
              </span>
            ))}
          </div>
        </div>
        <p className='sgo-well-foot'>
          Cursor · Ramp · Profound · Partiful · ClickHouse — held in orbit since day one.
        </p>
      </div>
    </section>
  );
}
