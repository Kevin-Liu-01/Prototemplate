/**
 * Destinations on the live site for pages this control does not carry.
 * The legal documents and the usage rates page were prototype routes under
 * /d/production until Kevin removed them, so the links that pointed at them
 * (the sign-in and contact forms' legal lines, the pricing page's rate
 * links) leave for generaltranslation.com instead of a concept path that
 * would 404.
 */
export const TERMS_URL = 'https://generaltranslation.com/legal/terms';
export const PRIVACY_URL = 'https://generaltranslation.com/legal/privacy-policy';
export const USAGE_RATES_URL = 'https://generaltranslation.com/pricing/usage';
