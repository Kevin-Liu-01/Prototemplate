'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '../lib/horizon-field';

gsap.registerPlugin(useGSAP);

/* The customers whose marks ride inside the hole, under the CTAs. */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* The locale chips that orbit the horizon — native names, not English
   exonyms. Scripts whose letters must never be split (joining Arabic,
   Hebrew, Devanagari matras, Thai clusters) are marked whole. */
const BELT: readonly { flag: string; name: string; whole?: boolean }[] = [
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇺🇦', name: 'Українська' },
  { flag: '🇨🇳', name: '简体中文' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇸🇦', name: 'العربية', whole: true },
  { flag: '🇳🇱', name: 'Nederlands' },
  { flag: '🇮🇳', name: 'हिन्दी', whole: true },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇹🇭', name: 'ไทย', whole: true },
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇮🇱', name: 'עברית', whole: true },
  { flag: '🇮🇹', name: 'Italiano' },
  { flag: '🇵🇱', name: 'Polski' },
  { flag: '🇸🇪', name: 'Svenska' },
  { flag: '🇲🇽', name: 'Español' },
  { flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { flag: '🇹🇷', name: 'Türkçe' },
];

/** How far a letter steps aside for the flag, px — the flag's seat width. */
const FLAG_SEAT = 20;
/** Per-letter stagger of the hop as the flag sweeps past, ms. */
const SWEEP_STEP = 34;
/** The flag's own travel time across the pill, ms. */
const SWEEP_MS = 620;

/** Flag-orbit radius as a multiple of the horizon radius (wide mode). */
const ORBIT_K = 1.36;
/** Seconds per full revolution of the flag orbit. */
const ORBIT_DUR = 130;
/** Vertical squash of the flag orbit — a slightly inclined orbital plane. */
const ORBIT_TILT = 0.94;
/** Gravity pacing: chips whip through the near arc (1+K× speed) and glide
    across the far side (1−K×) — dθ/dt = 1 − K·cos θ. */
const KEPLER = 0.22;

const TAU = Math.PI * 2;

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const smooth01 = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * The enterprise gate. The event horizon alone on open paper — the lensing
 * shader (lib/horizon-field.ts) wraps accretion light into a photon ring
 * and bends the page's own hairlines into a genuinely dark core that holds
 * the mark, headline and the two enterprise CTAs. No npx chip, no rings, no
 * rail — aura and the product, nothing else. The belt riding the inclined
 * orbit mixes locale chips with the customers' own marks, every chip under
 * the hole's gravity: Kepler pacing, tidal stretch, an animated roll-over
 * at the sides, blur as it falls behind the glow.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const fieldCanvas = fieldRef.current;
      const orbit = orbitRef.current;
      if (!hero || !fieldCanvas || !orbit) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* No guide rings at all — the hole, its glow, and the belt of chips
         are the only geometry. */
      const field: HorizonFieldHandle | null = createHorizonField(fieldCanvas, {
        speed: 0.5,
        params: { ringAlpha: [0, 0, 0] },
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

      /* The belt, under the hole's gravity — chips stay UPRIGHT the whole
         revolution (no tangent rotation, nothing ever tilts): they WHIP
         through the near (front) arc and glide across the far side
         (Kepler pacing), stretch horizontally with their horizontal speed
         (the tidal smear), swell as they pass in front, blur and dim as
         they fall behind the glow. The flag leads the direction of
         travel: when a chip turns around at the orbit's sides, the flag
         SLIDES across the pill to the other end, and each letter it
         passes hops aside in sequence — handled by handoff() below and
         the .eh-chip CSS transitions. */
      const leads = new Array<string>(chips.length).fill('');

      const handoff = (chip: HTMLElement, lead: 'l' | 'r') => {
        const letters = chip.querySelectorAll<HTMLElement>('[data-lt]');
        const m = letters.length;
        for (let j = 0; j < m; j++) {
          const el = letters[j];
          if (!el) continue;
          /* the flag sweeps toward its new end — letters hop as it passes:
             sweeping right, low indices first; sweeping left, high first */
          const order = lead === 'r' ? j : m - 1 - j;
          el.style.transitionDelay = `${Math.round((order / Math.max(1, m - 1)) * (SWEEP_MS - 180))}ms`;
        }
        chip.dataset.lead = lead;
      };

      const placeChips = (timeSec: number) => {
        const phase = (timeSec / ORBIT_DUR) * TAU;
        const n = chips.length || 1;
        for (let i = 0; i < chips.length; i++) {
          const chip = chips[i];
          if (!chip) continue;
          const a0 = phase + (i / n) * TAU;
          const a = a0 - KEPLER * Math.sin(a0);
          const sin = Math.sin(a);
          const cos = Math.cos(a);
          const x = orbitR * sin;
          const y = -orbitR * ORBIT_TILT * cos;
          /* horizontal travel: rightward across the top (cos>0), leftward
             back across the bottom — the flag rides the leading end */
          const lead: 'l' | 'r' = cos > 0 ? 'r' : 'l';
          if (leads[i] !== lead) {
            leads[i] = lead;
            handoff(chip, lead);
          }
          /* instantaneous angular speed (1−K·cosθ), normalized 0..1,
             smeared only along x so vertical runs never distort */
          const whip = (1 - KEPLER * cos - (1 - KEPLER)) / (2 * KEPLER);
          const horiz = Math.abs(cos) / Math.hypot(cos, ORBIT_TILT * sin);
          const stretch = 1 + 0.13 * whip * horiz;
          const scale = 1 - 0.13 * cos;
          const dim = 1 - 0.5 * smooth01((cos - 0.35) / 0.5);
          const blur = 0.9 * smooth01((cos - 0.2) / 0.55);
          chip.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(
            2
          )}px) translate(-50%, -50%) scale(${(scale * stretch).toFixed(3)}, ${scale.toFixed(3)})`;
          chip.style.opacity = dim.toFixed(3);
          chip.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
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

        /* The orbit origin; chips are seated per-frame at even pitch. */
        orbit.style.left = `${cx.toFixed(1)}px`;
        orbit.style.top = `${cy.toFixed(1)}px`;

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
      gsap.from(orbit, {
        autoAlpha: 0,
        duration: 0.9,
        delay: 0.55,
        ease: 'none',
      });

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
          Japanese, Spanish, Korean, Arabic, and more — orbit it like a satellite belt, with the
          wordmarks of Cursor, Ramp, Mintlify, Profound, Partiful and ClickHouse riding among them.
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

        {/* The belt orbits the horizon on a slightly inclined ellipse —
            chips always upright, no drawn rail, the revolution itself is
            the line. Each pill reserves a seat at both ends; the flag
            occupies the leading one and slides across at the turn while
            the letters hop aside in sequence. Joining scripts ride as one
            unbreakable span. The layer is inert (pointer-events: none). */}
        <div className='eh-orbit' ref={orbitRef} aria-hidden>
          {BELT.map((entry) => (
            <span className='eh-orbit-seat' key={entry.name}>
              <span className='eh-chip' data-lead='l'>
                <i className='eh-chip-flag'>{entry.flag}</i>
                <b className='eh-chip-word'>
                  {entry.whole ? (
                    <span data-lt lang='und'>
                      {entry.name}
                    </span>
                  ) : (
                    [...entry.name].map((ch, j) => (
                      <span data-lt key={`${entry.name}-${j}`}>
                        {ch === ' ' ? ' ' : ch}
                      </span>
                    ))
                  )}
                </b>
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
            The localization platform the world&rsquo;s best engineering teams run in production —
            apps, docs, and websites, in every market you ship to.
          </p>
          <div className='eh-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#contact'>
              Get a demo
            </a>
            <a className='tc-btn tc-btn-line' href='#contact'>
              Talk to an engineer
            </a>
          </div>
          {/* the customers live INSIDE the hole: quiet marks in the dark */}
          <div className='eh-core-logos' data-hero-in aria-label='Trusted by'>
            {CUSTOMERS.map((customer) => (
              <i className={`eh-corewm ${customer.mark}`} key={customer.name}>
                {customer.name}
              </i>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
