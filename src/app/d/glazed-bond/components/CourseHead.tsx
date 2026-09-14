import { WedgeNumeral } from './Rosette';

/**
 * Deco home: the course head. A small lapis brick carries the course
 * number as gold wedges (a functional label, the numeral), then the h2 in
 * the display face and one plain sentence under it.
 */
export type CourseHeadProps = {
  n: number;
  title: string;
  sub?: string;
  /** Set when the head sits on lapis; swaps the brick to cream on lapis. */
  glazed?: boolean;
};

export default function CourseHead({ n, title, sub, glazed }: CourseHeadProps) {
  return (
    <div className={glazed ? 'gb-head is-glazed' : 'gb-head'}>
      <span className='gb-head-brick'>
        <WedgeNumeral n={n} label={`Course ${n}`} />
      </span>
      <h2>{title}</h2>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}
