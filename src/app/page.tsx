import { brandFontVariables } from '@/lib/brand-fonts';

import AnatomyWall from './AnatomyWall';
import GalleryViewer from './GalleryViewer';
import SystemLedger from './SystemLedger';

import './prototemplate.css';

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
      fontClass={brandFontVariables}
      anatomy={<AnatomyWall />}
      ledger={<SystemLedger />}
    />
  );
}
