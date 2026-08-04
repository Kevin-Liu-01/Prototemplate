import { Fragment } from 'react';
import type { ReactNode } from 'react';

import GlyphRain from '@/app/d/singularity/sections/GlyphRain';
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import './context.css';

/**
 * V0 CONTEXT — "Localize in context." The section is the spec's one
 * glyph-rise band: a full-bleed ink plate with GlyphRain falling behind
 * the whole story. Four bentos carry the verbatim CONTEXT BENTO ROW copy,
 * each with a built artifact — two doubled-thread forks (application
 * logic, dynamic variants), the glossary card, the German directives
 * card — then the review block: heading, the "Edit in context." card, and
 * the workspace ledger. Root-agnostic: only tc tokens and hardcoded
 * dark-plate colors.
 */

/* ---------- the doubled-thread fork ---------- */

type ForkBranch = {
  /** the code-ish key that decides the branch — the only mono in the note */
  attr: string;
  value: string;
  /** variant keys (masculine/feminine) stay mono; prose contexts don't */
  valueMono?: boolean;
  word: string;
  code: string;
};

/** House fork geometry (ContextResolve): the stem at x=220 of 440 splits
    into landings at 25% and 75% — the two branch cards' centers once the
    SVG bleeds half the card gap per side. */
const FORK_PATHS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

const SAVE_BRANCHES: readonly [ForkBranch, ForkBranch] = [
  { attr: 'context', value: 'saving a file', word: 'speichern', code: 'de' },
  { attr: 'context', value: 'discount', word: 'sparen', code: 'de' },
];

const WELCOME_BRANCHES: readonly [ForkBranch, ForkBranch] = [
  { attr: 'gender', value: 'masculine', valueMono: true, word: 'Bienvenido', code: 'es' },
  { attr: 'gender', value: 'feminine', valueMono: true, word: 'Bienvenida', code: 'es' },
];

type ThreadForkProps = {
  code: string;
  source: ReactNode;
  label: string;
  branches: readonly [ForkBranch, ForkBranch];
};

/**
 * Source chip at the top splitting through the brand's doubled thread into
 * two resolved chips: the Y is one full-gauge ink stroke per branch with a
 * plate-colored core, which leaves two parallel 1.5px threads along the
 * whole curve. Static — the fork is the statement, both branches are live.
 */
