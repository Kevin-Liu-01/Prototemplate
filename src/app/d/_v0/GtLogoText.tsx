import './gt-logo-text.css';

/**
 * GtLogoText — the standardized inline brand token (founder: "anywhere we
 * say GT, replace that with a standardized gtlogotext component that's
 * like GT logo there instead of pure GT text").
 *
 * The drawn GT monogram, mask-rendered in currentColor so it takes the
 * surrounding copy's exact ink at the surrounding copy's size — body
 * text, dim band voices, and headings all render it in their own voice
 * with no per-site tuning. Screen readers still hear "GT" (the mark is
 * a role=img span with an aria-label; the glyph itself is decoration).
 * Size and baseline live in gt-logo-text.css on em units only.
 */
export default function GtLogoText({ className }: { className?: string }) {
  return (
    <span
      aria-label='GT'
      className={className ? `v0-gtword ${className}` : 'v0-gtword'}
      role='img'
    >
      <i aria-hidden className='v0-gtword-mark' />
    </span>
  );
}
