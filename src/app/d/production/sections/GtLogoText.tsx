import './gt-logo-text.css';

/**
 * GtLogoText, pinned to the shipped component.
 *
 * The shared token at src/app/d/_v0/GtLogoText.tsx renders the mark as
 * role='img' aria-label='GT' with no text node, so five sentences on this
 * page lost the words "General Translation" from their text layer — a
 * screen reader heard "GT" and a copied sentence came out with a hole in
 * it. The shipped component instead carries a visually hidden text node
 * and marks the glyph decorative, which is what this reproduces. Its sheet,
 * gt-logo-text.css, mirrors the shipped one: a 1.14em square mark seated
 * below the baseline. The shared token and its cropped sheet are left
 * alone: the three proposals mount them.
 */
export default function GtLogoText({ className }: { className?: string }) {
  return (
    <span className={className ? `v0-gtword ${className}` : 'v0-gtword'}>
      <span className='v0-gtword-copy'>General Translation</span>
      <i aria-hidden='true' className='v0-gtword-mark' />
    </span>
  );
}
