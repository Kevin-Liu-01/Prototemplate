import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Closing from './sections/Closing';
import Features from './sections/Features';
import GalleryNav from './sections/GalleryNav';
import Hero from './sections/Hero';
import Review from './sections/Review';
import Story from './sections/Story';

import './styles.css';

export const metadata = {
  title: 'White Gallery',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function WhiteGalleryPage() {
  return (
    <SmoothScroll>
      <div className='white-gallery-root'>
        <div className='wg-grain' aria-hidden />
        <GalleryNav />
        <main>
          <Hero />
          <Story />
          <Review />
          <Features />
          <Closing />
        </main>
      </div>
      <DirectionDock slug='white-gallery' />
    </SmoothScroll>
  );
}
