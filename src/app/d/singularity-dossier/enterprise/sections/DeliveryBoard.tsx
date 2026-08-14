'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  BOARD_DARK,
  BOARD_LIGHT,
  createBoardField,
  type BoardFieldHandle,
  type BoardInk,
} from './board-field';

/* The terminus field in the landing's blue — quiet cells, announcements
   resolving in the accent, running behind the delivery instruments. */
const FIELD_LIGHT: BoardInk = {
  ...BOARD_LIGHT,
  flash: [37, 99, 235],
  glow: [59, 130, 246],
  glowAlpha: 0.26,
};

const FIELD_DARK: BoardInk = {
  ...BOARD_DARK,
  flash: [134, 168, 255],
  glow: [134, 168, 255],
  glowAlpha: 0.24,
};

/**
 * The board field as the delivery section's ground: locales resolving
 * and dispersing across the wall behind the version rail — the same
 * machine the blog masthead runs, in the page's own accent.
 */
export default function DeliveryBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const doc = document.documentElement;
    const inkFor = () =>
      doc.getAttribute('data-theme') === 'dark' ? FIELD_DARK : FIELD_LIGHT;
    const field: BoardFieldHandle | null = createBoardField(canvas, {
      ink: inkFor(),
    });
    if (!field) return;

    const theme = new MutationObserver(() => field.setInk(inkFor()));
    theme.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      theme.disconnect();
      field.destroy();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className='tce-delivery-board' aria-hidden />
  );
}
