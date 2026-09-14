'use client';

import { useRef } from 'react';

import DoubledLine from '@/components/shared/diagrams/DoubledLine';

import Chip from './Chip';
import CopyButton from './CopyButton';
import CourtHead from './CourtHead';
import Cartouche from './deco/Cartouche';
import FanCapital from './deco/FanCapital';
import { FRAMEWORKS, SOURCE_STRING, TRANSLATIONS, type Framework } from './data';
import { useCourtReveal } from './reveal';

/**
 * The hypostyle: the T proof on the axis inside a hall of columns. The
 * source component is sealed in a horizontal cartouche at the top; a
 * doubled thread drops from it to a descending column of cartouches, one
 * per locale, each with its flag chip and the translated string. Three
 * pillars on each side carry the six first-party stacks under fan
 * capitals.
 */
const SOURCE_CODE = `<T>\n  <h1>${SOURCE_STRING}</h1>\n</T>`;

function pillar(framework: Framework) {
  return (
    <div className='pg-pillar' key={framework.pkg}>
      <FanCapital className='pg-fan' />
      <b>{framework.name}</b>
      <code>{framework.pkg}</code>
      <code className='pg-pillar-file'>{framework.file}</code>
    </div>
  );
}

export default function Hypostyle() {
  const root = useRef<HTMLElement>(null);
  useCourtReveal(root);

  return (
    <section className='pg-court pg-hypo' id='t-component' ref={root}>
      <div className='pg-passage'>
        <CourtHead
          n={2}
          title='The T component'
          sub='The source is written once. The build ships it in every language, and each translation carries the locale it was made for.'
        />

        <div className='pg-hall'>
          <div className='pg-hall-side is-l'>{FRAMEWORKS.slice(0, 3).map(pillar)}</div>

          <div className='pg-hall-axis'>
            <Cartouche className='pg-cart-src' reveal>
              <div className='pg-cart-bar'>
                <span>app/page.tsx</span>
                <CopyButton text={SOURCE_CODE} className='pg-copy' />
              </div>
              <pre className='pg-code'>
                <code>
                  {'<T>\n  <h1>'}
                  <span className='pg-str' lang='en'>
                    {SOURCE_STRING}
                  </span>
                  {'</h1>\n</T>'}
                </code>
              </pre>
            </Cartouche>

            <svg className='pg-thread' viewBox='0 0 24 34' aria-hidden='true'>
              <DoubledLine d='M12 0V34' core='currentColor' ink='currentColor' />
            </svg>

            <ol className='pg-cart-col'>
              {TRANSLATIONS.map((translation) => (
                <Cartouche as='li' key={translation.code} reveal>
                  <Chip code={translation.code} />
                  <span className='pg-str' lang={translation.lang} dir={translation.rtl ? 'rtl' : 'ltr'}>
                    {translation.text}
                  </span>
                </Cartouche>
              ))}
            </ol>
          </div>

          <div className='pg-hall-side is-r'>{FRAMEWORKS.slice(3).map(pillar)}</div>
        </div>
      </div>
    </section>
  );
}
