import { GREETINGS, LINKS, LOCALE_COUNT, LOCALE_ROWS, LOCALE_TAIL, TELL } from '../data';
import { Chip } from './deco/Chip';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/** The band splits around the stair: nine cells to each side, three by three. */
const LEFT = GREETINGS.slice(0, 9);
const RIGHT = GREETINGS.slice(9, 18);

/**
 * Languages as material. The tablero is the locales atlas: four base
 * languages expanded into their regional variants, the zh-Hans and zh-Hant
 * tell, the long tail, the count. The talud under it is a tall band of
 * script cells cut into the slope, each cell one greeting in its own
 * script with its language named in itself and its locale chip, set in two
 * blocks of nine around the stair.
 */
export default function Material() {
  return (
    <Terrace tier={2} className='tt-material' id='languages'>
      <Tablero depth={2}>
        <header className='tt-head'>
          <h2 className='tt-h2'>100+ languages, and the variants that matter</h2>
          <p>zh-Hant is not zh-Hans. Both ship.</p>
        </header>
        <div className='tt-atlas'>
          {LOCALE_ROWS.map((row) => (
            <div key={row.tag} className='tt-atlas-row'>
              <div className='tt-atlas-base'>
                <Chip code={row.tag} />
                <span className='tt-atlas-name'>{row.name}</span>
              </div>
              <ul className='tt-atlas-variants'>
                {row.variants.map((variant) => (
                  <li key={variant}>
                    <code className={TELL.includes(variant) ? 'tt-var is-tell' : 'tt-var'}>{variant}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className='tt-atlas-row is-tail'>
            <div className='tt-atlas-base'>
              <span className='tt-atlas-name is-muted'>and the long tail</span>
            </div>
            <ul className='tt-atlas-variants'>
              {LOCALE_TAIL.map((row) => (
                <li key={row.tag} className='tt-atlas-tail'>
                  <code className='tt-var'>{row.tag}</code>
                  <span>{row.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='tt-atlas-foot'>
          <p className='tt-atlas-count'>{LOCALE_COUNT}</p>
          <a className='tt-btn tt-btn-line tt-btn-sm' href={LINKS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </Tablero>
      <Talud relief='stone' className='is-band'>
        <div className='tt-band'>
          <ul className='tt-cells' aria-label='Nine scripts, left of the stair'>
            {LEFT.map((g) => (
              <li key={g.code} className='tt-cell'>
                <span className='tt-cell-text' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                  {g.text}
                </span>
                <span className='tt-cell-name' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                  {g.name}
                </span>
                <Chip code={g.code} jade />
              </li>
            ))}
          </ul>
          <ul className='tt-cells' aria-label='Nine scripts, right of the stair'>
            {RIGHT.map((g) => (
              <li key={g.code} className='tt-cell'>
                <span className='tt-cell-text' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                  {g.text}
                </span>
                <span className='tt-cell-name' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                  {g.name}
                </span>
                <Chip code={g.code} jade />
              </li>
            ))}
          </ul>
        </div>
      </Talud>
    </Terrace>
  );
}
