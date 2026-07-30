'use client';

import { useRef } from 'react';

import PluralForms from '../diagrams/lang/PluralForms';
import RtlMirror from '../diagrams/lang/RtlMirror';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';

/**
 * The grammar section: plural rules and writing direction — the two places
 * a string table simply has no column for. The diagrams carry the argument
 * (CLDR picking Polish forms, a dir flip mirroring a panel), and the code
 * panel shows the API that makes both a one-liner.
 */

const PLURAL = `import { T, Plural, Num } from 'gt-react';

export function Inbox({ count }: { count: number }) {
  return (
    <T>
      <Plural
        n={count}
        one={<>You have <Num>{count}</Num> message.</>}
        other={<>You have <Num>{count}</Num> messages.</>}
      />
    </T>
  );
}`;

export default function Grammar() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='grammar' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Grammar the string table can&rsquo;t see.</h2>
        <p data-reveal>
          English has two plural forms, Polish four, Japanese one — and Arabic reads the other way.
          Neither fact fits in a key-value file.
        </p>
      </div>

      {/* ---- the two demonstrations ---- */}
      <div className='tc-row is-grammar'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Counting is not concatenation</h3>
            <p>
              English has two plural forms, Polish four, Japanese one. GT ships ICU plurals, so the
              number picks the form instead of the string.
            </p>
            <div className='tc-lang is-night'>
              <PluralForms accent={false} title='One count under English, Polish and Japanese plural rules' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Both directions, one markup</h3>
            <p>
              Set <code className='tc-chip'>dir</code> and the browser mirrors rows, alignment and
              controls. Nothing about the panel is written twice.
            </p>
            <div className='tc-lang is-night'>
              <RtlMirror accent={false} title='The same panel rendered left-to-right and right-to-left' />
            </div>
          </div>
        </div>
      </div>

      {/* ---- the API that makes both a one-liner ---- */}
      <div className='tc-row is-split is-reverse'>
        <div className='tc-cell is-panel is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Every variant translated, not interpolated</h3>
            <p>
              Each branch child is translated independently, so every form reads naturally instead of
              being assembled from a stem plus a suffix.
            </p>
            <CodeBlock file='components/Inbox.tsx' code={PLURAL} />
          </div>
        </div>

        <div className='tc-cell is-tall' data-reveal>
          <h3>The source writes two forms. Targets get what they need.</h3>
          <p>
            English only has <code className='tc-chip'>one</code> and{' '}
            <code className='tc-chip'>other</code>, so that is all you write. Polish supplies{' '}
            <code className='tc-chip'>few</code> and <code className='tc-chip'>many</code> itself;
            Arabic adds <code className='tc-chip'>zero</code> and <code className='tc-chip'>two</code>.
          </p>
          <ul className='tc-list'>
            <li>
              <code className='tc-chip'>&lt;Plural&gt;</code> selects by CLDR rules, not{' '}
              <code className='tc-chip'>n === 1</code>
            </li>
            <li>
              <code className='tc-chip'>&lt;Branch&gt;</code> does the same for any condition
            </li>
            <li>
              <code className='tc-chip'>&lt;Num&gt;</code> formats the count to the reader&rsquo;s
              locale inside the sentence
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
