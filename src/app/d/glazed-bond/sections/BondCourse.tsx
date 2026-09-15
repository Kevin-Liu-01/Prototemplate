'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';

import Chip from '../components/Chip';
import CourseHead from '../components/CourseHead';
import { useLayReveal } from '../components/lay-reveal';
import Rosette from '../components/Rosette';
import Sheen from '../components/Sheen';
import { SOURCE_CLAIM, WALL_TRANSLATIONS } from '../data';
import type { Shaped } from '../data';

/**
 * The T proof as brickwork. A Flemish bond with glazed headers: every
 * brick is a pair, a lapis header (the flag chip) beside a cream stretcher
 * (the string), and alternate courses start with a half-brick closer so no
 * vertical joint runs through two courses. The source string is the one
 * gold brick at the center of the wall, wrapped in its <T> tags; the
 * translations are laid in the bond around it with their `lang` and `dir`.
 * Every brick carries a glaze sheen at its upper arris in ordered dither:
 * lapis on the cream stretchers, cream on the lapis headers and the gold
 * source. The grid places every brick explicitly at two widths (sixteen
 * columns, twelve columns) and stacks them under 720px.
 */

type Slot = readonly [row: number, col: number];

/** Wide wall, sixteen columns: courses of four and three pairs. The source sits at the center. */
const WIDE_SLOTS: readonly Slot[] = [
  [1, 1], [1, 5], [1, 9], [1, 13],
  [2, 3], [2, 7], [2, 11],
  [3, 1], [3, 5], [3, 9], [3, 13],
  [4, 3], [4, 7], [4, 11],
];
const WIDE_SOURCE = 5;

/** Mid wall, twelve columns: courses of three and two pairs, one glazed filler at the end. */
const MID_SLOTS: readonly Slot[] = [
  [1, 1], [1, 5], [1, 9],
  [2, 3], [2, 7],
  [3, 1], [3, 5], [3, 9],
  [4, 3], [4, 7],
  [5, 1], [5, 5], [5, 9],
  [6, 3], [6, 7],
];
const MID_SOURCE = 6;
const MID_FILLER = 14;

/** Half-brick closers at the ends of the offset courses. The last two exist only in the mid wall. */
const CLOSERS: readonly { wide?: Slot; mid: Slot }[] = [
  { wide: [2, 1], mid: [2, 1] },
  { wide: [2, 15], mid: [2, 11] },
  { wide: [4, 1], mid: [4, 1] },
  { wide: [4, 15], mid: [4, 11] },
  { mid: [6, 1] },
  { mid: [6, 11] },
];

type Vars = CSSProperties & Partial<Record<'--gb-wr' | '--gb-wc' | '--gb-mr' | '--gb-mc', number>>;

function place(wide: Slot | undefined, mid: Slot, shift = 0): Vars {
  const vars: Vars = { '--gb-mr': mid[0], '--gb-mc': mid[1] + shift };
  if (wide) {
    vars['--gb-wr'] = wide[0];
    vars['--gb-wc'] = wide[1] + shift;
  }
  return vars;
}

type Brick = { row: Shaped; source: boolean; wide: Slot; mid: Slot };

function layBricks(): Brick[] {
  const wideOpen = WIDE_SLOTS.filter((_, i) => i !== WIDE_SOURCE);
  const midOpen = MID_SLOTS.filter((_, i) => i !== MID_SOURCE && i !== MID_FILLER);
  const wideSource = WIDE_SLOTS[WIDE_SOURCE] ?? [1, 1];
  const midSource = MID_SLOTS[MID_SOURCE] ?? [1, 1];
  const bricks: Brick[] = [{ row: SOURCE_CLAIM, source: true, wide: wideSource, mid: midSource }];
  WALL_TRANSLATIONS.forEach((row, i) => {
    const wide = wideOpen[i];
    const mid = midOpen[i];
    if (wide && mid) bricks.push({ row, source: false, wide, mid });
  });
  return bricks;
}

const BRICKS = layBricks();
const FILLER = MID_SLOTS[MID_FILLER] ?? [6, 7];

export default function BondCourse() {
  const root = useRef<HTMLElement>(null);
  useLayReveal(root, '.gb-brick');

  return (
    <section className='gb-course' id='t' ref={root}>
      <div className='gb-course-in'>
        <CourseHead
          n={1}
          title='One source string in every language'
          sub='Wrap the string in <T>. GT extracts it, translates it, and lays each locale beside the source.'
        />

        <div className='gb-wall' role='list' aria-label='The source string and its translations'>
          {BRICKS.map((brick) => (
            <span className='gb-pair' role='listitem' key={brick.row.lang}>
              <span className='gb-brick gb-brick-h' style={place(brick.wide, brick.mid)}>
                <Sheen ink='cream' />
                <Chip code={brick.row.lang} tell={brick.source} />
              </span>
              <span
                className={brick.source ? 'gb-brick gb-brick-s is-source' : 'gb-brick gb-brick-s'}
                style={place(brick.wide, brick.mid, 1)}
                lang={brick.row.lang}
                dir={brick.row.dir ?? 'ltr'}
              >
                <Sheen ink={brick.source ? 'cream' : 'lapis'} />
                {brick.source ? (
                  <>
                    <code className='gb-t'>&lt;T&gt;</code>
                    <span>{brick.row.text}</span>
                    <code className='gb-t'>&lt;/T&gt;</code>
                  </>
                ) : (
                  <span>{brick.row.text}</span>
                )}
              </span>
            </span>
          ))}

          {CLOSERS.map((closer, i) => (
            <span
              className={closer.wide ? 'gb-brick gb-closer' : 'gb-brick gb-closer is-mid-only'}
              style={place(closer.wide, closer.mid)}
              aria-hidden='true'
              key={i}
            >
              <Sheen ink='lapis' />
            </span>
          ))}

          <span className='gb-brick gb-filler' style={place(undefined, FILLER)} aria-hidden='true'>
            <Sheen ink='turq' />
            <Rosette size={40} />
          </span>
        </div>

        <p className='gb-wall-note'>
          Every brick is one locale build. The glazed header names it; the stretcher carries the
          string as it ships. The gold brick is the source.
        </p>
      </div>
    </section>
  );
}
