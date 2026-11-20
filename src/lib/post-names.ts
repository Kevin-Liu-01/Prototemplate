/**
 * The sidebar name of each post whose title runs past two lines in a
 * sidebar run, by slug: a short form of the post's own title, never its
 * subject's name. /blog and /graphics both read it, so a post carries one
 * name in every list; the full title stays the hover title, the grid
 * caption and the heading.
 */
export const POST_SHORT: Readonly<Record<string, string>> = {
  'paraglide-js': 'Paraglide JS is joining',
  'paraglide-js-context': 'Context from compiled i18n',
  'daniel-white': 'The physics of sound',
  'rewriting-our-docs': 'Rewriting docs for humans',
  'fuma-nama': 'An open-sourcerer',
};
