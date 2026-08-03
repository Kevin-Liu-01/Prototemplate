const DIALS = [
  { value: '100+', label: 'languages, one integration', sweep: 0.86 },
  { value: '84 ms', label: 'served at the edge, cached', sweep: 0.62 },
  { value: '3.4 s', label: 'to translate six locales', sweep: 0.44 },
] as const;

const R = 54;
const C = 2 * Math.PI * R;

/**
 * The instrument row: three dial gauges, each a hairline track with a
 * measured accent sweep and the reading in mono at the center. The claims
 * are the same ones the rest of the family makes — here they read as
 * telemetry off the machine.
 */
export default function Instruments() {
  return (
    <section className='sgo-instruments' aria-label='Delivery instruments'>
      <header className='sgo-head'>
        <span className='sgo-kicker'>Telemetry</span>
        <h2>The machine, read off its own dials.</h2>
      </header>
      <div className='sgo-dials'>
        {DIALS.map((d) => (
          <figure className='sgo-dial' key={d.label}>
            <svg viewBox='0 0 128 128' role='img' aria-label={`${d.value} ${d.label}`}>
              <circle className='sgo-dial-track' cx='64' cy='64' r={R} />
              <circle
                className='sgo-dial-sweep'
                cx='64'
                cy='64'
                r={R}
                strokeDasharray={`${C * d.sweep} ${C}`}
                transform='rotate(-90 64 64)'
              />
              <text className='sgo-dial-value' x='64' y='69' textAnchor='middle'>
                {d.value}
              </text>
            </svg>
            <figcaption>{d.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
