'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import Link from 'next/link';

import FlapPhrase from './FlapPhrase';
import { createGlyphField } from './glyphField';

/** The close's rain speaks money: the world's currency marks, wider
    variety than the hero's till — data-class symbols, cell-sized. */
const MONEY_GLYPHS: readonly string[] = [
  '$',
  '€',
  '¥',
  '£',
  '₹',
  '₩',
  '₽',
  '₺',
  '₪',
  '₫',
  '฿',
  '₦',
  '₴',
  '₱',
  '₲',
  '₡',
  '₭',
  '₮',
  '₸',
  '₵',
  '৳',
  '¢',
  '¤',
  'kr',
  'zł',
  'R$',
  'Fr',
];

/**
 * The close: one dark band, the condensation field behind a single ask
 * — the deploy band's mount and its CTA pair. The copy stands LEFT in
 * the engine's own dithered clearing, the field condenses into the
 * word to the right, and the ask lands the way the board's greetings
 * do: riffling through world scripts before settling out of the rain.
 */
export default function CloseBand() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      const canvas = stage.current;
      if (!rootEl || !canvas) return;

      const h2 = rootEl.querySelector('h2');
      const copyEl = rootEl.querySelector<HTMLElement>('.pricing-close-copy');
      const field = createGlyphField({
        canvas,
        drift: 'rise',
        glyphs: MONEY_GLYPHS,
        displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
        monoFamily:
          getComputedStyle(rootEl).getPropertyValue('--tc-mono').trim() ||
          undefined,
        copyBottom: copyEl
          ? () => copyEl.offsetTop + copyEl.offsetHeight
          : undefined,
      });

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='tc-sec pricing-close' ref={root}>
      <canvas className='pricing-close-canvas' ref={stage} aria-hidden='true' />
      <div className='pricing-close-copy'>
        <h2>
          <FlapPhrase text='Ship in every language.' />
        </h2>
        <div className='pricing-close-acts'>
          <span className='pricing-close-cta'>
            <Link
              className='pricing-close-btn is-solid'
              href='/d/singularity-dossier'
            >
              Get started
            </Link>
          </span>
          <Link
            className='pricing-close-btn'
            href='/d/singularity-dossier/contact'
          >
            Get a demo
          </Link>
        </div>
      </div>
    </section>
  );
}
