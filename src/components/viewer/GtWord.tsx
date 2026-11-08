import type { ReactNode } from 'react';

import './GtWord.css';

/**
 * The GT mark as a word. Kevin's rule for the site's copy: every standalone
 * "GT" in rendered prose is the mark, never the two letters. The mark is
 * the logo (LOGO in src/lib/logo.ts), drawn as a CSS mask of
 * public/brand/gt-globe-logo.svg, the file pnpm build:logo writes from that
 * drawing, so a page with many GT words carries the path once and not in
 * every word. GtWord.css sizes it to the text it sits in and fills it with
 * currentColor, so it takes the ink of its line in both themes. The letters
 * stay in the DOM as visually hidden text, so selection, copy, find in page
 * and screen readers still read "GT"; the mark is decoration.
 *
 * What stays text: lowercase package and CLI names (gt, gt-next, gt-react,
 * gt-vue, gt-node, gt-python, gt-rrweb), code, URLs, attribute values
 * (alt, aria-label, title), document titles and metadata, file names,
 * hyphen-joined forms (GT-format) and letters inside other words (GTM).
 * JSX copy places <GtWord /> directly; gtText() applies the rule to a
 * string that arrives as data (a mark's notes, a skill's description).
 */
export function GtWord() {
  return (
    <span className='pt-gt-word'>
      <span className='pt-gt-word-mark' aria-hidden='true' />
      <span className='pt-gt-word-text'>GT</span>
    </span>
  );
}

/**
 * The standalone word: GT at the start of the string or after a character
 * that is not a letter, digit, underscore or hyphen, and not followed by
 * one. Group 1 is the character before it, consumed so the match can be
 * placed; written without a lookbehind so the pattern parses in every
 * browser the site serves.
 */
const GT_WORD = /(^|[^\w-])GT(?![\w-])/g;

/**
 * The copy with every standalone GT rendered as the mark. A string with
 * none comes back unchanged, so any copy can pass through; the marks are
 * keyed under keyBase so several strings can share one parent.
 */
export function gtText(text: string, keyBase = 'gt'): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(GT_WORD)) {
    const at = (match.index ?? 0) + (match[1] ?? '').length;
    if (at > last) out.push(text.slice(last, at));
    out.push(<GtWord key={`${keyBase}-${n}`} />);
    n += 1;
    last = at + 2;
  }
  if (n === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}
