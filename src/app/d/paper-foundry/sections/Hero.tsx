'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import SheenField from './SheenField';
import { usePlateCascade } from './cascade';
import { useFoundryLoops } from './loops';

import './chip-consistency.css';
import './hero-every.css';

gsap.registerPlugin(useGSAP);

/**
 * The machined stack. The hero adopts the founder stack — white card
 * (mark, two authored headline lines, sub, acts), a full-width visual band,
 * then the trust card, three surfaces on the shell-grey ground with 1px
 * seams and the ground filling the radius-12 corner notches — and the band
 * is this fork's signature material: one brushed-graphite sheet (the shader)
 * carrying a hairline bento plate of six real product parts. Parts rise in
 * reading order with a one-shot gloss sweep apiece (the plate cascade); the
 * first part is the sheet's grain flip — its brushing runs 90° to the
 * sheet's, so the specular sweep crosses it on a different diagonal at a
 * different moment. After the cascade the plate keeps working: useFoundryLoops
 * advances one cell at a time — locales cycling through the button chip
 * (width re-measured live), the fan emitting new locale files, plural
 * grammars rotating, the toast re-translating, the greeting card flipping
 * LTR→RTL when Arabic lands.
 *
 * The headline hinge is toolchain's measuring instrument: bound guides
 * appear around the accented word, the word dissolves to multilingual dust,
 * the bounds tween to the next word's measured width, the dust assembles the
 * incoming letterforms (canvas-sampled), characters fill in. Under 720px a
 * measured crossfade tells the same story; reduced motion shows the finished
 * still.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* "language" across maximally different writing systems — Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek — short tokens so the
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
  { text: 'γλωσσα', lang: 'el' },
];

const EVERY_FALLBACK: EveryWord = EVERY[0] ?? { text: 'language', lang: 'en' };

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const flipCell = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  usePlateCascade(root);
  useFoundryLoops(root);

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
      });

      /* The headline hinge is a measuring instrument. Each cycle: the bound
         guides appear around the current word; the word dissolves while the
         dust scatters; the bounds tween to the NEXT word's measured width
         first — scoping the layout shift before any text exists — then the
         dust converges and the new word forms inside the prepared bounds.
         The doubled underline re-measures with the em at constant gauge.

         Width discipline (the founder's standard): the width the sentence
         reflows around is always the WHOLE SHAPED word — a hidden probe
         carrying the word's own lang/dir and the em's inherited type — never
         a sum of per-character boxes, which disconnects Arabic joining
         (isolated forms measure ~37% wider than the shaped word) and splits
         Devanagari matras off their consonants. The em's width is the only
         layout-affecting property that ever animates: it holds the shaped
         width at rest (never snapping back to 'auto'), glides through ONE
         continuous device-pixel-snapped tween per cycle so the trailing
         period only ever glides, and re-measures when the fonts arrive or
         the clamp()ed type resizes. */
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
        /* the live word is ONE shaped text node — lang for font selection,
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
                   moved mid-morph — otherwise the same value: nothing snaps */
                holdWidth();
                gsap.delayedCall(2.2, swap);
              },
            });

            // 1. the instrument appears around the current word
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

            // 2. the word dissolves as ONE shaped run — splitting it into
            //    per-character spans would disconnect Arabic and reflow the
            //    very width the sentence is standing on — while the dust
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

            // 3. the bounds glide to the incoming word's shaped width — ONE
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

            // 4. the dust assembles the SHAPES of the incoming characters —
            //    each glyph flies to a sampled point on the new letterforms —
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
             still taken while the plate cascade settles shows the word whole,
             not dust. */
          gsap.delayedCall(5.6, swap);
        }
      }

      return everyCleanup;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      {/* The founder stack, card one: a genuine white card — radius 12, on the
          section's shell-grey ground — carrying mark, two authored headline
          lines with the morphing hinge, sub, and acts. */}
      <div className='tc-hero'>
        <Image
          className='tc-hero-mark tc-logo-light'
          data-hero-in
          src='/brand/no-bg-gt-logo-light.png'
          alt='General Translation'
          width={34}
          height={34}
        />
        <Image
          className='tc-hero-mark tc-logo-dark'
          data-hero-in
          src='/brand/no-bg-gt-logo-dark.png'
          alt=''
          width={34}
          height={34}
        />

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

        <p className='tc-hero-sub' data-hero-in>
          General Translation builds full-stack infrastructure for localizing apps, docs, and
          websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <a className='tc-btn tc-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#frameworks'>
            Docs
          </a>
          <button className='tc-copy' type='button' onClick={copy}>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* The band: SQUARE, full rail width, this fork's material — the
          brushed-graphite sheet with the machined parts plate set into it.
          Each part is a real artifact with its real translation — the tag
          names the translated leg only. Never the hero's own CTA copy: a
          part reading "Get started" an inch from the live button would
          read as a rendering fault. */}
      <div className='tc-hero-cell pf-hero'>
        <SheenField className='pf-hero-field' flipRef={flipCell} />

        <div className='pf-plate'>
          {/* The lead part is also the sheet's grain-flip rect: its brushing
              runs 90° to the sheet's, so the sweep crosses it on its own
              diagonal — two machined parts meeting, not a mask. */}
          <div className='pf-cell is-part is-flip' data-plate ref={flipCell}>
            <div className='pf-cell-label'>
              <span>components/Button.tsx</span>
              <span data-loop='chip-label'>ja — 日本語</span>
            </div>
            <div className='pf-pair'>
              <span className='pf-ui'>Continue</span>
              <span className='pf-arr' aria-hidden='true'>
                →
              </span>
              {/* The translated leg re-measures per locale; the dimension
                  line under it is the caliper, read live off the box. */}
              <span className='pf-measure'>
                <span className='pf-ui' lang='ja' data-loop='chip'>
                  <span data-loop='chip-text'>続ける</span>
                </span>
                <span className='pf-dim' aria-hidden='true'>
                  <i />
                  <b data-loop='chip-dim' />
                  <i />
                </span>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>public/_gt/[locale].json</span>
              <span>over the air</span>
            </div>
            <svg
              className='pf-fan'
              viewBox='0 0 300 136'
              role='img'
              aria-label='app/page.tsx fanned into es.json, ja.json, de.json and further locales'
            >
              <text className='pf-fan-src' x='0' y='68'>
                app/page.tsx
              </text>
              <path d='M104 68 C 142 68, 152 20, 192 20' />
              <path d='M104 68 C 142 68, 152 52, 192 52' />
              <path d='M104 68 C 142 68, 152 84, 192 84' />
              {/* the emitting slot: this stroke redraws and its label swaps
                  as the plate mints one more locale over the air */}
              <path d='M104 68 C 142 68, 152 116, 192 116' pathLength={1} data-loop='fan-path' />
              <text className='pf-fan-dst' x='200' y='20'>
                es.json
              </text>
              <text className='pf-fan-dst' x='200' y='52'>
                ja.json
              </text>
              <text className='pf-fan-dst' x='200' y='84'>
                de.json
              </text>
              <text className='pf-fan-dst' x='200' y='116' data-loop='fan-text'>
                pl.json
              </text>
            </svg>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>platform</span>
            </div>
            <div className='pf-stats'>
              <span>
                <b>118</b>
                <i>locales</i>
              </span>
              <span>
                <b>6</b>
                <i>SDKs</i>
              </span>
              <span>
                <b>$0</b>
                <i>to start</i>
              </span>
            </div>
          </div>

          {/* Three counts through three grammars — the category column is the
              CLDR plural machinery made visible; Polish's 'few'/'many' is the
              proof it is real. */}
          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>ui/FileCount.tsx</span>
              <span data-loop='plu-label'>en — 2 forms</span>
            </div>
            <div className='pf-plu' lang='en' data-loop='plu'>
              <span className='pf-plu-row'>
                <i>n=1</i>
                <span data-loop='plu-val'>1 file</span>
                <em data-loop='plu-cat'>one</em>
              </span>
              <span className='pf-plu-row'>
                <i>n=2</i>
                <span data-loop='plu-val'>2 files</span>
                <em data-loop='plu-cat'>other</em>
              </span>
              <span className='pf-plu-row'>
                <i>n=5</i>
                <span data-loop='plu-val'>5 files</span>
                <em data-loop='plu-cat'>other</em>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>ui/Toast.tsx</span>
              <span data-loop='toast-label'>fr — français</span>
            </div>
            <div className='pf-toasts'>
              <span className='pf-toast'>
                <i aria-hidden='true' />
                Payment received
              </span>
              <span className='pf-toast' lang='fr' data-loop='toast'>
                <i aria-hidden='true' />
                <span data-loop='toast-text'>Paiement reçu</span>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>app/greeting.tsx</span>
              <span data-loop='bidi-label'>ar — العربية</span>
            </div>
            <div className='pf-bidi'>
              <span>Welcome back, Sarah</span>
              <span dir='rtl' lang='ar' data-loop='bidi-row'>
                مرحبًا بعودتك يا سارة
              </span>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  );
}
