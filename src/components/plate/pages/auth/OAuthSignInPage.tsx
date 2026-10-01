'use client';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame, {
  authLedeClassName,
  authTitleClassName,
} from '@/components/plate/pages/auth/AuthFrame';
import SignInForm from '@/components/plate/pages/auth/SignInForm';

type OAuthSignInPageProps = {
  /** The signed authorization query the consent page verifies afterwards. */
  oauthQuery?: string;
  initialError?: string;
  defaultEmail?: string;
  onlyShowSSO?: boolean;
};

/**
 * The sign-in page a client's authorization request opens when the browser
 * has no session (the dashboard's signin/oauth/page.tsx). The form owns its
 * heading so the SSO view can swap it; the frame supplies the column, the
 * mark and the crosses. The query arrives as a prop, the gallery's being
 * the CLI's client id.
 */
export default function OAuthSignInPage({
  oauthQuery = 'client_id=gt-cli',
  initialError,
  defaultEmail,
  onlyShowSSO,
}: OAuthSignInPageProps) {
  return (
    <AuthFrame>
      <SignInForm
        initialError={initialError}
        defaultEmail={defaultEmail}
        onlyShowSSO={onlyShowSSO}
        callbackUrl={`/signin/consent?${oauthQuery}`}
        oauthQuery={oauthQuery}
        header={
          <div className='flex flex-col gap-3'>
            <T>
              <h1 className={authTitleClassName}>
                Sign in to authorize this application
              </h1>
              <p className={authLedeClassName}>
                We&apos;ll return you to the authorization request after
                sign-in.
              </p>
            </T>
          </div>
        }
      />
    </AuthFrame>
  );
}
