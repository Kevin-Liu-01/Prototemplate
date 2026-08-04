import type { Metadata } from 'next';

import PresenterApp from './PresenterApp';
import { instrument, sora } from './fonts';

import './presenter.css';

const DESCRIPTION =
  'Full-screen scroll walkthrough of the General Translation website redesign: why, the principles, how it was built, and every prototype running live.';

export const metadata: Metadata = {
  title: 'Presenter',
  description: DESCRIPTION,
  alternates: { canonical: '/present' },
  openGraph: {
    siteName: 'Prototemplate',
    type: 'website',
    url: '/present',
    title: 'Presenter · Prototemplate',
    description: DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 2400,
        height: 1260,
        alt: 'Prototemplate — the General Translation website redesign presenter.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Presenter · Prototemplate',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function PresentPage() {
  return (
    <div className={`${sora.variable} ${instrument.variable}`}>
      <PresenterApp />
    </div>
  );
}
