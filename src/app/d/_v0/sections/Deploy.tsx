import PrismaticField from '@/components/shared/PrismaticField';

import './deploy.css';

/**
 * V0 closing band — the "Deploy today." beat, built in the house material
 * instead of the mock's chroma-tunnel gradient: one full-bleed dark band
 * washed with the prismatic field, masked so the light owns the edges and
 * the center stays dark for the type. Two-part copy only (display + sub) —
 * no eyebrow, no mono, no uppercase tracking per house rules.
 */
export default function Deploy() {
  return (
    <section className='v0-dep' id='deploy'>
      <PrismaticField
        className='v0-dep-field'
        preset='1'
        speed={0.4}
        params={{ exposureScale: 3400 }}
      />
      <div className='v0-dep-in'>
        <h2>Deploy today.</h2>
        <p className='v0-dep-sub'>
          Join the world’s best developer teams on General Translation.
        </p>
        <div className='v0-dep-acts'>
          <a className='v0-dep-btn v0-dep-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='v0-dep-btn v0-dep-btn-line' href='#contact'>
            Get a demo
          </a>
        </div>
      </div>
    </section>
  );
}
