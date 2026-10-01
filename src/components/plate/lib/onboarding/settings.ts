// The constants the onboarding steps read from packages/settings and
// packages/node in the dashboard, restated here so the port carries no
// workspace dependency. The values are the dashboard's at the time of the
// port (settings/credits.ts, settings/email.ts,
// node/database/billing/signupCreditGrant.ts).

/** The signup grant the payment step names, in whole dollars. */
export const SIGNUP_CREDIT_GRANT_DOLLARS = 10;

export const SUPPORT_EMAIL = 'support@generaltranslation.com';

/**
 * Coarse availability of the signup grant for the onboarding UI:
 * 'card-used' means swapping the card can still earn the grant,
 * 'unavailable' means it cannot (the account already claimed).
 */
export type SignupGrantUiAvailability = 'available' | 'card-used' | 'unavailable';

const WHOLE_DOLLARS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * "$10", never "$10.00". The dashboard prints the amount through gt-next's
 * Currency with maximumFractionDigits 0; the shim has no Currency, so the
 * steps format the amount here.
 */
export function formatWholeDollars(amount: number): string {
  return WHOLE_DOLLARS.format(amount);
}
