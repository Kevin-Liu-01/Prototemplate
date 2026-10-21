/* The press reads the blog's MDX as plain Markdown with a few known
   components, and turns it into blocks the reader lays out: text on the
   left, every picture, carousel and loop as a figure on the right. Pure, so
   the server page and a test can both run it. */

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; c: Inline[] }
  | { t: 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; c: Inline[] };

export type Frame = { src: string; alt: string; video?: string };

export type Figure = {
  /** From the file name or the carousel label: 'E5-localized', 'ui-primitives'. */
  id: string;
  /** The carousel's label, when the figure had one. */
  label: string | null;
  frames: Frame[];
};

export type Rule = { ok: boolean; inline: Inline[] };

export type Block =
  | { kind: 'heading'; id: string; text: string }
  | { kind: 'para'; inline: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'rules'; items: Rule[] }
  | { kind: 'note'; paras: Inline[][] }
  | { kind: 'figure'; figure: Figure };

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

/** Reads the body into blocks. `media(src)` may name a video to play in place of a GIF. */
export function parseBody(body: string, media: (src: string) => string | undefined = () => undefined): Block[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  let headingCount = 0;

  const frame = (src: string, alt: string): Frame => ({ src, alt, video: media(src) });

  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (!line) {
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
      if (/\/>\s*$/.test(tag)) continue;
      const inner: string[] = [];
      while (i < lines.length && !(lines[i] ?? '').includes(`</${name}>`)) {
        inner.push(lines[i] ?? '');
        i++;
      }
      i++;
      if (name === 'Carousel') {
        const items = inner.join('\n').match(/<CarouselItem[\s\S]*?\/>/g) ?? [];
        const frames = items.map((item) => frame(attr(item, 'src') ?? '', attr(item, 'alt') ?? ''));
        const label = attr(tag, 'label');
        blocks.push({ kind: 'figure', figure: { id: slugify(label ?? frames[0]?.src ?? 'carousel'), label, frames } });
      } else {
        const paras = parseBody(inner.join('\n'), media)
          .filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para')
          .map((b) => b.inline);
        if (paras.length) blocks.push({ kind: 'note', paras });
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
      if (!next || /^#{2,4}\s/.test(next) || IMAGE.test(next) || /^<[A-Z]/.test(next) || LIST.test(next)) break;
      para.push(next);
      i++;
    }
    blocks.push({ kind: 'para', inline: parseInline(para.join(' ')) });
  }
  return blocks;
}

/** Bold, italics, code and links; anything else is text. */
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
    text += source[i];
    i++;
  }
  flush();
  return out;
}

export function plain(inline: Inline[]): string {
  return inline.map((node) => (node.t === 'text' || node.t === 'code' ? node.v : plain(node.c))).join('');
}

export function wordCount(blocks: Block[]): number {
  const text = blocks
    .map((b) =>
      b.kind === 'para'
        ? plain(b.inline)
        : b.kind === 'list'
          ? b.items.map(plain).join(' ')
          : b.kind === 'rules'
            ? b.items.map((r) => plain(r.inline)).join(' ')
            : b.kind === 'note'
              ? b.paras.map(plain).join(' ')
              : b.kind === 'heading'
                ? b.text
                : ''
    )
    .join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}
