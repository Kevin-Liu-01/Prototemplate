import type { Metadata, Viewport } from 'next';

import GoogleAnalytics from '@/lib/analytics';
import { fontVariables } from '@/lib/fonts';
import { OG_HEIGHT, OG_WIDTH, cardPath } from '@/lib/seo/card-url';
import { webSite } from '@/lib/seo/json-ld';
import JsonLd from '@/lib/seo/JsonLd';
import {
  GOOGLE_SITE_VERIFICATION,
  HUB_ICONS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER_CREATOR,
  TWITTER_SITE,
} from '@/lib/seo/site';

import ProdSystemTheme from './d/production/ProdSystemTheme';

import './globals.css';
import './inter-subsets.css';
import '@/components/viewer/tokens.css';

/* the site card, which a route that sets no card of its own shows; every
   route that calls seoRoute writes its own */
const SITE_CARD = {
  url: `${SITE_URL}${cardPath({ title: SITE_NAME, description: SITE_DESCRIPTION, kind: 'page', path: '/' })}`,
  width: OG_WIDTH,
  height: OG_HEIGHT,
  type: 'image/png',
  alt: SITE_NAME,
};

/* No alternates and no openGraph.url here: Next merges metadata
   shallowly, so a canonical set at the root was inherited by every route
   that set none and named the home page as each one's original. Each
   route's canonical comes from seoRoute (src/lib/seo/route.ts). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s, Prototemplate',
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Prototemplate',
  keywords: [
    'Prototemplate',
    'General Translation',
    'knowledge base',
    'agent skills',
    'handbook',
    'AGENTS.md',
    'brand book',
    'brand guidelines',
    'website redesign',
    'design explorations',
    'art direction',
    'landing page design',
    'localization',
    'internationalization',
    'i18n',
    'WebGL shaders',
    'GSAP',
    'creative web design',
    'design gallery',
  ],
  authors: [
    { name: 'Kevin Liu' },
    { name: 'General Translation', url: 'https://generaltranslation.com' },
  ],
  creator: 'Kevin Liu',
  publisher: 'General Translation',
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_CARD],
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_SITE,
    creator: TWITTER_CREATOR,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_CARD.url, alt: SITE_CARD.alt }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: HUB_ICONS,
  verification: { google: GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070707' },
  ],
};

/**
 * The theme boot script. It stamps html[data-theme] before first paint
 * from the saved choice (gt-theme). With nothing saved the site opens dark,
 * so the shell's post-hydration assertion in ThemeButton agrees with the
 * first paint, except under /d/production: the mirror of generaltranslation
 * follows prefers-color-scheme as the live site does, marks the html with
 * data-theme-from='system', and keeps following the system setting until
 * the visitor picks a theme (src/app/d/production/ProdSystemTheme.tsx
 * handles arriving and leaving by client navigation).
 *
 * A same-origin frame (the gallery exhibit, the compare panes) receives the
 * parent's write as a storage event, so every loaded frame follows the
 * toggle with no per-frame code. A framed page also follows a same-origin
 * postMessage({ type: 'gt-theme', theme }) from the page around it
 * (ThemeButton.tsx posts one to every frame on each toggle), which reaches
 * it when storage cannot, in a private window; a theme set that way is
 * marked data-theme-from='message' and the system setting no longer moves
 * it.
 *
 * The saved shell list state (gt-shell-sb '0', gt-shell-density 'thumbs')
 * is stamped as data-shell-sb and data-shell-density for the same reason:
 * ViewerShell.css reads them until the shell has settled, so the first
 * paint already shows the closed list or the wider column and hydration
 * never shifts the layout (directive 7.5).
 */
const THEME_SCRIPT = [
  '(function(){',
  'var d=document.documentElement;',
  "function saved(){try{var t=localStorage.getItem('gt-theme');return t==='light'||t==='dark'?t:null}catch(e){return null}}",
  "var q=null;try{q=window.matchMedia('(prefers-color-scheme: dark)')}catch(e){}",
  "function sys(){return q&&q.matches?'dark':'light'}",
  'var t=saved();',
  "if(t){d.dataset.theme=t}else if(q&&/^\\/d\\/production(\\/|$)/.test(location.pathname)){d.dataset.theme=sys();d.dataset.themeFrom='system'}else{d.dataset.theme='dark'}",
  "try{if(localStorage.getItem('gt-shell-sb')==='0')d.dataset.shellSb='0';if(localStorage.getItem('gt-shell-density')==='thumbs')d.dataset.shellDensity='thumbs'}catch(e){}",
  "if(q){var f=function(){if(d.dataset.themeFrom==='system'&&!saved())d.dataset.theme=sys()};if(q.addEventListener)q.addEventListener('change',f);else if(q.addListener)q.addListener(f)}",
  "window.addEventListener('storage',function(e){if(e.key==='gt-theme'&&(e.newValue==='light'||e.newValue==='dark')){d.dataset.theme=e.newValue;delete d.dataset.themeFrom}});",
  "window.addEventListener('message',function(e){var m=e&&e.data;if(!m||m.type!=='gt-theme'||(m.theme!=='light'&&m.theme!=='dark')||e.origin!==location.origin)return;d.dataset.theme=m.theme;d.dataset.themeFrom='message'});",
  '})();',
].join('');

/**
 * The rAF gate: an embedding parent can freeze and resume this page's
 * animation loops with postMessage({ type: 'gt:freeze', frozen }); queued
 * callbacks flush on resume, so shaders and scroll loops pick up where they
 * left off. The presenter uses it to idle its prototype stage while the
 * stage is off screen. A framed page loaded with ?frozen=1 starts frozen.
 */
const RAF_GATE_SCRIPT =
  "(function(){var n=window.requestAnimationFrame.bind(window);var q=[];var f=window.parent!==window&&/[?&]frozen=1(&|$)/.test(location.search);window.requestAnimationFrame=function(cb){if(f){q.push(cb);return -1}return n(cb)};window.addEventListener('message',function(e){var d=e&&e.data;if(!d||d.type!=='gt:freeze')return;f=!!d.frozen;if(!f){var p=q;q=[];for(var i=0;i<p.length;i++)n(p[i])}})})();";

const BOOT_SCRIPTS = `<script>${THEME_SCRIPT}</script><script>${RAF_GATE_SCRIPT}</script>`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={fontVariables} suppressHydrationWarning>
      {/* suppressHydrationWarning: extensions (Grammarly et al.) stamp
          attributes on <body> before React hydrates, and the mismatch
          logs a console error Lighthouse counts against the page; the
          flag is attribute-only, one level deep, so real bugs still warn */}
      <body suppressHydrationWarning>
        {/* The boot scripts, emitted as markup inside a hidden wrapper (the
            way gt-cloud's ThemePreferenceInitScript does it) instead of as
            React <script> elements: the browser runs them while it parses
            the first child of <body>, before anything paints, and React
            never creates a <script> on the client, so a not-found render or
            a hot reload that rebuilds the layout logs no "Encountered a
            script tag" warning. */}
        <div hidden dangerouslySetInnerHTML={{ __html: BOOT_SCRIPTS }} />
        <JsonLd nodes={[webSite()]} />
        {children}
        {/* the production mirror's system theme on client navigation, in and
            out of /d/production; it renders nothing */}
        <ProdSystemTheme />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
