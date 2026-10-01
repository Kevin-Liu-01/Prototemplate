'use client';

import SignInForm from '@/components/plate/pages/auth/SignInForm';

type SignInPageProps = {
  /** Where sign-in lands afterwards; the dashboard reads it from the query. */
  callbackUrl?: string;
  initialError?: string;
  defaultEmail?: string;
  onlyShowSSO?: boolean;
};

/**
 * The main sign-in page's content (the dashboard's signin/(main)/page.tsx).
 * There a server component reads the session, the redirect query and the
 * error cookies; here those arrive as props, with the gallery's defaults
 * (callbackUrl '/' and no error). The gallery's frame supplies the field,
 * the mark and the foot.
 */
export default function SignInPage({
  callbackUrl = '/',
  initialError,
  defaultEmail,
  onlyShowSSO,
}: SignInPageProps) {
  return (
    <SignInForm
      callbackUrl={callbackUrl}
      initialError={initialError}
      defaultEmail={defaultEmail}
      onlyShowSSO={onlyShowSSO}
    />
  );
}
