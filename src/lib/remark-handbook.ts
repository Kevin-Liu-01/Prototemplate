import { readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { remarkHeading } from 'fumadocs-core/mdx-plugins/remark-heading';

import { siteHref } from '@/components/book/links';

/**
 * The handbook pages (content/docs/handbook/*.mdx) show repository Markdown
 * through fumadocs-mdx's include tag: a whole file,
 * `<include cwd>docs/handbook/glossary.md</include>`, or one heading of it at
 * a time, `<include cwd>DESIGN.md#6-the-isometric-family</include>`, so a page
 * can set a live figure between two sections. The files keep their GitHub
 * form, an h1 title and links relative to their own folder. After the
 * include step this plugin drops each included h1 (the docs head prints the
 * title), resolves every relative link with siteHref against the included
 * file's folder, as the handbook book did, and prints raw HTML as text: the
 * files write placeholders such as /skills/<slug> in prose, which MDX cannot
 * compile as HTML. A page that includes a
 * file by headings must name every heading of the file in order, or the
 * build fails, so a heading added to the file cannot drop off its page.
 * source.config.ts registers it; fumadocs-mdx runs its include step first.
 */

/** The parts of an mdast node this plugin reads, so it needs no mdast types. */
type TreeNode = {
  type: string;
  children?: TreeNode[];
  depth?: number;
  url?: string;
  value?: string;
  data?: { hProperties?: { id?: unknown } };
};

/** The parts of the VFile this plugin reads. */
type PageFile = { value: unknown; path: string; cwd: string; dirname?: string; data: object };

/** One include tag of a page: the file as a repository path and the heading id after `#`, if any. */
type Include = { file: string; section: string | null };

type MarkdownParser = { parse: (value: string) => TreeNode };

const INCLUDE_TAG = /<include\b([^>]*)>([^<]*)<\/include>/g;

/* remarkHeading is the slugger fumadocs-mdx's section include matches against */
const assignHeadingIds = remarkHeading({ generateToc: false }) as unknown as (tree: TreeNode) => void;

/** The page's include tags in source order, fenced code left out. */
function includesOf(source: string, cwd: string, pageDir: string): Include[] {
  let fenced = false;
  const text = source
    .split('\n')
    .filter((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      return !fenced;
    })
    .join('\n');
  return [...text.matchAll(INCLUDE_TAG)].map((match) => {
    const spec = (match[2] ?? '').trim();
    const at = spec.lastIndexOf('#');
    /* the base remarkInclude resolves against: the collection root with `cwd`, the page's folder without */
    const absolute = resolve(/\bcwd\b/.test(match[1] ?? '') ? cwd : pageDir, at < 0 ? spec : spec.slice(0, at));
    return { file: relative(cwd, absolute).split(sep).join('/'), section: at < 0 ? null : spec.slice(at + 1) };
  });
}

/** Every node under `node`, depth first, in document order. */
function each(node: TreeNode, visit: (child: TreeNode) => void): void {
  for (const child of node.children ?? []) {
    visit(child);
    each(child, visit);
  }
}

/** The repository folder of a path: `docs/handbook` for `docs/handbook/glossary.md`, '' for a root file. */
function folderOf(file: string): string {
  const at = file.lastIndexOf('/');
  return at < 0 ? '' : file.slice(0, at);
}

/** fumadocs-mdx hands each compile a processor factory on the VFile; the section check parses with its Markdown processor. */
function markdownParser(file: PageFile): MarkdownParser | null {
  if (!('_getProcessor' in file.data) || typeof file.data._getProcessor !== 'function') return null;
  const processor: unknown = file.data._getProcessor('md');
  /* a unified processor is a callable instance, so typeof reads 'function' */
  if ((typeof processor !== 'object' && typeof processor !== 'function') || processor === null) return null;
  if (!('parse' in processor)) return null;
  return processor as MarkdownParser;
}

/** Every heading id of a file in order, as a section include names them. */
function headingIdsOf(absolute: string, parser: MarkdownParser): string[] {
  const tree = parser.parse(readFileSync(absolute, 'utf8'));
  assignHeadingIds(tree);
  const ids: string[] = [];
  each(tree, (node) => {
    if (node.type === 'heading') ids.push(String(node.data?.hProperties?.id ?? ''));
  });
  return ids;
}

export function remarkHandbook() {
  return (tree: TreeNode, file: PageFile) => {
    /* remarkInclude leaves each included file as a nested root, in source order */
    const included: TreeNode[] = [];
    const findRoots = (node: TreeNode) => {
      for (const child of node.children ?? []) {
        if (child.type === 'root') included.push(child);
        else findRoots(child);
      }
    };
    findRoots(tree);
    if (included.length === 0) return;

    const includes = includesOf(String(file.value), file.cwd, file.dirname ?? file.cwd);
    if (includes.length !== included.length) {
      throw new Error(`${file.path}: ${includes.length} include tags in the source, ${included.length} included roots in the tree`);
    }

    included.forEach((root, i) => {
      const dir = folderOf(includes[i]?.file ?? '');
      root.children = (root.children ?? []).filter((node) => !(node.type === 'heading' && node.depth === 1));
      each(root, (node) => {
        if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
          node.url = siteHref(node.url, dir);
        }
        if (node.type === 'html') node.type = 'text';
      });
    });

    /* a file included by headings is included whole, heading by heading, in order */
    const byFile = new Map<string, (string | null)[]>();
    for (const include of includes) byFile.set(include.file, [...(byFile.get(include.file) ?? []), include.section]);
    for (const [repoFile, sections] of byFile) {
      if (sections.length === 1 && sections[0] === null) continue;
      const parser = markdownParser(file);
      if (!parser) throw new Error(`${file.path}: no Markdown parser on the file to check the headings of ${repoFile}`);
      const ids = headingIdsOf(resolve(file.cwd, repoFile), parser);
      if (sections.join('\n') !== ids.join('\n')) {
        throw new Error(
          `${file.path} includes ${repoFile} by headings, so it must include every heading of the file once, in order.\n` +
            `  the page: ${sections.map((section) => section ?? '(the whole file)').join(', ')}\n` +
            `  the file: ${ids.join(', ')}`
        );
      }
    }
  };
}
