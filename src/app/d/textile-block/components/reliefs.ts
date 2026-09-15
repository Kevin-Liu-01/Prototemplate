/**
 * textile-block: the relief library.
 *
 * Ornament home: the relief modules themselves, wherever the bond leaves a
 * module without content, and the swatch on every section plaque.
 *
 * Six cast faces, drawn once here and read everywhere: the four Wright
 * textile-block houses as four block patterns, one band from the Aztec
 * Hotel, and the running bond of a base course. Every course of the page is
 * keyed to one relief; the legend course reads the same record, so the
 * pattern on the wall and the pattern named in the legend are one object.
 *
 * Each tile is a 100-unit square emitted as an SVG mask. White is the raised
 * relief; CSS paints it in the ornament color over the patterned ground.
 * Tiles that run (Millard, Greca) extend past the tile edge so the stroke
 * meets the next module without a notch. Two blocks have a perforated
 * variant: `cut` is the concrete that stays (white) with the holes left
 * open, and `raised` is the relief that remains around the holes. Geometry
 * only: crosses, chevrons, bars, steps, meanders, bond.
 */

export type ReliefId = 'ennis' | 'millard' | 'storer' | 'freeman' | 'greca' | 'bond';

/** The two blocks that exist in a perforated variant, for light to pass. */
export type PerforableId = 'ennis' | 'storer';

export type ReliefSpec = {
  id: ReliefId;
  name: string;
  /** the building the block is drawn from */
  source: string;
  /** the geometry, in plain sentences */
  geometry: string;
  /** where the page uses it */
  use: string;
  /** the raised relief as a `url("data:...")` mask tile */
  motif: string;
};

export type Perforation = {
  cut: string;
  raised: string;
};

function tile(inner: string): string {
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${inner}</svg>")`;
}

/* Ennis: a cruciform with four squares held at the corners. */
const ENNIS_CROSS = 'M40 10h20v30h30v20H60v30H40V60H10V40h30z';
const ENNIS_CORNERS = 'M10 10h16v16H10zM74 10h16v16H74zM10 74h16v16H10zM74 74h16v16H74z';

/* Storer: a raised central bar between two columns of slots. */
const STORER_BAR = 'M44 10h12v80H44z';
const STORER_SLOTS = 'M12 12h24v14H12zM12 43h24v14H12zM12 74h24v14H12zM64 12h24v14H64zM64 43h24v14H64zM64 74h24v14H64z';

/* Bond: two courses of stretchers and one of headers, every joint centered on the brick below. */
const BOND_BRICKS = 'M0 0h46v17H0zM54 0h46v17H54zM4 25h92v17H4zM0 50h46v17H0zM54 50h46v17H54zM4 75h92v17H4z';

export const RELIEFS: Record<ReliefId, ReliefSpec> = {
  ennis: {
    id: 'ennis',
    name: 'Ennis block',
    source: 'Ennis House, Los Angeles',
    geometry: 'A cruciform raised on the face. Four squares stay raised at the corners. In the perforated block the cruciform is cut through and light passes.',
    use: 'The claim course and the T proof.',
    motif: tile(`<path fill='white' d='${ENNIS_CROSS}${ENNIS_CORNERS}'/>`),
  },
  millard: {
    id: 'millard',
    name: 'Millard block',
    source: 'Millard House, Pasadena',
    geometry: 'Two chevron courses run across the face and meet the next block without a break.',
    use: 'The frieze under the claim, the trust course, and the pricing file.',
    motif: tile(
      `<path fill='none' stroke='white' stroke-width='8' d='M-5 50.8L25 22L50 46L75 22L105 50.8M-5 82.8L25 54L50 78L75 54L105 82.8'/>`
    ),
  },
  storer: {
    id: 'storer',
    name: 'Storer block',
    source: 'Storer House, Los Angeles',
    geometry: 'A raised central bar between two columns of slots. In the perforated block the slots are cut through.',
    use: 'The platform course and the shadowed course.',
    motif: tile(`<path fill='white' d='${STORER_BAR}${STORER_SLOTS}'/>`),
  },
  freeman: {
    id: 'freeman',
    name: 'Freeman block',
    source: 'Freeman House, Los Angeles',
    geometry: 'A stepped pyramid in elevation. The same setback profile the stack in the shadowed course stands on.',
    use: 'The languages course and the frieze above it.',
    motif: tile(`<path fill='white' d='M10 76h80v14H10zM22 60h56v16H22zM34 44h32v16H34zM42 28h16v16H42zM46 14h8v14H46z'/>`),
  },
  greca: {
    id: 'greca',
    name: 'Greca band',
    source: 'Aztec Hotel, Monrovia',
    geometry: 'A crenellated meander. One continuous line across the whole course.',
    use: 'The bands between the proof, the platform, and the legend.',
    motif: tile(`<path fill='none' stroke='white' stroke-width='8' d='M-5 64H20V36H40V64H60V36H80V64H105'/>`),
  },
  bond: {
    id: 'bond',
    name: 'Running bond',
    source: 'The base course of the wall',
    geometry: 'Brick courses inside one block, each joint centered on the brick below. The joints are the relief.',
    use: 'The footer, the base course the wall stands on.',
    motif: tile(`<path fill='white' fill-rule='evenodd' d='M0 0h100v100H0z${BOND_BRICKS}'/>`),
  },
};

export const PERFORATIONS: Record<PerforableId, Perforation> = {
  ennis: {
    cut: tile(`<path fill='white' fill-rule='evenodd' d='M0 0h100v100H0zM42 14h16v28h28v16H58v28H42V58H14V42h28z'/>`),
    raised: tile(`<path fill='white' d='${ENNIS_CORNERS}'/>`),
  },
  storer: {
    cut: tile(`<path fill='white' fill-rule='evenodd' d='M0 0h100v100H0z${STORER_SLOTS}'/>`),
    raised: tile(`<path fill='white' d='${STORER_BAR}'/>`),
  },
};

/** The legend's order: the four house blocks, then the two bands. */
export const RELIEF_ORDER: readonly ReliefId[] = ['ennis', 'millard', 'storer', 'freeman', 'greca', 'bond'];
