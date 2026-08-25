'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { usePathname } from 'next/navigation';

import PartnerGlyphRain from './PartnerGlyphRain';
import { MINTLIFY_LINKS } from './mintlify-links';

/**
 * THE SHIPPED /mintlify CLOSE, reproduced.
 *
 * 1-1 with the `mintlify-close` section of MintlifyPage.tsx: the display
 * line, the sub, and the two actions — Connect GitHub on the OAuth start
 * redirect and Get a Demo on the enterprise contact page — with the glyph
 * rain filling the right column.
 *
 * Get a Demo is the one internal destination on this page, so it resolves
 * against the concept base instead of leaving for the live site.
 */
export default function MintlifyClose() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <section className='tc-sec mintlify-close'>
      <div className='mintlify-close-copy'>
        <h2>Translate with a click</h2>
        <p>
          Get started immediately or have a dedicated engineer set up
          translation for you
        </p>
        <div className='mintlify-actions'>
          <span className='tc-cta-ring'>
            <a
              className='tc-btn tc-btn-solid tc-btn-lg'
              href={MINTLIFY_LINKS.closeConnect.href}
            >
              <SiGithub aria-hidden='true' />
              Connect GitHub
            </a>
          </span>
          <a
            className='tc-btn tc-btn-line tc-btn-lg'
            href={`${base}${MINTLIFY_LINKS.closeDemo.path}`}
          >
            Get a Demo
          </a>
        </div>
      </div>
      <PartnerGlyphRain
        className='mintlify-glyph-scene'
        canvasClassName='mintlify-glyph-canvas'
      />
    </section>
  );
}
