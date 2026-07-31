'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import './chip-consistency.css';
import './hero-every.css';
import './hero-terminal.css';

gsap.registerPlugin(useGSAP);

/**
 * THE EDGE HORIZON — this fork's hero, recut on the founder stack.
 *
 * The prismatic burst never touches the paper. Every canvas here runs behind
 * a `mix-blend-mode: lighten` group over pure ink geometry, so anything white
 * stays white and the dispersed light exists only *inside* the black shapes:
 * the two-line display headline, the prism specimen at the card's right, the
 * doubled thread ribbons, and the horizon band. At arm's length the page is
 * ink on paper; up close the ink is full of light.
 *
 * The stack: white card (mark, two authored lines, sub, acts) → the horizon
 * as the full-width visual band → the trust card, three surfaces at 1px
 * seams with the shell ground filling the corner notches. The headline keeps
 * this fork's authored lines — 'Launch in / every language.' — and adopts the
 * morph hinge on the accent word: guides, multilingual dust, measured bounds.
 * The hinge lives INSIDE the prism material, so the incoming scripts fill
 * with the same dispersed light as the letters they replace.
 *
 * R3 exposure law: every letter-mask field carries a drawn shade floor — a
 * minimum ink density over the whole fill — so no streak ever approaches
 * paper luminance and the headline reads as one near-black material with
 * light inside it, both lines the same. Dark mode inverts the law, not the
 * layout: white letterforms under a `darken` group with the floors flipped
 * from ink to paper (styles.css).
 *
 * The composition reads top-left to bottom-right along the light's own axis:
 * a French reader's request leaves the headline, rides the two threads —
 * source and translation, constant gauge — into the horizon band at the
 * `fra` point of presence, and the response annotation comes back off the
 * band's top rule at 12 ms. The card's right column is counterweighted by
 * the prism specimen: one `en` beam entering a bounded ink plate and leaving
 * as a fan of locales — the product's whole argument as a physical object.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** Points of presence on the horizon band, each with its measured p50. `fra`
    is the one serving this reader. */
const POPS: readonly { code: string; ms: number; x: string; hit?: boolean }[] = [
  { code: 'sfo', ms: 17, x: '12%' },
  { code: 'iad', ms: 21, x: '31%' },
  { code: 'fra', ms: 12, x: '52%', hit: true },
  { code: 'sin', ms: 41, x: '72%' },
  { code: 'gru', ms: 29, x: '88%' },
];

/** The locales fanning out of the prism specimen's right edge. */
const SPEC_OUT: readonly string[] = ['fr', 'es', 'de', 'ja', 'zh', '+113'];

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
  { text: 'γλώσσα', lang: 'el' },
];

const EVERY_FALLBACK: EveryWord = EVERY[0] ?? { text: 'language', lang: 'en' };

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グमัถイ고ρ'.split('');

