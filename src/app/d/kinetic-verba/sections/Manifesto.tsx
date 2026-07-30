'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import { STAT_ROW } from '../lib/content';
import { subscribeVelocity, velocity } from '../lib/velocity';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const MANIFESTO =
  'The hard part about translation is no longer model quality, but context and infrastructure. Translations have to reflect the logic of an application.';

/**
 * The wall. Alternating rows are cut (solid metal) or drawn (hairline
 * outline), so the type reads as a built surface rather than a watermark.
 */
const WALL_ROWS: { cut: boolean; words: { text: string; lang: string }[] }[] = [
  {
    cut: true,
    words: [
      { text: 'Launch in every language', lang: 'en' },
      { text: 'すべての言語で', lang: 'ja' },
      { text: 'en todos los idiomas', lang: 'es' },
    ],
  },
  {
    cut: false,
    words: [
      { text: 'in jeder Sprache', lang: 'de' },
      { text: '모든 언어로', lang: 'ko' },
      { text: 'في كل لغة', lang: 'ar' },
      { text: 'toutes les langues', lang: 'fr' },
    ],
  },
  {
    cut: true,
    words: [
      { text: '每种语言', lang: 'zh' },
      { text: 'हर भाषा में', lang: 'hi' },
      { text: 'em todos os idiomas', lang: 'pt' },
    ],
  },
  {
    cut: false,
    words: [
      { text: 'in ogni lingua', lang: 'it' },
      { text: 'ทุกภาษา', lang: 'th' },
      { text: 'in elke taal', lang: 'nl' },
      { text: 'her dilde', lang: 'tr' },
    ],
  },
  {
    cut: true,
    words: [
      { text: 'на каждом языке', lang: 'ru' },
      { text: 'w każdym języku', lang: 'pl' },
      { text: 'på alla språk', lang: 'sv' },
    ],
  },
];

/**
 * The direction's own section: one statement, then the wall it is about.
 *
 * The wall is the signature — display-scale type in twelve scripts, counter
 * running, its weight and width driven by scroll velocity, cut rows against
 * drawn rows. It is the thing that makes a still frame of this page
 * identifiable without the logo.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const stats = host.querySelectorAll('[data-stat]');
      gsap.fromTo(
        stats,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: stats[0], start: 'top 98%', once: true },
        }
      );

      if (reduced) return;

      const copy = host.querySelector<HTMLElement>('[data-manifesto]');
      if (copy) {
        SplitText.create(copy, {
          type: 'words',
          wordsClass: 'kv-mword',
          autoSplit: true,
          aria: 'auto',
          /* The floor is high enough that a frame caught mid-scrub still reads
             as a sentence, not as a half-developed print. */
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.5 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.05,
                scrollTrigger: { trigger: copy, start: 'top 92%', end: 'bottom 72%', scrub: 1 },
              }
            ),
        });
      }

      const rows = gsap.utils.toArray<HTMLElement>('[data-wallrow]', host);
      const loops = rows.map((row, i) =>
        i % 2
          ? gsap.fromTo(row, { xPercent: -50 }, { xPercent: 0, ease: 'none', repeat: -1, duration: 58 })
          : gsap.to(row, { xPercent: -50, ease: 'none', repeat: -1, duration: 48 })
      );

      const wall = host.querySelector<HTMLElement>('[data-wall]');
      let active = false;
      ScrollTrigger.create({
        trigger: wall ?? host,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          active = self.isActive;
          loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause()));
        },
      });

      /* The wall is where velocity is most legible: it is the only type on the
         page big enough that a 200-unit weight swing and a 14% width swing are
         unmistakable at a glance. */
      const release = subscribeVelocity();
      const tick = () => {
        if (!active || !wall) return;
        const weight = gsap.utils.clamp(300, 800, 560 + velocity.smooth * 0.14);
        const stretch = gsap.utils.clamp(0.88, 1.14, 1 + velocity.smooth * 0.00007);
        wall.style.setProperty('--kv-mqw', String(Math.round(weight / 100) * 100));
        wall.style.setProperty('--kv-mqx', stretch.toFixed(3));
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        loops.forEach((loop) => loop.kill());
        release();
      };
    },
    { scope: root }
  );

  return (
    <section className='kv-sect kv-manifesto-sect' id='manifesto' ref={root} aria-label='Manifesto'>
      <p className='kv-manifesto' data-manifesto>
        {MANIFESTO}
      </p>

      <div className='kv-wall' data-wall aria-hidden>
        {WALL_ROWS.map((row, i) => (
          <div className={`kv-wall-row${row.cut ? ' kv-wall-cut' : ' kv-wall-drawn'}`} data-wallrow key={i}>
            {[...row.words, ...row.words].map((entry, j) => (
              <span lang={entry.lang} key={`${entry.text}-${j}`}>
                {entry.text}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className='kv-statrow'>
        {STAT_ROW.map((stat) => (
          <div data-stat key={stat.label}>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
