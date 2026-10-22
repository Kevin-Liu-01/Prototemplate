import type { FrameWidth } from './PageFrame';

/**
 * The page types the hub builds from, each with the parts the anatomy
 * overlay outlines. A part names the element it outlines (a selector into
 * the framed page), the spacing it is written with, and what the overlay
 * reads for that spacing's value at the frame's width: a custom property
 * or a CSS property of the element (or of its parent, for a gap the
 * parent's grid sets, or of a child, for a measure its paragraphs hold),
 * or the element's own width or height. When the
 * value resolves to pixels and the part names a side, the overlay also
 * draws the spacing as a band on that side. The parts table on
 * /docs/components/page-templates lists the same parts with their files.
 */

export type Side = 'top' | 'bottom' | 'left' | 'right';

export type TemplatePart = {
  name: string;
  selector: string;
  /** the custom property, utility or CSS property the spacing is written with */
  token: string;
  /** what the overlay reads: a custom or CSS property, or `width` and `height` for the box */
  read: string;
  /** read the value off the element's parent, or off the first match of this selector inside the element */
  of?: string;
  /** the side the spacing sits on, drawn as a band outside the box unless `inside` */
  band?: Side;
  inside?: boolean;
  /** outline the circle these custom properties of the element place, in place of its box */
  circle?: { x: string; y: string; r: string };
  /** the one width the part applies at */
  only?: FrameWidth;
};

export type TemplatePage = {
  label: string;
  path: string;
  /** the 640 by 360 capture stem under /shots/thumb, when the page has one */
  still?: string;
};

export type TemplateId = 'book' | 'docs' | 'article' | 'error';

export type PageTemplate = {
  /** the entry point, printed in the plate's label */
  name: string;
  pages: readonly TemplatePage[];
  parts: readonly TemplatePart[];
};

export const TEMPLATES: Record<TemplateId, PageTemplate> = {
  book: {
    name: 'BookHead',
    pages: [
      { label: 'Skills', path: '/skills', still: 'skills' },
      { label: 'Marks', path: '/marks', still: 'marks' },
      { label: 'Transcreate', path: '/transcreate', still: 'transcreate' },
    ],
    parts: [
      { name: 'Sidebar', selector: '.pt-sb', token: '--pt-sb-w', read: 'width', only: '1440' },
      { name: 'Toolbar', selector: '.pt-toolbar', token: '--pt-bar-h', read: 'height' },
      { name: 'Title', selector: '.pt-book-mast h1', token: '--pt-title-clear', read: '--pt-title-clear', band: 'top' },
      { name: 'Lead', selector: '.pt-book-lead', token: '--pt-head-gap', read: '--pt-head-gap', band: 'top' },
      { name: 'Panel', selector: '.pt-book-panel', token: '--pt-head-col-gap', read: '--pt-head-col-gap', band: 'left', only: '1440' },
      { name: 'Mast rule', selector: '.pt-book-mast', token: '--pt-head-rule-pad', read: 'padding-bottom', band: 'bottom', inside: true },
      { name: 'Contents', selector: '.pt-book-toc', token: '--pt-book-gap', read: '--pt-book-gap', band: 'top' },
      { name: 'Hatch band', selector: '.pt-book-band', token: '--pt-sec-over', read: '--pt-sec-over', band: 'top' },
      { name: 'Divider', selector: '.pt-book-sec', token: '--pt-sec-pad', read: 'padding-top', band: 'top', inside: true },
      { name: 'Gutter note', selector: '.pt-book-sec small', token: '--pt-gutter', read: '--pt-gutter', only: '1440' },
    ],
  },
  docs: {
    name: 'DocsPage',
    pages: [
      { label: 'Template', path: '/docs/template' },
      { label: 'Quality bar', path: '/docs/handbook/quality-bar' },
    ],
    parts: [
      { name: 'Sidebar', selector: '#nd-sidebar', token: '--fd-sidebar-width', read: 'width', only: '1440' },
      { name: 'Header', selector: '#nd-subnav', token: '--fd-header-height', read: 'height' },
      { name: 'Page', selector: '#nd-page', token: 'padding-top', read: 'padding-top', band: 'top', inside: true },
      { name: 'Title', selector: '#nd-page > h1', token: 'gap-4', read: 'row-gap', of: 'parent', band: 'bottom' },
      { name: 'Lead', selector: '#nd-page > .docs-lead', token: '--pt-measure-lead', read: 'max-width' },
      { name: 'Meta row', selector: '[data-docs-meta]', token: 'padding-bottom', read: 'padding-bottom', band: 'bottom', inside: true },
      { name: 'Body', selector: '#nd-page .prose', token: '--pt-measure', read: 'max-width', of: ':scope > p' },
      { name: 'Contents', selector: '#nd-toc', token: '--fd-toc-width', read: 'width', only: '1440' },
    ],
  },
  article: {
    name: 'BlogArticle',
    pages: [
      { label: 'Post', path: '/d/production/blog/designing-docs-for-humans?chrome=0' },
      { label: 'Release', path: '/d/production/blog/gt-vue_v0_1_0?chrome=0' },
    ],
    parts: [
      { name: 'Nav', selector: 'header.pn', token: 'height', read: 'height' },
      { name: 'Rail', selector: '.pba-article', token: '--tc-rail', read: '--tc-rail', only: '1440' },
      { name: 'Header', selector: '.pba-header', token: 'padding-top', read: 'padding-top', band: 'top', inside: true },
      { name: 'Back rail', selector: '.pba-lead-rail', token: 'column-gap', read: 'column-gap', of: 'parent', band: 'right', only: '1440' },
      { name: 'Cover', selector: '.pba-cover', token: 'margin-top', read: 'margin-top', band: 'top' },
      { name: 'Sidebar', selector: '.pba-rail-sticky', token: 'top', read: 'top', only: '1440' },
      { name: 'Body', selector: '.pba-prose', token: 'padding-top', read: 'padding-top', band: 'top', inside: true },
      { name: 'Footer', selector: '.pba-explore', token: 'padding-top', read: 'padding-top', band: 'top', inside: true },
    ],
  },
  error: {
    name: 'NotFound',
    pages: [{ label: 'Not found', path: '/d/production/this-page-does-not-exist?chrome=0' }],
    parts: [
      { name: 'Nav', selector: 'header.pn', token: 'height', read: 'height' },
      { name: 'Band', selector: '.pnf-hero', token: 'min-height', read: 'min-height' },
      {
        name: 'Horizon',
        selector: '.pnf-hero',
        token: '--pnf-hole-radius',
        read: '--pnf-hole-radius',
        circle: { x: '--pnf-hole-x', y: '--pnf-hole-y', r: '--pnf-hole-radius' },
      },
      { name: 'Copy', selector: '.pnf-copy', token: 'width', read: 'width' },
      { name: 'Exits', selector: '.pnf-acts', token: 'margin-top', read: 'margin-top', band: 'top' },
      { name: 'Code', selector: '.pnf-code', token: 'bottom', read: 'bottom', band: 'bottom' },
      { name: 'Footer', selector: 'footer.v0-foot', token: '--tc-rail', read: '--tc-rail', only: '1440' },
    ],
  },
};
