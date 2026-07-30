import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Features from './sections/Features';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import PricingClose from './sections/PricingClose';
import ReviewWorkspace from './sections/ReviewWorkspace';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TypeMetrics from './sections/TypeMetrics';

import './styles.css';

export const metadata = {
  title: 'Blueprint Atlas — GT Redesign',
  description: 'End-to-end localization for the world’s best companies.',
  // Without an explicit icon the browser probes /favicon.ico, which 404s in dev.
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function BlueprintAtlasPage() {
  return (
    <SmoothScroll>
      <div className='blueprint-atlas-root'>
        {/* The sheet is lit, not painted: enormous soft bands rake the whole
            document at different heights so no section below the fold is flat
            near-black. The old page-wide drafting grid is gone — §5 bans
            grid/graph-paper backgrounds behind content; structure lives in the
            panels now, not under them. */}
        <div className='ba-amb' aria-hidden />
        <div className='ba-grain' aria-hidden />
        <Nav />
        <main>
          <Hero />
          <Story />
          {/* the metrics sheet answers the story directly — "that is why the
              containers above have to breathe" — so it follows it immediately */}
          <TypeMetrics />
          <ReviewWorkspace />
          <Features />
          <PricingClose />
        </main>
        <SiteFooter />
      </div>
      <DirectionDock slug='blueprint-atlas' />
    </SmoothScroll>
  );
}
