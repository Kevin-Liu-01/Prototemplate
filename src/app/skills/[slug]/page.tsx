import { notFound } from 'next/navigation';

import { renderBlocks } from '@/components/book/markdown';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { SKILLS, getSkill } from '@/lib/skills';
import type { Skill } from '@/lib/skills';
import { requireUpdated } from '@/lib/updated';

import { describe } from '../model';
import SkillViewer from '../SkillViewer';

import { skillBlocks } from './body';

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ slug: skill.id }));
}

/* a slug outside the curated set (the generated set it replaced held 267) is a 404 */
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/** The longest description a search snippet shows whole. */
const SNIPPET_MAX = 160;

/**
 * The skill's head description, 50 to 160 characters: its summary, then as
 * much of its "Use when" sentence as fits, cut after a whole list item and
 * closed with a period. A summary that runs past the limit loses its
 * parenthesis, then its tail after the last comma that fits.
 */
function skillDescription(skill: Skill): string {
  const { summary, use } = describe(skill.description);
  const fit = (text: string, room: number): string => {
    if (text.length <= room) return text;
    const plain = text.replace(/\s*\([^)]*\)/g, '');
    if (plain.length <= room) return plain;
    const comma = plain.lastIndexOf(',', room - 1);
    return comma > 0 ? `${plain.slice(0, comma)}.` : plain.slice(0, room);
  };
  const head = fit(summary, SNIPPET_MAX);
  if (!use || head.length + 1 + use.length <= SNIPPET_MAX) return use ? `${head} ${use}` : head;
  const tail = fit(use, SNIPPET_MAX - head.length - 1);
  return tail.endsWith('.') ? `${head} ${tail}` : head;
}

/** The route's head and JSON-LD: one skill, its SKILL.md as the Markdown twin, its folder as the source. */
function skillRoute(skill: Skill) {
  return seoRoute({
    path: `/skills/${skill.id}`,
    title: skill.title,
    section: 'Skills',
    kind: 'skill',
    description: skillDescription(skill),
    crumbs: [{ name: 'Skills', path: '/skills' }],
    updated: requireUpdated(`/skills/${skill.id}`),
    markdown: `/skills/${skill.id}/SKILL.md`,
    source: `skills/${skill.id}`,
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  return skillRoute(skill).metadata;
}

/**
 * /skills/[slug]: one skill on the viewer shell. The body is read from
 * skills/<slug>/SKILL.md here on the server and rendered with the book's
 * markdown renderer, so the client receives elements and no markdown ever
 * ships in the bundle. The key on the viewer makes a change of slug a fresh
 * mount, so the shell's active item always matches the address.
 */
export default async function SkillPage({ params }: Params) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  const body = renderBlocks(skillBlocks(skill.id), skill.id);
  return (
    <>
      <JsonLd nodes={skillRoute(skill).jsonLd} />
      <SkillViewer key={skill.id} slug={skill.id} body={body} updated={requireUpdated(`/skills/${skill.id}`)} />
    </>
  );
}
