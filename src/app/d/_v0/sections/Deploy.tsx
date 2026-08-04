import PrismaticField from '@/components/shared/PrismaticField';

import './deploy.css';

/**
 * V0 closing band — the "Deploy today." beat, built in the house material
 * instead of the mock's chroma-tunnel gradient: one full-bleed dark band
 * washed with the prismatic field, masked so the light owns the edges and
 * the center stays dark for the type. Copy is the Figma mock's, verbatim;
 * the lead-in is a small sans sentence-case line per house rules (no mono,
 * no uppercase tracking).
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
        <p className='v0-dep-lead'>Reach every user</p>
        <h2>Deploy today in every language.</h2>
        <p className='v0-dep-sub'>
          Talk to an engineer about implementation, or get started for free.
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
