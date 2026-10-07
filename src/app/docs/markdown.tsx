import Link from 'next/link';
import type { ReactNode } from 'react';

import { gtText } from '@/components/viewer/GtWord';
import { pad2 } from '@/lib/shell-data';

import { siteHref } from './links';

/**
 * The docs' own markdown renderer: the small subset the repo documents use
 * (headings, paragraphs, lists, tables, fenced code, inline code, bold,
 * links, rules), parsed into blocks and rendered into the docs grammar with
 * no parser dependency. Headings carry ids (lowercase, spaces to hyphens,
 * punctuation stripped, unique within a document); lists render as ruled
 * rows; fenced code sits on the panel; tables keep border-collapse. The
 * book builder splits a parsed document at its h2 headings into numbered
 * rows, so every consumer shares one parse and one id scheme. Plain text
 * passes through gtText, so the standalone word GT renders as the mark
 * (GtWord.tsx); code spans and fenced code stay text, link hrefs are
 * untouched, and heading ids derive from plainText, so they keep the
 * letters.
 */

/* ---- inline: `code`, **bold**, [text](href) ---- */

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

/** A site path whose last segment carries a file extension, `/skills/gt-brand/references/type.md`. */
const RAW_FILE = /^\/(?:[^?#]*\/)?[^/?#]+\.[a-z0-9]+(?:[?#].*)?$/i;

/** The text of a heading or cell with its inline markup removed. */
export function plainText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .trim();
}

/**
 * The anchor for a heading: lowercase, spaces to hyphens, punctuation
 * stripped. `1. The name` becomes `1-the-name`, the same anchor GitHub
 * gives the heading.
 */
export function headingId(text: string): string {
  return plainText(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * How a caller renders a document. `text` renders the plain text between
 * the inline tokens: the default is gtText; the /motion packages pass a
 * hook that also sets single-star emphasis and gives each run of another
 * script its lang and dir (src/app/motion/lang-text.tsx). Code spans and
 * hrefs never reach it. `dir` is the repository folder the document sits
 * in (`docs/handbook`; the root when left out), so a relative link resolves
 * the way GitHub resolves it (links.ts, siteHref): a rendered document
 * opens its route, a skill its page, any other file GitHub.
 */
export type RenderOptions = { text?: (text: string, key: string) => ReactNode; dir?: string };

export function renderInline(text: string, keyBase: string, opts?: RenderOptions): ReactNode[] {
  const out: ReactNode[] = [];
  const parts = text.split(INLINE);
  parts.forEach((part, i) => {
    const key = `${keyBase}-${i}`;
    if (!part) return;
    if (part.startsWith('`') && part.endsWith('`')) {
      out.push(<code key={key}>{part.slice(1, -1)}</code>);
      return;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(<strong key={key}>{renderInline(part.slice(2, -2), key, opts)}</strong>);
      return;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link?.[1] && link[2]) {
      const href = siteHref(link[2], opts?.dir);
      /* a book route or an anchor: a plain link the docs book intercepts
         and answers in place, so the shell never remounts; a file the
         site serves as it is (a skill's raw SKILL.md or reference) has no
         page for the router to fetch, so it is a plain link too */
      if (href.startsWith('/docs') || href.startsWith('/handbook') || href.startsWith('#') || RAW_FILE.test(href)) {
        out.push(
          <a href={href} key={key}>
            {renderInline(link[1], key, opts)}
          </a>
        );
        return;
      }
      out.push(
        href.startsWith('/') ? (
          <Link href={href} key={key}>
            {renderInline(link[1], key, opts)}
          </Link>
        ) : (
          <a href={href} key={key} rel='noreferrer' target='_blank'>
            {renderInline(link[1], key, opts)}
          </a>
        )
      );
      return;
    }
    /* plain text: the standalone word GT becomes the mark; a run with none
       comes back as the string it was. A caller's hook replaces this. */
    out.push(opts?.text ? opts.text(part, key) : gtText(part, key));
  });
  return out;
}

/* ---- blocks ---- */

export type HeadingLevel = 1 | 2 | 3;

export type HeadingBlock = { kind: 'heading'; level: HeadingLevel; text: string; id: string };

export type Block =
  | HeadingBlock
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  /** `start`: the number of the first item, when it is not 1. parseBlocks never sets it; a caller that splits one numbered run into several lists does (the /motion fact-check groups) */
  | { kind: 'ol'; items: string[]; start?: number }
  | { kind: 'code'; lines: string[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'hr' };

/** Ids unique within one document: a repeated heading gets `-2`, `-3`. */
function uniqueId(base: string, taken: Set<string>): string {
  let id = base || 'section';
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  taken.add(id);
  return id;
}

export function parseBlocks(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  const ids = new Set<string>();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        code.push(lines[i] ?? '');
        i += 1;
      }
      i += 1;
      blocks.push({ kind: 'code', lines: code });
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push({ kind: 'hr' });
      i += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading?.[1] && heading[2] !== undefined) {
      const text = heading[2].trim();
      blocks.push({
        kind: 'heading',
        level: heading[1].length as HeadingLevel,
        text,
        id: uniqueId(headingId(text), ids),
      });
      i += 1;
      continue;
    }
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        tableLines.push(lines[i] ?? '');
        i += 1;
      }
      const cells = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|\s*$/, '')
          .split('|')
          .map((c) => c.trim());
      const header = cells(tableLines[0] ?? '');
      const rows = tableLines
        .slice(1)
        .filter((row) => !/^[\s|:-]+$/.test(row))
        .map(cells);
      blocks.push({ kind: 'table', header, rows });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i] ?? '') || /^\s{2,}\S/.test(lines[i] ?? ''))) {
        const cur = lines[i] ?? '';
        if (/^[-*]\s+/.test(cur)) items.push(cur.replace(/^[-*]\s+/, ''));
        else items[items.length - 1] = `${items[items.length - 1]} ${cur.trim()}`;
        i += 1;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\d+\.\s+/.test(lines[i] ?? '') || /^\s{2,}\S/.test(lines[i] ?? ''))) {
        const cur = lines[i] ?? '';
        if (/^\d+\.\s+/.test(cur)) items.push(cur.replace(/^\d+\.\s+/, ''));
        else items[items.length - 1] = `${items[items.length - 1]} ${cur.trim()}`;
        i += 1;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }
    /* paragraph: accumulate until a blank line or a block opener */
    const para: string[] = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !/^(#{1,3}\s|```|\||[-*]\s|\d+\.\s|---+$)/.test(lines[i] ?? '')
    ) {
      para.push((lines[i] ?? '').trim());
      i += 1;
    }
    blocks.push({ kind: 'p', text: para.join(' ') });
  }
  return blocks;
}

