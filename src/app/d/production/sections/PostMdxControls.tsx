'use client';

import { Check, ChevronRight, Clipboard, CopyCheck, Link as LinkIcon } from 'lucide-react';
import { useRef, useState, type ComponentProps, type ReactNode } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * PRODUCTION · the interactive parts of a post body, ported from the
 * fumadocs-ui 16.16.1 components live's MDX map spreads in
 * (fumadocs-ui/mdx: Heading, CodeBlock with Pre, Accordions and
 * Accordion). The markup and the copy behaviour are fumadocs'; the
 * Tailwind classes fumadocs puts on each element are restated as pba-
 * classes in blog-article.css, since this repository carries no fumadocs.
 */

/** fumadocs' useCopyButton: the check shows for 1.5s after a copy lands; a rejected copy leaves the idle face. */
function useCopied(): [boolean, (copy: () => Promise<void> | undefined) => void] {
  const [checked, setChecked] = useState(false);
  const timer = useRef(0);
  const run = (copy: () => Promise<void> | undefined) => {
    window.clearTimeout(timer.current);
    Promise.resolve(copy())
      .then(() => {
        setChecked(true);
        timer.current = window.setTimeout(() => setChecked(false), 1500);
      })
      .catch(() => setChecked(false));
  };
  return [checked, run];
}

type HeadingProps = ComponentProps<'h2'> & { as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' };

/** fumadocs' Heading: the text as a link to its own anchor, then a copy-anchor button that shows on hover. */
export function PostHeading({ as: As, children, className, ...props }: HeadingProps) {
  const [checked, run] = useCopied();
  if (!props.id) {
    return (
      <As className={className} {...props}>
        {children}
      </As>
    );
  }
  const id = props.id;
  return (
    <As className={`pba-heading${className ? ` ${className}` : ''}`} {...props}>
      <a data-card='' href={`#${id}`}>
        {children}
      </a>
      <button
        type='button'
        aria-live='polite'
        className='pba-heading-copy'
        onClick={() =>
          run(() => {
            const url = new URL(window.location.href);
            url.hash = id;
            return navigator.clipboard.writeText(url.href);
          })
        }
      >
        {checked ? <CopyCheck aria-hidden='true' /> : <LinkIcon aria-hidden='true' />}
        <span className='sr-only'>{checked ? 'Copied Anchor Link' : 'Copy Anchor Link'}</span>
      </button>
    </As>
  );
}

/**
 * fumadocs' CodeBlock around shiki's <pre>: the figure takes the pre's
 * class and style (the github-dark plate), the copy button sits top right,
 * and the region scrolls the code. The copy reads the pre's text.
 */
export function PostCodeBlock({ children, className, style }: ComponentProps<'pre'>) {
  const area = useRef<HTMLDivElement>(null);
  const [checked, run] = useCopied();
  return (
    <figure className={`pba-code${className ? ` ${className}` : ''}`} dir='ltr' style={style} tabIndex={-1}>
      <div className='pba-code-bar'>
        <button
          type='button'
          aria-live='polite'
          className='pba-code-copy'
          data-checked={checked || undefined}
          onClick={() =>
            run(() => {
              const pre = area.current?.getElementsByTagName('pre').item(0);
              if (!pre) return undefined;
              return navigator.clipboard.writeText(pre.textContent ?? '');
            })
          }
        >
          {checked ? <Check aria-hidden='true' /> : <Clipboard aria-hidden='true' />}
          <span className='sr-only'>{checked ? 'Copied Text' : 'Copy Text'}</span>
        </button>
      </div>
      <div className='pba-code-region' ref={area} role='region' tabIndex={0}>
        <pre className='pba-code-pre'>{children}</pre>
      </div>
    </figure>
  );
}

/** fumadocs' Accordions: a bordered stack of collapsible rows. */
export function PostAccordions({ children }: { children?: ReactNode }) {
  return <div className='pba-accordions'>{children}</div>;
}

/** fumadocs' Accordion: a row whose title toggles its content open. */
export function PostAccordion({ title, children }: { title?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='pba-accordion' data-state={open ? 'open' : 'closed'}>
      <h3 className='pba-accordion-head'>
        <button type='button' aria-expanded={open} className='pba-accordion-trigger' onClick={() => setOpen(!open)}>
          <ChevronRight aria-hidden='true' />
          {title}
        </button>
      </h3>
      {open ? (
        <div className='pba-accordion-body' role='region'>
          <div className='pba-accordion-content'>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * apps/landing/src/components/docs/Video.tsx: a looping inline video with
 * controls. It plays muted, so the browser lets it start on its own, and it
 * starts only after mount and only when the reader allows motion; under
 * reduced motion it waits on its first frame for the play control.
 */
export function PostVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useMountEffect(() => {
    if (prefersReducedMotion()) return;
    ref.current?.play().catch(() => {
      /* a blocked autoplay leaves the controls to start it */
    });
  });
  return <video className='pba-video' controls loop muted playsInline ref={ref} src={src} />;
}
