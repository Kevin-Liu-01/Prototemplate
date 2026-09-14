'use client';

import { useRef } from 'react';

import Chip, { CodeChip } from '../components/Chip';
import CourseHead from '../components/CourseHead';
import { useLayReveal } from '../components/lay-reveal';
import Rosette from '../components/Rosette';
import {
  MEDALLIONS_BOTTOM,
  MEDALLIONS_TOP,
  TELL_VARIANTS,
  URLS,
  VARIANT_COUNT,
  VARIANT_ROWS,
  VARIANT_TAIL,
} from '../data';
import type { Medallion } from '../data';

/**
 * Languages as material. Two courses of rosette medallions in bond, the
 * second offset by half a medallion, each a lapis disc with sixteen gold
 * petals and the language's own name at its center with its `lang` and
 * `dir`, a flag chip and the English name under it. Under the frieze, the
 * variants register: one language expanded into the regional tags it
 * ships as, with zh-Hans beside zh-Hant as the tell.
 */
function Medal({ row }: { row: Medallion }) {
  return (
    <figure className='gb-med'>
      <span className='gb-med-face'>
        <Rosette size={120} />
        <span className='gb-med-text' lang={row.lang} dir={row.dir ?? 'ltr'}>
          {row.text}
        </span>
      </span>
      <figcaption className='gb-med-cap'>
        <Chip code={row.code} />
        <span>{row.name}</span>
      </figcaption>
    </figure>
  );
}

export default function RosetteCourse() {
  const root = useRef<HTMLElement>(null);
  useLayReveal(root, '.gb-med');

  return (
    <section className='gb-course' id='languages' ref={root}>
      <div className='gb-course-in'>
        <CourseHead
          n={2}
          title='100+ languages, and the variants that matter'
          sub='zh-Hant is not zh-Hans. Both ship.'
        />

        <div className='gb-frieze'>
          <div className='gb-frieze-in'>
            <div className='gb-frieze-row'>
              {MEDALLIONS_TOP.map((row) => (
                <Medal row={row} key={row.code} />
              ))}
            </div>
            <div className='gb-frieze-row is-offset'>
              {MEDALLIONS_BOTTOM.map((row) => (
                <Medal row={row} key={row.code} />
              ))}
            </div>
          </div>
        </div>

        <div className='gb-register' role='table' aria-label='Regional variants'>
          <div className='gb-reg-row is-head' role='row'>
            <span role='columnheader'>Tag</span>
            <span role='columnheader'>Language</span>
            <span role='columnheader'>Ships as</span>
          </div>
          {VARIANT_ROWS.map((row) => (
            <div className='gb-reg-row' role='row' key={row.tag}>
              <span className='gb-reg-tag' role='cell'>
                {row.tag}
              </span>
              <span className='gb-reg-name' role='cell'>
                {row.name}
              </span>
              <span className='gb-reg-chips' role='cell'>
                {row.variants.map((variant) => (
                  <CodeChip tell={TELL_VARIANTS.includes(variant)} key={variant}>
                    {variant}
                  </CodeChip>
                ))}
              </span>
            </div>
          ))}
          <div className='gb-reg-row is-tail' role='row'>
            <span className='gb-reg-tag' role='cell' aria-hidden='true' />
            <span className='gb-reg-name is-muted' role='cell'>
              and the long tail
            </span>
            <span className='gb-reg-chips is-muted' role='cell'>
              {VARIANT_TAIL.map((row) => (
                <span className='gb-reg-tail' key={row.tag}>
                  <CodeChip>{row.tag}</CodeChip> {row.name}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className='gb-course-foot'>
          <p className='gb-count'>{VARIANT_COUNT}</p>
          <a className='gb-btn is-line is-sm' href={URLS.locales}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
