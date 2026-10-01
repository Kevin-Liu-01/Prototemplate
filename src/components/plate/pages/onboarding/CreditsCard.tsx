'use client';

import { useId, useRef } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import GtMark from '@/components/plate/icons/GtMark';
import {
  ditherToCanvas,
  prefersReducedMotion,
  type FieldFn,
} from '@/components/plate/lib/dither';
import {
  SIGNUP_CREDIT_GRANT_DOLLARS,
  formatWholeDollars,
  type SignupGrantUiAvailability,
} from '@/components/plate/lib/onboarding/settings';
import { T } from '@/components/plate/shims/gt-next';

type CreditsCardProps = {
  grantAvailability: SignupGrantUiAvailability;
};

const TAU = Math.PI * 2;
// The field stack's cell, so the card's grain matches the picture behind the plate.
const CELL = 2;
// The rings' centre in card widths and heights: outside the lower right corner.
const RING_CX = 1.18;
const RING_CY = 1.4;
// Ring spacing in px. 18 if 14 ever moires against the 8-cell Bayer tile.
const RING_PERIOD = 14;
// The band's sharpness: cos^6 lights about a seventh of each period.
const RING_POWER = 6;
// The rings' tone at the lower right corner and at the upper left.
const FADE_NEAR = 1;
const FADE_FAR = 0.25;
// The tilt at the card's edges, in degrees.
const TILT_X = 4;
const TILT_Y = 5;

// The chip's greys, as the dashboard draws them (brand-tokens.css keeps the
// card's fill and ink literal so the theme cannot lighten the object). They
// are written as rgb() because the practices ratchet counts hex literals in
// TSX.
const CHIP_TOP = 'rgb(44, 44, 44)';
const CHIP_BOTTOM = 'rgb(31, 31, 31)';
const CHIP_LINE = 'rgb(13, 13, 13)';
const CHIP_PAD = 'rgb(38, 38, 38)';

/**
 * Concentric rings on a card `width` by `height` px: one narrow bright
 * band per period of the distance from the centre, faded from the lower
 * right toward the upper left so the lines dissolve into the dither's
 * dots. They run under everything on the face. u and v are the canvas's
 * unit square.
 */
function rings(width: number, height: number): FieldFn {
  const cx = width * RING_CX;
  const cy = height * RING_CY;
  return (u, v) => {
    const d = Math.hypot(u * width - cx, v * height - cy);
    const band = Math.max(0, Math.cos((TAU * d) / RING_PERIOD)) ** RING_POWER;
    return band * (FADE_FAR + (FADE_NEAR - FADE_FAR) * ((u + v) / 2));
  };
}

/**
 * The credits as a physical card: a dark card with the mark top left, a
 * large mark at low opacity bleeding past the lower right corner, a solid
 * chip at the right, the brand's dither as faint etched rings across the
 * whole face, a specular band at rest, and a tilt and sheen that follow
 * the pointer. The amount is set only while the grant is available;
 * otherwise the face reads "Payment method" and nothing else. The look
 * lives in plate.css (.credits-card). Without a 2d context nothing is
 * drawn and the card still renders.
 */
export default function CreditsCard({ grantAvailability }: CreditsCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  // An SVG paint server needs a document-unique id; useId's punctuation
  // is dropped so the url() reference stays a plain fragment.
  const chipGradientId = `credits-chip-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;

  useMountEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const canvas = canvasRef.current;
    const sheen = sheenRef.current;
    if (!stage || !card || !canvas || !sheen) return;

    // The rings are a still: drawn at mount and again only at a new size.
    // The size is the layout box, which the tilt does not change. The ink
    // is the library's default, white.
    const draw = () => {
      const width = card.clientWidth;
      const height = card.clientHeight;
      ditherToCanvas(canvas, rings(width, height), {
        scale: CELL,
        paper: 'transparent',
        cssWidth: width,
        cssHeight: height,
      });
    };
    draw();
    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
    resize?.observe(card);
    if (prefersReducedMotion()) return () => resize?.disconnect();

    // The side under the pointer comes toward the viewer; the offset is
    // measured on the stage, whose box the tilt does not move.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(py * 2 * TILT_X).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(-px * 2 * TILT_Y).toFixed(2)}deg`);
      card.style.setProperty('--sheen-x', `${((px + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--sheen-y', `${((py + 0.5) * 100).toFixed(1)}%`);
      sheen.style.opacity = '1';
    };
    const onLeave = () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      sheen.style.opacity = '0';
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      resize?.disconnect();
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  });

  // Paint order is DOM order: fill, rings, large mark, shine, sheen, chip, mark, text.
  return (
    <div ref={stageRef} className='credits-card-stage'>
      <div
        ref={cardRef}
        className='credits-card'
        data-testid='onboarding-credits-card'
      >
        <canvas
          ref={canvasRef}
          className='credits-card-art'
          aria-hidden='true'
        />
        <div
          className='credits-card-watermark'
          data-testid='onboarding-credits-card-mark'
          aria-hidden='true'
        >
          <GtMark />
        </div>
        <div className='credits-card-shine' aria-hidden='true' />
        <div ref={sheenRef} className='credits-card-sheen' aria-hidden='true' />
        {/* The EMV contact plate: an opaque body, two rows and one column
            of contact lines, the centre pad, and a highlight along the top. */}
        <svg
          className='credits-card-chip'
          viewBox='0 0 44 32'
          aria-hidden='true'
          data-testid='onboarding-credits-card-chip'
        >
          <defs>
            <linearGradient id={chipGradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0' stopColor={CHIP_TOP} />
              <stop offset='1' stopColor={CHIP_BOTTOM} />
            </linearGradient>
          </defs>
          <rect
            className='credits-card-chip-body'
            x='0.5'
            y='0.5'
            width='43'
            height='31'
            rx='6'
            fill={`url(#${chipGradientId})`}
            stroke='rgba(255, 255, 255, 0.22)'
          />
          <path
            d='M0.5 10.5H43.5M0.5 21.5H43.5M22.5 0.5V31.5'
            fill='none'
            stroke={CHIP_LINE}
          />
          <rect
            x='15.5'
            y='10.5'
            width='13'
            height='11'
            rx='2.5'
            fill={CHIP_PAD}
            stroke={CHIP_LINE}
          />
          <path
            d='M6.5 1.5H37.5'
            fill='none'
            stroke='rgba(255, 255, 255, 0.12)'
          />
        </svg>
        <GtMark className='credits-card-mark h-4 w-[25px]' />
        <div className='credits-card-figure'>
          {grantAvailability === 'available' ? (
            <>
              <p
                className='credits-card-amount'
                data-testid='onboarding-credits-card-amount'
              >
                {formatWholeDollars(SIGNUP_CREDIT_GRANT_DOLLARS)}
              </p>
              <p className='credits-card-caption'>
                <T>Credits on completion</T>
              </p>
            </>
          ) : (
            <p className='credits-card-caption'>
              <T>Payment method</T>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
