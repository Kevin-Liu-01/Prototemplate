import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';

import BrickField from '../diagrams/BrickField';
import Rosette from '../diagrams/Rosette';
import { BAND_LOCALES, LINKS, LOCALE_COUNT_LINE, RTL_LOCALES, VARIANT_ROWS } from '../data';
import LocaleChip from './LocaleChip';

/**
 * brick-lattice · languages as material.
 *
 * Home: the band after the kiln. Sixteen dot-rosette medallions, one per
 * locale, butted into two courses with the lattice as their mortar; at
 * each core a glazed disc carries the locale's own name in its own script
 * (the shipped locale roster's nativeName, with lang and dir) and its flag
 * chip. The register above and below is the meander fret the lattice
 * field draws. Under the medallions, the variants register: the four rows
 * of the atlas with the zh-Hans and zh-Hant tell, and the count line.
 */
function nativeName(code: string): string {
  return SUPPORTED_LOCALES.find((row) => row.code === code)?.nativeName ?? code;
}

function langOf(code: string): string {
  return code.split('-')[0] ?? code;
}

export default function LanguagesBand() {
  return (
    <section className='bl-sec bl-band-sec' id='languages'>
      <BrickField field='fret' />
      <div className='bl-in'>
        <header className='bl-head bl-panel'>
          <Rosette size={40} brick={16} petals={8} core='gold' className='is-mark' />
          <h2>100+ languages, and the variants that matter</h2>
          <p>zh-Hant is not zh-Hans. Both ship.</p>
        </header>

        <ul className='bl-band' aria-label='Supported languages'>
          {BAND_LOCALES.map((code) => {
            const rtl = RTL_LOCALES.has(langOf(code));
            return (
              <li className='bl-ros' key={code}>
                <Rosette size={192} brick={12} petals={8} core='hollow' />
                <div className='bl-ros-core' lang={code} dir={rtl ? 'rtl' : 'ltr'}>
                  <span className='bl-ros-name'>{nativeName(code)}</span>
                  <LocaleChip code={code} />
                </div>
              </li>
            );
          })}
        </ul>

        <div className='bl-variants bl-panel'>
          <table className='bl-var-table'>
            <tbody>
              {VARIANT_ROWS.map((row) => (
                <tr key={row.tag}>
                  <th scope='row'>
                    <code className='bl-var-tag'>{row.tag}</code>
                    <span className='bl-var-name'>{row.name}</span>
                  </th>
                  <td>
                    <span className='bl-var-chips'>
                      {row.variants.map((variant) => (
                        <code
                          className={variant === 'zh-Hans' || variant === 'zh-Hant' ? 'bl-var-chip is-tell' : 'bl-var-chip'}
                          key={variant}
                        >
                          {variant}
                        </code>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='bl-var-foot'>
            <p>{LOCALE_COUNT_LINE}</p>
            <a className='bl-btn bl-btn-line bl-btn-sm' href={LINKS.locales}>
              Browse All Supported Locales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
