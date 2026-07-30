'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { flipUp } from '../lib/flap';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hero's own departure call: a fixed rank of thirteen flap tiles under
 * the sub copy that clacks through the same greeting in different languages,
 * locale-stamped — the split-flap identity held in the settled frame, and
 * translation shown as the mechanic rather than told. The tile count is
 * fixed the way a real board's is: shorter strings centre and the unused
 * tiles simply stand blank.
 */

const WIDTH = 13;

type Call = { text: string; stamp: string; lang: string };

/* Vetted greetings only — each is the natural way the language welcomes a
   returning user, not a word-for-word gloss. */
const CALLS: readonly Call[] = [
  { text: 'WELCOME BACK!', stamp: 'EN', lang: 'English' },
  { text: '¡BIENVENIDO!', stamp: 'ES', lang: 'Spanish' },
  { text: 'おかえりなさい', stamp: 'JA', lang: 'Japanese' },
  { text: 'BON RETOUR !', stamp: 'FR', lang: 'French' },
  { text: '환영합니다!', stamp: 'KO', lang: 'Korean' },
  { text: 'WILLKOMMEN!', stamp: 'DE', lang: 'German' },
];

/** Centre a call on the fixed tile rank; '' marks a blank tile. */
function padCells(text: string): string[] {
  const chars = Array.from(text);
  const left = Math.floor((WIDTH - chars.length) / 2);
  return Array.from({ length: WIDTH }, (_, i) => {
    const ch = chars[i - left];
    return ch === undefined || ch === ' ' ? '' : ch;
  });
}

export default function NowBoarding() {
  const root = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);
  const srRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const tiles = tilesRef.current;
      const stamp = stampRef.current;
      const sr = srRef.current;
      const scope = root.current;
      if (!tiles || !stamp || !sr || !scope) return;

      const heroOn = ScrollTrigger.create({ trigger: scope, start: 'top bottom', end: 'bottom top' });
      let idx = 0;
      /* The re-scheduling delayedCalls are created after this context has
         finished recording, so they outlive its revert — the alive latch is
         what actually stops the loop on unmount. */
      let alive = true;

      const step = () => {
        if (!alive) return;
        gsap.delayedCall(4.6, step);
        if (document.hidden || !heroOn.isActive) return;
        idx = (idx + 1) % CALLS.length;
        const call = CALLS[idx];
        if (!call) return;
        const cells = padCells(call.text);
        tiles.querySelectorAll<HTMLElement>('[data-tb-face]').forEach((face, i) => {
          face.dataset.char = cells[i] ?? '';
        });
        flipUp(tiles, { per: 0.032, cycles: 2 });
        gsap
          .timeline()
          .to(stamp, {
            autoAlpha: 0,
            duration: 0.14,
            ease: 'power1.in',
            onComplete: () => {
              stamp.textContent = call.stamp;
            },
          })
          .to(stamp, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' });
        sr.textContent = `${call.text} — ${call.lang}`;
      };
      /* First call lands early, so a fresh page already reads translated. */
      gsap.delayedCall(2.4, step);

      return () => {
        alive = false;
        heroOn.kill();
      };
    },
    { scope: root }
  );

  return (
    <div className='tb-board-line' data-hero-in ref={root}>
      <span className='tb-bl-cap'>Now boarding</span>
      <span className='tb-bl-row'>
        <span className='tb-bl-tiles' aria-hidden ref={tilesRef}>
          {padCells(CALLS[0]?.text ?? '').map((ch, i) => (
            <span className='tb-bl-ch' key={i}>
              <span className='tb-ch-f' data-tb-face data-char={ch}>
                {ch}
              </span>
            </span>
          ))}
        </span>
        <span className='tb-bl-stamp' aria-hidden ref={stampRef}>
          {CALLS[0]?.stamp ?? 'EN'}
        </span>
      </span>
      <span className='tb-sr' ref={srRef}>
        {`${CALLS[0]?.text ?? ''} — ${CALLS[0]?.lang ?? ''}`}
      </span>
    </div>
  );
}
