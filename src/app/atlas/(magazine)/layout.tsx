import type { ReactNode } from 'react';
import { preload } from 'react-dom';

import './_atlas/styles/tokens.css';
import './_atlas/styles/parts.css';
import './_atlas/styles/plates.css';
import './_atlas/styles/reader.css';
import './_atlas/styles/decorations.css';

/** The faces every press page opens on: its sans and its serif, Katagami Text and Katagami Serif. */
const FACES = ['/fonts/katagami/KatagamiText-latin.woff2', '/fonts/katagami/KatagamiSerif-latin.woff2'];

/* GT Atlas, General Translation's magazine, kept here at /atlas, the path
   it has on generaltranslation.com. Outside the viewer shell, with its own type and
   colors; each route's head comes from seoRoute like every other page. The
   faces it opens on are preloaded, so the text does not change face once it
   has painted. */
export default function PressLayout({ children }: { children: ReactNode }) {
  for (const href of FACES) preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return children;
}
