import { Carved, Incised } from './deco/Carved';
import Inlay from './deco/Inlay';
import { BarDot, RosetteSymbols, RosetteUse } from './deco/Ornament';
import type { RosetteVariant } from './deco/Ornament';
import { LINKS, LOCALE_COUNT_LINE, ROSETTES, SCRIPTS, VARIANT_ROWS, WIDTHS } from './content';

/**
 * Languages as material. First the script register: the word for
 * "language" incised in nine scripts, each with its script name and lapis
 * inlay. Then the rosette band: one rosette per locale in three alternating
 * carvings, the language's own name for itself cut at the centre with its
 * lang and dir, the inlay beneath. Then two sunk registers side by side:
 * one base language expanded into the tags that actually ship, and one
 * button label measured in four languages.
 */

const VARIANTS: readonly RosetteVariant[] = ['a', 'b', 'c'];

export default function Rosettes() {
  return (
    <section className='rr-course rr-rosettes' id='languages'>
      <RosetteSymbols />
      <div className='rr-head'>
        <BarDot n={4} />
        <div className='rr-head-copy'>
          <h2>
            <Carved text='100+ languages, and the variants that matter' />
          </h2>
          <p>zh-Hant is not zh-Hans. Both ship.</p>
        </div>
      </div>

      <div className='rr-scripts-wrap'>
        <ol className='rr-scripts rr-sunk'>
          {SCRIPTS.map((sample) => (
            <li key={sample.code}>
              <Incised
                className='rr-script-word'
                text={sample.text}
                lang={sample.lang}
                dir={sample.dir ?? 'ltr'}
              />
              <span className='rr-script-name'>{sample.script}</span>
              <Inlay code={sample.code} />
            </li>
          ))}
        </ol>
      </div>

      <ul className='rr-ros-grid'>
        {ROSETTES.map((rosette, i) => (
          <li className='rr-ros' key={rosette.code}>
            <span className='rr-ros-disc'>
              <RosetteUse variant={VARIANTS[i % VARIANTS.length] ?? 'a'} />
              <span className='rr-ros-name' lang={rosette.lang} dir={rosette.dir}>
                {rosette.name}
              </span>
            </span>
            <Inlay code={rosette.code} />
          </li>
        ))}
      </ul>

      <div className='rr-lang-grid'>
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

        <div className='rr-widths rr-sunk'>
          <p className='rr-widths-lead'>The same button in four languages</p>
          <ol className='rr-widths-rows'>
            {WIDTHS.map((row) => (
              <li key={row.code}>
                <Inlay code={row.code} />
                <span className='rr-widths-btn' lang={row.lang} dir={row.dir ?? 'ltr'}>
                  {row.text}
                </span>
                <code className='rr-widths-hint'>{row.hint}</code>
              </li>
            ))}
          </ol>
          <p className='rr-widths-note'>Every container re-measures itself. The layout absorbs the new lengths.</p>
        </div>
      </div>
    </section>
  );
}
