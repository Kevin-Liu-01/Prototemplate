import { LINKS, LOCALE_COUNT, LONG_TAIL, SCRIPTS, VARIANT_ROWS, VARIANT_TELL } from '../data';
import Chip from './Chip';
import ColumnHead from './ColumnHead';
import FanCell from './deco/FanCell';
import WaterRule from './deco/WaterRule';

/**
 * Languages as material. A register of eighteen fan cells, one canon square
 * each: the dithered gold umbel, the language named in itself with its own
 * lang and dir, and the flag chip with the code. Under the water rule, the
 * variants atlas expands four languages into their regional tags, with the
 * zh-Hans and zh-Hant tell ringed in the rubric red, the long tail, and
 * the count.
 */
export default function Scripts() {
  return (
    <section className='pr-col' id='languages' aria-labelledby='pr-languages-title'>
      <ColumnHead
        n={4}
        id='pr-languages-title'
        title='100+ languages, and the variants that matter'
        sub='zh-Hant is not zh-Hans. Both ship.'
      />

      <ul className='pr-fans' aria-label='Supported scripts'>
        {SCRIPTS.map((script) => (
          <li className='pr-fan-cell' key={script.code}>
            <FanCell />
            <span className='pr-fan-name' lang={script.lang} dir={script.dir}>
              {script.native}
            </span>
            <span className='pr-fan-meta'>
              <Chip code={script.code} />
              <span className='pr-fan-en'>{script.name}</span>
            </span>
          </li>
        ))}
      </ul>

      <WaterRule />

      <div className='pr-reg pr-variants'>
        <div className='pr-var-table' role='table' aria-label='Regional variants'>
          {VARIANT_ROWS.map((row) => (
            <div className='pr-var-row' role='row' key={row.tag}>
              <code className='pr-var-tag' role='cell'>
                {row.tag}
              </code>
              <span className='pr-var-name' role='cell'>
                {row.name}
              </span>
              <span className='pr-var-list' role='cell'>
                {row.variants.map((variant) => (
                  <code
                    className={VARIANT_TELL.includes(variant) ? 'pr-varchip is-tell' : 'pr-varchip'}
                    key={variant}
                  >
                    {variant}
                  </code>
                ))}
              </span>
            </div>
          ))}
          <div className='pr-var-row is-tail' role='row'>
            <span role='cell' />
            <span className='pr-var-name is-muted' role='cell'>
              The long tail
            </span>
            <span className='pr-var-list' role='cell'>
              {LONG_TAIL.map((entry) => (
                <span className='pr-var-tail' key={entry.tag}>
                  <code className='pr-varchip'>{entry.tag}</code>
                  {entry.name}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className='pr-var-side'>
          <p className='pr-var-count'>{LOCALE_COUNT}</p>
          <p className='pr-var-note'>Every variant negotiated per request · served from the edge</p>
          <a className='pr-btn is-line is-sm' href={LINKS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
