import Image from 'next/image';
import type { CSSProperties } from 'react';

import { DEMO_HREF, DOCS_HREF, TIERS } from '../data';
import DarkFloor from './DarkFloor';
import Facade from './deco/Facade';
import FretBand from './deco/FretBand';

/**
 * The one dark moment: a full-bleed band of black stone that stays dark in
 * both themes. It opens with the Mitla facade inverted, three courses of
 * cream frets at the three scales on black, and closes with a cream spiral
 * band. Between them the hero's figure returns inverted: the stair of the
 * monumental fret, drawn in the hero as black grain on cream, stands here
 * as six solid cream plates on black, one per product tier from the SDKs at
 * the base to Locadex at the top, with black type on the cream. Each plate
 * owns its top and left seam in the ground color, so the tiers read as
 * courses of one figure. The trace of one run sits in the open step above
 * the lower treads, where the hero sets its claim. Behind it the floor
 * dissolves upward on the engine.
 */
export default function Dark() {
  const count = TIERS.length;

  return (
    <section className='sf-dark' id='stack' aria-labelledby='sf-dark-title'>
      <div className='sf-dark-in'>
        <Facade />
        <DarkFloor />
        <div className='sf-dark-grid'>
          <div className='sf-dark-copy'>
            <h2 className='sf-h2' id='sf-dark-title'>
              The platform, tier by tier
            </h2>
            <p className='sf-lead'>
              Each tier rests on the one below it. The SDKs mark strings in your code, the CLI translates them at
              build time, the platform holds the context, and the CDN serves every locale from the edge. Locadex runs
              the whole stack from a pull request.
            </p>
            <dl className='sf-trace'>
              <div>
                <dt>over-the-air updates</dt>
                <dd>&lt;1s</dd>
              </div>
              <div>
                <dt>first-party SDKs</dt>
                <dd>6</dd>
              </div>
              <div>
                <dt>to start</dt>
                <dd>$0</dd>
              </div>
            </dl>
            <div className='sf-dark-acts'>
              <a className='sf-btn sf-btn-solid' href={DEMO_HREF}>
                Get a Demo
              </a>
              <a className='sf-btn sf-btn-line' href={DOCS_HREF}>
                Read the Docs
              </a>
            </div>
          </div>

          <div className='sf-dark-stairwell'>
            <p className='sf-dark-caption'>
              <span>one run</span>
              <span>128 strings · 6 locales · 640 translations · PR #218</span>
            </p>
            {/* n + 2 columns, as in the proof: tier i spans from column i + 1 to
                the right edge and sits on row n - i, so the plates narrow by one
                column per tier and the top plate still spans three */}
            <ol
              className='sf-dark-stair'
              style={{ gridTemplateColumns: `repeat(${count + 2}, minmax(0, 1fr))` } as CSSProperties}
              aria-label='The platform as a stair, from the SDKs at the base to Locadex at the top'
            >
              {TIERS.map((tier, i) => (
                <li
                  className='sf-dark-step'
                  key={tier.name}
                  style={{ gridColumn: `${i + 1} / -1`, gridRow: count - i } as CSSProperties}
                >
                  <span className='sf-dark-step-name'>
                    {i === count - 1 ? (
                      <Image
                        className='sf-dark-step-mark'
                        src='/brand/no-bg-locadex-logo-light.png'
                        alt=''
                        aria-hidden
                        width={16}
                        height={16}
                      />
                    ) : null}
                    {tier.name}
                  </span>
                  <span className='sf-dark-step-note'>{tier.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <FretBand fret='spiral' scale='band' tone='paper' edges='top' className='sf-dark-band' />
    </section>
  );
}
