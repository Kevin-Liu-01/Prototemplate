'use client';

import { useState } from 'react';

import type { PlateFigure } from '../content';
import { useEdition } from '../edition';
import type { Inline as InlineNode } from '../parse';
import type { LiveKind, Localized } from '../stories';
import StopSlider, { type Stop } from '../ui/StopSlider';
import FrameView from './FrameView';
import { CornersDemo, FUMA_ROWS, GlobeDemo, HitListDemo, ThemeWipe, TocDemo, VersionsDemo } from './Live';

export const LIVE_CAPTION: Record<LiveKind, string> = {
  toc: 'The table of contents rebuilt in this page.',
  corners: 'The docs controls at each corner radius on the slider. The redesign removed the pill.',
  hitlist: 'The hit list as a checklist.',
  globe: 'The title of this essay in nine languages. The globe turns to a city where each one is spoken.',
  wipe: 'The same picture in the dark theme and the light theme.',
  stops: '',
  clerk: 'The Fumadocs table of contents rebuilt in this page. The thumb shows only where the line runs, so it follows the line into the nested headings.',
};

const LIVE_STOP: Record<LiveKind, string> = {
  toc: 'Live',
  corners: 'Live',
  hitlist: 'Live',
  globe: 'Live',
  wipe: 'Both themes',
  stops: 'Five versions',
  clerk: 'Live',
};

export const pad = (n: number) => String(n).padStart(2, '0');

type Props = {
  figure: PlateFigure;
  titles: Localized;
  hitItems: InlineNode[][];
  active: boolean;
  /** Mount the media; plates far from the reader stay empty until reached. */
  mounted: boolean;
};

/* A figure on the stage: the media, and under it the figure's number, the
   caption of the view shown and, when the figure has more than one view (a
   live demo first, then each recorded frame), a slider across them. */
export default function Plate({ figure, titles, hitItems, active, mounted }: Props) {
  const frames = figure.frames;
  // the magazine shows a live figure alone, with no switch to its still picture
  const liveOnly = useEdition() === 'magazine' && figure.live !== null;
  const stops: Stop[] = [
    ...(figure.live ? [{ value: 'live', label: LIVE_STOP[figure.live] }] : []),
    ...(liveOnly ? [] : frames).map((frame, i) => ({
      value: String(i),
      label: frames.length > 1 ? pad(i + 1) : frame.video ? 'Recording' : 'Picture',
    })),
  ];
  const [stop, setStop] = useState(stops[0]?.value ?? '0');
  const shown = stop === 'live' ? null : frames[Number(stop)];
  const caption = stop === 'live' && figure.live ? LIVE_CAPTION[figure.live] : (shown?.alt ?? '');

  return (
    <section className='gtp-plate' data-on={active} aria-hidden={!active} inert={!active} aria-label={`Figure ${figure.n}`}>
      <div className='gtp-plate-media'>
        {mounted
          ? stops.map((s) => (
              <div key={s.value} className='gtp-plate-view' hidden={s.value !== stop}>
                {s.value === 'live' && figure.live ? (
                  <LiveView kind={figure.live} figure={figure} titles={titles} hitItems={hitItems} />
                ) : (
                  <FrameView frame={frames[Number(s.value)]!} active={active && s.value === stop} eager={active} />
                )}
              </div>
            ))
          : null}
      </div>
      <footer className='gtp-plate-foot'>
        <span className='gtp-mono gtp-plate-n'>Fig. {pad(figure.n)}</span>
        <p className='gtp-plate-caption'>{caption}</p>
        {stops.length > 1 ? (
          <StopSlider stops={stops} value={stop} onChange={setStop} label={`Figure ${figure.n} views`} tone='stage' className='gtp-plate-stops' />
        ) : null}
      </footer>
    </section>
  );
}

function LiveView({ kind, figure, titles, hitItems }: { kind: LiveKind; figure: PlateFigure; titles: Localized; hitItems: InlineNode[][] }) {
  switch (kind) {
    case 'toc':
      return <TocDemo />;
    case 'corners':
      return <CornersDemo />;
    case 'hitlist':
      return <HitListDemo items={hitItems} />;
    case 'globe':
      return <GlobeDemo titles={titles} />;
    case 'stops':
      return <VersionsDemo />;
    case 'clerk':
      return <TocDemo rows={FUMA_ROWS} start={9} />;
    case 'wipe': {
      const dark = figure.frames[0];
      return dark && figure.light ? <ThemeWipe dark={dark.src} light={figure.light} alt={dark.alt} /> : null;
    }
    default:
      return null;
  }
}
