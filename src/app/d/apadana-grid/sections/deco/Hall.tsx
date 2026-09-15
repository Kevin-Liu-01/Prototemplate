/**
 * apadana-grid: the hypostyle plan, the page's layout primitive.
 *
 * Ornament home: the layout itself (charter G6). Every section is a hall
 * seen from above. A hall is a field of square bays between column axes;
 * the axes are the hairlines between bays (drawn once, as the 1px gaps of a
 * grid over the hairline color, so no two owners ever meet), and a column
 * base sits on every intersection, including the perimeter. The aisle
 * around the field is half a pitch wide, so the walls (the page's rails)
 * stand half a bay from the outer columns, the Apadana's proportion.
 *
 * Base ownership, so no base is drawn twice: each bay draws the base on its
 * top-left corner; each row draws the closing base on its top-right corner;
 * the foot draws the bases along the bottom axis. On narrow screens the rows
 * wrap and the stylesheet hands the closing bases to the wrapped bays
 * (`.apg-bay .apg-col.is-tr`), keeping one owner per intersection.
 *
 * The pitch is `rail / (cols + 1)`; the bays are `pitch` square. The
 * numbers per hall are declared in the section that mounts it and read by
 * the stylesheet through --apg-c, --apg-pitch and --apg-base.
 */
import type { CSSProperties, ReactNode } from 'react';

export type ColumnBaseProps = { className?: string; style?: CSSProperties };

/**
 * One column base in plan: the torus ring, the fluted ring (a dashed circle,
 * each dash one flute), and the shaft. Filled with the ground so the axes
 * end at the ring, the way a column interrupts the paving lines.
 */
export function ColumnBase({ className, style }: ColumnBaseProps) {
  return (
    <span className={className ? `apg-col ${className}` : 'apg-col'} style={style} aria-hidden='true'>
      <svg className='apg-colbase' viewBox='0 0 100 100' focusable='false'>
        <circle className='apg-torus' cx='50' cy='50' r='48' vectorEffect='non-scaling-stroke' />
        <circle
          className='apg-flute'
          cx='50'
          cy='50'
          r='38'
          strokeDasharray='4.98 4.98'
          vectorEffect='non-scaling-stroke'
        />
        <circle className='apg-shaft' cx='50' cy='50' r='24' vectorEffect='non-scaling-stroke' />
      </svg>
    </span>
  );
}

export type BayProps = {
  className?: string;
  children?: ReactNode;
  /** the bay spans this many columns of its row; the axes inside are omitted */
  span?: number;
  lang?: string;
  dir?: 'ltr' | 'rtl';
};

/** One bay of the field; draws the base on its top-left corner. */
export function Bay({ className, children, span, lang, dir }: BayProps) {
  const classes = ['apg-bay'];
  if (span && span > 1) classes.push(`is-span-${span}`);
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')} lang={lang} dir={dir}>
      <ColumnBase className='is-tl' />
      <ColumnBase className='is-tr' />
      {children}
    </div>
  );
}

export type RowProps = { children: ReactNode; className?: string };

/** One row of bays; draws the closing base on its top-right corner. */
export function Row({ children, className }: RowProps) {
  return (
    <div className={className ? `apg-row ${className}` : 'apg-row'}>
      <ColumnBase className='is-tr' />
      {children}
    </div>
  );
}

export type HallProps = {
  /** bays across at the full rail */
  cols: number;
  /** column base diameter in px at the full rail */
  base: number;
  /** aisle width as a fraction of the pitch; half a bay unless a hall says otherwise */
  aisle?: number;
  className?: string;
  children: ReactNode;
  /** anything laid under or over the plan (the floor canvas, the portico's capitals) */
  under?: ReactNode;
  over?: ReactNode;
};

/**
 * The plan: aisle, field, aisle. `children` are Rows. The foot row closes
 * the bottom axis with cols + 1 bases positioned by their index, so it
 * follows whatever the row template becomes at each width. The pitch is
 * `rail / (cols + 2 * aisle)`, resolved by the stylesheet.
 */
export function Hall({ cols, base, aisle = 0.5, className, children, under, over }: HallProps) {
  const style = {
    '--apg-c': cols,
    '--apg-aisle': aisle,
    '--apg-base': `${base}px`,
  } as CSSProperties;
  const feet = [...Array(cols + 1).keys()];
  return (
    <div className={className ? `apg-plan ${className}` : 'apg-plan'} style={style}>
      {under}
      <div className='apg-field'>
        {children}
        <div className='apg-foot' aria-hidden='true'>
          {feet.map((k) => (
            <ColumnBase key={k} className='is-foot' style={{ '--apg-k': k } as CSSProperties} />
          ))}
        </div>
      </div>
      {over}
    </div>
  );
}
