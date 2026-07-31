'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * The nameplate as a working type-specimen sheet.
 *
 * `prototype` (serif) stands above the destination line, `template`
 * (grotesk) below it, the destination between them as EMPTY outlined
 * text. Every word is held by a crop frame — four border-touching
 * rules: one above, one below, one left, one right — and the frames
 * move with their words.
 *
 * The take is physical: `type` falls out and the serif frame's right
 * rule slides in to re-hug the shorter word; then `proto` comes DOWN
 * and `template` comes UP, frames traveling with them, until both park
 * inside the outline — the parked words ARE the nameplate (lowercase,
 * so nothing has to crossfade). The destination frame fades in around
 * them: cap rule, the doubled baseline pair, and three verticals —
 * left bound, the serif/grotesk junction, right bound.
 *
 * Fonts are awaited before measuring; resize rebuilds; reduced motion
 * holds the settled sheet.
 */

const TYPE_LETTERS = 'type'.split('');

const HOLD_SOURCES = 1.3;
const HOLD_MERGED = 3.4;

const SRC_FRAME = ['top', 'bot', 'l', 'r'] as const;

export default function PrototemplateHero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const q = <T extends HTMLElement>(sel: string) => rootEl.querySelector<T>(sel);
      const proto = q<HTMLElement>('[data-pt-proto]');
      const template = q<HTMLElement>('[data-pt-template]');
      const protoWord = q<HTMLElement>('[data-pt-proto] .pt-face-serif');
      const templateWord = q<HTMLElement>('[data-pt-template] .pt-face-grot');
      const typeWrap = q<HTMLElement>('[data-pt-type]');
      const ghost = q<HTMLElement>('[data-pt-ghost]');
      const filled = q<HTMLElement>('[data-pt-filled]');
      const ghostProto = q<HTMLElement>('[data-pt-ghost] [data-seg-proto]');
      const ghostTemplate = q<HTMLElement>('[data-pt-ghost] [data-seg-template]');
      const specs = gsap.utils.toArray<HTMLElement>('.pt-src-spec', rootEl);
      const typeLetters = gsap.utils.toArray<HTMLElement>('[data-pt-type] span', rootEl);

      const frame = (word: 'proto' | 'temp') =>
        SRC_FRAME.map((side) => q<HTMLElement>(`[data-f-${word}-${side}]`));
      const [fpTop, fpBot, fpL, fpR] = frame('proto');
      const [ftTop, ftBot, ftL, ftR] = frame('temp');
      const lineCap = q<HTMLElement>('[data-line-cap]');
      const lineBase1 = q<HTMLElement>('[data-line-base1]');
      const lineBase2 = q<HTMLElement>('[data-line-base2]');
      const vertL = q<HTMLElement>('[data-vert-l]');
      const vertJ = q<HTMLElement>('[data-vert-j]');
      const vertR = q<HTMLElement>('[data-vert-r]');

      const srcLines = [fpTop, fpBot, fpL, fpR, ftTop, ftBot, ftL, ftR];
      const dstLines = [lineCap, lineBase1, lineBase2, vertL, vertJ, vertR];
      if (
        !proto || !template || !protoWord || !templateWord || !typeWrap || !ghost || !filled ||
        !ghostProto || !ghostTemplate ||
        srcLines.some((el) => !el) || dstLines.some((el) => !el)
      )
        return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let tl: gsap.core.Timeline | null = null;

      const build = () => {
        tl?.kill();
        gsap.set([proto, template, ghost, filled, ...specs, ...srcLines, ...dstLines, ...typeLetters], {
          clearProps: 'all',
        });

        const heroRect = rootEl.getBoundingClientRect();
        const protoRect = protoWord.getBoundingClientRect();
        const templateRect = templateWord.getBoundingClientRect();
        const typeRect = typeWrap.getBoundingClientRect();
        const segProtoRect = ghostProto.getBoundingClientRect();
        const segTemplateRect = ghostTemplate.getBoundingClientRect();
        const ghostRect = ghost.getBoundingClientRect();

        const rel = (v: number, axis: 'x' | 'y') => v - (axis === 'x' ? heroRect.left : heroRect.top);

        /* The em box tops out well above the letters (font ascent), so a rule
           hung from rect.top floats. Canvas metrics give the string's real
           ink top: baseline from the font box ratio, minus actual ascent. */
        const ctx = document.createElement('canvas').getContext('2d');
        const inkTop = (el: HTMLElement, text: string): number => {
          const r = el.getBoundingClientRect();
          if (!ctx) return r.top;
          const cs = getComputedStyle(el);
          ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const m = ctx.measureText(text);
          const boxAscent = m.fontBoundingBoxAscent ?? 0;
          const boxDescent = m.fontBoundingBoxDescent ?? 0;
          if (boxAscent + boxDescent === 0) return r.top;
          const baseline = r.top + (boxAscent / (boxAscent + boxDescent)) * r.height;
          return baseline - m.actualBoundingBoxAscent;
        };

        /* words travel whole: align each source's box onto its segment */
        const dProto = {
          x: segProtoRect.left - protoRect.left,
          y: segProtoRect.bottom - protoRect.bottom,
        };
        const dTemplate = {
          x: segTemplateRect.left - templateRect.left,
          y: segTemplateRect.bottom - templateRect.bottom,
        };

        /* each word's crop frame hugs its box, every rule full-bleed */
        const place = () => {
          gsap.set(fpTop, { top: rel(inkTop(protoWord, 'prototype'), 'y') - 8 });
          gsap.set(fpBot, { top: rel(protoRect.bottom, 'y') + 8 });
          gsap.set(fpL, { left: rel(protoRect.left, 'x') - 12 });
          gsap.set(fpR, { left: rel(protoRect.right, 'x') + 12 });
          gsap.set(ftTop, { top: rel(inkTop(templateWord, 'template'), 'y') - 8 });
          gsap.set(ftBot, { top: rel(templateRect.bottom, 'y') + 8 });
          gsap.set(ftL, { left: rel(templateRect.left, 'x') - 12 });
          gsap.set(ftR, { left: rel(templateRect.right, 'x') + 12 });
          gsap.set(lineCap, { top: rel(Math.min(inkTop(ghostProto, 'proto'), inkTop(ghostTemplate, 'template')), 'y') - 8 });
          gsap.set(lineBase1, { top: rel(ghostRect.bottom, 'y') + 8 });
          gsap.set(lineBase2, { top: rel(ghostRect.bottom, 'y') + 13 });
          gsap.set(vertL, { left: rel(ghostRect.left, 'x') - 12 });
          gsap.set(vertJ, { left: rel(segTemplateRect.left, 'x') });
          gsap.set(vertR, { left: rel(ghostRect.right, 'x') + 12 });
        };
        place();

        if (reduced) {
          gsap.set([proto, template, ghost, ...srcLines, ...specs], { opacity: 0 });
          gsap.set([filled, ...dstLines], { opacity: 1 });
          return;
        }

        gsap.set(filled, { opacity: 0 });
        gsap.set(ghost, { opacity: 0 });
        gsap.set([proto, template], { opacity: 0 });
        gsap.set([fpTop, fpBot, ftTop, ftBot], { scaleX: 0, opacity: 1 });
        gsap.set([fpL, fpR, ftL, ftR], { scaleY: 0, opacity: 1 });
        gsap.set(dstLines, { opacity: 0 });
        gsap.set(specs, { opacity: 0 });

        /* The intro draws the sheet once; the cycle then runs forever as a
           true round trip — no fades to black, no restarts. */
        const intro = gsap.timeline();
        intro
          .to([fpTop, fpBot, ftTop, ftBot], { scaleX: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.05 })
          .to([fpL, fpR, ftL, ftR], { scaleY: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.05 }, '-=0.45')
          .to([proto, template], { opacity: 1, duration: 0.45, stagger: 0.1 }, '-=0.3')
          .to(ghost, { opacity: 0.4, duration: 0.5 }, '-=0.2')
          .to(specs, { opacity: 1, duration: 0.35 }, '-=0.25');

        const cycle = gsap.timeline({ repeat: -1 });
        cycle.to({}, { duration: HOLD_SOURCES });

        /* 1 — type falls out; the serif frame re-hugs the shorter word. */
        cycle
          .addLabel('fall')
          .to(
            typeLetters,
            {
              y: () => heroRect.height * 0.4,
              opacity: 0,
              rotation: () => gsap.utils.random(-22, 22),
              duration: 0.75,
              ease: 'power2.in',
              stagger: 0.05,
            },
            'fall'
          )
          .to(fpR, { left: rel(typeRect.left, 'x') + 10, duration: 0.7, ease: 'power3.inOut' }, 'fall+=0.2')
          .to(specs, { opacity: 0, duration: 0.3 }, 'fall');

        /* 2 — proto comes down, template comes up, frames riding along. */
        cycle
          .addLabel('merge', 'fall+=0.55')
          .to(proto, { x: dProto.x, y: dProto.y, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to([fpTop, fpBot], { y: dProto.y, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to([fpL, fpR], { x: dProto.x, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to(template, { x: dTemplate.x, y: dTemplate.y, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to([ftTop, ftBot], { y: dTemplate.y, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to([ftL, ftR], { x: dTemplate.x, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to(ghost, { opacity: 0.8, duration: 0.45 }, 'merge+=0.3');

        /* 3 — arrival: the parked words ARE the nameplate. The travel
           frames hand over to the destination frame around them. */
        cycle
          .addLabel('land', 'merge+=0.92')
          .to(ghost, { opacity: 0, duration: 0.25 }, 'land')
          .to(srcLines, { opacity: 0, duration: 0.35 }, 'land')
          .to(dstLines, { opacity: 0.5, duration: 0.5 }, 'land+=0.1')
          .to({}, { duration: HOLD_MERGED });

        /* 4 — the unwind: the travel rules come back, the words carry them
           home, and `type` re-types itself under the returning rule. */
        cycle
          .addLabel('unwind')
          .to(dstLines, { opacity: 0, duration: 0.4 }, 'unwind')
          .to(srcLines, { opacity: 1, duration: 0.3 }, 'unwind+=0.1')
          .to(ghost, { opacity: 0.4, duration: 0.45 }, 'unwind+=0.15')
          .to(template, { x: 0, y: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.35')
          .to([ftTop, ftBot], { y: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.35')
          .to([ftL, ftR], { x: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.35')
          .to(proto, { x: 0, y: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.43')
          .to([fpTop, fpBot], { y: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.43')
          .to([fpL, fpR], { x: 0, duration: 0.9, ease: 'power3.inOut' }, 'unwind+=0.43')
          .set(typeLetters, { y: 0, rotation: 0, opacity: 0 }, 'unwind+=1.35')
          .to(fpR, { left: rel(protoRect.right, 'x') + 12, duration: 0.45, ease: 'power3.inOut' }, 'unwind+=1.4')
          .to(typeLetters, { opacity: 1, duration: 0.06, stagger: 0.11, ease: 'none' }, 'unwind+=1.45')
          .to(specs, { opacity: 1, duration: 0.35 }, 'unwind+=1.6')
          .to({}, { duration: 0.3 });

        tl = gsap.timeline();
        tl.add(intro).add(cycle);
      };

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
      {/* crop frames: four border-touching rules around each word */}
      {/* the working model's frame is dashed; the reusable form's is solid */}
      {(['proto', 'temp'] as const).map((word) => {
        const dash = word === 'proto' ? ' is-dashed' : '';
        return (
          <span className='pt-frame-group' key={word}>
            <span className={`pt-line is-h${dash}`} {...{ [`data-f-${word}-top`]: '' }} aria-hidden />
            <span className={`pt-line is-h${dash}`} {...{ [`data-f-${word}-bot`]: '' }} aria-hidden />
            <span className={`pt-line is-v${dash}`} {...{ [`data-f-${word}-l`]: '' }} aria-hidden />
            <span className={`pt-line is-v${dash}`} {...{ [`data-f-${word}-r`]: '' }} aria-hidden />
          </span>
        );
      })}

      {/* the destination's frame: cap, doubled baseline, three verticals */}
      <span className='pt-line is-h' data-line-cap aria-hidden>
        <i>cap</i>
      </span>
      <span className='pt-line is-h' data-line-base1 aria-hidden />
      <span className='pt-line is-h' data-line-base2 aria-hidden>
        <i>base</i>
      </span>
      <span className='pt-line is-v' data-vert-l aria-hidden />
      <span className='pt-line is-v' data-vert-j aria-hidden />
      <span className='pt-line is-v' data-vert-r aria-hidden />

      {/* the serif, above the line */}
      <div className='pt-src is-proto' data-pt-proto aria-hidden>
        <span className='pt-face-serif'>
          proto
          <span data-pt-type>
            {TYPE_LETTERS.map((ch, i) => (
              <span key={`${ch}-${i}`}>{ch}</span>
            ))}
          </span>
        </span>
        <span className='pt-src-spec'>proto·type — serif · the working model</span>
      </div>

      {/* the grotesk, below the line */}
      <div className='pt-src is-template' data-pt-template aria-hidden>
        <span className='pt-face-grot'>template</span>
        <span className='pt-src-spec'>temp·late — grotesk · the reusable form</span>
      </div>

      {/* the destination: empty text; the parked words fill it for real */}
      <h1 className='pt-final' aria-label='prototemplate'>
        <span className='pt-composite is-ghost' data-pt-ghost aria-hidden>
          <span className='pt-face-serif' data-seg-proto>
            proto
          </span>
          <span className='pt-face-grot' data-seg-template>
            template
          </span>
        </span>
        <span className='pt-composite' data-pt-filled aria-hidden>
          <span className='pt-face-serif'>proto</span>
          <span className='pt-face-grot'>template</span>
        </span>
      </h1>
    </div>
  );
}
