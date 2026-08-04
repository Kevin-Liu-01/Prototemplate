import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Features from './sections/Features';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import ReviewWorkspace from './sections/ReviewWorkspace';
import Story from './sections/Story';
import Tail from './sections/Tail';

import './styles.css';

export const metadata = {
  title: 'Wide Field — GT Redesign',
  description: 'End-to-end localization for the world’s best companies.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function ArchivePressPage() {
  return (
    <SmoothScroll>
      <div className='archive-press-root'>
        <div className='ap-grain' aria-hidden />
        <Nav />
        <main>
          <Hero />
          <Story />
          <ReviewWorkspace />
          <Features />
          <Tail />
        </main>
      </div>
      <DirectionDock slug='archive-press' />
    </SmoothScroll>
  );
}
