'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createInkField } from './inkField';

/** The rain's inventory: currency marks and small amounts across
    scripts — internationality spoken in money. */
const MONEY: readonly string[] = [
  '$',
  '€',
  '¥',
  '£',
  '₹',
  '₩',
  '₺',
  '₪',
  '฿',
  '¢',
  'kr',
  'zł',
  'R$',
  'CHF',
  '$12',
  '€5',
  '¥500',
  '₹99',
  '£3',
  '₩900',
  '฿35',
  '$0.99',
];

/**
 * The band-margin ink field as the hero's weather: money rising in its
 * set columns, flooded across the plate with the pointer play on —
 * glyphs shiver as the pointer nears, and a click blows the nearest one
 * up before the field heals. Glyphs ride the host's own CSS color
 * (re-inked on theme flips) and thin away leftward on the dither
 * threshold, so the field disperses into the ground it stands on.
 */
export default function MoneyField({
  className,
  canvasClassName,
}: {
  className: string;
  canvasClassName: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const style = getComputedStyle(canvas);
      const field = createInkField({
        canvas,
        clearing: 'none',
        interactive: true,
        edgeFade: 'left',
        dprCap: 1.5,
        glyphColor: style.color,
        displayFamily: style.fontFamily,
        glyphs: MONEY,
        cellWidth: 50,
        colPitch: 72,
        pool: 330,
      });
      if (!field) return;

      const doc = document.documentElement;
      const theme = new MutationObserver(() =>
        field.setGlyphColor(getComputedStyle(canvas).color)
      );
      theme.observe(doc, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      return () => {
        theme.disconnect();
        field.destroy();
      };
    },
    { scope: root }
  );

  return (
    <div className={className} ref={root} aria-hidden='true'>
      <canvas className={canvasClassName} ref={canvasRef} />
    </div>
  );
}
