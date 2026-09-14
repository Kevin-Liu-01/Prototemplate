import type { CSSProperties, ReactNode } from 'react';

import LightCanvas from './LightCanvas';

/**
 * textile-block: the wall primitives.
 *
 * The page is one wall of square cast blocks laid in courses. A Course is a
 * grid of `--tb-cols` module columns; every child spans whole modules. A
 * Block is a smooth cast face that carries content. A Relief is a region of
 * patterned modules: the motif is a mask tile in the ornament color, the
 * joints are drawn once by the region's own `::after` at the module pitch.
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

type SpanVars = {
  '--c': number;
  '--r'?: number;
  '--c-md'?: number;
  '--r-md'?: number;
  '--c-sm'?: number;
  '--r-sm'?: number;
};

/** The span as custom properties; styles.css reads them per breakpoint. */
export function spanStyle(span: Span): CSSProperties {
  const vars: SpanVars = { '--c': span.c };
  if (span.r !== undefined) vars['--r'] = span.r;
  if (span.cMd !== undefined) vars['--c-md'] = span.cMd;
  if (span.rMd !== undefined) vars['--r-md'] = span.rMd;
  if (span.cSm !== undefined) vars['--c-sm'] = span.cSm;
  if (span.rSm !== undefined) vars['--r-sm'] = span.rSm;
  return vars as CSSProperties;
}

export type Motif = 'cross' | 'fret' | 'step' | 'chevron' | 'meander' | 'rosette' | 'bond' | 'perf';

export type CourseProps = {
  id?: string;
  className?: string;
  label?: string;
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

export type ReliefProps = {
  span: Span;
  motif: Motif;
  className?: string;
  /**
   * Perforated modules let light through: a Bayer field renders behind the
   * concrete layer and shows in the cruciform holes. 'hero' lights from the
   * claim block's side; 'base' lights the dark course from below.
   */
  light?: 'hero' | 'base';
};

/** A region of relief modules. Decorative: hidden from the tree. */
export function Relief({ span, motif, className, light }: ReliefProps) {
  const classes = ['tb-relief', `is-${motif}`];
  if (light && motif !== 'perf') classes.push('is-perf');
  if (className) classes.push(className);
  return (
    <div aria-hidden='true' className={classes.join(' ')} style={spanStyle(span)}>
      {light ? <LightCanvas kind={light} /> : null}
      {light ? <span className='tb-relief-face' /> : null}
      <span className='tb-relief-motif' />
    </div>
  );
}

/** A full-width course of pattern only: the running band between sections. */
export function Frieze({ motif }: { motif: Motif }) {
  return (
    <Course className='is-frieze'>
      <Relief motif={motif} span={{ c: 12, cMd: 8, cSm: 6 }} />
    </Course>
  );
}
