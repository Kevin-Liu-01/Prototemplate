'use client';

import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { createInkField } from './pricing-ink-field';

import './pricing.css';

/** The rain's inventory: currency marks and small amounts across
    scripts — internationality spoken in money. The shipped hero's own
    list (InkField's MONEY constant), carried over verbatim. */
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
 * The money-rain plate: the band-margin ink field mounted as the hero's
 * right weather. Flooded across the whole canvas (clearing 'none'), the
 * pointer play OFF — on the shipped page this field is pure weather that
 * never reacts to or captures the pointer — thinning away leftward on the
 * dither threshold so it disperses into the paper it stands on. The glyph
 * ink rides the host's CSS color and is re-read whenever the theme flips.
 */
function MoneyRain() {
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
        interactive: false,
        edgeFade: 'left',
        dprCap: 1.5,
        glyphColor: style.color,
        displayFamily: style.fontFamily,
        /* wider atlas cells fit the multi-char entries; thinned and
           spread so they never pile up */
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
    <div className='pricing-hero-ink' ref={root} aria-hidden='true'>
      <canvas className='pricing-hero-ink-canvas' ref={canvasRef} />
    </div>
  );
}

/**
 * The shipped /pricing hero, reproduced: the h1, the one-sentence
 * promise, and the single Usage Rates link out to the rate card. Nothing
 * else — the real page states its price posture in three lines and hands
 * the plan cards the rest.
 *
 * The Usage Rates link is the real page's /pricing/usage, resolved against
 * the concept's own base so it stays inside this control.
 */
export default function PricingHero() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <section className='tc-sec pricing-hero'>
      <MoneyRain />
      <div className='pricing-hero-grid'>
        <div className='pricing-hero-copy'>
          <h1>Pricing</h1>
          <p>
            Start for free with usage-based billing. Unlimited projects and
            users on every plan.
          </p>
          <a className='pricing-hero-link' href={`${base}/pricing/usage`}>
            Usage Rates
            <ArrowRight aria-hidden='true' />
          </a>
        </div>
      </div>
    </section>
  );
}
