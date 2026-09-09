'use client';

import { useRef } from 'react';

import { ViewerShell } from '@/components/viewer/ViewerShell';
import type { ShellMode } from '@/lib/shell-data';

import PresenterStage from './PresenterStage';
import type { GoTo } from './PresenterStage';
import PresentSubs from './PresentSubs';
import ReviewTools from './ReviewTools';
import { PRESENT_SECTIONS, PRESENT_TITLE, SLIDE_COUNT } from './slides';

const MODES: readonly ShellMode[] = ['slide', 'grid'];

/**
 * The presenter on the viewer shell. Seven slides as sidebar sections, each
 * with its capture and its beats as rows (the prototypes slide lists the
 * directions); slide and grid modes; the paged key table, so the arrows,
 * Space and typed numbers move between slides and the presenter's own keys
 * are gone. The deck itself is the stage content (PresenterStage), which
 * keeps the shell's selection and the scroll in step. Rate and Notes sit in
 * the toolbar slot for the loaded direction (ReviewTools). The site index is
 * the panel, so every other route is one click away.
 */
export default function PresenterApp() {
  /* the stage fills this so the sidebar rows can jump to a beat */
  const goToRef = useRef<GoTo>(() => {});
  return (
    <ViewerShell
      id='present'
      title={PRESENT_TITLE}
      mark='pt'
      count={`${SLIDE_COUNT} slides`}
      sections={PRESENT_SECTIONS}
      modes={MODES}
      thumb='shot'
      surfaces='site'
      keys='paged'
      noun='slide'
      toolbarSlot={<ReviewTools />}
      renderSub={(item) => (
        <PresentSubs item={item} goTo={(slide, fraction) => goToRef.current(slide, fraction)} />
      )}
    >
      <PresenterStage goToRef={goToRef} />
    </ViewerShell>
  );
}
