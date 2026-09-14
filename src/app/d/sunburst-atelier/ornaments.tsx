/**
 * SUNBURST ATELIER ornaments. Every piece is deterministic SVG geometry
 * computed at render time on the server: the hero crown (stacked arcs with
 * triangular ray windows, after the Chrysler crown), the script wheel that
 * sets twelve greetings on the rays of one shared sunburst, and the chevron
 * frieze that divides sections. No images, no client JS, no randomness.
 */

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Point at radius r and angle deg measured from vertical, clockwise positive. */
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
}

/** Circular arc from a0 to a1 (degrees from vertical), drawn clockwise. */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/* ------------------------------------------------------------------ */
/* Hero crown                                                          */
/* ------------------------------------------------------------------ */

type Band = { r0: number; r1: number; half: number; n: number };

/** Five stacked bands. Radius grows outward while the angular span narrows,
    which is what tapers the silhouette into a crown. n is odd in every band
    so a window sits exactly on the vertical axis and symmetry is strict. */
const CROWN_BANDS: readonly Band[] = [
  { r0: 126, r1: 178, half: 84, n: 21 },
  { r0: 192, r1: 248, half: 68, n: 15 },
  { r0: 262, r1: 322, half: 52, n: 11 },
  { r0: 336, r1: 396, half: 36, n: 7 },
  { r0: 410, r1: 466, half: 20, n: 3 },
];

/** Background spoke length follows the crown silhouette. */
function spokeLength(a: number): number {
  const abs = Math.abs(a);
  for (let i = CROWN_BANDS.length - 1; i >= 0; i -= 1) {
    const band = CROWN_BANDS[i];
    if (band && abs <= band.half) return band.r1 + 22;
  }
  return 150;
}

