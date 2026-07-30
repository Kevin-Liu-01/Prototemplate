'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Image from 'next/image';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import WallComponent from '../components/WallComponent';
import {
  FLAGS,
  TRUSTED_BY,
  WALL_COLUMNS,
  WALL_SPECS,
  type WallSpec,
  type WallStrings,
} from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const ROTATIONS = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Portuguese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
];

const byId = new Map(WALL_SPECS.map((spec) => [spec.id, spec]));
const columns: WallSpec[][] = WALL_COLUMNS.map((ids) =>
  ids.map((id) => byId.get(id)).filter((spec): spec is WallSpec => Boolean(spec))
);
/** The translated side is the mirror image: column order flips about the mark,
 *  so each component sits opposite its own English source. */
const mirrored: WallSpec[][] = columns.slice().reverse();

/** Writes one language into a rendered component, parts and all. */
function applyStrings(el: HTMLElement, s: WallStrings) {
  el.setAttribute('dir', s.rtl ? 'rtl' : 'ltr');
  (['a', 'b', 'c'] as const).forEach((slot) => {
    const node = el.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
    if (!node) return;
    node.setAttribute('lang', s.lang);
    node.setAttribute('dir', s.rtl ? 'rtl' : 'ltr');
    const value = s[slot] ?? '';
    const sep = node.dataset.split;
    if (sep) {
      const chunks = value.split(sep).map((chunk) => chunk.trim());
      node.querySelectorAll<HTMLElement>('[data-part]').forEach((part, i) => {
        part.textContent = chunks[i] ?? '';
      });
      return;
    }
    node.textContent = value;
  });
  const loc = el.querySelector<HTMLElement>('[data-slot="loc"]');
  if (loc) loc.textContent = s.locale;
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---- headline: hard-cut per-character stamp, the direction's signature ---- */
      const heading = root.current?.querySelector<HTMLElement>('[data-headline]');
      if (heading && !reduced) {
        /* words are split too: the per-character inline-blocks would otherwise
           let the browser break a line inside a word */
        const split = new SplitText(heading, {
          type: 'words,chars',
          charsClass: 'ch',
          wordsClass: 'wd',
        });
        gsap.from(split.chars, {
          autoAlpha: 0,
          scale: 1.9,
          duration: 0.2,
          ease: 'steps(2)',
          stagger: 0.016,
          delay: 0.08,
        });
      }
      if (!reduced) {
        gsap.from('[data-hero-reveal]', {
          autoAlpha: 0,
          scale: 1.2,
          duration: 0.2,
          ease: 'steps(2)',
          stagger: 0.07,
          delay: 0.3,
        });

        /* the wall lands component by component, outward from the mark */
        gsap.from('[data-wall]', {
          autoAlpha: 0,
          scale: 1.16,
          duration: 0.2,
          ease: 'steps(2)',
          stagger: { each: 0.016, from: 'center', grid: 'auto' },
          delay: 0.1,
        });
        gsap.from('[data-core]', {
          autoAlpha: 0,
          scale: 1.5,
          duration: 0.26,
          ease: 'steps(3)',
        });
      }

      /* ---- the gate: a machined aperture, not a loader. The rotating dashed
         arcs read as generic progress-ring chrome next to resend's cube (r2
         item 7); the machine is now a milled graphite disc with the brand's
         doubled contour rings — static hardware. Only the aperture scan bar
         and the per-translation flash move. ---- */
      const gateFlash = root.current?.querySelector<HTMLElement>('[data-flash]');
      const gateScan = root.current?.querySelector<HTMLElement>('[data-scan]');
      if (!reduced) {
        if (gateScan)
          gsap.fromTo(
            gateScan,
            { yPercent: -46, opacity: 0.12 },
            {
              yPercent: 46,
              opacity: 0.5,
              duration: 2.6,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            }
          );
      }

      /* ---- D1: the translated wall keeps re-languaging itself in place.
         Text is written instantly (a frozen frame always reads a real
         language) and only the container travels, FLIP-measured. ---- */
      const stage = root.current;
      const wallEl = root.current?.querySelector<HTMLElement>('[data-wallroot]');
      const coreEl = root.current?.querySelector<HTMLElement>('[data-core]');
      const flowEl = root.current?.querySelector<HTMLElement>('[data-flow]');
      const cycles = WALL_SPECS.map((spec) => {
        const el = stage?.querySelector<HTMLElement>(`[data-side="tr"][data-wall="${spec.id}"]`);
        return el ? { el, spec, index: 0 } : null;
      }).filter((entry): entry is { el: HTMLElement; spec: WallSpec; index: number } =>
        Boolean(entry)
      );

      /* A hard cut, not a FLIP tween: mid-tween frames caught text wrapped or
         clipped mid-glyph against the box still sized for the last language
         (the r1 critic's KO-toast collision). The stamp language of this
         direction is the cut — the strings and the box change on one frame,
         and the flash marks the event. */
      const morph = (entry: { el: HTMLElement; spec: WallSpec; index: number }) => {
        const { el } = entry;
        entry.index = (entry.index + 1) % entry.spec.tr.length;
        const next = entry.spec.tr[entry.index];
        if (!next) return;

        el.style.width = '';
        el.style.height = '';
        applyStrings(el, next);
        el.classList.add('is-morph');
        gsap.delayedCall(0.42, () => el.classList.remove('is-morph'));
      };

      /* One translation, drawn: the source component pulses, a carrier crosses
         to the gate, the gate disperses it, and the carrier lands on the
         translated twin at the exact frame its language changes. This is what
         makes the centre an event and the wall its subject. */
      const carriers: HTMLElement[] = [];
      if (flowEl) {
        for (let i = 0; i < 4; i++) {
          const c = document.createElement('i');
          c.className = 'cm-carrier';
          flowEl.appendChild(c);
          carriers.push(c);
        }
      }
      let carrierAt = 0;

      const route = (entry: { el: HTMLElement; spec: WallSpec; index: number }) => {
        const carrier = carriers[carrierAt % carriers.length];
        carrierAt += 1;
        const source = stage?.querySelector<HTMLElement>(
          `[data-side="en"][data-wall="${entry.spec.id}"]`
        );
        if (!wallEl || !coreEl || !carrier || !source) {
          morph(entry);
          return;
        }
        const w = wallEl.getBoundingClientRect();
        const s = source.getBoundingClientRect();
        const t = entry.el.getBoundingClientRect();
        const c = coreEl.getBoundingClientRect();
        const cx = c.left + c.width / 2 - w.left;
        const cy = c.top + c.height / 2 - w.top;

        source.classList.add('is-source');
        gsap.delayedCall(0.3, () => source.classList.remove('is-source'));

        gsap.set(carrier, {
          x: s.right - w.left,
          y: s.top + s.height / 2 - w.top,
          opacity: 1,
          scaleX: 1,
        });
        gsap
          .timeline()
          .to(carrier, { x: cx, y: cy, scaleX: 3.4, duration: 0.42, ease: 'power2.in' })
          .add(() => {
            if (gateFlash)
              gsap.fromTo(
                gateFlash,
                { opacity: 0.9, scale: 0.55 },
                { opacity: 0, scale: 1.7, duration: 0.6, ease: 'power2.out' }
              );
          })
          .to(carrier, {
            x: t.left - w.left,
            y: t.top + t.height / 2 - w.top,
            scaleX: 1,
            duration: 0.4,
            ease: 'power2.out',
          })
          .add(() => morph(entry))
          .to(carrier, { opacity: 0, duration: 0.18 });
      };

      if (!reduced && cycles.length) {
        const order = gsap.utils.shuffle(cycles.slice());
        let cursor = 0;
        let live = true;
        let call: gsap.core.Tween | null = null;

        const tick = () => {
          const entry = order[cursor % order.length];
          cursor += 1;
          if (live && entry) route(entry);
          call = gsap.delayedCall(0.6 + Math.random() * 0.4, tick);
        };
        call = gsap.delayedCall(1.1, tick);

        /* columns breathe at different rates so the wall never sits still —
           amplitude kept inside the wall's own padding so no chip ever drifts
           under the nav and crops a locale tag mid-character */
        gsap.utils.toArray<HTMLElement>('.cm-wall-col').forEach((col, i) => {
          gsap.to(col, {
            y: i % 2 === 0 ? -6 : 5,
            duration: 9 + (i % 3) * 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.4,
          });
        });

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            live = self.isActive;
            if (self.isActive) call?.play();
            else call?.pause();
          },
        });
      }

      if (!reduced) {
        /* ---- flag marquee ---- */
        const track = root.current?.querySelector<HTMLElement>('[data-marquee]');
        if (track) {
          const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 46 });
          ScrollTrigger.create({
            trigger: track,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
          });
        }

        /* ---- language rotator: whole-word hard cuts, never a running scramble,
           so any frozen frame reads a real language name ---- */
        const rot = root.current?.querySelector<HTMLElement>('[data-rotator]');
        if (rot) {
          let i = 0;
          const cycle = () => {
            gsap.delayedCall(2.2, () => {
              i = (i + 1) % ROTATIONS.length;
              rot.textContent = ROTATIONS[i] ?? 'Spanish';
              gsap.fromTo(
                rot,
                { backgroundColor: '#ffffff', color: '#060606' },
                {
                  backgroundColor: 'rgba(255,255,255,0)',
                  color: '#ffffff',
                  duration: 0.3,
                  ease: 'steps(2)',
                }
              );
              cycle();
            });
          };
          cycle();
        }
      }
    },
    { scope: root }
  );

  const copyCommand = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
    void navigator.clipboard?.writeText('npx gt@latest').catch(() => undefined);
  };

  return (
    <header className='cm-hero' id='top' ref={root}>
      {/* The burst is a lamp behind the gate, not a backdrop: raised exposure
          (dimmer) so the wall's furthest columns read as hardware, and the
          scrim below pulls the brightness back onto the mark's axis. */}
      <PrismaticField
        className='cm-hero-field'
        preset='2'
        dpr={1}
        speed={0.55}
        params={{ exposureScale: 4200 }}
      />
      <div className='cm-hero-scrim' />

      <div className='cm-wall' data-wallroot aria-hidden>
        <div className='cm-wall-side'>
          {columns.map((col, i) => (
            <div className={`cm-wall-col c${i}`} key={`en-${i}`}>
              {col.map((spec) => (
                <WallComponent key={spec.id} spec={spec} strings={spec.en} />
              ))}
            </div>
          ))}
        </div>

        <div className='cm-wall-core' data-core>
          {/* THREAD_MOTIF: every stroke of the GT mark is two parallel lines.
              The gate wears that geometry — an outer doubled contour just off
              the disc edge, and a second pair engraved into the milled face. */}
          <svg className='cm-gate' viewBox='0 0 200 200'>
            <circle className='cm-gate-ring' cx='100' cy='100' r='93' />
            <circle className='cm-gate-ring' cx='100' cy='100' r='89.1' />
            <circle className='cm-gate-ring cm-gate-ring--in' cx='100' cy='100' r='72' />
            <circle className='cm-gate-ring cm-gate-ring--in' cx='100' cy='100' r='68.1' />
          </svg>
          <span className='cm-gate-scan' data-scan />
          <span className='cm-gate-flash' data-flash />
          <Image
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={320}
            height={320}
            priority
          />
        </div>

        <div className='cm-wall-side cm-wall-side--tr'>
          {mirrored.map((col, i) => {
            const index = columns.length - 1 - i;
            return (
              <div className={`cm-wall-col c${index}`} key={`tr-${index}`}>
                {col.map((spec) => (
                  <WallComponent
                    key={spec.id}
                    spec={spec}
                    strings={spec.tr[0] ?? spec.en}
                    translated
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className='cm-wall-flow' data-flow />
      </div>

      <div className='cm-hero-copy'>
        <h1 className='slab' data-headline>
          Launch in every language
        </h1>
        {/* the two threads — source and translation — enter the page here,
            at the headline's baseline (THREAD_MOTIF) */}
        <div className='cm-thread-base' data-hero-reveal aria-hidden />
        <p className='cm-hero-sub' data-hero-reveal>
          General Translation helps developers localize apps into{' '}
          <span className='rot' data-rotator>
            Spanish
          </span>{' '}
          — no painful refactors and no managing large JSON files.
        </p>
        <div className='cm-hero-ctas' data-hero-reveal>
          <a className='primary' href='#story'>
            Get Started
          </a>
          <a className='ghost' href='#features'>
            Docs
          </a>
          <button className='cm-cmd' type='button' onClick={copyCommand}>
            <span className='dim'>$</span> npx gt@latest{' '}
            <span className='dim'>{copied ? '✓' : '⧉'}</span>
          </button>
        </div>
      </div>

      <div className='cm-band cm-band--flags'>
        <span className='cm-band-key'>100+ languages</span>
        <div className='cm-marq'>
          <div className='cm-marq-track' data-marquee>
            {[...FLAGS, ...FLAGS].map((flag, i) => (
              <span className='cm-flag' key={`${flag.name}-${i}`}>
                <i className='cm-flag-k'>{flag.code}</i>
                {flag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className='cm-band cm-band--trust'>
        <span className='cm-band-key'>Trusted by</span>
        <div className='cm-trust'>
          {TRUSTED_BY.map((name) => (
            <span className='wm' key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
