/* The issue the directions print, read from the story's MDX at build time.
   content.ts reads the file system, so this module runs on the server
   only; the stage receives the result as a prop. */

import { getStory } from '../../_atlas/content';
import { ISSUE_SLUG, type Chapter, type Issue } from './data';

/** Where and when each of the story's sections takes place. */
const NOTES: Record<string, string> = {
  Στοιχεία: 'Alexandria, 300 BCE',
  'Journey to Peking': 'Macau to Peking, 1582–1601',
  幾何原本: 'Beijing, 1607',
};

const langOf = (text: string) => (/\p{Script=Greek}/u.test(text) ? 'grc' : /\p{Script=Han}/u.test(text) ? 'zh-Hant' : 'en');

export function getIssue(): Issue {
  const story = getStory(ISSUE_SLUG);
  if (!story) throw new Error(`press directions: no story ${ISSUE_SLUG}`);
  const href = `/atlas/${story.slug}`;
  const day = new Date(`${story.date}T12:00:00Z`);
  const format = (month: 'long' | 'short') => day.toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const chapters: Chapter[] = story.blocks
    .flatMap((b) => (b.kind === 'heading' ? [b] : []))
    .map((h, i) => ({
      n: String(i + 1).padStart(2, '0'),
      text: h.text,
      lang: langOf(h.text),
      note: NOTES[h.text] ?? '',
      href: `${href}#${h.id}`,
    }));
  return {
    href,
    title: story.title,
    date: format('long'),
    dateShort: format('short'),
    dateDots: story.date.replaceAll('-', '.'),
    minutes: story.minutes,
    chapters,
  };
}
