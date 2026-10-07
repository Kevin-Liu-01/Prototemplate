import type { CSSProperties } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

/**
 * The marks the brand head's badge cuts between, in order: the GT
 * monogram, then the register's monograms from /marks (public/marks). A
 * file renders as an alpha mask in the title's ink. brand.css cuts to the
 * next one every 1.4s and holds the monogram under reduced motion; its
 * keyframes are written for these five, so the two change together. The
 * dithered and ASCII monograms stay on /marks: at the badge's size their
 * cells fall under a pixel and read as a gray texture.
 */
const VARIANTS = [
  null,
  '/marks/bar-monogram.svg',
  '/marks/plate-inverted.svg',
  '/marks/two-way.svg',
  '/marks/globe-g.svg',
] as const;

export default function GtVariants() {
  return (
    <span className='ptb-variants'>
      {VARIANTS.map((src, i) => (
        <span
          className={src ? 'ptb-variant is-mask' : 'ptb-variant'}
          key={src ?? 'gt'}
          style={{ '--i': i, ...(src ? { maskImage: `url(${src})` } : null) } as CSSProperties}
        >
          {src ? null : <GtMark />}
        </span>
      ))}
    </span>
  );
}
