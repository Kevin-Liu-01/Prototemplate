/**
 * The social card's layout for next/og (src/app/og/route.tsx), 1200 by
 * 630, in the site's default dark theme. One accent square is the card's
 * only color. Every hairline is drawn once: two rails the full height at
 * x 64 and x 1136, two rules the full width at y 96 and y 534. The
 * hairline color is the solid mix of rgba(242, 242, 240, 0.22) over the
 * ground, so the points where a rail crosses a rule do not draw darker.
 * Square corners, no shadow, no gradient but the mark's own core, and no
 * type under 22 px.
 *
 * Satori (next/og's renderer) lays out with flexbox only: every element
 * with more than one child sets display flex, and the clamped text blocks
 * set display block for lineClamp.
 */
import type { CardInput } from './card-url';

export const CARD_FONTS = { display: 'Inter Display', text: 'Inter Text' } as const;

const GROUND = '#070707';
const TEXT = '#f2f2f0';
const SECONDARY = '#b9bcc3';
const TITANIUM = '#8a8f98';
const ACCENT = '#86a8ff';
/* rgba(242, 242, 240, 0.22) over #070707 */
const HAIR = '#3b3b3a';

const W = 1200;
const H = 630;
const RAIL_L = 64;
const RAIL_R = 1136;
const RULE_T = 96;
const RULE_B = 534;
const PAD = 40;

/** The Prototemplate mark (public/pt-mark.svg) in its dark-scheme ink. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 32 32'>
      <defs>
        <linearGradient id='core' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#4b3bff' />
          <stop offset='0.34' stopColor='#00b3ff' />
          <stop offset='0.58' stopColor='#27d17e' />
          <stop offset='0.8' stopColor='#ffc53b' />
          <stop offset='1' stopColor='#ff3b6b' />
        </linearGradient>
      </defs>
      <rect x='9' y='9' width='14' height='14' fill='url(#core)' />
      <g stroke='#ffffff' strokeWidth='2'>
        <line x1='0' y1='9' x2='32' y2='9' />
        <line x1='0' y1='23' x2='32' y2='23' />
        <line x1='9' y1='0' x2='9' y2='32' />
        <line x1='23' y1='0' x2='23' y2='32' />
      </g>
    </svg>
  );
}

function Line({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: HAIR }} />;
}

export type CardProps = CardInput & {
  /** a direction's dark capture as a data URL, drawn in the right half of the body */
  capture?: string;
};

export function Card({ title, section, description, kind, path, capture }: CardProps) {
  const bodyWidth = RAIL_R - RAIL_L - PAD * 2;
  const textWidth = capture ? Math.floor(bodyWidth / 2) - 24 : bodyWidth;
  const footerRight = kind === 'mirror' ? 'Mirror of generaltranslation.com' : 'General Translation';
  const shownPath = `www.prototemplate.com${path === '/' ? '' : path}`;

  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: W,
        height: H,
        background: GROUND,
        color: TEXT,
        fontFamily: CARD_FONTS.text,
      }}
    >
      <Line x={RAIL_L} y={0} w={1} h={H} />
      <Line x={RAIL_R} y={0} w={1} h={H} />
      <Line x={0} y={RULE_T} w={W} h={1} />
      <Line x={0} y={RULE_B} w={W} h={1} />

      {/* top band: the mark and the name, the section on the right */}
      <div
        style={{
          position: 'absolute',
          left: RAIL_L + PAD,
          top: 0,
          width: RAIL_R - RAIL_L - PAD * 2,
          height: RULE_T,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Mark size={32} />
          <div style={{ display: 'flex', marginLeft: 14, fontFamily: CARD_FONTS.display, fontSize: 26, letterSpacing: -0.3 }}>
            Prototemplate
          </div>
        </div>
        {section ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 8, height: 8, background: ACCENT, marginRight: 12 }} />
            <div style={{ display: 'flex', fontSize: 22, color: TITANIUM }}>{section}</div>
          </div>
        ) : null}
      </div>

      {/* body: the doubled line, the title and the description */}
      <div
        style={{
          position: 'absolute',
          left: RAIL_L + PAD,
          top: RULE_T + 1,
          width: bodyWidth,
          height: RULE_B - RULE_T - 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: textWidth }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 120, marginBottom: 28 }}>
            <div style={{ display: 'flex', height: 1, background: TEXT }} />
            <div style={{ display: 'flex', height: 1, background: TEXT, marginTop: 4 }} />
          </div>
          <div
            style={{
              display: 'block',
              lineClamp: 2,
              fontFamily: CARD_FONTS.display,
              fontSize: 64,
              lineHeight: 1.08,
              letterSpacing: -1.6,
              color: TEXT,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: 'block',
                lineClamp: 2,
                marginTop: 22,
                fontSize: 28,
                lineHeight: 1.36,
                color: SECONDARY,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
        {capture ? (
          <div style={{ display: 'flex', marginLeft: 48, width: bodyWidth - textWidth - 48, height: 340, overflow: 'hidden' }}>
            <img src={capture} alt='' width={bodyWidth - textWidth - 48} height={340} style={{ objectFit: 'cover', objectPosition: 'top' }} />
          </div>
        ) : null}
      </div>

      {/* footer band: the address on www, and GT */}
      <div
        style={{
          position: 'absolute',
          left: RAIL_L + PAD,
          top: RULE_B + 1,
          width: RAIL_R - RAIL_L - PAD * 2,
          height: H - RULE_B - 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 22,
          color: TITANIUM,
        }}
      >
        <div style={{ display: 'flex' }}>{shownPath}</div>
        <div style={{ display: 'flex' }}>{footerRight}</div>
      </div>
    </div>
  );
}
