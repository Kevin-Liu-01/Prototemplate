'use client';

import gsap from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

import { watchVisibility } from './visibility';

/** One headline word, with the BCP-47 tag the measurer and the live word
    shape with, and the direction its run renders in. */
export type EveryWord = { text: string; lang: string; rtl?: boolean };

/* "every" across maximally different writing systems (Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek), short tokens so the
   re-measured line never wraps. Arabic is flagged RTL so its run renders
   right-to-left inside the em's bidi isolate and can never reorder the
   sentence's trailing period. */
export const EVERY_WORDS: readonly EveryWord[] = [
  { text: 'language', lang: 'en' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', rtl: true },
  { text: 'भाषा', lang: 'hi' },
  { text: 'язык', lang: 'ru' },
  { text: '语言', lang: 'zh' },
  { text: '언어', lang: 'ko' },
  { text: 'γλώσσα', lang: 'el' },
];

const FIRST_WORD: EveryWord = { text: 'language', lang: 'en' };

/** The dissolve dust pool: small glyphs sampled across the same scripts. */
export const EVERY_DUST = 'あ字كहξжか한グمัถイ고ρ';

const DUST_COUNT = 44;

/** Seconds the finished word holds between two swaps. */
const HOLD = 2.2;
const COMPACT_HOLD = 2.4;

export type EveryMorphOptions = {
  /** The glyphs the dust cycles through. */
  dust?: string;
  /** Seconds before the first swap above 720px, so a capture of the first
      fold shows the whole word. */
  firstDelay?: number;
  /** Seconds before the first swap at 720px and below. */
  compactFirstDelay?: number;
  /** Where the sampled letterforms sit on the measuring canvas: centred
      (`middle`) or on a baseline at 85% of its height (`alphabetic`). */
  baseline?: 'middle' | 'alphabetic';
  /** The scatter ring's vertical band as fractions of the em's height: the
      highest and lowest y a dust glyph may take, and the ring's centre. */
  scatter?: { top: number; bottom: number; centre: number };
};

type Point = { x: number; y: number };

/**
 * The headline hinge: every few seconds the word inside `em` dissolves and
 * the next word in `EVERY_WORDS` forms in its place.
 *
 * Each cycle the bound guides appear around the current word, the word
 * dissolves while the dust scatters, the bounds tween to the next word's
 * measured width before any text exists, then the dust converges onto the
 * new word's sampled letterforms and the word fills them in behind a wipe
 * from its reading side. At 720px and below a measured crossfade replaces
 * the dust.
 *
 * The width the sentence reflows around is always the whole shaped word,
 * measured on a hidden probe that carries the word's own lang and dir and
 * the em's inherited type, never a sum of per-character boxes (which
 * disconnects Arabic joining and splits Devanagari matras). The em's width
 * is the only layout property that animates: it holds the shaped width at
 * rest, glides through one device-pixel-snapped tween per cycle, and is
 * measured again when the fonts arrive or the viewport resizes.
 *
 * The loop runs only while the em is on screen: a swap that falls due while
 * the em is off screen waits, and runs one hold after the em returns. Its
 * tweens belong to no GSAP context, so a caller's `useGSAP` context never
 * collects them; the returned function stops the loop, removes the nodes it
 * added and leaves the first word at rest.
 */
export function startEveryMorph(em: HTMLElement, word: HTMLElement, options: EveryMorphOptions = {}) {
  const {
    dust: dustText = EVERY_DUST,
    firstDelay = 5.6,
    compactFirstDelay = 3.4,
    baseline = 'middle',
    scatter = { top: -0.02, bottom: 0.32, centre: 0.1 },
  } = options;

  const compact = window.matchMedia('(max-width: 720px)').matches;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const snapPx = (w: number) => Math.round(w * dpr) / dpr;

  /* Every tween the loop makes is created with no GSAP context current, so
     its callbacks also run with none and nothing outside this function keeps
     a reference to a finished cycle. */
  const free = gsap.context();
  /* the current cycle's animations, so a stop can kill any still running */
  const live = new Set<gsap.core.Animation>();
  const track = <T extends gsap.core.Animation>(animation: T): T => {
    live.add(animation);
    return animation;
  };
  let pending: gsap.core.Tween | null = null;
  const later = (delay: number, run: () => void) => {
    free.ignore(() => {
      pending = gsap.delayedCall(delay, () => {
        pending = null;
        run();
      });
    });
  };

  const widthCache = new Map<string, number>();
  const measure = (w: EveryWord) => {
    const hit = widthCache.get(w.text);
    if (hit !== undefined) return hit;
    const probe = document.createElement('span');
    probe.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:0;white-space:nowrap;';
    probe.setAttribute('lang', w.lang);
    probe.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
    probe.textContent = w.text;
    em.appendChild(probe);
    const width = snapPx(probe.getBoundingClientRect().width);
    probe.remove();
    widthCache.set(w.text, width);
    return width;
  };

  /* the live word is one shaped text node: lang for font selection, dir so
     the RTL run renders right-to-left inside its isolate */
  const showWord = (w: EveryWord) => {
    word.textContent = w.text;
    word.setAttribute('lang', w.lang);
    word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
  };

  let idx = 0;
  let morphing = false;
  const wordAt = (i: number) => EVERY_WORDS[i] ?? FIRST_WORD;
  const holdWidth = () => {
    em.style.width = `${measure(wordAt(idx))}px`;
  };
  const remeasure = () => {
    if (!em.isConnected) return;
    widthCache.clear();
    if (!morphing) holdWidth();
  };
  window.addEventListener('resize', remeasure);
  void document.fonts.ready.then(remeasure);
  holdWidth();

  const guideL = document.createElement('span');
  guideL.className = 'tc-eg is-l';
  const guideR = document.createElement('span');
  guideR.className = 'tc-eg is-r';
  const dustBox = document.createElement('span');
  dustBox.className = 'tc-edust';
  const dustGlyphs: HTMLElement[] = [];

  let cycle: () => void;
  let hold: number;
  let visible = false;
  let parked = false;
  let stopped = false;
  /* A cycle that falls due while the em is off screen parks itself; the
     em's return runs it one hold later. */
  const step = () => {
    if (stopped) return;
    if (!visible) {
      parked = true;
      return;
    }
    live.clear();
    cycle();
  };

  if (compact) {
    hold = COMPACT_HOLD;
    /* At phone scale the particles cannot breathe: a measured crossfade
       tells the same story. */
    cycle = () => {
      idx = (idx + 1) % EVERY_WORDS.length;
      const next = wordAt(idx);
      const w1 = measure(next);
      morphing = true;
      free.ignore(() => {
        track(
          gsap.to(word, {
            autoAlpha: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
              showWord(next);
              track(
                gsap.to(em, {
                  width: w1,
                  duration: 0.5,
                  ease: 'power2.inOut',
                  snap: { width: 1 / dpr },
                  onComplete: () => {
                    morphing = false;
                    holdWidth();
                  },
                })
              );
              track(gsap.to(word, { autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.18 }));
              later(hold, step);
            },
          })
        );
      });
    };
  } else {
    hold = HOLD;
    const dustChars = [...dustText];
    for (let i = 0; i < DUST_COUNT; i++) {
      const g = document.createElement('span');
      g.textContent = dustChars[i % dustChars.length] ?? '';
      dustBox.appendChild(g);
      dustGlyphs.push(g);
    }
    em.append(guideL, guideR, dustBox);

    /* Sample the incoming word's letterforms: draw it on an offscreen canvas
       at the em's own font and tracking and collect the dark pixels. The dust
       converges onto these points, so the glyphs sketch the characters'
       shapes before the characters fill in. */
    const sampleShape = (text: string, width: number, height: number, count: number) => {
      const style = getComputedStyle(word);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(Math.ceil(width * 1.25) + 24, 10);
      canvas.height = Math.max(height, 10);
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      // the DOM word is tracked; an untracked raster runs wide and clips the last glyph
      if (style.letterSpacing !== 'normal') ctx.letterSpacing = `${parseFloat(style.letterSpacing)}px`;
      if (baseline === 'alphabetic') {
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, 0, canvas.height * 0.85);
      } else {
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, canvas.height / 2);
      }
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const pts: Point[] = [];
      const pitch = 3;
      for (let y = 0; y < canvas.height; y += pitch) {
        for (let x = 0; x < canvas.width; x += pitch) {
          if ((img[(y * canvas.width + x) * 4 + 3] ?? 0) > 128) pts.push({ x, y });
        }
      }
      let maxX = 0;
      for (const pt of pts) maxX = Math.max(maxX, pt.x);
      if (maxX > width) {
        const fit = width / maxX;
        for (const pt of pts) pt.x *= fit;
      }
      // spread the picks across the whole word rather than clustering
      const picked: Point[] = [];
      if (pts.length) {
        const stride = Math.max(1, Math.floor(pts.length / count));
        for (let i = 0; i < pts.length && picked.length < count; i += stride) {
          const pt = pts[i];
          if (pt) picked.push(pt);
        }
      }
      return picked;
    };

    cycle = () => {
      const w0 = measure(wordAt(idx));
      idx = (idx + 1) % EVERY_WORDS.length;
      const next = wordAt(idx);
      const w1 = measure(next);
      morphing = true;
      free.ignore(() => {
        const tl = track(
          gsap.timeline({
            onComplete: () => {
              morphing = false;
              /* re-assert from a fresh cache in case fonts or the viewport
                 moved mid-morph; otherwise the same value, so nothing snaps */
              holdWidth();
              later(hold, step);
            },
          })
        );

        // 1. the guides appear around the current word
        tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

        // 2. the word dissolves as one shaped run (per-character spans would
        //    disconnect Arabic and reflow the width the sentence stands on)
        //    while the dust carries the scatter
        tl.to(
          word,
          { autoAlpha: 0, scale: 0.92, transformOrigin: '50% 60%', duration: 0.3, ease: 'power2.in' },
          '+=0.05'
        );
        /* the cloud separates symmetrically about the word's centre: each
           glyph takes an evenly spread angle on a jittered ring */
        const h0 = em.offsetHeight;
        const ring = (w: number) => (i: number): Point => {
          const angle = (i / dustGlyphs.length) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2);
          const rx = gsap.utils.random(0.18, 0.44) * w;
          const ry = gsap.utils.random(6, h0 * 0.26);
          return {
            // clamped so no glyph ever leaves the measured bounds
            x: gsap.utils.clamp(3, w - 3, w / 2 + Math.cos(angle) * rx),
            y: gsap.utils.clamp(h0 * scatter.top, h0 * scatter.bottom, h0 * scatter.centre + Math.sin(angle) * ry),
          };
        };
        const place0 = ring(Math.max(w0, 30));
        tl.to(
          dustGlyphs,
          {
            autoAlpha: () => gsap.utils.random(0.35, 0.8),
            x: (i: number) => place0(i).x,
            y: (i: number) => place0(i).y,
            duration: 0.26,
            stagger: 0.012,
            ease: 'power1.out',
          },
          '<+=0.1'
        );

        // 3. the bounds glide to the incoming word's shaped width: one
        //    continuous tween, quantized to device pixels, so the period and
        //    everything after it track without buzz or end snap
        tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } });
        const place1 = ring(Math.max(w1, 30));
        tl.to(
          dustGlyphs,
          { x: (i: number) => place1(i).x, y: (i: number) => place1(i).y, duration: 0.7, ease: 'power2.inOut' },
          '<'
        );

        // 4. the dust assembles the incoming characters' shapes, then the
        //    word fills the silhouette in as one shaped run behind a wipe
        //    that enters from the script's reading side
        tl.add(() => {
          const h = em.offsetHeight;
          const pts = sampleShape(next.text, w1, h, dustGlyphs.length);
          dustGlyphs.forEach((g, i) => {
            const pt = pts[i % Math.max(pts.length, 1)] ?? { x: w1 / 2, y: h / 2 };
            track(gsap.to(g, { x: pt.x, y: pt.y - h * 0.4, autoAlpha: 0.9, duration: 0.38, ease: 'power3.inOut', delay: i * 0.008 }));
          });
          track(
            gsap.delayedCall(0.42, () => {
              showWord(next);
              track(
                gsap.fromTo(
                  word,
                  {
                    autoAlpha: 0,
                    scale: 1,
                    clipPath: next.rtl ? 'inset(-15% 0% -15% 100%)' : 'inset(-15% 100% -15% 0%)',
                  },
                  {
                    autoAlpha: 1,
                    clipPath: 'inset(-15% 0% -15% 0%)',
                    duration: 0.34,
                    ease: 'power2.out',
                    onComplete: () => {
                      gsap.set(word, { clearProps: 'clipPath' });
                    },
                  }
                )
              );
              track(gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.26, stagger: 0.006, ease: 'power1.out', delay: 0.08 }));
            })
          );
        });
        tl.to({}, { duration: 0.85 });

        // 5. the guides withdraw
        tl.to([guideL, guideR], { opacity: 0, duration: 0.24, ease: 'none' }, '>-0.05');
      });
    };
  }

  let watch: ScrollTrigger | undefined;
  free.ignore(() => {
    watch = watchVisibility(em, (next) => {
      visible = next;
      if (!visible || !parked || stopped) return;
      parked = false;
      later(hold, step);
    });
  });

  later(compact ? compactFirstDelay : firstDelay, step);

  return () => {
    stopped = true;
    watch?.kill();
    window.removeEventListener('resize', remeasure);
    pending?.kill();
    for (const animation of live) animation.kill();
    live.clear();
    guideL.remove();
    guideR.remove();
    dustBox.remove();
    showWord(FIRST_WORD);
    free.ignore(() => gsap.set(word, { clearProps: 'opacity,visibility,transform,clipPath' }));
    em.style.width = '';
  };
}
