/* The press reads the blog's MDX into blocks the reader lays out: text on
   the left, every picture, carousel and loop as a figure on the right.
   remark-mdx parses the MDX and remark-gfm the notes ([^1] in the text, [^1]:
   at the foot); the syntax tree is then mapped to blocks, the few known
   components each to its own kind. Notes and small pictures (<Side>) are for
   the book look's margin. The frontmatter is read as YAML. Pure, so the
   server page and a test can both run it. */

import type { List, PhrasingContent, RootContent } from 'mdast';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { parse as parseYaml } from 'yaml';

import { plain } from './plain';

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; c: Inline[] }
  | { t: 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; c: Inline[] }
  /** A note's number in the text, [^1]; the note itself is a 'footnote' block. */
  | { t: 'fn'; n: string }
  /** A line break inside a paragraph: a line that ends in a backslash, as Markdown writes one. */
  | { t: 'br' };

/** width and height, when the MDX gives them, let the page hold the picture's place before it loads. */
export type Frame = {
  src: string;
  alt: string;
  video?: string;
  width?: number;
  height?: number;
};

export type Figure = {
  /** From the file name or the carousel label: 'E5-localized', 'ui-primitives'. */
  id: string;
  /** The carousel's label, when the figure had one. */
  label: string | null;
  frames: Frame[];
  /** <Picture>'s own caption and the source it credits, under a line of three hyphens. */
  caption?: Inline[];
  credit?: Inline[];
};

export type Rule = { ok: boolean; inline: Inline[] };

export type Block =
  | { kind: 'heading'; id: string; text: string }
  | { kind: 'para'; inline: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'rules'; items: Rule[] }
  /** Any other component's paragraphs, with the component's name: 'Epigraph', 'Sources'. */
  | { kind: 'note'; paras: Inline[][]; name: string }
  | { kind: 'figure'; figure: Figure }
  /** [^1]: the note, wherever the MDX puts it; the book look sets it in the margin beside its number. */
  | { kind: 'footnote'; n: string; inline: Inline[] }
  /** <Side src alt>caption --- source</Side>: a small picture the book look sets in the margin. */
  | { kind: 'side'; frame: Frame; caption: Inline[]; credit: Inline[] };

export type Frontmatter = Record<string, string | string[]>;

/** A value YAML reads: a scalar, a list or a map. */
type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

/** Components a story uses that draw a fixed figure, each set in the text as that figure's picture. */
const DRAWN: Record<string, { src: string; alt: string; caption: string }> = {
  FumadocsArchitecture: {
    src: '/atlas/fumadocs-architecture.png',
    alt: 'The Fumadocs architecture: a content layer, fumadocs-core, the UI layer, the React frameworks it runs on, and its dev tooling',
    caption: 'Fumadocs layer by layer: content sources feed `fumadocs-core`, which the UI layer and every React framework build on.',
  },
};

/** A story's body is MDX; a title or a caption written in this file is Markdown. */
const mdx = remark().use(remarkMdx).use(remarkGfm);
const md = remark().use(remarkGfm);

/** A JSX element, written on lines of its own (flow) or inside a paragraph (text). */
type Jsx = Extract<RootContent, { type: 'mdxJsxFlowElement' | 'mdxJsxTextElement' }>;

/** Splits the YAML head from the body: each key a string, or a list of strings. */
export function splitFrontmatter(source: string): {
  data: Frontmatter;
  body: string;
} {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n/.exec(source);
  if (!match) return { data: {}, body: source };
  const head: YamlValue = parseYaml(match[1] ?? '');
  const data: Frontmatter = {};
  if (head && typeof head === 'object' && !Array.isArray(head)) {
    for (const [key, value] of Object.entries(head)) {
      if (Array.isArray(value)) data[key] = value.map((item) => String(item));
      else if (value !== null && value !== undefined) data[key] = String(value);
    }
  }
  return { data, body: source.slice(match[0].length) };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 'designing-docs-E5-localized.webp?v=1' -> 'E5-localized' */
function figureId(src: string): string {
  const file = src.split('?')[0]?.split('/').pop() ?? src;
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/^[a-z]+(?:-[a-z]+)*?-(?=[A-Z]\d)/, '');
}

/** An attribute written as a string, src="/a.png"; an expression, style={{ ... }}, is not read. */
function attr(node: Jsx, name: string): string | null {
  for (const a of node.attributes) if (a.type === 'mdxJsxAttribute' && a.name === name) return typeof a.value === 'string' ? a.value : null;
  return null;
}

type MakeFrame = (src: string, alt: string, node?: Jsx) => Frame;

/** A frame for a picture, with its video when `media` names one and its size when the element gives it. */
function framer(media: (src: string) => string | undefined): MakeFrame {
  return (src, alt, node) => {
    const width = Number(node && attr(node, 'width')) || undefined;
    const height = Number(node && attr(node, 'height')) || undefined;
    return {
      src,
      alt,
      video: media(src),
      ...(width && height ? { width, height } : {}),
    };
  };
}

