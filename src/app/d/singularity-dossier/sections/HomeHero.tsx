'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';


import TranslateWindow from '@/app/d/_v0/TranslateWindow';
import HeroFieldSwitcher from '@/components/shared/HeroFieldSwitcher';

import '@/app/d/toolchain/sections/hero-every.css';
import '@/app/d/toolchain/sections/hero-terminal.css';

gsap.registerPlugin(useGSAP);

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

/* The windowed demo itself — data, timelines, inspector, seam — lives in
   the shared TranslateWindow (src/app/d/_v0/TranslateWindow.tsx); this
   hero only sets the stack around it: card, band, trust row, and the
   headline's measuring hinge below. */

/* The WHOLE headline in each of the window's belt locales — ONE CLOCK
   (founder round: "make the whole sentence translate and retranslate
   itself"): the belt below reports whichever locale it centres
   (TranslateWindow's onLocaleChange) and the em morphs the entire
   sentence to that locale, so the headline never runs a timer of its
   own and the line up here always speaks the locale on screen. The
   belt now leads with en, so the resting SSR sentence is also the
   belt's first stop. Each sentence carries its BCP-47 tag so the
   hidden measurer and the live line shape with the same fonts; none
   of the sixteen are RTL (the roster excludes ar/he until the seam
   mirrors), but the rtl wiring — probe dir, bidi isolate,
   reading-side wipe — stays for the day one arrives. */
type EveryWord = { text: string; lang: string; rtl?: boolean };

const WORD_EN: EveryWord = { text: 'Launch in every language', lang: 'en' };

const WORDS: Record<string, EveryWord> = {
  en: WORD_EN,
  es: { text: 'Lanza en todos los idiomas', lang: 'es' },
  ja: { text: 'あらゆる言語でローンチ', lang: 'ja' },
  fr: { text: 'Lancez dans toutes les langues', lang: 'fr' },
  ko: { text: '모든 언어로 출시하세요', lang: 'ko' },
  de: { text: 'In jeder Sprache launchen', lang: 'de' },
  zh: { text: '用每种语言发布', lang: 'zh' },
  pt: { text: 'Lance em todos os idiomas', lang: 'pt' },
  ru: { text: 'Запускайтесь на любом языке', lang: 'ru' },
  it: { text: 'Lancia in ogni lingua', lang: 'it' },
  hi: { text: 'हर भाषा में लॉन्च करें', lang: 'hi' },
  nl: { text: 'Lanceer in elke taal', lang: 'nl' },
  tr: { text: 'Her dilde yayına alın', lang: 'tr' },
  sv: { text: 'Lansera på alla språk', lang: 'sv' },
  id: { text: 'Luncurkan dalam setiap bahasa', lang: 'id' },
  pl: { text: 'Uruchamiaj w każdym języku', lang: 'pl' },
};

