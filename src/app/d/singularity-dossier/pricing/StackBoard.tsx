'use client';

import { useState } from 'react';
import {
  Brain,
  Check,
  GitBranch,
  GitPullRequest,
  Globe2,
  Languages,
  LibraryBig,
} from 'lucide-react';

import 'flag-icons/css/flag-icons.min.css';

import StackDiagram from './StackDiagram';
import StackThreads from './StackThreads';

/**
 * The full-stack board: four station cards wired straight to their
 * plates on the expanded platform. A card is a pressable stage —
 * selecting it re-inks its plate and thread and fades in its one-line
 * description (space reserved, so nothing reflows); the diagrams carry
 * the rest of the story. The plates are the same toggles.
 */
export function StackBoard() {
  const [active, setActive] = useState<number | null>(null);
  const toggle = (station: number) =>
    setActive((current) => (current === station ? null : station));

  const cardProps = (station: number) => ({
    className:
      active == null ? undefined : active === station ? 'is-hot' : 'is-dim',
    role: 'button' as const,
    tabIndex: 0,
    'aria-pressed': active === station,
    onClick: () => toggle(station),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle(station);
      }
    },
  });

  return (
    <section className='tc-sec pricing-stack'>
      <div className='pricing-stack-head'>
        <h2>Full-stack localization</h2>
        <p>
          One connected platform from source code and context to reviewed,
          production-ready translations.
        </p>
      </div>

      <div className='pricing-stack-board' data-active={active ?? undefined}>
        <StackThreads />
        <div className='pricing-stack-board-col is-left'>
          <article {...cardProps(3)}>
            <div className='pricing-stack-title'>
              <i aria-hidden='true'>03</i>
              <Globe2 aria-hidden='true' />
              <h3>Context Platform</h3>
            </div>
            <div className='pricing-stack-desc'>
              <p>
                Curate glossaries, style rules, and project context, along
                with editing, versioning, and integrations.
              </p>
            </div>
            <div
              className='pricing-stack-artifact is-diagram is-context'
              aria-hidden='true'
            >
              <div className='psd-keys'>
                <span>
                  <Check />
                  Glossary
                </span>
                <span>
                  <Check />
                  Style directives
                </span>
                <span>
                  <Check />
                  Project context
                </span>
              </div>
              <div className='psd-merge'>
                <i />
                <i />
                <i />
              </div>
              <div className='psd-node is-dash'>
                <span className='psd-lamps'>
                  <i />
                  <i />
                  <i />
                </span>
                <span className='psd-bar' />
                <span className='psd-bar is-accent' />
              </div>
            </div>
            <span className='pricing-stack-surface'>Dashboard</span>
          </article>
          <article {...cardProps(1)}>
            <div className='pricing-stack-title'>
              <i aria-hidden='true'>01</i>
              <LibraryBig aria-hidden='true' />
              <h3>Internationalization</h3>
            </div>
            <div className='pricing-stack-desc'>
              <p>
                Mark up UI copy, route locales, and ship static translations
                in your codebase.
              </p>
            </div>
            <div
              className='pricing-stack-artifact is-diagram'
              aria-hidden='true'
            >
              <div className='psd-node'>
                <code>&lt;T&gt;Welcome back&lt;/T&gt;</code>
                <span>source.tsx</span>
              </div>
              <div className='psd-fan'>
                <i />
                <i />
                <i />
              </div>
              <div className='psd-node is-locales'>
                <span className='psd-tag'>
                  <span className='fi fi-es' aria-hidden='true' />
                  es
                </span>
                <span className='psd-tag'>
                  <span className='fi fi-jp' aria-hidden='true' />
                  ja
                </span>
                <span className='psd-tag'>
                  <span className='fi fi-fr' aria-hidden='true' />
                  fr
                </span>
              </div>
            </div>
            <span className='pricing-stack-surface'>Code</span>
          </article>
        </div>

        <div className='pricing-stack-board-map'>
          <StackDiagram active={active} onSelect={toggle} />
        </div>

        <div className='pricing-stack-board-col is-right'>
          <article {...cardProps(4)}>
            <div className='pricing-stack-title'>
              <i aria-hidden='true'>04</i>
              <Brain aria-hidden='true' />
              <h3>Agent Automations</h3>
            </div>
            <div className='pricing-stack-desc'>
              <p>
                Locadex scans repos, updates i18n code, generates
                translations, runs visual QA, and opens guarded PRs.
              </p>
            </div>
            <div
              className='pricing-stack-artifact is-diagram'
              aria-hidden='true'
            >
              <div className='psd-node'>
                <GitBranch />
                <code>locadex/i18n</code>
                <span>12 files changed</span>
              </div>
              <div className='psd-link' />
              <div className='psd-node is-agent'>
                <img
                  className='psd-mark'
                  src='/brand/locadex-mark.svg'
                  alt=''
                />
                <span className='psd-bar' />
                <span className='psd-bar is-accent' />
              </div>
              <div className='psd-link' />
              <div className='psd-node'>
                <GitPullRequest />
                <b className='is-accent'>Ready for review</b>
              </div>
            </div>
            <span className='pricing-stack-surface'>Locadex</span>
          </article>
          <article {...cardProps(2)}>
            <div className='pricing-stack-title'>
              <i aria-hidden='true'>02</i>
              <Languages aria-hidden='true' />
              <h3>Translation APIs</h3>
            </div>
            <div className='pricing-stack-desc'>
              <p>
                Translate user-generated and backend content on demand across
                every runtime surface.
              </p>
            </div>
            <div
              className='pricing-stack-artifact is-diagram'
              aria-hidden='true'
            >
              <div className='psd-node'>
                <code>POST /v2/translate</code>
                <span>{'en → ja'}</span>
              </div>
              <div className='psd-link' />
              <div className='psd-node'>
                <b className='is-accent'>200</b>
                <span className='psd-bar' />
                <span>Content</span>
              </div>
            </div>
            <span className='pricing-stack-surface'>Content</span>
          </article>
        </div>
      </div>
    </section>
  );
}
