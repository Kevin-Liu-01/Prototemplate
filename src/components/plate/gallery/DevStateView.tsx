'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';

import { useFlow } from '@/components/plate/gallery/flow';
import {
  oauthScopes,
  type OAuthScope,
} from '@/components/plate/lib/oauthProviderConfig';
import {
  AI_TOOLS_REFERRAL_VALUE,
  EMPTY_SURVEY_VALUES,
  LAST_SURVEY_SUBSTEP,
  type SurveyValues,
} from '@/components/plate/lib/onboarding/surveyValues';
import AuthFrame, {
  authLedeClassName,
  authTitleClassName,
} from '@/components/plate/pages/auth/AuthFrame';
import SignInForm from '@/components/plate/pages/auth/SignInForm';
import CliTerminal from '@/components/plate/pages/cli/CliTerminal';
import CliWizard from '@/components/plate/pages/cli/CliWizard';
import CompletedSessionState from '@/components/plate/pages/cli/CompletedSessionState';
import InvalidSessionState from '@/components/plate/pages/cli/InvalidSessionState';
import InvalidConsentState from '@/components/plate/pages/consent/InvalidConsentState';
import OAuthConsent from '@/components/plate/pages/consent/OAuthConsent';
import BlockedState from '@/components/plate/pages/device/BlockedState';
import DeviceApproval from '@/components/plate/pages/device/DeviceApproval';
import DeviceCodeForm from '@/components/plate/pages/device/DeviceCodeForm';
import BillingFormPreview from '@/components/plate/pages/onboarding/BillingFormPreview';
import ConnectGithubStep from '@/components/plate/pages/onboarding/ConnectGithubStep';
import CreateOrgStep from '@/components/plate/pages/onboarding/CreateOrgStep';
import PaymentStep from '@/components/plate/pages/onboarding/PaymentStep';
import StepCounter from '@/components/plate/pages/onboarding/StepCounter';
import SurveyStep from '@/components/plate/pages/onboarding/SurveyStep';

type DevStateViewProps = {
  id: string;
  /** The account the fixtures name, a stand-in in the gallery. */
  accountEmail: string;
  /** An org the fixtures act on; the gallery's preview org when absent. */
  orgId?: string;
};

/* The wizard's org and project shapes, as the ported wizard types them. */
type CliOrg = ComponentProps<typeof CliWizard>['orgs'][number];
type CliProject = ComponentProps<typeof CliWizard>['projects'][number];

const allScopes: OAuthScope[] = [...oauthScopes];
const narrowScopes = allScopes.slice(0, 4);

const previewOrgs = [
  { id: 'org_preview_acme', name: 'Acme' },
  { id: 'org_preview_labs', name: 'Acme Labs' },
];

const cliOrgs = previewOrgs.map(
  (org) =>
    ({
      ...org,
      enterprise_id: null,
      preferred_ai_provider: null,
      billing_period: null,
      services: [],
      serviceData: { services: {} },
      permissions: {},
      projects: [],
    }) as CliOrg
);

const cliProjects = [
  { id: 'prj_preview_web', name: 'Website', org_id: 'org_preview_acme' },
  { id: 'prj_preview_docs', name: 'Docs', org_id: 'org_preview_acme' },
  { id: 'prj_preview_app', name: 'Mobile app', org_id: 'org_preview_labs' },
].map((project) => ({ ...project, permissions: {}, settings: {} }) as CliProject);

const noop = () => {};

// The wizard's step count for a user who creates an organization.
const TOTAL_STEPS = 4;

type SurveyFixtureProps = {
  initial: SurveyValues;
  userEmail: string;
  requireCompanyWebsite?: boolean;
};

/**
 * Step 1 with the wizard's counter, over its own answers, so each gallery
 * state starts from its fixture values and edits stay in the step while it
 * is shown. Mounted with the state id as its key, so a move to another
 * survey state resets the answers instead of carrying them over. Submit,
 * present once the frameworks row is open, calls the survey stub; the step
 * then turns the gallery to the organization step itself (flow.go in
 * SurveyStep), so onNext stays the wizard's hook.
 */
function SurveyFixture({
  initial,
  userEmail,
  requireCompanyWebsite = false,
}: SurveyFixtureProps) {
  const [values, setValues] = useState(initial);
  return (
    // Positioned for the counter on the frame's mark row, as the wizard is.
    <div className='relative'>
      <StepCounter step={1} totalSteps={TOTAL_STEPS} />
      <SurveyStep
        values={values}
        userEmail={userEmail}
        requireCompanyWebsite={requireCompanyWebsite}
        onValuesChange={setValues}
        onNext={noop}
      />
    </div>
  );
}

