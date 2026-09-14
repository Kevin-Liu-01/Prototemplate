import type { CSSProperties } from 'react';

import { LINKS, TIERS } from '../data';
import { bayerTileUri } from './bayer';
import { Block, Course, Relief } from './Wall';

/**
 * textile-block: the base course, the page's one dark moment.
 *
 * A full-bleed plinth in jade-black under the upper wall. Its blocks keep
 * the same bond in the dark material: the copy block, the ziggurat block
 * where the stack stands as five battered setbacks with static Bayer tiers
 * lit from the platform down, and a perforated region where the floor
 * glows through the holes. The plinth stays dark in both themes.
 */

type TierVars = { '--tier': number; '--tile': string };

export default function Base() {
  return (
    <div className='tb-base'>
      <Course className='is-dark' id='stack' label='The stack'>
        <Block className='tb-dark-copy' span={{ c: 4, r: 5, cMd: 8, rMd: 2, cSm: 6, rSm: 3 }}>
          <h2 className='tb-h2'>The full stack for localization</h2>
          <p>Libraries, context, translations, review, and the Locadex agent, set in one platform.</p>
          <div className='tb-acts'>
            <a className='tb-btn tb-btn-solid' href={LINKS.getStarted}>
              Get Started
            </a>
            <a className='tb-btn tb-btn-line' href={LINKS.demo}>
              Talk to an Engineer
            </a>
          </div>
        </Block>

        <Block className='tb-zig-block' span={{ c: 4, r: 5, cMd: 4, rMd: 5, cSm: 6, rSm: 6 }}>
          <ol aria-label='The stack, top platform first' className='tb-zig'>
            {TIERS.map((tier, i) => {
              const vars: TierVars = { '--tier': i, '--tile': bayerTileUri(tier.cover) };
              return (
                <li className='tb-tier' key={tier.name} style={vars as CSSProperties}>
                  <b>{tier.name}</b>
                </li>
              );
            })}
          </ol>
          <dl className='tb-zig-facts'>
            {TIERS.map((tier) => (
              <div className='tb-zig-fact' key={tier.name}>
                <dt>{tier.name}</dt>
                <dd>{tier.fact}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Relief light='base' motif='perf' span={{ c: 4, r: 5, cMd: 4, rMd: 5, cSm: 6, rSm: 1 }} />
      </Course>
    </div>
  );
}
