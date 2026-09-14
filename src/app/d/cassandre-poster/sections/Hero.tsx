'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import { GtMark } from '@/components/viewer/GtMark';

import './logos-icons.css';
import { posterBurst, useDitherField } from '../fields';
import HeadMark from './deco/HeadMark';
import PosterForm from './deco/PosterForm';

import './hero-every.css';

gsap.registerPlugin(useGSAP);

/**
 * THE POSTER HERO. Three surfaces on the section's mat, separated by 1px
 * seams, top to bottom:
 *
 * 1. The plate. A full-column midnight panel in the Cassandre manner: one
 *    monumental geometric form (the T component drawn as a stepped monument
 *    between its angle brackets), a fan of rays behind it rendered by the
 *    Bayer engine as dither tiers, four small mono captions pinned to the
 *    corners, and a vermilion band along the bottom edge. The plate is dark
 *    in both themes; its ink is cream, read from the canvas's own CSS color.
 * 2. The title block. The crown (the setback mark and the wordmark in the
 *    display face) over the poster title: the claim in the display face with
 *    the morphing `language` hinge on the left, the sub with the GT mark
 *    inline, the two acts and the copyable command on the right.
 * 3. The trust strip: one lead line and the six customer wordmarks ruled
 *    into six cells.
 *
 * The headline hinge is the base's measuring instrument, unchanged: one
 * shaped text node with lang and dir, whose width is the only layout
 * property that ever animates.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* "language" across maximally different writing systems: Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek. Short tokens so the
   re-measured line never wraps. Each word carries its BCP-47 tag so the
   hidden measurer and the live word shape with the same fonts; Arabic is
   flagged RTL so its run renders right-to-left inside the em's bidi
   isolate and can never reorder the sentence's trailing period. */
type EveryWord = { text: string; lang: string; rtl?: boolean };

