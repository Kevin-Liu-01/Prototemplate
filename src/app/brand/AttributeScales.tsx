/**
 * The brand attribute scales: each pair of opposing characteristics as a
 * ruled track with one seated dot marking where the identity sits, read
 * from the completed system. The chosen pole carries the ink; the note
 * under a track says why. One hairline per row, one dot per truth.
 */
type ScaleRow = {
  left: string;
  right: string;
  /** 0 = fully left, 1 = fully right */
  at: number;
  pick: 'left' | 'right';
  note?: string;
};

export const PERSONALITY: readonly ScaleRow[] = [
  { left: 'Classic', right: 'Modern', at: 0.78, pick: 'right' },
  { left: 'Reserved', right: 'Playful', at: 0.22, pick: 'left' },
  {
    left: 'Minimal',
    right: 'Expressive',
    at: 0.18,
    pick: 'left',
    note: 'minimal chrome; expression lives in the instruments',
  },
  { left: 'Clever', right: 'Warm', at: 0.3, pick: 'left' },
  { left: 'Rational', right: 'Quirky', at: 0.14, pick: 'left' },
  { left: 'Understated', right: 'Confident', at: 0.7, pick: 'right' },
  { left: 'Serious', right: 'Witty', at: 0.3, pick: 'left', note: 'wit as precision, never decoration' },
  {
    left: 'Neutral',
    right: 'Slightly mischievous',
    at: 0.35,
    pick: 'left',
    note: 'a glint is allowed',
  },
];

export const AESTHETIC: readonly ScaleRow[] = [
  { left: 'Clean', right: 'Textured', at: 0.2, pick: 'left', note: 'texture only as ordered dither' },
  { left: 'Soft', right: 'Sharp', at: 0.8, pick: 'right' },
  { left: 'Geometric', right: 'Organic', at: 0.15, pick: 'left' },
  {
    left: 'Light',
    right: 'Dark',
    at: 0.35,
    pick: 'left',
    note: 'paper-first; dark mode is one ink surface',
  },
  { left: 'Muted', right: 'Vibrant', at: 0.25, pick: 'left', note: 'one spectral accent per page' },
  {
    left: 'Flat',
    right: 'Dimensional',
    at: 0.3,
    pick: 'left',
    note: 'depth from lines and material, never shadows',
  },
  { left: 'Monochrome', right: 'Colorful', at: 0.15, pick: 'left' },
  { left: 'Structured', right: 'Playful', at: 0.15, pick: 'left' },
  { left: 'Warm', right: 'Cool', at: 0.7, pick: 'right' },
  { left: 'Elegant', right: 'Fun', at: 0.25, pick: 'left' },
];

export default function AttributeScales({ rows }: { rows: readonly ScaleRow[] }) {
  return (
    <div className='ptb-scales'>
      {rows.map((row) => (
        <div className='ptb-scale' key={`${row.left}-${row.right}`}>
          <span className='ptb-scale-label' data-on={row.pick === 'left'}>
            {row.left}
          </span>
          <span className='ptb-scale-track' aria-hidden='true'>
            <i className='ptb-scale-dot' style={{ left: `${row.at * 100}%` }} />
            {row.note ? <em className='ptb-scale-note'>{row.note}</em> : null}
          </span>
          <span className='ptb-scale-label is-r' data-on={row.pick === 'right'}>
            {row.right}
          </span>
        </div>
      ))}
    </div>
  );
}
