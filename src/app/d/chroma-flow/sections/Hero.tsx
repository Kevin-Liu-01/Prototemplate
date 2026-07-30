'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import FlowField from './FlowField';

import './hero-every.css';

gsap.registerPlugin(useGSAP);

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** The journey the rest of the page walks, stated once at the hero's baseline. */
const STAGES = ['extract', 'translate', 'review', 'ship', 'update'] as const;

/* "language" across maximally different writing systems — Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek — short tokens so the
   re-measured line never wraps. */
const EVERY: readonly string[] = ['language', '言語', 'لغة', 'भाषा', 'язык', '语言', '언어', 'γλώσσα'];

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

/**
 * The hero IS the flow field. Curl-noise streamlines — every one a doubled
 * thread, source and translation at constant gauge — stream left to right
 * through the first viewport, and the headline sits on a real white card in
 * the calm the flow leaves around it: the shader measures the card's box
 * (carveRef) and the streamlines part around a surface, not bare type. The
 * headline hinge is the measuring instrument — the accented word morphs
 * through real languages, dissolving to multilingual dust and reassembling
 * inside re-measured bounds. Where the current squeezes past the flanks it
 * picks up the page's one chroma pass; the field re-inks itself from the
 * theme tokens when the page flips dark. At the bottom edge, the five
 * stations of the string's journey sit on the rule the flow runs over — the
 * page below walks them in order.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const core = useRef<HTMLDivElement>(null);
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

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      gsap.from('[data-hero-stage]', {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'none',
        delay: 0.7,
      });

      /* ---- the headline hinge (toolchain's measuring instrument) ----
         Each cycle: bound guides appear around the current word; the word
         dissolves into small glyphs from many scripts; the bounds tween to
         the NEXT word's measured width first — scoping the layout shift
         before any text exists — then the dust converges onto the incoming
         letterforms (canvas-sampled) and the characters fill the silhouette
         in. The carve follows for free: the em re-measures the core box and
         the shader's ResizeObserver re-centers the clearing. */
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

        const measure = (text: string) => {
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
          const nextText = EVERY[idx] ?? 'every';
          const w0 = em.offsetWidth;
          const w1 = measure(nextText);
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
           still taken while the field settles shows the word whole, not dust. */
        gsap.delayedCall(5.6, swap);
      }
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='cf-hero'>
        <FlowField
          className='cf-hero-field'
          carveRef={core}
          themeAware
          speed={1}
          params={{
            spacing: 24,
            amp: 1.05,
            drift: 0.5,
            chroma: 0.85,
            chromaLocal: 1,
            inkAlpha: 0.66,
          }}
          darkParams={{
            chroma: 0.5,
            inkAlpha: 0.52,
          }}
          narrowParams={{
            spacing: 20,
            amp: 1.5,
            drift: 0.55,
          }}
        />

        <div className='cf-hero-in'>
          {/* The measured obstacle is a real surface now: a white card in the
              hero-card grammar, and the field parts around its box. */}
          <div className='cf-hero-core' ref={core}>
            <Image
              className='cf-hero-mark tc-logo-light'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={34}
              height={34}
            />
            <Image
              className='cf-hero-mark tc-logo-dark'
              data-hero-in
              src='/brand/no-bg-gt-logo-dark.png'
              alt='General Translation'
              width={34}
              height={34}
            />

            {/* Two authored lines; the accented word opens the hinge of the
                sentence and carries the morph. */}
            <h1 data-hero-in>
              <span>Your product speaks</span>
              <span>
                every{' '}
                <em data-every>
                  <span data-every-word>language</span>
                </em>
                .
              </span>
            </h1>

            <p className='cf-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>

            <div className='cf-hero-acts' data-hero-in>
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
        </div>

        {/* The journey's five stations, seated on the hero's bottom rule. */}
        <div className='cf-hero-run' aria-label='The pipeline: extract, translate, review, ship, update'>
          {STAGES.map((stage) => (
            <span className='cf-hero-stage' data-hero-stage key={stage}>
              {stage}
            </span>
          ))}
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
