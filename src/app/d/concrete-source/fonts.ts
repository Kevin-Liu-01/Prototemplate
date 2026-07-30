import { Archivo_Black, Space_Mono } from 'next/font/google';

/**
 * The two faces the original document pulled from Google Fonts:
 *
 *   family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Archivo+Black
 *
 * The preservation port cannot keep the <link> (the framework strips them), so
 * the same two families are declared through next/font, which downloads and
 * self-hosts them at build time. Substituting Switzer for Archivo Black changed
 * the measured width of every display run by ~17% and, through the story
 * camera's measured target rects, moved the whole framed demo — so the real
 * faces are load-bearing, not decorative.
 */
/**
 * `adjustFontFallback` is off on both: the metric-adjusted local face next/font
 * would otherwise inject sits ahead of `ui-monospace, monospace` in the stack
 * and captures every glyph Space Mono lacks (Arabic, Hebrew, Cyrillic, CJK, the
 * ▼ arrow), which measured differently from the original's plain fallback chain.
 */
export const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
  adjustFontFallback: false,
});

export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  adjustFontFallback: false,
});

export const concreteFontVariables = `${archivoBlack.variable} ${spaceMono.variable}`;
