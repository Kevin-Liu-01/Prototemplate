import type { Metadata, Viewport } from 'next';

import { fontVariables } from '@/lib/fonts';

import './globals.css';

const SITE_URL = 'https://prototemplate.vercel.app';

const SITE_TITLE = 'Prototemplate — GT Website Redesign Explorations';

const SITE_DESCRIPTION =
  'Eighteen art directions for the General Translation website — a localization-first design lab of GSAP motion and WebGL shader heroes, from ruled-paper minimalism to black-hole light fields, each one live at /d/<slug>.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s · Prototemplate',
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Prototemplate',
  keywords: [
    'Prototemplate',
    'General Translation',
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
        alt: 'Prototemplate — prototype × template, the working index of General Translation redesign directions.',
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
        {/* apply the persisted theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gt-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {/* rAF gate: an embedding parent can freeze/resume this page's
            animation loops with postMessage({type:'gt:freeze',frozen}) —
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
          logs a console error Lighthouse counts against the page — the
          flag is attribute-only, one level deep, so real bugs still warn */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
