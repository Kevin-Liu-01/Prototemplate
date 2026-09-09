import './PtMark.css';

/**
 * The Prototemplate mark: the sheet's extending rules crossing into a
 * square, and the square they make filled with the chroma gradient. The
 * markup is the old nav's (src/components/shared/PtNav.tsx at 430e3c7): a
 * 22x22 span, four 1px hairlines at 5px and 16px, and the 10px core at 6px.
 * PtMark.css draws it: the lines in --pt-ink, the core in the five chroma
 * stops (display-p3 where the screen carries it), and the hatched paper
 * fill that fades in over the core while the head link is hovered, so the
 * uncolored mark is still there under the colored one. Kevin asked for the
 * rainbow mark back (DESIGN.md, chrome exceptions). Hover comes from the
 * wrapping link or a parent carrying .pt-mark-host, never from the mark
 * itself, so a mark in a button square (the direction corner) uncolors with
 * the whole tile.
 */
export function PtMark() {
  return (
    <span className='pt-mark' aria-hidden='true'>
      <i className='pt-mark-line is-h is-top' />
      <i className='pt-mark-line is-h is-bot' />
      <i className='pt-mark-line is-v is-l' />
      <i className='pt-mark-line is-v is-r' />
      <i className='pt-mark-fill' />
    </span>
  );
}
