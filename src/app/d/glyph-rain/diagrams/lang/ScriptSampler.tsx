'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { langA11y, langClass, prefersReducedMotion, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * The word "language", in eight writing systems at once.
 *
 * Each sample sits at its own depth — nearer ones larger and darker, further
 * ones smaller and lighter — and drifts on a long sine of its own, so the
 * field breathes without any two samples ever moving together. Nothing
 * enters or leaves: the composition is complete before the first frame, which
 * is what lets it survive as a still.
 *
 * No accent: depth already marks the source, so colour would say it twice.
 */

type Sample = {
  tag: string;
  script: string;
  text: string;
  lang: string;
  rtl?: boolean;
  /** 0 is nearest. Drives size, weight of ink, and how far the sample drifts. */
  depth: number;
  x: number;
  y: number;
};

const SAMPLES: readonly Sample[] = [
  { tag: 'en', script: 'Latin', text: 'language', lang: 'en', depth: 0, x: 2, y: 72 },
  { tag: 'zh', script: 'Han', text: '语言', lang: 'zh', depth: 0.16, x: 58, y: 22 },
  { tag: 'hi', script: 'Devanagari', text: 'भाषा', lang: 'hi', depth: 0.3, x: 33, y: 0 },
  { tag: 'ru', script: 'Cyrillic', text: 'язык', lang: 'ru', depth: 0.36, x: 4, y: 4 },
  { tag: 'ar', script: 'Arabic', text: 'لغة', lang: 'ar', rtl: true, depth: 0.24, x: 82, y: 84 },
  { tag: 'el', script: 'Greek', text: 'γλώσσα', lang: 'el', depth: 0.5, x: 36, y: 112 },
  { tag: 'ko', script: 'Hangul', text: '언어', lang: 'ko', depth: 0.62, x: 73, y: 146 },
  { tag: 'th', script: 'Thai', text: 'ภาษา', lang: 'th', depth: 0.54, x: 4, y: 146 },
];

/** Long, irregular periods so the field never falls into step with itself. */
const PERIOD = [9.5, 8.2, 11.4, 10.1, 8.8, 12.3, 9.1, 10.8];

type SampleStyle = { top: string; left: string; '--lang-ss-depth': number };

export default function ScriptSampler({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rootEl = root.current;
      if (!rootEl) return;

      const items = gsap.utils.toArray<HTMLElement>('[data-ss-item]', rootEl);

      items.forEach((item, i) => {
        const depth = SAMPLES[i]?.depth ?? 0;
        /* Nearer samples travel further, which is the parallax that reads as depth. */
        const travel = 3 + (1 - depth) * 6;
        const period = PERIOD[i] ?? 10;

        /* Seeded mid-flight rather than delayed, so no sample waits to start. */
        gsap
          .to(item, { y: travel, duration: period, repeat: -1, yoyo: true, ease: 'sine.inOut' })
          .progress(i / items.length);
        gsap
          .to(item, { x: travel * 0.4, duration: period * 1.37, repeat: -1, yoyo: true, ease: 'sine.inOut' })
          .progress(((i * 3) % items.length) / items.length);
      });
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-ss', accent, className)} ref={root} {...langA11y(title)}>
      <div className='lang-ss-field'>
        {SAMPLES.map((sample) => {
          const style: SampleStyle = {
            top: `${sample.y}px`,
            left: `${sample.x}%`,
            '--lang-ss-depth': sample.depth,
          };
          return (
            <div
              className={sample.depth === 0 ? 'lang-ss-item is-source' : 'lang-ss-item'}
              data-ss-item=''
              key={sample.tag}
              style={style}
            >
              <span className='lang-ss-word' lang={sample.lang} dir={sample.rtl ? 'rtl' : undefined}>
                {sample.text}
              </span>
              <span className='lang-ss-meta'>
                <span className='lang-tag'>
                  <LocaleTag code={sample.tag} />
                </span>
                <span className='lang-ss-script'>{sample.script}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
