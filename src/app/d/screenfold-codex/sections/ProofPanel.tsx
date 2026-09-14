'use client';

import { useRef, type ReactNode } from 'react';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import BarDot from '../components/BarDot';
import Chip from '../components/Chip';
import CopyCommand from '../components/CopyCommand';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { RTL_CODES, HELLO_ROWS, HELLO_SOURCE } from '../data';

/**
 * Leaf two: the T component's proof. The source sits in the top register
 * as the shipped Next.js sample; below it the translations are counted
 * down the registers, one per register, each with its bar-and-dot row
 * number, its flag chip, the string in its own script and direction, and
 * the file the build wrote it to.
 */
const SAMPLE = FRAMEWORKS.find((f) => f.id === 'next') ?? FRAMEWORKS[0];

const TOKEN = /('[^']*'|"[^"]*"|<\/?T>)/g;

function highlight(code: string): ReactNode[] {
  return code.split('\n').map((line, i) => {
    const parts = line.split(TOKEN).map((part, j) => {
      if (part === '<T>' || part === '</T>') {
        return (
          <span className='sfc-tok-t' key={j}>
            {part}
          </span>
        );
      }
      if (/^['"]/.test(part)) {
        return (
          <span className='sfc-tok-str' key={j}>
            {part}
          </span>
        );
      }
      return part;
    });
    return (
      <span className='sfc-code-line' key={i}>
        {parts}
        {'\n'}
      </span>
    );
  });
}

export default function ProofPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={2} fold='b' id='proof'>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            The T component
          </h2>
          <p className='sfc-lead' data-reveal>
            Wrap the markup. The build writes every locale as a file, and the runtime reads the one
            the request asks for.
          </p>
        </Register>

        <Register className='is-source'>
          <div className='sfc-code' data-reveal>
            <div className='sfc-code-bar'>
              <span className='sfc-code-file'>{SAMPLE?.file}</span>
              <span className='sfc-code-pkg'>{SAMPLE?.pkg}</span>
              <CopyCommand text={SAMPLE?.code ?? ''} controlOnly />
            </div>
            <pre className='sfc-code-pre'>
              <code>{highlight(SAMPLE?.code ?? '')}</code>
            </pre>
          </div>
          <p className='sfc-source-line' data-reveal>
            <span className='sfc-kicker'>source</span>
            <Chip code='en' />
            <span className='sfc-source-text' lang='en'>
              {HELLO_SOURCE}
            </span>
          </p>
        </Register>

        {HELLO_ROWS.map((row, i) => (
          <Register className='is-row' key={row.loc}>
            <div className='sfc-trow' data-reveal>
              <span className='sfc-trow-num'>
                <BarDot n={i + 1} layout='row' scale={0.9} />
                <span className='sfc-trow-n'>{i + 1}</span>
              </span>
              <Chip code={row.loc} />
              <span className='sfc-trow-text' lang={row.loc} dir={RTL_CODES.has(row.loc) ? 'rtl' : 'ltr'}>
                {row.text}
              </span>
              <code className='sfc-trow-file'>{row.file}</code>
            </div>
          </Register>
        ))}

        <Register className='is-foot'>
          <p className='sfc-note' data-reveal>
            <code>public/_gt/[locale].json</code> is written at build time. The build, the runtime, and
            the agent bill at the published rates on leaf six.
          </p>
        </Register>
      </Panel>
    </div>
  );
}
