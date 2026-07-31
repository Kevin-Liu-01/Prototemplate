'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '../lib/horizon-field';

gsap.registerPlugin(useGSAP);

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* The locale chips that orbit the horizon — native names, not English
   exonyms. Ordered so wide chips never sit next to each other on the ring. */
const FLAGS: readonly { flag: string; name: string }[] = [
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇺🇦', name: 'Українська' },
  { flag: '🇨🇳', name: '简体中文' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇳🇱', name: 'Nederlands' },
  { flag: '🇮🇳', name: 'हिन्दी' },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇹🇭', name: 'ไทย' },
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇮🇱', name: 'עברית' },
  { flag: '🇮🇹', name: 'Italiano' },
  { flag: '🇵🇱', name: 'Polski' },
  { flag: '🇸🇪', name: 'Svenska' },
  { flag: '🇲🇽', name: 'Español' },
  { flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { flag: '🇹🇷', name: 'Türkçe' },
];

/** Flag-orbit radius as a multiple of the horizon radius (wide mode). */
const ORBIT_K = 1.36;
/** Seconds per full revolution of the flag orbit. */
const ORBIT_DUR = 130;
/** Vertical squash of the flag orbit — a slightly inclined orbital plane. */
const ORBIT_TILT = 0.94;

const TAU = Math.PI * 2;

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const smooth01 = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * The event horizon stripped to the mass itself — the parent direction's
 * component walls are gone, and the gate sits alone on open paper. The
 * horizon is the same purpose-built lensing shader (lib/horizon-field.ts):
 * an accretion streak field whose sampling coordinates bend around the rim
 * into a brilliant photon ring, the page's own ruled hairlines warping with
 * it, over a genuinely dark core. The dark core holds the mark, headline,
 * CTAs and the npx chip light-on-dark; the locale flag chips ride a slightly
 * inclined orbit around the horizon, each oriented tangent to the ring like
 * a satellite belt. Nothing else competes with the mass.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      const hero = heroRef.current;
      const fieldCanvas = fieldRef.current;
      const orbit = orbitRef.current;
      const rail = railRef.current;
      if (!hero || !fieldCanvas || !orbit || !rail) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* Only the innermost lens-echo ring survives — the two outer guide
         circles are gone, so nothing draws beyond the orbit belt. */
      const field: HorizonFieldHandle | null = createHorizonField(fieldCanvas, {
        speed: 0.5,
        params: { ringAlpha: [0.09, 0, 0] },
      });

      /* The shader's ink must follow the page theme: its bent rules and rings
         hand off to CSS-drawn ones at the mask edge, so both flip together. */
      const applyTheme = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        field?.setParams({ ink: dark ? [1, 1, 1] : [0.059, 0.067, 0.075] });
      };
      applyTheme();
      const themeWatch = new MutationObserver(applyTheme);
      themeWatch.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      /* The flag chips, driven directly each frame — no wrapper rotation, no
         counter-rotation: each chip is seated on the (slightly inclined)
         orbit and oriented TANGENT to it, satellites riding the ring. */
      const chips = Array.from(orbit.querySelectorAll<HTMLElement>('.eh-chip'));

      let wide = true;
      let cy = 0;
      let r = 240;
      let orbitR = 320;

      /* The flag orbit: chips revolve on a slightly inclined ellipse, each
         oriented tangent to it. Chips on the lower arc take a 180° roll
         (snapped at the sides, where they stand vertical) so the text
         never inverts — the circular-seal read. Far-side chips (top arc)
         shrink and dim as if passing behind the rim glow. */
      const placeChips = (timeSec: number) => {
        const phase = (timeSec / ORBIT_DUR) * TAU;
        const n = chips.length || 1;
        for (let i = 0; i < chips.length; i++) {
          const chip = chips[i];
          if (!chip) continue;
          const a = phase + (i / n) * TAU;
          const sin = Math.sin(a);
          const cos = Math.cos(a);
          const x = orbitR * sin;
          const y = -orbitR * ORBIT_TILT * cos;
          let rot = Math.atan2(ORBIT_TILT * sin, cos);
          if (cos < 0) rot += Math.PI;
          const scale = 1 - 0.075 * cos;
          const dim = 1 - 0.45 * smooth01((cos - 0.4) / 0.45);
          chip.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(
            2
          )}px) translate(-50%, -50%) rotate(${rot.toFixed(4)}rad) scale(${scale.toFixed(3)})`;
          chip.style.opacity = dim.toFixed(3);
        }
      };

      const measure = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        if (w < 10 || h < 10) return;
        wide = w >= 760;
        r = wide
          ? Math.min(Math.max(w * 0.19, 228), 300, h * 0.36)
          : Math.min(w * 0.4, 168, h * 0.26);
        const cx = w / 2;
        /* No wall bands anywhere: the disc centers on the same seat in both
           modes, with just enough floor for the caption. */
        cy = wide
          ? Math.max(Math.min(h * 0.47, h - r - 148), r + 96)
          : Math.max(Math.min(h * 0.46, h - r - 172), r + 148);
        orbitR = wide ? r * ORBIT_K : Math.min(r + 36, w / 2 - 20);

        hero.style.setProperty('--eh-cx', `${cx.toFixed(1)}px`);
        hero.style.setProperty('--eh-cy', `${cy.toFixed(1)}px`);
        hero.style.setProperty('--eh-r', `${r.toFixed(1)}px`);
        hero.dataset.ehMode = wide ? 'wide' : 'stack';

        /* The shader canvas covers the disc plus a generous annulus: big
           enough for the rim glow, small enough that the paper beyond is
           untouched DOM. */
        const half = r * 2.05;
        fieldCanvas.style.left = `${(cx - half).toFixed(1)}px`;
        fieldCanvas.style.top = `${(cy - half).toFixed(1)}px`;
        fieldCanvas.style.width = `${(half * 2).toFixed(1)}px`;
        fieldCanvas.style.height = `${(half * 2).toFixed(1)}px`;
        field?.setParams({
          center: [half, half],
          radius: r,
          worldOrigin: [cx - half, cy - half],
        });

        /* The orbit origin; chips are seated per-frame at even pitch. The
           dashed rail is the same inclined ellipse the chips ride — its
           square viewBox stretches into the orbit's squashed box. */
        orbit.style.left = `${cx.toFixed(1)}px`;
        orbit.style.top = `${cy.toFixed(1)}px`;
        rail.style.left = `${(cx - orbitR).toFixed(1)}px`;
        rail.style.top = `${(cy - orbitR * ORBIT_TILT).toFixed(1)}px`;
        rail.style.width = `${(orbitR * 2).toFixed(1)}px`;
        rail.style.height = `${(orbitR * ORBIT_TILT * 2).toFixed(1)}px`;

        /* Reduced motion: one composed still, chips seated mid-orbit. */
        placeChips(reduced ? 42 : gsap.ticker.time);
      };

      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(hero);

      if (reduced) {
        return () => {
          ro.disconnect();
          themeWatch.disconnect();
          field?.destroy();
        };
      }

      /* Offscreen/hidden-tab guard for the per-frame orbit. */
      let active = true;
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          active = entry ? entry.isIntersecting : true;
        },
        { rootMargin: '120px' }
      );
      io.observe(hero);

      const tick = () => {
        if (!active || document.hidden) return;
        placeChips(gsap.ticker.time);
      };
      gsap.ticker.add(tick);

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });
      if (horizonRef.current) {
        gsap.from([horizonRef.current, fieldCanvas], {
          scale: 0.965,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
        });
      }
      gsap.from([orbit, rail], {
        autoAlpha: 0,
        duration: 0.9,
        delay: 0.55,
        ease: 'none',
      });

      /* The chips revolve inside tick(); the dashed rail creeps the other
         way via dash offset (the inclined ellipse cannot simply rotate). */
      const railStroke = rail.querySelector('circle');
      if (railStroke) {
        gsap.to(railStroke, {
          attr: { 'stroke-dashoffset': 48 },
          duration: 96,
          ease: 'none',
          repeat: -1,
        });
      }

      return () => {
        ro.disconnect();
        io.disconnect();
        themeWatch.disconnect();
        gsap.ticker.remove(tick);
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='eh-hero' ref={heroRef} data-eh-mode='wide'>
        <p className='sr-only'>
          A dark event horizon sits at the center of otherwise empty ruled paper; locale chips —
          Japanese, Spanish, Korean, Arabic, and more — orbit it like a satellite belt.
        </p>

        {/* The event horizon. The DOM carries only the fallback disc (WebGL
            unavailable → a plain dark circle with a hairline rim keeps the
            center stack legible); everything else — photon ring, wrapped
            accretion arcs, the page's rules bending into the hole — is the
            horizon-field shader in the canvas that follows. */}
        <div className='eh-horizon' aria-hidden ref={horizonRef}>
          <span className='eh-hole' />
        </div>
        <canvas className='eh-field' ref={fieldRef} aria-hidden />

        {/* The locale chips orbit the horizon on a dashed rail — a slightly
            inclined ellipse, chips tangent to it like a satellite belt. The
            layer is inert (pointer-events: none) so it never blocks the
            core's CTAs. preserveAspectRatio='none' squashes the circle into
            the same ellipse the chips ride. */}
        <svg
          className='eh-orbit-rail'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          ref={railRef}
          aria-hidden
        >
          <circle
            cx='50'
            cy='50'
            r='49.4'
            fill='none'
            stroke='currentColor'
            strokeDasharray='0.6 4.2'
            vectorEffect='non-scaling-stroke'
          />
        </svg>
        <div className='eh-orbit' ref={orbitRef} aria-hidden>
          {FLAGS.map((entry) => (
            <span className='eh-orbit-seat' key={entry.name}>
              <span className='eh-chip'>
                <i>{entry.flag}</i>
                <b>{entry.name}</b>
              </span>
            </span>
          ))}
        </div>

        {/* Center content sits inside the dark core and flips to light-on-dark. */}
        <div className='eh-core'>
          <Image
            className='eh-mark'
            data-hero-in
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={34}
            height={34}
          />
          <h1 data-hero-in>
            <span>Launch in</span>
            <span>
              <em>every</em> language.
            </span>
          </h1>
          <p className='eh-sub' data-hero-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and
            websites.
          </p>
          <div className='eh-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Docs
            </a>
          </div>
          <button className='tc-copy' type='button' onClick={copy} data-hero-in>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

      </div>

      <div className='tc-rail eh-trust-rail'>
        <div className='tc-trust'>
          <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
          <div className='tc-trust-row'>
            {CUSTOMERS.map((customer) => (
              <span className='tc-trust-cell' key={customer.name}>
                <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
