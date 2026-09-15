import type { ReactNode } from 'react';

/**
 * One shelf of the case. A shelf is a full-bleed band of the dark case ground
 * closed by one hairline shelf line at its foot; the tablets it carries sit
 * centred on the rail. Under the tablets sits the museum label: the
 * catalogue numeral, the name, and one line of fact about the object.
 */
export type ShelfLabel = { numeral: string; name: string; note: string };

export type ShelfProps = {
  id: string;
  label: ShelfLabel;
  /** A head on the case ground above the tablets (the pricing shelf). */
  head?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Shelf({ id, label, head, children, className }: ShelfProps) {
  return (
    <section className={className ? `ct-shelf ${className}` : 'ct-shelf'} id={id}>
      <div className='ct-shelf-in'>
        {head}
        {children}
        <p className='ct-label'>
          <span className='ct-label-n'>{label.numeral}</span>
          <span className='ct-label-t'>{label.name}</span>
          <span className='ct-label-s'>{label.note}</span>
        </p>
      </div>
    </section>
  );
}

export type TabletProps = {
  size: 'hero' | 'full' | 'small';
  className?: string;
  children: ReactNode;
};

/** A tablet: the fired-clay slab. Its edge is drawn once here; nothing inside draws a parallel border. */
export function Tablet({ size, className, children }: TabletProps) {
  const classes = ['ct-tablet', `is-${size}`, className].filter(Boolean).join(' ');
  return <article className={classes}>{children}</article>;
}
