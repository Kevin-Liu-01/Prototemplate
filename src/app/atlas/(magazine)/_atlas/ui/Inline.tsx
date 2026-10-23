import Link from 'next/link';
import { Fragment } from 'react';

import { useEdition } from '../edition';
import type { Inline as InlineNode } from '../parse';

/* The parsed inline text: links inside the press route through Next and
   stay in the edition the reader is in, the rest open in place. */
export default function Inline({ nodes }: { nodes: InlineNode[] }) {
  const edition = useEdition();
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.t) {
          case 'text':
            return <Fragment key={i}>{node.v}</Fragment>;
          case 'code':
            return <code key={i}>{node.v}</code>;
          case 'strong':
            return (
              <strong key={i}>
                <Inline nodes={node.c} />
              </strong>
            );
          case 'em':
            return (
              <em key={i}>
                <Inline nodes={node.c} />
              </em>
            );
          case 'br':
            return <br key={i} />;
          case 'fn':
            // the note's number; the book look sets the note beside it in the margin
            return (
              <sup key={i} className='gtp-fn' id={`fnref-${node.n}`}>
                <a href={`#fn-${node.n}`}>{node.n}</a>
              </sup>
            );
          case 'link':
            return node.href.startsWith('/atlas') ? (
              <Link key={i} href={edition === 'shelf' && !node.href.startsWith('/atlas/shelf') ? node.href.replace(/^\/atlas/, '/atlas/shelf') : node.href}>
                <Inline nodes={node.c} />
              </Link>
            ) : (
              <a key={i} href={node.href} target='_blank' rel='noreferrer'>
                <Inline nodes={node.c} />
              </a>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
