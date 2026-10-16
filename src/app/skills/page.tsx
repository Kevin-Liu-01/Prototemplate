import { SKILLS } from '@/lib/skills';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { BLOCKS, capitalized, countWord } from './model';
import SkillsViewer from './SkillsViewer';

const route = seoRoute({
  path: '/skills',
  title: PAGE_NAMES.skills.name,
  kind: 'page',
  description: `${capitalized(countWord(SKILLS.length))} skills that record how General Translation work is done, filed under ${countWord(BLOCKS.length)} areas, each a SKILL.md that agents load.`,
});

export const metadata = route.metadata;

/** /skills opens the book at its head; the list on the left holds the whole set as one numbered run under Skills. */
export default function SkillsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <SkillsViewer updated={requireUpdated('/skills')} />
    </>
  );
}
