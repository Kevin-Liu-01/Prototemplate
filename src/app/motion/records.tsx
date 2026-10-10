import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReactNode } from 'react';

import { renderInline } from '@/app/docs/markdown';
import type { MotionFilm } from '@/lib/motion';

import { langText, wholeLang } from './lang-text';
import { cutWords, megabytes } from './records-words';

/**
 * The server side of a film's two records: its contact sheet and its
 * script as built, the files scripts/build/motion.mjs copies to
 * public/motion/sheets and public/motion/scripts from the folder that holds
 * the published cut (the version rule, public/motion/published.json). Both
 * blocks are rendered here, so the client receives elements and the script
 * table ships no markdown. A film whose registry entry has no sheet or
 * script gets null, so a cut in review never shows a picture or a line.
 *
 * The script file is the Videos session's export (motion/kit/script-export.py):
 * an h1, the line `<length> s · <label> · <Voice>: <name>`, the story in one
 * paragraph, the table Time | Voice | Line | On screen, and a closing note.
 * The generator has already checked that shape. A Line cell holds the
 * spoken line and, after a <br>, its subtitle; a line wholly in Chinese or
 * Hebrew is one element with its own lang (and dir), and mixed text is
 * tagged run by run (lang-text.tsx).
 */

const OPTS = { text: langText };

/** Root paths under public/ that the registry may name for a record: nothing outside public/motion is read. */
const RECORD_PATH = /^\/motion\/(?:sheets|scripts)\/[a-z0-9-]+\.(?:webp|png|md)$/;

type ScriptRow = { time: string; voice: string; line: string; screen: string };

type ScriptFile = { meta: string; story: string; rows: ScriptRow[]; notes: string[] };

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** The published script of a film, parsed; undefined when the registry names none. */
function readScript(film: MotionFilm): ScriptFile | undefined {
  const src = film.script?.src;
  if (!src || !RECORD_PATH.test(src)) return undefined;
  const lines = readFileSync(join(process.cwd(), 'public', src), 'utf8').replace(/\r\n?/g, '\n').split('\n');
  const header = lines.findIndex((line) => line.trim().startsWith('| Time |'));
  if (header < 0) return undefined;
  const front: string[] = [];
  let current: string[] = [];
  for (const line of lines.slice(1, header)) {
    if (line.trim() === '') {
      if (current.length > 0) front.push(current.join(' '));
      current = [];
    } else current.push(line.trim());
  }
  if (current.length > 0) front.push(current.join(' '));
  const rows: ScriptRow[] = [];
  let end = header + 2;
  for (; end < lines.length && (lines[end] ?? '').trim().startsWith('|'); end += 1) {
    const [time = '', voice = '', line = '', screen = ''] = cells(lines[end] ?? '');
    rows.push({ time, voice, line, screen });
  }
  const notes = lines
    .slice(end)
    .join('\n')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return { meta: front[0] ?? '', story: front[1] ?? '', rows, notes };
}

/** A Line cell: the spoken line, then each part after a <br> (the subtitle) on a line of its own. */
function LineCell({ text, k }: { text: string; k: string }) {
  const parts = text.split(/\s*<br\s*\/?>\s*/i);
  return (
    <>
      {parts.map((part, i) => {
        const key = `${k}-${i}`;
        if (i > 0) {
          return (
            <span key={key} className='mo-sub'>
              {renderInline(part, key, OPTS)}
            </span>
          );
        }
        const whole = wholeLang(part);
        if (whole) {
          return (
            <span key={key} className='mo-said' lang={whole.lang} dir={whole.dir}>
              {part}
            </span>
          );
        }
        return (
          <span key={key} className='mo-said'>
            {renderInline(part, key, OPTS)}
          </span>
        );
      })}
    </>
  );
}

/**
 * The Contact sheet block: what the sheet shows, then the WebP at the
 * column's width, lazy, with its width and height reserved so nothing moves
 * when it decodes, and the links to the full-size WebP and the PNG.
 */
export function sheetBlock(film: MotionFilm): ReactNode | null {
  const sheet = film.sheet;
  if (!sheet || !RECORD_PATH.test(sheet.src)) return null;
  const cut = `the ${cutWords(film.cut?.label)}`;
  const lead = sheet.frames
    ? `Two frames a second across ${cut}, each from the middle of its half second, eight to a row: ${sheet.frames} frames. It is the cut that plays above.`
    : `The contact sheet of ${cut}, the cut that plays above.`;
  return (
    <>
      <p>{lead}</p>
      <figure className='mo-sheet'>
        <a className='mo-sheet-link' href={sheet.src} target='_blank' rel='noreferrer'>
          <img
            alt={`The contact sheet of ${cut} of ${film.title}${sheet.frames ? `: ${sheet.frames} frames, two a second, eight to a row` : ''}`}
            src={sheet.src}
            width={sheet.width}
            height={sheet.height}
            loading='lazy'
            decoding='async'
          />
        </a>
        <figcaption className='mo-send'>
          <a href={sheet.src} target='_blank' rel='noreferrer'>
            the WebP at full size, {megabytes(sheet.bytes)}
          </a>
          {sheet.png && sheet.pngBytes ? (
            <>
              {' · '}
              <a aria-label={`download the PNG of the contact sheet, ${megabytes(sheet.pngBytes)}`} download href={sheet.png}>
                download the PNG, {megabytes(sheet.pngBytes)}
              </a>
            </>
          ) : null}
        </figcaption>
      </figure>
    </>
  );
}

/**
 * The Script block: the story in one sentence, the second line's facts
 * (length, cut, voices), the table with each line's start in the final,
 * the file's closing note, and the Markdown file.
 */
export function scriptBlock(film: MotionFilm): ReactNode | null {
  const file = film.script ? readScript(film) : undefined;
  if (!film.script || !file) return null;
  const k = `${film.slug}-built`;
  return (
    <>
      {file.story ? <p>{renderInline(file.story, `${k}-story`, OPTS)}</p> : null}
      <p className='mo-built-meta'>{file.meta}</p>
      <div className='ptd-table-wrap'>
        <table className='ptd-table'>
          <thead>
            <tr>
              <th scope='col'>Time</th>
              <th scope='col'>Voice</th>
              <th scope='col'>Line</th>
              <th scope='col'>On screen</th>
            </tr>
          </thead>
          <tbody>
            {file.rows.map((row, r) => (
              <tr key={`${k}-r${r}`}>
                <td>{row.time}</td>
                <td>{row.voice}</td>
                <td className='mo-line'>
                  <LineCell text={row.line} k={`${k}-r${r}-l`} />
                </td>
                <td>{renderInline(row.screen, `${k}-r${r}-s`, OPTS)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {file.notes.map((note, i) => (
        <p key={`${k}-n${i}`} className='mo-built-note'>
          {renderInline(note, `${k}-n${i}`, OPTS)}
        </p>
      ))}
      <p className='mo-send'>
        <a href={film.script.src} target='_blank' rel='noreferrer'>
          the script as Markdown
        </a>
      </p>
    </>
  );
}

/**
 * The block a film gets when its published cut has no sheet or script but
 * a newer cut is in review: one sentence with the newer cut's label and
 * length, nothing of its pictures or its lines.
 */
export function reviewBlock(film: MotionFilm): ReactNode | null {
  if (film.sheet || film.script || !film.review) return null;
  return (
    <p>
      The contact sheet and the script were made for a newer cut, the {cutWords(film.review.label)} ({film.review.length}),
      which is in review. They are published here with that cut once it is approved.
    </p>
  );
}
