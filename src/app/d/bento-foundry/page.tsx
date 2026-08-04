import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import NavGuard from './components/NavGuard';
import Closing from './sections/Closing';
import Features from './sections/Features';
import Hero from './sections/Hero';
import NavBar from './sections/NavBar';
import Review from './sections/Review';
import Story from './sections/Story';

import './styles.css';

export const metadata = {
  title: 'Bento Foundry',
  description: 'Machined bento grid; muted cells, each holding a line-art technical drawing.',
  /* names a real icon so the browser stops probing for a /favicon.ico we don't ship */
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function BentoFoundryPage() {
  return (
    <SmoothScroll>
      <div className='bento-foundry-root'>
        <div className='bf-satin' aria-hidden />
        <div className='bf-grain' aria-hidden />
        <NavBar />
        <NavGuard />
        <main>
          <Hero />
          <Story />
          <Review />
          <Features />
          <Closing />
        </main>
      </div>
      <DirectionDock slug='bento-foundry' />
    </SmoothScroll>
  );
}
