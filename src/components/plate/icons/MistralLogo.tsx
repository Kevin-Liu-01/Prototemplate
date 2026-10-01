import type { BrandMarkProps } from '@/components/plate/icons/brand-mark-props';

// The Mistral mark. The path data is thesvg.org's file for the slug
// `mistral` (the default variant), released there under the MIT license;
// the mark itself is Mistral AI's trademark. The brand variant is the
// file's five bands from gold to red, read from --mark-mistral-1 to -5
// (plate.css; the ratchet counts hex literals in TSX); monochrome draws
// every band in currentColor.

// Each band of the mark, top to bottom, with the file's fill as a token.
const BANDS: ReadonlyArray<{ name: string; d: string; fill: string }> = [
  {
    name: 'band-1',
    d: 'M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z',
    fill: 'var(--mark-mistral-1)',
  },
  {
    name: 'band-2',
    d: 'M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z',
    fill: 'var(--mark-mistral-2)',
  },
  {
    name: 'band-3',
    d: 'M3.428 10.258h17.144v3.428H3.428v-3.428z',
    fill: 'var(--mark-mistral-3)',
  },
  {
    name: 'band-4',
    d: 'M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z',
    fill: 'var(--mark-mistral-4)',
  },
  {
    name: 'band-5',
    d: 'M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z',
    fill: 'var(--mark-mistral-5)',
  },
];

export default function MistralLogo({
  size = 24,
  width,
  height,
  className,
  style,
  variant = 'brand',
  title,
}: BrandMarkProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={width ?? size}
      height={height ?? size}
      fill='none'
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {BANDS.map((band) => (
        <path
          key={band.name}
          d={band.d}
          style={{ fill: variant === 'brand' ? band.fill : 'currentColor' }}
        />
      ))}
    </svg>
  );
}
