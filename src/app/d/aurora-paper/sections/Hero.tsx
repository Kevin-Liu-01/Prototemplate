'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState, type CSSProperties } from 'react';

import AuroraWash from './AuroraWash';

import './chip-consistency.css';
import './hero-every.css';
import './hero-aurora.css';

gsap.registerPlugin(useGSAP);

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/**
 * The band's visualization: one real string from the product's own translation
 * files (public/_gt/[locale].json in the gt next-ssg example), set as a type
 * specimen on the aurora wash. "Deploy now" nearly doubles in French and
 * collapses to four glyphs in Chinese — the whole layout problem of
 * localization in five lines, measured by the browser at render rather than
 * typed into the markup.
 */
const CASCADE: readonly { loc: string; text: string }[] = [
  { loc: 'en', text: 'Deploy now' },
  { loc: 'fr', text: 'Déployer maintenant' },
  { loc: 'de', text: 'Jetzt bereitstellen' },
  { loc: 'ja', text: '今すぐデプロイ' },
  { loc: 'zh', text: '立即部署' },
];

/* "language" across maximally different writing systems — Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek — short tokens so the
   re-measured line never wraps. */
const EVERY: readonly string[] = ['language', '言語', 'لغة', 'भाषा', 'язык', '语言', '언어', 'γλώσσα'];

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [deltas, setDeltas] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      /* Measure the cascade for real: each row's advance width against the
         English source, from the rendered DOM after the display face loads.
         The dimension bracket under each line and the delta label are both
         driven by this measurement — nothing here is typed in. */
      const measure = () => {
        const rows = gsap.utils.toArray<HTMLElement>('[data-casc-row]', root.current);
        const widths = rows.map((row) => {
          const span = row.querySelector<HTMLElement>('[data-casc-text]');
          return span ? span.getBoundingClientRect().width : 0;
        });
        const base = widths[0] || 1;
        setDeltas(
          widths.map((w, i) => {
            if (i === 0) return 'source';
            const pct = Math.round((w / base - 1) * 100);
            return `${pct >= 0 ? '+' : '−'}${Math.abs(pct)}%`;
          })
        );
      };

      measure();
      void document.fonts?.ready.then(measure);
      window.addEventListener('resize', measure);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from('[data-hero-in]', {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power2.out',
        });

        gsap.from('[data-casc-row]', {
          y: 18,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.09,
          delay: 0.3,
          ease: 'power3.out',
          clearProps: 'transform',
        });
      }

      /* ---- the headline hinge: a measuring instrument ----
         Each cycle: the bound guides appear around the current word; the word
         dissolves into small glyphs from many scripts; the bounds tween to the
         NEXT word's measured width first — scoping the layout shift before any
         text exists — then the dust assembles the incoming letterform shapes
         (canvas-sampled) and the characters fill the silhouette in. Skipped
         wholesale under reduced motion: the still shows the word whole. */
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const em = root.current?.querySelector<HTMLElement>('[data-every]');
        const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
        const compactEvery = window.matchMedia('(max-width: 720px)').matches;
        if (em && word && compactEvery) {
          /* At mobile scale 26 particles cannot breathe: a clean measured
             crossfade tells the same story. */
          let ci = 0;
          const compactSwap = () => {
            if (!root.current || !root.current.isConnected) return;
            ci = (ci + 1) % EVERY.length;
            const w0 = em.offsetWidth;
            gsap.to(word, { autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
              word.textContent = EVERY[ci] ?? 'language';
              em.style.width = 'auto';
              const w1 = em.offsetWidth;
              gsap.fromTo(em, { width: w0 }, { width: w1, duration: 0.35, ease: 'power3.inOut',
                onComplete: () => { em.style.width = 'auto'; } });
              gsap.to(word, { autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.12 });
              gsap.delayedCall(2.4, compactSwap);
            } });
          };
          em.style.display = 'inline-block';
          em.style.whiteSpace = 'nowrap';
          gsap.delayedCall(3.4, compactSwap);
        }
        if (em && word && !compactEvery) {
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

          const setChars = (text: string) => {
            word.innerHTML = '';
            for (const ch of text) {
              const c = document.createElement('span');
              c.className = 'tc-ech';
              c.textContent = ch;
              word.appendChild(c);
            }
            return Array.from(word.children) as HTMLElement[];
          };

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

          const measureWord = (text: string) => {
            const probe = document.createElement('span');
            probe.style.visibility = 'hidden';
            probe.style.position = 'absolute';
            probe.style.whiteSpace = 'nowrap';
            probe.textContent = text;
            em.appendChild(probe);
            const w = probe.offsetWidth;
            probe.remove();
            return w;
          };

          let idx = 0;
          const swap = () => {
            if (!root.current || !root.current.isConnected) return;
            idx = (idx + 1) % EVERY.length;
            const nextText = EVERY[idx] ?? 'language';
            const w0 = em.offsetWidth;
            const w1 = measureWord(nextText);
            const outChars = Array.from(word.children) as HTMLElement[];
            const tl = gsap.timeline({
              onComplete: () => {
                em.style.width = 'auto';
                gsap.delayedCall(2.2, swap);
              },
            });

            // 1. the instrument appears around the current word
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

            // 2. the word dissolves into small glyphs
            tl.to(outChars, {
              scale: 0.25,
              autoAlpha: 0,
              y: () => gsap.utils.random(-14, 14),
              x: () => gsap.utils.random(-18, 18),
              duration: 0.3,
              stagger: 0.02,
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

            // 3. the bounds scope the coming layout shift — before any text
            tl.fromTo(em, { width: w0 }, { width: w1, duration: 0.42, ease: 'power3.inOut' });
            const place1 = ring(Math.max(w1, 30));
            tl.to(dustGlyphs, {
              x: (i, g) => place1(g as HTMLElement, i).x,
              y: (i, g) => place1(g as HTMLElement, i).y,
              duration: 0.42,
              ease: 'power3.inOut',
            }, '<');

            // 4. the dust assembles the SHAPES of the incoming characters —
            //    each glyph flies to a sampled point on the new letterforms —
            //    and only then do the actual characters fill the silhouette in.
            tl.add(() => {
              const h = em.offsetHeight;
              const pts = sampleShape(nextText, w1, h, dustGlyphs.length);
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
                const inChars = setChars(nextText);
                gsap.fromTo(inChars,
                  { autoAlpha: 0 },
                  { autoAlpha: 1, duration: 0.3, stagger: 0.03, ease: 'power1.inOut' });
                gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.26, stagger: 0.006, ease: 'power1.out', delay: 0.08 });
              });
            });
            tl.to({}, { duration: 0.85 });

            // 5. the instrument withdraws
            tl.to([guideL, guideR], { opacity: 0, duration: 0.24, ease: 'none' }, '>-0.05');
          };

          setChars('language');
          /* The first dissolve waits out the first-fold capture window: any
             still taken while the page settles shows the word whole, not dust. */
          gsap.delayedCall(5.6, swap);
        }
      }

      return () => window.removeEventListener('resize', measure);
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack, in this fork's material: a genuine white card —
          radius 12, no border, the shell-grey ground filling the corner
          notches — with the aurora breathing through its paper; then the
          SQUARE full-width wash band carrying the specimen cascade; then the
          trust card repeating the card grammar below. */}
      <div className='tc-hero tch-card'>
        <AuroraWash
          className='aph-card-wash'
          preset='paper'
          darkPreset='paper-dark'
          params={{ wash: 0.6, grain: 0.015, quiet: 0.7, quietLo: 0.2, quietHi: 0.85, envelope: 1.6, axisLift: 0.88 }}
          darkParams={{ base: [0.051, 0.055, 0.071], wash: 0.85, envelope: 1.4 }}
          speed={0.55}
        />
        <div className='aph-card-in'>
          <Image
            className='tc-hero-mark'
            data-hero-in
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={34}
            height={34}
          />

          {/* Two authored lines; the accented word opens the hinge of the
              sentence and morphs through real languages as an instrument. */}
          <h1 data-hero-in>
            <span>Launch in</span>
            <span>
              every{' '}
              <em data-every>
                <span data-every-word>language</span>
              </em>
              .
            </span>
          </h1>

          <p className='tc-hero-sub' data-hero-in>
            Wrap your JSX in <code className='tc-chip'>&lt;T&gt;</code>, run one command, and ship every
            string in 100+ languages.
          </p>

          <div className='tc-hero-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#editor'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Read the docs
            </a>
            <button className='tc-copy' type='button' onClick={copy}>
              <span>$ npx gt@latest</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* The band: SQUARE, full rail width, the wash at full exposure — a
          sheet of paper the light is passing through (ink-black northern sky
          in dark mode), with the measured specimen cascade printed on it. */}
      <div className='tc-hero-cell tch-band aph-band'>
        <AuroraWash
          className='aph-band-wash'
          preset='paper'
          darkPreset='paper-dark'
          params={{ quiet: 1, quietLo: 0, quietHi: 1, axisLift: 0.74, envelope: 1.15 }}
          speed={0.6}
        />
        <div className='ap-casc' data-hero-in>
          <p className='ap-casc-cap'>
            public/_gt/[locale].json — one string, five locales · widths measured at render, not typed
          </p>

          {CASCADE.map((line, i) => (
            <div
              className='ap-casc-row'
              data-casc-row
              data-src={i === 0 || undefined}
              key={line.loc}
              style={{ '--casc-i': i } as CSSProperties}
            >
              <span className='ap-casc-tag'>{line.loc}</span>
              <span className='ap-casc-text' data-casc-text lang={line.loc}>
                {line.text}
              </span>
              <span className='ap-casc-delta'>{deltas[i] ?? ''}</span>
            </div>
          ))}
        </div>
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
