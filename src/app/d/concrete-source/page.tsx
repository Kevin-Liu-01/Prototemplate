import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import StampReveals from './components/StampReveals';
import { concreteFontVariables } from './fonts';
import Closing from './sections/Closing';
import Features from './sections/Features';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';

import './styles.css';

export const metadata = {
  title: 'General Translation — Launch in every language',
  description: "End-to-end localization for the world's best companies",
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function ConcreteSourcePage() {
  return (
    <SmoothScroll>
      <div className={`concrete-source-root ${concreteFontVariables}`}>
        <div className='grain' aria-hidden='true' />
        <div id='morph-clone' aria-hidden='true'>
          GT — HOW IT WORKS
        </div>
        <div id='thud'>
          <Nav />
          <Hero />
          <Story />
          <Review />
          <Features />
          <Pricing />
          <Closing />
          <SiteFooter />
        </div>
        <StampReveals />
      </div>
      <DirectionDock slug='concrete-source' />
    </SmoothScroll>
  );
}
