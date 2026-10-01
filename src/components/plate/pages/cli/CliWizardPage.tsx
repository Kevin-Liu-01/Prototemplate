'use client';

import { T } from '@/components/plate/shims/gt-next';
import type {
  AuthorizedOrg,
  AuthorizedProject,
} from '@/components/plate/lib/authorization';
import AuthFrame, {
  authLedeClassName,
  authTitleClassName,
} from '@/components/plate/pages/auth/AuthFrame';
import SignInForm from '@/components/plate/pages/auth/SignInForm';

import CliWizard from './CliWizard';
import CompletedSessionState from './CompletedSessionState';
import InvalidSessionState from './InvalidSessionState';

type CliWizardPageProps = {
  sessionId: string;
  /**
   * What the server found for the session: `pending` shows the wizard,
   * `completed` the already-authorized face, `expired` the invalid-session
   * face, `signed-out` the sign-in form that returns to the wizard.
   */
  status?: 'pending' | 'completed' | 'expired' | 'signed-out';
  orgs?: AuthorizedOrg[];
  projects?: AuthorizedProject[];
};

/**
 * The CLI wizard page (the dashboard's cli/wizard/[sessionId]/page.tsx).
 * There a server component loads the session and the signed-in account's
 * organizations; here they arrive as props. The gallery's frame supplies
 * the field (scene 1, the gloss picture), the mark and the foot.
 */
export default function CliWizardPage({
  sessionId,
  status = 'pending',
  orgs = [],
  projects = [],
}: CliWizardPageProps) {
  if (status === 'expired') return <InvalidSessionState />;
  if (status === 'completed') return <CompletedSessionState />;

  if (status === 'signed-out') {
    return (
      <AuthFrame>
        <SignInForm
          callbackUrl={`/cli/wizard/${sessionId}`}
          header={
            <div className='flex flex-col gap-3'>
              <T>
                <h1 className={authTitleClassName}>
                  Sign in to authorize the CLI
                </h1>
                <p className={authLedeClassName}>
                  We&apos;ll send you back to the CLI authorization flow after
                  sign-in.
                </p>
              </T>
            </div>
          }
        />
      </AuthFrame>
    );
  }

  return <CliWizard sessionId={sessionId} orgs={orgs} projects={projects} />;
}
