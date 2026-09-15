'use client';

import { useRef, type ReactNode } from 'react';

import BarDot from '../components/BarDot';
import Chip from '../components/Chip';
import Fig from '../components/Fig';
import GlyphBlock, { type Motif } from '../components/GlyphBlock';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import TempleField from '../components/TempleField';
import { CLI_LOCALES, DEMO, SIGN_IN, leaf } from '../data';

/**
 * Leaf six, the dark leaf: black ground in both themes, the red frame
 * lifted for it, the screen's tone swapped to cream. The left register is
 * the live dither plate; the right is the story of a string in five
 * steps, each with its ordinal in bar and dot, its sign from the
 * vocabulary, and its figures. The acts close the leaf.
 */
const LEAF = leaf('story');

type Step = { n: number; sign: Motif; title: string; body: ReactNode; figure?: { n: number; text: string } };

const STEPS: readonly Step[] = [
  {
    n: 1,
    sign: 'bond',
    title: 'The wrapped markup',
    body: (
      <>
        The page you already wrote goes inside <code>&lt;T&gt;</code>. Every text node is picked up
        where it stands, with the markup around it as its context.
      </>
    ),
  },
  {
    n: 2,
    sign: 'fret',
    title: 'The build run',
    body: (
      <>
        <code>npx gt translate</code> reads the tree and reports what it found before it bills a token.
      </>
    ),
    figure: { n: 128, text: '128 strings · 3 new · 2 changed' },
  },
  {
    n: 3,
    sign: 'lozenge',
    title: 'The locale files',
    body: <>Each locale lands as a file the runtime can read without a network call.</>,
    figure: { n: 640, text: '6 locales · 640 translations' },
  },
  {
    n: 4,
    sign: 'cross',
    title: 'Review and the pull request',
    body: (
      <>
        A node marked for review waits in the dashboard. Locadex opens the pull request with a diff you
        can read.
      </>
    ),
    figure: { n: 218, text: 'PR #218' },
  },
  {
    n: 5,
    sign: 'step',
    title: 'Delivery from the edge',
    body: <>Updates reach every visitor over the air in under one second.</>,
    figure: { n: 1, text: '<1s' },
  },
];

export default function NightPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={LEAF.n} fold={LEAF.fold} sign={LEAF.sign} tone='night' id={LEAF.id}>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            How a string becomes a shipped translation.
          </h2>
          <p className='sfc-lead' data-reveal>
            From the page you already wrote to the pull request.
          </p>
        </Register>

        <Register className='is-story'>
          <div className='sfc-story' data-reveal>
            <div className='sfc-plate'>
              <div className='sfc-plate-canvas'>
                <TempleField />
              </div>
              <div className='sfc-plate-cap'>
                <span>build</span>
                <span className='sfc-plate-chips'>
                  {CLI_LOCALES.map((loc) => (
                    <Chip code={loc} key={loc} />
                  ))}
                </span>
              </div>
            </div>
            <ol className='sfc-steps'>
              {STEPS.map((step) => (
                <li className='sfc-step' key={step.n}>
                  <span className='sfc-step-num'>
                    <GlyphBlock motif={step.sign} tier={6} size={26} tone='night' />
                    <BarDot n={step.n} layout='row' scale={0.9} />
                  </span>
                  <div className='sfc-step-body'>
                    <h3>{step.title}</h3>
                    <p className='sfc-p'>{step.body}</p>
                    {step.figure ? (
                      <Fig n={step.figure.n} scale={0.8}>
                        <code>{step.figure.text}</code>
                      </Fig>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Register>

        <Register className='is-acts'>
          <div className='sfc-night-acts' data-reveal>
            <div className='sfc-night-agent'>
              <img
                className='sfc-locadex-mark is-night'
                src='/brand/no-bg-locadex-logo-light.png'
                alt='Locadex'
                width={40}
                height={40}
              />
              <span className='sfc-p'>Locadex runs on your repository and opens the pull request.</span>
            </div>
            <div className='sfc-acts'>
              <a className='sfc-btn is-solid' href={SIGN_IN}>
                Get Started
              </a>
              <a className='sfc-btn' href={DEMO} rel='noreferrer' target='_blank'>
                Talk to an Engineer
              </a>
            </div>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
