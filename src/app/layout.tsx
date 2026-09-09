import type { Metadata, Viewport } from 'next';

import { fontVariables } from '@/lib/fonts';

import './globals.css';
import '@/components/viewer/tokens.css';

const SITE_URL = 'https://prototemplate.vercel.app';

const SITE_TITLE = 'Prototemplate';

const SITE_DESCRIPTION =
  'Prototemplate is the General Translation knowledge base: the brand book, the brand directives, the design lab with its directions and sites, the repository documents, the agent skills, and the mark explorations, read in one viewer.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s, Prototemplate',
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Prototemplate',
  keywords: [
    'Prototemplate',
    'General Translation',
    'knowledge base',
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
    siteName: 'Prototemplate',
    type: 'website',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 2400,
        height: 1260,
        alt: 'Prototemplate, the General Translation knowledge base.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
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
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070707' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={fontVariables} suppressHydrationWarning>
      <head>
        {/* apply the persisted theme before first paint; dark when nothing
            is saved, the site default, so the shell's post-hydration
            assertion in ThemeButton agrees with the first paint. A
            same-origin frame (the gallery exhibit, the compare panes) also
            receives the parent's write as a storage event, so every loaded
            frame follows the toggle with no per-frame code. The saved shell
            list state (gt-shell-sb '0', gt-shell-density 'thumbs') is
            stamped as data-shell-sb and data-shell-density for the same
            reason: ViewerShell.css reads them until the shell has settled,
            so the first paint already shows the closed list or the wider
            column and hydration never shifts the layout (directive 7.5).
            A framed page also follows a same-origin
            postMessage({ type: 'gt-theme', theme }) from the page around it
            (ThemeButton.tsx posts one to every frame on each toggle), which
            reaches it when storage cannot, in a private window. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gt-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}try{if(localStorage.getItem('gt-shell-sb')==='0')document.documentElement.dataset.shellSb='0';if(localStorage.getItem('gt-shell-density')==='thumbs')document.documentElement.dataset.shellDensity='thumbs'}catch(e){}window.addEventListener('storage',function(e){if(e.key==='gt-theme'&&(e.newValue==='light'||e.newValue==='dark'))document.documentElement.dataset.theme=e.newValue});window.addEventListener('message',function(e){var d=e&&e.data;if(!d||d.type!=='gt-theme'||(d.theme!=='light'&&d.theme!=='dark')||e.origin!==location.origin)return;document.documentElement.dataset.theme=d.theme});",
          }}
        />
        {/* rAF gate: an embedding parent can freeze/resume this page's
            animation loops with postMessage({type:'gt:freeze',frozen});
            queued callbacks flush on resume, so shaders and scroll loops
            pick up where they left off. The presenter uses it to idle its
            wall of live thumbnails. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var n=window.requestAnimationFrame.bind(window);var q=[];var f=false;window.requestAnimationFrame=function(cb){if(f){q.push(cb);return -1}return n(cb)};window.addEventListener('message',function(e){var d=e&&e.data;if(!d||d.type!=='gt:freeze')return;f=!!d.frozen;if(!f){var p=q;q=[];for(var i=0;i<p.length;i++)n(p[i])}})})();",
          }}
        />
      </head>
      {/* suppressHydrationWarning: extensions (Grammarly et al.) stamp
          attributes on <body> before React hydrates, and the mismatch
          logs a console error Lighthouse counts against the page; the
          flag is attribute-only, one level deep, so real bugs still warn */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
