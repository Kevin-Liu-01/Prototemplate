import GlyphRain from '@/app/d/singularity/sections/GlyphRain';

import './deploy.css';

/**
 * V0 closing band — the "Deploy today." beat under the house glyph rain:
 * scripts from every writing system falling the full band, masked so the
 * rain owns the flanks and thins over the center column where the type
 * sits. Two-part copy only (display + sub) — no eyebrow, no mono, no
 * uppercase tracking per house rules.
 */
export default function Deploy() {
  return (
    <section className='v0-dep' id='deploy'>
      <GlyphRain className='v0-dep-rain' intensity={1.1} />
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
