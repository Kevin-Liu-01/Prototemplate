/**
 * calendar-rings: a section head.
 * The ring's number as a bar-and-dot numeral in the ornament color, the
 * title in the display face, one line of lead copy in Inter.
 */
import { Numeral } from '../diagrams/Numeral';

export type SectionHeadProps = {
  n: number;
  title: string;
  lead?: string;
  id?: string;
};

export function SectionHead({ n, title, lead, id }: SectionHeadProps) {
  return (
    <header className='cr-head'>
      <Numeral n={n} size={15} className='cr-head-num' />
      <h2 id={id}>{title}</h2>
      {lead ? <p>{lead}</p> : null}
    </header>
  );
}
