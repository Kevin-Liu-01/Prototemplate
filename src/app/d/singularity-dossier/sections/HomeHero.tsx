'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import TranslateWindow from '@/app/d/_v0/TranslateWindow';

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

/* "language" in each of the window's fifteen belt locales — ONE CLOCK
   (founder): the belt below reports whichever locale it centres
   (TranslateWindow's onLocaleChange) and the em morphs to that
   locale's word, so the headline never runs a timer of its own and the
   word up here always names the locale on screen. Keyed by locale
   code; English is the SSR/resting initial only — it is not on the
   belt. Short native tokens so the re-measured line never wraps. Each
   word carries its BCP-47 tag so the hidden measurer and the live word
   shape with the same fonts; none of the fifteen are RTL (the belt's
   roster excludes ar/he until the seam mirrors), but the rtl wiring —
   probe dir, bidi isolate, reading-side wipe — stays for the day one
   arrives. */
type EveryWord = { text: string; lang: string; rtl?: boolean };

const WORD_EN: EveryWord = { text: 'language', lang: 'en' };

const WORDS: Record<string, EveryWord> = {
  en: WORD_EN,
  es: { text: 'idioma', lang: 'es' },
  ja: { text: '言語', lang: 'ja' },
  fr: { text: 'langue', lang: 'fr' },
  ko: { text: '언어', lang: 'ko' },
  de: { text: 'Sprache', lang: 'de' },
  zh: { text: '语言', lang: 'zh' },
  pt: { text: 'idioma', lang: 'pt' },
  ru: { text: 'язык', lang: 'ru' },
  it: { text: 'lingua', lang: 'it' },
  hi: { text: 'भाषा', lang: 'hi' },
  nl: { text: 'taal', lang: 'nl' },
  tr: { text: 'dil', lang: 'tr' },
  sv: { text: 'språk', lang: 'sv' },
  id: { text: 'bahasa', lang: 'id' },
  pl: { text: 'język', lang: 'pl' },
};

/* the dissolve dust pool: small glyphs sampled across the same scripts */
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
        let pending: EveryWord | null = null;
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

        /* the branch below installs the actual animation; drive() is the
           gate both share: nothing runs before the capture window closes,
           nothing overlaps a running cycle, and only the LATEST request
           survives a busy spell */
        let start: (next: EveryWord) => void = () => {};
        const drive = () => {
          if (morphing || !armed) return;
          const next = pending;
          pending = null;
          if (!next) return;
          if (next.text === current.text) {
            /* es→pt: same word, different tongue — retag, never dissolve */
            if (next.lang !== current.lang) {
              current = next;
              word.setAttribute('lang', next.lang);
              word.setAttribute('dir', next.rtl ? 'rtl' : 'ltr');
            }
            return;
          }
          start(next);
        };

        if (compactEvery) {
          /* At mobile scale 26 particles cannot breathe: a clean measured
             crossfade tells the same story, on the same belt clock. */
          start = (next) => {
            if (!root.current || !root.current.isConnected) return;
            const w1 = measure(next);
            current = next;
            morphing = true;
            gsap.to(word, {
              autoAlpha: 0,
              duration: 0.18,
              ease: 'power2.in',
              onComplete: () => {
                showWord(next);
                gsap.to(em, {
                  width: w1,
                  duration: 0.4,
                  ease: 'power2.inOut',
                  snap: { width: 1 / dpr },
                  onComplete: () => {
                    morphing = false;
                    holdWidth();
                    /* a locale that arrived mid-swap is served now */
                    drive();
                  },
                });
                gsap.to(word, { autoAlpha: 1, duration: 0.22, ease: 'power2.out', delay: 0.14 });
              },
            });
          };
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
            canvas.width = Math.max(width, 10);
            canvas.height = Math.max(height, 10);
            const ctx = canvas.getContext('2d');
            if (!ctx) return [];
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(text, 0, canvas.height * 0.85);
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

          start = (next) => {
            if (!root.current || !root.current.isConnected) return;
            const w0 = measure(current);
            const w1 = measure(next);
            current = next;
            morphing = true;
            const tl = gsap.timeline({
              onComplete: () => {
                morphing = false;
                /* re-assert from a fresh cache in case fonts or viewport
                   moved mid-morph — otherwise the same value: nothing snaps */
                holdWidth();
                /* a locale that arrived mid-morph is served now */
                drive();
              },
            });

            // 1. the instrument appears around the current word
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.12, ease: 'none' });

            // 2. the word dissolves as ONE shaped run — splitting it into
            //    per-character spans would disconnect Arabic and reflow the
            //    very width the sentence is standing on — while the dust
            //    carries the scatter
            tl.to(word, {
              autoAlpha: 0,
              scale: 0.92,
              transformOrigin: '50% 60%',
              duration: 0.22,
              ease: 'power2.in',
            }, '+=0.03');
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
                y: gsap.utils.clamp(h0 * 0.04, h0 * 0.4, h0 * 0.22 + Math.sin(angle) * ry),
              };
            };
            const place0 = ring(Math.max(w0, 30));
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.35, 0.8),
              x: (i, g) => place0(g as HTMLElement, i).x,
              y: (i, g) => place0(g as HTMLElement, i).y,
              duration: 0.2,
              stagger: 0.006,
              ease: 'power1.out',
            }, '<+=0.06');

            // 3. the bounds glide to the incoming word's shaped width — ONE
            //    continuous tween, quantized to device pixels, so the period
            //    and everything after it track without buzz or end snap
            tl.to(em, { width: w1, duration: 0.45, ease: 'power2.inOut', snap: { width: 1 / dpr } });
            const place1 = ring(Math.max(w1, 30));
            tl.to(dustGlyphs, {
              x: (i, g) => place1(g as HTMLElement, i).x,
              y: (i, g) => place1(g as HTMLElement, i).y,
              duration: 0.45,
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
                  duration: 0.3,
                  ease: 'power3.inOut',
                  delay: i * 0.005,
                });
              });
              gsap.delayedCall(0.3, () => {
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
                    duration: 0.28,
                    ease: 'power2.out',
                    onComplete: () => {
                      gsap.set(word, { clearProps: 'clipPath' });
                    },
                  }
                );
                gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.2, stagger: 0.005, ease: 'power1.out', delay: 0.05 });
              });
            });
            tl.to({}, { duration: 0.6 });

            // 5. the instrument withdraws
            tl.to([guideL, guideR], { opacity: 0, duration: 0.18, ease: 'none' }, '>-0.04');
          };
        }

        /* the engine is built — open the vent. The mount-time report
           landed before this effect ran, so it is re-staged as pending;
           the first morph still waits out the first-fold capture window
           (any still taken while the run settles shows the word whole,
           not dust), by which time the belt's first crossing has usually
           re-aimed pending at the SECOND locale — correct by the
           one-clock rule: the em always names what the belt centres NOW. */
        driver.current = {
          request: (w) => {
            pending = w;
            drive();
          },
        };
        const init = WORDS[pendingLoc.current];
        if (init) pending = init;
        gsap.delayedCall(1.8, () => {
          armed = true;
          drive();
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
        <h1 data-hero-in>
          <span>
            Launch in every{' '}
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                language
              </span>
            </em>
            .
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          <img alt='General Translation' className='tch-sub-mark is-light' src='/brand/no-bg-gt-logo-light.png' /><img alt='' aria-hidden className='tch-sub-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' /> builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href='#deploy'>
              Get started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs'>
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
        <PrismaticField className='tc-hero-field tch-field' preset='1' speed={0.5} params={{ exposureScale: 3400 }} />
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
