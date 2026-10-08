import type { CSSProperties, ReactNode } from 'react';

/** One frame of a head badge, keyed for React. */
export type BadgeFrame = { key: string; content: ReactNode };

/** A name in a badge, with the language and direction of its script when it is not English. */
export type BadgeWord = { text: string; lang?: string; dir?: 'rtl' };

/**
 * A book head's badge content (BookHead's `badge`): the frames of what the
 * page holds, cut one to the next every 1.4s. A hidden sizer stacks every
 * frame in one cell, so the box takes the widest frame's width; the strip
 * shows them side by side, each exactly one box wide, and BookView.css
 * steps it one box to the left with steps(n), so the count lives in the
 * frames alone. Under reduced motion the first frame stays and the box
 * takes its width. No frames, no badge.
 */
export function BadgeCycle({ frames }: { frames: readonly BadgeFrame[] }) {
  if (frames.length === 0) return null;
  return (
    <span className='pt-cycle' style={{ '--n': frames.length } as CSSProperties}>
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
 * A badge of names: the page's items by their file name, id or route, in
 * page order. Each name is drawn as generated content (BookView.css), so
 * the frames never join the title's text: copying the title, find in page
 * and the h1 a crawler reads hold the title alone.
 */
export function BadgeWords({ words }: { words: readonly (string | BadgeWord)[] }) {
  const frames = words.map((entry, i): BadgeFrame => {
    const word = typeof entry === 'string' ? { text: entry } : entry;
    return {
      key: `${i}-${word.text}`,
      content: <span className='pt-cycle-word' data-word={word.text} lang={word.lang} dir={word.dir} />,
    };
  });
  return <BadgeCycle frames={frames} />;
}

/** A frame that draws a mark file (under public/) as an alpha mask in the title's ink. */
export function badgeMark(src: string): BadgeFrame {
  return { key: src, content: <span className='pt-cycle-mark' style={{ maskImage: `url(${src})` }} /> };
}
