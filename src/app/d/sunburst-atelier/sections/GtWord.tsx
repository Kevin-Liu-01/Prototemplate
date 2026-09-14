import { GtMark } from '@/components/viewer/GtMark';

/**
 * The GT wordmark inline in prose: a visually hidden "General Translation"
 * text node so the sentence reads and copies whole, plus the monogram glyph
 * in currentColor. Same contract as the shipped GtLogoText, rebuilt here
 * because the production folder is not an allowed import root.
 */
export default function GtWord() {
  return (
    <span className='sba-gtword'>
      <span className='sba-gtword-copy'>General Translation</span>
      <GtMark width={25} height={16} />
    </span>
  );
}
