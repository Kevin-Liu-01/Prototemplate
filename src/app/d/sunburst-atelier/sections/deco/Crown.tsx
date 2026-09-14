/**
 * Crown. The Chrysler crown drawn as stacked semicircular arcs with triangular
 * windows in each band: gold arcs, cream windows, on the page ground. Pure
 * geometry, no gradients or filters; strokes hold their gauge on screen with
 * non-scaling-stroke. Decorative and aria-hidden.
 *
 * C1 home: the hero crown (C1.4), above the h1 with the roundel on its hub;
 * repeated over the dark band lede (C1.5).
 */

type CrownProps = {
  className?: string;
  /** Number of arcs. Windows fill the bands between them. */
  tiers?: number;
};

const W = 360;
const H = 150;
const CX = 180;
const CY = 150;
const R0 = 34;
const STEP = 26;

const f = (n: number) => Math.round(n * 100) / 100;

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [f(CX + r * Math.cos(a)), f(CY - r * Math.sin(a))];
}

function arc(r: number): string {
  const [x0, y0] = polar(r, 180);
  const [x1, y1] = polar(r, 0);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

/** The windows of one band: n radial triangles, apex outward. */
function windows(rIn: number, rOut: number, n: number): string[] {
  const step = 180 / n;
  const half = step * 0.26;
  const out: string[] = [];
  for (let k = 0; k < n; k += 1) {
    const mid = 180 - step * (k + 0.5);
    const [ax, ay] = polar(rOut, mid);
    const [bx, by] = polar(rIn, mid - half);
    const [cx, cy] = polar(rIn, mid + half);
    out.push(`M${ax} ${ay}L${bx} ${by}L${cx} ${cy}Z`);
  }
  return out;
}

export default function Crown({ className, tiers = 5 }: CrownProps) {
  const arcs: string[] = [];
  const panes: string[] = [];
  for (let i = 0; i < tiers; i += 1) {
    const r = R0 + i * STEP;
    arcs.push(arc(r));
    if (i < tiers - 1) {
      panes.push(...windows(r + 5, r + STEP - 5, 5 + i * 2));
    }
  }

  return (
    <svg
      className={className ? `sba-crown ${className}` : 'sba-crown'}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden='true'
      focusable='false'
    >
      <g className='sba-crown-windows'>
        {panes.map((d) => (
          <path d={d} key={d} />
        ))}
      </g>
      <g className='sba-crown-arcs'>
        {arcs.map((d) => (
          <path d={d} key={d} />
        ))}
      </g>
    </svg>
  );
}
