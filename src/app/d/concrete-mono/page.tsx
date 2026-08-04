import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Hero from './sections/Hero';
import Nav from './sections/Nav';
import Stats from './sections/Stats';
import Story from './sections/Story';
import Tail from './sections/Tail';

import './styles.css';

export const metadata = {
  title: 'Concrete Mono — GT Redesign',
  description: 'Brutalist monospace slabs on ink; elements stamp in with hard cuts.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function ConcreteMonoPage() {
  return (
    <SmoothScroll>
      <div className='concrete-mono-root'>
        <div className='cm-grain' aria-hidden />
        <Nav />
        <main>
          <Hero />
          <Stats />
          <Story />
          <Tail />
        </main>
      </div>
      <DirectionDock slug='concrete-mono' />
    </SmoothScroll>
  );
}
