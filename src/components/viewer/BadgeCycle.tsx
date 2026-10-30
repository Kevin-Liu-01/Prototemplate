import type { CSSProperties, ReactNode } from 'react';

/** One frame of a head badge, keyed for React. */
export type BadgeFrame = { key: string; content: ReactNode };

/**
 * The brand head's badge content (BookHead's `badge`): the GT monograms,
 * cut one to the next every 1.4s. /brand is the one page with a badge
 * (Kevin, 2026-10-21). A hidden sizer stacks every
 * frame in one cell, so the box takes the widest frame's width; the strip
 * shows them side by side, each exactly one box wide, and BookView.css
 * steps it one box to the left with steps(n), so the count lives in the
 * frames alone. Under reduced motion the first frame stays and the box
 * takes its width. No frames, no badge.
 */
export function BadgeCycle({ frames }: { frames: readonly BadgeFrame[] }) {
  if (frames.length === 0) return null;
  return (
    <span className='pt-cycle' style={{ '--n': frames.length }}>
      <span className='pt-cycle-size'>
        {frames.map((frame) => (
          <span key={frame.key}>{frame.content}</span>
        ))}
      </span>
      <span className='pt-cycle-strip'>
        {frames.map((frame) => (
          <span className='pt-cycle-frame' key={frame.key}>
            {frame.content}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A frame that draws a mark file (under public/) as an alpha mask in the
 * title's ink. A mark that records its drawn box (src/lib/marks.ts) is cut
 * to it: the frame takes the box's aspect at the badge's height, so a wide
 * drawing in a square file reads as large as a wide file.
 */
export function badgeMark(src: string, crop?: { size: string; position: string; aspect: number }): BadgeFrame {
  const style: CSSProperties = crop
    ? { maskImage: `url(${src})`, maskSize: crop.size, maskPosition: crop.position, width: `round(calc(0.727em * ${Math.round(crop.aspect * 1000) / 1000}), 1px)` }
    : { maskImage: `url(${src})` };
  return { key: src, content: <span className='pt-cycle-mark' style={style} /> };
}
