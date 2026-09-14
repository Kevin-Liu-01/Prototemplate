import { LINKS, SCRIPTS, TAIL, VARIANTS } from '../data';
import { Chip } from './Chip';
import { Band, Register } from './Register';

/**
 * Register III. Languages as material: the variant families in the first
 * band, a register of eighteen scripts across the slab in the second, each
 * cell one script named in itself with its chip and RTL cells set right to
 * left, and the long tail with the count in the third.
 */
export function Scripts() {
  return (
    <Register id='scripts' numeral='III' name='The scripts'>
      <Band label='variants · one language, its regions' className='is-variants'>
        <h2 className='tr-h2' data-cut>
          100+ languages, and the variants that matter
        </h2>
        <p className='tr-sub' data-cut>
          zh-Hant is not zh-Hans. Both ship.
        </p>
        <div className='tr-variants' data-cut>
          {VARIANTS.map((row) => (
            <div className='tr-variant' key={row.tag}>
              <Chip code={row.tag} />
              <span className='tr-variant-name'>{row.name}</span>
              <span className='tr-variant-list'>
                {row.variants.map((variant) => (
                  <Chip code={variant} tell={variant === 'zh-Hans' || variant === 'zh-Hant'} key={variant} />
                ))}
              </span>
            </div>
          ))}
        </div>
      </Band>

      <Band label='scripts · each named in itself' className='is-scripts'>
        <ul className='tr-scripts'>
          {SCRIPTS.map((script) => (
            <li className='tr-script' key={script.code} dir={script.dir ?? 'ltr'} data-cut>
              <b className='tr-script-name' lang={script.lang} dir={script.dir ?? 'ltr'}>
                {script.name}
              </b>
              <Chip code={script.code} />
            </li>
          ))}
        </ul>
      </Band>

      <Band label='the long tail' className='is-tail'>
        <p className='tr-tail' data-cut>
          {TAIL.map((row) => (
            <span key={row.code}>
              <Chip code={row.code} />
              {row.name}
            </span>
          ))}
        </p>
        <p className='tr-count' data-cut>
          78 base languages, 129 distinct locale tags.
        </p>
        <p className='tr-caption' data-cut>
          Every variant negotiated per request · served from the edge
        </p>
        <a className='tr-act is-line is-sm' href={LINKS.locales} data-cut>
          Browse All Supported Locales
        </a>
      </Band>
    </Register>
  );
}
