/* A story as its magazine prints it: every block of the article in order
   (each paragraph, section head, picture, list, note and footnote), with the
   pull quotes where the web page places them (pulls.ts). Built on the server
   and served as JSON with the story (press/[slug]/issue), so the front page
   carries none of it until a magazine opens. Text is HTML, escaped here; a
   paragraph is a list of words, each with its own markup, so a page can end
   inside it (riffle/paginate.ts). */

import fs from 'node:fs';

import { publicFile, type Story } from '../content';
import type { Block, Frame, Inline } from '../parse';
import { EDITIONS } from '../plates/editions';
import { placePulls } from '../pulls';
import { BASE } from './print';

/**
 * One piece of the article. `cls` marks a paragraph's part: the lead (with
 * the drop cap), the epigraph, a source or a footnote. A minor head labels
 * what follows it (one version of the definitions); a list may carry its own
 * language and direction.
 */
export type Piece =
  | { kind: 'p'; words: string[]; cls?: 'lead' | 'note' | 'ref' | 'fn' }
  | { kind: 'h'; html: string; minor?: true }
  | { kind: 'fig'; src: string; alt: string; ratio: number | null; caption: string }
  | { kind: 'quote'; html: string; by: string }
  | { kind: 'list'; ordered: boolean; items: string[]; lang?: string; dir?: 'ltr' | 'rtl' };

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/** A run of text and the markup around it, or a line break. */
type Run = { text: string; open: string; close: string } | { br: true };

function runs(nodes: Inline[], open = '', close = ''): Run[] {
  return nodes.flatMap((node): Run[] => {
    switch (node.t) {
      case 'text':
        return [{ text: node.v, open, close }];
      case 'code':
        return [{ text: node.v, open: `${open}<code>`, close: `</code>${close}` }];
      case 'strong':
        return runs(node.c, `${open}<b>`, `</b>${close}`);
      case 'em':
        return runs(node.c, `${open}<i>`, `</i>${close}`);
      case 'link':
        return runs(node.c, `${open}<a href="${esc(node.href)}" target="_blank" rel="noreferrer">`, `</a>${close}`);
      case 'fn':
        return [{ text: node.n, open: `${open}<sup>`, close: `</sup>${close}` }];
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
      } else word += `${run.open}${esc(part)}${run.close}`;
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
          return esc(node.v);
        case 'code':
          return `<code>${esc(node.v)}</code>`;
        case 'strong':
          return `<b>${html(node.c)}</b>`;
        case 'em':
          return `<i>${html(node.c)}</i>`;
        case 'link':
          return `<a href="${esc(node.href)}" target="_blank" rel="noreferrer">${html(node.c)}</a>`;
        case 'fn':
          return `<sup>${esc(node.n)}</sup>`;
        case 'br':
          return '<br>';
        default:
          return '';
      }
    })
    .join('');
}

/** A picture's width over its height, read from its file's header (PNG, GIF, WebP or JPEG), so its place is held before it loads. */
function ratioOf(src: string): number | null {
  let data: Buffer;
  try {
    const fd = fs.openSync(publicFile(src), 'r');
    data = Buffer.alloc(256 * 1024);
    const read = fs.readSync(fd, data, 0, data.length, 0);
    fs.closeSync(fd);
    data = data.subarray(0, read);
  } catch {
    return null;
  }
  const size = (w: number, h: number) => (w > 0 && h > 0 ? w / h : null);
  if (data.toString('ascii', 1, 4) === 'PNG') return size(data.readUInt32BE(16), data.readUInt32BE(20));
  if (data.toString('ascii', 0, 3) === 'GIF') return size(data.readUInt16LE(6), data.readUInt16LE(8));
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = data.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return size(1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3));
    if (chunk === 'VP8 ') return size(data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff);
    if (chunk === 'VP8L') {
      const bits = data.readUInt32LE(21);
      return size(1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff));
    }
    return null;
  }
  // JPEG: the first start-of-frame marker carries the size
  if (data[0] === 0xff && data[1] === 0xd8) {
    let at = 2;
    while (at + 9 < data.length) {
      if (data[at] !== 0xff) return null;
      const marker = data[at + 1]!;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return size(data.readUInt16BE(at + 7), data.readUInt16BE(at + 5));
      at += 2 + data.readUInt16BE(at + 2);
    }
  }
  return null;
}

