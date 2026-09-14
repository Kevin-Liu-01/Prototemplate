import { GREETINGS, LINKS, LOCALE_COUNT, LOCALE_ROWS, LOCALE_TAIL } from '../data';
import Tile from './Tile';
import { Block, Course, Relief } from './Wall';

/**
 * textile-block: languages as material.
 *
 * One relief block per script. The greeting is the relief motif, cast in
 * the ornament color inside a stepped cartouche frame, with the locale tile
 * inset at the corner. Each sample carries its own lang and dir. The
 * twelfth block is the count plaque, and the atlas ledger under the course
 * expands one language into its regional variants, with the zh-Hans and
 * zh-Hant pair ringed in the accent.
 */

/** A square with stepped corners: the cartouche, stroked once. */
const CARTOUCHE = 'M16 9H84V16H91V84H84V91H16V84H9V16H16Z';

export default function Scripts() {
  return (
    <Course className='is-scripts' id='locales' label='Languages'>
      <Block className='tb-head' span={{ c: 8, r: 2, cMd: 8, rMd: 2, cSm: 6, rSm: 3 }}>
        <h2 className='tb-h2'>100+ languages, and the variants that matter</h2>
        <p>zh-Hant is not zh-Hans. Both ship.</p>
      </Block>
      <Relief className='tb-lg-only' motif='rosette' span={{ c: 4, r: 2 }} />

      {GREETINGS.map((greeting) => (
        <Block className='tb-script' key={greeting.tag} span={{ c: 2, r: 2, cSm: 3, rSm: 3 }}>
          <Tile code={greeting.tag} corner />
          <svg aria-hidden='true' className='tb-cartouche' preserveAspectRatio='none' viewBox='0 0 100 100'>
            <path d={CARTOUCHE} vectorEffect='non-scaling-stroke' />
          </svg>
          <p dir={greeting.rtl ? 'rtl' : 'ltr'} lang={greeting.tag}>
            {greeting.text}
          </p>
        </Block>
      ))}

      <Block className='tb-count' span={{ c: 2, r: 2, cSm: 3, rSm: 3 }}>
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
