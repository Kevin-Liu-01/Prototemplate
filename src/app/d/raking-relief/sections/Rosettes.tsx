import Inlay from './Inlay';
import { BarDot, RosetteSymbol, RosetteUse } from './Ornament';
import { LINKS, LOCALE_COUNT_LINE, ROSETTES, VARIANT_ROWS } from './content';

/**
 * Languages as material: a rosette band, one rosette per locale, the
 * language's own name for itself carved at the centre with its lang and
 * dir, the lapis inlay beneath. Under the band, the variants register:
 * one base language expanded into the tags that actually ship.
 */
export default function Rosettes() {
  return (
    <section className='rr-course rr-rosettes' id='languages'>
      <RosetteSymbol />
      <div className='rr-head'>
        <BarDot n={4} />
        <div className='rr-head-copy'>
          <h2>100+ languages, and the variants that matter</h2>
          <p>zh-Hant is not zh-Hans. Both ship.</p>
        </div>
      </div>

      <ul className='rr-ros-grid'>
        {ROSETTES.map((rosette) => (
          <li className='rr-ros' key={rosette.code}>
            <span className='rr-ros-disc'>
              <RosetteUse />
              <span className='rr-ros-name' lang={rosette.lang} dir={rosette.dir}>
                {rosette.name}
              </span>
            </span>
            <Inlay code={rosette.code} />
          </li>
        ))}
      </ul>

      <div className='rr-variants rr-sunk'>
        <ol className='rr-variants-rows'>
          {VARIANT_ROWS.map((row) => (
            <li key={row.tag}>
              <code className='rr-variants-tag'>{row.tag}</code>
              <span className='rr-variants-name'>{row.name}</span>
              <span className='rr-variants-list'>
                {row.variants.map((variant) => (
                  <Inlay code={variant} tell={variant === 'zh-Hans' || variant === 'zh-Hant'} key={variant} />
                ))}
              </span>
            </li>
          ))}
          <li className='is-tail'>
            <code className='rr-variants-tag'>cnr</code>
            <span className='rr-variants-name'>Montenegrin</span>
            <span className='rr-variants-list'>
              <code className='rr-variants-tag'>cy</code>
              <span className='rr-variants-name'>Welsh</span>
            </span>
          </li>
        </ol>
        <div className='rr-variants-foot'>
          <p>{LOCALE_COUNT_LINE}</p>
          <a className='rr-btn is-line is-sm' href={LINKS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