/* ---- the document split: the h1, the lead, and one row per h2 ---- */

export type DocRow = {
  id: string;
  /** the padded number in the gutter: the heading's own when it has one, its position otherwise */
  n: string;
  /** the heading text without its leading number and inline markup */
  title: string;
  /** the heading (retitled) and every block up to the next h2 */
  blocks: Block[];
};

export type DocSplit = {
  /** the h1 text, when the document opens with one */
  title: string | null;
  /** everything before the first h2, the h1 aside */
  lead: Block[];
  rows: DocRow[];
};

const NUMBERED = /^(\d+)\.\s+(.*)$/;

export function splitDoc(blocks: Block[]): DocSplit {
  let title: string | null = null;
  const lead: Block[] = [];
  const rows: DocRow[] = [];
  let current: DocRow | null = null;
  for (const block of blocks) {
    if (block.kind === 'heading' && block.level === 1 && title === null && rows.length === 0) {
      title = plainText(block.text);
      continue;
    }
    if (block.kind === 'heading' && block.level === 2) {
      const numbered = NUMBERED.exec(block.text);
      const text = numbered?.[2] ?? block.text;
      const n = numbered?.[1] !== undefined ? pad2(Number(numbered[1])) : pad2(rows.length + 1);
      current = { id: block.id, n, title: plainText(text), blocks: [{ ...block, text }] };
      rows.push(current);
      continue;
    }
    if (current) current.blocks.push(block);
    else lead.push(block);
  }
  return { title, lead, rows };
}

/* ---- render ---- */

function Heading({ block, children }: { block: HeadingBlock; children: ReactNode }) {
  if (block.level === 1) return <h1 id={block.id}>{children}</h1>;
  if (block.level === 2) return <h2 id={block.id}>{children}</h2>;
  return <h3 id={block.id}>{children}</h3>;
}

/**
 * Blocks to elements, keyed under keyBase so several renders can share a
 * parent. `opts` reaches every inline render (RenderOptions); without it
 * the output is the docs' own.
 */
export function renderBlocks(blocks: readonly Block[], keyBase = 'b', opts?: RenderOptions): ReactNode[] {
  return blocks.map((block, i) => {
    const key = `${keyBase}-${i}`;
    switch (block.kind) {
      case 'heading':
        return (
          <Heading block={block} key={key}>
            {renderInline(block.text, key, opts)}
          </Heading>
        );
      case 'p':
        return <p key={key}>{renderInline(block.text, key, opts)}</p>;
      case 'ul':
        return (
          <ul className='ptd-list' key={key}>
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`, opts)}</li>
            ))}
          </ul>
        );
      case 'ol':
        /* the CSS counter starts one below a given start, so the rows read on from the list before */
        return (
          <ol
            className='ptd-list is-ordered'
            key={key}
            start={block.start}
            style={block.start ? { counterReset: `ptd-item ${block.start - 1}` } : undefined}
          >
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>
                <span>{renderInline(item, `${key}-${j}`, opts)}</span>
              </li>
            ))}
          </ol>
        );
      case 'code':
        return (
          <pre className='ptd-code' key={key}>
            <code>{block.lines.join('\n')}</code>
          </pre>
        );
      case 'table':
        return (
          <div className='ptd-table-wrap' key={key}>
            <table className='ptd-table'>
              <thead>
                <tr>
                  {block.header.map((cell, j) => (
                    <th key={`${key}-h${j}`}>{renderInline(cell, `${key}-h${j}`, opts)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={`${key}-r${r}`}>
                    {row.map((cell, c) => (
                      <td key={`${key}-r${r}c${c}`}>{renderInline(cell, `${key}-r${r}c${c}`, opts)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'hr':
        return <hr className='ptd-hr' key={key} />;
      default:
        return null;
    }
  });
}
