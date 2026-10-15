/**
 * Who publishes the site and the ids the JSON-LD graph links by. The host
 * constants live in policy.ts, which a Node script can load; this file
 * re-exports the one most callers want.
 */
import { GT_URL, SITE_URL } from './policy';

export { SITE_URL };

export const SITE_NAME = 'Prototemplate';

/** The short site description: the root layout's default and the WebSite node's. Under 160 characters. */
export const SITE_DESCRIPTION =
  "Kevin Liu's hub for General Translation design work: the design lab, the brand book, the deck, the handbook, the curated skills and the docs.";

/** The public repository the site deploys from. */
export const REPO_URL = 'https://github.com/Kevin-Liu-01/Prototemplate';

/** The site's WebSite node. */
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** GT's site owns the Organization entity; this site refers to it by id with its name and url and publishes no Organization of its own. */
export const GT_ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${GT_URL}/#organization`,
  name: 'General Translation',
  url: GT_URL,
} as const;

/** The site's author. */
export const KEVIN = {
  '@type': 'Person',
  name: 'Kevin Liu',
  url: 'https://github.com/Kevin-Liu-01',
} as const;

/** X accounts on every card (Kevin, 2026-10-14): GT's account as the site, Kevin's as the creator. */
export const TWITTER_SITE = '@generaltxn';
export const TWITTER_CREATOR = '@kevskgs';

/** The tab icons: the Prototemplate mark on the hub, the GT mark on the GT design studies and the presenter. */
export const HUB_ICON = { url: '/pt-mark.svg', type: 'image/svg+xml' } as const;
export const GT_ICON = { url: '/brand/no-bg-gt-logo-light.png', type: 'image/png' } as const;
