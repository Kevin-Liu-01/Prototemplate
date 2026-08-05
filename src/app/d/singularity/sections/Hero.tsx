'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

/* The customers whose marks ride inside the hole, under the CTAs. */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* The locale chips that orbit the horizon — native names, not English
   exonyms. Scripts whose letters must never be split (joining Arabic,
   Hebrew, Devanagari matras, Thai clusters) are marked whole. */
const BELT: readonly { flag: string; name: string; whole?: boolean }[] = [
  { flag: 'us', name: 'English' },
  { flag: 'jp', name: '日本語' },
  { flag: 'br', name: 'Português' },
  { flag: 'kr', name: '한국어' },
  { flag: 'ua', name: 'Українська' },
  { flag: 'cn', name: '简体中文' },
  { flag: 'fr', name: 'Français' },
  { flag: 'sa', name: 'العربية', whole: true },
  { flag: 'nl', name: 'Nederlands' },
  { flag: 'in', name: 'हिन्दी', whole: true },
  { flag: 'de', name: 'Deutsch' },
  { flag: 'th', name: 'ไทย', whole: true },
  { flag: 'vn', name: 'Tiếng Việt' },
  { flag: 'il', name: 'עברית', whole: true },
  { flag: 'it', name: 'Italiano' },
  { flag: 'pl', name: 'Polski' },
  { flag: 'se', name: 'Svenska' },
  { flag: 'mx', name: 'Español' },
  { flag: 'id', name: 'Bahasa Indonesia' },
  { flag: 'tr', name: 'Türkçe' },
  { flag: 'ru', name: 'Русский' },
  { flag: 'gr', name: 'Ελληνικά' },
  { flag: 'fi', name: 'Suomi' },
  { flag: 'no', name: 'Norsk' },
  { flag: 'dk', name: 'Dansk' },
  { flag: 'cz', name: 'Čeština' },
  { flag: 'ro', name: 'Română' },
  { flag: 'hu', name: 'Magyar' },
  { flag: 'ph', name: 'Filipino' },
  { flag: 'my', name: 'Melayu' },
];

/** Flag-orbit radius as a multiple of the horizon radius (wide mode). */
const ORBIT_K = 1.36;
/** Seconds per full revolution of the flag orbit. */
const ORBIT_DUR = 130;
/** Vertical squash of the flag orbit — a slightly inclined orbital plane. */
const ORBIT_TILT = 0.94;
/** The constant arc gap between one word's end and the next word's flag,
    px along the belt — the same small breath everywhere on the ring. */
const BELT_GAP = 26;
/** Seconds a glyph takes to roll over as it crosses the orbit's side. */
const ROLL_S = 0.5;
/** The flag's full sweep across the word at a crossing, seconds. */
const FLAG_SWEEP_S = 1.0;
/** One letter's hop, triggered as the flag's front reaches it. */
const LETTER_S = 0.28;
/** Arc gap between the word's leading edge and its flag, px. */
const FLAG_PAD = 9;

const TAU = Math.PI * 2;

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const smooth01 = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** A CSS cubic-bezier(x1, y1, x2, y2) as a solvable easing function —
    Newton's method on the x polynomial, then evaluate y. */
const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    const c = clamp01(x);
    let t = c;
    for (let i = 0; i < 5; i++) {
      const dx = sampleX(t) - c;
      const d = sampleDX(t);
      if (Math.abs(dx) < 1e-4 || Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    t = clamp01(t);
    return ((ay * t + by) * t + cy) * t;
  };
};

