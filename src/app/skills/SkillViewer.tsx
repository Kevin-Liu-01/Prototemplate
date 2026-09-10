'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { gtText } from '@/components/viewer/GtWord';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import type { ShellMode } from '@/lib/shell-data';
import { SKILLS, getSkill, skillHref } from '@/lib/skills';
import type { Skill } from '@/lib/skills';

import { SECTIONS, categoryLabel, neighbours, skillNumber, skillRawHref, sourceLabel } from './model';

import '../prototemplate.css';
import '../docs/docs.css';
import './skills.css';

const SKILLS_TITLE = 'Skills';
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

type SkillPageProps = {
  skill: Skill;
  /** the body rendered on the server by src/app/skills/[slug]/page.tsx */
  body: ReactNode;
};

/**
 * The skill inside the flow sheet: the book head (the name, the description
 * as the lead, the category, the number and the source as the meta rows),
 * the SKILL.md body in the docs' prose grammar (.ptd-body under .pt-root,
 * docs.css), and the two neighbours in the same category under one rule.
 */
function SkillPage({ skill, body }: SkillPageProps) {
  const { prev, next } = neighbours(skill.id);
  const label = categoryLabel(skill.category);
  return (
    <div className='ptd-book'>
      <BookHead
        title={skill.name}
        lead={gtText(skill.description)}
        meta={[
          { key: 'Category', value: label },
          { key: 'Skill', value: `${skillNumber(skill.id)} of ${SKILLS.length}` },
          { key: 'Source', value: sourceLabel(skill.source) },
        ]}
      />
      <div className='sk-doc ptd-body pt-root'>{body}</div>
      <nav className='sk-pager' aria-label={`Neighbouring skills in ${label}`}>
        {prev ? (
          <Link className='sk-pager-link is-prev' href={prev.href}>
            <Icon name='arrow-left-circle' />
            <span>
              <small>Previous in {label}</small>
              <b>{prev.name}</b>
            </span>
          </Link>
        ) : (
          <span className='sk-pager-end' aria-hidden='true' />
        )}
        {next ? (
          <Link className='sk-pager-link is-next' href={next.href}>
            <span>
              <small>Next in {label}</small>
              <b>{next.name}</b>
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
};

/**
 * One skill on the viewer shell: the three categories in the list under
 * Knowledge, with this skill's row marked, the skill itself as a book in
 * the 1280px flow sheet, and the raw file one click away in the toolbar.
 * Flow keys, so Space and the arrows scroll. Selecting another skill from
 * the list, the keys or the search navigates to its page (the archive
 * route's pattern); the row of the current page is never re-selected.
 */
export default function SkillViewer({ slug, body }: SkillViewerProps) {
  const router = useRouter();
  const skill = getSkill(slug) ?? SKILLS[0];

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
      toolbarSlot={<RawLink slug={slug} />}
      onSelect={onSelect}
    >
      <Sheet variant='flow' width={1280}>
        {skill ? <SkillPage skill={skill} body={body} /> : null}
      </Sheet>
    </ViewerShell>
  );
}
