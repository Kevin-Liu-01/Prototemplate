/* A story as its magazine prints it: every block of the article in order
   (each paragraph, section head, picture, list, note and footnote). Built
   on the server and served as JSON with the story (atlas/[slug]/issue), so the
   front page carries none of it until a magazine opens. Text is HTML,
   escaped here; a paragraph is a list of words, each with its own markup,
   so a page can end inside it (riffle/paginate.ts). */

import fs from 'node:fs';

import { imageSize } from 'image-size';

import { lightTwin, publicFile, type Story } from '../content';
import type { Block, Frame, Inline } from '../parse';
import { isLocalPath } from '../links';
import { EDITIONS } from '../plates/editions';
import { BASE } from './print';
import { escapeHtml } from './html';

/**
 * One piece of the article. `cls` marks a paragraph's part: the lead (with
 * the drop cap), the epigraph, a source or a footnote. A minor head labels
 * what follows it (one version of the definitions); a list may carry its own
 * language and direction.
 */
export type Piece =
  | { kind: 'p'; words: string[]; cls?: 'lead' | 'note' | 'ref' | 'fn' }
  | { kind: 'h'; html: string; minor?: true }
  | {
      kind: 'fig';
      /** The optimizer's copies, a column wide and a page wide: URLs, escaped where they are printed. */
      src: string;
      wide: string;
      alt: string;
      ratio: number | null;
      caption: string;
      credit: string;
    }
  | {
      kind: 'list';
      ordered: boolean;
      items: string[];
      lang?: string;
      dir?: 'ltr' | 'rtl';
    }
  /** The story's own picture, for the opening spread, with its shape. */
  | { kind: 'cover'; src: string; ratio: number | null };

/** A link's address as the magazine prints it: a path on this site carries the site's base path, as Next's links do on the web page. */
const hrefOf = (href: string) =>
  escapeHtml(isLocalPath(href) ? `${BASE}${href}` : href);

/** A run of text and the markup around it, or a line break. */
type Run = { text: string; open: string; close: string } | { br: true };

function runs(nodes: Inline[], open = '', close = ''): Run[] {
  return nodes.flatMap((node): Run[] => {
    switch (node.t) {
      case 'text':
        return [{ text: node.v, open, close }];
      case 'code':
        return [
          { text: node.v, open: `${open}<code>`, close: `</code>${close}` },
        ];
      case 'strong':
        return runs(node.c, `${open}<b>`, `</b>${close}`);
      case 'em':
        return runs(node.c, `${open}<i>`, `</i>${close}`);
      case 'link':
        return runs(
          node.c,
          `${open}<a href="${hrefOf(node.href)}" target="_blank" rel="noreferrer">`,
          `</a>${close}`
        );
      case 'fn':
        return [
          { text: node.n, open: `${open}<sup>`, close: `</sup>${close}` },
        ];
      case 'br':
        return [{ br: true }];
      default:
        return [];
    }
  });
}

/** Text with its markup as words: each word whole, with every tag it sits in, so any run of them is valid HTML. */
function wordsOf(nodes: Inline[]): string[] {
  const words: string[] = [];
  let word = '';
  for (const run of runs(nodes)) {
    if ('br' in run) {
      if (word) words.push(word);
      words.push('<br>');
      word = '';
      continue;
    }
    for (const part of run.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (word) words.push(word);
        word = '';
      } else word += `${run.open}${escapeHtml(part)}${run.close}`;
    }
  }
  if (word) words.push(word);
  return words;
}

/** Text with its markup whole, for what is never split across pages: a caption, a list item. */
function html(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      switch (node.t) {
        case 'text':
          return escapeHtml(node.v);
        case 'code':
          return `<code>${escapeHtml(node.v)}</code>`;
        case 'strong':
          return `<b>${html(node.c)}</b>`;
        case 'em':
          return `<i>${html(node.c)}</i>`;
        case 'link':
          return `<a href="${hrefOf(node.href)}" target="_blank" rel="noreferrer">${html(node.c)}</a>`;
        case 'fn':
          return `<sup>${escapeHtml(node.n)}</sup>`;
        case 'br':
          return '<br>';
        default:
          return '';
      }
    })
    .join('');
}

/** A picture's width over its height, read from its file, so its place is held before it loads; null when the file is
    missing. */
function ratioOf(src: string): number | null {
  const file = publicFile(src);
  if (!fs.existsSync(file)) return null;
  const { width, height } = imageSize(fs.readFileSync(file));
  return width > 0 && height > 0 ? width / height : null;
}

