/**
 * Deco layer. C1 homes: 1 (section heads, above the h2), 4 (the hero crown,
 * beside the monogram lockup) and 5 (the dark band head).
 *
 * The setback mark: three bars stepping wider toward the base, the profile
 * of a stepped crown cut to caption scale. It is the direction's one glyph,
 * drawn in the ornament color through currentColor, and it is seated exactly
 * once per home. Decorative, so it is hidden from the accessibility tree.
 */
export default function HeadMark({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `cp-mark ${className}` : 'cp-mark'}
      viewBox='0 0 36 12'
      width={36}
      height={12}
      aria-hidden='true'
      focusable='false'
    >
      <rect x='12' y='0' width='12' height='3' fill='currentColor' />
      <rect x='6' y='4.5' width='24' height='3' fill='currentColor' />
      <rect x='0' y='9' width='36' height='3' fill='currentColor' />
    </svg>
  );
}
