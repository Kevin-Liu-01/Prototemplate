import { HANDBOOK, HANDBOOK_README } from '@/app/handbook/registry';
import type { DocEntry } from '@/app/handbook/registry';
import { readDoc } from '@/components/book/book';
import { siteHref } from '@/components/book/links';
import { SITE_URL, selfUrl } from '@/lib/seo/policy';
import { source } from '@/lib/source';
import type { DocsPage } from '@/lib/source';

/**
 * The text the agent files serve: the Markdown twin of every docs page and
 * every handbook document (src/app/md/[...path]/route.ts), /llms-full.txt
 * and /AGENTS.md. A docs page's twin is its processed Markdown
 * (page.data.getText('processed'), kept by includeProcessedMarkdown in
 * source.config.ts); a handbook document's is its repository file. Every
 * relative link resolves to the address the site serves it at, made
 * absolute on www, so a twin read on its own still links out correctly.
 * Each twin opens with its title and canonical URL and closes with a
 * pointer to /llms.txt, the index of the rest.
 */

/** The served Markdown's content type. */
export const MARKDOWN_TYPE = 'text/markdown; charset=utf-8';

/** The index every twin points back to. */
export const LLMS_URL = `${SITE_URL}/llms.txt`;

/** The headers of a twin: the type and the HTML page as its canonical. */
export function twinHeaders(pagePath: string): HeadersInit {
  return { 'Content-Type': MARKDOWN_TYPE, Link: `<${selfUrl(pagePath)}>; rel="canonical"` };
}

/**
 * Every Markdown link and image target in `markdown` resolved the way the
 * handbook resolves it (siteHref, relative to the file's folder `dir`) and
 * made absolute on www; fenced code is left as written.
 */
export function absoluteLinks(markdown: string, dir = ''): string {
  let fenced = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line.replace(/\]\(([^)\s]+)\)/g, (_m, target: string) => {
        const href = siteHref(target, dir);
        return `](${href.startsWith('/') ? `${SITE_URL}${href}` : href})`;
      });
    })
    .join('\n');
}

/** A twin: the title line, the canonical URL, the body, then the pointer to the index. */
function twin(title: string, pagePath: string, body: string, description?: string): string {
  const head = [`# ${title}`, '', ...(description ? [`> ${description}`, ''] : []), `URL: ${selfUrl(pagePath)}`, ''];
  return `${head.join('\n')}\n${body.trim()}\n\n---\n\nThe index of every page on this site, for agents: ${LLMS_URL}\n`;
}

/** A docs page's twin from its processed Markdown. */
export async function docsMarkdown(page: DocsPage): Promise<string> {
  const body = await page.data.getText('processed');
  return twin(page.data.title, page.url, absoluteLinks(body), page.data.description);
}

/** The handbook's documents in the book's order, the readme first, each with its pathname. */
export function handbookDocs(): readonly { entry: DocEntry; path: string }[] {
  return [HANDBOOK_README, ...HANDBOOK].map((entry) => ({
    entry,
    path: entry.slug === HANDBOOK_README.slug ? '/handbook' : `/handbook/${entry.slug}`,
  }));
}

/** The repository folder a file sits in, for its relative links. */
function folderOf(file: string): string {
  const at = file.lastIndexOf('/');
  return at < 0 ? '' : file.slice(0, at);
}

/** A handbook document's text with its relative links made absolute, its own h1 dropped (the twin writes the title). */
export function handbookText(entry: DocEntry): string {
  return absoluteLinks(readDoc(entry.file), folderOf(entry.file)).replace(/^# .*\n+/, '');
}

/** A handbook document's twin. The libraries document's build log is React on its page; the twin says where to read it. */
export function handbookMarkdown(entry: DocEntry, path: string): string {
  const note =
    entry.slug === 'libraries'
      ? `\n\nThe build log, with every library running live, follows this index on ${selfUrl(path)}.`
      : '';
  return twin(entry.title === 'Readme' ? 'Handbook' : entry.title, path, `${handbookText(entry)}${note}`, entry.blurb);
}

/** Every docs page in the sidebar's order (content/docs/meta.json). */
export function docsPages(): DocsPage[] {
  const order: string[] = [];
  const walk = (nodes: ReturnType<typeof source.getPageTree>['children']) => {
    for (const node of nodes) {
      if (node.type === 'page') order.push(node.url);
      else if (node.type === 'folder') {
        if (node.index) order.push(node.index.url);
        walk(node.children);
      }
    }
  };
  walk(source.getPageTree().children);
  const rank = (url: string) => (order.includes(url) ? order.indexOf(url) : order.length);
  return [...source.getPages()].sort((a, b) => rank(a.url) - rank(b.url));
}
