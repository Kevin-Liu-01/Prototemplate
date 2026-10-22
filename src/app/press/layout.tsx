import type { ReactNode } from 'react';

import './_press/press.css';
import './_press/magazine.css';
import './_press/rack.css';
import './_press/riffle/riffle.css';

/* GT Atlas, General Translation's magazine, kept here as /press and meant
   for a GT subdomain. Outside the viewer shell, with its own type and
   colors; each route's head comes from seoRoute like every other page. */
export default function PressLayout({ children }: { children: ReactNode }) {
  return children;
}
