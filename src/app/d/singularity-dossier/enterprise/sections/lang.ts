/**
 * The contract shared by every animated language diagram in this folder.
 *
 * The isometric family next door draws infrastructure; this one draws
 * language, so it is built from HTML text rather than SVG paths — real
 * strings in real scripts, shaped and bidi-resolved by the browser, which
 * is the only way Arabic joins its letters and Devanagari forms its
 * conjuncts. Colour is not a prop: the diagrams read `currentColor` and the
 * page's own custom properties, so one ancestor themes the whole set.
 */

export type LangProps = {
  className?: string;
  /** Spend the accent hue on this diagram's one accent element. Default true. */
  accent?: boolean;
  /** Accessible name. Without one the diagram is decorative and hidden. */
  title?: string;
};

/** Root class list: family, variant, accent switch, caller's override. */
export function langClass(
  variant: string,
  accent: boolean,
  className?: string
): string {
  return [
    'lang',
    variant,
    accent ? 'lang-accent-on' : 'lang-accent-off',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

type LangA11y = { role: 'img'; 'aria-label': string } | { 'aria-hidden': true };

/** Named diagrams are images; unnamed ones are decoration and stay out of the tree. */
export function langA11y(title?: string): LangA11y {
  return title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
}

/**
 * When the reader has asked for less movement every diagram freezes at its
 * most legible frame instead of looping. The same frame is what a screenshot
 * should ideally catch, which is why the loops below hold far longer than
 * they travel.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * One element of a collected list, as a tween target. Indexing a list is
 * optional under `noUncheckedIndexedAccess` and GSAP will not take
 * `undefined`, so a miss becomes an empty target list — a tween on nothing —
 * rather than a cast that lies about it.
 */
export function target<T>(list: readonly T[], index: number): T[] {
  const item = list[index];
  return item ? [item] : [];
}

/**
 * Text measurement is only trustworthy once the webfonts have landed, so the
 * diagrams that size themselves to a string build twice: immediately, and
 * again when the fonts resolve.
 */
export function onFontsReady(run: () => void): void {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  document.fonts.ready.then(run).catch(() => undefined);
}