/** Appends inline nodes, running a text into the text before it. */
function push(out: Inline[], nodes: Inline[]): Inline[] {
  for (const node of nodes) {
    const last = out[out.length - 1];
    if (node.t === 'text' && last?.t === 'text') last.v += node.v;
    else if (node.t !== 'text' || node.v) out.push(node);
  }
  return out;
}

/** Bold, italics, code, links, note numbers and line breaks; a line that runs on reads as a space. */
function inline(nodes: readonly RootContent[]): Inline[] {
  const out: Inline[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        push(out, [{ t: 'text', v: node.value.replace(/[ \t]*\n[ \t]*/g, ' ') }]);
        break;
      case 'html':
        push(out, [{ t: 'text', v: node.value }]);
        break;
      case 'strong':
        out.push({ t: 'strong', c: inline(node.children) });
        break;
      case 'emphasis':
        out.push({ t: 'em', c: inline(node.children) });
        break;
      case 'inlineCode':
        out.push({ t: 'code', v: node.value });
        break;
      case 'link':
        out.push({ t: 'link', href: node.url, c: inline(node.children) });
        break;
      case 'footnoteReference':
        out.push({ t: 'fn', n: node.label ?? node.identifier });
        break;
      case 'break':
        out.push({ t: 'br' });
        break;
      // struck text and a component inside a line keep their words
      case 'delete':
      case 'mdxJsxTextElement':
        push(out, inline(node.children));
        break;
      default:
        break;
    }
  }
  return out;
}

/** Paragraphs and headings run together as one line of text, a space between them. */
function joined(nodes: readonly RootContent[]): Inline[] {
  const out: Inline[] = [];
  for (const node of nodes) {
    if (node.type !== 'paragraph' && node.type !== 'heading') continue;
    if (out.length) push(out, [{ t: 'text', v: ' ' }]);
    push(out, inline(node.children));
  }
  return out;
}

/**
 * A picture's text: its caption, then the source it credits after a line of
 * three hyphens. Straight under the caption that line makes the caption a
 * Markdown heading, which is read as the caption all the same.
 */
function captioned(children: readonly RootContent[]): {
  caption: Inline[];
  credit: Inline[];
} {
  const rule = children.findIndex((n) => n.type === 'thematicBreak' || (n.type === 'heading' && n.depth === 2));
  if (rule === -1) return { caption: joined(children), credit: [] };
  const end = children[rule]?.type === 'heading' ? rule + 1 : rule;
  return {
    caption: joined(children.slice(0, end)),
    credit: joined(children.slice(rule + 1)),
  };
}

const isBlank = (node: PhrasingContent) => node.type === 'text' && !node.value.trim();

const isRule = (node: PhrasingContent) => node.type === 'mdxJsxTextElement' && (node.name === 'Check' || node.name === 'X');

/** <Check /> and <X /> rules, each to the next one: a paragraph that opens with one is a set of rules. */
function readRules(children: readonly PhrasingContent[]): Rule[] {
  const items: Rule[] = [];
  let at = -1;
  const close = (end: number) => {
    const mark = children[at];
    if (!mark || mark.type !== 'mdxJsxTextElement') return;
    const words = inline(children.slice(at + 1, end));
    const first = words[0];
    const last = words[words.length - 1];
    if (first?.t === 'text') first.v = first.v.trimStart();
    if (last?.t === 'text') last.v = last.v.trimEnd();
    items.push({
      ok: mark.name === 'Check',
      inline: words.filter((w) => w.t !== 'text' || w.v),
    });
  };
  children.forEach((node, i) => {
    if (!isRule(node)) return;
    close(i);
    at = i;
  });
  close(children.length);
  return items;
}

/** A list's items, one a paragraph; a list inside an item adds its items after it. */
function listItems(list: List): Inline[][] {
  return list.children.flatMap((item) =>
    item.children.flatMap((child) => (child.type === 'paragraph' ? [inline(child.children)] : child.type === 'list' ? listItems(child) : [])),
  );
}

/** The elements of one name among these nodes, wherever they sit inside them. */
function descendants(nodes: readonly RootContent[], name: string): Jsx[] {
  return nodes.flatMap((node) => {
    if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === name) return [node];
    return 'children' in node ? descendants(node.children, name) : [];
  });
}

type Reader = {
  frame: MakeFrame;
  /** Headings read so far, for the id of one whose text slugs to nothing. */
  headings: number;
};

