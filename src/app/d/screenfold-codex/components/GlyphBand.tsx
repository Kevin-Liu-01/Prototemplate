'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { patternId, type Tone } from './BayerDefs';
import GlyphBlock, { MOTIFS, type Motif } from './GlyphBlock';
import { playWhileVisible } from './motion';

/**
 * The hero's band of glyph blocks: two rows of eight dithered squares read
 * in paired columns, the codex's reading order. While the band is on
 * screen one block at a time re-inks to the next density tier, a discrete
 * step through the screen rather than a fade, so the band is always a
 * finished still. Under reduced motion the first tiers stand.
 *
 * Ornament home: the hero's middle register.
 */
const COLS = 8;
const ROWS = 2;
const STEPS: readonly number[] = [2, 3, 4, 6, 8, 10, 8, 6, 4, 3];

type Block = { motif: Motif; tone: Tone; phase: number };

const BLOCKS: readonly Block[] = Array.from({ length: COLS * ROWS }, (_, i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  return {
    motif: MOTIFS[(col * 3 + row * 5) % MOTIFS.length] ?? 'fret',
    tone: i === 3 || i === 12 ? 'orn' : 'ink',
    phase: (col * 2 + row * 3) % STEPS.length,
  };
});

/** Paired-column reading order: two columns at a time, top to bottom. */
const ORDER: readonly number[] = (() => {
  const order: number[] = [];
  for (let c = 0; c < COLS; c += 2) {
    for (let r = 0; r < ROWS; r++) {
      order.push(r * COLS + c, r * COLS + c + 1);
    }
  }
  return order;
})();

export default function GlyphBand() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (el === null) return;
      const fills = Array.from(el.querySelectorAll<SVGRectElement>('.sfc-glyph-fill'));
      const phases = BLOCKS.map((b) => b.phase);
      let cursor = 0;
      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.call(() => {
        const i = ORDER[cursor % ORDER.length] ?? 0;
        cursor += 1;
        const rect = fills[i];
        const block = BLOCKS[i];
        if (rect === undefined || block === undefined) return;
        const next = ((phases[i] ?? 0) + 1) % STEPS.length;
        phases[i] = next;
        rect.setAttribute('fill', `url(#${patternId(block.tone, STEPS[next] ?? 4)})`);
      }).to({}, { duration: 0.46 });
      playWhileVisible(el, tl);
    },
    { scope: root }
  );

  return (
    <div className='sfc-band' ref={root} aria-hidden='true'>
      {BLOCKS.map((block, i) => (
        <GlyphBlock key={i} motif={block.motif} tone={block.tone} tier={STEPS[block.phase] ?? 4} size={56} />
      ))}
    </div>
  );
}
