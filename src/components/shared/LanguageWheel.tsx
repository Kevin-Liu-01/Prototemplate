'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useRef } from 'react';

import './LanguageWheel.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type LanguageWheelProps = {
  className?: string;
  /**
   * Outer diameter in px. Omit to let CSS drive it through `--gtw-size`, which
   * is what lets a direction shrink the dial in a media query.
   */
  size?: number;
  logoSrc?: string;
  logoAlt?: string;
  /** Logo width in px. Omit to keep the mark at 34.4% of the dial. */
  logoSize?: number;
  /** Script glyphs that orbit the dial. */
  glyphs?: string;
  /** Seconds for one revolution of the bright arc. */
  arcDuration?: number;
  /** Share of the circumference the bright arc covers, 0–100. */
  arcSweep?: number;
  /** Stacked backdrop-filter shells. Needs something behind the wheel to bend. */
  lens?: boolean;
  /** Orbiting glyphs. */
  orbit?: boolean;
  /** Priority-load the centre mark (use in a hero). */
  priority?: boolean;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const DEFAULT_GLYPHS = '語한文عñßЖ中れ글अй€çك日字ه한ю';

type Orb = { el: HTMLElement; ang: number; rad: number; spin: number; scale: number };

/**
 * The machined chrome dial: a heavy metallic bezel with true specular edges, a
 * bright progress arc, orbiting script glyphs, and the real GT mark at centre.
 *
 * Bezel, arc and glyph colours all resolve through `--gtw-*` custom properties.
 */
export default function LanguageWheel({
  className,
  size,
  logoSrc = '/brand/no-bg-gt-logo-dark.png',
  logoAlt = '',
  logoSize,
  glyphs = DEFAULT_GLYPHS,
  arcDuration = 3.6,
  arcSweep = 17,
  lens = true,
  orbit = true,
  priority = false,
}: LanguageWheelProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* Radii are authored against a 244px dial, then scaled to the rendered
         one — so a direction can shrink the wheel from CSS and the orbit follows. */
      let ratio = (el.offsetWidth || 244) / 244;
      const resize = () => (ratio = (el.offsetWidth || 244) / 244);
      window.addEventListener('resize', resize);

      const orbEls = gsap.utils.toArray<HTMLElement>('[data-orb]', el);
      const orbs: Orb[] = orbEls.map((node, i) => ({
        el: node,
        ang: (i / Math.max(1, orbEls.length)) * Math.PI * 2,
        rad: 96 + ((i * 37) % 120),
        spin: 0.16 + ((i * 13) % 9) / 42,
        scale: 0.75 + ((i * 7) % 5) / 8,
      }));

      const draw = (o: Orb, alpha: number) => {
        o.el.style.transform =
          `translate3d(${(Math.cos(o.ang) * o.rad * ratio).toFixed(1)}px, ` +
          `${(Math.sin(o.ang) * o.rad * ratio * 0.62).toFixed(1)}px, 0) translate(-50%, -50%) ` +
          `scale(${(o.scale * ratio).toFixed(2)})`;
        o.el.style.opacity = alpha.toFixed(2);
      };

      if (reduced || !orbit) {
        orbs.forEach((o) => draw(o, orbit ? 0.4 : 0));
        window.removeEventListener('resize', resize);
        return;
      }

      const tick = (_t: number, deltaTime: number) => {
        const dt = Math.min(deltaTime, 64) / 1000;
        for (const o of orbs) {
          o.ang += o.spin * dt;
          o.rad -= dt * 7;
          if (o.rad < 84) o.rad = 218;
          draw(o, Math.min(1, (o.rad - 84) / 46) * 0.62);
        }
      };
      gsap.ticker.add(tick);

      const sweep = gsap.to('[data-wheel-arc]', {
        rotation: 360,
        svgOrigin: '120 120',
        duration: arcDuration,
        ease: 'none',
        repeat: -1,
      });

      const pause = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? sweep.play() : sweep.pause()),
      });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener('resize', resize);
        sweep.kill();
        pause.kill();
      };
    },
    { scope: root, dependencies: [arcDuration, orbit] }
  );

  const style: StyleVars | undefined = size ? { '--gtw-size': `${size}px` } : undefined;

  return (
    <div
      className={className ? `gtw ${className}` : 'gtw'}
      style={style}
      ref={root}
      data-lens
      aria-hidden
    >
      {lens && (
        <>
          <div className='gtw-shell gtw-shell-1' />
          <div className='gtw-shell gtw-shell-2' />
          <div className='gtw-shell gtw-shell-3' />
        </>
      )}
      <div className='gtw-halo' />
      <div className='gtw-bezel' />
      <svg className='gtw-arc' viewBox='0 0 240 240'>
        <circle className='gtw-track' cx='120' cy='120' r='114' />
        <circle
          className='gtw-sweep'
          data-wheel-arc
          cx='120'
          cy='120'
          r='114'
          pathLength={100}
          strokeDasharray={`${arcSweep} ${100 - arcSweep}`}
        />
      </svg>
      <div className='gtw-core'>
        <Image
          className='gtw-mark'
          src={logoSrc}
          alt={logoAlt}
          width={logoSize ?? 84}
          height={logoSize ?? 84}
          style={logoSize ? { width: `${logoSize}px` } : undefined}
          priority={priority}
        />
      </div>

      {orbit && (
        <div className='gtw-orbit'>
          {Array.from(glyphs).map((glyph, i) => (
            <span className='gtw-glyph' data-orb key={`${glyph}-${i}`}>
              {glyph}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
