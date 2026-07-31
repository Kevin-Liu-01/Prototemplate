'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * The index's nameplate, told as type: `prototype` and `template` stand as
 * two measured letterform constructions — guides, crop ticks, a spec line —
 * and then the shared material combines: `proto` keeps its seat, `type`
 * falls away as spent glyphs, `template` travels in whole, and the word the
 * two of them make — Prototemplate — settles onto the doubled baseline.
 *
 * The final word is the layout's ground truth (it owns the space; nothing
 * reflows). The two sources are absolutely placed satellites, and the merge
 * is measured FLIP: every traveling letter tweens from its own rect to its
 * target letter's rect, so the choreography survives any viewport. Fonts are
 * awaited before measuring; resize rebuilds; reduced motion gets the settled
 * nameplate with the two sources resting as quiet spec lines.
 */

const FINAL = 'Prototemplate'.split('');
const PROTO = 'prototype'.split('');
const TEMPLATE = 'template'.split('');

/** prototype[i] -> final index (proto only; `type` has no seat). */
const PROTO_MAP = [0, 1, 2, 3, 4] as const;
/** template[i] -> final index (all eight travel). */
const TEMPLATE_OFFSET = 5;

const HOLD_MERGED = 3.2;
const HOLD_SOURCES = 1.6;

type WordProps = {
  word: readonly string[];
  attr: string;
  className: string;
  spec: string;
};

function Construction({ word, attr, className, spec }: WordProps) {
  return (
    <div className={`pt-word ${className}`} {...{ [`data-${attr}`]: '' }}>
      <span className='pt-guide is-top' aria-hidden />
      <span className='pt-letters' aria-hidden>
        {word.map((ch, i) => (
          <span data-pt-letter='' key={`${ch}-${i}`}>
            {ch}
          </span>
        ))}
      </span>
      <span className='pt-guide is-bottom' aria-hidden />
      <span className='pt-spec'>{spec}</span>
    </div>
  );
}

