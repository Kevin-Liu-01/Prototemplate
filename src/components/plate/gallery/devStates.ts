// The states the plate gallery can show, in the order of the journey:
// signing in, onboarding, then the CLI login with its consent, its
// 127.0.0.1 page and the device flow. Copied from the dashboard's
// src/lib/dev/devStates.ts without the three dashboard states (the home,
// the organization and the project pages are the dashboard proper, not
// this system), so every state here is a fixture or a snapshot. Kept free
// of JSX so the gallery can pick a frame without the fixtures.

import type { PictureName } from '@/components/plate/brand/moodPictures';

export type DevStateFrame = 'onboarding' | 'auth' | 'bare';

export type DevState = {
  id: string;
  group: string;
  title: string;
  /** What the console says under the title. */
  note?: string;
  /** For fixtures: which frame surrounds the component. */
  frame?: DevStateFrame;
  /**
   * For the auth frame: which material the field draws, 0 (default) the
   * globe alone, 1 the mood picture of the screens after sign-in.
   */
  scene?: 0 | 1;
  /**
   * For scene 1 frames: the mood picture the field draws for the state.
   * The onboarding steps set their own once mounted; this is the first
   * render's picture, so a load lands on the right one.
   */
  picture?: PictureName;
  /**
   * `html` shows a snapshot document in a sandboxed frame. Absent for a
   * fixture rendered by DevStateView.
   */
  kind?: 'html';
};

const signIn = 'Sign in';
const onboarding = 'Onboarding';
const cli = 'CLI login';
const device = 'Device flow';
const wizard = 'CLI wizard';

export const devStates: DevState[] = [
  {
    id: 'signin',
    group: signIn,
    title: 'Sign-in page',
    frame: 'auth',
    note: 'What a new user meets first.',
  },
  {
    id: 'verify-request',
    group: signIn,
    title: 'Check your email',
    frame: 'auth',
    note: 'After the magic link is sent.',
  },
  {
    id: 'auth-error',
    group: signIn,
    title: 'Sign-in error',
    frame: 'auth',
    note: 'An expired or reused link.',
  },
  {
    id: 'survey',
    group: onboarding,
    title: 'Survey',
    frame: 'onboarding',
    note: 'Step 1: the company website alone, with no button. The size row opens once the typed website holds a usable domain; each later answer opens the next row, and the frameworks row brings the Submit, which moves on to the organization step.',
    picture: 'earth',
  },
  {
    id: 'survey-required',
    group: onboarding,
    title: 'Survey, website required',
    frame: 'onboarding',
    note: 'A consumer email address: the website is required and free email domains are refused.',
    picture: 'earth',
  },
  {
    id: 'survey-size',
    group: onboarding,
    title: 'Survey, company size',
    frame: 'onboarding',
    note: 'The website passed, so the company size row shows; no button yet.',
    picture: 'earth',
  },
  {
    id: 'survey-source',
    group: onboarding,
    title: 'Survey, referral source',
    frame: 'onboarding',
    note: 'A size is chosen, so the source select shows; no button yet.',
    picture: 'earth',
  },
  {
    id: 'survey-ai-tool',
    group: onboarding,
    title: 'Survey, AI tools chosen',
    frame: 'onboarding',
    note: 'The source is AI tools, so the AI tool select shows beside it; the chosen source also opened the frameworks row and the Submit, and the tool stays optional.',
    picture: 'earth',
  },
  {
    id: 'survey-frameworks',
    group: onboarding,
    title: 'Survey, frameworks',
    frame: 'onboarding',
    note: 'Every row shows: a size, a source, a tool and three frameworks are chosen. Submit moves on to the organization step.',
    picture: 'earth',
  },
  {
    id: 'create-org',
    group: onboarding,
    title: 'Create organization',
    frame: 'onboarding',
    note: 'Step 2. Next creates the organization and moves on to the payment step.',
    picture: 'rosetta',
  },
  {
    id: 'create-org-cap',
    group: onboarding,
    title: 'Create organization, at the organization cap',
    frame: 'onboarding',
    picture: 'rosetta',
  },
  {
    id: 'create-org-project-limit',
    group: onboarding,
    title: 'Create organization, project limit reached',
    frame: 'onboarding',
    picture: 'rosetta',
  },
  {
    id: 'payment',
    group: onboarding,
    title: 'Payment, no card yet',
    frame: 'onboarding',
    note: "Step 3. The gallery shows a static stand-in of Stripe's form; the real form is not ported.",
    picture: 'calligraphy',
  },
  {
    id: 'payment-card-saved',
    group: onboarding,
    title: 'Payment, card saved',
    frame: 'onboarding',
    picture: 'calligraphy',
  },
  {
    id: 'payment-card-used',
    group: onboarding,
    title: 'Payment, card used elsewhere',
    frame: 'onboarding',
    picture: 'calligraphy',
  },
  {
    id: 'payment-unavailable',
    group: onboarding,
    title: 'Payment, grant gone, card saved',
    frame: 'onboarding',
    picture: 'calligraphy',
  },
  {
    id: 'payment-unavailable-no-card',
    group: onboarding,
    title: 'Payment, grant gone, no card',
    frame: 'onboarding',
    picture: 'calligraphy',
  },
  {
    id: 'github',
    group: onboarding,
    title: 'Connect GitHub',
    frame: 'onboarding',
    note: 'Step 4, the last one. Both buttons finish onboarding and return to the sign-in page.',
    picture: 'tablet',
  },
  {
    id: 'cli-terminal',
    group: cli,
    title: 'The terminal',
    frame: 'bare',
    note: 'What npx gt login prints before the browser opens.',
  },
  {
    id: 'oauth-signin',
    group: cli,
    title: 'Sign in to authorize',
    frame: 'auth',
    note: 'When the browser has no session.',
  },
  {
    id: 'consent-trusted',
    group: cli,
    title: 'Consent, the CLI',
    frame: 'auth',
    scene: 1,
    note: 'The browser page the CLI opens.',
    picture: 'rosetta',
  },
  {
    id: 'consent-untrusted',
    group: cli,
    title: 'Consent, an unverified app',
    frame: 'auth',
    scene: 1,
    picture: 'rosetta',
  },
  {
    id: 'consent-invalid',
    group: cli,
    title: 'Consent, invalid request',
    frame: 'auth',
    scene: 1,
    picture: 'rosetta',
  },
  {
    id: 'cli-callback-signed-in',
    group: cli,
    title: 'The 127.0.0.1 page, signed in',
    kind: 'html',
    note: 'A snapshot of the page the CLI serves after approval.',
  },
  {
    id: 'cli-callback-denied',
    group: cli,
    title: 'The 127.0.0.1 page, denied',
    kind: 'html',
  },
  {
    id: 'cli-callback-failed',
    group: cli,
    title: 'The 127.0.0.1 page, failed',
    kind: 'html',
  },
  {
    id: 'device-code',
    group: device,
    title: 'Code entry',
    frame: 'auth',
    scene: 1,
    note: 'gt login --no-browser, and SSH sessions.',
    picture: 'calligraphy',
  },
  {
    id: 'device-invalid',
    group: device,
    title: 'Invalid code',
    frame: 'auth',
    scene: 1,
    picture: 'calligraphy',
  },
  {
    id: 'device-expired',
    group: device,
    title: 'Expired code',
    frame: 'auth',
    scene: 1,
    picture: 'calligraphy',
  },
  {
    id: 'device-processed',
    group: device,
    title: 'Code already used',
    frame: 'auth',
    scene: 1,
    picture: 'calligraphy',
  },
  {
    id: 'device-approval',
    group: device,
    title: 'Approval',
    frame: 'auth',
    scene: 1,
    picture: 'calligraphy',
  },
  {
    id: 'device-blocked',
    group: device,
    title: 'Network restricted',
    frame: 'auth',
    scene: 1,
    picture: 'calligraphy',
  },
  {
    id: 'cli-wizard',
    group: wizard,
    title: 'Pick a project',
    frame: 'auth',
    scene: 1,
    note: 'gt init, in the browser.',
    picture: 'gloss',
  },
  {
    id: 'cli-wizard-done',
    group: wizard,
    title: 'Already authorized',
    frame: 'auth',
    scene: 1,
    picture: 'gloss',
  },
  {
    id: 'cli-wizard-expired',
    group: wizard,
    title: 'Session expired',
    frame: 'auth',
    scene: 1,
    picture: 'gloss',
  },
];

