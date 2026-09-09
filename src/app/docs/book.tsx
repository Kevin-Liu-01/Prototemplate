import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CRAFT_SECTIONS } from '@/app/craft/CraftArticle';
import { pad2 } from '@/lib/shell-data';

import { parseBlocks, renderBlocks, splitDoc } from './markdown';
import type { DocPage, DocSection } from './model';
import { docHref, docShot, README_SLUG } from './model';
import { DOCS } from './registry';

/**
 * The server side of /docs: reads the six documents from the app root at
 * build time and renders them into the pages the client shell lays out.
 * Files are read relative to process.cwd(); the ship loop rsyncs the root
 * docs alongside src/. The readme comes first and carries the build log
 * (CRAFT_SECTIONS) as its last rows, numbered on from its own headings.
 */
export function readDoc(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

const README = {
  slug: README_SLUG,
  file: 'README.md',
  title: 'Readme',
  blurb: 'The repository readme: what Prototemplate is, how to run it, where to read next, and the build log.',
} as const;

export function buildDocs(): readonly DocPage[] {
  const entries = [README, ...DOCS];
  return entries.map((entry, i) => {
    const split = splitDoc(parseBlocks(readDoc(entry.file)));
    const sections: DocSection[] = split.rows.map((row) => ({
      kind: 'markdown',
      id: row.id,
      n: row.n,
      title: row.title,
      body: renderBlocks(row.blocks, `${entry.slug}-${row.id}`),
    }));
    if (entry.slug === README_SLUG) {
      for (const craft of CRAFT_SECTIONS) {
        sections.push({
          kind: 'craft',
          id: craft.id,
          n: pad2(sections.length + 1),
          title: craft.title,
          body: craft.body,
        });
      }
    }
    return {
      slug: entry.slug,
      n: pad2(i + 1),
      title: entry.title,
      blurb: entry.blurb,
      file: entry.file,
      href: docHref(entry.slug),
      shot: docShot(entry.slug),
      lead: split.lead.length > 0 ? renderBlocks(split.lead, `${entry.slug}-lead`) : null,
      sections,
    };
  });
}
