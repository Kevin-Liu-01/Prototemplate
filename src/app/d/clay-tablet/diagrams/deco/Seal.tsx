import { GtMark } from '@/components/viewer/GtMark';

/**
 * Home: the hero crown (C1 item 4).
 *
 * The lapis seal impression at the hero tablet's corner: a disk of lapis
 * ringed by radial wedges, carrying the GT monogram in slip. The mark is one
 * ink on a dark surface (A12); the wedges are geometry only (H1). The
 * numeral under the seal is the catalogue number of the tablet and the one
 * hero-crown slot the display face is allowed.
 */
const WEDGES = 18;
const CENTER = 48;
const OUTER = 43;

function ringPath(): string {
  const parts: string[] = [];
  for (let k = 0; k < WEDGES; k++) {
    const a = (k / WEDGES) * Math.PI * 2;
    const rx = Math.cos(a);
    const ry = Math.sin(a);
    const tx = -ry;
    const ty = rx;
    const point = (radius: number, side: number) =>
      `${(CENTER + rx * radius + tx * side).toFixed(1)} ${(CENTER + ry * radius + ty * side).toFixed(1)}`;
    parts.push(
      `M${point(OUTER, 2.7)}L${point(OUTER, -2.7)}L${point(OUTER - 4.6, -0.8)}L${point(OUTER - 11, 0)}L${point(OUTER - 4.6, 0.8)}Z`
    );
  }
  return parts.join('');
}

const RING = ringPath();

export type SealProps = { numeral: string; caption: string };

export default function Seal({ numeral, caption }: SealProps) {
  return (
    <figure className='ct-seal-figure'>
      <div className='ct-seal' role='img' aria-label='General Translation seal'>
        <svg className='ct-seal-ring' viewBox='0 0 96 96' aria-hidden='true'>
          <circle cx={CENTER} cy={CENTER} r={47} />
          <path d={RING} />
        </svg>
        <span className='ct-seal-mark'>
          <GtMark width={36} height={23} />
        </span>
      </div>
      <figcaption className='ct-seal-caption'>
        <span className='ct-seal-numeral'>{numeral}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
