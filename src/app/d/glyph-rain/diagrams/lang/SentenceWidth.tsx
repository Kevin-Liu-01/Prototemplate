'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { langA11y, langClass, onFontsReady, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * The signature diagram: one sentence, four locales, all four measured and on
 * screen at once — a comparison, not a slideshow.
 *
 * Nothing here is estimated. Each string is laid out by the browser and
 * measured, each container is set to the width its text actually needs, and
 * every delta is computed from those measurements — so the German overflow and
 * the Japanese slack are the real ones, not a designer's impression of them.
 * A single vertical guide drops through all four rows at the English width,
 * so the eye reads every other locale against the source in one pass, and the
 * ruler under the stack is the shared scale the rows are measured on.
 *
 * Arabic anchors to the right edge: the fourth row re-anchors the whole
 * measurement, which is the structural half of the argument.
 *
 * Accent: the German leading edge — the one locale that breaks the layout.
 */

type Sample = {
  tag: string;
  /** The language in its own language. */
  name: string;
  lang: string;
  rtl?: boolean;
  lit?: boolean;
  text: string;
  /** Server-rendered estimate, replaced by the measured value on mount. */
  hint: string;
};

const SAMPLES: readonly Sample[] = [
  { tag: 'en', name: 'English', lang: 'en', text: 'Save changes', hint: '' },
  { tag: 'de', name: 'Deutsch', lang: 'de', lit: true, text: 'Änderungen speichern', hint: '+63%' },
  { tag: 'ja', name: '日本語', lang: 'ja', text: '変更を保存', hint: '−25%' },
  { tag: 'ar', name: 'العربية', lang: 'ar', rtl: true, text: 'حفظ التغييرات', hint: '−25%' },
];

/** Text inset inside the measured container, per side. */
const PAD = 13;
/** Room reserved past the widest box for its delta label. */
const LABEL_ROOM = 86;
/** …but never blown up past a size a UI string could plausibly be set at. */
const MAX_SCALE = 1.5;
/** The smallest type a row keeps its delta beside the box at. On a phone
    track too narrow for that, the delta drops under its box instead and the
    type fits the box alone, so no row runs past the card or the page. */
const MIN_INLINE_SIZE = 14;
/** The phone width of lang.css, the only width where the type may shrink
    below the stylesheet's size: wider, a long row keeps the size it always
    had and its delta hangs into the card's padding. lang.css repeats this
    arithmetic for the first paint, so a change here goes there too. */
const PHONE = '(max-width: 560px)';
/** Where lang.css paints the fitted rows itself before this runs: a phone
    width and a landscape phone. */
const FIRST_PAINT = '(max-width: 560px), (pointer: coarse) and (max-height: 500px)';
/** The step the type size is rounded to, here and in lang.css. */
const STEP = 0.1;
const TICKS = 37;