/**
 * The survey's stages as fixture values: the highest row opened and what
 * is answered at that point (each answer opens the row after it, so the
 * substep is one past the last answered row). The website is the account's
 * own email domain, which the step accepts (a domain the account owns
 * passes the placeholder and internal-domain checks).
 */
function surveyStage(
  website: string,
  substep: number,
  answers: Partial<SurveyValues> = {}
): SurveyValues {
  return {
    ...EMPTY_SURVEY_VALUES,
    companyWebsite: website,
    currentSubstep: substep,
    ...answers,
  };
}

/**
 * The fixture for a gallery state: the real component with fixture props,
 * inside whatever frame the gallery chose for the state. The ported steps
 * turn the gallery forward themselves after their action (flow.go inside
 * each); the fixtures wire Back, which the wizard owned, to the step
 * before.
 */
export default function DevStateView({
  id,
  accountEmail,
  orgId,
}: DevStateViewProps) {
  const { go } = useFlow();
  const [orgName, setOrgName] = useState('');
  const liveOrgId = orgId ?? 'org_preview_acme';
  const accountDomain = accountEmail.split('@')[1] ?? 'acme.com';
  /* Always the static stand-in: the real Stripe form is not ported. */
  const formPreview = <BillingFormPreview orgName='Acme' />;

  function createOrg(props: Partial<ComponentProps<typeof CreateOrgStep>>) {
    return (
      <div className='relative'>
        <StepCounter step={2} totalSteps={TOTAL_STEPS} />
        <CreateOrgStep
          existingOrgs={[]}
          orgLimitReached={false}
          orgName={orgName}
          onOrgNameChange={setOrgName}
          onOrgSaved={noop}
          /* The step turns the gallery itself after a save (flow.go in
             CreateOrgStep); onNext stays the wizard's hook. The dashboard
             leaves for an organization or the upgrade page from
             onOpenDashboard; the gallery has no dashboard, so the step holds
             the pending face and comes back. */
          onNext={noop}
          onBack={() => go('survey')}
          onOpenDashboard={noop}
          {...props}
        />
      </div>
    );
  }

  function payment(props: Partial<ComponentProps<typeof PaymentStep>>) {
    return (
      <div className='relative'>
        <StepCounter step={3} totalSteps={TOTAL_STEPS} />
        <PaymentStep
          orgId={liveOrgId}
          orgName='Acme'
          initialHasCard={false}
          initialGrantAvailability='available'
          onCardSaved={noop}
          onUseDifferentCard={noop}
          onNext={noop}
          onBack={() => go('create-org')}
          {...props}
        />
      </div>
    );
  }

  function github() {
    return (
      <div className='relative'>
        <StepCounter step={4} totalSteps={TOTAL_STEPS} />
        <ConnectGithubStep orgId={liveOrgId} onBack={() => go('payment')} />
      </div>
    );
  }

  switch (id) {
    case 'signin':
      // The main sign-in page's content (signin/(main)/page.tsx).
      return <SignInForm callbackUrl='/' />;
    case 'cli-terminal':
      return <CliTerminal />;
    case 'survey':
      return (
        <SurveyFixture
          key={id}
          initial={EMPTY_SURVEY_VALUES}
          userEmail={accountEmail}
        />
      );
    case 'survey-required':
      return (
        <SurveyFixture
          key={id}
          initial={EMPTY_SURVEY_VALUES}
          userEmail='dev@gmail.com'
          requireCompanyWebsite
        />
      );
    case 'survey-size':
      return (
        <SurveyFixture
          key={id}
          initial={surveyStage(accountDomain, 1)}
          userEmail={accountEmail}
        />
      );
    case 'survey-source':
      return (
        <SurveyFixture
          key={id}
          initial={surveyStage(accountDomain, 2, { companySize: '11-50' })}
          userEmail={accountEmail}
        />
      );
    case 'survey-ai-tool':
      return (
        <SurveyFixture
          key={id}
          initial={surveyStage(accountDomain, LAST_SURVEY_SUBSTEP, {
            companySize: '11-50',
            hearAboutUs: AI_TOOLS_REFERRAL_VALUE,
          })}
          userEmail={accountEmail}
        />
      );
    case 'survey-frameworks':
      return (
        <SurveyFixture
          key={id}
          initial={surveyStage(accountDomain, LAST_SURVEY_SUBSTEP, {
            companySize: '11-50',
            hearAboutUs: AI_TOOLS_REFERRAL_VALUE,
            aiTool: 'Gemini',
            frameworks: ['Next.js', 'React', 'Python'],
          })}
          userEmail={accountEmail}
        />
      );
    case 'create-org':
      return createOrg({});
    case 'create-org-cap':
      return createOrg({ orgLimitReached: true, existingOrgs: previewOrgs });
    case 'create-org-project-limit':
      return createOrg({
        initialBlocked: { reason: 'project_limit_reached', orgId: liveOrgId },
      });
    case 'payment':
      return payment({ formPreview });
    case 'payment-card-saved':
      return payment({ initialHasCard: true });
    case 'payment-card-used':
      return payment({
        initialHasCard: true,
        initialGrantAvailability: 'card-used',
      });
    case 'payment-unavailable':
      return payment({
        initialHasCard: true,
        initialGrantAvailability: 'unavailable',
      });
    case 'payment-unavailable-no-card':
      return payment({ initialGrantAvailability: 'unavailable', formPreview });
    case 'github':
      return github();
    case 'verify-request':
      return (
        <AuthFrame
          title='Check your email'
          lede='We sent a sign-in link to your email address. Open it to finish signing in. The link works once and expires in 15 minutes.'
          footnote={
            <>
              Wrong address, or no email after a minute?{' '}
              {/* The real page links to /signin; here the link turns the
                  gallery back to the sign-in state. */}
              <button
                type='button'
                className='text-foreground underline underline-offset-4'
                onClick={() => go('signin')}
              >
                Try again
              </button>
              .
            </>
          }
        />
      );
    case 'auth-error':
      return (
        <AuthFrame
          title='Something went wrong'
          lede='We could not sign you in. The link may have expired or already been used. Start again and we will send a new one.'
        />
      );
    case 'oauth-signin':
      return (
        <AuthFrame>
          <SignInForm
            callbackUrl='/signin/consent?client_id=gt-cli'
            oauthQuery='client_id=gt-cli'
            header={
              <div className='flex flex-col gap-3'>
                <h1 className={authTitleClassName}>
                  Sign in to authorize this application
                </h1>
                <p className={authLedeClassName}>
                  We&apos;ll return you to the authorization request after
                  sign-in.
                </p>
              </div>
            }
          />
        </AuthFrame>
      );
    case 'consent-trusted':
      return (
        <OAuthConsent
          clientName='gt-cli'
          clientDetails={{
            metadataHostname: null,
            callbackHostname: '127.0.0.1',
            callbackType: 'local',
            redirectUri: 'http://127.0.0.1:53211/callback',
          }}
          accountEmail={accountEmail}
          trusted
          scopes={allScopes}
          requestedClaims={['email', 'name']}
          oauthQuery='client_id=gt-cli'
          navigate={noop}
        />
      );
    case 'consent-untrusted':
      return (
        <OAuthConsent
          clientName='Acme Localization Bot'
          clientDetails={{
            metadataHostname: 'bot.acme.com',
            callbackHostname: 'bot.acme.com',
            callbackType: 'web',
            redirectUri: 'https://bot.acme.com/oauth/callback',
          }}
          accountEmail={accountEmail}
          scopes={narrowScopes}
          requestedClaims={['email']}
          oauthQuery='client_id=https%3A%2F%2Fbot.acme.com%2Fclient.json'
          navigate={noop}
        />
      );
    case 'consent-invalid':
      return <InvalidConsentState />;
    case 'device-code':
      return <DeviceCodeForm />;
    case 'device-invalid':
      return <DeviceCodeForm error='invalid_code' defaultValue='HXKD-QPWM' />;
    case 'device-expired':
      return <DeviceCodeForm error='expired_code' defaultValue='HXKD-QPWM' />;
    case 'device-processed':
      return <DeviceCodeForm error='processed_code' defaultValue='HXKD-QPWM' />;
    case 'device-approval':
      return (
        <DeviceApproval
          userCode='HXKD-QPWM'
          clientName='gt-cli'
          accountEmail={accountEmail}
          trusted
          scopes={allScopes}
        />
      );
    case 'device-blocked':
      return <BlockedState />;
    case 'cli-wizard':
      return (
        <CliWizard
          sessionId='ses_preview'
          orgs={cliOrgs}
          projects={cliProjects}
        />
      );
    case 'cli-wizard-done':
      return <CompletedSessionState />;
    case 'cli-wizard-expired':
      return <InvalidSessionState />;
    default:
      return null;
  }
}
