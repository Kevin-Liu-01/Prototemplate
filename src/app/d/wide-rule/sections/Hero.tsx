'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';

import InterferenceField from './InterferenceField';
import { HERO_STATS, SLOTS, type WrCard } from './wr-content';

import './hero-every.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
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
   re-measured line never wraps. Each entry carries its lang (font selection)
   and direction, so the live word always renders as one correctly shaped run. */
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

/**
 * One product surface adrift on a shelf. Every variant is a paper-filled
 * hairline chip in the shell's own card language: opaque, so a card seated on
 * the band's fringes occludes the arcs behind it cleanly instead of letting
 * hairlines strike through its text.
 */
function CardView({ card }: { card: WrCard }) {
  switch (card.kind) {
    case 'nav':
      return (
        <span className='wr-c wr-c-nav'>
          {card.items.map((item, i) => (
            <span key={item}>
              {i > 0 && <i className='wr-c-sep'>/</i>}
              {item}
            </span>
          ))}
        </span>
      );

    case 'line':
      return <span className='wr-c wr-c-line'>{card.text}</span>;

    case 'toast':
      /* dir on the chip itself: the RTL pair mirrors for real — flex order,
         tick side and punctuation all flip with the script. */
      return (
        <span className='wr-c wr-c-toast' dir={card.dir} lang={card.lang}>
          <i className='wr-c-tick' />
          {card.label}
        </span>
      );
  }
}

