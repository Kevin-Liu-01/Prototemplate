'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { gtText } from '@/components/viewer/GtWord';
import { Icon } from '@/components/viewer/icons';
import { InstallField } from '@/components/viewer/InstallField';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';
import { SKILLS, getSkill, skillFileHref, skillHref } from '@/lib/skills';
import type { Skill } from '@/lib/skills';

import {
  SECTIONS,
  areaLabel,
  describe,
  installLine,
  neighbours,
  skillNumber,
  skillRawHref,
  whenToUse,
} from './model';

import '../prototemplate.css';
import '../docs/docs.css';
import './skills.css';

const SKILLS_TITLE = PAGE_NAMES.skills.name;
const SKILL_MODES: readonly ShellMode[] = ['book'];

/** The toolbar slot: the raw SKILL.md in a new tab, with the external glyph (directive 8.7). */
function RawLink({ slug }: { slug: string }) {
  return (
    <a
      className='pt-ib sk-raw'
      href={skillRawHref(slug)}
      target='_blank'
      rel='noreferrer'
      title='Open the raw SKILL.md in a new tab'
    >
      <Icon name='external' />
      <span className='pt-lb'>Raw SKILL.md</span>
    </a>
  );
}

/** What a supporting file is, by the folder it sits in. */
function fileKind(file: string): string {
  if (file === 'SKILL.md') return 'The skill';
  if (file.startsWith('references/')) return 'Reference';
  if (file.startsWith('scripts/')) return 'Script';
  return 'File';
}

/**
 * Under the head's rule: what the skill covers, when to use it and the
 * other areas it belongs to, as ruled rows with the label in the book's
 * gutter. The parts come from the description (model.ts, describe()).
 */
function About({ skill }: { skill: Skill }) {
  const { covers, use } = describe(skill.description);
  const also = skill.areas.slice(1).map(areaLabel);
  return (
    <dl className='sk-about'>
      {covers ? (
        <div>
          <dt>Covers</dt>
          <dd>{gtText(covers)}</dd>
        </div>
      ) : null}
      {use ? (
        <div>
          <dt>When to use</dt>
          <dd>{gtText(whenToUse(use))}</dd>
        </div>
      ) : null}
      {also.length > 0 ? (
        <div>
          <dt>Also in</dt>
          <dd>{also.join(', ')}</dd>
        </div>
      ) : null}
    </dl>
  );
}

