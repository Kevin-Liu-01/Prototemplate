import { useId } from 'react';
import type { CSSProperties } from 'react';

import { DEMO_HREF, DOCS_HREF, TIERS } from '../data';
import { bayerTile } from '../fret';
import DarkFloor from './DarkFloor';
import FretBand from './deco/FretBand';

/**
 * The one dark moment: a full-bleed band of black stone that stays dark in
 * both themes, bounded by two limestone frets. The platform stands in it as
 * a ziggurat of six setbacks, one per product surface, bottom to top; each
 * tier is filled with a static Bayer tier that grows denser as the tiers
 * rise, so the stack reads as one ramp of ordered grain. Every tier owns
 * its top and side rules; the stack's base rule closes it. Behind the
 * ziggurat the floor dissolves upward on the engine.
 */
export default function Dark() {
  const patternBase = `sf-tier-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tiers = [...TIERS].reverse();

  return (
    <section className='sf-dark' id='stack' aria-labelledby='sf-dark-title'>
      <FretBand cell={6} tone='paper' edges='bottom' className='sf-dark-band' />
      <div className='sf-dark-in'>
        <DarkFloor />
        <div className='sf-dark-grid'>
          <div className='sf-dark-copy'>
            <h2 className='sf-h2' id='sf-dark-title'>
              The platform, tier by tier
            </h2>
            <p className='sf-lead'>
              Each setback rests on the one below it. The SDKs mark strings in your code, the CLI translates them at
              build time, the platform holds the context, and the CDN serves every locale from the edge. Locadex
              runs the whole stack from a pull request.
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

          <ol className='sf-zig' aria-label='The platform as six tiers, from the SDKs at the base to Locadex at the top'>
            {tiers.map((tier, i) => {
              const level = tiers.length - i; // 6 at the top, 1 at the base
              const cover = 2 + level * 2; // 4/16 at the base to 14/16 at the top
              const id = `${patternBase}-${level}`;
              return (
                <li className='sf-tier' key={tier.name} style={{ '--level': level } as CSSProperties}>
                  <svg className='sf-tier-fill' aria-hidden='true' focusable='false'>
                    <defs>
                      <pattern id={id} patternUnits='userSpaceOnUse' width={12} height={12}>
                        <path d={bayerTile(cover, 3)} fill='currentColor' />
                      </pattern>
                    </defs>
                    <rect width='100%' height='100%' fill={`url(#${id})`} />
                  </svg>
                  <span className='sf-tier-name'>{tier.name}</span>
                  <span className='sf-tier-note'>{tier.note}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <FretBand cell={6} tone='paper' edges='top' className='sf-dark-band' />
    </section>
  );
}
