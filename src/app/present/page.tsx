import PresenterApp from './PresenterApp';
import { instrument, sora } from './fonts';

import './presenter.css';

export const metadata = {
  title: 'Presenter · GT Redesign',
  description:
    'Full-screen walkthrough of the website redesign: why, what we need, how it was built, and the prototypes.',
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
