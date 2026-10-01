import PlateGallery from '@/components/plate/gallery/PlateGallery';
import { initialDevStateId } from '@/components/plate/gallery/devStates';
import DirectionCorner from '@/components/viewer/DirectionCorner';

import '@/components/plate/plate.css';

/* The title is the dashboard page's own; the description is the dashboard
   dictionary's tagline (apps/dashboard/src/dictionary.ts,
   metadata.description), as every auth page there carries it. */
export const metadata = {
  title: 'Sign in — Shipped — GT Redesign',
  description: "Full-stack localization for the world's best companies",
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

type PageProps = {
  /** The address's query; `state` names the state to open on. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The dashboard's sign-in and onboarding system, opened at the
 * `signin` state. The gallery (src/components/plate/gallery) renders
 * every state of the journey on its real frame from fixtures, with the
 * draggable console to page between them; ?state=<id> opens any state and
 * ?chrome=0 hides the console and the corner for captures.
 * The route reads ?state= on the server (searchParams), so the document
 * carries the wanted state from its first byte and no default page paints
 * first; the route renders per request for that, which is also why the
 * corner mounts without its Suspense boundary (suspense={false}): it
 * hydrates with the page, before a fixture's mount effect can open a
 * dialog over it.
 */
export default async function ProductionSignInPage({ searchParams }: PageProps) {
  const { state } = await searchParams;
  return (
    <>
      <PlateGallery initial={initialDevStateId(state, 'signin')} />
      <DirectionCorner slug='production' placement='right' suspense={false} />
    </>
  );
}