export const DEFAULT_DEV_STATE_ID = devStates[0]!.id;

/**
 * The journey's main line, in order: what one user meets from the sign-in
 * page through onboarding, then the CLI login through its consent to the
 * 127.0.0.1 page, the device flow and the CLI wizard. The survey's stages
 * are on the line one by one, since each answer reveals the next question
 * on the same screen. Previous and next in the console walk this line, so
 * the transitions between screens are the real ones. Every other state is
 * a variant of the line's last state before it in the list, reached from
 * the console's list.
 */
export const devPath: readonly string[] = [
  'signin',
  'verify-request',
  'survey',
  'survey-size',
  'survey-source',
  'survey-ai-tool',
  'survey-frameworks',
  'create-org',
  'payment',
  'github',
  'cli-terminal',
  'oauth-signin',
  'consent-trusted',
  'cli-callback-signed-in',
  'device-code',
  'device-approval',
  'cli-wizard',
];

export type DevPathPosition = {
  /** Index into devPath: the state's own step, or the step it varies. */
  step: number;
  onPath: boolean;
};

/** Where a state stands on the path; an unknown id counts as the start. */
export function devPathPosition(id: string): DevPathPosition {
  const own = devPath.indexOf(id);
  if (own >= 0) return { step: own, onPath: true };
  const index = devStates.findIndex((state) => state.id === id);
  let step = 0;
  for (let k = 0; k < index; k++) {
    const at = devPath.indexOf(devStates[k]!.id);
    if (at >= 0) step = at;
  }
  return { step, onPath: false };
}

export function findDevState(id: string | undefined): DevState {
  return devStates.find((state) => state.id === id) ?? devStates[0]!;
}

/** Whether `id` names a state, so a `?state=` from the address can be trusted. */
export function isDevStateId(id: string | null | undefined): id is string {
  return typeof id === 'string' && devStates.some((state) => state.id === id);
}

/**
 * The state a route opens on: the address's `?state=` when it names a
 * state, else the route's own. The five production pages read the address
 * on the server (searchParams) and hand the result to PlateGallery, so the
 * document already carries the wanted state and no default page paints
 * first. A repeated parameter counts by its first value.
 */
export function initialDevStateId(
  wanted: string | string[] | undefined,
  fallback: string
): string {
  const id = Array.isArray(wanted) ? wanted[0] : wanted;
  return isDevStateId(id) ? id : fallback;
}
