'use client';

import { usePathname } from 'next/navigation';
import { Fragment, type ReactNode } from 'react';

import LegalDocumentAside from './LegalDocumentAside';
import {
  type LegalBlock,
  type LegalDoc,
  normalizeLegalHref,
} from './legal-docs';

/**
 * One legal document, in the live page's shape: the sticky
 * title-and-contents column beside the prose
 * (apps/landing/src/app/[locale]/(home)/legal/[route]/page.tsx — a `<header>`
 * aside plus the MDXRemote body inside one `<article>`).
 *
 * There is no MDX pipeline here. The vendored documents in ./legal-docs.ts are
 * a typed block tree, and the body below renders the DOM remark would have
 * produced from the same Markdown: headings and blocks FLAT as siblings (so
 * the ids the aside's Contents links at sit on real `<h2>`s in the document
 * flow), and every list item as a run of `<p>`s, because every list in the
 * library is loose.
 *
 * Client, not server: the cross-document links inside the prose have to
 * resolve against the concept the reader is in, the same way the ledger's rows
 * do.
 */

/**
 * The inline marks the source Markdown actually uses. Anything else in the
 * text is literal.
 *
 * The last alternative is remark-gfm's www autolink literal, which the live
 * page has enabled: the cookie policy names `www.generaltranslation.com` bare
 * and the shipped DOM carries it as `<a href="http://www.generaltranslation.com">`.
 * It is the library's only autolink — a bare domain without the `www.` prefix
 * (the privacy policy's parenthetical cookie-policy path) stays text there too.
 */
const INLINE =
  /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|<br\s*\/?>|(www\.[\w-]+(?:\.[\w-]+)+)/g;

/** True for a destination that leaves this site. */
function isExternal(href: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(href) && !href.startsWith('mailto:');
}

function inline(text: string, base: string): ReactNode {
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
    } else if (match[3] !== undefined) {
      const href = normalizeLegalHref(match[4], base);
      out.push(
        <a
          href={href}
          key={key++}
          rel={isExternal(href) ? 'noreferrer' : undefined}
          target={isExternal(href) ? '_blank' : undefined}
        >
          {/* labels carry marks of their own: the DPA and the privacy
              policy both link a bolded domain, [**trust.…**](…) */}
          {inline(match[3], base)}
        </a>
      );
    } else if (match[5] !== undefined) {
      out.push(
        <a href={`http://${match[5]}`} key={key++} rel='noreferrer' target='_blank'>
          {match[5]}
        </a>
      );
    } else {
      /* the privacy policy's legal-bases table breaks its cells with <br /> */
      out.push(<br key={key++} />);
    }
    cursor = at + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function Block({ base, block }: { base: string; block: LegalBlock }) {
  if (block.kind === 'p') return <p>{inline(block.text, base)}</p>;
  if (block.kind === 'h3') return <h3>{block.text}</h3>;
  if (block.kind === 'h4') return <h4>{block.text}</h4>;

  if (block.kind === 'list') {
    const items = block.items.map((item, index) => (
      <li key={index}>
        {item.paras.map((para, paraIndex) => (
          <p key={paraIndex}>{inline(para, base)}</p>
        ))}
      </li>
    ));
    return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
  }

  return (
    <div className='legal-tablewrap'>
      <table>
        <thead>
          <tr>
            {block.head.map((cell, cellIndex) => (
              <th key={cellIndex}>{inline(cell, base)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{inline(cell, base)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <article className='tc-sec legal-document-shell'>
      <LegalDocumentAside doc={doc} key={doc.route} />

      <div className='legal-document-body'>
        {doc.preamble.map((block, index) => (
          <Block base={base} block={block} key={index} />
        ))}

        {doc.sections.map((section) => (
          <Fragment key={section.id}>
            <h2 id={section.id}>{section.heading}</h2>
            {section.blocks.map((block, index) => (
              <Block base={base} block={block} key={index} />
            ))}
          </Fragment>
        ))}
      </div>
    </article>
  );
}
