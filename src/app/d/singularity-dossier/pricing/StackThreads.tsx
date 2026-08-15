'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

/**
 * The board's wiring, measured instead of guessed: each station card
 * runs ONE straight doubled thread to its plate's outward vertex. Card
 * edges come from their real boxes, plate anchors from the platform
 * svg's box mapped through the iso projection, and everything re-draws
 * on resize. The threads stand fully drawn — no arrival animation;
 * the board's data-active attribute re-inks the active run through CSS.
 */

/* Plate anchors in the expanded stack's viewBox space (-96..96 ×
   -188..58): each station plate's outward VERTEX at mid-thickness,
   from the same projection the diagram draws with — plates seat at
   z = 42.2·i, footprint ±52, so a vertex projects to
   x = ±52·2·cos30 ≈ ±90.1, y = −(z + 2.1). */
const SLAB_VB: readonly { x: number; y: number }[] = [
  { x: -90.1, y: -2.1 }, // 01 bottom plate, left vertex
  { x: 90.1, y: -44.3 }, // 02, right vertex
  { x: -90.1, y: -86.5 }, // 03, left vertex
  { x: 90.1, y: -128.7 }, // 04 capstone, right vertex
];

const VB = { x: -96, y: -188, w: 192, h: 246 } as const;

export default function StackThreads() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const svg = svgRef.current;
    const board = svg?.parentElement;
    if (!svg || !board) return;

    const draw = () => {
      const boardBox = board.getBoundingClientRect();
      const mapSvg = board.querySelector('.pricing-stack-map-art svg');
      const cards = board.querySelectorAll<HTMLElement>(
        '.pricing-stack-board-col article'
      );
      if (!mapSvg || cards.length !== 4) return;
      const mapBox = mapSvg.getBoundingClientRect();

      const slabPoint = (i: number) => {
        const anchor = SLAB_VB[i] ?? { x: 0, y: 0 };
        return {
          x: mapBox.left - boardBox.left + ((anchor.x - VB.x) / VB.w) * mapBox.width,
          y: mapBox.top - boardBox.top + ((anchor.y - VB.y) / VB.h) * mapBox.height,
        };
      };

      /* DOM order mirrors plate height: left column [03, 01], right
         column [04, 02] — so every run leaves its card dead level. */
      const order = [
        { card: cards[0], slab: 2, side: 'right' },
        { card: cards[1], slab: 0, side: 'right' },
        { card: cards[2], slab: 3, side: 'left' },
        { card: cards[3], slab: 1, side: 'left' },
      ] as const;

      svg.setAttribute('width', String(boardBox.width));
      svg.setAttribute('height', String(boardBox.height));
      svg.setAttribute('viewBox', `0 0 ${boardBox.width} ${boardBox.height}`);

      const paths = svg.querySelectorAll<SVGPathElement>('path');
      order.forEach((run, i) => {
        if (!run.card) return;
        const box = run.card.getBoundingClientRect();
        const fromX =
          (run.side === 'right' ? box.right : box.left) - boardBox.left;
        const to = slabPoint(run.slab);
        /* one LEVEL run per station — the exit rides the anchor's own
           y (the board's map offset keeps it inside the card) — with
           the doubled twin 5px below */
        const endX = to.x + (run.side === 'right' ? 12 : -12);
        const d = `M${fromX} ${to.y}L${endX} ${to.y}`;
        const dTwin = `M${fromX} ${to.y + 5}L${endX} ${to.y + 5}`;
        paths[i * 2]?.setAttribute('d', d);
        paths[i * 2]?.setAttribute('data-run', String(run.slab + 1));
        paths[i * 2 + 1]?.setAttribute('d', dTwin);
        paths[i * 2 + 1]?.setAttribute('data-run', String(run.slab + 1));
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(board);
    void document.fonts?.ready.then(draw);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <svg ref={svgRef} className='pricing-stack-threads' aria-hidden='true'>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} />
      ))}
    </svg>
  );
}
