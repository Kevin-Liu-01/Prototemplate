import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The docs' own markdown renderer — the small subset the repo documents
 * actually use (headings, paragraphs, lists, tables, fenced code, inline
 * code/bold/links, rules), rendered into the pt grammar with no parser
 * dependency riding into the mirror. Anything fancier belongs on a real
 * page, not in a doc.
 */

/* ---- inline: `code`, **bold**, [text](href) ---- */

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

/* doc-to-doc links resolve to their /docs routes */
const DOC_LINKS: Record<string, string> = {
  'README.md': '/docs',
  'DESIGN.md': '/docs/design',
  'ARCHITECTURE.md': '/docs/architecture',
  'docs/SHIP-LOOP.md': '/docs/ship-loop',
  'docs/LIBRARIES.md': '/docs/libraries',
};

function resolveHref(href: string): string {
  const clean = href.replace(/^\.\//, '');
  return DOC_LINKS[clean] ?? href;
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
      const internal = href.startsWith('/') || href.startsWith('#');
      out.push(
        internal ? (
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

type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; lines: string[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'hr' };

function parseBlocks(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
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
      blocks.push({
        kind: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
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
        .filter((row) => !/^\|[\s:-]+\|/.test(row.replace(/\|/g, '|')))
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

export default function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.kind) {
          case 'heading': {
            if (block.level === 1) return <h1 key={key}>{renderInline(block.text, key)}</h1>;
            if (block.level === 2) return <h2 key={key}>{renderInline(block.text, key)}</h2>;
            return <h3 key={key}>{renderInline(block.text, key)}</h3>;
          }
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
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
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
      })}
    </>
  );
}
