import type { ReactNode } from 'react';

import { Cartouche } from './deco/Cartouche';
import { StoneGrain } from './deco/StoneGrain';

/**
 * A register of the stele. The head carries the cartouche with the
 * register's numeral and its name; the body is three bands read top to
 * bottom. The head draws the rule under itself; each band after the first
 * draws the rule above itself; the register draws nothing else. The strip
 * between two registers is RegisterRule, which owns both of its edges.
 * Every stone register carries its own grain canvas behind the bands; the
 * gilded register is gold leaf and carries none.
 */
export type RegisterProps = {
  id: string;
  numeral: string;
  name: string;
  /** the gilded register: gold ground, ink cut into it */
  gild?: boolean;
  children: ReactNode;
};

export function Register({ id, numeral, name, gild = false, children }: RegisterProps) {
  return (
    <section className={gild ? 'tr-reg is-gild' : 'tr-reg'} id={id} aria-label={name}>
      {gild ? null : <StoneGrain />}
      <header className='tr-reg-head'>
        <Cartouche numeral={numeral} />
        <p className='tr-reg-name'>{name}</p>
      </header>
      {children}
    </section>
  );
}

export type BandProps = {
  /** the functional label in the band's top corner, in the instrument voice */
  label?: string;
  className?: string;
  children: ReactNode;
};

export function Band({ label, className = '', children }: BandProps) {
  return (
    <div className={`tr-band ${className}`.trim()} data-band>
      {label ? <p className='tr-band-label'>{label}</p> : null}
      {children}
    </div>
  );
}
