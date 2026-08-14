import {
  frontEdge,
  leftFace,
  plane,
  rightFace,
  roundedPolygon,
  silhouette,
  topFace,
  type IsoBox,
} from './iso';

/**
 * The platform in expanded view — the hero tower's grammar: the accent
 * GT deck grounds the stack and the four stations float above it as
 * full-footprint plates with air between, bottom-up in station order.
 * Each face carries ONE quiet artifact in the front band the plate
 * above leaves visible — the <T> bracket chips around their wrapped
 * line, the en→ja pair, the context keys at the dashboard, the Locadex
 * chip beside its signed hunk. The board's selection re-inks a plate
 * through the active prop (is-hot / is-dim); StackThreads lands its
 * straight doubled runs on the plates' outward vertices.
 */

const SIZE = 104;
const HALF = SIZE / 2;
const THICK = 4.2;
const GAP = 38;
const STEP = THICK + GAP;
/** Raised mini-chips' extrusion above their face. */
const CHIP_H = 3;

const plateZ = (i: number): number => i * STEP;

const plateBoxes: IsoBox[] = [0, 1, 2, 3].map((i) => ({
  x: -HALF,
  y: -HALF,
  z: plateZ(i),
  w: SIZE,
  d: SIZE,
  h: THICK,
}));

const STATIONS = ['01', '02', '03', '04'] as const;

