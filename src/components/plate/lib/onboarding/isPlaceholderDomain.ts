// Domains that are never a real customer: common placeholder and example
// values people type instead of their actual company domain, plus GT's own
// domains. Copied from the dashboard's packages/settings/src/
// isPlaceholderDomain.ts for the survey step's website check. Pass a bare
// domain (no protocol or path); for an email, pass the part after `@`.

import { CONSUMER_EMAIL_DOMAINS } from './isBusinessEmail';

// Exact placeholder and example domains.
const PLACEHOLDER_DOMAINS = new Set<string>([
  'localhost',
  'acme.com',
  'example.com',
  'example.org',
  'example.net',
  'github.com',
  'mycompany.com',
  'my-company.com',
  'yourcompany.com',
  'your-company.com',
]);

// GT's own domains: blocked with every subdomain (dash.generaltranslation.com,
// cdn.gtx.dev). Matched as the root domain or any `*.<suffix>`.
const INTERNAL_DOMAIN_SUFFIXES = ['generaltranslation.com', 'gtx.dev'];

// Normalizes a domain for comparison: lowercase, trimmed, without a leading
// `www.` or a trailing port.
function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^www\./, '')
    .replace(/:\d+$/, '');
}

// Raw membership in the placeholder and internal lists (no ownership
// exemption). Expects an already normalized domain.
function isInBlockedDomainLists(normalized: string): boolean {
  return (
    PLACEHOLDER_DOMAINS.has(normalized) ||
    INTERNAL_DOMAIN_SUFFIXES.some(
      (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`)
    )
  );
}

/**
 * True if `domain` is a placeholder or example value or one of GT's own
 * domains (including subdomains). Normalizes case, surrounding whitespace,
 * a leading `www.` and a trailing port before matching.
 *
 * Pass `ownerEmailDomain` (the part after `@` of the user's verified email)
 * to exempt a blocked domain the user owns: signed in as you@mycompany.com,
 * mycompany.com really is your company, and only an @generaltranslation.com
 * email can claim generaltranslation.com. The exemption matches the email
 * domain itself or any subdomain of it.
 */
export function isPlaceholderOrInternalDomain(
  domain: string,
  ownerEmailDomain?: string
): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  const normalized = normalizeDomain(domain);

  if (!normalized) {
    return false;
  }

  if (!isInBlockedDomainLists(normalized)) {
    return false;
  }

  // A blocked domain the user owns, proven by the verified email domain.
  if (ownerEmailDomain && typeof ownerEmailDomain === 'string') {
    const ownDomain = normalizeDomain(ownerEmailDomain);
    if (
      ownDomain &&
      (normalized === ownDomain || normalized.endsWith(`.${ownDomain}`))
    ) {
      return false;
    }
  }

  return true;
}

/**
 * True if `domain` cannot be a real company website: a placeholder or
 * internal value, or a free consumer email provider (gmail.com and the
 * like), since no real company uses one as its site. Used when a genuine
 * company website is required from weak-signal signups (a consumer or
 * disposable email) during onboarding.
 *
 * The `ownerEmailDomain` exemption applies only to the placeholder and
 * internal part; a free consumer provider is rejected regardless, since
 * nobody owns gmail.com by having an account there.
 */
export function isUnusableCompanyWebsiteDomain(
  domain: string,
  ownerEmailDomain?: string
): boolean {
  if (isPlaceholderOrInternalDomain(domain, ownerEmailDomain)) {
    return true;
  }

  if (!domain || typeof domain !== 'string') {
    return false;
  }

  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return false;
  }

  // Internal domains (generaltranslation.com) also appear in
  // CONSUMER_EMAIL_DOMAINS for ping suppression, so anything in the blocked
  // lists is left out here: the ownership-aware check above already decided
  // those.
  if (
    CONSUMER_EMAIL_DOMAINS.has(normalized) &&
    !isInBlockedDomainLists(normalized)
  ) {
    return true;
  }

  return false;
}
