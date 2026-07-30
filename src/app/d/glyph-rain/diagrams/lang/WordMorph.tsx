'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { langA11y, langClass, prefersReducedMotion, target, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * One UI term, printed in every locale it ships in, with the reading stepping
 * down the ledger.
 *
 * The previous version morphed a single word in place above a rule measured to
 * it, and it did not survive a still: a frame caught one language, one orphaned
 * locale tag, and a half-drawn rule that read as a progress bar. Two thirds of
 * the card was empty and the transformation — the whole point — was the part
 * only a viewer watching in real time ever saw.
 *
 * So every translation is printed here all of the time. Any frame of this
 * diagram is six real translations of the same term, which is the argument the
 * cell is making; the step only decides which one is being read, and it says so
 * with ink and size rather than with chrome. No rule, no bar, and no accent —
 * the six words are the illustration, not a widget around them.
 *
 * Character-level entry is kept, because it is the closest thing to watching a
 * word become another word that also works as a photograph: the live word's
 * letters deepen one at a time, from legible to full ink, so the word is never
 * absent from the frame. Cursive scripts are handled whole in ScriptSampler and
 * RtlMirror — letter-by-letter Arabic would be letter-by-letter nonsense — so
 * every language here is one the browser can split without breaking shaping.
 */

type Word = { tag: string; lang: string; text: string };

const SOURCE = 'Settings';

const WORDS: readonly Word[] = [
  { tag: 'es', lang: 'es', text: 'Configuración' },
  { tag: 'ja', lang: 'ja', text: '設定' },
  { tag: 'de', lang: 'de', text: 'Einstellungen' },
  { tag: 'ru', lang: 'ru', text: 'Настройки' },
  { tag: 'ko', lang: 'ko', text: '설정' },
  { tag: 'fr', lang: 'fr', text: 'Paramètres' },
];

/* Every row stays at full ink — the six translations are the artifact, and
   muted is never the artifact's ink. Only scale says which row is being read. */
const DIM = 1;
const LIT = 1.11;

const STEP = 2.1;
const FADE = 0.5;
/** Per-character offset. Thirteen letters at 0.026 is a third of a second. */
const IN_STAGGER = 0.026;
/** Reduced motion rests on German: the longest word, and the clearest step. */
const FROZEN = 2;

export default function WordMorph({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const rows = gsap.utils.toArray<HTMLElement>('[data-wm-row]', rootEl);
      const words = gsap.utils.toArray<HTMLElement>('[data-wm-word]', rootEl);
      const chars = words.map((word) => gsap.utils.toArray<HTMLElement>('[data-wm-char]', word));
      if (rows.length !== WORDS.length) return;

      const settle = (i: number) => {
        gsap.set(rows, { opacity: DIM });
        gsap.set(words, { scale: 1 });
        gsap.set(chars.flat(), { opacity: 1, y: 0 });
        gsap.set(target(rows, i), { opacity: 1 });
        gsap.set(target(words, i), { scale: LIT });
      };

      if (prefersReducedMotion()) {
        settle(FROZEN);
        return;
      }

      settle(0);
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.out' } });

      for (let k = 1; k <= WORDS.length; k++) {
        const i = k % WORDS.length;
        const prev = (i + WORDS.length - 1) % WORDS.length;
        const at = k * STEP;

        tl.to(target(rows, prev), { opacity: DIM, duration: FADE }, at)
          .to(target(words, prev), { scale: 1, duration: FADE }, at)
          .to(target(rows, i), { opacity: 1, duration: FADE }, at)
          .to(target(words, i), { scale: LIT, duration: FADE }, at)
          /* `immediateRender: false` or this fromTo applies its start state the
             moment the timeline is built, and every word but the first renders
             at a quarter ink until its turn comes round. */
          .fromTo(
            chars[i] ?? [],
            { opacity: 0.3, y: 2 },
            { opacity: 1, y: 0, duration: 0.32, stagger: IN_STAGGER, immediateRender: false },
            at + 0.08,
          );
      }

      tl.duration(WORDS.length * STEP);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-wm', accent, className)} ref={root} {...langA11y(title)}>
      <p className='lang-wm-source'>
        <span className='lang-tag'>
          <LocaleTag code='en' />
        </span>
        <span className='lang-wm-source-text'>{SOURCE}</span>
      </p>

      <ul className='lang-wm-rows'>
        {WORDS.map((word) => (
          <li className='lang-wm-row' data-wm-row='' key={word.tag}>
            <span className='lang-tag'>
              <LocaleTag code={word.tag} />
            </span>
            <span className='lang-wm-word' data-wm-word='' lang={word.lang}>
              {Array.from(word.text, (char, i) => (
                <span className='lang-wm-char' data-wm-char='' key={`${word.tag}-${i}`}>
                  {char}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