function IsoSolid({
  box,
  active = false,
  state = '',
  onClick,
  children,
}: {
  box: IsoBox;
  active?: boolean;
  state?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const [edgeStart, edgeEnd] = frontEdge(box);

  return (
    <g
      className={`pricing-stack-solid${active ? ' is-active' : ''}${state}`}
      onClick={onClick}
    >
      <path
        className='pricing-stack-solid-left'
        d={roundedPolygon(leftFace(box))}
      />
      <path
        className='pricing-stack-solid-right'
        d={roundedPolygon(rightFace(box))}
      />
      <path
        className='pricing-stack-solid-top'
        d={roundedPolygon(topFace(box))}
      />
      <path
        className='pricing-stack-solid-line'
        d={roundedPolygon(silhouette(box))}
      />
      <path
        className='pricing-stack-solid-line'
        d={`M${edgeStart[0]} ${edgeStart[1]}L${edgeEnd[0]} ${edgeEnd[1]}`}
      />
      {children}
    </g>
  );
}

/** Flat artwork seated into a box's top face, in plan coordinates local
    to the face's own origin. */
function Seat({
  box,
  children,
}: {
  box: IsoBox;
  children: React.ReactNode;
}) {
  return (
    <g transform={plane(box.z + box.h, box.x, box.y)}>{children}</g>
  );
}

/** A raised mini-chip standing on a plate's face — the tower's chip
    extrusion at this diagram's scale. lx/ly are face-local plan. */
function Chip({
  plate,
  lx,
  ly,
  w,
  d,
  accent = false,
  children,
}: {
  plate: IsoBox;
  lx: number;
  ly: number;
  w: number;
  d: number;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  const box: IsoBox = {
    x: plate.x + lx,
    y: plate.y + ly,
    z: plate.z + plate.h,
    w,
    d,
    h: CHIP_H,
  };
  return (
    <g className={`pricing-stack-chip${accent ? ' is-accent' : ''}`}>
      <path
        className='pricing-stack-chip-hull'
        d={roundedPolygon(silhouette(box))}
      />
      <path
        className='pricing-stack-chip-top'
        d={roundedPolygon(topFace(box))}
      />
      {children}
    </g>
  );
}

/** Artwork lying in a chip's top face, centered on the chip. */
function ChipSeat({
  plate,
  lx,
  ly,
  children,
}: {
  plate: IsoBox;
  lx: number;
  ly: number;
  children: React.ReactNode;
}) {
  return (
    <g
      transform={plane(
        plate.z + plate.h + CHIP_H,
        plate.x + lx,
        plate.y + ly
      )}
    >
      {children}
    </g>
  );
}

/** The station number stands at the face's left vertex — the corner the
    plate above never covers. */
function Station({ index }: { index: number }) {
  return (
    <text className='pricing-stack-station' x='7' y='90'>
      {STATIONS[index]}
    </text>
  );
}

/** The doubled thread lying in a face, between two plan points — two
    parallel strokes one plan unit either side of the run. */
function Duo({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <path
      className='pricing-stack-duo'
      d={`M${x1} ${y1 - 1}L${x2} ${y2 - 1}M${x1} ${y1 + 1}L${x2} ${y2 + 1}`}
      vectorEffect='non-scaling-stroke'
    />
  );
}

/** The capstone's diff hunk: del rows over add rows, signed. */
const DIFF_ROWS: readonly { ly: number; w: number; tone: 'del' | 'add' }[] = [
  { ly: 56, w: 22, tone: 'del' },
  { ly: 63, w: 16, tone: 'del' },
  { ly: 76, w: 26, tone: 'add' },
  { ly: 83, w: 18, tone: 'add' },
];

export default function StackDiagram({
  active = null,
  onSelect,
}: {
  /** The selected station (1..4); its plate re-inks hot, the rest dim. */
  active?: number | null;
  /** Fired when a plate is pressed — the board's toggle. */
  onSelect?: (station: number) => void;
}) {
  const p01 = plateBoxes[0] as IsoBox;
  const p02 = plateBoxes[1] as IsoBox;
  const p03 = plateBoxes[2] as IsoBox;
  const p04 = plateBoxes[3] as IsoBox;

  const state = (station: number): string =>
    active == null ? '' : active === station ? ' is-hot' : ' is-dim';

  return (
    <div className='pricing-stack-map'>
      <span id='pricing-stack-map-title' className='sr-only'>
        General Translation connects internationalization, translation APIs,
        context, and agent automation in one platform.
      </span>

      <div
        className='pricing-stack-map-art'
        role='img'
        aria-labelledby='pricing-stack-map-title'
      >
        <svg viewBox='-96 -188 192 246' aria-hidden='true'>
          <defs>
            <mask
              id='pricing-stack-locadex-mask'
              maskUnits='userSpaceOnUse'
              x='-8'
              y='-8'
              width='16'
              height='16'
              style={{ maskType: 'alpha' }}
            >
              <image
                href='/brand/locadex-mark.svg'
                x='-8'
                y='-8'
                width='16'
                height='16'
              />
            </mask>
          </defs>

          {/* 01 — internationalization: the bracket pair wrapping the
              accent line, one run, doubled joints */}
          <IsoSolid box={p01} state={state(1)} onClick={onSelect ? () => onSelect(1) : undefined}>
            <Seat box={p01}>
              <Station index={0} />
              <Duo x1={35} y1={80.5} x2={43} y2={80.5} />
              <rect className='pricing-stack-bar is-accent' x='44' y='78' width='21' height='5' rx='1.2' />
              <Duo x1={66} y1={80.5} x2={73} y2={80.5} />
            </Seat>
            <Chip plate={p01} lx={10} ly={72} w={24} d={17} />
            <ChipSeat plate={p01} lx={22} ly={80.5}>
              <text
                className='pricing-stack-chip-glyph'
                textAnchor='middle'
                dominantBaseline='central'
              >
                {'<T>'}
              </text>
            </ChipSeat>
            <Chip plate={p01} lx={74} ly={72} w={24} d={17} />
            <ChipSeat plate={p01} lx={86} ly={80.5}>
              <text
                className='pricing-stack-chip-glyph'
                textAnchor='middle'
                dominantBaseline='central'
              >
                {'</T>'}
              </text>
            </ChipSeat>
          </IsoSolid>

          {/* 02 — translation APIs: source into delivery, one doubled
              run on a shared centerline */}
          <IsoSolid box={p02} state={state(2)} onClick={onSelect ? () => onSelect(2) : undefined}>
            <Seat box={p02}>
              <Station index={1} />
              <Duo x1={35} y1={81.5} x2={61} y2={81.5} />
            </Seat>
            <Chip plate={p02} lx={12} ly={74} w={22} d={15} />
            <ChipSeat plate={p02} lx={23} ly={81.5}>
              <text
                className='pricing-stack-chip-glyph'
                textAnchor='middle'
                dominantBaseline='central'
              >
                en
              </text>
            </ChipSeat>
            <Chip plate={p02} lx={62} ly={74} w={26} d={15} accent>
            </Chip>
            <ChipSeat plate={p02} lx={75} ly={81.5}>
              <text
                className='pricing-stack-chip-glyph'
                textAnchor='middle'
                dominantBaseline='central'
              >
                ja
              </text>
            </ChipSeat>
          </IsoSolid>

          {/* 03 — context platform: the keys wired into the dashboard,
              each on its own doubled run */}
          <IsoSolid box={p03} state={state(3)} onClick={onSelect ? () => onSelect(3) : undefined}>
            <Seat box={p03}>
              <Station index={2} />
              <rect className='pricing-stack-key' x='14' y='62' width='12' height='7.5' rx='1' />
              <rect className='pricing-stack-key' x='14' y='74' width='12' height='7.5' rx='1' />
              <rect className='pricing-stack-key' x='14' y='86' width='12' height='7.5' rx='1' />
              <Duo x1={27} y1={65.75} x2={53} y2={70} />
              <Duo x1={27} y1={77.75} x2={53} y2={78} />
              <Duo x1={27} y1={89.75} x2={53} y2={86} />
            </Seat>
            <Chip plate={p03} lx={54} ly={66} w={34} d={24} />
            <ChipSeat plate={p03} lx={54} ly={66}>
              <circle className='pricing-stack-lamp is-r' cx='5' cy='4.5' r='1.2' />
              <circle className='pricing-stack-lamp is-y' cx='8.4' cy='4.5' r='1.2' />
              <circle className='pricing-stack-lamp is-g' cx='11.8' cy='4.5' r='1.2' />
              <rect className='pricing-stack-bar' x='5' y='10' width='19' height='4' rx='1' />
              <rect className='pricing-stack-bar is-accent' x='5' y='16.5' width='13' height='4' rx='1' />
            </ChipSeat>
          </IsoSolid>

          {/* 04 — agent automations: Locadex beside its signed hunk */}
          <IsoSolid box={p04} state={state(4)} onClick={onSelect ? () => onSelect(4) : undefined}>
            <Seat box={p04}>
              <Station index={3} />
              {DIFF_ROWS.map(({ ly, tone }) => (
                <g key={`sign-${ly}`} className={`pricing-stack-sign is-${tone}`}>
                  <rect x='46' y={ly + 1.6} width='3.2' height='1.2' />
                  {tone === 'add' ? (
                    <rect x='47' y={ly + 0.6} width='1.2' height='3.2' />
                  ) : null}
                </g>
              ))}
            </Seat>
            {DIFF_ROWS.map(({ ly, w, tone }) => {
              const box: IsoBox = {
                x: p04.x + 54,
                y: p04.y + ly,
                z: p04.z + p04.h,
                w,
                d: 4,
                h: 1.6,
              };
              return (
                <g key={`diff-${ly}`} className={`pricing-stack-diff is-${tone}`}>
                  <path
                    className='pricing-stack-diff-hull'
                    d={roundedPolygon(silhouette(box), 1)}
                  />
                  <path
                    className='pricing-stack-diff-top'
                    d={roundedPolygon(topFace(box), 1)}
                  />
                </g>
              );
            })}
            <Seat box={p04}>
              <Duo x1={41} y1={73} x2={45} y2={73} />
            </Seat>
            <Chip plate={p04} lx={12} ly={59} w={28} d={28} />
            <ChipSeat plate={p04} lx={26} ly={74}>
              <rect
                className='pricing-stack-mark'
                x='-8'
                y='-8'
                width='16'
                height='16'
                mask='url(#pricing-stack-locadex-mask)'
              />
            </ChipSeat>
          </IsoSolid>
        </svg>
      </div>
    </div>
  );
}
