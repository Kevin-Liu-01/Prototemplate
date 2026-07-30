import { Fragment } from 'react';

export type SplitFlapLineProps = {
  text: string;
  /** Pad to this many tiles so a rotating board keeps a stable width. */
  pad?: number;
  className?: string;
  id?: string;
};

/**
 * A single row of split-flap tiles. Rendered server-side as real characters so
 * the board reads before GSAP touches it; `flapEngine` mutates the faces after.
 */
export function SplitFlapLine({ text, pad, className, id }: SplitFlapLineProps) {
  const chars = Array.from(text);
  while (pad && chars.length < pad) chars.push(' ');

  return (
    <span
      className={`ft-board-line${className ? ` ${className}` : ''}`}
      id={id}
      data-flap-line
      data-text={chars.join('')}
    >
      {chars.map((char, i) => (
        <span key={i} className={`ft-flap${char === ' ' ? ' is-blank' : ''}`}>
          <span className='ft-flap-face' data-flap-face>
            {char === ' ' ? '·' : char}
          </span>
        </span>
      ))}
    </span>
  );
}

export type SplitFlapBoardProps = {
  lines: string[];
  className?: string;
  id?: string;
};

/** Stacked flap lines — the hero and closing headlines. */
export default function SplitFlapBoard({ lines, className, id }: SplitFlapBoardProps) {
  return (
    <span className={`ft-board${className ? ` ${className}` : ''}`} id={id} aria-hidden>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <SplitFlapLine text={line} />
        </Fragment>
      ))}
    </span>
  );
}
