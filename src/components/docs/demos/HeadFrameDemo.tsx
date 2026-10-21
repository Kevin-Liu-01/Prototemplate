'use client';

import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice } from './controls';
import Plate from './Plate';

type Route = '/marks' | '/skills' | '/motion';
type Width = '1440' | '390';

const ROUTES: readonly { value: Route; label: string }[] = [
  { value: '/marks', label: 'Marks' },
  { value: '/skills', label: 'Skills' },
  { value: '/motion', label: 'Motion' },
];

/* the part of the page the frame shows: the head, its contents and the band */
const FRAME_H: Record<Width, number> = { '1440': 900, '390': 760 };

type FrameProps = { route: Route; width: Width };

/** The frame and its scale, mounted with the plate's children so its box exists when the scale is measured. */
function FrameStage({ route, width }: FrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const w = Number(width);
  const h = FRAME_H[width];

  /* the scale that fits the frame's width into the stage, read again on every resize */
  useLayoutWork(
    () => {
      const el = box.current;
      if (!el) return;
      const fit = () => setScale(Math.min(1, el.clientWidth / w));
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(el);
      return () => observer.disconnect();
    },
    { dependencies: [w], revertOnUpdate: true }
  );

  const style = { '--dmo-frame-w': `${w}px`, '--dmo-frame-h': `${h}px`, '--dmo-frame-s': scale } as CSSProperties;

  return (
    <div className='dmo-frame-box' ref={box} style={style}>
      <iframe
        className='dmo-frame-doc'
        key={`${route}-${width}`}
        loading='lazy'
        src={route}
        title={`The ${route} page at ${width} pixels wide`}
      />
    </div>
  );
}

/**
 * A live book page in a frame, scaled to the plate: the real route with
 * its real head (BookHead), its badge, its lead and its panel, at the
 * desktop or the phone width. A page keeps one h1, so the head is shown in
 * its own document; the frame is same-origin and follows the docs theme
 * through the root layout's theme script. It loads only when the plate
 * nears the viewport, and the page inside stays fully interactive.
 */
export default function HeadFrameDemo() {
  const [route, setRoute] = useState<Route>('/marks');
  const [width, setWidth] = useState<Width>('1440');

  return (
    <Plate
      bare
      controls={
        <>
          <Choice label='Page' options={ROUTES} value={route} onChange={setRoute} />
          <Choice
            label='Width'
            options={[
              { value: '1440', label: '1440px' },
              { value: '390', label: '390px' },
            ]}
            value={width}
            onChange={setWidth}
          />
          <a className='dmo-btn dmo-link' href={route}>
            Open Page
          </a>
        </>
      }
      fit
      label={`The live ${route} page at ${width}px, framed`}
      lazy
      stageClassName='dmo-frame'
      tag={route}
    >
      <FrameStage route={route} width={width} />
    </Plate>
  );
}