const EVERY: readonly EveryWord[] = [
  { text: 'language', lang: 'en' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', rtl: true },
  { text: 'भाषा', lang: 'hi' },
  { text: 'язык', lang: 'ru' },
  { text: '语言', lang: 'zh' },
  { text: '언어', lang: 'ko' },
  { text: 'γλώσσα', lang: 'el' },
];

const EVERY_FALLBACK: EveryWord = EVERY[0] ?? { text: 'language', lang: 'en' };

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* The plate's fan: focus behind the monument's plinth, opening upward,
     cream cells on midnight. The ink is the canvas's computed color
     (var(--cp-plate-ink)), resolved at mount; the still is t = 0. */
  const canvasRef = useDitherField(
    (aspect) =>
      posterBurst(aspect, {
        fx: 0.5,
        fy: 0.86,
        dir: -Math.PI / 2,
        spread: Math.PI * 0.62,
        rays: 22,
        reach: 0.95,
        spin: 0.01,
        gain: 0.9,
      }),
    {
      scale: 3,
      paper: 'transparent',
      fps: 24,
      reducedMotionTime: 0,
      themeInk: true,
      applyStyles: false,
    }
  );

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.1,
      });

      /* The headline hinge is a measuring instrument. Each cycle: the bound
         guides appear around the current word; the word dissolves while the
         dust scatters; the bounds tween to the NEXT word's measured width
         first (scoping the layout shift before any text exists), then the
         dust converges and the new word forms inside the prepared bounds.
         The doubled underline re-measures with the em at constant gauge.

         Width discipline: the width the sentence reflows around is always
         the WHOLE SHAPED word, measured by a hidden probe carrying the
         word's own lang/dir and the em's inherited type, never a sum of
         per-character boxes (which disconnects Arabic joining and splits
         Devanagari matras off their consonants). The em's width is the only
         layout-affecting property that ever animates: it holds the shaped
         width at rest, glides through ONE continuous device-pixel-snapped
         tween per cycle, and re-measures when the fonts arrive or the
         clamp()ed type resizes. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      const compactEvery = window.matchMedia('(max-width: 720px)').matches;
      let everyCleanup: (() => void) | undefined;
      if (em && word) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const snapPx = (w: number) => Math.round(w * dpr) / dpr;
        const widthCache = new Map<string, number>();
        const measure = (w: EveryWord) => {
          const hit = widthCache.get(w.text);
          if (hit !== undefined) return hit;
          const probe = document.createElement('span');
          probe.style.cssText =
            'visibility:hidden;position:absolute;left:-9999px;top:0;white-space:nowrap;';
          probe.setAttribute('lang', w.lang);
          probe.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
          probe.textContent = w.text;
          em.appendChild(probe);
          const width = snapPx(probe.getBoundingClientRect().width);
          probe.remove();
          widthCache.set(w.text, width);
          return width;
        };
        /* the live word is ONE shaped text node: lang for font selection,
           dir so the RTL run renders right-to-left inside its isolate */
        const showWord = (w: EveryWord) => {
          word.textContent = w.text;
          word.setAttribute('lang', w.lang);
          word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
        };
        let idx = 0;
        let morphing = false;
        const holdWidth = () => {
          em.style.width = `${measure(EVERY[idx] ?? EVERY_FALLBACK)}px`;
        };
        const remeasure = () => {
          if (!em.isConnected) return;
          widthCache.clear();
          if (!morphing) holdWidth();
        };
        window.addEventListener('resize', remeasure);
        void document.fonts.ready.then(remeasure);
        everyCleanup = () => window.removeEventListener('resize', remeasure);
        holdWidth();

        if (compactEvery) {
          /* At mobile scale 26 particles cannot breathe: a clean measured
             crossfade tells the same story. */
          const compactSwap = () => {
            if (!root.current || !root.current.isConnected) return;
            idx = (idx + 1) % EVERY.length;
            const next = EVERY[idx] ?? EVERY_FALLBACK;
            const w1 = measure(next);
            morphing = true;
            gsap.to(word, {
              autoAlpha: 0,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => {
                showWord(next);
                gsap.to(em, {
                  width: w1,
                  duration: 0.5,
                  ease: 'power2.inOut',
                  snap: { width: 1 / dpr },
                  onComplete: () => {
                    morphing = false;
                    holdWidth();
                  },
                });
                gsap.to(word, { autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.18 });
                gsap.delayedCall(2.4, compactSwap);
              },
            });
          };
          gsap.delayedCall(3.4, compactSwap);
        } else {
          const guideL = document.createElement('span');
          guideL.className = 'tc-eg is-l';
          const guideR = document.createElement('span');
          guideR.className = 'tc-eg is-r';
          const dust = document.createElement('span');
          dust.className = 'tc-edust';
          for (let i = 0; i < 44; i++) {
            const g = document.createElement('span');
            g.textContent = DUST[i % DUST.length] ?? '';
            dust.appendChild(g);
          }
          em.append(guideL, guideR, dust);
          const dustGlyphs = Array.from(dust.children) as HTMLElement[];

          /* Sample the incoming word's letterforms: draw it on an offscreen
             canvas at the em's own font and collect dark-pixel positions. The
             dust converges onto these points, so the glyphs sketch the shapes
             of the characters before the characters themselves fill in. */
          const sampleShape = (text: string, width: number, height: number, count: number) => {
            const style = getComputedStyle(word);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(Math.ceil(width * 1.25) + 24, 10);
            canvas.height = Math.max(height, 10);
            const ctx = canvas.getContext('2d') as
              | (CanvasRenderingContext2D & { letterSpacing?: string })
              | null;
            if (!ctx) return [];
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            // the DOM word is tracked; an untracked raster runs wide and clips the last glyph
            if (style.letterSpacing !== 'normal') {
              ctx.letterSpacing = `${parseFloat(style.letterSpacing)}px`;
            }
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, canvas.height / 2);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const pts: { x: number; y: number }[] = [];
            const step = 3;
            for (let y = 0; y < canvas.height; y += step) {
              for (let x = 0; x < canvas.width; x += step) {
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
            const picked: { x: number; y: number }[] = [];
            if (pts.length) {
              const stride = Math.max(1, Math.floor(pts.length / count));
              for (let i = 0; i < pts.length && picked.length < count; i += stride) {
                const pt = pts[i];
                if (pt) picked.push(pt);
              }
            }
            return picked;
          };

          const swap = () => {
            if (!root.current || !root.current.isConnected) return;
            const w0 = measure(EVERY[idx] ?? EVERY_FALLBACK);
            idx = (idx + 1) % EVERY.length;
            const next = EVERY[idx] ?? EVERY_FALLBACK;
            const w1 = measure(next);
            morphing = true;
            const tl = gsap.timeline({
              onComplete: () => {
                morphing = false;
                /* re-assert from a fresh cache in case fonts or viewport
                   moved mid-morph; otherwise the same value: nothing snaps */
                holdWidth();
                gsap.delayedCall(2.2, swap);
              },
            });

            // 1. the instrument appears around the current word
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

            // 2. the word dissolves as ONE shaped run (splitting it into
            //    per-character spans would disconnect Arabic and reflow the
            //    very width the sentence is standing on) while the dust
            //    carries the scatter
            tl.to(word, {
              autoAlpha: 0,
              scale: 0.92,
              transformOrigin: '50% 60%',
              duration: 0.3,
              ease: 'power2.in',
            }, '+=0.05');
            /* the cloud separates SYMMETRICALLY about the word's centre: each
               glyph takes an evenly-spread angle on a jittered ring, so the
               scatter is balanced instead of clumping off to one side */
            const h0 = em.offsetHeight;
            const ring = (w: number) => (g: HTMLElement, i: number) => {
              const angle = (i / dustGlyphs.length) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2);
              const rx = gsap.utils.random(0.18, 0.44) * w;
              const ry = gsap.utils.random(6, h0 * 0.26);
              return {
                // clamped so no glyph ever leaves the measured bounds
                x: gsap.utils.clamp(3, w - 3, w / 2 + Math.cos(angle) * rx),
                y: gsap.utils.clamp(-h0 * 0.02, h0 * 0.32, h0 * 0.1 + Math.sin(angle) * ry),
              };
            };
            const place0 = ring(Math.max(w0, 30));
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.35, 0.8),
              x: (i, g) => place0(g as HTMLElement, i).x,
              y: (i, g) => place0(g as HTMLElement, i).y,
              duration: 0.26,
              stagger: 0.012,
              ease: 'power1.out',
            }, '<+=0.1');

            // 3. the bounds glide to the incoming word's shaped width: ONE
            //    continuous tween, quantized to device pixels, so the period
            //    and everything after it track without buzz or end snap
            tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } });
            const place1 = ring(Math.max(w1, 30));
            tl.to(dustGlyphs, {
              x: (i, g) => place1(g as HTMLElement, i).x,
              y: (i, g) => place1(g as HTMLElement, i).y,
              duration: 0.7,
              ease: 'power2.inOut',
            }, '<');

            // 4. the dust assembles the SHAPES of the incoming characters
            //    (each glyph flies to a sampled point on the new letterforms),
            //    then the word fills the silhouette in as one shaped run,
            //    behind a wipe that enters from the script's reading side.
            tl.add(() => {
              const h = em.offsetHeight;
              const pts = sampleShape(next.text, w1, h, dustGlyphs.length);
              dustGlyphs.forEach((g, i) => {
                const pt = pts[i % Math.max(pts.length, 1)] || { x: w1 / 2, y: h / 2 };
                gsap.to(g, {
                  x: pt.x,
                  y: pt.y - h * 0.4,
                  autoAlpha: 0.9,
                  duration: 0.38,
                  ease: 'power3.inOut',
                  delay: i * 0.008,
                });
              });
              gsap.delayedCall(0.42, () => {
                showWord(next);
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
                );
                gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.26, stagger: 0.006, ease: 'power1.out', delay: 0.08 });
              });
            });
            tl.to({}, { duration: 0.85 });

            // 5. the instrument withdraws
            tl.to([guideL, guideR], { opacity: 0, duration: 0.24, ease: 'none' }, '>-0.05');
          };

          /* The first dissolve waits out the first-fold capture window: any
             still taken while the page settles shows the word whole, not dust. */
          gsap.delayedCall(5.6, swap);
        }
      }

      return everyCleanup;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* 1. The plate: one form, one fan, four captions, one vermilion edge. */}
      <div className='cp-poster' data-hero-in>
        <canvas className='cp-poster-field' ref={canvasRef} aria-hidden />
        <div className='cp-poster-stage'>
          <PosterForm />
        </div>
        <span className='cp-poster-cap is-tl'>gt-next · &lt;T&gt;</span>
        <span className='cp-poster-cap is-tr'>128 strings · 6 locales</span>
        <span className='cp-poster-cap is-bl'>
          source · <LocaleTag code='en' className='tc-termloc' />
        </span>
        <span className='cp-poster-cap is-br'>public/_gt/[locale].json</span>
        <span className='cp-poster-band' aria-hidden='true' />
      </div>

      {/* 2. The title block: crown, poster title, sub with the mark inline, acts. */}
      <div className='tc-hero tch-card cp-title'>
        <div className='cp-crown' data-hero-in>
          <HeadMark />
          <span className='cp-crown-word'>General Translation</span>
        </div>

        <div className='cp-title-grid'>
          {/* Two authored lines rather than a wrap; the hinge word opens line two. */}
          <h1 data-hero-in>
            <span>Your product speaks</span>
            <span>
              every{' '}
              <em data-every>
                <span data-every-word lang='en' dir='ltr'>
                  language
                </span>
              </em>
              .
            </span>
          </h1>

          <div className='cp-title-side'>
            <p className='tc-hero-sub' data-hero-in>
              <span className='cp-wordmark'>
                <GtMark width={22} height={14} />
                <span className='cp-sr'>General Translation</span>
              </span>{' '}
              builds full-stack infrastructure for localizing apps, docs, and websites.
            </p>

            <div className='tc-hero-acts' data-hero-in>
              <a className='tc-btn tc-btn-solid' href='https://dash.generaltranslation.com/en-US/signin'>
                Get Started
              </a>
              <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs'>
                Docs
              </a>
              <button className='tc-copy df-hero-cmd' type='button' onClick={copy}>
                <span>$ npx gt@latest</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The trust strip: the lead, then six wordmarks ruled into six cells. */}
      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Cursor, Ramp and Profound ship in over thirty languages</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
