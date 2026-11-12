'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useImperativeHandle, useRef, type Ref } from 'react';

import { groupEveryLines, readEveryGlyphs } from '@/lib/every-lines';
import { prefersReducedMotion } from '@/lib/reduced-motion';

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
 * safe. A hidden stack of every sentence shares the em's one grid cell,
 * so CSS holds the em at the tallest sentence's height from the first
 * frame; the script only reads each copy's width and height from it. On
 * desktop the width tweens once per cycle between whole shaped words,
 * device-pixel snapped. The viewport is live: any resize without a
 * reload re-reads the stack in one debounced pass, settles the standing
 * span in 0.2s, re-aims a mid-form glide, and re-reads the 720px law and
 * the device pixel ratio; nothing is measured in a frame loop.
 *
 * Type and ink are inherited: the engine reads the host's computed font
 * for the dust and the raster, and every color derives from currentColor.
 * Under prefers-reduced-motion the driver is a plain text/lang/dir swap.
 * Under 720px the dissolve itself runs (founder: "do the dissolving
 * instead of fade in fade out") in a cheap cut — fewer motes, a lower
 * canvas dpr, the em at the column width by CSS so a two-line word never
 * tweens layout — and the sampler reads the copy's own line boxes so mote
 * targets land on both wrapped lines.
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
  /** how many arrangements the dissolved swarm takes on its way to the
      print, clamped to integers 1..5 (founder: "define the switches
      between glyphs as HOPS ... up to 5, for our library"). The
      dissolve itself never changes. 2 — the default — is the shipped
      grammar, byte for byte: the cloud re-spreads across the incoming
      span (riding the bounds glide) and then condenses onto the new
      ink. 1 skips that one re-spread beat, so the cloud pours straight
      into the next sentence; 3..5 add re-scatter poses of the same
      kind. Every count keeps the print and the settle on the shipped
      clock. Live: a change latches at the next form boundary. */
  hops?: number;
  ref?: Ref<EverySentenceHandle>;
};

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function EverySentence({
  words,
  initial,
  armDelay = 1.8,
  hops = 2,
  ref,
}: EverySentenceProps) {
  const emRef = useRef<HTMLElement>(null);

  /* the hop knob is LIVE: the engine latches it at each form boundary,
     so a host re-render mid-flight retunes the NEXT morph, never the
     one in flight (an idempotent latest-ref write; the engine effect
     never rebuilds for it) */
  const hopsRef = useRef(hops);
  hopsRef.current = hops;

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
    (context) => {
      const em = emRef.current;
      const word = em?.querySelector<HTMLElement>('[data-every-word]');

      if (prefersReducedMotion()) {
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

      /* the 720px law and the device-pixel quantum are LIVE state — a
         viewport that changes without a reload (DevTools device
         emulation, drag-resize, rotation) re-reads both on the next
         measure pass */
      const compactQuery = window.matchMedia('(max-width: 720px)');
      let compactEvery = compactQuery.matches;
      let everyCleanup: (() => void) | undefined;
      if (em && word) {
        let dpr = Math.max(1, window.devicePixelRatio || 1);
        const snapPx = (w: number) => Math.round(w * dpr) / dpr;
        const widthCache = new Map<string, number>();
        const heightCache = new Map<string, number>();
        let holdH = 0;
        const stack = Array.from(em.querySelectorAll<HTMLElement>('[data-every-stack] > span'));
        /* data-every-measures counts passes so the perf probe can see the debounce coalescing. */
        let measurePasses = 0;
        /* CSS sizes the em from the hidden stack of every sentence, so the script only reads it. */
        const measureAll = () => {
          widthCache.clear();
          heightCache.clear();
          holdH = 0;
          for (const s of stack) {
            const text = s.textContent ?? '';
            const r = s.getBoundingClientRect();
            widthCache.set(text, snapPx(r.width));
            heightCache.set(text, r.height);
            holdH = Math.max(holdH, r.height);
          }
          em.dataset.everyMeasures = String(++measurePasses);
        };
        measureAll();
        const measure = (w: EveryWord) => widthCache.get(w.text) ?? 0;
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
        /* Under 720px CSS sets the em to the column width, so a sentence that folds never reflows the host. */
        const colWidth = () =>
          snapPx(Math.max((em.parentElement ?? em).getBoundingClientRect().width, 30));
        const layoutWidth = (w: EveryWord) => (compactEvery ? colWidth() : measure(w));
        const holdWidth = () => {
          em.style.width = compactEvery ? '' : `${measure(current)}px`;
        };
        holdWidth();

        /* The em centres the word, so ink sampled from the word's top edge sits this far down the em. */
        const inkTop = (w: EveryWord) => Math.max(0, (holdH - (heightCache.get(w.text) ?? holdH)) / 2);

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

        /* The dissolve runs at every width (founder: "do the dissolving
           instead of fade in fade out"). The mobile cut of the morph is
           cheap instead: about 200 motes and no per-tick width tween (CSS
           holds the em at the column width). */
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
          /* the pool allocates the desktop maximum once; how many motes a
             cycle FLIES is cycleN, latched at each cycle's seed so a law
             flip mid-flight can never orphan a lit mote outside its flock.
             poolN is the per-LINE quantum — 200 under the 720px law — and
             the seed scales it by the morph's tallest line count (founder:
             a two-line cloud at a flat 200 read skeletal) */
          const POOL_MAX = 440;
          let poolN = compactEvery ? 200 : POOL_MAX;
          let cycleN = poolN;
          const parts: Mote[] = Array.from({ length: POOL_MAX }, (_, i) => ({
            ch: DUST[i % DUST.length] ?? '',
            x: 0,
            y: 0,
            a: 0,
          }));
          /* >0 while a form phase holds the floor: mote x is a FRACTION of
             the bracket span and draw() maps it through this live span, so
             the cloud's rendered extent contracts/expands in lockstep with
             the gliding guides and can never overhang them; at 0, mote x
             is a plain canvas px coordinate (dissolve space). */
          let spanLive = 0;
          const dust = document.createElement('canvas');
          dust.className = 'tc-edust';
          dust.setAttribute('aria-hidden', 'true');
          em.append(guideL, guideR, dust);
          /* The plate overhangs the em by the offset .tc-edust sets, to fit ink at x=0, tall diacritics and descenders. */
          const PLATE_PAD = -parseFloat(getComputedStyle(dust).left) || 0;
          const dctx = dust.getContext('2d');
          /* the plate renders at up to 2x everywhere: a lower cap reads
             soft on 3x phones (founder: "without becoming blurry"); 2x is
             the crisp/cheap knee, and the clear already sweeps CSS-pixel
             space so the cost stays bounded */
          let cdpr = Math.min(2, dpr);
          let dustFont = '';
          let dustInk = '';
          const sizeDust = () => {
            /* the plate's scale follows the LIVE quantum, so an emulated
               device dpr never renders the dust blurry or fat */
            cdpr = Math.min(2, dpr);
            const host = em.parentElement ?? em;
            const bw = Math.ceil(host.getBoundingClientRect().width) + 20 + PLATE_PAD * 2;
            const bh = Math.ceil(em.offsetHeight) + 8 + PLATE_PAD * 2;
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
            const need = Math.ceil(bh) + 8 + PLATE_PAD * 2;
            if (dust.height < need * cdpr) {
              dust.height = need * cdpr;
              dust.style.height = `${need}px`;
            }
          };
          let drawing = false;
          const draw = () => {
            if (!dctx) return;
            dctx.setTransform(cdpr, 0, 0, cdpr, PLATE_PAD * cdpr, PLATE_PAD * cdpr);
            /* clear in CSS-pixel space: the transform already scales the
               rect, so passing canvas-pixel dims swept cdpr² the needed
               area every tick — the frame-loop waste from the mobile round.
               The origin sits PLATE_PAD inside the plate, so the sweep
               starts at -PLATE_PAD to cover the overhang. */
            dctx.clearRect(-PLATE_PAD, -PLATE_PAD, dust.width / cdpr, dust.height / cdpr);
            dctx.font = dustFont;
            dctx.fillStyle = dustInk;
            dctx.textAlign = 'center';
            dctx.textBaseline = 'middle';
            for (const m of parts) {
              if (m.a <= 0.015) continue;
              dctx.globalAlpha = m.a;
              dctx.fillText(m.ch, spanLive > 0 ? m.x * spanLive : m.x, m.y);
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
          const countLines = (w: EveryWord) => {
            if (!compactEvery) return 1;
            const lineH = parseFloat(getComputedStyle(word).lineHeight);
            const h = heightCache.get(w.text);
            return h && lineH ? Math.max(1, Math.round(h / lineH)) : 1;
          };
          const ptsCache = new Map<string, { x: number; y: number }[]>();
          const sampleShape = (text: string, width: number, height: number, count: number) => {
            /* the fold regime is part of the identity: the same text at the
               same width samples differently once the 720px law flips */
            const key = `${compactEvery ? 'c' : 'd'}:${text}@${Math.round(width)}x${Math.round(height)}`;
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
              /* the REAL vertical metrics: the DOM line box seats its
                 baseline at half-leading + the font's true ascent; a fixed
                 0.8em ascent prints the sampled ink about 0.1em above the
                 DOM's, so the cloud stands higher than the sentence
                 (founder: "the actual sentence is below the glyphed
                 text"). The same metrics size the raster past the last
                 baseline, so descenders survive sampling (founder: "the gs
                 are getting cut off"). MOBILE ONLY: the desktop cut below
                 is the c12afdd original, byte for byte — the founder
                 signed its alignment off as perfect, and the mobile cut's
                 job is to match it, not to move it. */
              const fmet = ctx.measureText('Hg');
              const asc = fmet.fontBoundingBoxAscent || fontPx * 0.8;
              const desc = fmet.fontBoundingBoxDescent || fontPx * 0.25;
              const avail = Math.max(width, 10) * scale;
              const lineH =
                (parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.1) * scale;
              /* The hidden copy is laid out exactly as the printed word, so its line boxes say where each line breaks and starts. */
              const copy = stack.find((el) => el.textContent === text);
              const lines = copy ? groupEveryLines(readEveryGlyphs(copy)) : [{ text, x: 0 }];
              const base = (lineH - (asc + desc)) / 2 + asc;
              sw = Math.ceil(avail) + 8;
              sh = Math.ceil((lines.length - 1) * lineH + base + desc) + 4;
              /* resizing a canvas resets its 2d state — re-arm the font */
              canvas.width = sw;
              canvas.height = sh;
              applyFont();
              lines.forEach((ln, li) => {
                ctx.fillText(ln.text, ln.x * scale, li * lineH + base);
              });
            } else {
              /* the single-line seat, same law as the wrap branch: the
                 em's own box IS the line box, baseline at half-leading +
                 true ascent (a fixed 0.85em seats the ink about 2px low),
                 and the raster runs past the baseline by the full descent,
                 so descenders are not cut flat at the canvas edge
                 (founder: "the glyphs are cut off at the bottom") */
              const fmet = ctx.measureText('Hg');
              const asc = fmet.fontBoundingBoxAscent || fontPx * 0.8;
              const desc = fmet.fontBoundingBoxDescent || fontPx * 0.25;
              const base = (ch - (asc + desc)) / 2 + asc;
              sh = Math.max(ch, Math.ceil(base + desc) + 4);
              if (sh !== ch) {
                canvas.height = sh;
                applyFont();
              }
              ctx.fillText(text, 0, base);
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
              sampleShape(goal.text, layoutWidth(goal), em.offsetHeight, cycleN);
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
          /* the live glide, held by name so a measure pass can re-aim it,
             and the one width writer that can outlive a timeline (an idle
             settle or a mid-form retarget) — killed at every phase boundary
             so the em never has two hands on it */
          let glideTw: gsap.core.Tween | null = null;
          let widthTw: gsap.core.Tween | null = null;
          let formGoal: EveryWord = current;
          /* leaving form — completed or killed — returns mote x to canvas
             px at whatever span stands, so dissolve math stays px-space */
          const exitFrac = () => {
            if (spanLive > 0) {
              for (const g of parts) g.x *= spanLive;
              spanLive = 0;
            }
          };

          const cloudX = (w: number) => () =>
            gsap.utils.clamp(3, w - 3, gsap.utils.random(0.03, 0.97) * w);
          /* canvas coordinates are absolute: the cloud band IS its rendered
             band — [0.19h, 0.81h], symmetric about the optical middle */
          const cloudY = (h: number) => () => gsap.utils.random(h * 0.19, h * 0.81);

          /* HOPS (founder: "define the switches between glyphs as HOPS
             ... up to 5, for our library"): the count of arrangements the
             dissolved swarm takes on its way to the print. The dissolve —
             seat, materialize, scatter — is the header's signature and is
             never a hop; every count runs it identically. hops=2 is the
             shipped grammar, byte for byte. hops=1 skips the form
             corridor's one intermediary beat. 3..5 add re-spread poses of
             the original's kind. All hop arithmetic lives inside one
             formPhase call, latched at the form boundary, so a knob flip
             mid-flight can never split a cycle's schedule. */
          const hopCount = () => Math.min(5, Math.max(1, Math.round(hopsRef.current)));

          const formPhase = () => {
            if (!em.isConnected) return;
            const cycleHops = hopCount();
            em.dataset.everyHops = String(cycleHops);
            phase = 'form';
            const goal = target;
            current = goal;
            formGoal = goal;
            const w1 = layoutWidth(goal);
            /* the swarm enters fraction space against the box the guides
               stand at NOW (mid-glide after an interrupt, w0 at rest, the
               other regime's width when the 720px law flipped mid-cycle) —
               cloud and bounds read one width from the first tick */
            const w0live = Math.max(em.getBoundingClientRect().width, 1);
            for (const g of parts) g.x /= w0live;
            if (compactEvery) {
              spanLive = Math.max(w1, 1);
            } else {
              spanLive = w0live;
            }
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                killForm = null;
                glideTw = null;
                widthTw?.kill();
                widthTw = null;
                phase = 'idle';
                morphing = false;
                exitFrac();
                sleep();
                holdWidth();
                /* a debounced trailing target that landed as we closed */
                if (target.text !== current.text) act(target);
                else if (target.lang !== current.lang) retag(target);
              },
            });
            tlLive = tl;

            // the bounds glide to the incoming sentence's shaped width — ONE
            // continuous tween, quantized to device pixels, whose value IS
            // spanLive: the guides and the cloud read the same width every
            // tick of the glide. Desktop only: under 720px CSS holds the
            // em at the column width and the tallest sentence's height.
            if (!compactEvery) {
              const glide = { w: w0live };
              glideTw = gsap.to(glide, {
                w: w1,
                duration: 0.7,
                ease: 'power2.inOut',
                onUpdate: () => {
                  spanLive = snapPx(glide.w);
                  em.style.width = `${spanLive}px`;
                },
              });
              tl.add(glideTw, 0);
            }

            // CONDENSATION at glyph-field fidelity: every glyph owns
            // EXACTLY one sampled point and lands centred on it, in
            // print order; the real text then PRINTS through the settled
            // swarm behind a hard linear clip front entering from the
            // script's reading side, and each glyph is absorbed the
            // instant the front passes its point. Surplus glyphs thin out.
            // The cloud flies STRAIGHT from the dissolve pose to the
            // letterforms in two moves, disperse then condense; the
            // re-spread across the incoming span is part of this one longer
            // flight, and the bounds glide alongside it. The
            // flight runs in span FRACTIONS: a mote laid out over the
            // outgoing width rescales with the gliding bounds each frame,
            // and its landing fraction times the settled span is exactly
            // the sampled ink point.
            const LAND = 0.85;
            const LAND_SPREAD = 0.25;
            const PRINT_AT = LAND + LAND_SPREAD + 0.08;
            const PRINT = 1.0;
            if (cycleHops === 2) {
            /* ——— hops=2: THE SHIPPED PATH — every statement below, to the
               byte, is the pre-hops engine (indentation untouched so the
               diff shows it verbatim) ——— */
            tl.add(() => {
              const hh = em.offsetHeight;
              const pts = sampleShape(goal.text, w1, hh, cycleN);
              const dy = inkTop(goal);
              if (compactEvery) {
                /* a two-line target overruns the plate sized off the
                   standing block — grow it before the first mote lands */
                let maxY = 0;
                for (const pt of pts) maxY = Math.max(maxY, pt.y);
                growDust(maxY + dy + 12);
              }
              const span = Math.max(w1, 1);
              for (let i = 0; i < cycleN; i++) {
                const g = parts[i];
                if (!g) break;
                const pt = pts[i];
                if (!pt) {
                  gsap.to(g, { a: 0, duration: 0.14, ease: 'power1.out' });
                  continue;
                }
                const u = goal.rtl ? 1 - pt.x / span : pt.x / span;
                gsap.to(g, {
                  x: pt.x / span,
                  y: pt.y + dy,
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
              }
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
            } else {
              /* ——— hops=1 / 3..5: THE ADDITIVE LADDER ———
                 The shipped corridor holds exactly ONE intermediary
                 arrangement between the dissolved cloud and the condense:
                 the cloud's re-spread across the incoming span, carried by
                 the 0.7s power2.inOut bounds glide the swarm rides in
                 fraction space, fronted by the condense's 0.15s lead. hops=1 SKIPS
                 that one beat: the condense launches the instant the form
                 opens (condenseAt 0) and each pour runs the freed 0.15s
                 longer, so every landing (1.0 + u·0.25), the print (1.33)
                 and the settle keep the shipped clock times to the digit.
                 hops=3..5 ADD arrangements of the original's kind —
                 explicit re-spread poses across the incoming span:
                 span-FRACTION x targets (the containment model), the
                 dissolve's own y band, alphas untouched, the original
                 wave's power2.inOut — dividing the shipped corridor
                 evenly, the condense always last, the print still on its
                 shipped clock. */
              const formFlights = Math.max(1, cycleHops - 1);
              const slice = (LAND + LAND_SPREAD) / formFlights;
              const landDur = cycleHops === 1 ? LAND + 0.15 : LAND * (slice / (LAND + LAND_SPREAD));
              const landSpread =
                cycleHops === 1 ? LAND_SPREAD : LAND_SPREAD * (slice / (LAND + LAND_SPREAD));
              const condenseAt = cycleHops === 1 ? 0 : 0.15 + (formFlights - 1) * slice;
              const printFrom = cycleHops === 1 ? PRINT_AT + 0.15 : landDur + landSpread + 0.08;
              for (let k = 1; k < formFlights; k++) {
                tl.add(() => {
                  const span = Math.max(w1, 1);
                  const hopX = cloudX(span);
                  const hopY = cloudY(em.offsetHeight);
                  for (let i = 0; i < cycleN; i++) {
                    const g = parts[i];
                    if (!g) break;
                    gsap.to(g, {
                      x: hopX() / span,
                      y: hopY(),
                      duration: landDur,
                      ease: 'power2.inOut',
                    });
                  }
                }, 0.15 + (k - 1) * slice);
              }
              tl.add(() => {
                const hh = em.offsetHeight;
                const pts = sampleShape(goal.text, w1, hh, cycleN);
                const dy = inkTop(goal);
                if (compactEvery) {
                  /* a two-line target overruns the plate sized off the
                     standing block — grow it before the first mote lands */
                  let maxY = 0;
                  for (const pt of pts) maxY = Math.max(maxY, pt.y);
                  growDust(maxY + dy + 12);
                }
                const span = Math.max(w1, 1);
                for (let i = 0; i < cycleN; i++) {
                  const g = parts[i];
                  if (!g) break;
                  const pt = pts[i];
                  if (!pt) {
                    /* the surplus thin-out keeps its SHIPPED absolute clock:
                       at hops=1 the add itself runs 0.15s early, so the fade
                       waits that lead out — the seam's lit-ink floor never
                       drops below the baseline's at any phase */
                    gsap.to(g, {
                      a: 0,
                      duration: 0.14,
                      ease: 'power1.out',
                      delay: cycleHops === 1 ? 0.15 : 0,
                    });
                    continue;
                  }
                  const u = goal.rtl ? 1 - pt.x / span : pt.x / span;
                  gsap.to(g, {
                    x: pt.x / span,
                    y: pt.y + dy,
                    a: 1,
                    duration: landDur,
                    ease: 'power3.inOut',
                    delay: u * landSpread,
                  });
                  const landEnd = u * landSpread + landDur;
                  gsap.to(g, {
                    a: 0,
                    duration: 0.08,
                    ease: 'none',
                    overwrite: 'auto',
                    delay: Math.max(landEnd + 0.02, printFrom + u * PRINT),
                  });
                }
                printCall = gsap.delayedCall(printFrom, () => {
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
              }, condenseAt);
              /* the settle pad is POSITIONED where the shipped append
                 lands (after the desktop glide; after the shipped 0.15
                 condense-at on mobile), so the pool sweep, the guide
                 breath and the cycle's end keep the shipped clock times
                 at every count */
              tl.to({}, { duration: PRINT_AT + PRINT + 0.45 }, compactEvery ? 0.15 : 0.7);
            }
            /* the timeline sweeps the pool dark AFTER the front has passed */
            tl.to(parts, { a: 0, duration: 0.12, ease: 'none', overwrite: 'auto' }, '>-0.12');
            /* the guides breathe out with the finished print over 0.6s
               (founder: "much more smoothly"); a snap-out reads as a
               glitch, not an exhale */
            tl.to([guideL, guideR], { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, '>-0.45');

            killForm = () => {
              killForm = null;
              tl.kill();
              tlLive = null;
              glideTw = null;
              widthTw?.kill();
              widthTw = null;
              printCall?.kill();
              printCall = null;
              gsap.killTweensOf(parts);
              exitFrac();
              gsap.killTweensOf([word, em]);
              gsap.killTweensOf([guideL, guideR]);
              gsap.set(word, { clearProps: 'clipPath' });
            };
          };

          const startCycle = () => {
            if (!em.isConnected) return;
            phase = 'dissolve';
            morphing = true;
            /* the cycle owns the em now: settle any idle width tween, adopt
               the live pool size, and stand exactly on the measured width */
            widthTw?.kill();
            widthTw = null;
            /* mobile density follows the LINE COUNT (founder: the two-line
               cloud read skeletal at the lean 200) — whichever side of the
               morph wraps taller sets the budget, a line's worth of motes
               per line, capped by the pool */
            cycleN = compactEvery
              ? Math.min(POOL_MAX, poolN * Math.max(countLines(current), countLines(target)))
              : poolN;
            holdWidth();
            const w0 = layoutWidth(current);
            const h = em.offsetHeight;
            /* the outgoing sentence pixelates: seat the dust on ITS ink */
            const pts0 = sampleShape(current.text, w0, h, cycleN);
            const flock = parts.slice(0, cycleN);
            wake();
            warmTarget();
            const tl = gsap.timeline({
              onComplete: () => {
                tlLive = null;
                formPhase();
              },
            });
            tlLive = tl;
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.5, ease: 'power1.inOut' }, 0);
            tl.add(() => {
              parts.forEach((g, i) => {
                const pt = pts0.length ? pts0[i % pts0.length] : undefined;
                g.x = pt ? pt.x : w0 / 2;
                g.y = pt ? pt.y + inkTop(current) : h * 0.45;
                g.a = 0;
              });
            }, 0);
            /* glyphs materialize ON the letterforms while the ink sinks —
               the text reads as BECOMING the glyphs, not fading beside
               them. No dither veil anywhere in the cycle (founder): the
               swarm itself is the whole transition. */
            tl.to(flock, {
              a: () => gsap.utils.random(0.5, 0.95),
              duration: 0.3,
              stagger: { amount: 0.16 },
              ease: 'power1.in',
            }, 0.12);
            tl.to(word, { autoAlpha: 0, duration: 0.34, ease: 'power2.in' }, 0.18);
            /* ...then the swarm DISPERSES into a distributed cloud across
               the whole line box before anything re-forms */
            tl.to(flock, {
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
            /* re-disperses whatever STANDS: the flock stays the one latched
               at the interrupted cycle's seed (cycleN untouched), so no
               unseeded mote can ever fly */
            widthTw?.kill();
            widthTw = null;
            const flock = parts.slice(0, cycleN);
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
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.45, ease: 'power1.inOut' }, 0);
            tl.to(flock, {
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

          /* ---- THE VIEWPORT IS LIVE (founder: "someone goes into inspect
             and chooses the iPhone screen width") ----
             Every width above descends from the viewport: the clamp()ed
             type, the 720px law, the shaped-word table, the em's width, the
             dust plate's size and scale. A viewport that changes WITHOUT a
             reload re-derives all of it here — one trailing ~150ms debounce
             (a drag-resize storm collapses to its last state), ONE batched
             read of the hidden stack per pass, one observer for the engine's
             lifetime, and never a measurement inside a frame loop. */
          const retargetGlide = () => {
            /* mid-form the cloud already rides spanLive, so moving the
               glide's destination moves bracket and dust together — the
               print lands inside bounds that are already right */
            const w1 = layoutWidth(formGoal);
            glideTw?.kill();
            glideTw = null;
            widthTw?.kill();
            widthTw = null;
            if (compactEvery) {
              spanLive = Math.max(w1, 1);
              em.style.width = '';
              return;
            }
            const glide = { w: Math.max(em.getBoundingClientRect().width, 1) };
            widthTw = gsap.to(glide, {
              w: w1,
              duration: 0.2,
              ease: 'power2.out',
              onUpdate: () => {
                spanLive = snapPx(glide.w);
                em.style.width = `${spanLive}px`;
              },
              onComplete: () => {
                widthTw = null;
              },
            });
          };
          const repass = () => {
            if (!em.isConnected) return;
            dpr = Math.max(1, window.devicePixelRatio || 1);
            compactEvery = compactQuery.matches;
            poolN = compactEvery ? 200 : POOL_MAX;
            /* ink sampled under the old type matches no print any more */
            ptsCache.clear();
            measureAll();
            if (drawing) sizeDust();
            if (phase === 'form') {
              retargetGlide();
            } else if (compactEvery) {
              widthTw?.kill();
              widthTw = null;
              em.style.width = '';
            } else if (!morphing) {
              /* the standing sentence settles onto its fresh width — a
                 quick glide, never a snap */
              widthTw?.kill();
              widthTw = gsap.to(em, {
                width: layoutWidth(current),
                duration: 0.2,
                ease: 'power2.out',
                onComplete: () => {
                  widthTw = null;
                },
              });
            }
            /* mid-dissolve needs no hand: the form boundary reads
               layoutWidth fresh from the corrected table and glides there */
          };
          let repassCall: gsap.core.Tween | null = null;
          const schedule = () => {
            repassCall?.kill();
            repassCall = gsap.delayedCall(0.15, () => {
              repassCall = null;
              repass();
            });
          };
          window.addEventListener('resize', schedule);
          void document.fonts.ready.then(() => {
            if (em.isConnected) repass();
          });
          /* Only width changes count, so the em's own height hold never re-triggers the engine. */
          let lastColW = -1;
          const ro = new ResizeObserver((entries) => {
            const cw = entries[entries.length - 1]?.contentRect.width ?? -1;
            if (Math.abs(cw - lastColW) < 0.5) return;
            const first = lastColW < 0;
            lastColW = cw;
            if (!first) schedule();
          });
          ro.observe(em.parentElement ?? em);
          everyCleanup = () => {
            window.removeEventListener('resize', schedule);
            ro.disconnect();
            repassCall?.kill();
            widthTw?.kill();
            /* the morph runs outside every context (see the driver below),
               so its live pieces are killed by hand */
            trailingCall?.kill();
            killForm?.();
            tlLive?.kill();
            printCall?.kill();
            glideTw?.kill();
            /* the engine's created DOM leaves with the effect: under dev
               double-effects the rebuilt engine must not inherit a dead
               canvas or guide pair (and the drawer must not keep ticking
               against a detached plate) */
            sleep();
            guideL.remove();
            guideR.remove();
            dust.remove();
            driver.current = null;
          };
        }

        /* the engine is built — open the vent. Calls that landed before
           this effect ran are staged as pending; the first morph still
           waits out the capture window (any still taken while the run
           settles shows the word whole, not dust). */
        /* a host calls setLocale from inside its own GSAP context (a
           useGSAP callback, a timeline's .call); run under ignore, the
           morph's tweens join no context, so no host keeps every morph it
           ever asked for until it unmounts */
        driver.current = { request: (w) => context.ignore(() => requestWord(w)) };
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
      <span aria-hidden='true' data-every-stack>
        {Object.entries(words).map(([loc, w]) => (
          <span dir={w.rtl ? 'rtl' : 'ltr'} key={loc} lang={w.lang}>
            {w.text}
          </span>
        ))}
      </span>
    </em>
  );
}