export default function SentenceWidth({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const rows = gsap.utils.toArray<HTMLElement>('[data-sw-row]', rootEl);
      const lines = gsap.utils.toArray<HTMLElement>('[data-sw-line]', rootEl);
      const boxes = gsap.utils.toArray<HTMLElement>('[data-sw-box]', rootEl);
      const pcts = gsap.utils.toArray<HTMLElement>('[data-sw-pct]', rootEl);
      const guide = rootEl.querySelector<HTMLElement>('[data-sw-guide]');
      if (!guide || lines.length !== SAMPLES.length || boxes.length !== SAMPLES.length) return;

      let disposed = false;

      const build = () => {
        if (disposed) return;

        /* Measured twice, both times by the browser. First at the size the
           stylesheet asks for, which gives the ratios between the four
           translations; that fixes the type size which lands the widest one on
           the room available. Then again at that size, because a rounded font
           size is not exactly the scale that produced it. */
        const first = lines[0];
        const firstRow = rows[0];
        if (!first || !firstRow) return;

        /* --lang-sw-fit is the size the rows are set at: the stylesheet's own
           first-paint fit until this runs, then this function's. Both are
           lifted first, with the stacked layout of an earlier run, and where
           lang.css paints the rows, what it paints at this width is read:
           its type size, and whether its break takes the line and drops the
           deltas under their boxes. Then the size goes back to the nominal
           one for the first measurement. */
        rootEl.removeAttribute('data-fitted');
        rootEl.removeAttribute('data-stacked');
        rootEl.style.removeProperty('--lang-sw-fit');
        boxes.forEach((el) => el.style.removeProperty('width'));
        const firstPaint = window.matchMedia(FIRST_PAINT).matches;
        const painted = firstPaint
          ? {
              size: Math.round(Number.parseFloat(getComputedStyle(first).fontSize) * 10) / 10,
              stacked: (firstRow.querySelector<HTMLElement>('[data-sw-break]')?.offsetWidth ?? 0) > 0,
            }
          : null;
        rootEl.style.setProperty('--lang-sw-fit', 'var(--lang-sw-size, 18px)');

        /* The line's width, padding included: its offsetWidth, as this fork
           has always measured it, except where lang.css paints the rows
           first. There the stylesheet's boxes take the line's fractional
           width, and an integer one would move each box by up to 0.5px when
           this sets it. */
        const lineWidth = (el: HTMLElement) => (firstPaint ? el.getBoundingClientRect().width : el.offsetWidth);

        const nominal = Number.parseFloat(getComputedStyle(first).fontSize) || 18;
        const natural = Math.max(...lines.map(lineWidth));

        const track = firstRow.querySelector<HTMLElement>('[data-sw-track]');
        const room = track ? track.clientWidth : rootEl.clientWidth;
        /* The scale that lands the widest box and its delta on the track. On a
           phone it may go below the stylesheet's size (it used to stop at 1,
           and the German row ran past the card and the page); below
           MIN_INLINE_SIZE the deltas stack under their boxes and the type fits
           the box alone. */
        const phone = window.matchMedia(PHONE).matches;
        /* this fork measures the line's offsetWidth, padding included, and
           boxW() adds the padding again, so a phone reserves it twice */
        const inset = phone ? PAD * 4 : PAD * 2;
        const fit = (room - inset - LABEL_ROOM) / Math.max(natural, 1);
        /* lang.css takes the German's width from a straight-line estimate in
           em and its room from the track's fractional width, so its paint can
           land one STEP from this measured size, or on the other side of
           MIN_INLINE_SIZE when the fit sits within a STEP of it. Within that
           step the rows keep what the stylesheet painted, so nothing moves
           when this runs: 0.1px of type is about 1px of the German's box. */
        const near = painted && phone && Math.abs(fit * nominal - MIN_INLINE_SIZE) <= STEP;
        const stacked = near ? painted.stacked : phone && fit * nominal < MIN_INLINE_SIZE;
        const scale = stacked
          ? Math.min(1, (room - inset - 3) / Math.max(natural, 1))
          : Math.min(MAX_SCALE, phone ? fit : Math.max(1, fit));
        const measured = Math.round(nominal * scale * 10) / 10;
        /* one STEP apart, with room for the float error of two tenths */
        const keep = painted && painted.stacked === stacked && Math.abs(measured - painted.size) < STEP * 1.5;
        rootEl.toggleAttribute('data-stacked', stacked);
        rootEl.toggleAttribute('data-fitted', true);
        rootEl.style.setProperty('--lang-sw-fit', `${keep ? painted.size : measured}px`);

        const texts = lines.map(lineWidth);
        const baseText = texts[0] ?? 1;
        /* Text, the container's inset per side, and the container's own 1.5px
           walls — the box is border-box, so the walls are part of the width. */
        const boxW = (w: number) => Math.min(room, w + PAD * 2 + 3);

        boxes.forEach((el, i) => {
          el.style.width = `${boxW(texts[i] ?? baseText)}px`;
        });

        /* The measured expansion, printed where the estimate was. Taken on the
           text alone: the padding is the container's, not the language's. */
        pcts.forEach((el, i) => {
          const pct = Math.round(((texts[i + 1] ?? baseText) / baseText - 1) * 100);
          el.textContent = `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`;
        });

        /* The English width, dropped through all four rows as one guide. Its
           offset includes the locale gutter the tracks start after. */
        const trackLeft = track ? track.offsetLeft : 0;
        guide.style.left = `${trackLeft + boxW(baseText)}px`;
      };

      build();
      onFontsReady(build);

      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(build);
      });
      observer.observe(rootEl);

      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-sw', accent, className)} ref={root} {...langA11y(title)}>
      <div className='lang-sw-rows'>
        <i className='lang-sw-guide' data-sw-guide='' aria-hidden='true' />
        {SAMPLES.map((sample, i) => (
          <div
            className={`lang-sw-row${sample.lit ? ' is-lit' : ''}${sample.rtl ? ' is-rtl' : ''}`}
            data-sw-row=''
            key={sample.tag}
          >
            <span className='lang-sw-locale'>
              <span className='lang-tag'>
                <LocaleTag code={sample.tag} />
              </span>
              <span className='lang-sw-name' lang={sample.lang} dir={sample.rtl ? 'rtl' : undefined}>
                {sample.name}
              </span>
            </span>
            <div className='lang-sw-track' data-sw-track=''>
              <div className='lang-sw-box' data-sw-box=''>
                <p
                  className='lang-sw-line'
                  data-sw-line=''
                  lang={sample.lang}
                  dir={sample.rtl ? 'rtl' : 'ltr'}
                >
                  {sample.text}
                </p>
              </div>
              {/* Before the script fits the rows, this zero-height break drops
                  the delta under its box on a phone track lang.css stacks. */}
              <i className='lang-sw-break' data-sw-break='' aria-hidden='true' />
              <span className='lang-sw-delta'>
                {i === 0 ? (
                  <span className='lang-sw-vs'>source</span>
                ) : (
                  <>
                    <span className='lang-sw-pct' data-sw-pct=''>
                      {sample.hint}
                    </span>
                    <span className='lang-sw-vs'>vs en</span>
                  </>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className='lang-sw-ruler'>
        {Array.from({ length: TICKS }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <p className='lang-sw-note'>widths measured at render — measureText, not typed</p>
    </div>
  );
}
