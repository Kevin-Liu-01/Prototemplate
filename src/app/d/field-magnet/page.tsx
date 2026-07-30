import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Closing from './sections/Closing';
import Features from './sections/Features';
import FieldCanvas from './sections/FieldCanvas';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import Review from './sections/Review';
import Story from './sections/Story';
import './styles.css';

export const metadata = {
  title: 'Field Magnet — GT Redesign',
  // Without an explicit icon the browser probes /favicon.ico, which 404s in dev.
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function FieldMagnetPage() {
  return (
    <SmoothScroll>
      <main className='field-magnet-root'>
        <FieldCanvas />
        <Nav />
        <Hero />
        <Story />
        <Review />
        <Features />
        <Closing />
      </main>
      <DirectionDock slug='field-magnet' />
    </SmoothScroll>
  );
}