/** A picture as the magazine asks for it: the image optimizer's copy a column wide on a 2x screen. */
function picture(frame: Frame): string {
  return `${BASE}/_next/image?url=${encodeURIComponent(frame.src)}&w=640&q=75`;
}

function figure(frame: Frame | undefined, caption: Inline[] | undefined, credit: Inline[] | undefined): Piece[] {
  if (!frame?.src) return [];
  // the caption, or the picture's own description when it has none, then whom it credits
  const said: Inline[] = caption?.length ? caption : [{ t: 'text', v: frame.alt }];
  const by: Inline[] = credit?.length ? [{ t: 'text', v: ' — ' }, ...credit] : [];
  const words = [...said, ...by];
  return [{ kind: 'fig', src: picture(frame), alt: esc(frame.alt), ratio: frame.width && frame.height ? frame.width / frame.height : ratioOf(frame.src), caption: html(words) }];
}

/** A pull quote's words, a title in *asterisks* set in italics. */
function quote(text: string): string {
  return text
    .split('*')
    .map((part, k) => (k % 2 ? `<i>${esc(part)}</i>` : esc(part)))
    .join('');
}

/** Euclid's first definitions, which the web page sets on a turning globe: each version under its name, in its own numbering. */
function definitions(): Piece[] {
  return EDITIONS.flatMap((v): Piece[] => [
    { kind: 'h', html: esc(`${v.language}, ${v.city}, ${v.year}`), minor: true },
    { kind: 'list', ordered: false, lang: v.lang, dir: v.dir, items: v.lines.map((line) => `${line.n ? `<b>${esc(line.n)}</b> ` : ''}${esc(line.text)}`) },
  ]);
}

/** The pieces of one block; `live` names the live figure the web page sets in a figure's place. */
function piecesOf(block: Block, live: string | null): Piece[] {
  switch (block.kind) {
    case 'heading':
      // a head never breaks at its own hyphen ("open-source")
      return [{ kind: 'h', html: esc(block.text).replace(/-/g, '\u2011') }];
    case 'para':
      return [{ kind: 'p', words: wordsOf(block.inline) }];
    case 'list':
      return [{ kind: 'list', ordered: block.ordered, items: block.items.map(html) }];
    case 'rules':
      return [{ kind: 'list', ordered: false, items: block.items.map((rule) => `${rule.ok ? '✓' : '✕'} ${html(rule.inline)}`) }];
    case 'note': {
      // the epigraph in the serif, the sources small; any other note reads as the text does
      const cls = block.name === 'Epigraph' ? 'note' : block.name === 'Sources' ? 'ref' : undefined;
      return block.paras.map((para): Piece => ({ kind: 'p', words: wordsOf(para), ...(cls ? { cls } : {}) }));
    }
    case 'figure':
      if (!block.figure.frames.length && live === 'stops') return definitions();
      return figure(block.figure.frames[0], block.figure.caption, block.figure.credit);
    case 'side':
      return figure(block.frame, block.caption, block.credit);
    default:
      return [];
  }
}

/** Every piece of the story in reading order, its footnotes gathered at the end under their own head. */
export function articleOf(story: Story): Piece[] {
  const pulls = placePulls(story.blocks, story.slug);
  const pieces: Piece[] = [];
  let lead = false;
  const live = new Map(story.figures.map((f) => [f.id, f.live]));
  story.blocks.forEach((block, i) => {
    for (const piece of piecesOf(block, block.kind === 'figure' ? (live.get(block.figure.id) ?? null) : null)) {
      // the first paragraph of the text itself, never a note's, opens on the drop cap
      if (!lead && block.kind === 'para' && piece.kind === 'p') {
        piece.cls = 'lead';
        lead = true;
      }
      pieces.push(piece);
    }
    const pull = pulls.get(i);
    if (pull) pieces.push({ kind: 'quote', html: quote(pull.text), by: pull.by ? esc(pull.by) : '' });
  });
  const notes = story.blocks.flatMap((b) => (b.kind === 'footnote' ? [b] : []));
  if (notes.length) {
    pieces.push({ kind: 'h', html: 'Notes' });
    for (const note of notes) pieces.push({ kind: 'p', words: [`<sup>${esc(note.n)}</sup>`, ...wordsOf(note.inline)], cls: 'fn' });
  }
  return pieces;
}
