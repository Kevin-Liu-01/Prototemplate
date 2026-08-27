'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import {
  createHorizonField,
  type HorizonFieldHandle,
} from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

/**
 * The careers hero's lensed hole, carried over from the shipped page:
 * apps/landing/src/components/pages/careers/CareersHorizon.tsx mounts the
 * shared OrbitHorizon (apps/landing/src/components/landing/shared/
 * OrbitHorizon.tsx) with the careers geometry —
 *
 *   orbitRadiusScale 1.26 · redshiftDuration 180 · fieldSpeed 0.38
 *   mobileWidthFactor 0.8 · wideCenterYFactor 0.48 · canvasHalfScale 2.08
 *
 * — and those six numbers are the constants below. Careers is the only
 * consumer on this route, so the generic props collapse into the values it
 * passes; everything else (the packing, the per-glyph roll, the doppler
 * sweep, the reveal handshake) is the shipped component's own algorithm.
 *
 * The one substitution: the shipped ring seats a LocaleFlag from the UI
 * package, which this app does not carry. flag-icons draws the same 30
 * flags in the same order — the codes below are the country halves of the
 * shipped LOCALE_ORBIT's BCP-47 tags, unchanged.
 */

type OrbitEntry = {
  /** flag-icons country code — the country half of the shipped locale tag. */
  flag: string;
  name: string;
  /** Scripts whose letters must never be split travel as one glyph. */
  whole?: boolean;
};

/* The shipped LOCALE_ORBIT, order for order: en-US, ja-JP, pt-BR, ko-KR,
   uk-UA, zh-CN, fr-FR, ar-SA, nl-NL, hi-IN, de-DE, th-TH, vi-VN, he-IL,
   it-IT, pl-PL, sv-SE, es-MX, id-ID, tr-TR, ru-RU, el-GR, fi-FI, no-NO,
   da-DK, cs-CZ, ro-RO, hu-HU, fil-PH, ms-MY. Native names, not exonyms. */
