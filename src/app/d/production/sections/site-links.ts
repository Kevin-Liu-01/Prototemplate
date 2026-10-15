const BASE = '/d/production';

/**
 * The live addresses of the terms and the privacy policy. The directions
 * that borrow these constants (calendar-rings) send readers to the live
 * site, so they keep them.
 */
export const TERMS_URL = 'https://generaltranslation.com/legal/terms';
export const PRIVACY_URL = 'https://generaltranslation.com/legal/privacy-policy';

/**
 * The mirror's own addresses for the pages the live forms, the consent
 * banner and the pricing links point at: the legal documents
 * (/legal/<document>) and the usage rates page (/pricing/usage), each
 * rebuilt under /d/production.
 */
export const PROD_TERMS_URL = `${BASE}/legal/terms`;
export const PROD_PRIVACY_URL = `${BASE}/legal/privacy-policy`;
export const USAGE_RATES_URL = `${BASE}/pricing/usage`;
export const COOKIE_POLICY_URL = `${BASE}/legal/cookie-policy`;
