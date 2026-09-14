/**
 * Sunburst. The quarter sunburst in every section head: a gold hub seated in
 * the head's bottom-right corner, three arc rings, and eleven hairline rays,
 * every stroke one gauge under non-scaling-stroke. Pure line geometry drawn
 * once as an inline SVG: no gradients, no tone, no filters. The fan starts
 * 7.5 degrees off both edges so no ray runs parallel within 6px of the rail
 * or the row seam beneath the head. Decorative and aria-hidden.
 *
 * C1 home: section heads (C1.1), in the slot the lucide head icon held.
 */

const S = 220;
const HUB = 18;
const RINGS: readonly number[] = [40, 104, 168];
const RAY_IN = 46;
const RAY_OUT = 214;
const RAYS = 11;
const STEP = 7.5;

const f = (n: number) => Math.round(n * 100) / 100;

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [f(S + r * Math.cos(a)), f(S + r * Math.sin(a))];
}

export default function Sunburst() {
  const rays: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let k = 0; k < RAYS; k += 1) {
    const deg = 180 + STEP * (k + 1);
    const [x1, y1] = polar(RAY_IN, deg);
    const [x2, y2] = polar(RAY_OUT, deg);
    rays.push({ x1, y1, x2, y2 });
  }

  return (
    <svg className='sba-sunburst' viewBox={`0 0 ${S} ${S}`} aria-hidden='true' focusable='false'>
      <circle className='sba-sunburst-hub' cx={S} cy={S} r={HUB} />
      {RINGS.map((r) => (
        <circle className='sba-sunburst-ring' cx={S} cy={S} r={r} key={r} />
      ))}
      {rays.map((ray) => (
        <line className='sba-sunburst-ray' key={`${ray.x1}-${ray.y1}`} {...ray} />
      ))}
    </svg>
  );
}
