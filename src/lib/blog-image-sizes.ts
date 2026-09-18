/**
 * `sizes` for an image that fills the blog column (`--blog-measure`, 720px,
 * or the viewport minus the 20px insets below that). With the candidate
 * ladder in next.config.ts a 1x, 2x or 3x screen gets a variant within a few
 * percent of its device-pixel width, so the browser never shrinks the 3840px
 * masters itself; that shrink is what made the artwork look soft.
 */
export const BLOG_COLUMN_SIZES = '(max-width: 760px) calc(100vw - 40px), 720px';

/** The optimizer passes animated GIFs through, but is skipped so the clip is never re-encoded. */
export const isGif = (src: string) => /\.gif(?:\?|$)/.test(src);
