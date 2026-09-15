'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { prefersReducedMotion } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { FORMATS, HELLO_WORLD, SOURCE_FILE, SOURCE_INSTALL, SOURCE_PKG } from '../data';
import Tile from './Tile';
import { Block, Course, HEAD_RELIEF_SPAN, Plaque, Relief } from './Wall';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * textile-block: the T proof, cast in relief across one course.
 *
 * The course is keyed to the Ennis block. The shipped Next.js sample
 * (stacks.ts, verbatim) is cast into one smooth block whose bar carries the
 * file name, the package, the source locale tile and one copy control, and
 * whose foot carries the two install commands. The string it wraps comes
 * back in twelve languages, each cast into the adjacent block of the same
 * course with its locale tile set as a header brick in the corner. Under
 * them, one row of formatted values: the numbers, currencies, plurals, and
 * routes the same tree renders per locale, each with its locale brick.
 * Strings carry the only syntax hue, because strings are the product.
 * Every cast is fully visible at rest, before any script runs; one paused
 * timeline lifts them in order (a small translateY, never opacity) while
 * the course is on screen, so the still, the no-JS render and the finished
 * wall are the same markup. Under prefers-reduced-motion nothing moves.
 */

type Kind = 'k' | 't' | 'T' | 's' | 'p';

type Token = readonly [Kind, string];

/** stacks.ts FRAMEWORKS[0].code, split into lines and marked by hand. */
const CODE: readonly (readonly Token[])[] = [
  [['k', 'import'], ['p', ' { T, Num, DateTime } '], ['k', 'from'], ['p', ' '], ['s', "'gt-next'"], ['p', ';']],
  [],
  [['k', 'export default function'], ['p', ' Home() {']],
  [['p', '  '], ['k', 'return'], ['p', ' (']],
  [['p', '    '], ['T', '<T>']],
  [['p', '      '], ['t', '<main>']],
  [['p', '        '], ['t', '<h1>'], ['s', 'Hello, world!'], ['t', '</h1>']],
  [['p', '        '], ['t', '<p>']],
  [['p', '          '], ['t', '<DateTime>'], ['p', '{new Date()}'], ['t', '</DateTime>']],
  [['p', '        '], ['t', '</p>']],
  [['p', '        '], ['t', '<p>']],
  [['p', '          '], ['s', 'GT has everything you need to ship your']],
  [['p', '          '], ['s', 'product in '], ['t', '<Num>'], ['p', '{118}'], ['t', '</Num>'], ['s', ' languages.']],
  [['p', '        '], ['t', '</p>']],
  [['p', '      '], ['t', '</main>']],
  [['p', '    '], ['T', '</T>']],
  [['p', '  );']],
  [['p', '}']],
];

/** The sample as plain text, for the bar's copy control. */
const SOURCE_TEXT = CODE.map((line) => line.map(([, text]) => text).join('')).join('\n');

function CopySource() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SOURCE_TEXT);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button aria-label='Copy the source file' className='tb-cmd-copy' onClick={copy} type='button'>
      {copied ? 'copied' : 'copy'}
    </button>
  );
}

function SourceCode() {
  return (
    <ol className='tb-code'>
      {CODE.map((line, i) => (
        <li key={i}>
          {line.length === 0 ? (
            <span> </span>
          ) : (
            line.map(([kind, text], j) => (
              <span className={`is-${kind}`} key={j}>
                {text}
              </span>
            ))
          )}
        </li>
      ))}
    </ol>
  );
}

export default function Proof() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const scope = root.current;
      if (!scope) return;
      const casts = gsap.utils.toArray<HTMLElement>('[data-cast]', scope);
      if (casts.length === 0) return;

      // Additive only: every cast is fully legible at rest and the loop never
      // touches opacity. Each string lifts 3px in order, holds, and settles
      // back; the timeline starts and ends at the resting pose.
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
      tl.to(casts, { y: -3, duration: 0.5, ease: 'power2.out', stagger: 0.16 });
      tl.to(casts, { y: 0, duration: 0.4, ease: 'power1.in', stagger: 0.05 }, '+=2.4');

      ScrollTrigger.create({
        trigger: scope,
        start: 'top 80%',
        end: 'bottom 20%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause(0);
        },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <Course className='is-proof' id='proof' label='The T component'>
        <Plaque label='Ennis course' relief='ennis' title='The T component'>
          Wrap the tree once. GT extracts every string, translates it, and ships each locale.
        </Plaque>
        <Relief className='tb-lg-only' relief='ennis' span={HEAD_RELIEF_SPAN} />

        {/* ---- the source block ---- */}
        <Block className='tb-source' span={{ c: 6, r: 5, cMd: 8, rMd: 5, cSm: 6, rSm: 7 }}>
          <div className='tb-source-bar'>
            <span className='tb-source-file'>{SOURCE_FILE}</span>
            <span className='tb-source-side'>
              <span>{SOURCE_PKG}</span>
              <Tile code='en' />
              <CopySource />
            </span>
          </div>
          <SourceCode />
          <div className='tb-source-foot'>
            {SOURCE_INSTALL.map((command) => (
              <span className='tb-source-cmd' key={command}>
                <span aria-hidden='true' className='tb-term-prompt'>
                  $
                </span>
                <code>{command}</code>
              </span>
            ))}
          </div>
        </Block>

        {/* ---- the cast translations, one block each ---- */}
        {HELLO_WORLD.map((row) => (
          <Block className='tb-cast' key={row.tag} span={{ c: 2, r: 1, cMd: 2, cSm: 3, rSm: 1 }}>
            <Tile code={row.tag} header />
            <p data-cast dir={row.rtl ? 'rtl' : 'ltr'} lang={row.tag}>
              {row.text}
            </p>
          </Block>
        ))}
        <Relief className='tb-lg-only' relief='ennis' span={{ c: 6, r: 1 }} />

        {/* ---- the formatted values the same tree renders ---- */}
        {FORMATS.map((format) => (
          <Block className='tb-format' key={format.cap} span={{ c: 3, r: 1, cMd: 2, cSm: 3 }}>
            <Tile code={format.tag} header />
            <span className='tb-format-cap'>{format.cap}</span>
            <code className='tb-format-out' lang={format.tag}>
              {format.out}
            </code>
          </Block>
        ))}
      </Course>
    </div>
  );
}
