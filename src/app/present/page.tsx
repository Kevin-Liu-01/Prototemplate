import type { Metadata } from 'next';

import PresenterApp from './PresenterApp';
import { instrument, sora } from './fonts';

import './presenter.css';

export const metadata: Metadata = {
  title: { absolute: 'Redesign presenter' },
  description:
    'A walkthrough of the website redesign on the viewer shell: why, what we need, how it was built, the live prototypes, and the verdict.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The presenter route. Sora and Instrument Sans are scoped to this wrapper
 * for the intro lockup only; the shell's chrome stays in Inter.
 */
export default function PresentPage() {
  return (
    <div className={`${sora.variable} ${instrument.variable}`}>
      <PresenterApp />
    </div>
  );
}
