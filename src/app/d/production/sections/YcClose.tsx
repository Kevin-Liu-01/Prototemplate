import { Rocket } from 'lucide-react';

import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

import YcGlobeAtmosphere from './YcGlobeAtmosphere';
import { YC_LINKS } from './yc-links';

/**
 * THE SHIPPED /yc CLOSE, reproduced.
 *
 * 1-1 with the `yc-close` section of apps/landing/src/components/pages/yc/
 * YcPage.tsx: the two-line display, the sub, the one action (Claim YC Deal
 * with the rocket, pointing at the claim record below), and the edge globe
 * on its dithered atmosphere in the right column.
 */
export default function YcClose() {
  return (
    <section className='tc-sec yc-close'>
      <div className='yc-close-content'>
        <h2 aria-label='Go global before Demo Day.'>
          Go global before
          <span>Demo Day.</span>
        </h2>
        <p className='yc-close-copy'>
          Start free, connect your stack, and add languages without adding a
          localization backlog.
        </p>

        <div className='yc-actions yc-close-actions'>
          {/* Cta variant='solid' ring size='lg' */}
          <span className='tc-cta-ring'>
            <a
              className='tc-btn tc-btn-solid tc-btn-lg'
              href={YC_LINKS.closeClaim.href}
            >
              Claim YC Deal
              <Rocket aria-hidden='true' size={16} />
            </a>
          </span>
        </div>
      </div>

      <div className='yc-close-globe'>
        <YcGlobeAtmosphere />
        <EdgeGlobe />
      </div>
    </section>
  );
}
