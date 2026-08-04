'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '../../components/LocaleTag';

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

/* Hosts may extend the ledger (the v0 flow adds Hebrew); the defaults
   above stay this page's own four. */
export { SAMPLES as SENTENCE_SAMPLES };
export type { Sample as SentenceSample };

/** Text inset inside the measured container, per side. */
const PAD = 13;
/** Room reserved past the widest box for its delta label. */
const LABEL_ROOM = 86;
/** …but never blown up past a size a UI string could plausibly be set at. */
const MAX_SCALE = 1.5;
const TICKS = 37;

export default function SentenceWidth({
  className,
  accent = true,
  title,
  samples = SAMPLES,
}: LangProps & { samples?: readonly Sample[] }) {
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
      if (!guide || lines.length !== samples.length || boxes.length !== samples.length) return;

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

        rootEl.style.removeProperty('--lang-sw-size');
        boxes.forEach((el) => el.style.removeProperty('width'));

        /* The TEXT's own width — a range over the contents. The p's
           offsetWidth would smuggle its 13px-per-side padding into the
           measurement, and boxW() adds that padding again: every box ran
           ~26px long on the right and the deltas were ratios of padded
           runs instead of the languages themselves. */
        const textWidth = (el: HTMLElement) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().width;
        };

        const nominal = Number.parseFloat(getComputedStyle(first).fontSize) || 18;
        const natural = Math.max(...lines.map(textWidth));

        const track = firstRow.querySelector<HTMLElement>('[data-sw-track]');
        const room = track ? track.clientWidth : rootEl.clientWidth;
        const scale = Math.min(
          MAX_SCALE,
          Math.max(1, (room - PAD * 2 - LABEL_ROOM) / Math.max(natural, 1)),
        );
        rootEl.style.setProperty('--lang-sw-size', `${Math.round(nominal * scale * 10) / 10}px`);

        const texts = lines.map(textWidth);
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
        {samples.map((sample, i) => (
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
