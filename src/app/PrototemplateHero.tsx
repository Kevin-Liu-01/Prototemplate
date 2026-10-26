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
 * destination frame fades in around them: cap rule, the doubled
 * baseline pair, and three verticals (left bound, the serif and grotesk
 * junction, right bound).
 *
 * The page paints the settled nameplate (the filled composite), and
 * prototemplate.css holds every moving part hidden until the timeline
 * sets it, so nothing shows and vanishes on load. Once the fonts are in,
 * the parked words take the composite's place where it stands, the
 * destination frame draws in around them, and the cycle runs forever as
 * a round trip from there: a hold, the unwind that carries the words home
 * and retypes `type` under the returning rule, the sources' hold, and the
 * merge.
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

/** Where the nameplate's rules fall, in px from the hero's top: its cap line and its baseline. */
export type HeroRules = { cap: number; base: number };

type Props = {
  /** Rules every frame on the words' own ink, as Atlas rules its wordmark: the top on the tallest letter, the bottom on
      the baseline, the sides on the first and last letters, with no air. */
  ruled?: boolean;
  /** Called after each layout with where the landed nameplate's rules fall. */
  onRules?: (rules: HeroRules) => void;
};

export default function PrototemplateHero({ ruled = false, onRules }: Props) {
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

        /* A word's ink, from the font rather than its box: the em box tops
           out well above the letters and its sides carry the side bearings,
           so a rule hung from the box floats. The baseline is read from a
           zero-size probe set on it; canvas metrics, with the word's own
           tracking, give the tallest letter's top and the ends of the first
           and last letters. */
        const ctx = document.createElement('canvas').getContext('2d');
        type Ink = { top: number; base: number; left: number; right: number };
        const inkOf = (el: HTMLElement, text: string): Ink => {
          const r = el.getBoundingClientRect();
          const probe = document.createElement('span');
          probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
          el.appendChild(probe);
          const base = probe.getBoundingClientRect().top;
          probe.remove();
          if (!ctx) return { top: r.top, base, left: r.left, right: r.right };
          const cs = getComputedStyle(el);
          ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
          const m = ctx.measureText(text);
          return {
            top: base - m.actualBoundingBoxAscent,
            base,
            left: r.left - m.actualBoundingBoxLeft,
            right: r.left + m.actualBoundingBoxRight,
          };
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

        /* Each word's crop frame, every rule full-bleed. Unruled, a frame
           stands off its word: 8px over and under and 12px at the sides.
           Ruled, every rule lies on the word's ink, on the whole pixel just
           outside the edge it frames, the bottom one on the baseline. */
        const x = (v: number) => (ruled ? Math.round(rel(v, 'x')) : rel(v, 'x'));
        const y = (v: number) => (ruled ? Math.round(rel(v, 'y')) : rel(v, 'y'));
        const rulesOf = (ink: Ink, box: DOMRect) =>
          ruled
            ? { top: y(ink.top) - 1, bottom: y(ink.base), left: x(ink.left) - 1, right: x(ink.right) }
            : { top: y(ink.top) - 8, bottom: y(box.bottom) + 8, left: x(box.left) - 12, right: x(box.right) + 12 };
        /* `type` is set letter by letter (each falls on its own), which breaks the word's kerning, so its last letter
           gives the word's right end */
        const lastLetter = typeLetters[typeLetters.length - 1];
        const protoInk = inkOf(protoWord, 'prototype');
        if (lastLetter) protoInk.right = inkOf(lastLetter, lastLetter.textContent ?? '').right;
        const protoRules = rulesOf(protoInk, protoRect);
        const templateRules = rulesOf(inkOf(templateWord, 'template'), templateRect);

        /* the destination's frame: the cap line on the taller segment's top,
           the baseline, the two ends and the joint between the faces, which
           ruled falls in the gap between the two segments' ink */
        const segProto = inkOf(ghostProto, 'proto');
        const segTemplate = inkOf(ghostTemplate, 'template');
        const word = ruled
          ? {
              cap: y(Math.min(segProto.top, segTemplate.top)) - 1,
              base: y(segProto.base),
              left: x(segProto.left) - 1,
              joint: x((segProto.right + segTemplate.left) / 2),
              right: x(segTemplate.right),
            }
          : {
              cap: y(Math.min(segProto.top, segTemplate.top)) - 8,
              base: y(ghostRect.bottom) + 8,
              left: x(ghostRect.left) - 12,
              joint: x(segTemplateRect.left),
              right: x(ghostRect.right) + 12,
            };

        /* where the serif frame's right rule stands once `type` has fallen */
        const fallRight = ruled ? x(inkOf(protoWord, 'proto').right) : x(typeRect.left) + 10;

        gsap.set(fpTop, { top: protoRules.top });
        gsap.set(fpBot, { top: protoRules.bottom });
        gsap.set(fpL, { left: protoRules.left });
        gsap.set(fpR, { left: protoRules.right });
        gsap.set(ftTop, { top: templateRules.top });
        gsap.set(ftBot, { top: templateRules.bottom });
        gsap.set(ftL, { left: templateRules.left });
        gsap.set(ftR, { left: templateRules.right });
        gsap.set(lineCap, { top: word.cap });
        gsap.set(lineBase1, { top: word.base });
        gsap.set(lineBase2, { top: word.base + 5 });
        gsap.set(vertL, { left: word.left });
        gsap.set(vertJ, { left: word.joint });
        gsap.set(vertR, { left: word.right });
        onRules?.({ cap: word.cap, base: word.base });

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
          .to(fpR, { left: protoRules.right, duration: 0.45, ease: 'power3.inOut' }, 'unwind+=1.4')
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
