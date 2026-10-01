'use client';

import type { ReactNode } from 'react';

import FieldPicture from '@/components/plate/brand/FieldPicture';
import PlateFrame from '@/components/plate/frame/PlateFrame';
import DevStateConsole from '@/components/plate/gallery/DevStateConsole';
import DevStateView from '@/components/plate/gallery/DevStateView';
import { devStates, findDevState } from '@/components/plate/gallery/devStates';
import { FlowProvider, useFlow } from '@/components/plate/gallery/flow';
import { useEffectOn } from '@/components/plate/hooks/use-mount-effect';
import type { CliCallbackState } from '@/components/plate/lib/cliCallbackPages';
import CliCallbackSnapshot from '@/components/plate/pages/cli/CliCallbackSnapshot';

type PlateGalleryProps = {
  /**
   * The state the page opens on: the route's own, or the address's
   * ?state= when the route read one (initialDevStateId in devStates.ts).
   */
  initial: string;
};

/** The account the fixtures name; the gallery has no session. */
const ACCOUNT_EMAIL = 'dev@acme.com';

const CLI_CALLBACK_STATES: Record<string, CliCallbackState> = {
  'cli-callback-signed-in': 'signedIn',
  'cli-callback-denied': 'denied',
  'cli-callback-failed': 'failed',
};

/**
 * The gallery under the provider: the frame for the current state with its
 * fixture inside, and the console. The route seeds the provider from
 * `?state=` on the server, so the first render is the wanted state; from
 * then on every move writes the state back with replaceState, so each
 * state keeps a link and the other parameters (?chrome=0) stay. The
 * gallery's own wrappers carry the plate-root class, so the tokens the
 * ported components read (bg-background, the typo rungs) resolve on the
 * bare states and on the console, which sit outside the frame's root.
 *
 * The console is always the fragment's second child, in a wrapper of its
 * own, whatever the first child is (the frame, the bare wrapper or the
 * snapshot's), so React keeps its instance across every seam between the
 * kinds: the phone's opened console stays open, and the dragged position
 * and the key listener live on instead of being re-read and re-bound at a
 * mount. The fixture is keyed on the state, so two sibling states that
 * render the same component (the device code's error variants, the
 * payment faces, the organization step's blocked face) mount fresh, as
 * they did under the dashboard's gallery, which navigates per state;
 * without the key the component kept whatever it had read into state at
 * its first mount, the previous state's values.
 */
function Gallery() {
  const { current } = useFlow();
  const state = findDevState(current);

  useEffectOn(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('state') === current) return;
    params.set('state', current);
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [current]);

  let content: ReactNode;
  if (state.kind === 'html') {
    const snapshot = CLI_CALLBACK_STATES[state.id];
    /* The snapshot document fills the viewport on its own (h-svh), so the
       bare frame is the plate-root wrapper and nothing else. */
    content = (
      <div className='plate-root'>
        {snapshot && <CliCallbackSnapshot state={snapshot} />}
      </div>
    );
  } else {
    const view = (
      <DevStateView
        key={state.id}
        id={state.id}
        accountEmail={ACCOUNT_EMAIL}
      />
    );
    if (state.frame === 'onboarding' || state.frame === 'auth') {
      const onboarding = state.frame === 'onboarding';
      /* One frame for both kinds, so the mark and the foot stay mounted
         when the gallery moves between an auth state and an onboarding
         state; PlateRoot keys the field on the scene, so a scene change
         remounts the field alone. */
      content = (
        <PlateFrame
          scene={onboarding ? 1 : (state.scene ?? 0)}
          picture={
            onboarding
              ? state.picture
              : (state.picture ?? (state.scene === 1 ? 'earth' : undefined))
          }
          homeLabel='General Translation home'
          accountEmail={onboarding ? ACCOUNT_EMAIL : undefined}
        >
          {/* The auth frame reads its picture at mount, so each auth state
              sets its own through the leaf the steps use, remounted per
              state; the onboarding steps carry their own leaves. */}
          {!onboarding && state.picture && (
            <FieldPicture key={`${state.id}:picture`} name={state.picture} />
          )}
          {view}
        </PlateFrame>
      );
    } else {
      content = <div className='plate-root'>{view}</div>;
    }
  }

  return (
    <>
      {content}
      <div className='plate-root'>
        <DevStateConsole states={devStates} currentId={state.id} />
      </div>
    </>
  );
}

/**
 * The dashboard's sign-in and onboarding system as a page of the shipped
 * site: every state of the journey on its real frame, paged from the
 * console or the arrow keys, rendered from fixtures. The five Shipped rows
 * open it at different states through `initial`, which each route reads
 * from `?state=` on the server before falling back to its own.
 */
export default function PlateGallery({ initial }: PlateGalleryProps) {
  return (
    <FlowProvider initial={initial}>
      <Gallery />
    </FlowProvider>
  );
}
