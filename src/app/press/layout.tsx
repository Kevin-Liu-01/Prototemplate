import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './_press/press.css';

/* GT Atlas, General Translation's press: the magazine meant for press.generaltranslation.com,
   kept here as /press. Outside the viewer shell, with its own type and colors. */
export const metadata: Metadata = {
  title: {
    template: '%s, GT Atlas',
    default: 'GT Atlas',
  },
  description: 'Essays on design, engineering and language from General Translation.',
};

export default function PressLayout({ children }: { children: ReactNode }) {
  return children;
}
