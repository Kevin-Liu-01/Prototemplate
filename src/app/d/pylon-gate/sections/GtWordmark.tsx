import { GtMark } from '@/components/viewer/GtMark';

/**
 * "General Translation" inline in prose: the monogram in the surrounding
 * ink with the name as a visually hidden text node, so the sentence reads
 * aloud and copies as words while the eye sees the mark.
 */
export default function GtWordmark() {
  return (
    <span className='pg-gtw'>
      <GtMark width={28} height={18} />
      <span className='pg-vh'>General Translation</span>
    </span>
  );
}
