import type { ReactNode } from 'react';

/* House-drawn category diagrams: hairline strokes on a 44-unit grid
   (the viewBox pads one unit around it so edge strokes never clip),
   one clarifying idea per drawing, one accent detail each. Strokes are
   non-scaling so the 56px report seats and the 24px satellite chips
   both keep the 1px hairline. The accent rides --try-mark-accent (the
   report gutter sets it to the working accent; the figure chips leave
   it unset so the fill choreography's currentColor swaps recolor the
   whole drawing). Tiny mono labels are instrument text inside the
   diagram voice, sized to read at the 56px report seat — the chips
   hide them in CSS (illegible at 24px). Every drawing is aria-hidden;
   meaning stays in the row text. */
export const CATEGORY_MARK_IDS = [
  'hreflang',
  'lang',
  'routing',
  'metadata',
  'content',
  'charset',
] as const;

const ACCENT = 'var(--try-mark-accent, currentColor)';
const VE = { vectorEffect: 'non-scaling-stroke' } as const;

/* An instrument label: tiny mono text, never stroked. */
function Label({
  x,
  y,
  size = 7.5,
  anchor = 'middle',
  children,
}: {
  x: number;
  y: number;
  size?: number;
  anchor?: 'start' | 'middle';
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      stroke='none'
      fill='currentColor'
    >
      {children}
    </text>
  );
}

const CATEGORY_ART: Record<string, ReactNode> = {
  /* a page sheet whose head links fan out to three locale chips */
  hreflang: (
    <>
      <rect x='3.5' y='5.5' width='15' height='33' {...VE} />
      <path d='M6.5 10.5h9' {...VE} />
      <path d='M6.5 13.5h5.5' {...VE} />
      <path d='M6.5 18.5h8L30.5 12' {...VE} />
      <path d='M6.5 24.5h8L30.5 22' stroke={ACCENT} {...VE} />
      <path d='M6.5 30.5h8L30.5 32' {...VE} />
      <rect x='30.5' y='7.5' width='11' height='9' {...VE} />
      <rect x='30.5' y='17.5' width='11' height='9' {...VE} />
      <rect x='30.5' y='27.5' width='11' height='9' {...VE} />
      <Label x={36} y={14.3}>
        en
      </Label>
      <Label x={36} y={24.3}>
        es
      </Label>
      <Label x={36} y={34.3}>
        ja
      </Label>
    </>
  ),
  /* an html tag bracket pair carrying its lang attribute */
  lang: (
    <>
      <path d='M13.5 11 6.5 22l7 11' {...VE} />
      <path d='M30.5 11 37.5 22l-7 11' {...VE} />
      <text
        x={22}
        y={21.5}
        fontSize={8}
        textAnchor='middle'
        stroke='none'
        fill={ACCENT}
      >
        lang
      </text>
      <Label x={22} y={30.5} size={7}>
        {'="en"'}
      </Label>
    </>
  ),
  /* one origin box forking into a path, a subdomain and a ccTLD */
  routing: (
    <>
      <rect x='3.5' y='17.5' width='11' height='9' {...VE} />
      <path d='M14.5 22h6.2' {...VE} />
      <circle cx='22.5' cy='22' r='1.8' fill={ACCENT} stroke='none' />
      <path d='M24.3 22c3.5 0 2.7-12.5 6.2-12.5' {...VE} />
      <path d='M24.3 22h6.2' {...VE} />
      <path d='M24.3 22c3.5 0 2.7 12.5 6.2 12.5' {...VE} />
      <Label x={31.4} y={11.9} size={7} anchor='start'>
        /es
      </Label>
      <Label x={31.4} y={24.4} size={7} anchor='start'>
        es.
      </Label>
      <Label x={31.4} y={36.9} size={7} anchor='start'>
        .es
      </Label>
    </>
  ),
  /* the default title bar translated into its locale twin */
  metadata: (
    <>
      <rect x='5.5' y='6.5' width='33' height='10' {...VE} />
      <path d='M9.5 11.5h14' {...VE} />
      <Label x={33} y={14.1} size={7}>
        en
      </Label>
      <path d='M22 19v5.5' stroke={ACCENT} {...VE} />
      <path d='M19.7 22.4 22 24.7l2.3-2.3' stroke={ACCENT} {...VE} />
      <rect x='5.5' y='27.5' width='33' height='10' {...VE} />
      <path d='M9.5 32.5h14' {...VE} />
      <Label x={33} y={35.1} size={7}>
        es
      </Label>
    </>
  ),
  /* latin text beside its CJK twin, tied equal */
  content: (
    <>
      <path d='M4.5 10.5h12' {...VE} />
      <path d='M4.5 16.5h9' {...VE} />
      <path d='M4.5 22.5h12' {...VE} />
      <path d='M4.5 28.5h10' {...VE} />
      <path d='M4.5 34.5h7' {...VE} />
      <rect x='29.5' y='8.5' width='9' height='11' {...VE} />
      <path d='M29.5 14h9' {...VE} />
      <path d='M30 26.5h8' {...VE} />
      <path d='M34 26.5v9' {...VE} />
      <path d='M30 35.5h8' {...VE} />
      <path d='M19.5 20.5h6' stroke={ACCENT} {...VE} />
      <path d='M19.5 24.5h6' stroke={ACCENT} {...VE} />
    </>
  ),
  /* the UTF-8 token over the ltr/rtl direction pair */
  charset: (
    <>
      <rect x='10.5' y='5.5' width='23' height='12' {...VE} />
      <Label x={22} y={14.1} size={7}>
        UTF-8
      </Label>
      <path d='M8 27.5h28' stroke={ACCENT} {...VE} />
      <path d='m33 25 3 2.5-3 2.5' stroke={ACCENT} {...VE} />
      <path d='M36 35.5H8' stroke={ACCENT} {...VE} />
      <path d='m11 33-3 2.5 3 2.5' stroke={ACCENT} {...VE} />
    </>
  ),
};

export default function CategoryMark({
  id,
  className,
}: {
  id: string;
  className: string;
}) {
  return (
    <svg
      className={`try-mark ${className}`}
      viewBox='-1 -1 46 46'
      width={44}
      height={44}
      fill='none'
      stroke='currentColor'
      strokeWidth={1}
      strokeLinecap='square'
      strokeLinejoin='miter'
      aria-hidden='true'
    >
      {CATEGORY_ART[id] ?? CATEGORY_ART.content}
    </svg>
  );
}
