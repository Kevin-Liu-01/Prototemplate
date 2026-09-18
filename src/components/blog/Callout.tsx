import type { ReactNode } from 'react';

type CalloutProps = {
  /** the Fumadocs callout kind; every kind renders as the same quiet box here */
  type?: string;
  title?: string;
  children?: ReactNode;
};

/**
 * The quiet box the posts use for their asides and quoted style guide:
 * the landing site renders the Fumadocs callout, this one keeps the same
 * grammar in the site's tokens. Class and icon attributes the posts pass
 * for the Fumadocs theme are ignored.
 */
export default function Callout({ title, children }: CalloutProps) {
  return (
    <aside className='blog-callout'>
      {title ? <p className='blog-callout-title'>{title}</p> : null}
      {children}
    </aside>
  );
}
