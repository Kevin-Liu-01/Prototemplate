import { isBusinessEmail } from './isBusinessEmail';

// Weak-signal signups (a non-business email) must provide a real company
// website during onboarding: it is the lead-qualifying signal lost when the
// email domain is junk. The dashboard also checks an S3-backed disposable
// email list here; the port has no such store, so a business-looking domain
// never requires the website. Kept async so callers match the dashboard's.
export async function requiresCompanyWebsite(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false;
  return !isBusinessEmail(email);
}
