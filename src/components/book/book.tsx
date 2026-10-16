import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HANDBOOK, HANDBOOK_README } from '@/app/handbook/registry';
import type { DocEntry } from '@/app/handbook/registry';
import type { BookFact } from '@/components/viewer/BookView';
import { PAGE_NAMES } from '@/lib/page-names';
import { readingMinutes } from '@/lib/reading';
import { seoTitle } from '@/lib/seo/route';
import { pad2 } from '@/lib/shell-data';

import { parseBlocks, renderBlocks, splitDoc } from './markdown';
import type { BookId, DocPage, DocSection } from './model';
import { docHref, docShot, README_SLUG } from './model';

/**
 * The server side of the book the book shell renders: /handbook, the
 * documents under docs/handbook/ and the canon. It reads the files from
 * the app root at build time and renders them into the pages the client
 * shell lays out. Files are read relative to process.cwd() while the
 * routes prerender, so nothing reads them at request time, and readDoc's
 * path stays out of the file trace. The book opens with its readme; the
 * libraries document also carries the build log, which
 * src/app/handbook/libraries-book.ts appends, so this module never imports
 * the craft demos. Section numbers read document.section (1.1, 1.2, 3.1),
 * never the bare 01 to 09 that a document itself carries, so a heading row
 * never reads like a document row in the list. A relative link resolves
 * against the folder of the document that holds it (links.ts).
 */
export function readDoc(file: string): string {
  /* a computed path: without the ignore, Turbopack's file trace takes in the whole checkout */
  return readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), file), 'utf8');
}

/** Each book's documents in reading order, its readme first. */
function entriesOf(book: BookId): readonly DocEntry[] {
  return book === 'handbook' ? [HANDBOOK_README, ...HANDBOOK] : [];
}

/** The window title of a document's route: `Handbook, Prototemplate` on the readme, `Glossary, Handbook, Prototemplate` on a document (seoTitle, the rule seoRoute writes). */
export function docWindowTitle(slug: string, title: string, book: BookId = 'handbook'): string {
  return slug === README_SLUG ? seoTitle(PAGE_NAMES[book].name) : seoTitle(title, 'Handbook');
}

/** The repository folder a document sits in, for its relative links: `docs/handbook` for `docs/handbook/glossary.md`. */
function folderOf(file: string): string {
  const at = file.lastIndexOf('/');
  return at < 0 ? '' : file.slice(0, at);
}

/** The minutes a whole book takes to read: every document's source, for the head's Reading fact. */
function bookReadingMinutes(book: BookId): number {
  return readingMinutes(entriesOf(book).map((entry) => readDoc(entry.file)).join('\n'));
}

export function buildBook(book: BookId): readonly DocPage[] {
  return entriesOf(book).map((entry, i) => {
    const dir = folderOf(entry.file);
    const split = splitDoc(parseBlocks(readDoc(entry.file)));
    const number = (k: number) => `${i + 1}.${k + 1}`;
    const sections: DocSection[] = split.rows.map((row, k) => ({
      kind: 'markdown',
      id: row.id,
      n: number(k),
      title: row.title,
      body: renderBlocks(row.blocks, `${entry.slug}-${row.id}`, { dir }),
    }));
    return {
      slug: entry.slug,
      n: pad2(i + 1),
      title: entry.title,
      blurb: entry.blurb,
      file: entry.file,
      windowTitle: docWindowTitle(entry.slug, entry.title, book),
      href: docHref(entry.slug, book),
      shot: docShot(entry.slug, book),
      lead: split.lead.length > 0 ? renderBlocks(split.lead, `${entry.slug}-lead`, { dir }) : null,
      sections,
    };
  });
}

/** The dated rulings in the decisions log: the table rows that open with their date (the superseded practices' rows open with the practice). */
function decisionCount(): number {
  return readDoc('docs/handbook/decisions.md')
    .split('\n')
    .filter((line) => /^\| \d{4}-\d{2}-\d{2} \|/.test(line)).length;
}

/**
 * The head's three facts after Updated, computed from the book on the
 * server: the documents, the dated rulings in the decisions log, then the
 * reading time.
 */
export function bookFacts(book: BookId, docs: readonly DocPage[]): readonly [BookFact, BookFact, BookFact] {
  const reading: BookFact = { icon: 'duration', key: 'Reading', value: `${bookReadingMinutes(book)} min` };
  const documents: BookFact = { icon: 'document', key: 'Documents', value: docs.length };
  return [documents, { icon: 'check-badge', key: 'Decisions', value: decisionCount() }, reading];
}
