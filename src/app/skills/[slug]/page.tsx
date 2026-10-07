import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { renderBlocks } from '@/app/docs/markdown';
import { PAGE_NAMES } from '@/lib/page-names';
import { SKILLS, getSkill } from '@/lib/skills';
import { requireUpdated } from '@/lib/updated';

import { describe, skillWindowTitle } from '../model';
import SkillViewer from '../SkillViewer';

import { skillBlocks } from './body';

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ slug: skill.id }));
}

/* a slug outside the curated set (the generated set it replaced held 267) is a 404 */
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return { title: PAGE_NAMES.skills.name };
  const { summary, use } = describe(skill.description);
  return {
    title: { absolute: skillWindowTitle(skill.title) },
    description: use ? `${summary} ${use}` : summary,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/**
 * /skills/[slug]: one skill on the viewer shell. The body is read from
 * skills/<slug>/SKILL.md here on the server and rendered with the docs'
 * markdown renderer, so the client receives elements and no markdown ever
 * ships in the bundle. The key on the viewer makes a change of slug a fresh
 * mount, so the shell's active item always matches the address.
 */
export default async function SkillPage({ params }: Params) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  const body = renderBlocks(skillBlocks(skill.id), skill.id);
  return <SkillViewer key={skill.id} slug={skill.id} body={body} updated={requireUpdated(`/skills/${skill.id}`)} />;
}
