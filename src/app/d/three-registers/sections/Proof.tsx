'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import { BELT, OUTPUTS } from '../data';
import { Chip } from './Chip';
import { CodeBlock } from './code';
import { Band, Register } from './Register';

/**
 * Register II. The proof of the T component in three bands: the shipped
 * code sample for each of the six stacks in the first, the rendered
 * outputs whose formatting follows the locale in the second, the served
 * strings with their locale chips in the third. The tabs are the only
 * interaction; the active one carries the gold underline.
 */
export function Proof() {
  const [active, setActive] = useState(0);
  const framework = FRAMEWORKS[active] ?? FRAMEWORKS[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const count = FRAMEWORKS.length;
    let next = active;
    if (event.key === 'ArrowRight') next = (active + 1) % count;
    else if (event.key === 'ArrowLeft') next = (active - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    setActive(next);
    const tab = event.currentTarget.parentElement?.children[next];
    if (tab instanceof HTMLElement) tab.focus();
  };

  if (!framework) return null;

  return (
    <Register id='proof' numeral='II' name='The T component'>
      <Band label='source · one wrapper' className='is-source'>
        <h2 className='tr-h2' data-cut>
          One toolchain, every stack.
        </h2>
        <p className='tr-sub' data-cut>
          Developer-first SDKs to translate everything from simple sites to complex user experiences. Wrap the JSX
          you already wrote in <code>&lt;T&gt;</code>.
        </p>
        <div className='tr-tabs' role='tablist' aria-label='Frameworks' data-cut>
          {FRAMEWORKS.map((item, i) => (
            <button
              type='button'
              role='tab'
              id={`tr-tab-${item.id}`}
              aria-selected={i === active}
              aria-controls={`tr-panel-${item.id}`}
              tabIndex={i === active ? 0 : -1}
              className={i === active ? 'tr-tab is-on' : 'tr-tab'}
              onClick={() => setActive(i)}
              onKeyDown={onKeyDown}
              key={item.id}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div data-cut>
          <CodeBlock
            file={framework.file}
            pkg={framework.pkg}
            code={framework.code}
            id={`tr-panel-${framework.id}`}
            labelledBy={`tr-tab-${framework.id}`}
          />
          <p className='tr-install'>
            <code>{framework.install[0]}</code>
            <code>{framework.install[1]}</code>
          </p>
        </div>
      </Band>

      <Band label='rendered · formatting follows the locale' className='is-outputs'>
        <ul className='tr-outputs'>
          {OUTPUTS.map((row) => (
            <li className='tr-output' key={row.cap} data-cut>
              <span className='tr-output-cap'>{row.cap}</span>
              <code className='tr-output-api'>{row.api}</code>
              <b className='tr-output-val' lang={row.loc}>
                {row.out}
              </b>
              <Chip code={row.loc} />
            </li>
          ))}
        </ul>
      </Band>

      <Band label='served · public/_gt/[locale].json' className='is-served'>
        {BELT.map((row) => (
          <div className='tr-belt' key={row.source} data-cut>
            <div className='tr-belt-src'>
              <span className='tr-belt-key'>source</span>
              <b lang='en'>{row.source}</b>
              <Chip code='en' />
            </div>
            <ul className='tr-belt-out'>
              {row.outputs.map((out) => (
                <li key={out.loc} lang={out.loc}>
                  <b>{out.text}</b>
                  <Chip code={out.loc} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Band>
    </Register>
  );
}
