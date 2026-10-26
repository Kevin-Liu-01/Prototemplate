'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

gsap.registerPlugin(useGSAP);

/**
 * The nameplate as a working type-specimen sheet.
 *
 * `prototype` (serif) stands off the destination line's upper LEFT,
 * `template` (grotesk) off its lower RIGHT, the destination between
 * them as EMPTY outlined text. Every word is held by a crop frame of
 * four border-touching rules (one above, one below, one left, one
 * right), and the frames move with their words.
 *
 * The take is physical: `type` falls out and the serif frame's right
 * rule slides in to re-hug the shorter word; then both words slide
 * inward to the line, frames traveling with them, until both park
 * inside the outline. The parked words are the nameplate (lowercase,
 * so nothing has to crossfade). The travel deltas are measured from
 * live rects, so this file never encodes where the sources sit. The
 * destination frame fades in around them: the cap rule on the tallest
 * letter, the doubled baseline pair on the baseline, and three verticals
 * (left bound, the serif and grotesk junction, right bound).
 *
 * The page paints the settled nameplate (the filled composite), and
 * prototemplate.css holds every moving part hidden until the timeline sets
 * it, so nothing shows and vanishes on load. Once the fonts are in, the
 * destination frame draws in round the nameplate, the parked words take
 * over from the composite, and the cycle runs forever as a round trip from
 * there: a hold, the unwind that carries the words home and retypes `type`
 * under the returning rule, the sources' hold, and the merge.
 *
 * Fonts are awaited before measuring; resize rebuilds; reduced motion
 * holds the settled sheet. The timeline pauses while the hero is off
 * screen, so GSAP's ticker sleeps once the reader scrolls past it.
 */

const TYPE_LETTERS = 'type'.split('');

