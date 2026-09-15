import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';

import BrickField from '../diagrams/BrickField';
import PatternSwatch from '../diagrams/PatternSwatch';
import Rosette from '../diagrams/Rosette';
import { BAND_LOCALES, LINKS, LOCALE_COUNT_LINE, RTL_LOCALES, TAIL_ROWS, VARIANT_ROWS } from '../data';
import LocaleChip from './LocaleChip';

/**
 * brick-lattice · languages as material.
 *
 * Home: the band after the kiln. Sixteen dot-rosette medallions, one per
 * locale, butted into two courses with the lattice as their mortar. The
 * medallions alternate eight and twelve petals along the course, the way
 * the Assyrian friezes alternate their bosses; at each core a glazed disc
 * carries the locale's own name in its own script (the shipped roster's
 * nativeName, with lang and dir) and its flag chip. Hovering a medallion
 * fires its petals gold and rings its core with the accent, additively.
 * The register above and below is the meander fret the lattice draws.
 * Under the medallions, the variants register: the four rows of the atlas
 * with the zh-Hans and zh-Hant tell, the tail row (cnr Montenegrin, cy
 * Welsh), and the count line.
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
          <PatternSwatch field='fret' size={40} brick={16} ground='none' className='is-mark' />
          <h2>100+ languages, and the variants that matter</h2>
          <p>zh-Hant is not zh-Hans. Both ship.</p>
        </header>

        <ul className='bl-band' aria-label='Supported languages'>
          {BAND_LOCALES.map((code, i) => {
            const rtl = RTL_LOCALES.has(langOf(code));
            return (
              <li className='bl-ros' key={code}>
                <Rosette size={192} brick={12} petals={i % 2 ? 12 : 8} core='hollow' />
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
              <tr className='is-tail'>
                <th scope='row'>
                  <span className='bl-var-name'>The long tail</span>
                </th>
                <td>
                  <span className='bl-var-chips'>
                    {TAIL_ROWS.map((row) => (
                      <span className='bl-var-tail' key={row.tag}>
                        <code className='bl-var-chip'>{row.tag}</code> {row.name}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
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
