import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Reads a repository file from the app root at build time: the handbook
 * documents and the canon for /AGENTS.md, the Markdown twins and
 * /llms-full.txt. Files are read relative to process.cwd() while the routes
 * prerender, so nothing reads them at request time, and the path stays out
 * of the file trace. The handbook's pages under /docs/handbook show the
 * same files through fumadocs-mdx's include tag (content/docs/handbook).
 */
export function readDoc(file: string): string {
  /* a computed path: without the ignore, Turbopack's file trace takes in the whole checkout */
  return readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), file), 'utf8');
}
