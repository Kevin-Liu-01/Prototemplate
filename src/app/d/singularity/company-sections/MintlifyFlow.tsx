'use client';

import type { ComponentType } from 'react';
import { useRef } from 'react';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { GitBranch, Globe } from 'lucide-react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "How it works" — the live page's three-step diagram, filed as three ruled
 * cells across one sheet. Heading, dek and all three step titles and bodies
 * are verbatim from MintlifyPage.tsx; the marks are the same three icons.
 */

type IconProps = {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

type Step = { mark: string; title: string; body: string; icon: ComponentType<IconProps> };

const STEPS: readonly Step[] = [
  {
    mark: '01',
    title: 'Connect your repo',
    body: 'Link your GitHub repository containing your Mintlify docs with one click.',
    icon: SiGithub,
  },
  {
    mark: '02',
    title: 'Select languages',
    body: 'Choose which languages you want to support. We handle the rest automatically.',
    icon: Globe,
  },
  {
    mark: '03',
    title: 'Review and merge',
    body: 'Locadex opens PRs with translations. Review the changes and merge when ready.',
    icon: GitBranch,
  },
];

export default function MintlifyFlow() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='how' ref={root}>
      <div className='cp-head' data-reveal>
        <span className='cp-kicker'>Integration</span>
        <h2>How it works</h2>
        <p>
          Add multilingual support to your Mintlify docs in three steps &mdash; no code
          changes required.
        </p>
      </div>

      <div className='cpm-steps'>
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <article className='cpm-step' data-reveal key={step.mark}>
              <div className='cpm-step-rule'>
                <span className='cpm-step-mark'>{step.mark}</span>
                <Icon
                  aria-hidden
                  className='cpm-step-glyph'
                  color='currentColor'
                  size={16}
                  strokeWidth={1.75}
                />
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
