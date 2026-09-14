/**
 * calendar-rings: the fifth ring, languages as material.
 * The outer ring unrolled into two arc bands of ten cells: one locale per
 * cell, its endonym in its own script with lang and dir, and its chip.
 * The count line and the two Chinese variants close the section.
 */
import { endonym, HREFS, RING_LOCALES, VARIANT_LOCALES } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { Chip } from './Chip';
import { SectionHead } from './SectionHead';

export function Languages() {
  return (
    <section className='cr-sec cr-langs' aria-labelledby='cr-langs-h'>
      <div className='cr-col'>
        <SectionHead
          n={5}
          id='cr-langs-h'
          title='100+ languages, and the variants that matter'
          lead='zh-Hant is not zh-Hans. Both ship.'
        />
        {RING_LOCALES.map((ring, i) => (
          <ArcBand
            key={i}
            sag={i === 0 ? 26 : 22}
            list
            className='cr-langs-arc'
            cells={ring.map((code) => {
              const word = endonym(code);
              return (
                <div key={code} className='cr-lang'>
                  <span className='cr-lang-word' lang={word.lang} dir={word.dir}>
                    {word.text}
                  </span>
                  <Chip code={code} />
                </div>
              );
            })}
          />
        ))}
        <div className='cr-langs-foot'>
          <p className='cr-count'>78 base languages, 129 distinct locale tags.</p>
          <ul className='cr-variants'>
            {VARIANT_LOCALES.map((code) => {
              const word = endonym(code);
              return (
                <li key={code}>
                  <span lang={word.lang} dir={word.dir}>
                    {word.text}
                  </span>
                  <Chip code={code} />
                </li>
              );
            })}
          </ul>
          <a className='cr-btn is-line' href={HREFS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
