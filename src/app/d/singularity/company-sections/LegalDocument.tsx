import type { ReactNode } from 'react';

import LegalDocumentAside from './LegalDocumentAside';
import type { LegalBlock, LegalDoc } from './legal-docs';

/**
 * A legal document: the sticky title-and-contents column beside the prose,
 * the split the live page runs (a `<header>` aside plus the MDX body). There
 * is no MDX pipeline here — the vendored documents in ./legal-docs.ts are a
 * typed block tree, and this renders it.
 */

/* The three inline marks the source Markdown actually uses. Anything else in
   the text is literal. */
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

function inline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > cursor) out.push(text.slice(cursor, at));

    if (match[1] !== undefined) {
      out.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      out.push(<code key={key++}>{match[2]}</code>);
    } else {
      out.push(
        <a href={match[4]} key={key++} rel='noreferrer' target='_blank'>
          {match[3]}
        </a>
      );
    }
    cursor = at + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === 'p') return <p>{inline(block.text)}</p>;
  if (block.kind === 'h3') return <h3>{block.text}</h3>;

  if (block.kind === 'list') {
    const items = block.items.map((item, index) => (
      <li key={index}>
        {inline(item.text)}
        {item.sub ? (
          <ol className='cpg-sublist'>
            {item.sub.map((sub, subIndex) => (
              <li key={subIndex}>{inline(sub)}</li>
            ))}
          </ol>
        ) : null}
      </li>
    ));
    return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
  }

  return (
    <div className='cpg-tablewrap'>
      <table>
        <thead>
          <tr>
            {block.head.map((cell) => (
              <th key={cell}>{inline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{inline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className='tc-sec cpg-doc'>
      <LegalDocumentAside doc={doc} key={doc.route} />

      <div className='cpg-doc-body'>
        {doc.preamble.map((block, index) => (
          <Block block={block} key={index} />
        ))}

        {doc.sections.map((section) => (
          <section key={section.id}>
            <h2 id={section.id}>{section.heading}</h2>
            {section.blocks.map((block, index) => (
              <Block block={block} key={index} />
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
