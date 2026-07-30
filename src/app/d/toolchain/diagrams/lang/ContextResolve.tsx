'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '../../components/LocaleTag';

import { langA11y, langClass, prefersReducedMotion, target, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * Why a translation memory is not enough: "Save" is two different German
 * verbs, and only the surrounding intent decides which.
 *
 * `speichern` writes a file; `sparen` keeps money. A model handed the bare
 * string has to guess; a model handed `context` does not. Both branches stay
 * drawn at all times so the fork is readable at rest — the loop only decides
 * which one is currently live.
 *
 * Accent: the live branch.
 */

type Branch = {
  context: string;
  result: string;
  gloss: string;
};

const SOURCE = 'Save';

const BRANCHES: readonly Branch[] = [
  { context: 'file', result: 'speichern', gloss: 'write it to disk' },
  { context: 'discount', result: 'sparen', gloss: 'spend less money' },
];

const DWELL = 3;
/** Reduced motion freezes on the first branch; both stay legible either way. */
const FROZEN = 0;

export default function ContextResolve({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const paths = gsap.utils.toArray<SVGGElement>('[data-cr-live]', rootEl);
      const cards = gsap.utils.toArray<HTMLElement>('[data-cr-card]', rootEl);
      if (paths.length !== BRANCHES.length || cards.length !== BRANCHES.length) return;

      /* 0.7, not lower: the resting branch holds an ink-filled button now, and
         a deeper fade turned it into a grey slab rather than a quieter card. */
      const settle = (i: number) => {
        gsap.set(paths, { autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0.7, y: 0 });
        gsap.set(target(paths, i), { autoAlpha: 1 });
        gsap.set(target(cards, i), { autoAlpha: 1, y: 0 });
      };

      if (prefersReducedMotion()) {
        settle(FROZEN);
        return;
      }

      settle(0);
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

      BRANCHES.forEach((_, k) => {
        const i = (k + 1) % BRANCHES.length;
        const prev = k % BRANCHES.length;
        const at = (k + 1) * DWELL - 0.7;
        tl.to(target(paths, prev), { autoAlpha: 0, duration: 0.55 }, at)
          .to(target(cards, prev), { autoAlpha: 0.7, y: 0, duration: 0.55 }, at)
          .to(target(paths, i), { autoAlpha: 1, duration: 0.55 }, at + 0.2)
          /* `immediateRender: false` or the fromTo would apply its own start
             state the moment the timeline is built, overriding the settled
             frame the diagram opens on. */
          .fromTo(
            target(cards, i),
            { autoAlpha: 0.7, y: 4 },
            { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false },
            at + 0.2,
          );
      });

      tl.duration(BRANCHES.length * DWELL);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-cr', accent, className)} ref={root} {...langA11y(title)}>
      <p className='lang-cr-source'>
        <span className='lang-tag'>
          <LocaleTag code='en' />
        </span>
        <span className='lang-cr-word'>{SOURCE}</span>
      </p>

      {/* The fork is drawn with the brand's doubled line: each branch is one
          path stroked twice — a full-gauge underline and a card-colored core —
          which leaves two parallel 1.5px threads at a constant 3px gap along
          the whole curve. Source and translation, running side by side. */}
      <svg className='lang-cr-fork' viewBox='0 0 440 56' preserveAspectRatio='none' aria-hidden='true'>
        <path className='lang-cr-thread' d='M220 0 V14 C220 38 110 28 110 56' />
        <path className='lang-cr-core' d='M220 0 V14 C220 38 110 28 110 56' />
        <path className='lang-cr-thread' d='M220 0 V14 C220 38 330 28 330 56' />
        <path className='lang-cr-core' d='M220 0 V14 C220 38 330 28 330 56' />
        <g data-cr-live=''>
          <path className='lang-cr-thread is-live' d='M220 0 V14 C220 38 110 28 110 56' />
          <path className='lang-cr-core' d='M220 0 V14 C220 38 110 28 110 56' />
        </g>
        <g data-cr-live=''>
          <path className='lang-cr-thread is-live' d='M220 0 V14 C220 38 330 28 330 56' />
          <path className='lang-cr-core' d='M220 0 V14 C220 38 330 28 330 56' />
        </g>
      </svg>

      <div className='lang-cr-branches'>
        {BRANCHES.map((branch) => (
          <div className='lang-cr-branch' data-cr-card='' key={branch.context}>
            <p className='lang-cr-ctx'>
              <span className='lang-cr-attr'>context=</span>
              <span className='lang-cr-val'>&ldquo;{branch.context}&rdquo;</span>
            </p>
            <p className='lang-cr-result' lang='de'>
              {branch.result}
            </p>
            <p className='lang-cr-gloss'>
              <span className='lang-tag'>
                <LocaleTag code='de' />
              </span>
              {branch.gloss}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