export default function Hero() {
  const root = useRef<HTMLElement>(null);
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* clearProps: a leftover inline transform on any ancestor of the light
         wrappers would create a stacking context and break their blend group,
         so every entrance tween cleans up after itself. The headline block and
         the prism specimen are never animated for the same reason. */
      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });

      /* The threads draw themselves once, headline to horizon. Not a loop —
         the page's restraint budget is spent on the light itself. The masked
         light group arrives with the draw: over paper it is invisible until
         ink exists beneath it; over the ink-black paper of dark mode the fade
         is what keeps the ribbons from popping in fully lit. */
      const paths = gsap.utils.toArray<SVGPathElement>('.plh-thread', root.current);
      for (const path of paths) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.5 }
        );
      }
      gsap.from('.plh-t-light', { autoAlpha: 0, duration: 1.2, ease: 'power1.inOut', delay: 0.5 });

      gsap.from('.plh-pop', {
        autoAlpha: 0,
        y: 6,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 1.1,
      });

      /* ---- the headline hinge: a measuring instrument ----
         Each cycle: the bound guides appear around the current word; the word
         dissolves while the dust scatters; the bounds tween to the NEXT
         word's measured width first — scoping the layout shift before any
         text exists — then the dust converges and the new word forms inside
         the prepared bounds. The doubled underline re-measures with the em
         at constant gauge, and the prism material fills whatever script is
         standing.

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
          for (let i = 0; i < 26; i++) {
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
            canvas.width = Math.max(width, 10);
            canvas.height = Math.max(height, 10);
            const ctx = canvas.getContext('2d');
            if (!ctx) return [];
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
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
             still taken while the threads draw shows the word whole, not dust. */
          gsap.delayedCall(5.6, swap);
        }
      }

      return everyCleanup;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack, surface one: a genuine white card — radius 12,
          notched corners on the shell ground. Copy left, specimen right. */}
      <div className='tc-hero tch-card plh-card'>
        <div className='plh-card-in'>
          <div>
            <Image
              className='tc-hero-mark'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={34}
              height={34}
            />

            {/* One material for the whole headline: both lines sit inside a
                single blend group, so 'Launch in' and 'every language.' carry
                the same prism-filled ink instead of splitting into two
                weights. Not animated: an entrance transform would isolate
                the blend group and flood the card. */}
            <h1 className='plh-h1'>
              <span className='plh-block'>
                <span className='plh-block-light' aria-hidden>
                  {/* The reference anatomy, made deterministic: two lobes of
                      streaked light converging on a dark eye. The field's one
                      reliably bright lobe is clipped to each half of the block
                      and mirrored about its center, and the shade layer above
                      caps exposure everywhere — floor first, then the eye. */}
                  <span className='plh-block-half is-l'>
                    <PrismaticField
                      className='plh-field-word'
                      preset='1'
                      speed={0.35}
                      params={{ exposureScale: 2200 }}
                    />
                  </span>
                  <span className='plh-block-half is-r'>
                    <PrismaticField
                      className='plh-field-word'
                      preset='1'
                      speed={0.35}
                      params={{ exposureScale: 2200 }}
                    />
                  </span>
                  <span className='plh-block-shade' />
                </span>
                <span className='plh-line'>Launch in</span>
                <span className='plh-line'>
                  every{' '}
                  <em data-every>
                    <span data-every-word lang='en' dir='ltr'>
                      language
                    </span>
                  </em>
                  .
                </span>
              </span>
            </h1>

            <p className='tc-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites — translated at build, served from the edge.
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

          {/* The counterweight object (resend puts a machined cube here; this
              fork puts the product): a bounded ink plate, one white `en` beam
              entering on the left, the burst dispersing inside the ink, and a
              fan of locale ticks leaving the right edge. */}
          <figure
            className='plh-spec'
            role='img'
            aria-label='A prism drawn as a dark plate: one English source beam enters on the left, disperses into spectral light inside, and leaves as ticks labelled fr, es, de, ja, zh and 113 more'
          >
            <div className='plh-spec-box' aria-hidden>
              <div className='plh-spec-light'>
                <PrismaticField
                  className='plh-spec-field'
                  preset='1'
                  speed={0.45}
                  params={{ exposureScale: 1700 }}
                />
                <span className='plh-spec-shade' />
              </div>
              <span className='plh-spec-beam' />
              <span className='plh-spec-en'>en · source</span>
              <div className='plh-spec-outs'>
                {SPEC_OUT.map((code) => (
                  <span key={code}>
                    {code}
                    <i />
                  </span>
                ))}
              </div>
            </div>
            <figcaption className='plh-spec-cap'>
              <span>one build in · 118 locales out</span>
              <span>v214</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Surface two: the horizon, this fork's full-width visual band. The
          first viewport commits to a material the way toolchain's terminal
          band does — inverted: paper the ink threads cross, ending in the
          permanent ink strip at the cell's floor, the burst masked into both. */}
      <div className='tc-hero-cell plh-band-cell'>
        <div className='plh-horizon'>
          {/* Ink geometry first; the light is layered over all of it. */}
          <svg className='plh-threads' viewBox='0 0 1170 320' preserveAspectRatio='none' aria-hidden>
            {/* the two threads: source and translation, never merging */}
            <path
              className='plh-thread'
              d='M 150 64 C 340 110, 500 148, 600 208'
              fill='none'
              stroke='#0c0e11'
              strokeWidth='3'
            />
            <path
              className='plh-thread'
              d='M 150 76 C 340 122, 504 160, 614 222'
              fill='none'
              stroke='#0c0e11'
              strokeWidth='3'
            />
            <line x1='614' y1='192' x2='626' y2='192' stroke='rgba(15,17,19,0.6)' strokeWidth='1.5' />
          </svg>

          {/* The response leader: an elbow rising off fra's own tick, drawn in
              HTML with percent anchors so it survives every viewport — the
              200 is visibly the answer coming back from the POP the threads
              just landed on, on mobile too. */}
          <span className='plh-leader' aria-hidden />

          {/* The light inside the threads: a second field clipped to the exact
              ribbon geometry above, its bright axis rotated to run along the
              dive — dispersed spectrum living inside the ink strokes. */}
          <div className='plh-t-light' aria-hidden>
            <PrismaticField
              className='plh-field-thread'
              preset='1'
              speed={0.55}
              params={{ exposureScale: 1500 }}
            />
            {/* Ink at the request end, spectrum gathering toward the edge. */}
            <span className='plh-t-shade' />
          </div>

          <div className='plh-req' data-hero-in>
            <b>GET example.com/fr/a-propos</b>
            <span>accept-language: fr-FR</span>
          </div>

          <div className='plh-res' data-hero-in>
            <b>200 · served from fra</b>
            <span>12 ms · no origin hit</span>
          </div>

          <div className='plh-band'>
            <div className='plh-band-row'>
              <span>translation edge</span>
              <span>anycast · versioned per locale · v214 live</span>
            </div>
            <div className='plh-pops'>
              {POPS.map((pop) => (
                <span className='plh-pop' data-hit={pop.hit || undefined} style={{ left: pop.x }} key={pop.code}>
                  <i />
                  <span className='plh-pop-l'>
                    {pop.code}
                    <b> · {pop.ms} ms</b>
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* The burst, masked into the ink: its dark convergence point sits on
              the band at `fra`, light streaming outward along the horizon.
              prism-light owns the burst, so it runs a step brighter than
              toolchain's flanks. */}
          <div className='plh-h-light' aria-hidden>
            <PrismaticField
              className='plh-field-fill'
              preset='1'
              speed={0.5}
              params={{ exposureScale: 1900 }}
            />
            {/* Two quiet strips of shade — one under the POP labels at the top
                rule, one under the caption row at the floor — so the band's
                type is never asked to outshine the streaks. */}
            <span className='plh-h-shade' />
          </div>
        </div>
      </div>

      {/* Surface three: the trust card completes the stack. */}
      <div className='tc-trust tch-trustcard'>
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
