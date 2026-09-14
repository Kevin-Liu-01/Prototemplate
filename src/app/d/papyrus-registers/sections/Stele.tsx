'use client';

import { useMemo } from 'react';

import { CLI_LOCALES, HELLO_SOURCE, LINKS } from '../data';
import { steppedPyramid } from '../fields';
import { usePapyrusDither } from '../use-dither';
import Chip from './Chip';
import ColumnHead from './ColumnHead';

/**
 * The one dark moment: a stele of black granodiorite with battered sides,
 * the pylon wall's slope as a clip path. On it, the path of one string
 * from the source to the screen, as four ruled registers: the source node,
 * the files the CLI writes (one per locale, each named by its chip), the
 * request header the edge reads, and the rendered page. Under the plate
 * the floor is a stepped pyramid in papyrus-toned dither, setbacks
 * brightening as they rise. The stele stays dark in both themes.
 */
const TRANSLATION = '¡Hola, mundo!';

export default function Stele() {
  const field = useMemo(() => steppedPyramid({ steps: 9 }), []);
  const floor = usePapyrusDither(field, {
    inkToken: '--pr-stone-ink',
    paperToken: '--pr-stone',
    scale: 3,
    fps: 20,
  });

  return (
    <section className='pr-stele' id='served' aria-labelledby='pr-stele-title'>
      <div className='pr-stele-in'>
        <div className='pr-stele-plate'>
          <ColumnHead
            tone='stone'
            n={5}
            id='pr-stele-title'
            title='The served file'
            sub='The CLI writes one file per locale. The edge serves the one the request names. The page renders it in place.'
          />

          <ol className='pr-regs'>
            <li className='pr-regs-row'>
              <span className='pr-regs-label'>source · en</span>
              <code className='pr-regs-code' lang='en'>
                {'<T><h1>'}
                {HELLO_SOURCE}
                {'</h1></T>'}
              </code>
            </li>
            <li className='pr-regs-row'>
              <span className='pr-regs-label'>files</span>
              <span className='pr-regs-body'>
                <code className='pr-regs-path'>public/_gt/</code>
                <span className='pr-regs-chips'>
                  {CLI_LOCALES.map((code) => (
                    <Chip key={code} code={code} tone='stone' />
                  ))}
                </span>
              </span>
            </li>
            <li className='pr-regs-row'>
              <span className='pr-regs-label'>request</span>
              <code className='pr-regs-code'>Accept-Language: es</code>
            </li>
            <li className='pr-regs-row'>
              <span className='pr-regs-label'>render · es</span>
              <span className='pr-regs-render' lang='es'>
                {TRANSLATION}
              </span>
            </li>
          </ol>

          <div className='pr-acts'>
            <a className='pr-btn is-solid' href={LINKS.demo}>
              Get a Demo
            </a>
            <a className='pr-btn is-line' href={LINKS.demo}>
              Talk to an Engineer
            </a>
          </div>
        </div>

        <div className='pr-stele-floor'>
          <canvas ref={floor} className='pr-stele-canvas' aria-hidden='true' />
        </div>
      </div>
    </section>
  );
}
