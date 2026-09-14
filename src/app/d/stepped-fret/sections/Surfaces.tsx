'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { CAPABILITIES, CLI_LOCALES, STACKS } from '../data';
import { useRise } from '../reveal';
import Chip from './Chip';
import Register from './deco/Register';

/**
 * The product as four plinths: the libraries as a ledger of the six SDKs
 * with their install lines, the CLI as one session, the dashboard as the
 * context cascade it manages, and Locadex as the pull request it opens. The
 * plinths step up left to right by one fret step each, the page's grid
 * geometry restated inside one register. Each plinth owns its one hairline
 * frame; the ground between them is the seam.
 */
export default function Surfaces() {
  const root = useRef<HTMLDivElement>(null);
  useRise(root);

  return (
    <Register k={2} id='platform' className='sf-surfaces'>
      <div ref={root} className='sf-surfaces-in'>
        <header className='sf-head'>
          <h2 className='sf-h2' data-rise>
            Everything localization needs
          </h2>
          <p className='sf-lead' data-rise>
            Four surfaces, one pipeline. The CLI translates the strings, the dashboard holds the context, Locadex
            does the work in your repository, and six libraries render the result.
          </p>
        </header>

        <div className='sf-plinths'>
          <article className='sf-plinth' data-rise>
            <h3 className='sf-h3'>CLI</h3>
            <p className='sf-plinth-p'>One command at build time. The dry run bills nothing.</p>
            <div className='sf-term' role='img' aria-label='A terminal session of the gt CLI translating 128 strings into six locales'>
              <div className='sf-term-bar'>gt cli · session</div>
              <pre className='sf-term-body'>
                <span className='sf-term-line'>
                  <span className='is-prompt'>$</span> npx gt translate
                </span>
                <span className='sf-term-line'>128 strings · 3 new · 2 changed</span>
                <span className='sf-term-line'>6 locales</span>
                <span className='sf-term-line'>640 translations written</span>
              </pre>
              <div className='sf-term-chips'>
                {CLI_LOCALES.map((code) => (
                  <Chip key={code} code={code} />
                ))}
              </div>
            </div>
          </article>

          <article className='sf-plinth' data-rise>
            <h3 className='sf-h3'>Dashboard</h3>
            <p className='sf-plinth-p'>Context is inherited down the tree. Each level adds to the one above it.</p>
            <ol className='sf-cascade'>
              <li>
                <span className='sf-kicker'>Organization</span>
                <span>Keyword glossary · custom prompts</span>
              </li>
              <li>
                <span className='sf-kicker'>Project</span>
                <span>Context groups · version branching</span>
              </li>
              <li>
                <span className='sf-kicker'>Component</span>
                <code>{'<T context="file">'}</code>
              </li>
            </ol>
          </article>

          <article className='sf-plinth is-locadex' data-rise>
            <h3 className='sf-h3'>
              <Image
                className='sf-locadex-mark'
                src='/brand/no-bg-locadex-logo-light.png'
                alt=''
                aria-hidden
                width={18}
                height={18}
              />
              Locadex
            </h3>
            <p className='sf-plinth-p'>The agent reads the repository, marks the strings, and opens the pull request.</p>
            <div className='sf-pr'>
              <span className='sf-kicker'>agent · locadex</span>
              <span className='sf-pr-title'>PR #218</span>
              <span className='sf-pr-line'>6 locales · 640 translations</span>
              <span className='sf-pr-line'>128 strings · 3 new · 2 changed</span>
            </div>
          </article>

          <article className='sf-plinth' data-rise>
            <h3 className='sf-h3'>Libraries</h3>
            <p className='sf-plinth-p'>Six first-party SDKs. The same components on every stack.</p>
            <ul className='sf-ledger'>
              {STACKS.map((stack) => (
                <li key={stack.pkg}>
                  <span>{stack.name}</span>
                  <code>{stack.install}</code>
                </li>
              ))}
            </ul>
            <ul className='sf-caps'>
              {CAPABILITIES.map((cap) => (
                <li key={cap.name}>
                  <span className='sf-kicker'>{cap.name}</span>
                  <code>{cap.demo}</code>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </Register>
  );
}
