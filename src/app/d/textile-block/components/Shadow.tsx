import type { CSSProperties } from 'react';

import { LINKS, SHADE_STEPS, TIERS } from '../data';
import { bayerTileUri } from './bayer';
import { Block, Course, Plaque, Relief } from './Wall';

/**
 * textile-block: the shadowed course, the page's one dark moment.
 *
 * A full-bleed course in jade under the upper wall, keyed to the Storer
 * block. The upper wall casts its shade across the top of the course: a
 * static ramp of nested Bayer tiers, densest under the wall and thinning to
 * the jade ground, so the shadow is halftone and never a gradient. The
 * blocks keep the same bond in the dark material: the plaque with the acts,
 * the ziggurat block where the stack stands as five battered setbacks with
 * static Bayer tiers lit from the platform down, and a perforated Storer
 * region where the floor glows through the slots. The course stays dark in
 * both themes.
 */

type TierVars = { '--tier': number; '--tile': string };

export default function Shadow() {
  return (
    <div className='tb-shadow'>
      <div aria-hidden='true' className='tb-shade'>
        {SHADE_STEPS.map((cover) => (
          <span key={cover} style={{ '--tile': bayerTileUri(cover) } as CSSProperties} />
        ))}
      </div>

      <Course className='is-shadow' id='stack' label='The stack'>
        <Plaque
          after={
            <div className='tb-acts'>
              <a className='tb-btn tb-btn-solid' href={LINKS.getStarted}>
                Get Started
              </a>
              <a className='tb-btn tb-btn-line' href={LINKS.demo}>
                Talk to an Engineer
              </a>
            </div>
          }
          className='tb-dark-copy'
          label='Shadowed course'
          relief='storer'
          span={{ c: 4, r: 5, cMd: 8, rMd: 3, cSm: 6, rSm: 4 }}
          title='The full stack for localization'
        >
          Libraries, context, translations, review, and the Locadex agent, set in one platform.
        </Plaque>

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

        <Relief light='shadow' relief='storer' span={{ c: 4, r: 5, cMd: 4, rMd: 5, cSm: 6, rSm: 1 }} />
      </Course>
    </div>
  );
}
