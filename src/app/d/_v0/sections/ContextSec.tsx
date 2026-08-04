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
 * logic, dynamic variants), the glossary ledger, the directives table —
 * then the review block beside a compact workspace. Root-agnostic: only
 * tc tokens and hardcoded dark-plate colors.
 */

/* ---------- the doubled-thread fork ---------- */

type ForkBranch = {
  attr: string;
  value: string;
  word: string;
  code: string;
  gloss: string;
};

/** House fork geometry (ContextResolve): the stem at x=220 of 440 splits
    into landings at 25% and 75% — the two branch cards' centers once the
    SVG bleeds half the card gap per side. */
const FORK_PATHS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

const SAVE_BRANCHES: readonly [ForkBranch, ForkBranch] = [
  { attr: 'context', value: 'file', word: 'speichern', code: 'de', gloss: 'write it to disk' },
  { attr: 'context', value: 'discount', word: 'sparen', code: 'de', gloss: 'spend less money' },
];

const WELCOME_BRANCHES: readonly [ForkBranch, ForkBranch] = [
  { attr: 'gender', value: 'masculine', word: 'Bienvenido', code: 'es', gloss: 'addressing Diego' },
  { attr: 'gender', value: 'feminine', word: 'Bienvenida', code: 'es', gloss: 'addressing Lucía' },
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
            <code className='v0-ctx-attr'>
              {branch.attr}=<b>{`"${branch.value}"`}</b>
            </code>
            <span className='v0-ctx-word' lang={branch.code}>
              {branch.word}
            </span>
            <span className='v0-ctx-glossline'>
              <LocaleTag code={branch.code} />
              <span>· {branch.gloss}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- the glossary ledger ---------- */

type GlossaryEntry = {
  code: string;
  /** A machine draft the pinned term overrode, struck through in the row. */
  rejected?: string;
  term: string;
};

type GlossaryGroup = {
  term: string;
  rule: string;
  entries: readonly GlossaryEntry[];
};

const GLOSSARY: readonly GlossaryGroup[] = [
  {
    term: 'Vault',
    rule: 'pinned',
    entries: [
      { code: 'de', term: 'Vault' },
      { code: 'es', rejected: 'Bóveda', term: 'Vault' },
      { code: 'fr', term: 'Vault' },
      { code: 'ja', term: 'Vault' },
    ],
  },
  {
    term: 'Locadex',
    rule: 'never translate',
    entries: [
      { code: 'es', term: 'Locadex' },
      { code: 'ja', term: 'Locadex' },
    ],
  },
];

/* ---------- the directives table ---------- */

type Directive = {
  label: string;
  text: string;
};

/** One target language per the spec note — the glossary already shows
    several, so the directives stay on the German example. */
const DIRECTIVES: readonly Directive[] = [
  { label: 'Audience', text: 'Write for developers evaluating tools — precise, never promotional.' },
  { label: 'Formality', text: 'Address users with the formal “Sie,” never “du.”' },
  { label: 'Conventions', text: 'Use active voice and avoid jargon.' },
  { label: 'Formatting', text: 'Keep headings in sentence case; leave code samples untranslated.' },
];

/* ---------- the review workspace ---------- */

type WorkspaceRow = {
  key: string;
  source: string;
  translation: string;
  /** A regenerated row keeps the line it replaced, struck through above. */
  previous?: string;
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
    key: 'hero',
    source: 'Launch in every language',
    translation: 'Lanza en todos los idiomas',
    stamp: 'approved',
  },
  {
    key: 'meta',
    source: "End-to-end localization for the world's best companies",
    previous: 'Localización de extremo a extremo para las mejores empresas del mundo.',
    translation: 'Localización integral para las mejores empresas del mundo.',
    stamp: 'edit',
  },
];

export default function V0Context() {
  return (
    <section className='v0-ctx'>
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
                label='The English string Save resolves by context: speichern when it writes a file, sparen when it saves money'
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
                {GLOSSARY.map((group) => (
                  <Fragment key={group.term}>
                    <div className='v0-ctx-glossary-head'>
                      <b>{group.term}</b>
                      <span>{group.rule}</span>
                    </div>
                    {group.entries.map((entry) => (
                      <div className='v0-ctx-glossary-row' key={`${group.term}-${entry.code}`}>
                        <LocaleTag code={entry.code} />
                        <span className='v0-ctx-glossary-term'>
                          {entry.rejected ? <s lang={entry.code}>{entry.rejected}</s> : null}
                          {entry.term}
                        </span>
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className='v0-ctx-cell'>
            <h3>Translations that reflect your voice and style.</h3>
            <p>Define directives to guide tone and style for translations.</p>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-dirs'>
                {DIRECTIVES.map((directive) => (
                  <div className='v0-ctx-dir' key={directive.label}>
                    <b>{directive.label}</b>
                    <p>{directive.text}</p>
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
          <div className='v0-ctx-review-copy'>
            <h3>Review from one surface.</h3>
            <p>
              Edit and approve translations with your team in a side-by-side view with diffs and
              version history.
            </p>
          </div>

          <div className='v0-ctx-ws'>
            <div className='v0-ctx-ws-bar'>
              <span>
                workspace · <code>es-419</code>
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
                  <div className='v0-ctx-ws-cell is-t'>
                    <span className='v0-ctx-ws-text' lang='es'>
                      {row.previous ? <s>{row.previous}</s> : null}
                      <span>{row.translation}</span>
                    </span>
                    <span className={row.stamp === 'edit' ? 'v0-ctx-stamp is-edit' : 'v0-ctx-stamp'}>
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
    </section>
  );
}
