import Script from 'next/script';

import { PRIVATE_PATHS } from '@/lib/seo/policy';

/* The site's GA4 measurement ID. It is public: every page that loads the tag sends it. */
const GA_ID = 'G-G68V03ZX1Z';

/* A private page and every page under it (policy.ts, PRIVATE_PATHS), as a pattern over location.pathname. */
const PRIVATE_PATTERN = `^(?:${PRIVATE_PATHS.map((path) => path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|')})(?:/|$)`;

/* Consent Mode v2 defaults, set before gtag.js loads: no ad storage or ad
   personalization anywhere, and visits from the EEA, the UK and Switzerland
   measured without analytics cookies. GA reads its disable flag at every
   hit, so the flag is a getter over the current path: no hit leaves from a
   private page, on the first load or after a client navigation, and its
   path (which can name a private decision) never reaches Google. */
const GA_BOOT = [
  'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}',
  `Object.defineProperty(window,'ga-disable-${GA_ID}',{configurable:true,get:function(){return new RegExp(${JSON.stringify(PRIVATE_PATTERN)}).test(location.pathname)}});`,
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','GB']});",
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});",
  `gtag('js',new Date());gtag('config','${GA_ID}');`,
].join('');

/**
 * Google Analytics 4, on production deployments only: previews, local
 * servers and test runs render nothing and send no hits. Client navigations
 * are counted by GA4's enhanced measurement (history events), so no page
 * view is sent by hand.
 */
export default function GoogleAnalytics() {
  if (process.env.VERCEL_ENV !== 'production') return null;
  return (
    <>
      <Script id='ga-consent' strategy='afterInteractive'>
        {GA_BOOT}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy='afterInteractive' />
    </>
  );
}
