'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "Set up Mintlify translations in 5 minutes" — the live page's four-step
 * ledger, filed as a numbered record. Heading, dek and all four steps are
 * verbatim from MintlifyPage.tsx.
 */

type SetupStep = { mark: string; title: string; body: string };

const STEPS: readonly SetupStep[] = [
  {
    mark: '01',
    title: 'Sign in to General Translation',
    body: 'Create a free account on the General Translation dashboard and navigate to the Locadex section.',
  },
  {
    mark: '02',
    title: 'Authorize GitHub and select your repository',
    body: 'Install the General Translation GitHub App and choose the repository that contains your Mintlify documentation.',
  },
  {
    mark: '03',
    title: 'Choose your target languages',
    body: 'Select the languages you want your documentation available in and confirm your default locale.',
  },
  {
    mark: '04',
    title: 'Review and merge the pull request',
    body: 'Locadex creates a pull request on your main branch with the translated files and updated Mintlify configuration. Review the changes and merge when ready.',
  },
];

export default function MintlifySetup() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='setup' ref={root}>
      <div className='cp-head' data-reveal>
        <span className='cp-kicker'>Setup</span>
        <h2>Set up Mintlify translations in 5 minutes</h2>
        <p>
          No configuration files. No CLI tools. Connect your repo and Locadex handles
          full-stack internationalization.
        </p>
      </div>

      <ol className='cpm-setup'>
        {STEPS.map((step) => (
          <li className='cpm-setup-row' data-reveal key={step.mark}>
            <span className='cpm-setup-mark'>{step.mark}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
