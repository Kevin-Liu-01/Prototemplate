import type { ReactNode } from 'react';
import { preload } from 'react-dom';

import './_press/press.css';
import './_press/magazine.css';
import './_press/rack.css';
import './_press/riffle/riffle.css';

/** The faces every press page opens on: its sans, the nameplate's Bodoni and the reading Newsreader. */
const FACES = ['/fonts/katagami/KatagamiText.woff2', '/fonts/google/bodoni-moda-opsz.woff2', '/fonts/google/newsreader-opsz-wght.woff2'];

/* GT Atlas, General Translation's magazine, kept here as /press and meant
   for a GT subdomain. Outside the viewer shell, with its own type and
   colors; each route's head comes from seoRoute like every other page. The
   faces it opens on are preloaded, so the text does not change face once it
   has painted. */
export default function PressLayout({ children }: { children: ReactNode }) {
  for (const href of FACES) preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return children;
}
