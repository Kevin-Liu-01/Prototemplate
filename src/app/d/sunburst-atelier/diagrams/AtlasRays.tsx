import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The atlas rays: eight locale chips on the rays of one shared sunburst
 * around the halftone globe. The rays are leaders, drawn from just outside
 * the globe's rim to each chip, so the figure is a labeled diagram rather
 * than ornament: every label is a real BCP-47 tag through LocaleTag, the
 * page's one locale chip system. The chips sit on two arcs, above and below
 * the globe, each held 55 degrees clear of the horizontal, so the widest tag
 * stays inside the square at the narrowest two-column width (the rows fold
 * to one column under 1000px). Under 720px the overlay hides and the same
 * chips reflow as a row beneath the globe (Locales.tsx).
 */

export type AtlasRaysProps = {
  locales: readonly string[];
};

const CX = 50;
const CY = 50;
/* the globe field draws its disc at radius 0.31 of the square; rays start clear of the rim */
const R_IN = 34;
const R_OUT = 41;
const R_TAG = 45;

/* degrees kept clear of the horizontal on each side; the chips fan across
   the remaining arc above the globe and mirror it below */
const H_MARGIN = 55;

const f = (n: number) => Math.round(n * 100) / 100;

function angleFor(i: number, n: number): number {
  const half = Math.ceil(n / 2);
  const onTop = i < half;
  const count = onTop ? half : n - half;
  const k = onTop ? i : i - half;
  const t = count === 1 ? 0.5 : k / (count - 1);
  const top = -180 + H_MARGIN + (180 - 2 * H_MARGIN) * t;
  return onTop ? top : -top;
}

export default function AtlasRays({ locales }: AtlasRaysProps) {
  const n = locales.length;
  return (
    <>
      <svg className='sba-atlas-rays' viewBox='0 0 100 100' aria-hidden='true' focusable='false'>
        {locales.map((code, i) => {
          const a = (angleFor(i, n) * Math.PI) / 180;
          const x1 = f(CX + R_IN * Math.cos(a));
          const y1 = f(CY + R_IN * Math.sin(a));
          const x2 = f(CX + R_OUT * Math.cos(a));
          const y2 = f(CY + R_OUT * Math.sin(a));
          return <line key={code} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </svg>
      {locales.map((code, i) => {
        const deg = angleFor(i, n);
        const a = (deg * Math.PI) / 180;
        const x = f(CX + R_TAG * Math.cos(a));
        const y = f(CY + R_TAG * Math.sin(a));
        const east = Math.cos(a) >= 0;
        const style = east ? { left: `${x}%`, top: `${y}%` } : { right: `${f(100 - x)}%`, top: `${y}%` };
        return (
          <span className='sba-ray-tag' style={style} key={code}>
            <LocaleTag code={code} />
          </span>
        );
      })}
    </>
  );
}
