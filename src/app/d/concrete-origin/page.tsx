import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Hero from './sections/Hero';
import Nav from './sections/Nav';
import Story from './sections/Story';
import Tail from './sections/Tail';

import './styles.css';

export const metadata = {
  title: 'Concrete Origin (v0)',
  description: 'Brutalist monospace slabs on ink; elements stamp in with hard cuts.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function ConcreteOriginPage() {
  return (
    <SmoothScroll>
      <div className='concrete-origin-root'>
        <div className='cm-grain' aria-hidden />
        <Nav />
        <main>
          <Hero />
          <Story />
          <Tail />
        </main>
      </div>
      <DirectionDock slug='concrete-origin' />
    </SmoothScroll>
  );
}
