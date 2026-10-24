/* Inline text as plain words. Its own module, so the client code that
   needs it never loads the MDX parser in parse.ts. */

import type { Inline } from './parse';

export function plain(inline: Inline[]): string {
  return inline.map((node) => (node.t === 'text' || node.t === 'code' ? node.v : node.t === 'fn' ? '' : node.t === 'br' ? ' ' : plain(node.c))).join('');
}
