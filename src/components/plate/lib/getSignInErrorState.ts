// Copied from the dashboard's src/lib/getSignInErrorState.ts. There it reads
// the signin_error_* cookies through next/headers on the server; the port
// has no request, so the cookie values arrive as an argument (empty in the
// gallery) and the function runs anywhere. The sanctioned-email message is
// the dashboard's isSanctionedEmail.ts constant, declared here.

import { getGT } from '@/components/plate/shims/gt-next-server';

import { AUTH_ERROR_CODE } from './authErrorCodes';

/**
 * User-facing message shown when signup is refused for a sanctioned email.
 * The OAuth error flow URL-slugifies this text (spaces to underscores), and
 * the sign-in page matches on that slug to surface the real reason.
 */
export const SANCTIONED_SIGNUP_MESSAGE =
  'We are not able to support your email.';

/** The values of the signin_error_code, _message and _email cookies. */
export type SignInErrorCookies = {
  code?: string;
  message?: string;
  email?: string;
};

export async function getSignInErrorState(
  errorParam?: string,
  cookies: SignInErrorCookies = {}
) {
  const gt = await getGT();
  const errorCode = cookies.code;
  const errorMessage = cookies.message;
  const errorEmail = cookies.email;
  let initialError: string | undefined;
  let defaultEmail: string | undefined;

  if (errorCode && errorMessage) {
    initialError =
      errorCode === AUTH_ERROR_CODE.ssoRequired
        ? gt(
            'Your organization requires SSO sign-in. Please continue with your identity provider.'
          )
        : errorMessage;
    defaultEmail = errorEmail;
  } else if (errorParam) {
    // Better Auth replaces spaces with underscores in callback error messages.
    if (errorParam === SANCTIONED_SIGNUP_MESSAGE.split(' ').join('_')) {
      initialError = gt('We are not able to support your email.');
    } else if (errorParam === 'ip_not_allowed') {
      initialError = gt(
        'Your organization restricts dashboard access to trusted network locations.'
      );
    } else {
      initialError = gt(
        'There was a problem signing you in. Please try again.'
      );
    }
  }

  return {
    initialError,
    defaultEmail,
    onlyShowSSO: errorCode === AUTH_ERROR_CODE.ssoRequired,
  };
}
