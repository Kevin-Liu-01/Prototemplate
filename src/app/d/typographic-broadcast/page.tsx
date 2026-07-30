import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import BroadcastNav from './sections/BroadcastNav';
import ClosingBands from './sections/ClosingBands';
import Features from './sections/Features';
import Hero from './sections/Hero';
import MarqueeBand from './sections/MarqueeBand';
import Review from './sections/Review';
import Story from './sections/Story';

import './styles.css';

export const metadata = {
  title: 'Typographic Broadcast — GT Redesign',
  description: 'End-to-end localization for the world’s best companies.',
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function TypographicBroadcastPage() {
  return (
    <SmoothScroll>
      <div className='tb-root'>
        <div className='tb-grain' aria-hidden />
        <BroadcastNav />

        <main>
          <Hero />

          <MarqueeBand
            label='Ship in 118 locales'
            words={['Ship in 118 locales', 'No refactors, no JSON files']}
            speed={76}
            dir={1}
          />

          <Story />
          <Review />
          <Features />

          <MarqueeBand
            label='For your next billion users'
            words={['For your next 1,000,000,000 users', 'We want translation abundance']}
            speed={64}
            dir={-1}
          />

          <ClosingBands />
        </main>
      </div>
      <DirectionDock slug='typographic-broadcast' />
    </SmoothScroll>
  );
}
