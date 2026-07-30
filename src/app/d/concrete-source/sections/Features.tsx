import { FEATURES, STATS } from '../content';

/** ACT V — the feature grid plus the mono stat row. */
export default function Features() {
  return (
    <section className='section' id='features' aria-label='Platform features'>
      <div className='sec-head'>
        <span className='sec-idx'>[05] THE PLATFORM //</span>
        <h2 className='sec-title slab' data-stamp>
          HEAVY MACHINERY
        </h2>
        <p className='sec-sub' data-stamp>
          Full-stack infrastructure for localizing apps, docs, and websites — for your next
          1,000,000,000 users.
        </p>
      </div>
      <div className='feat-grid'>
        {FEATURES.map((f) => (
          <div className='feat' data-stamp key={f.title}>
            <span className='f-cat'>{f.cat}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
      <div className='stat-row' data-stamp aria-label='By the numbers'>
        {STATS.map(([value, label]) => (
          <div className='stat' key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
