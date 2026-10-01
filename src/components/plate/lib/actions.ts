/*
 * Stand-ins for the server actions and the auth client the dashboard's
 * sign-in and onboarding pages call, for the plate gallery. Each keeps the
 * dashboard's name and signature (apps/dashboard/src/actions/onboarding.ts,
 * createOrg.ts, billing/stripe.ts, cliWizard.ts and the better-auth client
 * in src/auth-client.ts) and resolves after STUB_LATENCY_MS with a success
 * shape the component accepts, so a button shows its pending face and the
 * page then turns to the next state through the flow hook. Nothing here
 * reaches a network; a stub never throws unless a fixture asks for it.
 */

/** How long a stub waits before it resolves: long enough to show the pending face, short enough to feel like a response. */
export const STUB_LATENCY_MS = 400;

function settle<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), STUB_LATENCY_MS);
  });
}

/** The onboarding org the stubs hand back, the gallery's preview org. */
export const STUB_ORG_ID = 'org_preview_acme';

/* Minimal copies of the dashboard's types, so the stubs type without the
   @generaltranslation packages. */

export type SignupGrantUiAvailability = 'available' | 'card-used' | 'unavailable';

export type OnboardingOrgFailureReason =
  | 'org_limit_reached'
  | 'project_limit_reached'
  | 'project_failed';

export type BillingEntityType = 'org' | 'enterprise';

/* Onboarding (src/actions/onboarding.ts) */

export async function submitSurveyAction(data: {
  companyWebsite?: string;
  companySize?: string;
  hearAboutUs?: string;
  frameworks?: string[];
}): Promise<{ success: boolean; error?: string }> {
  void data;
  return settle({ success: true });
}

export async function saveOnboardingOrgAction(data: {
  orgName: string;
  enterpriseId?: string;
  orgId?: string;
}): Promise<{
  success: boolean;
  orgId?: string;
  error?: string;
  reason?: OnboardingOrgFailureReason;
}> {
  return settle({ success: true, orgId: data.orgId ?? STUB_ORG_ID });
}

/* The port never leaves for GitHub: the result carries no redirectUrl, and
   the step's flow hook moves the gallery on instead. */
export async function initiateGithubAction(
  orgId: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  void orgId;
  return settle({ success: true });
}

/* creditsGranted stays false so the step raises no toast; the gallery
   mounts no Toaster. */
export async function completeOnboardingAction(orgId?: string): Promise<{
  success: boolean;
  creditsGranted?: boolean;
  creditsError?: boolean;
  error?: string;
}> {
  void orgId;
  return settle({ success: true, creditsGranted: false });
}

export async function verifyOnboardingSetupIntentAction(
  orgId: string,
  setupIntentId: string
): Promise<{
  success: boolean;
  cardSaved?: boolean;
  grantAvailability?: SignupGrantUiAvailability;
  error?: string;
}> {
  void orgId;
  void setupIntentId;
  return settle({
    success: true,
    cardSaved: true,
    grantAvailability: 'available' as const,
  });
}

/* Organizations (src/actions/createOrg.ts) */

export async function createOrgAction(data: {
  orgName: string;
  enterpriseId?: string;
}): Promise<{
  success: boolean;
  orgId?: string;
  projectId?: string;
  error?: string;
}> {
  void data;
  return settle({
    success: true,
    orgId: STUB_ORG_ID,
    projectId: 'prj_preview_web',
  });
}

/* Billing (src/actions/billing/stripe.ts). The payment states render the
   static stand-in form, so this is never reached; it is here so the step
   compiles against the dashboard's import. */

export async function createSetupIntentAction(
  entityId: string,
  entityType: BillingEntityType,
  paymentMethodTypes: string[] = ['card', 'link']
): Promise<{ clientSecret: string } | { error: string }> {
  void entityId;
  void entityType;
  void paymentMethodTypes;
  return settle({ clientSecret: 'seti_preview_secret_preview' });
}

/* The CLI wizard (src/actions/cliWizard.ts) */

export async function generateCliWizardCredentialsAction(
  projectId: string,
  sessionId: string
): Promise<
  { success: true; data: { projectId: string } } | { success: false }
> {
  void sessionId;
  return settle({ success: true as const, data: { projectId } });
}

/* The better-auth client (src/auth-client.ts), as far as the ported pages
   call it: the sign-in form's three sign-ins, the consent page's answer and
   the device page's approve and deny, each exported under a plain name and
   gathered under `authClient` below. Each resolves `{ data, error: null }`
   the way the client does on success. */

export type AuthClientResult<T> = {
  data: T;
  error: null | { code?: string; status?: number; message?: string };
};

export async function signInMagicLink(input: {
  email: string;
  callbackURL?: string;
  metadata?: Record<string, string>;
  fetchOptions?: Record<string, unknown>;
}): Promise<AuthClientResult<{ status: boolean }>> {
  void input;
  return settle({ data: { status: true }, error: null });
}

export async function signInSso(input: {
  email?: string;
  callbackURL?: string;
  errorCallbackURL?: string;
  fetchOptions?: Record<string, unknown>;
}): Promise<AuthClientResult<{ url: string; redirect: boolean }>> {
  void input;
  return settle({ data: { url: '', redirect: false }, error: null });
}

export async function signInSocial(input: {
  provider: 'github' | 'google';
  callbackURL?: string;
  errorCallbackURL?: string;
  fetchOptions?: Record<string, unknown>;
}): Promise<AuthClientResult<{ url: string; redirect: boolean }>> {
  void input;
  return settle({ data: { url: '', redirect: false }, error: null });
}

/* The consent stays on its page in the port (the real one redirects to the
   client), so the answer carries no url. */
export async function oauth2Consent(input: {
  accept: boolean;
  scope?: string;
  oauth_query: string;
}): Promise<AuthClientResult<{ url?: string }>> {
  void input;
  return settle({ data: {}, error: null });
}

export async function deviceApprove(input: {
  userCode: string;
}): Promise<AuthClientResult<{ status: 'approved' }>> {
  void input;
  return settle({ data: { status: 'approved' as const }, error: null });
}

export async function deviceDeny(input: {
  userCode: string;
}): Promise<AuthClientResult<{ status: 'denied' }>> {
  void input;
  return settle({ data: { status: 'denied' as const }, error: null });
}

/* The device code form (signin/device/page.tsx verifies the code on the
   server and renders the approval); the port asks the stub and then turns
   to the approval state. */
export async function requestDeviceApproval(input: {
  userCode: string;
}): Promise<{ success: boolean; userCode: string }> {
  return settle({ success: true, userCode: input.userCode });
}

/* The dashboard's `authClient` shape over the same stubs, for a component
   that keeps the client's call sites as they are. */
export const authClient = {
  signIn: {
    magicLink: signInMagicLink,
    sso: signInSso,
    social: signInSocial,
  },
  oauth2: {
    consent: oauth2Consent,
  },
  device: {
    approve: deviceApprove,
    deny: deviceDeny,
  },
};