/** A component: a side picture or a picture with its caption, a carousel, a drawn figure, or a box of text. */
function component(node: Jsx, children: readonly RootContent[], reader: Reader): Block[] {
  const name = node.name ?? '';
  const { frame } = reader;
  const own = frame(attr(node, 'src') ?? '', attr(node, 'alt') ?? '', node);
  if (name === 'Side' || name === 'Picture') {
    const { caption, credit } = captioned(children);
    if (name === 'Side') return [{ kind: 'side', frame: own, caption, credit }];
    const figure: Figure = {
      id: figureId(own.src),
      label: null,
      frames: [own],
    };
    return [
      {
        kind: 'figure',
        figure: children.length ? { ...figure, caption, credit } : figure,
      },
    ];
  }
  if (name === 'Carousel') {
    const frames = descendants(node.children, 'CarouselItem').map((item) => frame(attr(item, 'src') ?? '', attr(item, 'alt') ?? '', item));
    const label = attr(node, 'label');
    return [
      {
        kind: 'figure',
        figure: {
          id: slugify(label ?? frames[0]?.src ?? 'carousel'),
          label,
          frames,
        },
      },
    ];
  }
  const drawn = DRAWN[name];
  if (drawn)
    return [
      {
        kind: 'figure',
        figure: {
          id: figureId(drawn.src),
          label: null,
          frames: [frame(drawn.src, drawn.alt, node)],
          caption: parseInline(drawn.caption),
        },
      },
    ];
  const body = read(children, reader);
  const paras = body.filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para').map((b) => b.inline);
  // a box of paragraphs is a note; one that also holds a list, a set of rules (a style guide's callout) or a box
  // of its own keeps every part, in order, in the text, so nothing in it is lost
  if (name === 'Epigraph' || name === 'Sources' || body.every((b) => b.kind === 'para')) return paras.length ? [{ kind: 'note', paras, name }] : [];
  return body.filter((b) => b.kind === 'para' || b.kind === 'list' || b.kind === 'rules' || b.kind === 'note');
}

/** A paragraph: a picture alone, a set of rules, a component written on one line, or text. */
function paragraph(children: readonly PhrasingContent[], reader: Reader): Block[] {
  const content = children.filter((n) => !isBlank(n));
  const only = content.length === 1 ? content[0] : undefined;
  if (only?.type === 'image')
    return [
      {
        kind: 'figure',
        figure: {
          id: figureId(only.url),
          label: null,
          frames: [reader.frame(only.url, only.alt ?? '')],
        },
      },
    ];
  // <Callout>Important note.</Callout> on a line of its own is the component, with its words as its paragraph
  if (only?.type === 'mdxJsxTextElement' && !isRule(only))
    return component(only, only.children.length ? [{ type: 'paragraph', children: only.children }] : [], reader);
  if (content[0] && isRule(content[0])) return [{ kind: 'rules', items: readRules(content) }];
  const words = inline(children);
  return words.length ? [{ kind: 'para', inline: words }] : [];
}

/** Maps the tree's blocks, in order; imports, exports and expressions are code, not text, and are left out. */
function read(nodes: readonly RootContent[], reader: Reader): Block[] {
  const blocks: Block[] = [];
  for (const node of nodes) {
    const prev = blocks[blocks.length - 1];
    switch (node.type) {
      case 'heading': {
        const text = plain(inline(node.children));
        reader.headings += 1;
        // a heading in another script slugs to nothing, so it takes its place in the order
        blocks.push({
          kind: 'heading',
          id: slugify(text) || `section-${reader.headings}`,
          text,
        });
        break;
      }
      case 'paragraph': {
        const found = paragraph(node.children, reader);
        // rules a blank line apart are one set
        if (found[0]?.kind === 'rules' && prev?.kind === 'rules') prev.items.push(...found[0].items);
        else blocks.push(...found);
        break;
      }
      case 'list':
        blocks.push({
          kind: 'list',
          ordered: node.ordered ?? false,
          items: listItems(node),
        });
        break;
      case 'footnoteDefinition':
        blocks.push({
          kind: 'footnote',
          n: node.label ?? node.identifier,
          inline: joined(node.children),
        });
        break;
      case 'blockquote':
        blocks.push(...read(node.children, reader));
        break;
      case 'code':
        blocks.push({ kind: 'para', inline: [{ t: 'code', v: node.value }] });
        break;
      case 'mdxJsxFlowElement':
        blocks.push(...component(node, node.children, reader));
        break;
      default:
        break;
    }
  }
  return blocks;
}

/** Reads the body into blocks. `media(src)` may name a video to play in place of a GIF. */
export function parseBody(body: string, media: (src: string) => string | undefined = () => undefined): Block[] {
  const root = mdx.parse(body);
  return read(root.children, { frame: framer(media), headings: 0 });
}

/** A line of Markdown, a title or a caption, as inline text. */
export function parseInline(source: string): Inline[] {
  return joined(md.parse(source).children);
}

/** A heading that opens a story's list of sources: everything under it, to the next heading, is not read. */
const SOURCES = /^(sources|references|bibliography|works cited)$/i;

/** The words a reader reads, for the reading time: the text and its notes, never the sources or a <Sources> block. */
export function wordCount(blocks: Block[]): number {
  let inSources = false;
  const text = blocks
    .map((b) => {
      // the notes sit at the foot of the MDX, after the sources, and are read all the same
      if (b.kind === 'footnote') return plain(b.inline);
      if (b.kind === 'heading') {
        inSources = SOURCES.test(b.text.trim());
        return inSources ? '' : b.text;
      }
      if (inSources) return '';
      return b.kind === 'para'
        ? plain(b.inline)
        : b.kind === 'list'
          ? b.items.map(plain).join(' ')
          : b.kind === 'rules'
            ? b.items.map((r) => plain(r.inline)).join(' ')
            : b.kind === 'note' && !SOURCES.test(b.name)
              ? b.paras.map(plain).join(' ')
              : '';
    })
    .join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}
