import { Fraunces, Space_Grotesk } from 'next/font/google';

/**
 * The nameplate's two faces, loaded once for the shell so the wordmark in
 * the sidebar head (Sidebar.tsx) reads the same on every route, /docs and
 * /brand included: Fraunces 600 for `proto`, the working model, and Space
 * Grotesk 500 for `template`, the reusable form. Kevin asked for the old
 * nameplate back (DESIGN.md, chrome exceptions), so this is the one place
 * chrome steps outside Inter. The gallery page (src/app/page.tsx) loads its
 * own copies for the hero; each caller applies the `.variable` classes on
 * the element that uses them, so the two instances never meet.
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-grotesk',
  display: 'swap',
});

/** Both variable classes, for the element that carries the wordmark. */
export const brandFontVariables = `${fraunces.variable} ${grotesk.variable}`;
