import type { Metadata } from 'next';

import { SKILLS } from '@/lib/skills';
import { PAGE_NAMES } from '@/lib/page-names';
import { requireUpdated } from '@/lib/updated';

import { BLOCKS, capitalized, countWord } from './model';
import SkillsViewer from './SkillsViewer';

export const metadata: Metadata = {
  title: PAGE_NAMES.skills.name,
  description: `${capitalized(countWord(SKILLS.length))} skills that record how General Translation work is done, filed under ${countWord(BLOCKS.length)} areas. Each is a SKILL.md that Claude Code, Codex and other agents load, installable in any project with one command.`,
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /skills opens the book at its head; the list on the left holds the whole set as one numbered run under Skills. */
export default function SkillsPage() {
  return <SkillsViewer updated={requireUpdated('/skills')} />;
}
