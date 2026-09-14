import { CUSTOMERS, RAIL, REVIEW_ROWS } from '../data';
import { Stair } from './deco/Stair';
import { Band, Register } from './Register';

/**
 * Register V, the gilded one: the page's high-contrast moment, gold ground
 * with the ink cut into it. The six customer marks in the first band, the
 * review workspace with source beside translation in the second, and the
 * pipeline as a ziggurat stair with the story's counts in the third.
 */
export function Review() {
  return (
    <Register id='review' numeral='V' name='The review' gild>
      <Band label='trust · six companies' className='is-trust'>
        <h2 className='tr-h2' data-cut>
          Trusted by the world&apos;s best companies
        </h2>
        <p className='tr-sub' data-cut>
          Cursor, Ramp and Profound ship in over thirty languages
        </p>
        <ul className='tr-marks' data-cut>
          {CUSTOMERS.map((customer) => (
            <li className='tr-mark-cell' key={customer.name}>
              <a href={customer.href} rel='noreferrer' target='_blank'>
                <img className='tr-mark' src={`/logos/${customer.file}.light.svg`} alt={customer.name} height={20} />
              </a>
            </li>
          ))}
        </ul>
      </Band>

      <Band label='review · source beside translation' className='is-workspace'>
        <div className='tr-ws' data-cut>
          <div className='tr-ws-bar'>
            <span>workspace · es-419</span>
            <span>4 strings</span>
            <span className='tr-ws-cols'>
              <span>source · en</span>
              <span>translation · es</span>
            </span>
          </div>
          <ol className='tr-ws-rows'>
            {REVIEW_ROWS.map((row) => (
              <li className='tr-ws-row' key={row.key}>
                <code className='tr-ws-key'>{row.key}</code>
                <p className='tr-ws-src' lang='en'>
                  {row.source}
                </p>
                <p className='tr-ws-tr' lang='es'>
                  {row.previous ? <s>{row.previous}</s> : null}
                  <span>{row.translation}</span>
                </p>
                <span className={`tr-stamp is-${row.state}`}>{row.state}</span>
              </li>
            ))}
          </ol>
          <div className='tr-ws-foot'>
            <span>⌘K search</span>
            <span>history</span>
            <span>download</span>
            <span>agent · locadex</span>
          </div>
        </div>
      </Band>

      <Band label='the pipeline · one string, shipped' className='is-story'>
        <h3 className='tr-h3' data-cut>
          How a string becomes a shipped translation.
        </h3>
        <div data-cut>
          <Stair steps={RAIL} />
        </div>
        <p className='tr-counts' data-cut>
          128 strings · 6 locales · 640 translations · PR #218
        </p>
      </Band>
    </Register>
  );
}
