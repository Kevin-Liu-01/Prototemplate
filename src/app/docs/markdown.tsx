import Link from 'next/link';
import type { ReactNode } from 'react';

import { pad2 } from '@/lib/shell-data';

/**
 * The docs' own markdown renderer: the small subset the repo documents use
 * (headings, paragraphs, lists, tables, fenced code, inline code, bold,
 * links, rules), parsed into blocks and rendered into the docs grammar with
 * no parser dependency. Headings carry ids (lowercase, spaces to hyphens,
 * punctuation stripped, unique within a document); lists render as ruled
 * rows; fenced code sits on the panel; tables keep border-collapse. The
 * book builder splits a parsed document at its h2 headings into numbered
 * rows, so every consumer shares one parse and one id scheme.
 */

/* ---- inline: `code`, **bold**, [text](href) ---- */

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

/* doc-to-doc links resolve to their /docs routes */
const DOC_LINKS: Record<string, string> = {
  'README.md': '/docs',
  'BRAND.md': '/docs/brand',
  'DESIGN.md': '/docs/design',
  'ARCHITECTURE.md': '/docs/architecture',
  'docs/SHIP-LOOP.md': '/docs/ship-loop',
  'docs/LIBRARIES.md': '/docs/libraries',
};

function resolveHref(href: string): string {
  const clean = href.replace(/^\.\//, '');
  return DOC_LINKS[clean] ?? href;
}

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

function renderInline(text: string, keyBase: string): ReactNode[] {
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
      out.push(<strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>);
      return;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link?.[1] && link[2]) {
      const href = resolveHref(link[2]);
      /* a docs route or an anchor: a plain link the docs book intercepts
         and answers in place, so the shell never remounts */
      if (href.startsWith('/docs') || href.startsWith('#')) {
        out.push(
          <a href={href} key={key}>
            {renderInline(link[1], key)}
          </a>
        );
        return;
      }
      out.push(
        href.startsWith('/') ? (
          <Link href={href} key={key}>
            {renderInline(link[1], key)}
          </Link>
        ) : (
          <a href={href} key={key} rel='noreferrer' target='_blank'>
            {renderInline(link[1], key)}
          </a>
        )
      );
      return;
    }
    out.push(part);
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
  | { kind: 'ol'; items: string[] }
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

/** Blocks to elements, keyed under keyBase so several renders can share a parent. */
export function renderBlocks(blocks: readonly Block[], keyBase = 'b'): ReactNode[] {
  return blocks.map((block, i) => {
    const key = `${keyBase}-${i}`;
    switch (block.kind) {
      case 'heading':
        return (
          <Heading block={block} key={key}>
            {renderInline(block.text, key)}
          </Heading>
        );
      case 'p':
        return <p key={key}>{renderInline(block.text, key)}</p>;
      case 'ul':
        return (
          <ul className='ptd-list' key={key}>
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol className='ptd-list is-ordered' key={key}>
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>
                <span>{renderInline(item, `${key}-${j}`)}</span>
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
                    <th key={`${key}-h${j}`}>{renderInline(cell, `${key}-h${j}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={`${key}-r${r}`}>
                    {row.map((cell, c) => (
                      <td key={`${key}-r${r}c${c}`}>{renderInline(cell, `${key}-r${r}c${c}`)}</td>
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
