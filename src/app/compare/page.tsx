import { Fraunces, Space_Grotesk } from 'next/font/google';

import PtNav from '@/components/shared/PtNav';

import CompareRig from './CompareRig';

import '../prototemplate.css';

/* The nameplate voices ride in with the nav — the rig itself speaks
   Lausanne at reading scale, same as the post. */
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'Compare · Prototemplate',
  description:
    'Any two redesign directions, live and side by side, scrolling in lockstep.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

export default function ComparePage() {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <div className='pt-rail'>
        <PtNav />
        <CompareRig />
      </div>
    </main>
  );
}
