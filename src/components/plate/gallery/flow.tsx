'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  DEFAULT_DEV_STATE_ID,
  devPath,
  devPathPosition,
  findDevState,
} from '@/components/plate/gallery/devStates';

/**
 * What the gallery hands the ported pages in place of the router: the
 * state on show, a jump to any state, and one step along the journey's
 * path. Where the dashboard pushed a route after an action (the sign-in's
 * Continue, the onboarding steps' Next, the CLI wizard's Authorize), the
 * port calls `advance` or `go`, so the gallery turns to the next screen the
 * way the real pages would.
 */
export type Flow = {
  current: string;
  go(state: string): void;
  advance(): void;
};

/* Outside a provider the hook is inert: a ported page rendered on its own
   keeps working, it just cannot turn the gallery. */
const INERT_FLOW: Flow = {
  current: DEFAULT_DEV_STATE_ID,
  go: () => {},
  advance: () => {},
};

const FlowContext = createContext<Flow>(INERT_FLOW);

type FlowProviderProps = {
  /** The state the gallery opens on; an unknown id falls back to the first. */
  initial: string;
  children: ReactNode;
};

/** Holds the gallery's current state; PlateGallery mounts it over the frame and the console. */
export function FlowProvider({ initial, children }: FlowProviderProps) {
  const [current, setCurrent] = useState(() => findDevState(initial).id);
  const flow = useMemo<Flow>(
    () => ({
      current,
      go: (state) => setCurrent(findDevState(state).id),
      /* From a variant, advance continues the path after the state it
         varies, as the console's Next does. */
      advance: () =>
        setCurrent((id) => {
          const { step } = devPathPosition(id);
          return devPath[(step + 1) % devPath.length]!;
        }),
    }),
    [current]
  );
  return <FlowContext value={flow}>{children}</FlowContext>;
}

export function useFlow(): Flow {
  return useContext(FlowContext);
}
