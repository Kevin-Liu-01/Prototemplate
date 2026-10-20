import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './_press/press.css';

/* GT Atlas, General Translation's press: the magazine meant for press.generaltranslation.com,
   kept here as /press. Outside the viewer shell, with its own type and colors. */
export const metadata: Metadata = {
  // the press is its own title: the hub's ', Prototemplate' does not follow it
  title: {
    absolute: 'GT Atlas',
    template: '%s, GT Atlas',
  },
  description: 'Essays on design, engineering and language from General Translation.',
};

export default function PressLayout({ children }: { children: ReactNode }) {
  return children;
}