const LOCALE_ORBIT: readonly OrbitEntry[] = [
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

/* ---- the careers geometry: OrbitHorizon's props as this page passes them ---- */
const ORBIT_RADIUS_SCALE = 1.26;
const REDSHIFT_DURATION = 180;
const FIELD_SPEED = 0.38;
const MOBILE_WIDTH_FACTOR = 0.8;
const WIDE_CENTER_Y_FACTOR = 0.48;
const CANVAS_HALF_SCALE = 2.08;

/* ---- the shared ring constants ---- */
const ORBIT_DURATION = 130;
const WIDE_ORBIT_TILT = 0.94;
const MOBILE_ORBIT_TILT = 0.99;
const ORBIT_GAP = 26;
const GLYPH_ROLL_DURATION = 0.5;
const FLAG_SWEEP_DURATION = 1;
const LETTER_ROLL_DURATION = 0.28;
const FLAG_GAP = 9;
const REDSHIFT_START_ANGLE = 2.55;
const TAU = Math.PI * 2;

/* The field's themed inks: the emission keeps its native additive
   color in BOTH themes — the hole is the hole. Only the ruled lines
   and guide rings re-ink for the ground they cross. */
const HORIZON_DARK = {
  chroma: 0.82,
  doppler: 0.85,
  exposure: 2.1,
  lightGain: 1.32,
  swirl: 1.32,
  ink: [1, 1, 1] as [number, number, number],
  /* no guide rings — they read as stray circles around the horizon */
  ringAlpha: [0, 0, 0] as [number, number, number],
  ruleAlpha: 0.1,
  /* explicit: theme flips patch by merge, so BOTH sets must write the
     core or the other theme's disc color sticks */
  core: [0.02, 0.027, 0.043] as [number, number, number],
};

const HORIZON_LIGHT = {
  ...HORIZON_DARK,
  ink: [0.04, 0.044, 0.051] as [number, number, number],
  /* the white hole: the light sheet trades the disc's ink for paper —
     the chromatic rim carries the horizon's definition */
  core: [0.99, 0.988, 0.984] as [number, number, number],
};

type OrbitGlyph = {
  element: HTMLElement;
  offset: number;
  blend: number;
  threshold: number;
  duration: number;
};

type OrbitWord = {
  root: HTMLElement;
  glyphs: OrbitGlyph[];
  flag: OrbitGlyph | null;
  side: 0 | 1 | -1;
  angle: number;
  span: number;
  lead: number;
  active: boolean;
};

const clampUnit = (value: number) => Math.min(Math.max(value, 0), 1);

/** A CSS cubic-bezier(x1, y1, x2, y2) as a solvable easing function. */
const cubicBezier = (
  point1X: number,
  point1Y: number,
  point2X: number,
  point2Y: number
) => {
  const cx = 3 * point1X;
  const bx = 3 * (point2X - point1X) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * point1Y;
  const by = 3 * (point2Y - point1Y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (time: number) => ((ax * time + bx) * time + cx) * time;
  const sampleDerivativeX = (time: number) =>
    (3 * ax * time + 2 * bx) * time + cx;

  return (value: number) => {
    const clamped = clampUnit(value);
    let time = clamped;
    for (let index = 0; index < 5; index += 1) {
      const delta = sampleX(time) - clamped;
      const derivative = sampleDerivativeX(time);
      if (Math.abs(delta) < 0.0001 || Math.abs(derivative) < 0.000001) break;
      time -= delta / derivative;
    }
    time = clampUnit(time);
    return ((ay * time + by) * time + cy) * time;
  };
};

const rollEase = cubicBezier(0.65, 0.05, 0.35, 1);

export default function CareersHorizon() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      const canvas = canvasRef.current;
      const orbit = orbitRef.current;
      const frame = host?.parentElement;
      if (!host || !canvas || !orbit || !frame) return;

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const doc = document.documentElement;
      const themedParams = () =>
        doc.getAttribute('data-theme') === 'dark'
          ? HORIZON_DARK
          : HORIZON_LIGHT;
      const field: HorizonFieldHandle | null = createHorizonField(canvas, {
        speed: FIELD_SPEED,
        params: themedParams(),
      });
      const themeObserver = new MutationObserver(() =>
        field?.setParams(themedParams())
      );
      themeObserver.observe(doc, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      const wordElements = Array.from(
        orbit.querySelectorAll<HTMLElement>('.prc-orbit-word')
      );
      let orbitRadius = 320;
      let orbitTilt = WIDE_ORBIT_TILT;
      const words: OrbitWord[] = wordElements.map((wordRoot) => {
        wordRoot.style.removeProperty('opacity');
        const parts = Array.from(
          wordRoot.querySelectorAll<HTMLElement>('[data-orbit-part]')
        );
        const letters = parts.filter(
          (part) => !part.classList.contains('prc-orbit-flag')
        );
        const flagElement = parts.find((part) =>
          part.classList.contains('prc-orbit-flag')
        );
        return {
          root: wordRoot,
          glyphs: letters.map((element) => ({
            element,
            offset: 0,
            blend: 0,
            threshold: 0,
            duration: LETTER_ROLL_DURATION,
          })),
          flag: flagElement
            ? {
                element: flagElement,
                offset: 0,
                blend: 0,
                threshold: 0,
                duration: GLYPH_ROLL_DURATION,
              }
            : null,
          side: -1,
          angle: 0,
          span: 0,
          lead: 0,
          active: true,
        };
      });

      /* offsetWidth is transform-free, so this works before AND after the
         glyphs go absolute — and again when the webfont lands. */
      const measureWords = () => {
        for (const word of words) {
          const widths = word.glyphs.map(
            (glyph) => glyph.element.offsetWidth || 7
          );
          const totalWidth = widths.reduce((sum, width) => sum + width, 0);
          let currentWidth = 0;
          for (const [index, glyph] of word.glyphs.entries()) {
            const width = widths[index] ?? 7;
            glyph.offset = currentWidth + width / 2 - totalWidth / 2;
            currentWidth += width;
          }

          const flagWidth = word.flag ? word.flag.element.offsetWidth || 16 : 0;
          if (word.flag) {
            word.flag.offset = -(totalWidth / 2 + FLAG_GAP + flagWidth / 2);
          }
          /* SYMMETRIC extents: the flag end reaches further than the letter
             end, so every offset shifts by half that difference — the word
             then occupies ±span/2 around its seat in BOTH mirror states. */
          const leadExtent = totalWidth / 2 + FLAG_GAP + flagWidth;
          const trailExtent = totalWidth / 2;
          const shift = (leadExtent - trailExtent) / 2;
          for (const glyph of word.glyphs) glyph.offset += shift;
          if (word.flag) word.flag.offset += shift;
          word.span = leadExtent + trailExtent;
          word.lead = word.span / 2;
        }
      };

      /* Arc-length packing: every word takes exactly its own span plus ONE
         constant small gap, measured along the ring. Words that no longer
         fit at this orbit size sit out, and whatever arc is left over
         widens every gap equally. */
      const packWords = () => {
        const circumference = TAU * orbitRadius;
        let visibleCount = 0;
        let usedWidth = 0;
        for (const word of words) {
          if (usedWidth + word.span + ORBIT_GAP > circumference) break;
          usedWidth += word.span + ORBIT_GAP;
          visibleCount += 1;
        }
        const gap =
          visibleCount > 0
            ? (circumference - (usedWidth - visibleCount * ORBIT_GAP)) /
              visibleCount
            : ORBIT_GAP;
        let currentWidth = 0;
        for (const [index, word] of words.entries()) {
          word.active = index < visibleCount;
          word.root.style.visibility = word.active ? 'visible' : 'hidden';
          if (!word.active) continue;
          word.angle = ((currentWidth + word.lead) / circumference) * TAU;
          currentWidth += word.span + gap;
        }
      };

      const placeGlyph = (
        glyph: OrbitGlyph,
        angle: number,
        target: 0 | 1,
        scale: number,
        deltaTime: number,
        advance = true
      ) => {
        if (advance) {
          glyph.blend = clampUnit(
            glyph.blend +
              (target > glyph.blend
                ? deltaTime / glyph.duration
                : -deltaTime / glyph.duration)
          );
        }
        const roll = rollEase(glyph.blend);
        const mirroredOffset = 1 - 2 * roll;
        const glyphAngle =
          angle + (glyph.offset * mirroredOffset) / orbitRadius;
        const sine = Math.sin(glyphAngle);
        const cosine = Math.cos(glyphAngle);
        const x = orbitRadius * sine;
        const y = -orbitRadius * orbitTilt * cosine;
        const rotation = Math.atan2(orbitTilt * sine, cosine) + Math.PI * roll;
        glyph.element.style.transform = `translate(${x.toFixed(
          2
        )}px, ${y.toFixed(2)}px) translate(-50%, -50%) rotate(${rotation.toFixed(
          4
        )}rad) scale(${scale.toFixed(3)})`;
      };

      let lastTime = 0;
      const placeWords = (time: number) => {
        const deltaTime = Math.min(Math.max(time - lastTime, 0), 0.06);
        lastTime = time;
        const phase = (time / ORBIT_DURATION) * TAU;
        for (const word of words) {
          if (!word.active) continue;
          const angle = phase + word.angle;
          const cosine = Math.cos(angle);
          const side: 0 | 1 = cosine < 0 ? 1 : 0;
          if (word.side !== side) {
            const firstPlacement = word.side === -1;
            word.side = side;
            /* the flag GUIDES the rewrite: each letter's hop is keyed to a
               threshold on the flag's own eased progress. */
            const orderedGlyphs = [...word.glyphs].sort(
              (left, right) =>
                right.offset * (side ? 1 : -1) - left.offset * (side ? 1 : -1)
            );
            for (const [index, glyph] of orderedGlyphs.entries()) {
              glyph.threshold = firstPlacement
                ? 0
                : (index + 0.5) / (orderedGlyphs.length + 1);
              glyph.duration = LETTER_ROLL_DURATION;
            }
            if (word.flag) {
              word.flag.duration = firstPlacement
                ? GLYPH_ROLL_DURATION
                : FLAG_SWEEP_DURATION;
            }
            if (firstPlacement) {
              for (const glyph of word.glyphs) glyph.blend = side;
              if (word.flag) word.flag.blend = side;
            }
          }

          const scale = 1 - 0.13 * cosine;
          if (word.flag) {
            placeGlyph(word.flag, angle, side, scale, deltaTime);
          }
          const flagProgress = word.flag
            ? rollEase(side === 1 ? word.flag.blend : 1 - word.flag.blend)
            : 1;
          for (const glyph of word.glyphs) {
            placeGlyph(
              glyph,
              angle,
              side,
              scale,
              deltaTime,
              flagProgress >= glyph.threshold
            );
          }
        }
      };

      /* the reduced-motion still: re-snap every word onto the current
         ring (side resets so first-placement logic re-seats blends),
         then run the settle sweep placeWords needs to converge */
      const settleWords = () => {
        for (const word of words) word.side = -1;
        for (let index = 0; index <= 12; index += 1) {
          placeWords(42 + index * 0.06);
        }
      };

      let lastWide: boolean | null = null;
      const fit = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (width < 2 || height < 2) return;

        const wide = width >= 760;
        /* one disc size across careers and yc — the same formula lives
           in both heroes, so the holes always match. The height fit
           solves the radius back from the ORBIT's vertical semi-extent
           (ring × tilt + a word's own box), using the larger of the
           two pages' ring scales (yc's 1.36) so neither page ever
           clips a flag at the band's edges. */
        const wordPad = 18;
        const edgeInset = 24;
        const fitWide = (height / 2 - edgeInset - wordPad) / (1.36 * 0.94);
        const fitNarrow = (height / 2 - edgeInset - wordPad) / (1.15 * 0.99);
        const radius = wide
          ? Math.min(Math.max(width * 0.26, 280), 360, fitWide)
          : Math.min(width * 0.64, 250, fitNarrow);
        const orbitV = wide
          ? radius * ORBIT_RADIUS_SCALE * WIDE_ORBIT_TILT + wordPad
          : Math.min(radius * 1.15, width * MOBILE_WIDTH_FACTOR) *
              MOBILE_ORBIT_TILT +
            wordPad;
        const centerX = width / 2;
        const centerY = Math.max(
          Math.min(
            height * (wide ? WIDE_CENTER_Y_FACTOR : 0.46),
            height - orbitV - edgeInset
          ),
          orbitV + edgeInset
        );
        orbitTilt = wide ? WIDE_ORBIT_TILT : MOBILE_ORBIT_TILT;
        orbitRadius = wide
          ? radius * ORBIT_RADIUS_SCALE
          : Math.min(radius * 1.15, width * MOBILE_WIDTH_FACTOR);
        packWords();

        const half = radius * CANVAS_HALF_SCALE;

        frame.style.setProperty('--prc-hole-x', `${centerX}px`);
        frame.style.setProperty('--prc-hole-y', `${centerY}px`);
        frame.style.setProperty('--prc-hole-radius', `${radius}px`);
        canvas.style.left = `${centerX - half}px`;
        canvas.style.top = `${centerY - half}px`;
        canvas.style.width = `${half * 2}px`;
        canvas.style.height = `${half * 2}px`;
        orbit.style.left = `${centerX}px`;
        orbit.style.top = `${centerY}px`;
        field?.setParams({
          center: [half, half],
          radius,
          worldOrigin: [centerX - half, centerY - half],
        });

        /* crossing the 760 cut swaps the CSS glyph metrics: re-measure
           and re-pack once styles apply, or letters keep stale widths */
        if (lastWide !== null && wide !== lastWide) {
          requestAnimationFrame(() => {
            measureWords();
            packWords();
            if (reducedMotion) settleWords();
          });
        }
        lastWide = wide;

        /* setParams above already re-renders the static frame when the
           field is not running; only the WORD ring needs a re-settle */
        if (reducedMotion) settleWords();
      };

      measureWords();
      fit();
      /* the reveal must not land in the mount frame: the hidden state
         has to reach the screen once, or the crossfade and the ring's
         staggered entrance collapse into an instant swap */
      let reveal = 0;
      if (field) {
        reveal = requestAnimationFrame(() => {
          reveal = requestAnimationFrame(() => {
            orbit.dataset.live = '1';
            host.classList.add('is-live');
          });
        });
      } else {
        /* WebGL out: the stand-in disc surfaces and the ring arrives */
        host.classList.add('is-fallback');
        orbit.dataset.live = '1';
      }
      let destroyed = false;
      void document.fonts.ready.then(() => {
        if (destroyed) return;
        measureWords();
        packWords();
        if (reducedMotion) settleWords();
      });

      const observer = new ResizeObserver(fit);
      observer.observe(host);

      let active = true;
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (entry) active = entry.isIntersecting;
        },
        { rootMargin: '120px' }
      );
      visibilityObserver.observe(host);

      const tick = () => {
        if (!active || document.hidden) return;
        const time = gsap.ticker.time;
        placeWords(time);
        field?.setParams({
          dopplerAngle:
            REDSHIFT_START_ANGLE + (time / REDSHIFT_DURATION) * TAU,
        });
      };

      if (reducedMotion) {
        settleWords();
      } else {
        gsap.ticker.add(tick);
      }

      return () => {
        destroyed = true;
        cancelAnimationFrame(reveal);
        observer.disconnect();
        visibilityObserver.disconnect();
        themeObserver.disconnect();
        gsap.ticker.remove(tick);
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <div
      className='prc-horizon-scene prc-hole-scene'
      ref={root}
      role='img'
      aria-label='Languages orbit an event horizon with gravitational field lines'
    >
      {/* server-rendered stand-in at the disc's resolved geometry: the
          shader crossfades over it once the field boots, so the hole
          never pops into an empty band (and stays if WebGL is out) */}
      <div className='prc-hole-placeholder' aria-hidden='true' />
      <canvas
        className='prc-horizon-canvas prc-hole-canvas'
        ref={canvasRef}
        aria-hidden='true'
      />
      <div className='prc-orbit' ref={orbitRef} aria-hidden='true'>
        {LOCALE_ORBIT.map((entry) => (
          <span className='prc-orbit-word' key={entry.name}>
            <i
              className={`prc-orbit-flag fi fi-${entry.flag}`}
              data-orbit-part
            />
            {entry.whole ? (
              <b data-orbit-part>{entry.name}</b>
            ) : (
              [...entry.name].map((character, index) => (
                <b data-orbit-part key={`${entry.name}-${index}`}>
                  {character === ' ' ? '\u00A0' : character}
                </b>
              ))
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