export default function PrototemplateHero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const finals = gsap.utils.toArray<HTMLElement>('[data-pt-final] [data-pt-letter]', rootEl);
      const protoLetters = gsap.utils.toArray<HTMLElement>('[data-pt-proto] [data-pt-letter]', rootEl);
      const templateLetters = gsap.utils.toArray<HTMLElement>('[data-pt-template] [data-pt-letter]', rootEl);
      const words = gsap.utils.toArray<HTMLElement>('.pt-word', rootEl);
      const guides = gsap.utils.toArray<HTMLElement>('.pt-guide', rootEl);
      const specs = gsap.utils.toArray<HTMLElement>('.pt-spec', rootEl);
      const finalWord = rootEl.querySelector<HTMLElement>('[data-pt-final]');
      const finalRule = rootEl.querySelector<HTMLElement>('.pt-final-rule');
      const finalSpec = rootEl.querySelector<HTMLElement>('.pt-final-spec');
      if (!finalWord || !finalRule || !finalSpec || finals.length !== FINAL.length) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        gsap.set([finals, finalRule, finalSpec], { opacity: 1 });
        gsap.set(finalRule, { scaleX: 1 });
        gsap.set(words, { opacity: 0.4 });
        return;
      }

      let tl: gsap.core.Timeline | null = null;

      const build = () => {
        tl?.kill();

        /* Everything to its resting zero before measuring. */
        gsap.set([protoLetters, templateLetters], { clearProps: 'all' });
        gsap.set([finals, finalRule, finalSpec], { opacity: 0 });
        gsap.set(finalRule, { scaleX: 0 });
        gsap.set(words, { opacity: 1 });
        gsap.set(guides, { scaleX: 0 });
        gsap.set(specs, { opacity: 0 });
        gsap.set([protoLetters, templateLetters], { yPercent: 60, opacity: 0 });

        /* Measured travel: source letter rect -> target letter rect. */
        const flights: { el: HTMLElement; dx: number; dy: number; scale: number; to: HTMLElement }[] = [];
        const spent: HTMLElement[] = [];

        const measure = (el: HTMLElement, target: HTMLElement) => {
          const a = el.getBoundingClientRect();
          const b = target.getBoundingClientRect();
          return {
            el,
            to: target,
            dx: b.left + b.width / 2 - (a.left + a.width / 2),
            dy: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.height / a.height,
          };
        };

        protoLetters.forEach((el, i) => {
          const seat = PROTO_MAP[i as 0];
          if (i < PROTO_MAP.length && seat !== undefined) {
            const target = finals[seat];
            if (target) flights.push(measure(el, target));
          } else {
            spent.push(el);
          }
        });
        templateLetters.forEach((el, i) => {
          const target = finals[i + TEMPLATE_OFFSET];
          if (target) flights.push(measure(el, target));
        });

        tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });

        /* 1 — the two constructions assemble. */
        tl.to(guides, { scaleX: 1, duration: 0.55, ease: 'power2.out', stagger: 0.04 })
          .to(
            [protoLetters, templateLetters],
            { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.025 },
            '-=0.3'
          )
          .to(specs, { opacity: 1, duration: 0.4 }, '-=0.2')
          .to({}, { duration: HOLD_SOURCES });

        /* 2 — the merge. Spent glyphs fall; the rest travel to their seats. */
        tl.addLabel('merge')
          .to(specs, { opacity: 0, duration: 0.3 }, 'merge')
          .to(guides, { scaleX: 0, duration: 0.4, ease: 'power2.in', stagger: 0.02 }, 'merge')
          .to(
            spent,
            { yPercent: 140, opacity: 0, rotation: () => gsap.utils.random(-14, 14), duration: 0.55, ease: 'power2.in', stagger: 0.03 },
            'merge+=0.05'
          );

        flights.forEach((flight, i) => {
          const at = `merge+=${0.18 + i * 0.028}`;
          tl!
            .to(flight.el, { x: flight.dx, y: flight.dy, scale: flight.scale, duration: 0.75, ease: 'power3.inOut' }, at)
            .to(flight.el, { opacity: 0, duration: 0.12 }, `${at}+=0.63`)
            .to(flight.to, { opacity: 1, duration: 0.12 }, `${at}+=0.63`);
        });

        /* 3 — the settled nameplate: doubled baseline, one spec line. */
        tl.to(finalRule, { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }, 'merge+=0.9')
          .to(finalSpec, { opacity: 1, duration: 0.45 }, 'merge+=1.05')
          .to({}, { duration: HOLD_MERGED });

        /* 4 — dissolve back so the loop can restate the argument. */
        tl.addLabel('reset')
          .to([finals, finalRule, finalSpec], { opacity: 0, duration: 0.5, ease: 'power2.in' }, 'reset')
          .to(finalRule, { scaleX: 0, duration: 0.5, ease: 'power2.in' }, 'reset')
          .set([protoLetters, templateLetters], { x: 0, y: 0, scale: 1, yPercent: 60, opacity: 0, rotation: 0 })
          .set(spent, { yPercent: 60 });
      };

      /* Letterforms decide every measurement — wait for them. */
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (!cancelled) build();
      });

      let raf = 0;
      const onResize = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (!cancelled) build();
        });
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelled = true;
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        tl?.kill();
      };
    },
    { scope: root }
  );

  return (
    <div className='pt-hero' ref={root}>
      <p className='pt-mast'>General Translation — design index</p>

      <Construction attr='pt-proto' className='is-proto' spec='proto·type — the working model' word={PROTO} />
      <Construction attr='pt-template' className='is-template' spec='temp·late — the reusable form' word={TEMPLATE} />

      <h1 className='pt-final' data-pt-final aria-label='Prototemplate'>
        <span className='pt-letters' aria-hidden>
          {FINAL.map((ch, i) => (
            <span data-pt-letter='' key={`${ch}-${i}`}>
              {ch}
            </span>
          ))}
        </span>
        <span className='pt-final-rule' aria-hidden />
        <span className='pt-final-spec'>prototype × template — one working form, reused</span>
      </h1>
    </div>
  );
}
