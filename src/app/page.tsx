import { Fraunces, Space_Grotesk } from 'next/font/google';

import AnatomyWall from './AnatomyWall';
import GalleryViewer from './GalleryViewer';
import SystemLedger from './SystemLedger';

import './prototemplate.css';

/* The nameplate uses two faces of its own, Fraunces for the working model
   and Space Grotesk for the reusable form (decision 3 keeps them); neither
   is Inter, the brand face. The post below it runs TWK Lausanne when
   locally installed (the woff2s are not shipped), falling back to Inter.
   The shell around the article is Inter alone. */
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'Prototemplate',
  description:
    'Prototype × template: the working index of General Translation redesign directions.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  openGraph: {
    title: 'Prototemplate',
    description:
      'Prototype × template: the working index of General Translation redesign directions.',
    type: 'website',
    images: [{ url: '/og.png', width: 2400, height: 1260, alt: 'prototype × template' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prototemplate',
    description:
      'Prototype × template: the working index of General Translation redesign directions.',
    images: ['/og.png'],
  },
};

/**
 * The gallery: a server page that mounts the viewer shell (GalleryViewer, a
 * client component) around the article. The two blocks that must render on
 * the server are passed in as nodes: AnatomyWall reads the capture files
 * from disk, and SystemLedger is static markup that need not ship as
 * client code.
 */
export default function IndexPage() {
  return (
    <GalleryViewer
      fontClass={`${fraunces.variable} ${grotesk.variable}`}
      anatomy={<AnatomyWall />}
      ledger={<SystemLedger />}
    />
  );
}
