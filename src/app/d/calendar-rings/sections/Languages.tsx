/**
 * calendar-rings: languages as material, ring four unrolled.
 * The outer ring of the disk in two arc bands of ten cells, in the disk's
 * own order and numbered with the same count: one locale per cell, its
 * endonym in its own script with lang and dir, and its chip. Under the
 * bands, the variants register expands four base languages into every
 * regional variant the roster lists, names two from the tail of the
 * catalog, and closes with the count line.
 */
import { endonym, HREFS, RING_LOCALES, TAIL_LOCALES, TELL_LOCALES, VARIANT_ROWS } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { Chip } from './Chip';
import { SectionHead } from './SectionHead';

export function Languages() {
  const total = RING_LOCALES.reduce((sum, ring) => sum + ring.length, 0);

  return (
    <section className='cr-sec cr-langs' aria-labelledby='cr-langs-h'>
      <div className='cr-col'>
        <SectionHead
          count={total}
          ring='Ring four, unrolled'
          id='cr-langs-h'
          title='100+ languages, and the variants that matter'
          lead='zh-Hant is not zh-Hans. Both ship.'
        />
        {RING_LOCALES.map((ring, i) => (
          <ArcBand
            key={i}
            sag={i === 0 ? 26 : 22}
            numerals
            start={1 + RING_LOCALES.slice(0, i).reduce((sum, r) => sum + r.length, 0)}
            subdivide={2}
            as='ul'
            label={i === 0 ? 'The outer ring, first half' : 'The outer ring, second half'}
            className='cr-langs-arc'
            cells={ring.map((code) => {
              const word = endonym(code);
              return (
                <div key={code} className='cr-lang'>
                  <span className='cr-lang-word' lang={word.lang} dir={word.dir}>
                    {word.text}
                  </span>
                  <Chip code={code} source={code === 'en'} />
                </div>
              );
            })}
          />
        ))}

        {/* the variants register: one base language per row, every variant the roster lists after it */}
        <ol className='cr-vreg' aria-label='Regional variants'>
          {VARIANT_ROWS.map((row) => {
            const word = endonym(row.base);
            return (
              <li key={row.base} className='cr-vreg-row'>
                <div className='cr-vreg-base'>
                  <span className='cr-vreg-word' lang={word.lang} dir={word.dir}>
                    {word.text}
                  </span>
                  <Chip code={row.base} />
                </div>
                <ul className='cr-vreg-vars'>
                  {row.variants.map((code) => (
                    <li key={code}>
                      <Chip code={code} className={TELL_LOCALES.includes(code) ? 'is-tell' : undefined} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
          <li className='cr-vreg-row is-tail'>
            {TAIL_LOCALES.map((tail) => (
              <div key={tail.code} className='cr-vreg-base'>
                <span className='cr-vreg-word'>{tail.name}</span>
                <Chip code={tail.code} />
              </div>
            ))}
          </li>
        </ol>

        <div className='cr-langs-foot'>
          <p className='cr-count'>78 base languages, 129 distinct locale tags.</p>
          <a className='cr-btn is-line' href={HREFS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
