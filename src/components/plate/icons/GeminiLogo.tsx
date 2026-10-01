import { useId } from 'react';

import type { BrandMarkProps } from '@/components/plate/icons/brand-mark-props';

// The Gemini mark. The path data and color field are thesvg.org's file for
// the slug `gemini` (the default variant), released there under the MIT
// license; the mark itself is Google's trademark. The brand
// variant keeps the file's construction: the four-point star masks a field
// of blurred blue, yellow, red and green shapes, so the gradient follows
// the star. The file's filters also carry a transparent flood blended
// under each shape before the blur, which changes nothing, so only the
// blur is kept. Every id is namespaced per instance with useId because the
// survey draws the mark in the open list and in the trigger at once.
// The colours are the --mark-gemini-* tokens plate.css defines (the ratchet
// counts hex literals in TSX). Monochrome draws the star alone in
// currentColor.

const STAR =
  'M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z';

// The mask's own fill; mask-type alpha reads only its coverage.
const MASK_FILL = 'var(--mark-gemini-mask)';

type Shape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'path'; d: string };

type Layer = {
  // Names the filter; the file's ids b to h in this order.
  name: string;
  // The filter region in user units.
  x: number;
  y: number;
  width: number;
  height: number;
  // The Gaussian blur's standard deviation in user units.
  blur: number;
  fill: string;
  shape: Shape;
};

// The blurred shapes behind the mask, in paint order.
const LAYERS: ReadonlyArray<Layer> = [
  {
    name: 'blue',
    x: -69,
    y: -46,
    width: 464,
    height: 390,
    blur: 18,
    fill: 'var(--mark-gemini-blue)',
    shape: { kind: 'ellipse', cx: 163, cy: 149, rx: 196, ry: 159 },
  },
  {
    name: 'gold-outer',
    x: -99,
    y: 6,
    width: 265,
    height: 273,
    blur: 32,
    fill: 'var(--mark-gemini-gold)',
    shape: { kind: 'ellipse', cx: 33.5, cy: 142.5, rx: 68.5, ry: 72.5 },
  },
  {
    name: 'gold-inner',
    x: -113,
    y: 12,
    width: 265,
    height: 273,
    blur: 32,
    fill: 'var(--mark-gemini-gold)',
    shape: { kind: 'ellipse', cx: 19.5, cy: 148.5, rx: 68.5, ry: 72.5 },
  },
  {
    name: 'red-lower',
    x: -41.5,
    y: -130,
    width: 299.5,
    height: 329,
    blur: 32,
    fill: 'var(--mark-gemini-red)',
    shape: {
      kind: 'path',
      d: 'M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z',
    },
  },
  {
    name: 'red-upper',
    x: -45,
    y: -153,
    width: 299.5,
    height: 329,
    blur: 32,
    fill: 'var(--mark-gemini-red)',
    shape: {
      kind: 'path',
      d: 'M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z',
    },
  },
  {
    name: 'green-upper',
    x: -41,
    y: 91,
    width: 299.5,
    height: 329,
    blur: 32,
    fill: 'var(--mark-gemini-green)',
    shape: {
      kind: 'path',
      d: 'M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z',
    },
  },
  {
    name: 'green-lower',
    x: -39,
    y: 132,
    width: 299.5,
    height: 329,
    blur: 32,
    fill: 'var(--mark-gemini-green)',
    shape: {
      kind: 'path',
      d: 'M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z',
    },
  },
];

function LayerShape({ layer }: { layer: Layer }) {
  const { shape, fill } = layer;
  if (shape.kind === 'ellipse') {
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        style={{ fill }}
      />
    );
  }
  return <path d={shape.d} style={{ fill }} />;
}

export default function GeminiLogo({
  size = 24,
  width,
  height,
  className,
  style,
  variant = 'brand',
  title,
}: BrandMarkProps) {
  const id = useId();
  const maskId = `${id}mask`;
  const filterId = (layer: Layer) => `${id}${layer.name}`;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 296 298'
      width={width ?? size}
      height={height ?? size}
      fill='none'
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {variant === 'brand' ? (
        <>
          <mask
            id={maskId}
            x='0'
            y='0'
            width='296'
            height='298'
            maskUnits='userSpaceOnUse'
            style={{ maskType: 'alpha' }}
          >
            <path d={STAR} style={{ fill: MASK_FILL }} />
          </mask>
          <g mask={`url(#${maskId})`}>
            {LAYERS.map((layer) => (
              <g key={layer.name} filter={`url(#${filterId(layer)})`}>
                <LayerShape layer={layer} />
              </g>
            ))}
          </g>
          <defs>
            {LAYERS.map((layer) => (
              <filter
                key={layer.name}
                id={filterId(layer)}
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'
              >
                <feGaussianBlur stdDeviation={layer.blur} />
              </filter>
            ))}
          </defs>
        </>
      ) : (
        <path d={STAR} fill='currentColor' />
      )}
    </svg>
  );
}
