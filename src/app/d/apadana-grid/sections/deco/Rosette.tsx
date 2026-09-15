/**
 * apadana-grid: the rosette.
 *
 * Ornament home: section heads (the device over every h2) and the
 * treasury's ledger head. The twelve-petal rosette of the Apadana stair
 * borders reduced to its geometry: a disc, twelve equal circles on a ring,
 * and the ring that binds them. Drawn in the ornament color, one stroke
 * gauge, no fill but the disc.
 */
const PETALS = 12;
const RING = 13;

function petal(k: number): { x: number; y: number } {
  const a = (k / PETALS) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * RING, y: 50 + Math.sin(a) * RING };
}

export type RosetteProps = { size?: number; className?: string };

export function Rosette({ size = 36, className }: RosetteProps) {
  const points = [...Array(PETALS).keys()].map(petal);
  return (
    <svg
      className={className ? `apg-rosette ${className}` : 'apg-rosette'}
      viewBox='30 30 40 40'
      width={size}
      height={size}
      aria-hidden='true'
      focusable='false'
    >
      <circle cx='50' cy='50' r='18.5' fill='none' vectorEffect='non-scaling-stroke' />
      {points.map((p, k) => (
        <circle key={k} cx={p.x} cy={p.y} r='2.7' fill='none' vectorEffect='non-scaling-stroke' />
      ))}
      <circle cx='50' cy='50' r='4.2' className='is-disc' />
    </svg>
  );
}