function ThreadFork({ code, source, label, branches }: ThreadForkProps) {
  return (
    <div className='v0-ctx-fork' role='img' aria-label={label}>
      <div className='v0-ctx-fork-src'>
        <LocaleTag code={code} />
        <span className='v0-ctx-word'>{source}</span>
      </div>
      <svg
        className='v0-ctx-threads'
        viewBox='0 0 440 56'
        preserveAspectRatio='none'
        aria-hidden='true'
      >
        {FORK_PATHS.map((d) => (
          <path className='v0-ctx-thread' d={d} key={`thread-${d}`} />
        ))}
        {FORK_PATHS.map((d) => (
          <path className='v0-ctx-core' d={d} key={`core-${d}`} />
        ))}
      </svg>
      <div className='v0-ctx-branches'>
        {branches.map((branch) => (
          <div className='v0-ctx-branch' key={branch.value}>
            <span className='v0-ctx-branch-top'>
              <LocaleTag code={branch.code} />
              <span className='v0-ctx-word' lang={branch.code}>
                {branch.word}
              </span>
            </span>
            <span className='v0-ctx-note'>
              <code>{branch.attr}:</code>
              {branch.valueMono ? (
                <code className='is-val'>{branch.value}</code>
              ) : (
                <span>{`‘${branch.value}’`}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- the glossary card ---------- */

type VaultRow = {
  code: string;
  /** the translated line around the verbatim term — that IS the point */
  before: string;
  after: string;
};

const VAULT_ROWS: readonly VaultRow[] = [
  { code: 'de', before: 'Im ', after: ' speichern' },
  { code: 'es', before: 'Guardar en ', after: '' },
  { code: 'fr', before: 'Enregistrer dans ', after: '' },
  { code: 'ja', before: '', after: 'に保存' },
  { code: 'zh', before: '保存到 ', after: '' },
];

/* ---------- the directives card (German) ---------- */

/** The formatting directive's date is real Intl output, never typed in. */
const DE_DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date(2026, 6, 30));

type Directive = {
  label: string;
  text: ReactNode;
  /** the tiny before→after pair under the Sie directive */
  pair?: { before: string; after: string };
};

const DIRECTIVES: readonly Directive[] = [
  { label: 'Audience', text: 'Avoid jargon.' },
  {
    label: 'Formality',
    text: 'Use the formal “Sie.”',
    pair: { before: 'Du kannst…', after: 'Sie können…' },
  },
  { label: 'Conventions', text: 'Use active voice.' },
  {
    label: 'Formatting',
    text: (
      <>
        Write dates as <code>{DE_DATE}</code>.
      </>
    ),
  },
];

/* ---------- the review workspace ---------- */

type WorkspaceRow = {
  key: string;
  source: string;
  translation: string;
  /** the open row shows an edit affordance and a live caret, not a stamp */
  stamp: 'approved' | 'edit';
};

const WORKSPACE_ROWS: readonly WorkspaceRow[] = [
  {
    key: 'hello',
    source: 'Hello, world!',
    translation: '¡Hola, mundo!',
    stamp: 'approved',
  },
  {
    key: 'launch',
    source: 'Launch in every language',
    translation: 'Lanza en todos los idiomas',
    stamp: 'approved',
  },
  {
    key: 'meta',
    source: "End-to-end localization for the world's best companies",
    translation: 'Localización integral para las mejores empresas del mundo',
    stamp: 'edit',
  },
];

const EDIT_BULLETS: readonly string[] = [
  'Side-by-side source and translation view',
  'See diffs when translations are regenerated',
  'Edit translations before or after they go live',
];

export default function V0Context() {
  return (
    <section className='tc-sec v0-ctx' id='context'>
      <GlyphRain className='v0-ctx-rain' intensity={0.4} />

      <div className='v0-ctx-in'>
        <header className='v0-ctx-head'>
          <h2>Localize in context.</h2>
          <p>GT connects your code, content, and translations.</p>
        </header>

        <div className='v0-ctx-bentos'>
          <div className='v0-ctx-cell'>
            <h3>Translations that reflect your application logic.</h3>
            <p>GT translates your content in the context of your codebase.</p>
            <div className='v0-ctx-art'>
              <ThreadFork
                code='en'
                source='Save'
                label='The English string Save resolves by context: speichern when it saves a file, sparen when it means a discount'
                branches={SAVE_BRANCHES}
              />
            </div>
          </div>

          <div className='v0-ctx-cell'>
            <h3>Translations that reflect your key terminology.</h3>
            <p>
              Define a glossary with key product, brand, and feature terms to inherit universally.
            </p>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-glossary'>
                <div className='v0-ctx-glossary-head'>
                  <b>Vault</b>
                  <span className='v0-ctx-rule'>pinned</span>
                </div>
                {VAULT_ROWS.map((row) => (
                  <div className='v0-ctx-glossary-row' key={row.code}>
                    <LocaleTag code={row.code} />
                    <span className='v0-ctx-glossary-line' lang={row.code}>
                      {row.before}
                      <b>Vault</b>
                      {row.after}
                    </span>
                  </div>
                ))}
                <div className='v0-ctx-glossary-head'>
                  <b>Locadex</b>
                  <span className='v0-ctx-rule'>never translate</span>
                </div>
              </div>
            </div>
          </div>

          <div className='v0-ctx-cell'>
            <h3>Translations that reflect your voice and style.</h3>
            <p>Define directives to guide tone and style for translations.</p>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-dirs'>
                <div className='v0-ctx-dirs-head'>
                  <b>Directives</b>
                  <span className='v0-ctx-dirs-loc'>
                    <LocaleTag code='de' />
                    German
                  </span>
                </div>
                {DIRECTIVES.map((directive) => (
                  <div className='v0-ctx-dir' key={directive.label}>
                    <b>{directive.label}</b>
                    <span className='v0-ctx-dir-body'>
                      <p>{directive.text}</p>
                      {directive.pair ? (
                        <span className='v0-ctx-dir-pair' lang='de'>
                          <span className='is-before'>{directive.pair.before}</span>
                          <span className='is-arrow' aria-hidden='true'>
                            {'→'}
                          </span>
                          <span>{directive.pair.after}</span>
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='v0-ctx-cell'>
            <h3>Translations that work dynamically.</h3>
            <p>Generate variants for all possible values and user responses.</p>
            <div className='v0-ctx-art'>
              <ThreadFork
                code='en'
                source={
                  <>
                    {'Welcome, '}
                    <code>{'{name}'}</code>
                  </>
                }
                label='Welcome, name derives Spanish gender variants: Bienvenido and Bienvenida'
                branches={WELCOME_BRANCHES}
              />
            </div>
          </div>
        </div>

        <div className='v0-ctx-review'>
          <header className='v0-ctx-review-head'>
            <h3>Review from one surface.</h3>
            <p>
              Edit and approve translations with your team in a side-by-side view with diffs and
              version history.
            </p>
          </header>

          <div className='v0-ctx-review-grid'>
            <aside className='v0-ctx-edit'>
              <h4>Edit in context.</h4>
              <p>Agents write translations. You review, edit, and approve in a focused workspace.</p>
              <ul>
                {EDIT_BULLETS.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </aside>

            <div className='v0-ctx-ws'>
              <div className='v0-ctx-ws-bar'>
                <span>
                  workspace · <code>es</code>
                </span>
                <span>
                  <code>3</code> strings
                </span>
              </div>

              <div className='v0-ctx-ws-cols'>
                <div className='v0-ctx-ws-lab'>
                  source — <code>en</code>
                </div>
                <div className='v0-ctx-ws-lab is-t'>
                  translation — <code>es</code>
                </div>
                {WORKSPACE_ROWS.map((row) => (
                  <Fragment key={row.key}>
                    <div className='v0-ctx-ws-cell'>{row.source}</div>
                    <div
                      className={
                        row.stamp === 'edit' ? 'v0-ctx-ws-cell is-t is-editing' : 'v0-ctx-ws-cell is-t'
                      }
                    >
                      <span className='v0-ctx-ws-text' lang='es'>
                        {row.translation}
                        {row.stamp === 'edit' ? (
                          <span className='v0-ctx-caret' aria-hidden='true' />
                        ) : null}
                      </span>
                      <span
                        className={row.stamp === 'edit' ? 'v0-ctx-stamp is-edit' : 'v0-ctx-stamp'}
                      >
                        {row.stamp}
                      </span>
                    </div>
                  </Fragment>
                ))}
              </div>

              <div className='v0-ctx-ws-foot'>
                <span>
                  <code>⌘K</code> search
                </span>
                <span>history</span>
                <span>download</span>
                <span className='is-right'>agent · locadex</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
