import { GtMark } from '@/components/viewer/GtMark';

/**
 * "General Translation" inline in prose: the monogram in currentColor plus
 * a visually hidden text node, so the sentence reads aloud and copies as
 * words while the eye sees the mark.
 */
export default function Wordmark() {
  return (
    <span className='gb-wm'>
      <GtMark width={25} height={16} />
      <span className='gb-vh'>General Translation</span>
    </span>
  );
}
