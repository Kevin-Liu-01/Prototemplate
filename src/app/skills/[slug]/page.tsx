import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { renderBlocks } from '@/app/docs/markdown';
import { SKILLS, getSkill } from '@/lib/skills';

import { skillWindowTitle } from '../model';
import SkillViewer from '../SkillViewer';

import { skillBlocks } from './body';

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ slug: skill.id }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return { title: { absolute: 'Prototemplate skills' } };
  return {
    title: { absolute: skillWindowTitle(skill.name) },
    description: skill.description,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/**
 * /skills/[slug]: one skill on the viewer shell. The body is read from
 * public/skills/<slug>.md here on the server and rendered with the docs'
 * markdown renderer, so the client receives elements and no markdown ever
 * ships in the bundle. The key on the viewer makes a change of slug a fresh
 * mount, so the shell's active item always matches the address.
 */
export default async function SkillPage({ params }: Params) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  const body = renderBlocks(skillBlocks(skill.id), skill.id);
  return <SkillViewer key={skill.id} slug={skill.id} body={body} />;
}
