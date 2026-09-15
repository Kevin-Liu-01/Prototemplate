'use client';

import { useRef, type ReactNode } from 'react';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import Chip from '../components/Chip';
import CopyCommand from '../components/CopyCommand';
import Fig from '../components/Fig';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { COMPONENT_PROOF, HELLO_SOURCE, PROOF_ROWS, RTL_CODES, START_SOURCE, leaf } from '../data';

/**
 * Leaf two: the T component's proof, laid out as a stele. The top register
 * holds the source: the shipped Next.js sample in its window and, beside
 * it, the two English strings the build reads out of it. Below, one
 * register per locale carries both strings in that language and its
 * direction, the row's ordinal in bar and dot, the flag chip, and the
 * file the build wrote. The last content register is the other
 * components, each with one shipped output and the locale that formats it.
 */
const LEAF = leaf('proof');

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
      <Panel index={LEAF.n} fold={LEAF.fold} sign={LEAF.sign} id={LEAF.id}>
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
          <div className='sfc-stele' data-reveal>
            <div className='sfc-code'>
              <div className='sfc-code-bar'>
                <span className='sfc-code-file'>{SAMPLE?.file}</span>
                <span className='sfc-code-pkg'>{SAMPLE?.pkg}</span>
                <CopyCommand text={SAMPLE?.code ?? ''} controlOnly />
              </div>
              <pre className='sfc-code-pre'>
                <code>{highlight(SAMPLE?.code ?? '')}</code>
              </pre>
            </div>
            <div className='sfc-sources'>
              <p className='sfc-kicker'>source · en</p>
              <ul className='sfc-source-list'>
                <li className='sfc-source-line'>
                  <Chip code='en' />
                  <span className='sfc-source-text' lang='en'>
                    {HELLO_SOURCE}
                  </span>
                  <code className='sfc-source-from'>{SAMPLE?.file}</code>
                </li>
                <li className='sfc-source-line'>
                  <Chip code='en' />
                  <span className='sfc-source-text' lang='en'>
                    {START_SOURCE}
                  </span>
                  <code className='sfc-source-from'>gt(&apos;Get started&apos;)</code>
                </li>
              </ul>
              <p className='sfc-note'>
                Two English strings go in. The registers below are what the build wrote for each
                locale, in that locale&apos;s script and direction.
              </p>
            </div>
          </div>
        </Register>

        {PROOF_ROWS.map((row, i) => (
          <Register className='is-row' key={row.loc}>
            <div className='sfc-trow' data-reveal>
              <Fig n={i + 1} className='sfc-trow-num'>
                {i + 1}
              </Fig>
              <Chip code={row.loc} />
              <span className='sfc-trow-text' lang={row.loc} dir={RTL_CODES.has(row.loc) ? 'rtl' : 'ltr'}>
                {row.hello}
              </span>
              <span
                className='sfc-trow-text is-second'
                lang={row.loc}
                dir={RTL_CODES.has(row.loc) ? 'rtl' : 'ltr'}
              >
                {row.start}
              </span>
              <code className='sfc-trow-file'>{row.file}</code>
            </div>
          </Register>
        ))}

        <Register className='is-caps'>
          <div data-reveal>
            <h3 className='sfc-reg-title'>The other components</h3>
            <ul className='sfc-caps'>
              {COMPONENT_PROOF.map((row) => (
                <li className='sfc-cap' key={row.api}>
                  <code className='sfc-cap-api'>{row.api}</code>
                  <span className='sfc-cap-out' lang={row.loc}>
                    {row.output}
                  </span>
                  <span className='sfc-cap-foot'>
                    <Chip code={row.loc} />
                    <span className='sfc-cap-what'>{row.what}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Register>

        <Register className='is-foot'>
          <p className='sfc-note' data-reveal>
            <code>public/_gt/[locale].json</code> is written at build time. The build, the runtime, and
            the agent bill at the published rates on leaf seven.
          </p>
        </Register>
      </Panel>
    </div>
  );
}
