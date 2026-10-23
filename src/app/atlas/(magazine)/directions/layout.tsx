import type { ReactNode } from 'react';

import { getIssue } from './_directions/issue';
import Stage from './_directions/Stage';

import './_directions/faces.css';
import './_directions/stage.css';
import './_directions/furniture.css';
import './_directions/sheet.css';
import './_directions/editorial.css';
import './_directions/studies/atlas.css';
import './_directions/studies/signal.css';
import './_directions/studies/proof.css';
import './_directions/studies/light.css';
import './_directions/studies/route.css';
import './_directions/studies/measure.css';

/* The stage stays mounted while the reader moves between directions; each
   page under it gives the head and a heading for screen readers. */
export default function PressDirectionsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Stage issue={getIssue()} />
    </>
  );
}
