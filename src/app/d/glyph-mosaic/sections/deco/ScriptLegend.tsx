import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { SCRIPTS } from './scripts';

/**
 * GLYPH MOSAIC: the legend.
 *
 * C1 home: the hero plate's edge (C1.4). The mosaic is made of real
 * writing, so the plate carries a key: one row per script, a sample glyph
 * set in that script's own `lang`, the script's name, and the locale the
 * sample is tagged with, printed as the page's one locale chip.
 */
export default function ScriptLegend() {
  return (
    <div className='gm-legend'>
      <p className='gm-legend-lead'>The tesserae are glyphs from these scripts.</p>
      <ul className='gm-legend-list'>
        {SCRIPTS.map((script) => (
          <li className='gm-legend-item' key={script.key}>
            <span className='gm-legend-glyph' lang={script.lang} dir={script.rtl ? 'rtl' : 'ltr'} aria-hidden='true'>
              {script.sample}
            </span>
            <span className='gm-legend-name'>{script.name}</span>
            <LocaleTag code={script.lang} className='gm-legend-loc' />
          </li>
        ))}
      </ul>
    </div>
  );
}
