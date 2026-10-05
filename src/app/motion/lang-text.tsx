import type { ReactNode } from 'react';

import { gtText } from '@/components/viewer/GtWord';

/**
 * The inline text hook the /motion pages pass to the docs renderer
 * (RenderOptions.text in src/app/docs/markdown.tsx). The research packages
 * quote Chinese, Hebrew, Arabic and Greek inside English prose, so each
 * run of another script is set as one shaped text node with its own lang
 * (and dir for the right-to-left scripts), never split per character
 * (DESIGN.md section 8). Three rules apply in order:
 *
 * 1. A link's display text that reads as an address (`loc.gov/item/...`)
 *    is one left-to-right span, unsplit, the way a browser shows a URL.
 * 2. Single-star emphasis (`*Monkey*`) is set in em; the docs renderer
 *    has none, and the text would otherwise print its asterisks.
 * 3. Script runs. Hebrew (with its points, maqaf and gershayim) joins
 *    across spaces, punctuation and quotes when more Hebrew follows, so a
 *    quoted title is one isolate, and a run that opens a parenthesis or a
 *    quote takes the one that closes it. It never joins across +, an
 *    arrow, a middle dot or a slash, so a formula such as
 *    `מִלָּה + ־וֹן → מִלּוֹן` keeps three isolates in the left-to-right
 *    line. Han runs (with CJK and fullwidth punctuation, joined across an
 *    ellipsis) are zh-Hant, or zh-Hans when they hold a character from the
 *    simplified set below, or ja for the one Japanese title. Arabic is
 *    ar and right to left; Greek is grc.
 *
 * Everything else passes through gtText, as the docs' plain text does.
 * Server-safe: no hooks, no client code.
 */

const URL_TEXT = /^[\w.-]+\.[a-z]{2,}(\/|$)/i;

/** `*text*` at word boundaries, never `**`; the boundaries also take curly quotes and a slash, for two titles set as HaZvi/HaOr. */
const STAR_EM = /(^|[\s(["'“‘\/])\*(?!\*)([^*\s](?:[^*\n]*?[^*\s])?)\*(?=$|[\s.,;:)!?"'”’\]\/])/g;

const HEB = '\\u0590-\\u05FF\\uFB1D-\\uFB4F';
const HAN = '\\p{Script=Han}\\u3000-\\u303F\\uFF00-\\uFFEF';
const RUNS = new RegExp(
  [
    `([${HEB}]+(?:[\\s,.;:'"()\\[\\]\\u2013\\u2014?!]+[${HEB}]+)*)`,
    `([${HAN}]+(?:\\u2026[${HAN}]+)*)`,
    '([\\u0600-\\u06FF]+)',
    '([\\u0370-\\u03FF\\u1F00-\\u1FFF]+)',
  ].join('|'),
  'gu'
);

/**
 * Characters that appear only in simplified Chinese among the packages'
 * runs. A run holding one is zh-Hans. Ambiguous characters (学, 云, 黄,
 * 斗, 内, 性, 世, 歸, 糖, 游) are left out on purpose: the vocabulary
 * tables pair words that are not simplified forms of each other.
 */
const SIMPLIFIED = new Set('几点线锐钝边对圆积体说论题记吴孙齐圣马温猪净须师观来诗为证战胜纪刚从语汉译辩讯释统罗选蓝运兼国');

/** Han runs in another language, matched without their title brackets. */
const HAN_LANG: Readonly<Record<string, string>> = { 明末西洋科学東伝史: 'ja' };

function hanLang(run: string): string {
  const bare = run.replace(/[《》〈〉]/g, '');
  const named = HAN_LANG[bare];
  if (named) return named;
  for (const ch of run) if (SIMPLIFIED.has(ch)) return 'zh-Hans';
  return 'zh-Hant';
}

function count(text: string, ch: string): number {
  return text.split(ch).length - 1;
}

/** The script runs of a stretch of text, each in its span; the text between them through gtText. */
function scriptRuns(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  RUNS.lastIndex = 0;
  for (let m = RUNS.exec(text); m; m = RUNS.exec(text)) {
    let run = m[0];
    const at = m.index;
    if (m[1] !== undefined) {
      /* a run that opened a parenthesis or a quote takes the one that closes it */
      const next = text[at + run.length];
      if (next === ')' && count(run, '(') > count(run, ')')) run += next;
      else if (next === '"' && count(run, '"') % 2 === 1) run += next;
      RUNS.lastIndex = at + run.length;
    }
    if (at > last) out.push(gtText(text.slice(last, at), `${key}-${i++}`));
    const k = `${key}-${i++}`;
    if (m[1] !== undefined) {
      out.push(
        <span key={k} lang='he' dir='rtl'>
          {run}
        </span>
      );
    } else if (m[2] !== undefined) {
      out.push(
        <span key={k} lang={hanLang(run)}>
          {run}
        </span>
      );
    } else if (m[3] !== undefined) {
      out.push(
        <span key={k} lang='ar' dir='rtl'>
          {run}
        </span>
      );
    } else {
      out.push(
        <span key={k} lang='grc'>
          {run}
        </span>
      );
    }
    last = at + run.length;
  }
  if (last === 0) return [gtText(text, key)];
  if (last < text.length) out.push(gtText(text.slice(last), `${key}-${i}`));
  return out;
}

export function langText(text: string, key: string): ReactNode {
  if (URL_TEXT.test(text)) {
    return (
      <span key={key} dir='ltr'>
        {text}
      </span>
    );
  }
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(STAR_EM)) {
    const lead = m[1] ?? '';
    const start = (m.index ?? 0) + lead.length;
    if (start > last) out.push(...scriptRuns(text.slice(last, start), `${key}-${i++}`));
    const k = `${key}-${i++}`;
    out.push(<em key={k}>{scriptRuns(m[2] ?? '', k)}</em>);
    last = (m.index ?? 0) + m[0].length;
  }
  if (last === 0) return scriptRuns(text, key);
  if (last < text.length) out.push(...scriptRuns(text.slice(last), `${key}-${i}`));
  return out;
}
