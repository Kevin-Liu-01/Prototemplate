'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import { createStageStore, ShellContext, StageContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import type { ShellDensity, ShellItem, ShellMode } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';

const MODES: readonly ShellMode[] = ['slide', 'grid', 'book'];
const noop = () => {};

type ModelShellProps = {
  mode: ShellMode;
  density?: ShellDensity;
  narrow: boolean;
  present: boolean;
  /** the stage box the fixed sheet fits itself to, in the model's pixels */
  stage: { width: number; height: number };
  items: readonly ShellItem[];
  index: number;
  /** pages the sheet: a click on either half of it, as on a paged route */
  onStep?: (delta: number) => void;
  children: ReactNode;
};

/**
 * The two contexts ViewerShell publishes, filled in for a model: the shell
 * state the sheet and the grid read (the mode, the active item, the count,
 * narrow and present), and the stage store the fixed sheet fits itself to.
 * Setters other than step do nothing, since the plate's controls own the
 * state. The store is written before paint whenever the stage changes.
 */
export default function ModelShell({
  mode,
  density = 'outline',
  narrow,
  present,
  stage,
  items,
  index,
  onStep,
  children,
}: ModelShellProps) {
  const [store] = useState(createStageStore);

  useLayoutWork(() => store.set({ width: stage.width, height: stage.height }), {
    dependencies: [stage.width, stage.height],
  });

  const state: ShellState = {
    id: 'docs-model',
    modes: MODES,
    keys: 'paged',
    noun: 'section',
    items,
    paged: items,
    mode,
    transition: null,
    density,
    sidebarOpen: true,
    sidebarShown: true,
    panelOpen: false,
    helpOpen: false,
    present,
    narrow,
    active: items[index]?.id ?? '',
    index,
    dir: 'next',
    total: items.length,
    ready: true,
    setMode: noop,
    setDensity: noop,
    setSidebar: noop,
    setPanel: noop,
    setHelp: noop,
    setPresent: noop,
    select: noop,
    step: onStep ?? noop,
    say: noop,
  };

  return (
    <ShellContext value={state}>
      <StageContext value={store}>{children}</StageContext>
    </ShellContext>
  );
}
