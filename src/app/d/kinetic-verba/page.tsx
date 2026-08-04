import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Closing from './sections/Closing';
import Features from './sections/Features';
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import NavBar from './sections/NavBar';
import Pricing from './sections/Pricing';
import ReviewWorkspace from './sections/ReviewWorkspace';
import Story from './sections/Story';

import './styles.css';

export const metadata = {
  title: 'Kinetic Verba',
  description: 'Kinetic variable-font typography over a gravitational GT lens.',
  // Without an explicit icon the browser probes /favicon.ico, which 404s in dev.
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function KineticVerbaPage() {
  return (
    <SmoothScroll>
      <div className='kinetic-verba-root'>
        <div className='kv-lume' aria-hidden />
        <div className='kv-grain' aria-hidden />
        <NavBar />
        <main>
          <Hero />
          <Story />
          {/* The wall lands straight out of the story's pin: the direction's
              own section takes the breath after the payoff, rather than being
              buried between the workspace and the platform grid. */}
          <Manifesto />
          <ReviewWorkspace />
          <Features />
          <Pricing />
          <Closing />
        </main>
      </div>
      <DirectionDock slug='kinetic-verba' />
    </SmoothScroll>
  );
}
