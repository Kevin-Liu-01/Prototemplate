import { CircleCheck } from 'lucide-react';

import PartnerGlyphRain from './PartnerGlyphRain';

/**
 * THE SHIPPED /yc BENEFIT BAND, reproduced.
 *
 * 1-1 with the `yc-glyph` section of apps/landing/src/components/pages/yc/
 * YcPage.tsx: the heading, the paragraph and all four deal terms in the
 * shipped order, with the emphasis the real page puts on the two numbers
 * inside the first row — then the glyph rain filling the right column.
 */
export default function YcBenefits() {
  return (
    <section className='tc-sec yc-glyph'>
      <div className='yc-glyph-copy'>
        <h2>One codebase. Every language.</h2>
        <p>
          General Translation gives startups one developer-first platform to
          localize apps, docs, and websites without slowing down the release
          cycle. Internationalize code, translate content, and review changes
          in the same workflow your team already uses.
        </p>
        <ul className='yc-benefits'>
          <li>
            <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
            <span className='yc-benefit-copy'>
              <span className='yc-benefit-emphasis'>$5,000</span>
              <span> in credits for </span>
              <span className='yc-benefit-emphasis'>12 months</span>
            </span>
          </li>
          <li>
            <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
            <span className='yc-benefit-copy'>
              Dedicated Slack channel with the founders and engineers.
            </span>
          </li>
          <li>
            <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
            <span className='yc-benefit-copy'>
              Feature your company as a use case on the General Translation
              website (optional).
            </span>
          </li>
          <li>
            <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
            <span className='yc-benefit-copy'>
              Direct access to the CEO&apos;s phone number on WhatsApp or text.
            </span>
          </li>
        </ul>
      </div>
      <PartnerGlyphRain
        className='yc-glyph-scene'
        canvasClassName='yc-glyph-canvas'
      />
    </section>
  );
}