/* the dissolve dust pool: small glyphs sampled across the same scripts */
/* ------------------------------------------------------------------
   THE WORD'S DITHER: one 4×4 Bayer tile at half coverage, worn as an
   alpha mask by a blue-shifted twin of the word (the veil). The veil
   FADES in and out — opacity, never stepped coverage — so the
   halftone moment lingers on the fresh print and again at departure.
   The tile is 4px so the halftone reads at display sizes.
   ------------------------------------------------------------------ */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const ditherTile = (coverage: number): string => {
  const cells = BAYER4.map((t, i) => {
    if (t / 16 >= coverage) return '';
    const x = i % 4;
    const y = (i / 4) | 0;
    return `<rect x='${x}' y='${y}' width='1' height='1'/>`;
  }).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4' fill='white'>${cells}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/** the veil's one tile: every Bayer cell under the half threshold inked */
const VEIL_TILE = ditherTile(0.5);

const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);

  /* the belt's hand on the headline: TranslateWindow calls
     handleBeltLocale once on mount and on every active-locale change;
     the driver — built inside useGSAP, where the morph apparatus lives —
     consumes the request. pendingLoc buffers the mount-time call, which
     lands BEFORE this component's own effect has run (child effects
     fire first), so the engine picks it up when it boots. */
  const driver = useRef<{ request: (w: EveryWord) => void } | null>(null);
  const pendingLoc = useRef<string>(WORD_EN.lang);
  const handleBeltLocale = (loc: string) => {
    pendingLoc.current = loc;
    const w = WORDS[loc];
    if (w) driver.current?.request(w);
  };

  useGSAP(
    () => {
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        /* the window parks its own reduced-motion still; the headline
           swaps instantly to whatever the (static) belt reports — the
           one-clock contract holds without a single tween */
        if (em && word) {
          const apply = (w: EveryWord) => {
            word.textContent = w.text;
            word.setAttribute('lang', w.lang);
            word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
            /* no measured tween to protect: let the line reflow */
            em.style.width = '';
          };
          driver.current = { request: apply };
          const init = WORDS[pendingLoc.current];
          if (init && init.text !== word.textContent) apply(init);
        }
        return () => {
          driver.current = null;
        };
      }

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      /* The headline hinge is a measuring instrument, DRIVEN BY THE BELT
         (founder: one clock). Each morph — the same dissolve-to-dust /
         condense cycle, no self-timer left: the bound guides appear
         around the current word; the word dissolves while the dust
         scatters; the bounds tween to the NEXT word's measured width
         first — scoping the layout shift before any text exists — then
         the dust converges and the new word forms inside the prepared
         bounds. The doubled underline re-measures with the em at
         constant gauge. A locale that arrives MID-morph never tears the
         dust: `pending` keeps only the latest request and `drive`
         serves it when the running cycle completes — a redirect, not a
         pile-up. The whole cycle is cut to ~1.2s so it sits inside the
         belt's 1.5s dwell (the founder's clock) and, since a morph is
         always shorter than a dwell, no locale is ever skipped — the
         headline can lag a crossing by at most a fraction of a beat
         before it catches the belt again.

         Condensation discipline (founder: glyph-field fidelity — see
         src/lib/glyph-field.ts): the incoming word is rasterized and
         scanned on a brick lattice at a pitch just under the dust glyph
         size, every glyph flies to EXACTLY one sampled point (centred
         on it, no undershoot), landings run in print order, and the
         real text then PRINTS through the settled swarm behind a hard
         linear clip front that absorbs each glyph as it passes — dust
         becomes typography positionally, never a crossfade beside it.

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
        /* the one-clock ledger: what stands, what the belt last asked
           for, whether a cycle holds the floor, and whether the
           first-fold capture window has passed */
        let current: EveryWord = WORD_EN;
        let morphing = false;
        let armed = false;
        const holdWidth = () => {
          em.style.width = `${measure(current)}px`;
        };
        const remeasure = () => {
          if (!em.isConnected) return;
          widthCache.clear();
          if (!morphing) holdWidth();
        };
        window.addEventListener('resize', remeasure);
        void document.fonts.ready.then(remeasure);
        everyCleanup = () => {
          window.removeEventListener('resize', remeasure);
          driver.current = null;
        };
        holdWidth();

        /* the branch below installs the actual animation. The founder's
           interaction contract: the INSTANT the belt centres a new locale
           the sentence starts dissolving; a chip click mid-flight
           interrupts the running cycle; and the intake is debounced so a
           burst of clicks collapses to its last target. `target` is the
           single source of truth for where the headline is headed —
           every phase boundary reads it fresh. */
        let target: EveryWord = current;
        let phase: 'idle' | 'dissolve' | 'form' = 'idle';
        let act: (next: EveryWord) => void = () => {};
        const retag = (next: EveryWord) => {
          /* es→pt: same words, different tongue — retag, never dissolve */
          current = next;
          word.setAttribute('lang', next.lang);
          word.setAttribute('dir', next.rtl ? 'rtl' : 'ltr');
        };

        /* leading + trailing debounce: the first request in a quiet spell
           acts NOW (the sentence must already be dissolving as the belt
           lands); anything inside the window is folded, and the LAST of
           the burst is served when the window closes */
        const DEBOUNCE = 0.25;
        let lastFire = -1e9;
        let queued: EveryWord | null = null;
        let trailingCall: gsap.core.Tween | null = null;
        const requestWord = (w: EveryWord) => {
          if (!armed) {
            target = w;
            return;
          }
          if (w.text === target.text && w.lang === target.lang) return;
          const now = gsap.ticker.time;
          if (now - lastFire >= DEBOUNCE) {
            lastFire = now;
            act(w);
          } else {
            queued = w;
            trailingCall ??= gsap.delayedCall(Math.max(0.02, DEBOUNCE - (now - lastFire)), () => {
              trailingCall = null;
              const q = queued;
              queued = null;
              if (q && (q.text !== target.text || q.lang !== target.lang)) {
                lastFire = gsap.ticker.time;
                act(q);
              }
            });
          }
        };

        if (compactEvery) {
          /* At mobile scale the particles cannot breathe: a clean measured
             crossfade tells the same story, on the same belt clock. The
             swap is short, so interrupts reduce to latest-wins at the
             boundary. */
          const swap = (next: EveryWord) => {
            if (!root.current || !root.current.isConnected) return;
            const w1 = measure(next);
            current = next;
            morphing = true;
            phase = 'form';
            gsap.to(word, {
              autoAlpha: 0,
              duration: 0.12,
              ease: 'power2.in',
              onComplete: () => {
                showWord(next);
                gsap.to(em, {
                  width: w1,
                  duration: 0.3,
                  ease: 'power2.inOut',
                  snap: { width: 1 / dpr },
                  onComplete: () => {
                    morphing = false;
                    phase = 'idle';
                    holdWidth();
                    /* a target that arrived mid-swap is served now */
                    if (target.text !== current.text) swap(target);
                    else if (target.lang !== current.lang) retag(target);
                  },
                });
                gsap.to(word, { autoAlpha: 1, duration: 0.18, ease: 'power2.out', delay: 0.1 });
              },
            });
          };
          act = (next) => {
            target = next;
            if (phase !== 'idle') return;
            if (next.text === current.text) {
              if (next.lang !== current.lang) retag(next);
              return;
            }
            swap(next);
          };
        } else {
          const guideL = document.createElement('span');
          guideL.className = 'tc-eg is-l';
          const guideR = document.createElement('span');
          guideR.className = 'tc-eg is-r';
          const dust = document.createElement('span');
          dust.className = 'tc-edust';
          for (let i = 0; i < 440; i++) {
            const g = document.createElement('span');
            g.textContent = DUST[i % DUST.length] ?? '';
            /* glyph-field fidelity at SENTENCE scale (founder round: the
               assembled swarm should read as the text): the pool runs
               three words deep and the grain one step finer, so the
               sampler's adaptive pitch settles back down at glyph size
               and the landed swarm traces the whole line's letterforms
               instead of sketching them */
            g.style.fontSize = '0.105em';
            dust.appendChild(g);
          }
          em.append(guideL, guideR, dust);
          const dustGlyphs = Array.from(dust.children) as HTMLElement[];

          /* the dither veil: a blue-shifted twin of the word behind the
             Bayer-tile alpha mask — it fades in and out around each print
             (worn, never stepped) and rests on the word between the fades */
          const veil = document.createElement('span');
          veil.className = 'tc-eveil';
          veil.textContent = current.text;
          veil.setAttribute('lang', current.lang);
          veil.setAttribute('dir', current.rtl ? 'rtl' : 'ltr');
          veil.setAttribute('aria-hidden', 'true');
          veil.style.webkitMaskImage = VEIL_TILE;
          veil.style.maskImage = VEIL_TILE;
          veil.style.webkitMaskSize = '4px 4px';
          veil.style.maskSize = '4px 4px';
          em.append(veil);
          gsap.set(veil, { autoAlpha: 0 });
          /* the veil sits on the word's own flow offsets — re-seated before
             every fade-in, so font loads and resizes can never unseat it */
          const seatVeil = () => {
            gsap.set(veil, { left: word.offsetLeft, top: word.offsetTop, scale: 1 });
          };

          /* Sample the incoming word's letterforms the way glyph-field
             does: rasterize at 2x resolution (so CJK counters and
             Devanagari matras survive the alpha threshold), scan a BRICK
             lattice — alternate rows offset by half a pitch — and adapt
             the pitch upward until the point count fits the pool. Every
             returned point is real ink; the swarm traces the word
             exactly, at a density the pool can actually cover. */
          const sampleShape = (text: string, width: number, height: number, count: number) => {
            const style = getComputedStyle(word);
            const scale = 2;
            const cw = Math.max(Math.ceil(width * 1.25) + 24, 10) * scale;
            const ch = Math.max(Math.ceil(height), 10) * scale;
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
              | (CanvasRenderingContext2D & { letterSpacing?: string })
              | null;
            if (!ctx) return [] as { x: number; y: number }[];
            const fontPx = parseFloat(style.fontSize) * scale;
            ctx.font = `${style.fontWeight} ${fontPx}px ${style.fontFamily}`;
            // the DOM word is tracked; an untracked raster runs wide and clips the last glyph
            if (style.letterSpacing !== 'normal') {
              ctx.letterSpacing = `${parseFloat(style.letterSpacing) * scale}px`;
            }
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(text, 0, ch * 0.85);
            const img = ctx.getImageData(0, 0, cw, ch).data;
            const scan = (step: number) => {
              const out: { x: number; y: number }[] = [];
              let rowIdx = 0;
              for (let y = 0; y < ch; y += step, rowIdx++) {
                const off = rowIdx % 2 === 1 ? step >> 1 : 0;
                for (let x = off; x < cw; x += step) {
                  if ((img[(y * cw + x) * 4 + 3] ?? 0) > 140) out.push({ x: x / scale, y: y / scale });
                }
              }
              return out;
            };
            let step = Math.max(4, Math.round(fontPx / 13));
            let pts = scan(step);
            while (pts.length > count && step < 60) {
              step = Math.max(step + 1, Math.round(step * Math.sqrt(pts.length / count)));
              pts = scan(step);
            }
            let maxX = 0;
            for (const pt of pts) maxX = Math.max(maxX, pt.x);
            if (maxX > width) {
              const fit = width / maxX;
              for (const pt of pts) pt.x *= fit;
            }
            return pts;
          };

          /* ---- the two-phase engine (founder rounds) ----
             DISSOLVE: the standing sentence PIXELATES — the dust seats on
             the outgoing text's own sampled ink so the line visibly breaks
             into glyphs in place — then disperses into a DISTRIBUTED CLOUD
             across the whole line box (not a ring). FORM: the bounds glide,
             the cloud re-spreads over the incoming width, then condenses
             onto the new sentence's letterforms and the print front absorbs
             it. The form phase always reads the LATEST target at its
             boundary; a target arriving mid-form kills the phase and
             re-disperses whatever stands. */
          let tlLive: gsap.core.Timeline | null = null;
          let printCall: gsap.core.Tween | null = null;
          let veilTl: gsap.core.Timeline | null = null;
          let killForm: (() => void) | null = null;

          const cloudX = (w: number) => () =>
            gsap.utils.clamp(3, w - 3, gsap.utils.random(0.03, 0.97) * w);
          /* the text band in glyph-space runs [0, 0.45h] (the seat mapping
             subtracts 0.4h from raster ink) — the cloud centres on ITS
             middle, not the box's (founder: the dust pooled at the bottom) */
          const cloudY = (h: number) => () => gsap.utils.random(h * -0.04, h * 0.44);

          const formPhase = () => {
            if (!root.current || !root.current.isConnected) return;
            phase = 'form';
            const goal = target;
            current = goal;
            const w1 = measure(goal);
            const h = em.offsetHeight;
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                killForm = null;
                phase = 'idle';
                morphing = false;
                holdWidth();
                /* a debounced trailing target that landed as we closed */
                if (target.text !== current.text) act(target);
                else if (target.lang !== current.lang) retag(target);
              },
            });
            tlLive = tl;

            // the bounds glide to the incoming sentence's shaped width — ONE
            // continuous tween, quantized to device pixels — while the cloud
            // re-distributes across the new span
            tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } }, 0);
            tl.to(dustGlyphs, {
              x: cloudX(Math.max(w1, 30)),
              y: cloudY(h),
              duration: 0.7,
              ease: 'power2.inOut',
            }, 0);

            // CONDENSATION at glyph-field fidelity: every glyph owns
            // EXACTLY one sampled point and lands centred on it, in
            // print order; the real text then PRINTS through the settled
            // swarm behind a hard linear clip front entering from the
            // script's reading side, and each glyph is absorbed the
            // instant the front passes its point. Surplus glyphs thin out.
            const LAND = 0.7;
            const LAND_SPREAD = 0.25;
            const PRINT_AT = LAND + LAND_SPREAD + 0.08;
            const PRINT = 1.0;
            tl.add(() => {
              const hh = em.offsetHeight;
              const pts = sampleShape(goal.text, w1, hh, dustGlyphs.length);
              const span = Math.max(w1, 1);
              dustGlyphs.forEach((g, i) => {
                const pt = pts[i];
                if (!pt) {
                  gsap.to(g, { autoAlpha: 0, duration: 0.14, ease: 'power1.out' });
                  return;
                }
                const u = goal.rtl ? 1 - pt.x / span : pt.x / span;
                gsap.to(g, {
                  x: pt.x - g.offsetWidth / 2,
                  y: pt.y - hh * 0.4 - g.offsetHeight / 2,
                  autoAlpha: 1,
                  duration: LAND,
                  ease: 'power3.inOut',
                  delay: u * LAND_SPREAD,
                });
                const landEnd = u * LAND_SPREAD + LAND;
                gsap.to(g, {
                  autoAlpha: 0,
                  duration: 0.08,
                  ease: 'none',
                  overwrite: 'auto',
                  delay: Math.max(landEnd + 0.02, PRINT_AT + u * PRINT),
                });
              });
              printCall = gsap.delayedCall(PRINT_AT, () => {
                printCall = null;
                showWord(goal);
                gsap.fromTo(
                  word,
                  {
                    autoAlpha: 1,
                    scale: 1,
                    clipPath: goal.rtl ? 'inset(-15% 0% -15% 100%)' : 'inset(-15% 100% -15% 0%)',
                  },
                  {
                    clipPath: 'inset(-15% 0% -15% 0%)',
                    duration: PRINT,
                    ease: 'none',
                    immediateRender: true,
                    onComplete: () => {
                      gsap.set(word, { clearProps: 'clipPath' });
                      /* the fresh print wears the veil: the blue halftone
                         breathes in and away — the halftone moment */
                      veil.textContent = goal.text;
                      veil.setAttribute('lang', goal.lang);
                      veil.setAttribute('dir', goal.rtl ? 'rtl' : 'ltr');
                      seatVeil();
                      veilTl = gsap
                        .timeline({ onComplete: () => { veilTl = null; } })
                        .to(veil, {
                          autoAlpha: 0.85,
                          duration: 0.3,
                          ease: 'power1.out',
                          overwrite: 'auto',
                        })
                        .to(veil, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, '+=0.35');
                    },
                  }
                );
              });
            });
            tl.to({}, { duration: PRINT_AT + PRINT + 0.45 });
            /* the timeline sweeps the pool dark AFTER the front has passed */
            tl.to(dustGlyphs, { autoAlpha: 0, duration: 0.12, ease: 'none', overwrite: 'auto' }, '>-0.12');
            /* founder: the guides leave FAST — a lingering frame reads as chrome */
            tl.to([guideL, guideR], { opacity: 0, duration: 0.07, ease: 'none' }, '>-0.05');

            killForm = () => {
              killForm = null;
              tl.kill();
              tlLive = null;
              printCall?.kill();
              printCall = null;
              veilTl?.kill();
              veilTl = null;
              gsap.killTweensOf(dustGlyphs);
              gsap.killTweensOf([word, veil, em]);
              gsap.set(word, { clearProps: 'clipPath' });
            };
          };

          const startCycle = () => {
            if (!root.current || !root.current.isConnected) return;
            phase = 'dissolve';
            morphing = true;
            const w0 = measure(current);
            const h = em.offsetHeight;
            /* the outgoing sentence pixelates: seat the dust on ITS ink */
            const pts0 = sampleShape(current.text, w0, h, dustGlyphs.length);
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                formPhase();
              },
            });
            tlLive = tl;
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' }, 0);
            tl.add(() => {
              dustGlyphs.forEach((g, i) => {
                const pt = pts0.length ? pts0[i % pts0.length] : undefined;
                gsap.set(g, {
                  x: (pt ? pt.x : w0 / 2) - g.offsetWidth / 2,
                  y: (pt ? pt.y : h * 0.45) - h * 0.4 - g.offsetHeight / 2,
                  autoAlpha: 0,
                });
              });
            }, 0);
            seatVeil();
            tl.to(veil, { autoAlpha: 0.7, duration: 0.22, ease: 'power1.out', overwrite: 'auto' }, 0.05);
            /* glyphs materialize ON the letterforms while the ink sinks —
               the text reads as BECOMING the glyphs, not fading beside them */
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.5, 0.95),
              duration: 0.3,
              stagger: { amount: 0.16 },
              ease: 'power1.in',
            }, 0.12);
            tl.to(word, { autoAlpha: 0, duration: 0.34, ease: 'power2.in' }, 0.18);
            tl.to(veil, { autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' }, '<+=0.04');
            /* ...then the swarm DISPERSES into a distributed cloud across
               the whole line box before anything re-forms */
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.3, 0.75),
              x: cloudX(Math.max(w0, 30)),
              y: cloudY(h),
              duration: 0.55,
              stagger: { amount: 0.18 },
              ease: 'power1.inOut',
            }, 0.44);
          };

          const reDissolve = () => {
            phase = 'dissolve';
            morphing = true;
            const w = Math.max(em.offsetWidth, 30);
            const h = em.offsetHeight;
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                formPhase();
              },
            });
            tlLive = tl;
            tl.to([word, veil], { autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, 0);
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.15, ease: 'none' }, 0);
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.3, 0.75),
              x: cloudX(w),
              y: cloudY(h),
              duration: 0.32,
              stagger: { amount: 0.08 },
              ease: 'power1.out',
            }, 0);
          };

          act = (next) => {
            target = next;
            if (phase === 'dissolve') {
              /* already dissolving — the form boundary reads the latest
                 target; nothing to interrupt */
              return;
            }
            if (phase === 'form') {
              /* founder: a click mid-flight interrupts — kill the forming
                 print and re-disperse whatever stands */
              killForm?.();
              reDissolve();
              return;
            }
            if (next.text === current.text) {
              if (next.lang !== current.lang) retag(next);
              return;
            }
            startCycle();
          };
          void tlLive;
        }

        /* the engine is built — open the vent. The mount-time report
           landed before this effect ran, so it is re-staged as pending;
           the first morph still waits out the first-fold capture window
           (any still taken while the run settles shows the word whole,
           not dust), by which time the belt's first crossing has usually
           re-aimed pending at the SECOND locale — correct by the
           one-clock rule: the em always names what the belt centres NOW. */
        driver.current = { request: requestWord };
        const init = WORDS[pendingLoc.current];
        if (init) target = init;
        gsap.delayedCall(1.8, () => {
          armed = true;
          if (target.text !== current.text) act(target);
          else if (target.lang !== current.lang) retag(target);
        });
      }

      return everyCleanup;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        {/* Two authored lines rather than a wrap: "Launch in / every language."
            — the accented word opens line two, on the hinge of the sentence. */}
        {/* the whole sentence is the morphing unit now — the measuring
            guides flank the full line and the belt rewrites all of it */}
        <h1 data-hero-in>
          <span>
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                Launch in every language
              </span>
            </em>
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          <img alt='General Translation' className='tch-sub-mark is-light' src='/brand/no-bg-gt-logo-light.png' width={1198} height={1198} /><img alt='' aria-hidden className='tch-sub-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' width={1198} height={1198} /> builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href='#deploy'>
              Get started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs' rel='noreferrer' target='_blank'>
            Docs
          </a>
        </div>
      </div>

      {/* The first viewport commits to a material the way the references do:
          the terminal band is a dark plate washed with the prismatic field —
          lit at the flanks, dark in the centre column where the transcript
          sits (the viteplus grammar: a #101010 terminal flanked by lit panels).
          The band itself stays square and full-width; only the window inside
          it keeps the measured top corners and ring. exposureScale is raised
          (= dimmer) so the flanks wash rather than saturate. */}
      <div className='tc-hero-cell tch-band'>
        {/* the band's field + the founder's review ladder: the ten-slot
            Bayer family, default 01 = the picked bayer flow */}
        <HeroFieldSwitcher />
        {/* one clock: the window reports its belt's active locale and the
            headline above morphs to that locale's word for "language" */}
        <TranslateWindow onLocaleChange={handleBeltLocale} />
      </div>

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
