import localFont from 'next/font/local';

/**
 * The one loader for the nameplate's two faces: Fraunces 600 for `proto`,
 * the working model, and Space Grotesk 500 for `template`, the reusable
 * form. The sidebar head (Sidebar.tsx) carries them on every route, /docs
 * and /brand included, and the gallery page (src/app/page.tsx) passes the
 * same classes to its article for the hero and the grotesk labels. Kevin
 * asked for the old nameplate back (DESIGN.md, chrome exceptions), so this
 * is the one place chrome steps outside Inter.
 */
export const fraunces = localFont({
  src: [
    { path: '../../public/fonts/google/fraunces-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const grotesk = localFont({
  src: [
    { path: '../../public/fonts/google/space-grotesk-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-grotesk',
  display: 'swap',
});

/**
 * Both variable classes, for the element that carries the wordmark, plus
 * `pt-faces`, where tokens.css declares --pt-face-serif and --pt-face-grot
 * from them (a custom property resolves where it is declared).
 */
export const brandFontVariables = `${fraunces.variable} ${grotesk.variable} pt-faces`;
