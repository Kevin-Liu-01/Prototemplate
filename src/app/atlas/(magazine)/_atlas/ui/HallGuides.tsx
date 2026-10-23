import type { CSSProperties } from 'react';

/* The magazine's front page over a layout sheet. Every guide runs the
   sheet's full width or height, behind everything on the page, along an
   edge the page really has: each magazine's sides, their tops and the
   horizon they stand on; the nameplate's cap height and baseline, the end
   of its word, and the imprint's right side, which is the globe's centre
   line; the globe dial's top and foot; the sheet's margins and the
   controls' cell. Euclid's first construction circles the middle two
   magazines, each circle through the other's centre, and grid references
   letter the magazines' columns and number the rows, as an atlas's index
   does. Each guide is placed by the same measures the page is laid out by
   (rack.css: --edge, --cell, --mag-w, --top, --nameplate, --globe,
   --dial-pad), so the sheet is drawn with the page's first paint and never
   moves: nothing is measured, and a scrolling row does not carry it.
   Decoration only: it takes no pointer and no reader hears it. */

/** The magazines on the rack, whose columns the guides draw on a wide screen. */
type Props = { count: number };

const at = (i: number) => ({ '--i': i }) as CSSProperties;

export default function HallGuides({ count }: Props) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className='gtp-guides' aria-hidden='true'>
      {/* every magazine's two sides and its column's letter, where the row stands still */}
      {items.map((i) => (
        <i key={`m${i}`} className='gtp-g-x gtp-g-mag-l' style={at(i)} />
      ))}
      {items.map((i) => (
        <i key={`n${i}`} className='gtp-g-x gtp-g-mag-r' style={at(i)} />
      ))}
      {items.map((i) => (
        <b key={`c${i}`} className='gtp-g-ref gtp-g-col' style={at(i)}>
          {String.fromCharCode(65 + (i % 26))}
        </b>
      ))}
      <i className='gtp-g-x gtp-g-margin-l' />
      <i className='gtp-g-x gtp-g-margin-r' />
      <i className='gtp-g-x gtp-g-tools-l' />
      <i className='gtp-g-x gtp-g-snap' />
      <i className='gtp-g-x gtp-g-globe' />
      <i className='gtp-g-x gtp-g-word' />
      <i className='gtp-g-y gtp-g-cap' />
      <i className='gtp-g-y gtp-g-base' />
      <i className='gtp-g-y gtp-g-top' />
      <i className='gtp-g-y gtp-g-foot' />
      <i className='gtp-g-y gtp-g-dial-t' />
      <i className='gtp-g-y gtp-g-dial-b' />
      {[1, 2, 3, 4, 5].map((n) => (
        <b key={`r${n}`} className={`gtp-g-ref gtp-g-row gtp-g-row-${n}`}>
          {n}
        </b>
      ))}
      <i className='gtp-g-euclid gtp-g-euclid-a' />
      <i className='gtp-g-euclid gtp-g-euclid-b' />
    </div>
  );
}
