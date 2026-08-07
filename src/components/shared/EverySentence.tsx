'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useImperativeHandle, useRef, type Ref } from 'react';

import './every-sentence.css';

gsap.registerPlugin(useGSAP);

/**
 * The sentence-rewriting glyph reassembler — the dossier hero's headline
 * engine, extracted. One shaped text node morphs between locales by
 * dissolving into glyph dust seated on the outgoing text's own sampled
 * ink, dispersing into a cloud, then reassembling the incoming sentence:
 * every glyph flies to exactly one point sampled on a brick lattice, and
 * the real text prints through the settled swarm behind a hard clip front
 * that absorbs each glyph as it passes, mirrored for RTL.
 *
 * The component NEVER runs a timer — the host owns the one clock. The ref
 * handle's setLocale(loc) is the only intake: requests debounce a quarter
 * second (leading + trailing); one landing mid-dissolve retargets the form
 * boundary; one landing mid-form kills the timeline and re-dissolves; a
 * same-text locale change retags lang/dir only. Calls that arrive before
 * the engine boots are buffered and served at boot, so any mount order is
 * safe. Width follows the moving-type law: the whole shaped word measured
 * from a hidden probe carrying the word's own lang/dir, cached,
 * device-pixel snapped, tweened once per cycle — never per-character
 * boxes, which disconnect Arabic joining and split Devanagari matras.
 *
 * Type and ink are inherited: the engine reads the host's computed font
 * for the dust and the raster, and every color derives from currentColor.
 * Under prefers-reduced-motion the driver is a plain text/lang/dir swap.
 * Under 720px the dissolve itself runs (founder: "do the dissolving
 * instead of fade in fade out") in a cheap cut — fewer motes, a lower
 * canvas dpr, the em pinned to the column so a two-line word never
 * tweens layout — and the sampler folds the text so mote targets land
 * on both wrapped lines.
 */
export type EveryWord = { text: string; lang: string; rtl?: boolean };

export type EverySentenceHandle = { setLocale: (loc: string) => void };

