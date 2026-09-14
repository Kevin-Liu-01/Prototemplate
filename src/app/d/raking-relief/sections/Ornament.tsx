/**
 * The relief bands and register marks: geometry only. Rosettes and
 * palmettes are radial repeats, the chevron and the stepped fret are
 * meanders, the niche strip is the palace-facade notch, and the course
 * marks are bar-and-dot numerals. Every band is one SVG pattern stroked or
 * filled in currentColor, so the ornament token on the band sets its ink.
 * Home: the band courses between panels and the head of each course.
 */

type BandProps = {
  /** unique per mount: SVG pattern ids are document-global */
  id: string;
  /** a band with ruled content above draws its own top rule too */
  mid?: boolean;
};

const bandClass = (mid: boolean | undefined) => (mid ? 'rr-band is-mid' : 'rr-band');

/** Lozenge petals as a radial repeat between two radii, centred on (cx, cy). */
function rosettePetals(cx: number, cy: number, inner: number, outer: number, half: number, petals: number) {
  const items: string[] = [];
  const mid = (inner + outer) / 2;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const b = a + Math.PI / 2;
    const px = (radius: number, angle: number) => cx + Math.cos(angle) * radius;
    const py = (radius: number, angle: number) => cy + Math.sin(angle) * radius;
    const tipX = px(outer, a);
    const tipY = py(outer, a);
    const baseX = px(inner, a);
    const baseY = py(inner, a);
    const leftX = px(mid, a) + Math.cos(b) * half;
    const leftY = py(mid, a) + Math.sin(b) * half;
    const rightX = px(mid, a) - Math.cos(b) * half;
    const rightY = py(mid, a) - Math.sin(b) * half;
    items.push(
      `M${tipX.toFixed(2)} ${tipY.toFixed(2)}L${leftX.toFixed(2)} ${leftY.toFixed(2)}L${baseX.toFixed(2)} ${baseY.toFixed(2)}L${rightX.toFixed(2)} ${rightY.toFixed(2)}Z`
    );
  }
  return items.join('');
}

/** Assyrian rosette band: a rosette, a square, a rosette. */
export function RosetteBand({ id, mid }: BandProps) {
  return (
    <div className={bandClass(mid)} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='56' height='28' patternUnits='userSpaceOnUse'>
            <circle cx='18' cy='14' r='11' fill='none' stroke='currentColor' strokeWidth='1' />
            <path d={rosettePetals(18, 14, 4, 9.5, 1.3, 8)} fill='currentColor' />
            <circle cx='18' cy='14' r='1.6' fill='currentColor' />
            <rect x='42' y='11' width='6' height='6' fill='none' stroke='currentColor' strokeWidth='1' />
            <rect x='44' y='13' width='2' height='2' fill='currentColor' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Palmette band: a fan of seven rays over a bell, the lotus as geometry. */
export function PalmetteBand({ id, mid }: BandProps) {
  const rays: string[] = [];
  const cx = 24;
  const cy = 24;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (Math.PI * (i + 1)) / 8;
    const x = cx + Math.cos(a) * 18;
    const y = cy + Math.sin(a) * 18;
    rays.push(`M${cx} ${cy}L${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return (
    <div className={bandClass(mid)} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='48' height='28' patternUnits='userSpaceOnUse'>
            <path d={rays.join('')} fill='none' stroke='currentColor' strokeWidth='1' />
            <path d='M6 24A18 18 0 0 1 42 24' fill='none' stroke='currentColor' strokeWidth='1' />
            <path d='M15 24A9 9 0 0 1 33 24' fill='none' stroke='currentColor' strokeWidth='1' />
            <rect x='21' y='24' width='6' height='3' fill='currentColor' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Chevron band: the Guardian Building's stepped-tile zigzag, flattened. */
export function ChevronBand({ id, mid }: BandProps) {
  return (
    <div className={`${bandClass(mid)} is-thin`} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='16' height='14' patternUnits='userSpaceOnUse'>
            <path d='M0 11L8 3L16 11' fill='none' stroke='currentColor' strokeWidth='1' />
            <path d='M4 11L8 7L12 11' fill='none' stroke='currentColor' strokeWidth='1' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Stepped fret: the Mitla greca, one stepped pyramid per tile. */
export function FretBand({ id, mid }: BandProps) {
  return (
    <div className={bandClass(mid)} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='32' height='28' patternUnits='userSpaceOnUse'>
            <path
              d='M0 24V18H4V12H8V6H12V2H20V6H24V12H28V18H32V24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1'
            />
            <path d='M8 24V16H12V10H20V16H24V24' fill='none' stroke='currentColor' strokeWidth='1' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Palace-facade notches under a trust cartouche. */
export function NicheStrip({ id }: { id: string }) {
  return (
    <svg className='rr-niche' width='100%' height='6' aria-hidden='true' role='presentation'>
      <defs>
        <pattern id={id} width='12' height='6' patternUnits='userSpaceOnUse'>
          <path d='M0 6V2H4V0H8V2H12V6' fill='none' stroke='currentColor' strokeWidth='1' />
        </pattern>
      </defs>
      <rect width='100%' height='6' fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Bar-and-dot numeral: a dot is one, a bar is five, dots stack above bars.
 * The course marks read 1 to 8 down the page. Decorative; the heading
 * beside it carries the meaning.
 */
export function BarDot({ n }: { n: number }) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const width = 40;
  const dotY = 6;
  const barTop = dots > 0 ? 18 : 6;
  const height = barTop + bars * 8 + 2;
  const dotGap = 9;
  const dotStart = (width - (dots - 1) * dotGap) / 2;
  return (
    <svg className='rr-mark' width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden='true'>
      {Array.from({ length: dots }, (_, i) => (
        <circle key={`d${i}`} cx={dotStart + i * dotGap} cy={dotY} r='3' fill='currentColor' />
      ))}
      {Array.from({ length: bars }, (_, i) => (
        <rect key={`b${i}`} x='4' y={barTop + i * 8} width={width - 8} height='4' fill='currentColor' />
      ))}
    </svg>
  );
}

/** The large rosette every locale is carved into: two rings, twelve lozenges. */
export function RosetteSymbol() {
  return (
    <svg className='rr-vh' width='0' height='0' aria-hidden='true' focusable='false'>
      <symbol id='rr-rosette' viewBox='0 0 120 120'>
        <circle cx='60' cy='60' r='57' fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rosettePetals(60, 60, 44, 55.5, 4.2, 12)} fill='currentColor' />
        <circle cx='60' cy='60' r='42' fill='none' stroke='currentColor' strokeWidth='1' />
      </symbol>
    </svg>
  );
}

export function RosetteUse() {
  return (
    <svg className='rr-ros-svg' viewBox='0 0 120 120' aria-hidden='true'>
      <use href='#rr-rosette' />
    </svg>
  );
}
