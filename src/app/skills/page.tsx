import type { Metadata } from 'next';

import { SKILLS } from '@/lib/skills';

import SkillsViewer from './SkillsViewer';

export const metadata: Metadata = {
  title: 'Skills',
  description: `The ${SKILLS.length} working skills behind the design lab and the product, each a SKILL.md an agent loads for one kind of task, read as a ruled book or a grid.`,
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /skills opens the book at its head; the list on the left holds every skill under its category. */
export default function SkillsPage() {
  return <SkillsViewer />;
}