type EverySentenceProps = {
  /** the locale roster; unknown locales are ignored */
  words: Record<string, EveryWord>;
  /** the resting SSR sentence's locale — must exist in words */
  initial: string;
  /** seconds before the first morph may run (the first-fold capture
      window); 0 arms immediately */
  armDelay?: number;
  ref?: Ref<EverySentenceHandle>;
};

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function EverySentence({
  words,
  initial,
  armDelay = 1.8,
  ref,
}: EverySentenceProps) {
  const emRef = useRef<HTMLElement>(null);

  const initialWord: EveryWord = words[initial] ?? { text: '', lang: 'en' };

  /* the host's hand on the sentence: setLocale buffers into pendingLoc
     (calls can land before the engine's own effect has run) and the
     driver — built inside useGSAP, where the morph apparatus lives —
     consumes the request. */
  const driver = useRef<{ request: (w: EveryWord) => void } | null>(null);
  const pendingLoc = useRef<string>(initialWord.lang);

  useImperativeHandle(ref, () => ({
    setLocale: (loc: string) => {
      pendingLoc.current = loc;
      const w = words[loc];
      if (w) driver.current?.request(w);
    },
  }));

  useGSAP(
    () => {
      const em = emRef.current;
      const word = em?.querySelector<HTMLElement>('[data-every-word]');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        /* the sanctioned still: the sentence swaps instantly to whatever
           the (static) clock reports — the one-clock contract holds
           without a single tween */
        if (em && word) {
          const apply = (w: EveryWord) => {
            word.textContent = w.text;
            word.setAttribute('lang', w.lang);
            word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
            /* no measured tween to protect: let the line reflow */
            em.style.width = '';
          };
          driver.current = { request: apply };
          const init = words[pendingLoc.current];
          if (init && init.text !== word.textContent) apply(init);
        }
        return () => {
          driver.current = null;
        };
      }

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
        /* the one-clock ledger: what stands, what the clock last asked
           for, whether a cycle holds the floor, and whether the
           first-fold capture window has passed */
        let current: EveryWord = initialWord;
        let morphing = false;
        let armed = false;
        /* MOBILE WIDTH LAW (founder: two lines, no lag): under 720px the
           em pins to the COLUMN — the full width the h1 offers — never the
           word's own measure, so a sentence that folds to two lines cannot
           reflow the h1 at all; centring stays the h1's text-align. Desktop
           keeps the measured per-word pin and its one gliding tween. */
        const colWidth = () =>
          snapPx(Math.max((em.parentElement ?? em).getBoundingClientRect().width, 30));
        const layoutWidth = (w: EveryWord) => (compactEvery ? colWidth() : measure(w));
        const holdWidth = () => {
          em.style.width = `${layoutWidth(current)}px`;
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

        /* `target` is the single source of truth for where the sentence
           is headed — every phase boundary reads it fresh. */
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
           acts NOW (the sentence must already be dissolving as the clock
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

        /* THE DISSOLVE RUNS AT EVERY WIDTH (founder: "do the dissolving
           instead of fade in fade out") — the old mobile crossfade branch
           is gone. The mobile cut of the morph is CHEAP instead: ~200
           motes, the dust plate capped at 1.5x, and no per-tick width
           tween (the em is pinned to the column above). */
        {
          const guideL = document.createElement('span');
          guideL.className = 'tc-eg is-l';
          const guideR = document.createElement('span');
          guideR.className = 'tc-eg is-r';
          /* THE DUST IS A CANVAS (founder: same visuals, no lag): 440
             tweened DOM spans cost a style recalc per glyph per tick —
             the pool is plain particle objects driven by the very same
             tweens, drawn once per frame by one ticker. */
          type Mote = { ch: string; x: number; y: number; a: number };
          /* the mobile pool is ~200: over a two-line 390px column the swarm
             reads just as dense, at under half the per-tick fillText cost */
          const parts: Mote[] = Array.from({ length: compactEvery ? 200 : 440 }, (_, i) => ({
            ch: DUST[i % DUST.length] ?? '',
            x: 0,
            y: 0,
            a: 0,
          }));
          const dust = document.createElement('canvas');
          dust.className = 'tc-edust';
          dust.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
          dust.setAttribute('aria-hidden', 'true');
          em.append(guideL, guideR, dust);
          const dctx = dust.getContext('2d');
          /* mobile caps the plate at 1.5x — the dust glyphs are ~0.1em; a
             3x phone repainting min(2,dpr) squared device pixels per CSS
             pixel spends the frame budget on resolution nobody can read */
          const cdpr = compactEvery ? Math.min(1.5, dpr) : Math.min(2, dpr);
          let dustFont = '';
          let dustInk = '';
          const sizeDust = () => {
            const host = em.parentElement ?? em;
            const bw = Math.ceil(host.getBoundingClientRect().width) + 20;
            const bh = Math.ceil(em.offsetHeight) + 8;
            if (dust.width !== bw * cdpr || dust.height !== bh * cdpr) {
              dust.width = bw * cdpr;
              dust.height = bh * cdpr;
              dust.style.width = `${bw}px`;
              dust.style.height = `${bh}px`;
            }
            const ws = getComputedStyle(word);
            dustFont = `400 ${parseFloat(ws.fontSize) * 0.105}px ${ws.fontFamily}`;
            dustInk = getComputedStyle(em).color;
          };
          /* the incoming word can take one line more than the standing one
             (mobile wraps): the plate — sized off the standing block by
             sizeDust — grows BEFORE any mote flies to line two. Growing a
             canvas clears it; the ticker repaints every frame anyway. */
          const growDust = (bh: number) => {
            const need = Math.ceil(bh) + 8;
            if (dust.height < need * cdpr) {
              dust.height = need * cdpr;
              dust.style.height = `${need}px`;
            }
          };
          let drawing = false;
          const draw = () => {
            if (!dctx) return;
            dctx.setTransform(cdpr, 0, 0, cdpr, 0, 0);
            /* clear in CSS-pixel space: the transform already scales the
               rect, so passing canvas-pixel dims swept cdpr² the needed
               area every tick — the frame-loop waste from the mobile round */
            dctx.clearRect(0, 0, dust.width / cdpr, dust.height / cdpr);
            dctx.font = dustFont;
            dctx.fillStyle = dustInk;
            dctx.textAlign = 'center';
            dctx.textBaseline = 'middle';
            for (const m of parts) {
              if (m.a <= 0.015) continue;
              dctx.globalAlpha = m.a;
              dctx.fillText(m.ch, m.x, m.y);
            }
            dctx.globalAlpha = 1;
          };
          const wake = () => {
            if (drawing) return;
            drawing = true;
            sizeDust();
            gsap.ticker.add(draw);
          };
          const sleep = () => {
            if (!drawing) return;
            drawing = false;
            gsap.ticker.remove(draw);
            if (dctx) {
              dctx.setTransform(1, 0, 0, 1, 0, 0);
              dctx.clearRect(0, 0, dust.width, dust.height);
            }
          };

          /* Sample the incoming word's letterforms the way glyph-field
             does: rasterize at 2x resolution (so CJK counters and
             Devanagari matras survive the alpha threshold), scan a BRICK
             lattice — alternate rows offset by half a pitch — and adapt
             the pitch upward until the point count fits the pool. Cached
             by (text, width): it runs once per locale per size and every
             later cycle reads warm. */
          const ptsCache = new Map<string, { x: number; y: number }[]>();
          const sampleShape = (text: string, width: number, height: number, count: number) => {
            const key = `${text}@${Math.round(width)}x${Math.round(height)}`;
            const hit = ptsCache.get(key);
            if (hit) return hit;
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
            const applyFont = () => {
              ctx.font = `${style.fontWeight} ${fontPx}px ${style.fontFamily}`;
              // the DOM word is tracked; an untracked raster runs wide and clips the last glyph
              if (style.letterSpacing !== 'normal') {
                ctx.letterSpacing = `${parseFloat(style.letterSpacing) * scale}px`;
              }
              ctx.textBaseline = 'alphabetic';
            };
            applyFont();
            /* the scan bounds: whatever raster the lattice walks below */
            let sw = cw;
            let sh = ch;
            if (compactEvery) {
              /* MOBILE WRAP SAMPLING (founder: two lines): once white-space
                 goes normal the printed word folds at the pinned column, so
                 mote targets must land on BOTH lines. Fold the text the way
                 the box will — greedy on spaces, a spaceless CJK run folding
                 character by character — and print each line centred at its
                 line-height offset (the h1 centres; so must the ink the
                 motes seat on). The cache key already carries the wrap
                 width, so a resize re-folds. */
              const avail = Math.max(width, 10) * scale;
              const lineH =
                (parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.1) * scale;
              const lines: string[] = [];
              let line = '';
              for (const tok of text.split(' ')) {
                const tryTok = line ? `${line} ${tok}` : tok;
                if (ctx.measureText(tryTok).width <= avail) {
                  line = tryTok;
                  continue;
                }
                if (line) lines.push(line);
                line = '';
                if (ctx.measureText(tok).width <= avail) {
                  line = tok;
                } else {
                  for (const chr of tok) {
                    const tryChr = line + chr;
                    if (line && ctx.measureText(tryChr).width > avail) {
                      lines.push(line);
                      line = chr;
                    } else {
                      line = tryChr;
                    }
                  }
                }
              }
              if (line) lines.push(line);
              if (!lines.length) lines.push(text);
              sw = Math.ceil(avail) + 8;
              sh = Math.ceil(lines.length * lineH + fontPx * 0.2);
              /* resizing a canvas resets its 2d state — re-arm the font */
              canvas.width = sw;
              canvas.height = sh;
              applyFont();
              /* baseline seated where the line box seats it: half-leading
                 plus the ~0.8em ascent the desktop heuristic assumes */
              const base = (lineH - fontPx) / 2 + fontPx * 0.8;
              lines.forEach((ln, li) => {
                const x0 = Math.max(0, (avail - ctx.measureText(ln).width) / 2);
                ctx.fillText(ln, x0, li * lineH + base);
              });
            } else {
              ctx.fillText(text, 0, ch * 0.85);
            }
            const img = ctx.getImageData(0, 0, sw, sh).data;
            const scan = (step: number) => {
              const out: { x: number; y: number }[] = [];
              let rowIdx = 0;
              for (let y = 0; y < sh; y += step, rowIdx++) {
                const off = rowIdx % 2 === 1 ? step >> 1 : 0;
                for (let x = off; x < sw; x += step) {
                  if ((img[(y * sw + x) * 4 + 3] ?? 0) > 140) out.push({ x: x / scale, y: y / scale });
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
            ptsCache.set(key, pts);
            return pts;
          };
          /* pre-warm the target's letterforms off the hot path, while the
             dissolve has the floor */
          const warmTarget = () => {
            const goal = target;
            gsap.delayedCall(0.08, () => {
              if (goal !== target || !em.isConnected) return;
              sampleShape(goal.text, layoutWidth(goal), em.offsetHeight, parts.length);
            });
          };

          /* ---- the two-phase engine ----
             DISSOLVE: the standing sentence PIXELATES — the dust seats on
             the outgoing text's own sampled ink so the line visibly breaks
             into glyphs in place — then disperses into a DISTRIBUTED CLOUD
             across the whole line box. FORM: the bounds glide while the
             cloud condenses straight onto the new sentence's letterforms
             and the print front absorbs it (two swarm moves total). The
             form phase always reads the LATEST target at its boundary; a
             target arriving mid-form kills the phase and re-disperses
             whatever stands. */
          let tlLive: gsap.core.Timeline | null = null;
          let printCall: gsap.core.Tween | null = null;
          let killForm: (() => void) | null = null;

          const cloudX = (w: number) => () =>
            gsap.utils.clamp(3, w - 3, gsap.utils.random(0.03, 0.97) * w);
          /* canvas coordinates are absolute: the cloud band IS its rendered
             band — [0.19h, 0.81h], symmetric about the optical middle */
          const cloudY = (h: number) => () => gsap.utils.random(h * 0.19, h * 0.81);

          const formPhase = () => {
            if (!em.isConnected) return;
            phase = 'form';
            const goal = target;
            current = goal;
            const w1 = layoutWidth(goal);
            const h = em.offsetHeight;
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                killForm = null;
                phase = 'idle';
                morphing = false;
                sleep();
                holdWidth();
                /* a debounced trailing target that landed as we closed */
                if (target.text !== current.text) act(target);
                else if (target.lang !== current.lang) retag(target);
              },
            });
            tlLive = tl;

            // the bounds glide to the incoming sentence's shaped width — ONE
            // continuous tween, quantized to device pixels. Desktop only:
            // the mobile em is pinned to the column, so the one layout
            // write of a mobile morph is the print itself (the word's new
            // block height lands while the line is fully dust — one
            // reflow, not ~40 width ticks; founder: "slow and laggy on
            // mobile").
            if (!compactEvery) {
              tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } }, 0);
            }

            // CONDENSATION at glyph-field fidelity: every glyph owns
            // EXACTLY one sampled point and lands centred on it, in
            // print order; the real text then PRINTS through the settled
            // swarm behind a hard linear clip front entering from the
            // script's reading side, and each glyph is absorbed the
            // instant the front passes its point. Surplus glyphs thin out.
            // The cloud flies STRAIGHT from the dissolve pose to the
            // letterforms (founder: the swarm reordered three times before
            // the word — now two: disperse, then condense; the old
            // re-spread across the incoming span is folded into this one
            // longer flight, and the bounds glide alongside it).
            const LAND = 0.85;
            const LAND_SPREAD = 0.25;
            const PRINT_AT = LAND + LAND_SPREAD + 0.08;
            const PRINT = 1.0;
            tl.add(() => {
              const hh = em.offsetHeight;
              const pts = sampleShape(goal.text, w1, hh, parts.length);
              if (compactEvery) {
                /* a two-line target overruns the plate sized off the
                   standing block — grow it before the first mote lands */
                let maxY = 0;
                for (const pt of pts) maxY = Math.max(maxY, pt.y);
                growDust(maxY + 12);
              }
              const span = Math.max(w1, 1);
              parts.forEach((g, i) => {
                const pt = pts[i];
                if (!pt) {
                  gsap.to(g, { a: 0, duration: 0.14, ease: 'power1.out' });
                  return;
                }
                const u = goal.rtl ? 1 - pt.x / span : pt.x / span;
                gsap.to(g, {
                  x: pt.x,
                  y: pt.y,
                  a: 1,
                  duration: LAND,
                  ease: 'power3.inOut',
                  delay: u * LAND_SPREAD,
                });
                const landEnd = u * LAND_SPREAD + LAND;
                gsap.to(g, {
                  a: 0,
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
                    /* no veil breath after the print (founder: remove the
                       dithering after the reorder) — the fresh sentence
                       stands clean the moment the front clears it */
                    onComplete: () => {
                      gsap.set(word, { clearProps: 'clipPath' });
                    },
                  }
                );
              });
            }, 0.15);
            tl.to({}, { duration: PRINT_AT + PRINT + 0.45 });
            /* the timeline sweeps the pool dark AFTER the front has passed */
            tl.to(parts, { a: 0, duration: 0.12, ease: 'none', overwrite: 'auto' }, '>-0.12');
            /* the guides leave FAST — a lingering frame reads as chrome */
            tl.to([guideL, guideR], { opacity: 0, duration: 0.07, ease: 'none' }, '>-0.05');

            killForm = () => {
              killForm = null;
              tl.kill();
              tlLive = null;
              printCall?.kill();
              printCall = null;
              gsap.killTweensOf(parts);
              gsap.killTweensOf([word, em]);
              gsap.set(word, { clearProps: 'clipPath' });
            };
          };

          const startCycle = () => {
            if (!em.isConnected) return;
            phase = 'dissolve';
            morphing = true;
            const w0 = layoutWidth(current);
            const h = em.offsetHeight;
            /* the outgoing sentence pixelates: seat the dust on ITS ink */
            const pts0 = sampleShape(current.text, w0, h, parts.length);
            wake();
            warmTarget();
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                formPhase();
              },
            });
            tlLive = tl;
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' }, 0);
            tl.add(() => {
              parts.forEach((g, i) => {
                const pt = pts0.length ? pts0[i % pts0.length] : undefined;
                g.x = pt ? pt.x : w0 / 2;
                g.y = pt ? pt.y : h * 0.45;
                g.a = 0;
              });
            }, 0);
            /* glyphs materialize ON the letterforms while the ink sinks —
               the text reads as BECOMING the glyphs, not fading beside
               them. No dither veil anywhere in the cycle (founder): the
               swarm itself is the whole transition. */
            tl.to(parts, {
              a: () => gsap.utils.random(0.5, 0.95),
              duration: 0.3,
              stagger: { amount: 0.16 },
              ease: 'power1.in',
            }, 0.12);
            tl.to(word, { autoAlpha: 0, duration: 0.34, ease: 'power2.in' }, 0.18);
            /* ...then the swarm DISPERSES into a distributed cloud across
               the whole line box before anything re-forms */
            tl.to(parts, {
              a: () => gsap.utils.random(0.3, 0.75),
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
            wake();
            warmTarget();
            const w = Math.max(em.offsetWidth, 30);
            const h = em.offsetHeight;
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                formPhase();
              },
            });
            tlLive = tl;
            tl.to(word, { autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, 0);
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.15, ease: 'none' }, 0);
            tl.to(parts, {
              a: () => gsap.utils.random(0.3, 0.75),
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
              /* a request mid-flight interrupts — kill the forming print
                 and re-disperse whatever stands */
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

        /* the engine is built — open the vent. Calls that landed before
           this effect ran are staged as pending; the first morph still
           waits out the capture window (any still taken while the run
           settles shows the word whole, not dust). */
        driver.current = { request: requestWord };
        const init = words[pendingLoc.current];
        if (init) target = init;
        gsap.delayedCall(Math.max(0, armDelay), () => {
          armed = true;
          if (target.text !== current.text) act(target);
          else if (target.lang !== current.lang) retag(target);
        });
      }

      return everyCleanup;
    },
    { scope: emRef }
  );

  return (
    <em className='every-sentence' data-every ref={emRef}>
      <span data-every-word dir={initialWord.rtl ? 'rtl' : 'ltr'} lang={initialWord.lang}>
        {initialWord.text}
      </span>
    </em>
  );
}
