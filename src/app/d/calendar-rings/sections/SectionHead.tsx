/**
 * calendar-rings: a section head.
 * The section's count as a bar-and-dot numeral in the ornament color (the
 * cells of the band below it), the ring of the disk it unrolls as a mono
 * index where there is one, the title in the display face, and one line
 * of lead copy in Inter.
 */
import { Numeral } from '../diagrams/Numeral';

export type SectionHeadProps = {
  /** The count the band below carries, drawn as a bar-and-dot numeral. */
  count: number;
  /** Which ring of the disk the section unrolls, as a plain index. */
  ring?: string;
  title: string;
  lead?: string;
  id?: string;
};

export function SectionHead({ count, ring, title, lead, id }: SectionHeadProps) {
  return (
    <header className='cr-head'>
      <div className='cr-head-key'>
        <Numeral n={count} size={15} className='cr-head-num' />
        {ring ? <span className='cr-head-ring'>{ring}</span> : null}
      </div>
      <h2 id={id}>{title}</h2>
      {lead ? <p>{lead}</p> : null}
    </header>
  );
}
