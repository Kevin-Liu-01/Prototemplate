/**
 * List of common free email providers, copied from the dashboard's
 * packages/settings/src/isBusinessEmail.ts. These are excluded when
 * identifying business emails. The list is broad because a business
 * behind one of these is caught in the survey.
 */
export const CONSUMER_EMAIL_DOMAINS = new Set([
  // Major global free providers
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  // Relay and alias services: anonymized addresses, never a business domain
  'privaterelay.appleid.com',
  'private.icloud.com',
  'duck.com',
  'mozmail.com',
  'simplelogin.io',
  'addy.io',
  'anonaddy.com',
  '33mail.com',

  // Microsoft regional variants (common)
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'hotmail.nl',
  'hotmail.com.br',
  'hotmail.com.ar',
  'hotmail.com.mx',
  'outlook.co.uk',
  'outlook.fr',
  'outlook.de',
  'outlook.es',
  'outlook.it',
  'outlook.com.br',
  'outlook.com.ar',
  'outlook.com.mx',
  'live.co.uk',
  'live.com.mx',

  // Yahoo regional variants (common)
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.co.jp',
  'yahoo.co.in',
  'yahoo.com.br',
  'yahoo.com.mx',
  'yahoo.com.ar',
  'yahoo.com.tw',
  'yahoo.com.hk',
  'yahoo.com.sg',
  'yahoo.co.id',

  // Privacy-focused personal mail
  'protonmail.com',
  'protonmail.ch',
  'proton.me',
  'pm.me',
  'tutanota.com',
  'tutanota.de',
  'tutamail.com',
  'tuta.com',
  'tuta.io',
  'keemail.me',
  'mailfence.com',
  'startmail.com',
  'posteo.de',
  'disroot.org',
  'riseup.net',
  'hushmail.com',

  // Freemium and personal mail services
  'fastmail.com',
  'fastmail.fm',
  'fastmail.net',
  'fastmail.org',
  'fastmail.co.uk',
  'fastmail.com.au',
  'fastmail.de',
  'fastmail.fr',
  'fastmail.es',
  'fastmail.in',
  'fastmail.jp',
  'fastmail.us',
  'myfastmail.com',
  'sent.com',
  'pobox.com',
  'hey.com',
  'zoho.com',
  'zohomail.com',
  'zohomail.in',
  'zoho.in',
  'inbox.com',

  // Europe, Germany, Switzerland
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'web.de',
  'mail.com',
  'email.com',
  // mail.com free vanity domains, shared and brand neutral
  'usa.com',
  'myself.com',
  'consultant.com',
  'post.com',
  'dr.com',
  'execs.com',
  'europe.com',
  'engineer.com',
  'asia.com',
  'iname.com',
  'techie.com',
  'contractor.net',
  'accountant.com',
  'hackermail.com',
  'programmer.net',
  'linuxmail.org',
  't-online.de',
  'freenet.de',

  // France
  'laposte.net',
  'orange.fr',
  'sfr.fr',
  'free.fr',
  'wanadoo.fr',

  // Italy
  'libero.it',
  'virgilio.it',
  'alice.it',
  'tin.it',

  // Spain and Portugal
  'terra.es',
  'terra.com.br',

  // Russia and CIS
  'yandex.com',
  'yandex.ru',
  'ya.ru',
  'mail.ru',
  'inbox.ru',
  'list.ru',
  'bk.ru',
  'rambler.ru',

  // China, Taiwan, Hong Kong
  'qq.com',
  'foxmail.com',
  '163.com',
  '126.com',
  'yeah.net',
  'sina.com',
  'sohu.com',

  // Korea
  'naver.com',
  'daum.net',
  'hanmail.net',
  'nate.com',

  // Japan
  'ezweb.ne.jp',
  'docomo.ne.jp',
  'softbank.ne.jp',

  // India
  'rediffmail.com',

  // Eastern Europe
  'seznam.cz',
  'email.cz',
  'centrum.cz',
  'atlas.cz',
  'wp.pl',
  'o2.pl',
  'onet.pl',
  'interia.pl',
  'op.pl',
  'freemail.hu',
  'citromail.hu',
  'azet.sk',
  'abv.bg',
  'mail.bg',
  'ukr.net',
  'i.ua',
  'meta.ua',
  'tut.by',

  // Brazil
  'uol.com.br',
  'bol.com.br',
  'ig.com.br',

  // Israel
  'walla.co.il',
  'walla.com',

  // ISP, telco and cable providers: US
  'comcast.net',
  'verizon.net',
  'att.net',
  'sbcglobal.net',
  'bellsouth.net',
  'charter.net',
  'cox.net',
  'earthlink.net',
  'optonline.net',
  'frontier.com',
  'frontiernet.net',
  'spectrum.net',
  'rr.com',
  'roadrunner.com',
  'twc.com',

  // UK and Ireland
  'btinternet.com',
  'virginmedia.com',
  'talktalk.net',
  'sky.com',
  'sky.co.uk',
  'eircom.net',

  // Canada
  'rogers.com',
  'shaw.ca',
  'bell.net',
  'sympatico.ca',

  // Australia and New Zealand
  'bigpond.com',
  'bigpond.net.au',
  'telstra.com',
  'xtra.co.nz',

  // Internal: suppresses pings during testing
  'generaltranslation.com',
]);

export function isBusinessEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailParts = email.toLowerCase().trim().split('@');
  if (emailParts.length !== 2) {
    return false;
  }

  const domain = emailParts[1];
  return !CONSUMER_EMAIL_DOMAINS.has(domain ?? 'unknown');
}
