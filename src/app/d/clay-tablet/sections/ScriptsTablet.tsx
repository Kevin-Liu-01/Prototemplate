import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import WedgeField from '../diagrams/deco/WedgeField';
import WedgeRule from '../diagrams/deco/WedgeRule';
import { rampBand } from '../fields';
import { LOCALES_COUNT, LOCALES_HEAD, LOCALES_SUB, SCRIPT_CELLS, VARIANT_ROWS } from './content';
import Shelf, { Tablet } from './Shelf';

const RAMP_W = 1180;
const RAMP_H = 84;

/**
 * Tablet IV: languages as material. Twenty script cells, each an endonym in
 * its own script with correct lang and dir beside its flag seal, ruled apart
 * by wedge rules and doubled threads. Under them the variants register: the
 * regional tags that ship, with the zh-Hans and zh-Hant tell. The foot is a
 * ramp band in wedge dither, dense to bare.
 */
export default function ScriptsTablet() {
  return (
    <Shelf
      id='scripts'
      label={{
        numeral: 'IV',
        name: 'Languages as material',
        note: 'Script cells separated by wedge rules. The variants register lists the tags that ship. The foot is a ramp from dense to bare.',
      }}
    >
      <Tablet size='full' className='ct-scripts'>
        <header className='ct-reg ct-head'>
          <h2>{LOCALES_HEAD}</h2>
          <p>{LOCALES_SUB}</p>
        </header>

        <WedgeRule />

        <ul className='ct-cells'>
          {SCRIPT_CELLS.map((cell) => (
            <li className='ct-cell' key={cell.code}>
              <span className='ct-cell-native' lang={cell.code} dir={cell.dir}>
                {cell.native}
              </span>
              <span className='ct-cell-meta'>
                <LocaleTag code={cell.code} className='ct-lct' />
                <span className='ct-cell-name'>{cell.name}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className='ct-reg ct-variants'>
          {VARIANT_ROWS.map((row) => (
            <div className='ct-var-row' key={row.tag}>
              <span className='ct-var-tag'>
                <LocaleTag code={row.tag} className='ct-lct' />
              </span>
              <span className='ct-var-name'>{row.name}</span>
              <span className='ct-var-chips'>
                {row.variants.map((variant) => (
                  <code
                    className={
                      variant === 'zh-Hans' || variant === 'zh-Hant' ? 'ct-vchip is-tell' : 'ct-vchip'
                    }
                    key={variant}
                  >
                    {variant}
                  </code>
                ))}
              </span>
            </div>
          ))}
          <p className='ct-var-tail'>
            Also <code>cnr</code> Montenegrin and <code>cy</code> Welsh. {LOCALES_COUNT}
          </p>
        </div>

        <div className='ct-reg ct-ramp'>
          <WedgeField field={rampBand()} width={RAMP_W} height={RAMP_H} cell={12} slice />
        </div>
      </Tablet>
    </Shelf>
  );
}
