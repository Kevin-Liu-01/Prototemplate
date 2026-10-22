/* The press reads the blog's MDX as plain Markdown with a few known
   components, and turns it into blocks the reader lays out: text on the
   left, every picture, carousel and loop as a figure on the right. Notes
   ([^1] in the text, [^1]: at the foot) and small pictures (<Side>) are for
   the book look's margin. Pure, so the server page and a test can both run
   it. */

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
export type Frame = { src: string; alt: string; video?: string; width?: number; height?: number };

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

/** Splits the YAML head from the body. Only flat keys and one-line arrays. */
export function splitFrontmatter(source: string): { data: Frontmatter; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n/.exec(source);
  if (!match) return { data: {}, body: source };
  const data: Frontmatter = {};
  for (const line of (match[1] ?? '').split('\n')) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key = '', raw = ''] = kv;
    if (raw.startsWith('[')) {
      data[key] = raw
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => unquote(item.trim()))
        .filter(Boolean);
    } else {
      data[key] = unquote(raw.trim());
    }
  }
  return { data, body: source.slice(match[0].length) };
}

function unquote(value: string): string {
  return value.replace(/^(['"])([\s\S]*)\1$/, '$2');
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

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`${name}=(['"])([\\s\\S]*?)\\1`).exec(tag);
  return match ? (match[2] ?? null) : null;
}

const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const LIST = /^(?:[-*]|\d+\.)\s+/;
const RULE = /^<(Check|X)\b[^>]*\/>\s*(.*)$/;
const FOOTNOTE = /^\[\^(\d+)\]:\s*(.*)$/;

/** A picture's text: its caption, then the source it credits after a line of three hyphens. */
function captioned(inner: string[]): { caption: Inline[]; credit: Inline[] } {
  const lines = inner.map((l) => l.trim());
  const rule = lines.indexOf('---');
  const flat = (part: string[]) => parseInline(part.filter(Boolean).join(' '));
  return rule === -1 ? { caption: flat(lines), credit: [] } : { caption: flat(lines.slice(0, rule)), credit: flat(lines.slice(rule + 1)) };
}

/** Reads the body into blocks. `media(src)` may name a video to play in place of a GIF. */
export function parseBody(body: string, media: (src: string) => string | undefined = () => undefined): Block[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  let headingCount = 0;

  const frame = (src: string, alt: string, tag = ''): Frame => {
    const width = Number(attr(tag, 'width')) || undefined;
    const height = Number(attr(tag, 'height')) || undefined;
    return { src, alt, video: media(src), ...(width && height ? { width, height } : {}) };
  };

  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (!line) {
      i++;
      continue;
    }

    const footnote = FOOTNOTE.exec(line);
    if (footnote) {
      blocks.push({ kind: 'footnote', n: footnote[1] ?? '', inline: parseInline(footnote[2] ?? '') });
      i++;
      continue;
    }

    const heading = /^#{2,4}\s+(.*)$/.exec(line);
    if (heading) {
      const text = plain(parseInline(heading[1] ?? ''));
      headingCount += 1;
      // a heading in another script slugs to nothing, so it takes its place in the order
      blocks.push({ kind: 'heading', id: slugify(text) || `section-${headingCount}`, text });
      i++;
      continue;
    }

    const image = IMAGE.exec(line);
    if (image) {
      const [, alt = '', src = ''] = image;
      blocks.push({ kind: 'figure', figure: { id: figureId(src), label: null, frames: [frame(src, alt)] } });
      i++;
      continue;
    }

    const rule = RULE.exec(line);
    if (rule) {
      const items: Rule[] = [];
      while (i < lines.length) {
        const next = (lines[i] ?? '').trim();
        if (!next) {
          i++;
          continue;
        }
        const m = RULE.exec(next);
        if (!m) break;
        items.push({ ok: m[1] === 'Check', inline: parseInline(m[2] ?? '') });
        i++;
      }
      blocks.push({ kind: 'rules', items });
      continue;
    }

    const component = /^<([A-Z][A-Za-z]*)/.exec(line);
    if (component) {
      const name = component[1] ?? '';
      // the opening tag may run over several lines (style={{ ... }})
      let tag = line;
      while (!/\/>\s*$/.test(tag) && !/(^|[^=])>\s*$/.test(tag) && i + 1 < lines.length) {
        i++;
        tag += `\n${(lines[i] ?? '').trim()}`;
      }
      i++;
      const own = frame(attr(tag, 'src') ?? '', attr(tag, 'alt') ?? '', tag);
      if (/\/>\s*$/.test(tag)) {
        if (name === 'Side') blocks.push({ kind: 'side', frame: own, caption: [], credit: [] });
        if (name === 'Picture') blocks.push({ kind: 'figure', figure: { id: figureId(own.src), label: null, frames: [own] } });
        continue;
      }
      const inner: string[] = [];
      while (i < lines.length && !(lines[i] ?? '').includes(`</${name}>`)) {
        inner.push(lines[i] ?? '');
        i++;
      }
      i++;
      if (name === 'Side' || name === 'Picture') {
        const { caption, credit } = captioned(inner);
        if (name === 'Side') blocks.push({ kind: 'side', frame: own, caption, credit });
        else blocks.push({ kind: 'figure', figure: { id: figureId(own.src), label: null, frames: [own], caption, credit } });
      } else if (name === 'Carousel') {
        const items = inner.join('\n').match(/<CarouselItem[\s\S]*?\/>/g) ?? [];
        const frames = items.map((item) => frame(attr(item, 'src') ?? '', attr(item, 'alt') ?? '', item));
        const label = attr(tag, 'label');
        blocks.push({ kind: 'figure', figure: { id: slugify(label ?? frames[0]?.src ?? 'carousel'), label, frames } });
      } else {
        const paras = parseBody(inner.join('\n'), media)
          .filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para')
          .map((b) => b.inline);
        if (paras.length) blocks.push({ kind: 'note', paras, name });
      }
      continue;
    }

    if (LIST.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: Inline[][] = [];
      while (i < lines.length && LIST.test((lines[i] ?? '').trim())) {
        items.push(parseInline((lines[i] ?? '').trim().replace(LIST, '')));
        i++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const next = (lines[i] ?? '').trim();
      if (!next || /^#{2,4}\s/.test(next) || IMAGE.test(next) || /^<[A-Z]/.test(next) || LIST.test(next) || FOOTNOTE.test(next)) break;
      para.push(next);
      i++;
    }
    // a line ending in a backslash breaks there; the others run on
    const joined = para.map((line, k) => (k === para.length - 1 ? line : line.endsWith('\\') ? `${line.slice(0, -1).trimEnd()}\n` : `${line} `)).join('');
    blocks.push({ kind: 'para', inline: parseInline(joined) });
  }
  return blocks;
}

/** Bold, italics, code, links, note numbers and line breaks; anything else is text. */
export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  let text = '';
  const flush = () => {
    if (text) out.push({ t: 'text', v: text });
    text = '';
  };
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    const note = /^\[\^(\d+)\]/.exec(rest);
    if (note) {
      flush();
      out.push({ t: 'fn', n: note[1] ?? '' });
      i += note[0].length;
      continue;
    }
    const strong = /^\*\*([\s\S]+?)\*\*/.exec(rest);
    if (strong) {
      flush();
      out.push({ t: 'strong', c: parseInline(strong[1] ?? '') });
      i += strong[0].length;
      continue;
    }
    const em = /^([*_])(?=\S)([\s\S]+?)\1(?![A-Za-z0-9])/.exec(rest);
    if (em && (i === 0 || !/[A-Za-z0-9]/.test(source[i - 1] ?? ''))) {
      flush();
      out.push({ t: 'em', c: parseInline(em[2] ?? '') });
      i += em[0].length;
      continue;
    }
    const code = /^`([^`]+)`/.exec(rest);
    if (code) {
      flush();
      out.push({ t: 'code', v: code[1] ?? '' });
      i += code[0].length;
      continue;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest);
    if (link) {
      flush();
      out.push({ t: 'link', href: link[2] ?? '', c: parseInline(link[1] ?? '') });
      i += link[0].length;
      continue;
    }
    if (source[i] === '\n') {
      flush();
      out.push({ t: 'br' });
      i++;
      continue;
    }
    text += source[i];
    i++;
  }
  flush();
  return out;
}

export function plain(inline: Inline[]): string {
  return inline.map((node) => (node.t === 'text' || node.t === 'code' ? node.v : node.t === 'fn' ? '' : node.t === 'br' ? ' ' : plain(node.c))).join('');
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
