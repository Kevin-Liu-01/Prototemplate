/**
 * The relief ornament: geometry only. Rosettes and palmettes are radial
 * repeats, the chevron, the stepped fret, the Greek key and the guilloche
 * are meanders, the sun disk is a circle with its wings reduced to stepped
 * bars and two arcs, the step crown is a ziggurat setback, the niche strip
 * is the palace-facade notch, and the course marks are bar-and-dot
 * numerals. Every band is one SVG pattern stroked or filled in
 * currentColor, so the ornament token on the band sets its ink.
 * Homes: the band courses between panels, the border frames on every
 * raised tablet, the hero crown, the caps over the pricing tablets, the
 * niche under each customer cartouche, and the head of each course.
 */

type BandProps = {
  /** unique per mount: SVG pattern ids are document-global */
  id: string;
  /** a band with ruled content above draws its own top rule too */
  mid?: boolean;
};

const bandClass = (mid: boolean | undefined) => (mid ? 'rr-band is-mid' : 'rr-band');

const f = (n: number) => n.toFixed(2);

/** Lozenge petals as a radial repeat between two radii, centred on (cx, cy). */
function rosettePetals(cx: number, cy: number, inner: number, outer: number, half: number, petals: number) {
  const items: string[] = [];
  const mid = (inner + outer) / 2;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const b = a + Math.PI / 2;
    const px = (radius: number, angle: number) => cx + Math.cos(angle) * radius;
    const py = (radius: number, angle: number) => cy + Math.sin(angle) * radius;
    items.push(
      `M${f(px(outer, a))} ${f(py(outer, a))}L${f(px(mid, a) + Math.cos(b) * half)} ${f(py(mid, a) + Math.sin(b) * half)}L${f(px(inner, a))} ${f(py(inner, a))}L${f(px(mid, a) - Math.cos(b) * half)} ${f(py(mid, a) - Math.sin(b) * half)}Z`
    );
  }
  return items.join('');
}

/** Straight rays between two radii, centred on (cx, cy). */
function rays(cx: number, cy: number, inner: number, outer: number, count: number, offset = 0) {
  const items: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = offset + (i / count) * Math.PI * 2;
    items.push(
      `M${f(cx + Math.cos(a) * inner)} ${f(cy + Math.sin(a) * inner)}L${f(cx + Math.cos(a) * outer)} ${f(cy + Math.sin(a) * outer)}`
    );
  }
  return items.join('');
}

