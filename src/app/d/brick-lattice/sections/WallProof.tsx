'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import BrickField from '../diagrams/BrickField';
import Rosette from '../diagrams/Rosette';
import { LINKS, SOURCE_WORD, wordFor } from '../data';
import LocaleChip from './LocaleChip';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * brick-lattice · the T component proof.
 *
 * Home: the second section, the wall. Thirteen bricks in three courses of
 * running bond, the source brick in the middle of the middle course. The
 * source carries the `<T>` line as written in the shipped sample; every
 * other brick carries the same sentence in one locale of the shipped
 * roster, under a glazed header course that holds its flag chip. When the
 * wall comes on screen the source lights and its neighbours fire in order
 * of distance: each brick's density steps through the four Bayer tiers of
 * the page's <defs> and lands on solid lapis, and only then does the
 * translation print. Density rises, nothing fades. The resting markup is
 * the fired wall, which is the still under reduced motion.
 */
type WallBrick = { code: string; d: number };

/* half-brick unit positions along a course; the source sits at 5 in the middle course */
const COURSES: readonly (readonly { code: string; cx: number }[])[] = [
  [
    { code: 'pt', cx: 2 },
    { code: 'it', cx: 4 },
    { code: 'zh', cx: 6 },
    { code: 'ko', cx: 8 },
  ],
  [
    { code: 'de', cx: 1 },
    { code: 'es', cx: 3 },
    { code: 'en', cx: 5 },
    { code: 'fr', cx: 7 },
    { code: 'ja', cx: 9 },
  ],
  [
    { code: 'ru', cx: 2 },
    { code: 'hi', cx: 4 },
    { code: 'tr', cx: 6 },
    { code: 'pl', cx: 8 },
  ],
];

function distance(row: number, cx: number): number {
  const dx = (cx - 5) / 2;
  const dy = row - 1;
  return Math.hypot(dx, dy);
}

function SourceBrick() {
  return (
    <div className='bl-tb bl-src' lang='en' dir='ltr'>
      <div className='bl-tb-head'>
        <span className='bl-src-tag'>source</span>
        <LocaleChip code='en' glazed />
      </div>
      <pre className='bl-src-code'>
        <code>
          <span className='bl-tag'>{'<T>'}</span>
          <span className='bl-str'>{SOURCE_WORD.text}</span>
          <span className='bl-tag'>{'</T>'}</span>
        </code>
      </pre>
    </div>
  );
}

function TranslationBrick({ code, d }: WallBrick) {
  const word = wordFor(code);
  return (
    <div className='bl-tb is-fired' data-tier='5' data-d={d.toFixed(2)} lang={word.lang} dir={word.dir}>
      <div className='bl-tb-head'>
        <LocaleChip code={code} glazed />
      </div>
      <p className='bl-tb-text'>{word.text}</p>
      <svg className='bl-tb-scr' aria-hidden='true' focusable='false'>
        <rect width='100%' height='100%' />
      </svg>
    </div>
  );
}

export default function WallProof() {
  const root = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = wall.current;
      if (!el) return;
      const bricks = Array.from(el.querySelectorAll<HTMLElement>('.bl-tb[data-d]'));
      const source = el.querySelector<HTMLElement>('.bl-src');

      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.9 });
      /* the reset sits just off time zero so every repeat fires it */
      tl.call(
        () => {
          bricks.forEach((b) => {
            b.dataset.tier = '0';
            b.classList.remove('is-fired');
          });
          source?.classList.remove('is-lit');
        },
        undefined,
        0.02
      );
      tl.to({}, { duration: 0.7 }, 0.02);
      tl.call(() => source?.classList.add('is-lit'));
      bricks.forEach((b) => {
        const d = Number(b.dataset.d ?? '1');
        const proxy = { k: 0 };
        tl.to(
          proxy,
          {
            k: 5,
            duration: 1.05,
            ease: 'none',
            snap: { k: 1 },
            onUpdate: () => {
              const k = Math.round(proxy.k);
              b.dataset.tier = String(k);
              b.classList.toggle('is-fired', k >= 5);
            },
          },
          1.0 + d * 0.55
        );
      });
      tl.to({}, { duration: 4.6 }, '>');

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: root }
  );

  return (
    <section className='bl-sec bl-wall-sec' id='t' ref={root}>
      <BrickField field='chevron' />
      <div className='bl-in'>
        <header className='bl-head bl-panel'>
          <Rosette size={40} brick={16} petals={8} core='gold' className='is-mark' />
          <h2>The T component</h2>
          <p>
            Wrap the source once. GT extracts the string, translates it into every locale you list, and
            serves each one from the edge.
          </p>
        </header>

        <div className='bl-wall' ref={wall}>
          {COURSES.map((course, row) => (
            <div className='bl-course' key={row} data-course={row}>
              {row !== 1 ? <span className='bl-half' aria-hidden='true' /> : null}
              {course.map((b) =>
                b.code === 'en' ? (
                  <SourceBrick key={b.code} />
                ) : (
                  <TranslationBrick key={b.code} code={b.code} d={distance(row, b.cx)} />
                )
              )}
              {row !== 1 ? <span className='bl-half' aria-hidden='true' /> : null}
            </div>
          ))}
        </div>

        <div className='bl-wall-foot bl-panel'>
          <p>
            One source string, one component. The translations ship as static files with the build and
            update over the air without a redeploy.
          </p>
          <a className='bl-btn bl-btn-line bl-btn-sm' href={LINKS.docs}>
            Read the Docs
          </a>
        </div>
      </div>
    </section>
  );
}
