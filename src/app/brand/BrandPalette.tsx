import { headingId } from './brand-sections';
import COLORS from '../../../public/brand/kit/color/colors.json';
import { BAYER_8 } from '@/lib/dither';

/**
 * The palette section, written in the designer's first person: black and
 * white, the 1-bit dither, and the one blue. The ramp is the 8x8 Bayer
 * screen drawn on the server as one path of lit cells: column c of COLS
 * has tone c / (COLS - 1), and a cell is lit when that tone is over its
 * threshold (m + 0.5) / 64, as in src/lib/dither.ts.
 */
const COLS = 128;
const ROWS = 16;

function rampPath(): string {
  let d = '';
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const tone = x / (COLS - 1);
      if (tone > (BAYER_8[y % 8][x % 8] + 0.5) / 64) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

const RAMP = rampPath();

/** the six chips in reading order, each with its use; the names and values come from the kit's colors.json */
const USES = [
  ['ink', 'text and the logo on paper, and the dark ground'],
  ['paper', 'the light ground, and the one white'],
  ['raised-ink', 'the one second dark surface, for code, config and diffs'],
  ['titanium', 'captions, counters and quiet labels'],
  ['accent', 'the one blue, on paper'],
  ['accent-lift', 'the same blue on ink'],
] as const;

const PALETTE = USES.map(([id, use]) => {
  const color = COLORS.colors.find((c) => c.id === id);
  if (!color) throw new Error(`brand palette: the kit has no ${id}`);
  return { id, name: color.name, hex: color.hex, use };
});

function Ramp({ tone }: { tone: 'is-paper' | 'is-ink' }) {
  return (
    <div className={`ptb-pal-ramp ${tone}`}>
      <svg aria-hidden preserveAspectRatio='none' shapeRendering='crispEdges' viewBox={`0 0 ${COLS} ${ROWS}`}>
        <path d={RAMP} />
      </svg>
    </div>
  );
}

export default function BrandPalette() {
  return (
    <>
      <p>
        I want the identity to stay neutral and scalable: a grid, one type system, one blue, and parts that still
        hold at 16 px and in a terminal. Black and white carry most of that. Almost everything on a General
        Translation surface is ink or paper, or one of the two at an alpha step, and every hairline is titanium at
        an alpha step.
      </p>
      <div className='ptb-pal'>
        {PALETTE.map((chip) => (
          <div className={`ptb-pal-chip is-${chip.id}`} key={chip.id}>
            <i />
            <b>{chip.name}</b>
            <span className='ptb-pal-hex'>{chip.hex}</span>
            <span>{chip.use}</span>
          </div>
        ))}
      </div>

      <h3 id={headingId('black-white-dither-blue', 'black-and-white')}>Black and white</h3>
      <p>
        Ink is #070707 and paper is #ffffff. Dark mode is the same palette remapped: paper becomes #070707, ink
        becomes #f2f2f0, and the hairlines rise a few percent so a 1 px seam still shows between two dark surfaces. I
        keep no second dark palette. Depth comes from lines and material, so no surface carries a shadow, a gradient
        or glass.
      </p>

      <h3 id={headingId('black-white-dither-blue', 'dither')}>Dither</h3>
      <p>
        Texture comes from one device, an ordered Bayer dither. Each square cell is fully inked or empty, so a tone
        is a count of lit cells with no alpha in between. I use the 4 by 4 and 8 by 8 Bayer screens. The 8 by 8 screen
        has 65 even levels, and each level lights every cell the lighter levels light, so regions at different tones
        join into one ramp with no seam.
      </p>
      <figure className='ptb-pal-fig'>
        <Ramp tone='is-paper' />
        <Ramp tone='is-ink' />
        <figcaption>
          The 8 by 8 Bayer screen from empty to full across 128 columns, in ink on paper and in the accent lift on
          ink. Each column lights the cells whose threshold is under its tone.
        </figcaption>
      </figure>
      <p>
        The dithered artifact pictures are where black, white and blue meet. They are photographs and scans of real
        objects, such as the Rosetta Stone, a clay tablet and the Earth, screened one cell per CSS pixel in ink or
        blue. I liked that look of dithered artifacts in black, white and blue, and it set the direction of the
        palette in October 2026.
      </p>
      <figure className='ptb-pal-art'>
        <img
          alt='A globe printed in pale blue Bayer dither on near-black, lit from the upper left, with land and sea told apart by the density of the dots'
          decoding='async'
          height={2048}
          loading='lazy'
          src='/media/gt-globe-dithered.webp'
          width={2048}
        />
        <figcaption>The dithered globe: the sign-in globe through the 8 by 8 Bayer screen in #86a8ff on ink.</figcaption>
      </figure>

      <h3 id={headingId('black-white-dither-blue', 'blue')}>Blue</h3>
      <p>
        The accent is one blue: #2f5ce0 on paper and its lift #86a8ff on ink, because #2f5ce0 reaches only 3.58:1
        on #070707. A page gets one accent, and it marks small things: an active state, the one highlighted part of
        a diagram, a pulse on a line. It never fills a large area and never colours a heading. Blue is also the one
        colour the logo takes besides ink and paper: the accent on paper or the lift on ink.
      </p>
    </>
  );
}
