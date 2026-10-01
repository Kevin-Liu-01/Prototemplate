// Copied from the dashboard's src/lib/authErrorCodes.ts.
//
// Stable error *types* the auth API returns instead of a localized message.
// The sign-in UI owns the translation: it maps each code to a `gt()` string in
// its own gt-next context (the page/form already has the user's locale), so the
// server never needs to know the locale or send translated text.
//
// Keep in sync between the throw sites in `auth.ts` and the maps in
// `sign-in-form.tsx` / `signin/page.tsx`.
export const AUTH_ERROR_CODE = {
  /** Magic link refused: email is consumer/free or disposable. */
  consumerEmail: 'consumer_email_not_allowed',
  /** Magic link refused: sanctioned jurisdiction. */
  sanctionedEmail: 'sanctioned_email',
  /** Magic link / login refused: domain enforces SSO. */
  ssoRequired: 'sso_required',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];
