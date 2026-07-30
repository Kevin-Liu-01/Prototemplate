/**
 * The machining pass on the hero dial (DESIGN_STANDARD §3 / resend cube parity).
 *
 * LanguageWheel supplies the turned-metal base (conic anisotropy + concentric
 * grooves via the --gtw-* skins in styles.css); this overlay is the milled
 * detail a vector ring cannot fake: a recessed graduation channel with 3°
 * ticks, an engraved locale ring and dial legend (the dial annotating itself
 * with real product values), environment reflections on the rim, and dust
 * specks. Everything is drawn once in the wheel's own 244-space and scales
 * with `--fm-dial`.
 *
 * Artefact law: the engraved strings are real — the locale codes are shipped
 * locales, `118 locales · <1s ota` is the hero stat row's own data.
 */

const MINOR_STEP = 3;
const MAJOR_STEP = 15;
const C = 122;

/** polar → cartesian in the 244 viewBox, rounded to 2dp so the server and
 *  client serialise identical strings (raw trig hydration-mismatches at the
 *  last float digit) */
const pt = (deg: number, r: number): [string, string] => {
  const a = (deg * Math.PI) / 180;
  return [(C + Math.cos(a) * r).toFixed(2), (C + Math.sin(a) * r).toFixed(2)];
};

function Ticks() {
  const ticks = [];
  for (let deg = 0; deg < 360; deg += MINOR_STEP) {
    const major = deg % MAJOR_STEP === 0;
    const [x1, y1] = pt(deg, major ? 107 : 109);
    const [x2, y2] = pt(deg, major ? 118 : 116);
    ticks.push(
      <line
        key={deg}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={major ? 1.1 : 0.65}
        stroke={major ? 'rgba(8,8,10,0.62)' : 'rgba(8,8,10,0.45)'}
      />
    );
  }
  return <g className='fm-dial-ticks'>{ticks}</g>;
}

/** Dust on the metal: fixed specks, brightest on the lit quadrants. */
const SPECKS: [number, number, number, number][] = [
  [58, 113, 0.8, 0.5],
  [96, 118, 0.55, 0.3],
  [143, 108, 0.7, 0.42],
  [201, 115, 0.5, 0.26],
  [238, 120, 0.75, 0.48],
  [287, 111, 0.55, 0.3],
  [322, 117, 0.85, 0.55],
  [349, 109, 0.5, 0.24],
  [26, 88, 0.6, 0.2],
  [172, 91, 0.55, 0.18],
];

export default function DialEngraving() {
  return (
    <svg className='fm-lens-detail' viewBox='0 0 244 244' aria-hidden>
      {/* recessed graduation channel, then the ticks milled into it */}
      <circle
        cx={C}
        cy={C}
        r={112.5}
        fill='none'
        stroke='rgba(0,0,0,0.3)'
        strokeWidth={8}
      />
      <Ticks />

      {/* engraved locale ring on the core's outer face — real shipped locales */}
      <path
        id='fm-dial-ring'
        d='M 122 35 A 87 87 0 1 1 121.98 35'
        fill='none'
        stroke='none'
      />
      <text className='fm-dial-loc fm-dial-text'>
        <textPath href='#fm-dial-ring' startOffset='0' textLength='524' lengthAdjust='spacing'>
          en · es · fr · de · ja · zh · ko · pt · ar · hi · ru · tr · it · nl · pl
        </textPath>
      </text>

      {/* the dial legend: the hero stat row's own values, engraved */}
      <text className='fm-dial-legend fm-dial-text' x={C} y={182} textAnchor='middle'>
        118 locales · &lt;1s ota
      </text>

      {/* environment: a soft window reflection across the bezel, a hard rim
          catchlight top-left, and a dim bounce lower-right */}
      <g className='fm-dial-env'>
        <circle
          cx={C}
          cy={C}
          r={112.5}
          fill='none'
          stroke='rgba(255,255,255,0.14)'
          strokeWidth={16}
          strokeDasharray='168 539'
          strokeLinecap='round'
          transform='rotate(-160 122 122)'
          style={{ filter: 'blur(4px)' }}
        />
        <circle
          cx={C}
          cy={C}
          r={120.4}
          fill='none'
          stroke='rgba(255,255,255,0.55)'
          strokeWidth={1.4}
          strokeDasharray='140 616'
          strokeLinecap='round'
          transform='rotate(-152 122 122)'
          style={{ filter: 'blur(0.5px)' }}
        />
        <circle
          cx={C}
          cy={C}
          r={120.4}
          fill='none'
          stroke='rgba(255,255,255,0.2)'
          strokeWidth={1.1}
          strokeDasharray='78 678'
          strokeLinecap='round'
          transform='rotate(22 122 122)'
          style={{ filter: 'blur(0.6px)' }}
        />
      </g>

      <g className='fm-dial-dust'>
        {SPECKS.map(([deg, r, size, alpha], i) => {
          const [x, y] = pt(deg, r);
          return <circle key={i} cx={x} cy={y} r={size} fill={`rgba(255,255,255,${alpha})`} />;
        })}
      </g>
    </svg>
  );
}