export function SunburstCrown() {
  const cx = 600;
  const cy = 505;

  const spokes: string[] = [];
  for (let a = -87; a <= 87; a += 3) {
    const [x0, y0] = polar(cx, cy, 118, a);
    const [x1, y1] = polar(cx, cy, spokeLength(a), a);
    spokes.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}`);
  }

  const filled: string[] = [];
  const hollow: string[] = [];
  for (const band of CROWN_BANDS) {
    const step = (band.half * 2) / band.n;
    for (let k = 0; k < band.n; k += 1) {
      const a = -band.half + (k + 0.5) * step;
      const w = step * 0.34;
      const [ax, ay] = polar(cx, cy, band.r1 - 6, a);
      const [b1x, b1y] = polar(cx, cy, band.r0 + 5, a - w);
      const [b2x, b2y] = polar(cx, cy, band.r0 + 5, a + w);
      const d = `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${b1x.toFixed(1)} ${b1y.toFixed(1)} L ${b2x.toFixed(1)} ${b2y.toFixed(1)} Z`;
      (k % 2 === 0 ? filled : hollow).push(d);
    }
  }

  return (
    <svg
      className='sa-crown-svg'
      viewBox='0 0 1200 520'
      role='img'
      aria-label='A sunburst crown of stacked gold arcs with triangular ray windows'
      focusable='false'
    >
      <g className='sa-crown-spokes' stroke='var(--sa-gold)' strokeWidth='1' opacity='0.15' fill='none'>
        <path d={spokes.join(' ')} />
      </g>
      <g fill='none' stroke='var(--sa-gold)'>
        {CROWN_BANDS.map((band) => (
          <g key={band.r0}>
            <path d={arcPath(cx, cy, band.r1, -band.half, band.half)} strokeWidth='1.6' opacity='0.9' />
            <path d={arcPath(cx, cy, band.r0, -band.half, band.half)} strokeWidth='1' opacity='0.4' />
          </g>
        ))}
      </g>
      <path d={filled.join(' ')} fill='var(--sa-gold)' opacity='0.82' />
      <path d={hollow.join(' ')} fill='none' stroke='var(--sa-gold)' strokeWidth='1' opacity='0.6' />
      <path
        d={`M ${cx} ${cy - 498} L ${cx + 12} ${cy - 486} L ${cx} ${cy - 474} L ${cx - 12} ${cy - 486} Z`}
        fill='var(--sa-gold)'
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Script wheel                                                        */
/* ------------------------------------------------------------------ */

export type Hello = { text: string; lang: string; tag: string; rtl?: boolean };

/** Twelve real greetings, ordered left to right across the fan. */
export const HELLOS: readonly Hello[] = [
  { text: 'مرحبا', lang: 'ar', tag: 'AR', rtl: true },
  { text: 'Olá', lang: 'pt', tag: 'PT' },
  { text: '안녕하세요', lang: 'ko', tag: 'KO' },
  { text: 'Hallo', lang: 'de', tag: 'DE' },
  { text: 'नमस्ते', lang: 'hi', tag: 'HI' },
  { text: 'Bonjour', lang: 'fr', tag: 'FR' },
  { text: 'Hola', lang: 'es', tag: 'ES' },
  { text: 'こんにちは', lang: 'ja', tag: 'JA' },
  { text: 'Ciao', lang: 'it', tag: 'IT' },
  { text: '你好', lang: 'zh', tag: 'ZH' },
  { text: 'Γεια', lang: 'el', tag: 'EL' },
  { text: 'Merhaba', lang: 'tr', tag: 'TR' },
];

/** Ray length by absolute angle from vertical; alternating lengths give the
    fan its deco rhythm while keeping mirror symmetry exact. */
const WHEEL_RADIUS: Record<string, number> = {
  '7.5': 505,
  '22.5': 405,
  '37.5': 505,
  '52.5': 405,
  '67.5': 380,
  '82.5': 460,
};

export function ScriptWheel() {
  const cx = 600;
  const cy = 648;

  const centerSpokes: string[] = [];
  for (let a = -90; a <= 90; a += 15) {
    const [x0, y0] = polar(cx, cy, 74, a);
    const [x1, y1] = polar(cx, cy, 98, a);
    centerSpokes.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}`);
  }

  return (
    <svg
      className='sa-wheel-svg'
      viewBox='0 0 1200 720'
      role='img'
      aria-label='Twelve greetings in twelve languages radiating from one shared center'
      focusable='false'
    >
      {/* stage line the fan stands on */}
      <line x1='90' y1={cy} x2='1110' y2={cy} stroke='var(--sa-gold)' strokeWidth='1' opacity='0.3' />
      <path d={`M 90 ${cy - 7} L 97 ${cy} L 90 ${cy + 7} L 83 ${cy} Z`} fill='var(--sa-gold)' opacity='0.7' />
      <path d={`M 1110 ${cy - 7} L 1117 ${cy} L 1110 ${cy + 7} L 1103 ${cy} Z`} fill='var(--sa-gold)' opacity='0.7' />

      {/* guide arcs */}
      <path d={arcPath(cx, cy, 240, -84, 84)} fill='none' stroke='var(--sa-gold)' strokeWidth='1' strokeDasharray='2 10' opacity='0.22' />
      <path d={arcPath(cx, cy, 330, -84, 84)} fill='none' stroke='var(--sa-gold)' strokeWidth='1' strokeDasharray='2 10' opacity='0.22' />

      {/* rays with a greeting at each end */}
      {HELLOS.map((hello, i) => {
        const a = -82.5 + i * 15;
        const abs = Math.abs(a);
        const r = WHEEL_RADIUS[String(abs)] ?? 440;
        const [x0, y0] = polar(cx, cy, 110, a);
        const [x1, y1] = polar(cx, cy, r - 12, a);
        const [ex, ey] = polar(cx, cy, r, a);

        let anchor: 'start' | 'middle' | 'end' = 'middle';
        let hx = ex;
        let hy = ey;
        let ty = ey;
        if (abs > 60) {
          /* near horizontal: the label sits centered above the endpoint */
          hy = ey - 38;
          ty = ey - 14;
        } else if (abs > 25) {
          /* mid fan: the label continues outward along the ray */
          anchor = a < 0 ? 'end' : 'start';
          const [lx, ly] = polar(cx, cy, r + 34, a);
          hx = lx;
          hy = ly;
          ty = ly + 26;
        } else {
          /* near vertical: the label continues straight up the ray */
          const [lx, ly] = polar(cx, cy, r + 42, a);
          hx = lx;
          hy = ly;
          ty = ly + 27;
        }

        return (
          <g key={hello.tag}>
            <line x1={x0.toFixed(1)} y1={y0.toFixed(1)} x2={x1.toFixed(1)} y2={y1.toFixed(1)} stroke='var(--sa-gold)' strokeWidth='1.2' opacity='0.55' />
            <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r='3.2' fill='var(--sa-gold)' />
            <text
              className='sa-wheel-hello'
              x={hx.toFixed(1)}
              y={hy.toFixed(1)}
              textAnchor={anchor}
              lang={hello.lang}
              style={hello.rtl ? { direction: 'rtl' } : undefined}
            >
              {hello.text}
            </text>
            <text className='sa-wheel-tag' x={hx.toFixed(1)} y={ty.toFixed(1)} textAnchor={anchor}>
              {hello.tag}
            </text>
          </g>
        );
      })}

      {/* center medallion: the T component every ray renders from */}
      <path d={centerSpokes.join(' ')} stroke='var(--sa-gold)' strokeWidth='1' opacity='0.5' fill='none' />
      <circle cx={cx} cy={cy} r='62' fill='var(--sa-medallion, #0d0b08)' stroke='var(--sa-gold)' strokeWidth='1.5' />
      <circle cx={cx} cy={cy} r='52' fill='none' stroke='var(--sa-gold)' strokeWidth='1' opacity='0.4' />
      <text className='sa-wheel-t' x={cx} y={cy} textAnchor='middle' dominantBaseline='central'>
        T
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Chevron frieze                                                      */
/* ------------------------------------------------------------------ */

/** Section divider: a chevron band between two rules, interrupted by one
    centered diamond. The SVG is wider than any viewport and crops from the
    center, so the pattern stays symmetric at every width. */
export function Frieze() {
  const pts: string[] = [];
  for (let x = 0; x <= 2400; x += 24) {
    pts.push(`${x},${x % 48 === 0 ? 20 : 6}`);
  }
  return (
    <div className='sa-frieze' role='presentation'>
      <svg viewBox='0 0 2400 26' preserveAspectRatio='xMidYMid slice' aria-hidden='true' focusable='false'>
        <line x1='0' y1='1' x2='2400' y2='1' />
        <polyline points={pts.join(' ')} fill='none' />
        <line x1='0' y1='25' x2='2400' y2='25' />
      </svg>
      <span className='sa-frieze-gem' aria-hidden='true' />
    </div>
  );
}
