import { Fragment } from 'react';

export type FlapCharsProps = { text: string };

/**
 * The characters of a flapped string, rendered server-side as real text so
 * every board reads before JS runs. Each character is a two-layer cell: an
 * invisible in-flow ghost of the settled glyph holds the measure, and the
 * visible face — the only node lib/flap.ts ever touches — sits absolutely
 * over it, so the line cannot reflow mid-riffle. Words are wrapped so the
 * line can only break at real spaces; a blank is word-space, never a tile.
 *
 * Callers that flip the string wrap these in an element carrying
 * data-tb-line + aria-hidden and pair it with a .tb-sr text twin.
 */
export function FlapChars({ text }: FlapCharsProps) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 ? ' ' : null}
          <span className='tb-word'>
            {Array.from(word).map((ch, i) => (
              <span className='tb-ch' key={i}>
                <span className='tb-ch-g' aria-hidden>
                  {ch}
                </span>
                <span className='tb-ch-f' data-tb-face data-char={ch}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </>
  );
}
