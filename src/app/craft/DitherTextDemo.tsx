import DitherText from '@/app/d/toolchain/diagrams/DitherText';

/**
 * The text-dither plate: the real component three times, one sample per
 * dial. A word at the house grain, a phrase pinned to a smaller display
 * size (the fit default is built for words, so a line of type states its
 * own), and the motif glyph in the plate's accent at a poster-coarse
 * cell — one ramp reading as halftone and as pixel art.
 */
type Sample = {
  id: string;
  text: string;
  /** dither cell edge in plate units */
  cell: number;
  size?: number;
  ink?: string;
  /** the mono caption: which dial this sample states */
  cap: string;
};

const SAMPLES: readonly Sample[] = [
  { id: 'ptc-dt-word', text: 'dither', cell: 3, cap: 'a word · cell 3' },
  { id: 'ptc-dt-line', text: 'ship every language', cell: 2, size: 40, cap: 'a phrase · cell 2' },
  { id: 'ptc-dt-mark', text: '語', cell: 5, ink: 'var(--tc-accent)', cap: 'the motif · accent ink' },
];

export default function DitherTextDemo() {
  return (
    <div className='ptc-dithertext'>
      {SAMPLES.map((sample) => (
        <div className='ptc-dt-cell' key={sample.id}>
          <DitherText
            cell={sample.cell}
            className='ptc-dt-svg'
            id={sample.id}
            ink={sample.ink}
            size={sample.size}
            text={sample.text}
          />
          <span className='ptc-dt-cap'>{sample.cap}</span>
        </div>
      ))}
    </div>
  );
}