/* ---------- the course bands between panels ---------- */

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
  const fan: string[] = [];
  const cx = 24;
  const cy = 24;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (Math.PI * (i + 1)) / 8;
    fan.push(`M${cx} ${cy}L${f(cx + Math.cos(a) * 18)} ${f(cy + Math.sin(a) * 18)}`);
  }
  return (
    <div className={bandClass(mid)} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='48' height='28' patternUnits='userSpaceOnUse'>
            <path d={fan.join('')} fill='none' stroke='currentColor' strokeWidth='1' />
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

/** Guilloche band: two interlaced waves with a ring at every loop. */
export function GuillocheBand({ id, mid }: BandProps) {
  return (
    <div className={bandClass(mid)} aria-hidden='true'>
      <svg width='100%' height='100%' role='presentation'>
        <defs>
          <pattern id={id} width='48' height='28' patternUnits='userSpaceOnUse'>
            <path d='M0 14C12 2 12 2 24 14S36 26 48 14' fill='none' stroke='currentColor' strokeWidth='1' />
            <path d='M0 14C12 26 12 26 24 14S36 2 48 2' fill='none' stroke='currentColor' strokeWidth='1' />
            <path d='M0 14C12 26 12 26 24 14' fill='none' stroke='currentColor' strokeWidth='1' />
            <circle cx='12' cy='14' r='3.5' fill='none' stroke='currentColor' strokeWidth='1' />
            <circle cx='36' cy='14' r='3.5' fill='none' stroke='currentColor' strokeWidth='1' />
            <circle cx='12' cy='14' r='1' fill='currentColor' />
            <circle cx='36' cy='14' r='1' fill='currentColor' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/* ---------- the border frames on raised tablets ---------- */

export type FrameKind = 'fret' | 'chevron' | 'guilloche' | 'rosette' | 'palmette' | 'key';

/** One 24 by 12 tile per kind, drawn horizontally; the side strips rotate it. */
function FrameTile({ kind }: { kind: FrameKind }) {
  switch (kind) {
    case 'fret':
      return (
        <>
          <path d='M0 10V7H4V4H8V2H16V4H20V7H24V10' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d='M8 10V8H10V6H14V8H16V10' fill='none' stroke='currentColor' strokeWidth='1' />
        </>
      );
    case 'chevron':
      return (
        <>
          <path d='M0 10L6 4L12 10L18 4L24 10' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d='M0 6L6 0L12 6L18 0L24 6' fill='none' stroke='currentColor' strokeWidth='1' />
        </>
      );
    case 'guilloche':
      return (
        <>
          <path d='M0 6C6 0 6 0 12 6S18 12 24 6' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d='M0 6C6 12 6 12 12 6S18 0 24 6' fill='none' stroke='currentColor' strokeWidth='1' />
          <circle cx='6' cy='6' r='1.4' fill='currentColor' />
          <circle cx='18' cy='6' r='1.4' fill='currentColor' />
        </>
      );
    case 'rosette':
      return (
        <>
          <circle cx='6' cy='6' r='4.5' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d={rays(6, 6, 1.5, 3.2, 8)} fill='none' stroke='currentColor' strokeWidth='1' />
          <rect x='16' y='4' width='4' height='4' fill='none' stroke='currentColor' strokeWidth='1' />
          <rect x='17.5' y='5.5' width='1' height='1' fill='currentColor' />
        </>
      );
    case 'palmette':
      return (
        <>
          <path d='M12 11L5 4M12 11L8.5 1.5M12 11L12 0M12 11L15.5 1.5M12 11L19 4' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d='M3 11A9 9 0 0 1 21 11' fill='none' stroke='currentColor' strokeWidth='1' />
        </>
      );
    case 'key':
    default:
      return (
        <>
          <path d='M0 2H11V10H4V5H8V7' fill='none' stroke='currentColor' strokeWidth='1' />
          <path d='M12 2H23V10H16V5H20V7' fill='none' stroke='currentColor' strokeWidth='1' />
        </>
      );
  }
}

function FrameStrip({ id, kind, side }: { id: string; kind: FrameKind; side: 't' | 'b' | 'l' | 'r' }) {
  const vertical = side === 'l' || side === 'r';
  const pid = `${id}-${side}`;
  return (
    <svg className={`rr-frame is-${side}`} width='100%' height='100%' role='presentation'>
      <defs>
        <pattern
          id={pid}
          width='24'
          height='12'
          patternUnits='userSpaceOnUse'
          patternTransform={vertical ? 'rotate(90)' : undefined}
        >
          <FrameTile kind={kind} />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill={`url(#${pid})`} />
    </svg>
  );
}

/**
 * The border band framing a raised tablet: four 12px strips of one
 * geometric repeat, seated inside the face. One owner draws the whole
 * frame; the field inside draws no border.
 */
export function Frame({ id, kind }: { id: string; kind: FrameKind }) {
  return (
    <span className='rr-framing' aria-hidden='true'>
      <FrameStrip id={id} kind={kind} side='t' />
      <FrameStrip id={id} kind={kind} side='b' />
      <FrameStrip id={id} kind={kind} side='l' />
      <FrameStrip id={id} kind={kind} side='r' />
    </span>
  );
}

/* ---------- crowns, caps, notches, numerals ---------- */

/**
 * The hero crown: the sun disk with its wings reduced to three stepped bars
 * a side and two arcs beneath. Pure circle-and-bar geometry.
 */
export function SunDisk() {
  return (
    <svg className='rr-sun' viewBox='0 0 280 44' width='280' height='44' aria-hidden='true'>
      <circle cx='140' cy='18' r='13' fill='none' stroke='currentColor' strokeWidth='1.5' />
      <circle cx='140' cy='18' r='4.5' fill='currentColor' />
      <rect x='20' y='10' width='104' height='3' fill='currentColor' />
      <rect x='36' y='17' width='88' height='3' fill='currentColor' />
      <rect x='52' y='24' width='72' height='3' fill='currentColor' />
      <rect x='156' y='10' width='104' height='3' fill='currentColor' />
      <rect x='156' y='17' width='88' height='3' fill='currentColor' />
      <rect x='156' y='24' width='72' height='3' fill='currentColor' />
      <path d='M118 30A22 22 0 0 0 140 42' fill='none' stroke='currentColor' strokeWidth='1.5' />
      <path d='M162 30A22 22 0 0 1 140 42' fill='none' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  );
}

/** The ziggurat cap over an inscribed tablet: three setbacks, each lit and casting. */
export function StepCrown() {
  return (
    <span className='rr-cap' aria-hidden='true'>
      <span className='rr-cap-step is-3' />
      <span className='rr-cap-step is-2' />
      <span className='rr-cap-step is-1' />
    </span>
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
 * The course marks read 1 to 6 down the page. Decorative; the heading
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

/* ---------- the rosettes the locales are carved into ---------- */

export type RosetteVariant = 'a' | 'b' | 'c';

/** Three rosettes, defined once: twelve lozenges, eight petals, sixteen rays. */
export function RosetteSymbols() {
  return (
    <svg className='rr-vh' width='0' height='0' aria-hidden='true' focusable='false'>
      <symbol id='rr-rosette-a' viewBox='0 0 120 120'>
        <circle cx='60' cy='60' r='57' fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rosettePetals(60, 60, 44, 55.5, 4.2, 12)} fill='currentColor' />
        <circle cx='60' cy='60' r='42' fill='none' stroke='currentColor' strokeWidth='1' />
      </symbol>
      <symbol id='rr-rosette-b' viewBox='0 0 120 120'>
        <circle cx='60' cy='60' r='57' fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rosettePetals(60, 60, 45, 56, 6.5, 8)} fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rosettePetals(60, 60, 47.5, 53.5, 2.4, 8)} fill='currentColor' />
        <circle cx='60' cy='60' r='42' fill='none' stroke='currentColor' strokeWidth='1' />
      </symbol>
      <symbol id='rr-rosette-c' viewBox='0 0 120 120'>
        <circle cx='60' cy='60' r='57' fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rays(60, 60, 43, 56, 16)} fill='none' stroke='currentColor' strokeWidth='1' />
        <path d={rays(60, 60, 50, 56, 16, Math.PI / 16)} fill='none' stroke='currentColor' strokeWidth='1' />
        <circle cx='60' cy='60' r='42' fill='none' stroke='currentColor' strokeWidth='1' />
      </symbol>
    </svg>
  );
}

export function RosetteUse({ variant }: { variant: RosetteVariant }) {
  return (
    <svg className='rr-ros-svg' viewBox='0 0 120 120' aria-hidden='true'>
      <use href={`#rr-rosette-${variant}`} />
    </svg>
  );
}
