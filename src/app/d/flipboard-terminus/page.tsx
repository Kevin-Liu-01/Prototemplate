import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Features from './sections/Features';
import Hero from './sections/Hero';
import PricingClose from './sections/PricingClose';
import Review from './sections/Review';
import Story from './sections/Story';
import TerminusFooter from './sections/TerminusFooter';
import TerminusNav from './sections/TerminusNav';

import './styles.css';

export const metadata = {
  title: 'Flipboard Terminus',
  description: 'End-to-end localization for the world’s best companies.',
  // Declared so the browser never falls back to requesting /favicon.ico, which
  // the sample app does not ship.
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function FlipboardTerminusPage() {
  return (
    <SmoothScroll>
      <div className='ft-root'>
        <div className='ft-hall-light' aria-hidden />
        <div className='ft-beams' aria-hidden />
        <div className='ft-grain' aria-hidden />
        <TerminusNav />
        <main>
          <Hero />
          <Story />
          <Review />
          <Features />
          <PricingClose />
        </main>
        <TerminusFooter />
      </div>
      <DirectionDock slug='flipboard-terminus' />
    </SmoothScroll>
  );
}