/**
 * Wide Rule hero — 100svh of paper worked as a film still.
 *
 * The composition is two ruled lines and one event: a vertical rule at 50%, a
 * horizontal rule on the 36% axis, a circular gate mark at their crossing
 * (the page's only circle), and an analytic interference band breathing along
 * the axis. The shader's anti-phased pair sits ON the gate, so its fringes
 * radiate along the corridor from the mark itself, and the pair's bisector
 * null — a compact seam through the gate, aimed at the measured headline
 * block — parts the band exactly where the composition needs its void: the
 * calm is the physics' own doing (see ../lib/interference.ts). Everything
 * else is doctrine from the source still: mirrored EN/translated shelves, a
 * 1.5s power3 settle, 16–29s unsynchronized drifts, and nothing ever caught
 * mid-gesture. The null's one live word is the headline hinge — the accented
 * word morphs through real languages as a measuring instrument, the same
 * bound-guide/dust grammar the toolchain hero runs.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
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

      /* A. the settle — the composition settles in rather than arriving. */
      gsap.from('[data-settle]', {
        autoAlpha: 0,
        y: 22,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.15,
      });
      gsap.from('[data-gate]', {
        autoAlpha: 0,
        scale: 0.85,
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.35,
      });
      /* Shelves fade rather than rise: their y belongs to the drift loops
         below from frame one, so the entrance must not contest it. */
      gsap.from('.wr-slot', {
        autoAlpha: 0,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.3,
      });

      /* B. perpetual depth drift — every slot on its own long period, signs
         alternating, so the field is alive without any two pieces ever
         moving together. The inner opacity breathe runs at 0.62× the position
         period so the two never phase-lock. */
      const loops: gsap.core.Tween[] = [];
      const slots = gsap.utils.toArray<HTMLElement>('.wr-slot', root.current);
      for (const slot of slots) {
        const drift = Number(slot.dataset.drift ?? 8);
        const dur = Number(slot.dataset.dur ?? 20);
        loops.push(
          gsap.to(slot, { y: drift, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        );
        const inner = slot.firstElementChild;
        if (inner) {
          loops.push(
            gsap.to(inner, {
              opacity: '-=0.05',
              duration: dur * 0.62,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          );
        }
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          for (const loop of loops) {
            if (self.isActive) loop.play();
            else loop.pause();
          }
        },
      });

      /* C. parallax exit — the registration lifts as one unit, faster than
         the shelves, which is what sells the depth between them. */
      gsap.to('[data-para-far]', {
        y: -72,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-para-near]', {
        y: -30,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      /* D. the headline hinge — the accented word is a measuring instrument.
         Each cycle: the bound guides appear around the current word; the word
         dissolves while the dust scatters; the bounds tween to the NEXT
         word's measured width first — scoping the layout shift before any
         text exists — then the dust converges and the new word forms inside
         the prepared bounds. The doubled underline re-measures with the em at
         constant gauge, and the copy block's outer box never moves, so the
         shader's null stays aimed.

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

          /* The first dissolve waits out the settle and the first-fold
             capture window: any still taken while the composition lands
             shows the word whole, not dust. */
          gsap.delayedCall(5.6, swap);
        }
      }

      return everyCleanup;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='wr-hero'>
        {/* The registration layer: field, two rules, gate. Lifted as one unit
            on exit so the crosshair never separates from its band. */}
        <div className='wr-scene' data-para-far>
          <InterferenceField
            className='wr-field'
            nullRef={copyRef}
            speed={1}
            params={{ lambda: 84, pairSep: 0.5, axis: 0.36, band: 0.14, ghost: 0.1 }}
            /* Narrow flanks are short, so the antinodal window covers most of
               their arc length — the accent must come down with the width or
               the phone band reads tinted instead of struck; the light scales
               (falloff, halo, bloom) tighten with it so the phone corridor
               still decays visibly inside its half-width, and the corridor
               wash comes down a step so the pressed strip keeps its density
               where the narrow frame leaves the source so little run-out. */
            narrowParams={{
              lambda: 64,
              axis: 0.34,
              band: 0.12,
              ghost: 0.1,
              accentAmt: 0.3,
              falloff: 320,
              haloRadius: 110,
              bloomRadius: 38,
              gleamRadius: 190,
              coreLift: 0.3,
              pressBase: 0.2,
            }}
            /* The dark exposure is the same event re-photographed on the
               ink-black surface family: white ink rides a lifted-slate
               corridor (near-black paper has even more headroom than the old
               #101010 plate, so the glow comes down a step to stay calm), the
               bloom cools toward the plate's own blue-white, and the pressed
               frame keeps its deeper multiplicative bite to register against
               near-black. Paper matches --tc-paper (#070707) exactly, so the
               canvas never seams against the page. The light theme's
               inverted-exposure machinery (pressed strip, light-polarity
               fringes, crest gleam, early seam development — see
               ../lib/interference.ts) is zeroed here: near-black paper is
               already all headroom, so dark keeps its original exposure. */
            darkParams={{
              ink: [1, 1, 1],
              paper: [0.039, 0.043, 0.059],
              inkAlpha: 0.5,
              accentAmt: 0.7,
              coreLift: 0.5,
              shimmer: 0.11,
              glow: [0.26, 0.29, 0.39],
              bloomColor: [0.94, 0.96, 1.0],
              bloom: 0.85,
              press: 0.24,
              pressBase: 0,
              lightLine: 0,
              lightAlpha: 0,
              gleam: 0,
              seamDev: [0.25, 1],
            }}
          />
          <span className='wr-guide-h' aria-hidden />
          <span className='wr-guide-v' aria-hidden />
          <div className='wr-gate' data-gate>
            <Image
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={26}
              height={26}
            />
          </div>
        </div>

        {/* The shelves: English left, the same surface translated right,
            mirrored about the 50% rule. Atmosphere, so hidden from readers —
            the argument's real copy lives in the sections below. */}
        <div className='wr-shelves' data-para-near aria-hidden>
          {SLOTS.map((slot) => {
            const vars: StyleVars = {
              '--x': `${slot.x}%`,
              '--y': `${slot.y}%`,
              '--sc': slot.scale,
            };
            if (slot.mobile) {
              vars['--mx'] = `${slot.mobile.x}%`;
              vars['--my'] = `${slot.mobile.y}%`;
              vars['--msc'] = slot.mobile.scale;
            }
            const cls = [
              'wr-slot',
              slot.wide ? 'wr-slot--wide' : '',
              slot.low ? 'wr-slot--low' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div
                className={cls}
                key={slot.id}
                data-drift={slot.drift}
                data-dur={slot.dur}
                style={vars}
              >
                <div className='wr-slot-in' style={{ opacity: slot.opacity }}>
                  {slot.locale ? <span className='wr-slot-loc'>{slot.locale}</span> : null}
                  <CardView card={slot.card} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Content gravity is the bottom of the frame: headline low-left in
            the null, stats hung off the 50% rule to the right. */}
        <div className='wr-lower'>
          <div className='wr-copy' ref={copyRef}>
            {/* Two authored lines; the accented word closes the sentence, on
                the hinge, where the morph only ever re-measures the line's
                own tail. */}
            <h1 data-settle>
              <span>Launch in</span>
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
            <p className='wr-sub' data-settle>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>
            <div className='wr-acts' data-settle>
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

          <dl className='wr-stats' data-settle>
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
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
