import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

const READINGS = [
  ['Tokyo', '31 ms'],
  ['Frankfurt', '12 ms'],
  ['São Paulo', '44 ms'],
  ['Singapore', '28 ms'],
] as const;

/**
 * Delivery, observed: the meridian globe with points of presence on the
 * left, the observation notes on the right — where the translations are
 * served from and how fast they arrive. Latencies in mono; everything
 * else in the page's own voice.
 */
export default function Observation() {
  return (
    <section className='sgb-observation' aria-label='Edge delivery, observed'>
      <div className='sgb-obs-copy'>
        <span className='sgb-kicker'>Observation 01</span>
        <h2>Served from the nearest sky.</h2>
        <p>
          Translations are not fetched from your servers — they are cached at the edge and
          served beside the user. The globe is not a metaphor; it is the deployment map.
        </p>
        <ul className='sgb-readings'>
          {READINGS.map(([pop, ms]) => (
            <li key={pop}>
              <span>{pop}</span>
              <b>{ms}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className='sgb-obs-globe'>
        <EdgeGlobe title='A meridian cage with points of presence, one serving 12 ms away' />
      </div>
    </section>
  );
}