/** A picture as the magazine asks for it: the image optimizer's copy a column wide on a 2x screen, or a page wide. */
function picture(frame: Pick<Frame, 'src'>, width = 640): string {
  return `${BASE}/_next/image?url=${encodeURIComponent(frame.src)}&w=${width}&q=75`;
}

function figure(
  frame: Frame | undefined,
  caption: Inline[] | undefined,
  credit: Inline[] | undefined
): Piece[] {
  if (!frame?.src) return [];
  // the caption, or the picture's own description when it has none, and whom it credits, kept apart so a page can set them side by side
  const said: Inline[] = caption?.length
    ? caption
    : [{ t: 'text', v: frame.alt }];
  // the magazine's pages are white stock, so a picture with a light twin prints that one
  const src = lightTwin(frame.src) ?? frame.src;
  return [
    {
      kind: 'fig',
      src: picture({ src }),
      wide: picture({ src }, 1200),
      alt: escapeHtml(frame.alt),
      ratio:
        frame.width && frame.height ? frame.width / frame.height : ratioOf(src),
      caption: html(said),
      credit: credit?.length ? html(credit) : '',
    },
  ];
}

/** Euclid's first definitions, which the web page sets on a turning globe: each version under its name, in its own numbering. */
function definitions(): Piece[] {
  return EDITIONS.flatMap((v): Piece[] => [
    {
      kind: 'h',
      html: escapeHtml(`${v.language}, ${v.city}, ${v.year}`),
      minor: true,
    },
    {
      kind: 'list',
      ordered: false,
      lang: v.lang,
      dir: v.dir,
      items: v.lines.map(
        (line) =>
          `${line.n ? `<b>${escapeHtml(line.n)}</b> ` : ''}${escapeHtml(line.text)}`
      ),
    },
  ]);
}

/** The pieces of one block; `live` names the live figure the web page sets in a figure's place. */
function piecesOf(block: Block, live: string | null): Piece[] {
  switch (block.kind) {
    case 'heading':
      // a head never breaks at its own hyphen ("open-source")
      return [
        { kind: 'h', html: escapeHtml(block.text).replace(/-/g, '\u2011') },
      ];
    case 'para':
      return [{ kind: 'p', words: wordsOf(block.inline) }];
    case 'list':
      return [
        { kind: 'list', ordered: block.ordered, items: block.items.map(html) },
      ];
    case 'rules':
      return [
        {
          kind: 'list',
          ordered: false,
          items: block.items.map(
            (rule) => `${rule.ok ? '✓' : '✕'} ${html(rule.inline)}`
          ),
        },
      ];
    case 'note': {
      // the epigraph in the serif, the sources small; any other note reads as the text does
      const cls =
        block.name === 'Epigraph'
          ? 'note'
          : block.name === 'Sources'
            ? 'ref'
            : undefined;
      return block.paras.map(
        (para): Piece => ({
          kind: 'p',
          words: wordsOf(para),
          ...(cls ? { cls } : {}),
        })
      );
    }
    case 'figure':
      if (!block.figure.frames.length && live === 'stops') return definitions();
      return figure(
        block.figure.frames[0],
        block.figure.caption,
        block.figure.credit
      );
    case 'side':
      return figure(block.frame, block.caption, block.credit);
    default:
      return [];
  }
}

/** Every piece of the story in reading order after its own picture, its footnotes gathered at the end under their own head. */
export function articleOf(story: Story): Piece[] {
  const pieces: Piece[] = story.cover
    ? [
        {
          kind: 'cover',
          src: picture({ src: story.cover }, 1200),
          ratio: ratioOf(story.cover),
        },
      ]
    : [];
  let lead = false;
  const live = new Map(story.figures.map((f) => [f.id, f.live]));
  for (const block of story.blocks) {
    for (const piece of piecesOf(
      block,
      block.kind === 'figure' ? (live.get(block.figure.id) ?? null) : null
    )) {
      // the first paragraph of the text itself, never a note's, opens on the drop cap
      if (!lead && block.kind === 'para' && piece.kind === 'p') {
        piece.cls = 'lead';
        lead = true;
      }
      pieces.push(piece);
    }
  }
  const notes = story.blocks.flatMap((b) => (b.kind === 'footnote' ? [b] : []));
  if (notes.length) {
    pieces.push({ kind: 'h', html: 'Notes' });
    for (const note of notes)
      pieces.push({
        kind: 'p',
        words: [`<sup>${escapeHtml(note.n)}</sup>`, ...wordsOf(note.inline)],
        cls: 'fn',
      });
  }
  return pieces;
}