/** The house ease — the roll and the flag's travel ride this curve. */
const ROLL_EASE = cubicBezier(0.65, 0.05, 0.35, 1);

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
      const chips = Array.from(orbit.querySelectorAll<HTMLElement>('.eh-word'));

      let wide = true;
      let cy = 0;
      let r = 240;
      let orbitR = 320;

      /* The belt, WRAPPED around the horizon — no pills, no tabs: each
         word's glyphs sit individually ON the orbit's arc, rotated to its
         local tangent, so the words themselves curve with the circle. On
         the far (top) arc a word reads along the outside; as each glyph
         crosses the orbit's side it ROLLS over (blended, ~0.5s) into the
         near arc's orientation, so text never hangs upside down and the
         roll ripples through the word glyph by glyph. The flag always
         rides the leading (+θ) end of its word: because the glyph order
         mirrors across the sides, the flag visibly slides from one end of
         the word to the other at every turn. Kepler pacing, depth swell,
         far-side dim and blur act on the whole word. */
      type Glyph = {
        el: HTMLElement;
        off: number;
        blend: number;
        /** the flag-progress threshold at which this letter's hop begins */
        thr: number;
        /** seconds this glyph's roll takes */
        dur: number;
      };
      type Word = {
        root: HTMLElement;
        glyphs: Glyph[];
        flag: Glyph | null;
        side: 0 | 1 | -1;
        /** the word's seat on the ring, radians — set by packBelt() */
        ang: number;
        /** arc the word occupies (flag seat + letters), px */
        span: number;
        /** px from the word's anchor back to its leading (flag) edge */
        lead: number;
        active: boolean;
      };

      const words: Word[] = chips.map((root) => {
        const parts = Array.from(root.querySelectorAll<HTMLElement>('[data-lt]'));
        const letters = parts.filter((p) => !p.classList.contains('eh-wflag'));
        const flagEl = parts.find((p) => p.classList.contains('eh-wflag'));
        return {
          root,
          glyphs: letters.map((el) => ({ el, off: 0, blend: 0, thr: 0, dur: LETTER_S })),
          flag: flagEl ? { el: flagEl, off: 0, blend: 0, thr: 0, dur: ROLL_S } : null,
          side: -1,
          ang: 0,
          span: 0,
          lead: 0,
          active: true,
        };
      });

      /* offsetWidth is transform-free, so this works before AND after the
         glyphs go absolute — and again when the webfont lands. */
      const buildOffsets = () => {
        for (const word of words) {
          const widths = word.glyphs.map((g) => g.el.offsetWidth || 7);
          const total = widths.reduce((s, v) => s + v, 0);
          let cum = 0;
          for (const [j, g] of word.glyphs.entries()) {
            const w = widths[j] ?? 7;
            g.off = cum + w / 2 - total / 2;
            cum += w;
          }
          /* the flag is the word's first glyph: it sits one seat BEFORE the
             first letter and mirrors with them, so it is always to the left
             of the text in the text's own reading frame */
          const fw = word.flag ? word.flag.el.offsetWidth || 16 : 0;
          if (word.flag) word.flag.off = -(total / 2 + FLAG_PAD + fw / 2);
          /* SYMMETRIC extents: the flag end reaches further than the letter
             end, so every offset shifts by half that difference — the word
             then occupies ±span/2 around its seat in BOTH mirror states,
             and the packed gaps hold constant through every roll. */
          const leadExtent = total / 2 + FLAG_PAD + fw;
          const trailExtent = total / 2;
          const shift = (leadExtent - trailExtent) / 2;
          for (const g of word.glyphs) g.off += shift;
          if (word.flag) word.flag.off += shift;
          word.span = leadExtent + trailExtent;
          word.lead = word.span / 2;
        }
      };

      /* Arc-length packing: every word takes exactly its own span plus ONE
         constant small gap, measured along the ring — so the breath between
         any two neighbours is identical. Words that no longer fit at this
         orbit size sit out (responsive: they return when the ring grows),
         and whatever arc is left over widens every gap equally. */
      const packBelt = () => {
        const C = TAU * orbitR;
        let fit = 0;
        let used = 0;
        for (const word of words) {
          if (used + word.span + BELT_GAP > C) break;
          used += word.span + BELT_GAP;
          fit += 1;
        }
        const gap = fit > 0 ? (C - (used - fit * BELT_GAP)) / fit : BELT_GAP;
        let cum = 0;
        for (const [i, word] of words.entries()) {
          word.active = i < fit;
          word.root.style.visibility = word.active ? 'visible' : 'hidden';
          if (!word.active) continue;
          word.ang = ((cum + word.lead) / C) * TAU;
          cum += word.span + gap;
        }
      };
      buildOffsets();
      packBelt();
      orbit.dataset.live = '1';
      void document.fonts.ready.then(() => {
        buildOffsets();
        packBelt();
      });

      const placeGlyph = (
        g: Glyph,
        a: number,
        target: 0 | 1,
        scale: number,
        dt: number,
        gate = true
      ) => {
        if (gate) g.blend = clamp01(g.blend + (target > g.blend ? dt / g.dur : -dt / g.dur));
        const roll = ROLL_EASE(g.blend);
        const mNow = 1 - 2 * roll;
        /* every glyph — flag included — mirrors with the same factor, so
           the flag (seated before the first letter) is always left of the
           text IN THE TEXT'S OWN FRAME, top arc or bottom, and travels
           across the characters at each side crossing */
        const phi = a + ((g.off * mNow) / orbitR);
        const sin = Math.sin(phi);
        const cos = Math.cos(phi);
        const x = orbitR * sin;
        const y = -orbitR * ORBIT_TILT * cos;
        /* everything faces the way the text faces: local tangent, plus the
           upright roll as it crosses the sides */
        const rot = Math.atan2(ORBIT_TILT * sin, cos) + Math.PI * roll;
        g.el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(
          2
        )}px) translate(-50%, -50%) rotate(${rot.toFixed(4)}rad) scale(${scale.toFixed(3)})`;
      };

      let lastT = 0;
      const placeChips = (timeSec: number) => {
        const dt = Math.min(Math.max(timeSec - lastT, 0), 0.06);
        lastT = timeSec;
        const phase = (timeSec / ORBIT_DUR) * TAU;
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (!word || !word.active) continue;
          /* uniform revolution over arc-packed seats: any speed warp would
             stretch and squeeze the gaps the packing just made equal */
          const a = phase + word.ang;
          const cos = Math.cos(a);
          /* one coordinated ripple per word: when the word's CENTER crosses
             the orbit's side, every glyph rolls over in sequence from the
             leading end — a fast legible wave instead of a long scramble */
          const side: 0 | 1 = cos < 0 ? 1 : 0;
          if (word.side !== side) {
            const first = word.side === -1;
            word.side = side;
            /* the flag GUIDES the rewrite: each letter's hop is keyed to a
               threshold on the flag's own eased progress, so the front of
               the reorganization is wherever the flag is — the flag lifts
               off with the first letter and lands as the last one settles */
            const order = [...word.glyphs].sort(
              (p, q) => (q.off * (side ? 1 : -1)) - (p.off * (side ? 1 : -1))
            );
            const m = order.length;
            for (const [rank, g] of order.entries()) {
              g.thr = first ? 0 : (rank + 0.5) / (m + 1);
              g.dur = LETTER_S;
            }
            if (word.flag) word.flag.dur = first ? ROLL_S : FLAG_SWEEP_S;
            if (first) {
              for (const g of word.glyphs) g.blend = side;
              if (word.flag) word.flag.blend = side;
            }
          }
          const scale = 1 - 0.13 * cos;
          const dim = 1 - 0.5 * smooth01((cos - 0.35) / 0.5);
          const blur = 0.9 * smooth01((cos - 0.2) / 0.55);
          /* the flag first — its eased progress is the ripple's clock */
          if (word.flag) placeGlyph(word.flag, a, side, scale, dt);
          const flagProgress = word.flag
            ? ROLL_EASE(side === 1 ? word.flag.blend : 1 - word.flag.blend)
            : 1;
          for (const g of word.glyphs) placeGlyph(g, a, side, scale, dt, flagProgress >= g.thr);
          word.root.style.opacity = dim.toFixed(3);
          word.root.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
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
        /* the ring changed size — repack the belt for the new circumference
           (words that no longer fit sit out; gaps stay equal) */
        packBelt();

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
        if (reduced) {
          /* settle the per-glyph rolls so the still shows resolved text */
          for (let k = 0; k <= 12; k++) placeChips(42 + k * 0.06);
        } else {
          placeChips(gsap.ticker.time);
        }
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
          A dark event horizon sits at the center of otherwise empty ruled paper; the names of
          languages — Japanese, Spanish, Korean, Arabic, and more — wrap around it like a satellite
          belt, and the wordmarks of Cursor, Ramp, Profound, Partiful and ClickHouse sit inside the
          dark core.
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

        {/* The belt WRAPS the horizon — no pills, no tabs: each word's
            glyphs sit individually on the orbit's arc, rotated to the
            local tangent, rolling over one by one at the sides so text
            never inverts. The flag always rides the word's leading end.
            Joining scripts (Arabic, Hebrew, Devanagari, Thai) travel as
            one unbreakable glyph. The layer is inert. */}
        <div className='eh-orbit' ref={orbitRef} aria-hidden>
          {BELT.map((entry) => (
            <span className='eh-word' key={entry.name}>
              <i className={`eh-wflag fi fi-${entry.flag}`} data-lt />
              {entry.whole ? (
                <b data-lt>{entry.name}</b>
              ) : (
                [...entry.name].map((ch, j) => (
                  <b data-lt key={`${entry.name}-${j}`}>
                    {ch === ' ' ? ' ' : ch}
                  </b>
                ))
              )}
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
            width={48}
            height={48}
          />
          <h1 data-hero-in>
            <span>Full-stack localization</span>
            <span>for enterprises</span>
          </h1>
          <div className='eh-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#contact'>
              Talk to Sales
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
