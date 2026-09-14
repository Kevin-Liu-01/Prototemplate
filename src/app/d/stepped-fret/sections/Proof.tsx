'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { NEXT_SAMPLE, STEPS } from '../data';
import { useRise } from '../reveal';
import Chip from './Chip';
import CodeFace from './CodeFace';
import Register from './deco/Register';

/**
 * The T component as a fret path. The source sits at the base: the shipped
 * Next.js sample in its code window. To its right the stair climbs: each
 * step is one tread holding the same string served in another locale, with
 * the locale's flag chip seated on the riser. Every step owns its own top
 * and left hairline, so the stair is one continuous line drawn once, and
 * the step above draws no bottom rule (the seam belongs to the tread
 * below). The top step is the one in progress and carries the accent.
 */
export default function Proof() {
  const root = useRef<HTMLDivElement>(null);
  useRise(root);
  const count = STEPS.length;

  return (
    <Register k={1} id='proof' className='sf-proof'>
      <div ref={root} className='sf-proof-in'>
        <header className='sf-head'>
          <h2 className='sf-h2' data-rise>
            The T component, step by step
          </h2>
          <p className='sf-lead' data-rise>
            Wrap the source once. <code>npx gt translate</code> writes every locale at build time, and each step
            to the right is the same component served in another language.
          </p>
        </header>

        <div className='sf-stair'>
          <div className='sf-stair-base' data-rise>
            <div className='sf-stair-src'>
              <span className='sf-kicker'>source · en</span>
              <span className='sf-stair-srctext' lang='en'>
                Hello, world!
              </span>
            </div>
            <CodeFace file={NEXT_SAMPLE.file} code={NEXT_SAMPLE.code} />
            <div className='sf-install'>
              {NEXT_SAMPLE.install.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </div>
          </div>

          {/* n + 2 columns: step i spans from column i + 1 to the right edge and
              sits on row n - i, so each tread is one column narrower than the
              one below it and the top tread still spans three columns */}
          <ol
            className='sf-steps'
            style={{ gridTemplateColumns: `repeat(${count + 2}, minmax(0, 1fr))` } as CSSProperties}
            aria-label='The same string in six locales'
          >
            {STEPS.map((step, i) => (
              <li
                key={step.code}
                className={['sf-step', i === count - 1 ? 'is-active' : ''].filter(Boolean).join(' ')}
                style={{ gridColumn: `${i + 1} / -1`, gridRow: count - i } as CSSProperties}
                data-rise
              >
                <span className='sf-step-riser'>
                  <Chip code={step.code} active={i === count - 1} />
                </span>
                <span className='sf-step-text' lang={step.lang} dir={step.rtl ? 'rtl' : 'ltr'}>
                  {step.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Register>
  );
}