/** How long the two source words hold before the merge, in seconds. */
const HOLD_SOURCES = 1.3;
/** How long the merged nameplate holds before the unwind, in seconds. */
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

      const frame = (word: 'proto' | 'temp') => {
        const sides = SRC_FRAME.map((side) => q<HTMLElement>(`[data-f-${word}-${side}]`));
        return sides.every((el): el is HTMLElement => el !== null)
          ? (sides as [HTMLElement, HTMLElement, HTMLElement, HTMLElement])
          : null;
      };
      const protoFrame = frame('proto');
      const tempFrame = frame('temp');
      if (!protoFrame || !tempFrame) return;
      const [fpTop, fpBot, fpL, fpR] = protoFrame;
      const [ftTop, ftBot, ftL, ftR] = tempFrame;
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

      const reduced = prefersReducedMotion();

      let tl: gsap.core.Timeline | null = null;
      /* whether the hero is on screen; the timeline runs only while it is */
      let visible = true;

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
           hung from rect.top floats. The baseline is read from a zero-size
           probe set on it, and canvas metrics give the string's real ink top
           above it. */
        const ctx = document.createElement('canvas').getContext('2d');
        const baselineOf = (el: HTMLElement): number => {
          const probe = document.createElement('span');
          probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
          el.appendChild(probe);
          const y = probe.getBoundingClientRect().top;
          probe.remove();
          return y;
        };
        const measure = (el: HTMLElement, text: string): TextMetrics | null => {
          if (!ctx) return null;
          const cs = getComputedStyle(el);
          ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
          return ctx.measureText(text);
        };
        const inkTop = (el: HTMLElement, text: string): number => {
          const m = measure(el, text);
          return m ? baselineOf(el) - m.actualBoundingBoxAscent : el.getBoundingClientRect().top;
        };
        /* where a word's ink starts and ends, from its box's left edge */
        const inkLeft = (el: HTMLElement, text: string): number =>
          el.getBoundingClientRect().left - (measure(el, text)?.actualBoundingBoxLeft ?? 0);
        const inkRight = (el: HTMLElement, text: string): number => {
          const m = measure(el, text);
          return m ? el.getBoundingClientRect().left + m.actualBoundingBoxRight : el.getBoundingClientRect().right;
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

        /* Every rule full-bleed and on a whole pixel, so none blurs across
           two. Each word's crop frame stands 8px off its letters above and
           below and 12px off its box at the sides. The destination's rules
           are named, so they lie on the letters: `cap` on the pixel above the
           tallest letter, `base` on the baseline with its pair 5px under,
           and the joint between the faces midway in the gap between their
           ink, so it touches neither word. */
        const x = (v: number) => Math.round(rel(v, 'x'));
        const y = (v: number) => Math.round(rel(v, 'y'));
        const protoRight = x(protoRect.right) + 12;
        const fallRight = x(typeRect.left) + 10;
        const base = y(baselineOf(ghostProto));
        gsap.set(fpTop, { top: y(inkTop(protoWord, 'prototype')) - 8 });
        gsap.set(fpBot, { top: y(protoRect.bottom) + 8 });
        gsap.set(fpL, { left: x(protoRect.left) - 12 });
        gsap.set(fpR, { left: protoRight });
        gsap.set(ftTop, { top: y(inkTop(templateWord, 'template')) - 8 });
        gsap.set(ftBot, { top: y(templateRect.bottom) + 8 });
        gsap.set(ftL, { left: x(templateRect.left) - 12 });
        gsap.set(ftR, { left: x(templateRect.right) + 12 });
        gsap.set(lineCap, { top: y(Math.min(inkTop(ghostProto, 'proto'), inkTop(ghostTemplate, 'template'))) - 1 });
        gsap.set(lineBase1, { top: base });
        gsap.set(lineBase2, { top: base + 5 });
        gsap.set(vertL, { left: x(ghostRect.left) - 12 });
        gsap.set(vertJ, { left: x((inkRight(ghostProto, 'proto') + inkLeft(ghostTemplate, 'template')) / 2) });
        gsap.set(vertR, { left: x(ghostRect.right) + 12 });

        if (reduced) {
          gsap.set([proto, template, ghost, ...srcLines, ...specs], { opacity: 0 });
          gsap.set([filled, ...dstLines], { opacity: 1 });
          return;
        }

        /* The opening state is the merge's end: the words parked in the
           outline over the filled composite, still clear, `type` fallen out,
           the travel frames riding with their words and hidden, and the
           destination frame waiting to be drawn. */
        gsap.set(filled, { opacity: 1 });
        gsap.set(ghost, { opacity: 0 });
        gsap.set(proto, { x: dProto.x, y: dProto.y, opacity: 0 });
        gsap.set(template, { x: dTemplate.x, y: dTemplate.y, opacity: 0 });
        gsap.set(typeLetters, { opacity: 0 });
        gsap.set([fpTop, fpBot], { y: dProto.y });
        gsap.set([fpL, fpR], { x: dProto.x });
        gsap.set(fpR, { left: fallRight });
        gsap.set([ftTop, ftBot], { y: dTemplate.y });
        gsap.set([ftL, ftR], { x: dTemplate.x });
        gsap.set([...srcLines, ...specs], { opacity: 0 });
        gsap.set([lineCap, lineBase1, lineBase2], { scaleX: 0, opacity: 0.5 });
        gsap.set([vertL, vertJ, vertR], { scaleY: 0, opacity: 0.5 });

        /* The opening draws the destination frame round the nameplate once,
           and the parked words take over from the filled composite: they
           fade in over it, then it goes. Text on a translated box can round
           to a device pixel the composite did not, so a cut from one to the
           other could tick by a pixel; the two are never both half clear,
           so the word never pales. The cycle then runs forever as a true
           round trip from the merged nameplate: no fades to black, no
           restarts. */
        const opening = gsap.timeline();
        opening
          .to([lineCap, lineBase1, lineBase2], { scaleX: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.05 })
          .to([vertL, vertJ, vertR], { scaleY: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.05 }, '-=0.45')
          .to([proto, template], { opacity: 1, duration: 0.4, ease: 'none' }, 0.2)
          .set(filled, { opacity: 0 }, 0.6);

        const cycle = gsap.timeline({ repeat: -1 });

        /* 1: the nameplate holds */
        cycle.to({}, { duration: HOLD_MERGED });

        /* 2: the unwind. The travel rules come back, the words carry them
           home, and `type` retypes itself under the returning rule; then the
           sources hold */
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
          .to(fpR, { left: protoRight, duration: 0.45, ease: 'power3.inOut' }, 'unwind+=1.4')
          .to(typeLetters, { opacity: 1, duration: 0.06, stagger: 0.11, ease: 'none' }, 'unwind+=1.45')
          .to(specs, { opacity: 1, duration: 0.35 }, 'unwind+=1.6')
          .to({}, { duration: 0.3 + HOLD_SOURCES });

        /* 3: type falls out; the serif frame re-hugs the shorter word */
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
          .to(fpR, { left: fallRight, duration: 0.7, ease: 'power3.inOut' }, 'fall+=0.2')
          .to(specs, { opacity: 0, duration: 0.3 }, 'fall');

        /* 4: proto comes down, template comes up, frames riding along */
        cycle
          .addLabel('merge', 'fall+=0.55')
          .to(proto, { x: dProto.x, y: dProto.y, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to([fpTop, fpBot], { y: dProto.y, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to([fpL, fpR], { x: dProto.x, duration: 0.9, ease: 'power3.inOut' }, 'merge')
          .to(template, { x: dTemplate.x, y: dTemplate.y, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to([ftTop, ftBot], { y: dTemplate.y, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to([ftL, ftR], { x: dTemplate.x, duration: 0.9, ease: 'power3.inOut' }, 'merge+=0.08')
          .to(ghost, { opacity: 0.8, duration: 0.45 }, 'merge+=0.3');

        /* 5: arrival. The parked words are the nameplate; the travel frames
           hand over to the destination frame around them */
        cycle
          .addLabel('land', 'merge+=0.92')
          .to(ghost, { opacity: 0, duration: 0.25 }, 'land')
          .to(srcLines, { opacity: 0, duration: 0.35 }, 'land')
          .to(dstLines, { opacity: 0.5, duration: 0.5 }, 'land+=0.1');

        tl = gsap.timeline();
        tl.add(opening).add(cycle);
        if (!visible) tl.pause();
      };

      const view =
        typeof IntersectionObserver === 'undefined'
          ? null
          : new IntersectionObserver(([entry]) => {
              visible = entry?.isIntersecting ?? true;
              if (visible) tl?.resume();
              else tl?.pause();
            });
      view?.observe(rootEl);

      let cancelled = false;
      document.fonts.ready.then(() => {
        if (!cancelled) build();
      });

      let raf = 0;
      const rebuild = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (!cancelled) build();
        });
      };

      /* The sheet's width follows the viewer shell (the sidebar and the
         index panel resize the stage without a window resize), so the hero
         watches its own box rather than the window. Only a change of width
         rebuilds: the travel deltas are horizontal measurements, and a
         height change alone (the swapped nameplate fonts arriving, a row
         above the stage coming or going) would otherwise kill the running
         timeline and start it over about a second in, which is the drift
         the 430e3c7 page never had. The observer's first report is the
         initial box, which fonts.ready has already built from. Without
         ResizeObserver the window listener stands in. */
      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        let width: number | null = null;
        observer = new ResizeObserver((entries) => {
          const box = entries[0]?.contentRect;
          const next = box ? Math.round(box.width) : rootEl.clientWidth;
          if (width === null) {
            width = next;
            return;
          }
          if (next === width) return;
          width = next;
          rebuild();
        });
        observer.observe(rootEl);
      } else {
        window.addEventListener('resize', rebuild);
      }

      return () => {
        cancelled = true;
        view?.disconnect();
        observer?.disconnect();
        window.removeEventListener('resize', rebuild);
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
      <span className='pt-line is-h' data-line-base1 aria-hidden>
        <i>base</i>
      </span>
      <span className='pt-line is-h' data-line-base2 aria-hidden />
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
        <span className='pt-src-spec'>proto·type: serif · the working model</span>
      </div>

      {/* the grotesk, below the line */}
      <div className='pt-src is-template' data-pt-template aria-hidden>
        <span className='pt-face-grot'>template</span>
        <span className='pt-src-spec'>temp·late: grotesk · the reusable form</span>
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
