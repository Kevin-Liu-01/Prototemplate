'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { langA11y, langClass, prefersReducedMotion, target, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * One count, three sets of plural rules.
 *
 * The columns are as tall as the language needs: English has two forms,
 * Polish four, Japanese one, and that shape difference is the argument. As
 * the count cycles, each column's marker moves to the form CLDR actually
 * selects — and Polish sends 22 back up to `few` while 5 stays down at
 * `many`, which is exactly the case that naive `n === 1 ? a : b` gets wrong.
 *
 * Accent: the markers, one per column.
 */

type Column = {
  tag: string;
  lang: string;
  formsLabel: string;
  /** CLDR category, then the noun in that form. */
  forms: readonly { category: string; word: string }[];
  /** The fully rendered string, one per count. */
  rendered: readonly string[];
  /** Which form each count selects. */
  picks: readonly number[];
};

const COUNTS = [1, 2, 5, 22] as const;

const COLUMNS: readonly Column[] = [
  {
    tag: 'en',
    lang: 'en',
    formsLabel: '2 forms',
    forms: [
      { category: 'one', word: 'file' },
      { category: 'other', word: 'files' },
    ],
    rendered: ['1 file', '2 files', '5 files', '22 files'],
    picks: [0, 1, 1, 1],
  },
  {
    tag: 'pl',
    lang: 'pl',
    formsLabel: '4 forms',
    forms: [
      { category: 'one', word: 'plik' },
      { category: 'few', word: 'pliki' },
      { category: 'many', word: 'plików' },
      { category: 'other', word: 'pliku' },
    ],
    rendered: ['1 plik', '2 pliki', '5 plików', '22 pliki'],
    picks: [0, 1, 2, 1],
  },
  {
    tag: 'ja',
    lang: 'ja',
    formsLabel: '1 form',
    forms: [{ category: 'other', word: '個のファイル' }],
    rendered: ['1個のファイル', '2個のファイル', '5個のファイル', '22個のファイル'],
    picks: [0, 0, 0, 0],
  },
];

/** Must match `.lang-pf-rule` height in lang.css — the marker steps by row. */
const ROW_H = 22;
const HOLD = 2.4;
const MOVE = 0.6;
const STEP = HOLD + MOVE;
/** Reduced motion freezes on 5, where all three languages disagree most visibly. */
const FROZEN = 2;

export default function PluralForms({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const numbers = gsap.utils.toArray<HTMLElement>('[data-pf-count]', rootEl);
      const markers = gsap.utils.toArray<HTMLElement>('[data-pf-marker]', rootEl);
      const results = COLUMNS.map((column) =>
        gsap.utils.toArray<HTMLElement>(`[data-pf-result="${column.tag}"]`, rootEl),
      );
      if (markers.length !== COLUMNS.length || numbers.length !== COUNTS.length) return;

      const settle = (n: number) => {
        gsap.set(numbers, { autoAlpha: 0, y: 0 });
        gsap.set(target(numbers, n), { autoAlpha: 1, y: 0 });
        markers.forEach((marker, c) => {
          gsap.set(marker, { y: (COLUMNS[c]?.picks[n] ?? 0) * ROW_H });
        });
        results.forEach((column) => {
          gsap.set(column, { autoAlpha: 0, y: 0 });
          gsap.set(target(column, n), { autoAlpha: 1, y: 0 });
        });
      };

      if (prefersReducedMotion()) {
        settle(FROZEN);
        return;
      }

      settle(0);
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

      for (let k = 1; k <= COUNTS.length; k++) {
        const n = k % COUNTS.length;
        const prev = (n + COUNTS.length - 1) % COUNTS.length;
        const at = k * STEP - MOVE;

        /* `immediateRender: false` or every fromTo in the timeline would apply
           its own start state the moment the timeline is built, leaving the
           diagram blank until the first transition arrives. */
        tl.to(target(numbers, prev), { autoAlpha: 0, y: -8, duration: 0.3 }, at).fromTo(
          target(numbers, n),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.36, immediateRender: false },
          at + 0.26,
        );

        markers.forEach((marker, c) => {
          tl.to(marker, { y: (COLUMNS[c]?.picks[n] ?? 0) * ROW_H, duration: MOVE }, at + 0.1);
        });

        results.forEach((column) => {
          tl.to(target(column, prev), { autoAlpha: 0, y: -7, duration: 0.3 }, at).fromTo(
            target(column, n),
            { autoAlpha: 0, y: 7 },
            { autoAlpha: 1, y: 0, duration: 0.36, immediateRender: false },
            at + 0.26,
          );
        });
      }

      tl.duration(COUNTS.length * STEP);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-pf', accent, className)} ref={root} {...langA11y(title)}>
      <p className='lang-pf-count'>
        <span className='lang-pf-key'>count</span>
        <span className='lang-pf-n'>
          {COUNTS.map((count) => (
            <span className='lang-pf-num' data-pf-count='' key={count}>
              {count}
            </span>
          ))}
        </span>
      </p>

      <div className='lang-pf-cols'>
        {COLUMNS.map((column) => (
          <div className='lang-pf-col' key={column.tag}>
            <p className='lang-pf-head'>
              <span className='lang-tag'>
                <LocaleTag code={column.tag} />
              </span>
              <span className='lang-pf-forms'>{column.formsLabel}</span>
            </p>

            <p className='lang-pf-result' lang={column.lang}>
              {column.rendered.map((text, i) => (
                <span className='lang-pf-rendered' data-pf-result={column.tag} key={COUNTS[i]}>
                  {text}
                </span>
              ))}
            </p>

            <div className='lang-pf-rules'>
              <i className='lang-pf-marker' data-pf-marker='' />
              {column.forms.map((form) => (
                <p className='lang-pf-rule' key={form.category}>
                  <span className='lang-pf-cat'>{form.category}</span>
                  <span className='lang-pf-word' lang={column.lang}>
                    {form.word}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
