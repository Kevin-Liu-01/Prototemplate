import { GREETINGS, LINKS, LOCALE_COUNT, LOCALE_ROWS, LOCALE_TAIL } from '../data';
import Tile from './Tile';
import { Block, Course, HEAD_RELIEF_SPAN, Plaque, Relief } from './Wall';

/**
 * textile-block: languages as material.
 *
 * The languages course is keyed to the Freeman block. One relief block per
 * script: the block keeps the patterned ground, the greeting is the relief,
 * cast in the ornament color inside a stepped cartouche that borrows the
 * Freeman setback, the locale tile is set as a header brick, and the name
 * of the script is cast in the foot. Each sample carries its own lang and
 * dir. Hovering a script block inverts it, ground and relief swapping the
 * way a cast face reads under raking light. The twelfth block is the count
 * plaque, and the atlas ledger under the course expands one language into
 * its regional variants, with the zh-Hans and zh-Hant pair ringed in the
 * accent.
 */

/** A square with two-step corners: the cartouche, stroked once. */
const CARTOUCHE = 'M20 8H80V14H86V20H92V80H86V86H80V92H20V86H14V80H8V20H14V14H20Z';

export default function Scripts() {
  return (
    <Course className='is-scripts' id='locales' label='Languages'>
      <Plaque label='Freeman course' relief='freeman' title='100+ languages, and the variants that matter'>
        zh-Hant is not zh-Hans. Both ship.
      </Plaque>
      <Relief className='tb-lg-only' relief='freeman' span={HEAD_RELIEF_SPAN} />

      {GREETINGS.map((greeting) => (
        <Block className='tb-script' key={greeting.tag} span={{ c: 2, r: 2, cSm: 3, rSm: 2 }}>
          <Tile code={greeting.tag} header />
          <svg aria-hidden='true' className='tb-cartouche' preserveAspectRatio='none' viewBox='0 0 100 100'>
            <path d={CARTOUCHE} vectorEffect='non-scaling-stroke' />
          </svg>
          <p dir={greeting.rtl ? 'rtl' : 'ltr'} lang={greeting.tag}>
            {greeting.text}
          </p>
          <span className='tb-script-name'>{greeting.script}</span>
        </Block>
      ))}

      <Block className='tb-count' span={{ c: 2, r: 2, cSm: 3, rSm: 2 }}>
        <b>100+</b>
        <span>languages</span>
        <small>{LOCALE_COUNT}</small>
      </Block>

      <Block className='tb-atlas' span={{ c: 12, r: 3, cMd: 8, rMd: 4, cSm: 6, rSm: 9 }}>
        {LOCALE_ROWS.map((row) => (
          <div className='tb-atlas-row' key={row.tag}>
            <code className='tb-atlas-tag'>{row.tag}</code>
            <span className='tb-atlas-name'>{row.name}</span>
            <span className='tb-atlas-chips'>
              {row.variants.map((variant) => (
                <Tile code={variant} key={variant} tell={variant === 'zh-Hans' || variant === 'zh-Hant'} />
              ))}
            </span>
          </div>
        ))}
        <div className='tb-atlas-row is-tail'>
          <code aria-hidden='true' className='tb-atlas-tag' />
          <span className='tb-atlas-name'>and the long tail</span>
          <span className='tb-atlas-chips'>
            {LOCALE_TAIL.map((row) => (
              <span className='tb-atlas-tail' key={row.tag}>
                <code>{row.tag}</code> {row.name}
              </span>
            ))}
          </span>
        </div>
        <div className='tb-atlas-act'>
          <a className='tb-btn tb-btn-line tb-btn-sm' href={LINKS.locales} rel='noreferrer' target='_blank'>
            Browse All Supported Locales
          </a>
          <span className='tb-atlas-note'>Every variant negotiated per request · served from the edge</span>
        </div>
      </Block>
    </Course>
  );
}
