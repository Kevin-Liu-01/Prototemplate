import { STATS } from '../content';

/**
 * The stat block grid — the editorial anchor under the hero. Four hard cells,
 * numerals in the slab face, labels in mono. No heading above it: the numbers
 * are the content.
 */
export default function Stats() {
  return (
    <section className='cm-stats' aria-label='By the numbers'>
      {STATS.map((stat) => (
        <div className='cm-stat' key={stat.label}>
          <b className='slab'>{stat.value}</b>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
