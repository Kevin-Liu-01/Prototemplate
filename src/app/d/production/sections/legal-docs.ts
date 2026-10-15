import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parseFrontmatter } from '@/lib/blog';

/**
 * The legal documents of /d/production/legal, read at build time.
 *
 * The text is vendored in content/legal/en-US from the public repository
 * github.com/generaltranslation/legal at fbf96ead (2026-10-08), the commit
 * gt-cloud pins as the apps/landing/legal submodule that the live
 * generaltranslation.com/legal pages render; scripts/lint/copies.json
 * holds each file's hash. This reader follows live's
 * apps/landing/src/lib/legal.ts: the frontmatter's description and
 * last_updated, the first `# ` line as the title and the rest as the body,
 * the date written as "October 7, 2026", and the documents sorted by
 * title.
 */

const LEGAL_DIR = join(process.cwd(), 'content', 'legal', 'en-US');

export type LegalDocument = {
  route: string;
  title: string;
  description: string;
  lastUpdated: string;
  content: string;
};

export type LegalHeading = { id: string; title: string };

const DATE = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', timeZone: 'UTC', year: 'numeric' });

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return DATE.format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));
}

function readDocument(route: string): LegalDocument | null {
  let text: string;
  try {
    text = readFileSync(join(LEGAL_DIR, `${route}.md`), 'utf8');
  } catch {
    return null;
  }
  const { data, body } = parseFrontmatter(text);
  const title = /^\s*#\s+([^\r\n]+)\r?\n/.exec(body);
  const description = data.description;
  const updated = data.last_updated;
  if (!title?.[1] || typeof description !== 'string' || typeof updated !== 'string') return null;
  return {
    route,
    title: title[1].trim(),
    description,
    lastUpdated: formatDate(updated),
    content: body.slice(title[0].length).replace(/^\r?\n/, ''),
  };
}

/** The routes live publishes: every .md file whose name does not start with an underscore. */
export function legalRoutes(): string[] {
  return readdirSync(LEGAL_DIR)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .map((file) => file.replace(/\.md$/, ''));
}

export function getLegalDocument(route: string): LegalDocument | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(route)) return null;
  return readDocument(route);
}

export function getLegalDocuments(): LegalDocument[] {
  return legalRoutes()
    .map(readDocument)
    .filter((document): document is LegalDocument => document !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

const LIVE_LEGAL = /^https:\/\/generaltranslation\.com\/legal\//;

/**
 * A relative link between legal documents (`./data-processing.md`) loses
 * its .md, as live's normalizeLegalDocumentHref does, and lands on the
 * mirror's page, as does a link to a live legal page; other absolute,
 * root and anchor links pass through.
 */
export function legalHref(href: string | undefined): string | undefined {
  if (href && LIVE_LEGAL.test(href)) return href.replace(LIVE_LEGAL, '/d/production/legal/');
  if (!href || href.startsWith('/') || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return href;
  }
  return `/d/production/legal/${href.replace(/^\.\//, '').replace(/\.md(?=([?#]|$))/, '')}`;
}

/**
 * The h2 headings of a document body with the ids rehype-slug gives them
 * (github-slugger: lower case, punctuation dropped, spaces to hyphens,
 * repeats numbered across every heading level), for the Contents list.
 */
export function legalHeadings(content: string): LegalHeading[] {
  const seen = new Map<string, number>();
  const headings: LegalHeading[] = [];
  let fenced = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[1] || !match[2]) continue;
    const title = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    const base = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\p{Pc}\- ]/gu, '')
      .replace(/ /g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (match[1].length === 2) headings.push({ id: count === 0 ? base : `${base}-${count}`, title });
  }
  return headings;
}
