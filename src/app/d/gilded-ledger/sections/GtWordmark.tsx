import { GtMark } from '@/components/viewer/GtMark';

/**
 * The GT wordmark inline in prose (BRAND.md section 4): the monogram at the
 * cap height of the line it lives in, with the company name as a visually
 * hidden text node so the sentence still reads "General Translation builds..."
 * to assistive technology and find-in-page.
 */
export default function GtWordmark() {
  return (
    <span className='gl-wm'>
      <GtMark width={23} height={15} />
      <span className='gl-vh'>General Translation</span>
    </span>
  );
}
