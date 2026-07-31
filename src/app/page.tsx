import Link from 'next/link';

import { DIRECTIONS } from '@/lib/directions';

import PrototemplateHero from './PrototemplateHero';

import './prototemplate.css';

export const metadata = {
  title: 'Prototemplate',
  description:
    'Prototype × template — the working index of General Translation redesign directions.',
  icons: { icon: '/brand/no-bg-gt-logo-dark.png' },
};

export default function IndexPage() {
  return (
    <main className='pt-root'>
      <div className='pt-frame'>
        <PrototemplateHero />

        <div className='pt-links'>
          <Link className='pt-link' href='/present'>
            Present <small>the full walkthrough</small>
          </Link>
          <Link className='pt-link' href='/d/toolchain'>
            Toolchain <small>the current favorite</small>
          </Link>
        </div>

        <header className='pt-index-head'>
          <h2>Index</h2>
          <span>{DIRECTIONS.length} directions · one storyboard</span>
        </header>

        <div className='pt-rows'>
          {DIRECTIONS.map((direction) => (
            <Link className='pt-row' href={`/d/${direction.slug}`} key={direction.slug}>
              <span className='pt-row-label'>{direction.label}</span>
              <span className='pt-row-main'>
                <h3>{direction.name}</h3>
                <p>{direction.concept}</p>
              </span>
              <span className='pt-row-tone'>{direction.tone}</span>
              <span className='pt-row-sig'>{direction.signature}</span>
            </Link>
          ))}
        </div>

        <p className='pt-foot'>Prototemplate — General Translation</p>
      </div>
    </main>
  );
}