/** A divider in the book's grammar (BookView.css, .pt-book-sec): the section and one fact in the gutter, the title beside. */
function Divider({ n, fact, id, title }: { n: number; fact: string; id: string; title: string }) {
  return (
    <div className='pt-book-sec'>
      <small>
        <span>Section {n}</span>
        <span>{fact}</span>
      </small>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

type SkillPageProps = {
  skill: Skill;
  /** the body rendered on the server by src/app/skills/[slug]/page.tsx */
  body: ReactNode;
  /** the head's Updated row: the skill's entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The skill inside the flow sheet, as a book: the head (the title, the
 * description's summary as the lead, the area, the number and the file
 * count in the panel, then what it covers and when to use it under the
 * rule), the band, and three sections: Install (the command in the site's
 * copy field and one sentence on where to run it), Instructions (the
 * SKILL.md body in the docs' prose grammar, .ptd-body under .pt-root from
 * docs.css) and Files (the folder's files linked to their raw addresses).
 * The skills before and after it in the whole set close the page under
 * one rule.
 */
function SkillPage({ skill, body, updated }: SkillPageProps) {
  const { prev, next } = neighbours(skill.id);
  const { summary } = describe(skill.description);
  const files = ['SKILL.md', ...skill.files];
  return (
    <div className='ptd-book sk-page pt-book-col'>
      <BookHead
        title={skill.title}
        lead={gtText(summary)}
        note={<About skill={skill} />}
        updated={updated}
        facts={[
          { icon: 'area', key: 'Area', value: areaLabel(skill.areas[0]) },
          { icon: 'skill', key: 'Skill', value: `${skillNumber(skill.id)} of ${SKILLS.length}` },
          { icon: 'attachment', key: 'Files', value: files.length },
        ]}
      />

      <section className='pt-book-part ptd-doc sk-sec' aria-labelledby='sk-install-h'>
        <Divider n={1} fact='install-skills.mjs' id='sk-install-h' title='Install' />
        <div className='ptd-row'>
          <div className='ptd-pn' aria-hidden='true' />
          <div className='sk-install-body'>
            <InstallField command={installLine(skill.id)} />
            <p>
              Run it from a Prototemplate checkout. It links <code>skills/{skill.id}</code> into the project&rsquo;s{' '}
              <code>.claude/skills</code> and <code>.agents/skills</code>; <code>--copy</code> vendors the folder
              instead, and <code>--dry-run</code> prints each step first.
            </p>
          </div>
        </div>
      </section>

      <section className='pt-book-part ptd-doc sk-sec' aria-labelledby='sk-doc-h'>
        <Divider n={2} fact='SKILL.md' id='sk-doc-h' title='Instructions' />
        <div className='ptd-row'>
          <div className='ptd-pn' aria-hidden='true' />
          <div className='sk-doc ptd-body pt-root'>{body}</div>
        </div>
      </section>

      <section className='pt-book-part ptd-doc sk-sec sk-files' aria-labelledby='sk-files-h'>
        <Divider n={3} fact={`${files.length} files`} id='sk-files-h' title='Files' />
        <div className='ptd-row'>
          <div className='ptd-pn' aria-hidden='true' />
          <div className='sk-files-body'>
            <p>
              The folder <code>skills/{skill.id}</code> as agents fetch it. Each file opens raw.
            </p>
            <ul>
              {files.map((file) => (
                <li key={file}>
                  <span>{fileKind(file)}</span>
                  <a href={skillFileHref(skill.id, file)}>
                    <code>{file}</code>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <nav className='sk-pager' aria-label='Neighbouring skills'>
        {prev ? (
          <Link className='sk-pager-link is-prev' href={prev.href}>
            <Icon name='arrow-left-circle' />
            <span>
              <small>Previous skill</small>
              <b>{prev.title}</b>
            </span>
          </Link>
        ) : (
          <span className='sk-pager-end' aria-hidden='true' />
        )}
        {next ? (
          <Link className='sk-pager-link is-next' href={next.href}>
            <span>
              <small>Next skill</small>
              <b>{next.title}</b>
            </span>
            <Icon name='arrow-right-circle' />
          </Link>
        ) : (
          <span className='sk-pager-end' aria-hidden='true' />
        )}
      </nav>
    </div>
  );
}

export type SkillViewerProps = {
  slug: string;
  body: ReactNode;
  /** the skill's entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * One skill on the viewer shell: the whole set as one numbered run under
 * Knowledge > Skills, with this skill's row marked, the skill itself as a
 * book in the 1280px flow sheet, and the raw file one click away in the
 * toolbar. Flow keys, so Space and the arrows scroll. Selecting another
 * skill from the list, the keys or the search navigates to its page (the
 * archive route's pattern); the row of the current page is never
 * re-selected.
 */
export default function SkillViewer({ slug, body, updated }: SkillViewerProps) {
  const router = useRouter();
  const skill = getSkill(slug) ?? SKILLS[0];
  /* stable, so the memoized toolbar skips this route's renders */
  const rawLink = useMemo(() => <RawLink slug={slug} />, [slug]);

  const onSelect = (id: string) => {
    if (id === slug) return;
    if (getSkill(id)) router.push(skillHref(id));
  };

  return (
    <ViewerShell
      id='skills'
      title={SKILLS_TITLE}
      mark='pt'
      count={`${SKILLS.length} skills`}
      sections={SECTIONS}
      active={slug}
      modes={SKILL_MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='skill'
      toolbarSlot={rawLink}
      onSelect={onSelect}
    >
      <Sheet variant='flow'>
        {skill ? <SkillPage skill={skill} body={body} updated={updated} /> : null}
      </Sheet>
    </ViewerShell>
  );
}
