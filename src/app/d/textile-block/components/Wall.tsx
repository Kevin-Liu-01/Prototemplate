import type { CSSProperties, ReactNode } from 'react';

import LightCanvas from './LightCanvas';
import { PERFORATIONS, RELIEFS } from './reliefs';
import type { PerforableId, ReliefId } from './reliefs';

/**
 * textile-block: the wall primitives.
 *
 * The page is one wall of square cast blocks laid in courses. A Course is a
 * grid of `--tb-cols` module columns; every child spans whole modules. A
 * Block is a smooth cast face that carries content. A Relief is a region of
 * patterned modules keyed to one block of the library: the motif is a mask
 * tile in the ornament color, the joints are drawn once by the region's own
 * `::after` at the module pitch. A Plaque is a section head cast as a
 * tablet inside a block, with the swatch of the relief its course is keyed
 * to. A Frieze is a full-width course of one relief between two content
 * courses.
 *
 * The line law here: every module owns its right and bottom joint (a Block
 * through border-right and border-bottom, a Relief through its tiled joint
 * layer); the wall owns the left and top edge. Nothing else draws a line
 * that parallels a joint.
 */

export type Span = {
  /** modules wide and tall at 12 columns */
  c: number;
  r?: number;
  /** overrides at 8 columns (721px to 1119px) */
  cMd?: number;
  rMd?: number;
  /** overrides at 6 columns (720px and under) */
  cSm?: number;
  rSm?: number;
};

type Vars = Record<string, string | number>;

/** The span as custom properties; styles.css reads them per breakpoint. */
function spanVars(span: Span): Vars {
  const vars: Vars = { '--c': span.c };
  if (span.r !== undefined) vars['--r'] = span.r;
  if (span.cMd !== undefined) vars['--c-md'] = span.cMd;
  if (span.rMd !== undefined) vars['--r-md'] = span.rMd;
  if (span.cSm !== undefined) vars['--c-sm'] = span.cSm;
  if (span.rSm !== undefined) vars['--r-sm'] = span.rSm;
  return vars;
}

export function spanStyle(span: Span): CSSProperties {
  return spanVars(span) as CSSProperties;
}

/** The section head's span and the relief that closes its course row. */
export const HEAD_SPAN: Span = { c: 8, r: 2, cMd: 8, rMd: 2, cSm: 6, rSm: 3 };
export const HEAD_RELIEF_SPAN: Span = { c: 4, r: 2 };

export type CourseProps = {
  id?: string;
  className?: string;
  label: string;
  children: ReactNode;
};

/** One course of the wall: a grid of modules. */
export function Course({ id, className, label, children }: CourseProps) {
  return (
    <section aria-label={label} className={className ? `tb-course ${className}` : 'tb-course'} id={id}>
      {children}
    </section>
  );
}

export type BlockProps = {
  span: Span;
  className?: string;
  id?: string;
  children: ReactNode;
};

/** A smooth cast face set into the wall, spanning whole modules. */
export function Block({ span, className, id, children }: BlockProps) {
  return (
    <div className={className ? `tb-block ${className}` : 'tb-block'} id={id} style={spanStyle(span)}>
      {children}
    </div>
  );
}

type ReliefBase = { span: Span; className?: string };

export type ReliefProps = ReliefBase &
  (
    | { relief: ReliefId; light?: undefined }
    | {
        /** only the two perforable blocks let light through */
        relief: PerforableId;
        /**
         * A Bayer field renders behind the concrete layer and shows in the
         * holes. 'hero' lights from the claim block's side; 'shadow' lights
         * the shadowed course from the floor.
         */
        light: 'hero' | 'shadow';
      }
  );

/** A region of relief modules keyed to one block of the library. Decorative. */
export function Relief(props: ReliefProps) {
  const { span, className } = props;
  const vars = spanVars(span);
  const classes = ['tb-relief', `is-${props.relief}`];
  if (className) classes.push(className);
  if (props.light) {
    const perf = PERFORATIONS[props.relief];
    vars['--tb-perf'] = perf.cut;
    vars['--tb-motif'] = perf.raised;
    classes.push('is-lit');
  } else {
    vars['--tb-motif'] = RELIEFS[props.relief].motif;
  }
  return (
    <div aria-hidden='true' className={classes.join(' ')} style={vars as CSSProperties}>
      {props.light ? <LightCanvas kind={props.light} /> : null}
      {props.light ? <span className='tb-relief-face' /> : null}
      <span className='tb-relief-motif' />
    </div>
  );
}

/** A full-width course of one relief: the running band between sections. */
export function Frieze({ relief }: { relief: ReliefId }) {
  return (
    <div aria-hidden='true' className='tb-course is-frieze'>
      <Relief relief={relief} span={{ c: 12, cMd: 8, cSm: 6 }} />
    </div>
  );
}

export type SwatchProps = { relief: ReliefId; className?: string };

/** One tile of a relief, off the grid: the plaque's key to its course. */
export function Swatch({ relief, className }: SwatchProps) {
  const vars: Vars = { '--tb-motif': RELIEFS[relief].motif };
  return (
    <span
      aria-hidden='true'
      className={className ? `tb-swatch ${className}` : 'tb-swatch'}
      style={vars as CSSProperties}
    >
      <span className='tb-swatch-motif' />
    </span>
  );
}

export type PlaqueProps = {
  /** the course's name, set as the header brick; functional, it keys the legend */
  label: string;
  relief: ReliefId;
  title: string;
  children: ReactNode;
  /** content set under the plaque on the same block face (the acts) */
  after?: ReactNode;
  span?: Span;
  className?: string;
};

/** A section head cast as a plaque: header brick, relief swatch, title, one line. */
export function Plaque({ label, relief, title, children, after, span = HEAD_SPAN, className }: PlaqueProps) {
  return (
    <Block className={className ? `tb-head ${className}` : 'tb-head'} span={span}>
      <span className='tb-brick'>{label}</span>
      <div className='tb-plaque'>
        <Swatch className='tb-plaque-swatch' relief={relief} />
        <div className='tb-plaque-text'>
          <h2 className='tb-h2'>{title}</h2>
          <p>{children}</p>
        </div>
      </div>
      {after}
    </Block>
  );
}
