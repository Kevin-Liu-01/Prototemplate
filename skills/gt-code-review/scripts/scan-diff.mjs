#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
// The candidate scan of gt-code-review (SKILL.md section 4). It reads a
// unified diff on stdin and prints every added line that matches a rule's
// pattern, as `path:line  RULE  text`. A printed line is a lead for the
// reviewer to read; the reviewer decides whether it is a finding.
//
// The patterns read code, which has a grammar, so pattern matching suits it.
// Rule M1 forbids pattern matching on model output and prompt prose, which
// have none.
//
// Usage:
//   git diff <base>...<head> | node scan-diff.mjs [--json]
//
// --json   print one JSON array of { path, line, rule, text } in place of lines.
//
// Requires: Node 18 or later. It reads stdin and writes nothing.
// N6 is read across lines: a run of comment-only lines in the new file,
// one of them added, longer than COMMENT_BLOCK_MAX.
//
// Last real run: 2026-11-25 on gt-cloud #6208 (be57221fc0 against its base):
// 43 candidates before the trial's tuning, of which the reviewers confirmed 4.

import { pathToFileURL } from 'node:url';

const PY = /\.py$/;
const TS = /\.[cm]?[jt]sx?$/;
const CODE = /\.(py|[cm]?[jt]sx?)$/;
const TEST = /(__tests__\/|\.test\.[cm]?[jt]sx?$|\.spec\.[cm]?[jt]sx?$|(^|\/)tests?\/|(^|\/)test_[^/]*\.py$|_test\.py$)/;

/** The comment part of a code line, or '' when the line holds none. */
export function commentOf(text, path) {
  const marker = PY.test(path) ? /(^|\s)#\s?/ : /(^|\s)\/\/\s?|^\s*\*\s|^\s*\/\*\s?/;
  const match = marker.exec(text);
  return match ? text.slice(match.index + match[0].length) : '';
}

/** The code part of a line, without its trailing comment. */
function codeOf(text, path) {
  const comment = commentOf(text, path);
  return comment ? text.slice(0, text.length - comment.length) : text;
}

const PROSE = '(prompt|note|notes|message|answer|reply|content|task|description|instructions|role)';

/**
 * The rules the scan covers, in SKILL.md order. Each rule has the files it
 * reads and a test of one added line.
 */
export const RULES = [
  {
    id: 'M1',
    label: 'a decision read from model output, prompt text or note prose',
    files: CODE,
    test: (text, path) => {
      if (TEST.test(path)) return false;
      const code = codeOf(text, path);
      const method = new RegExp(`\\b\\w*${PROSE}\\w*\\s*(\\?\\.|\\.)\\s*(match|matchAll|test|includes|startsWith|endsWith|startswith|endswith|search)\\(`, 'i');
      const regexOn = new RegExp(`\\bre\\.(search|match|fullmatch|findall)\\(.*,\\s*\\w*${PROSE}\\w*`, 'i');
      const testOn = new RegExp(`\\.test\\(\\s*\\w*${PROSE}\\w*`, 'i');
      const splitNote = /\.split\(\s*['"];\s['"]\s*\)/;
      const sentenceIn = /['"][A-Za-z][^'"]{24,}['"]\s+(not\s+)?in\s+\w*(prompt|note|message|answer|reply|content|task|text)\w*/i;
      return method.test(code) || regexOn.test(code) || testOn.test(code) || splitNote.test(code) || sentenceIn.test(code);
    },
  },
  {
    id: 'M2',
    label: 'a constant tuned on one case',
    files: CODE,
    test: (text, path) => {
      if (!/^\s*(export\s+)?(const\s+)?[A-Z][A-Z0-9_]{2,}\s*(:[^=]+)?=\s*[-\d.]/.test(codeOf(text, path))) return false;
      return /\b(was|retuned|tuned|from \S+ to)\b/i.test(commentOf(text, path));
    },
  },
  {
    id: 'M3',
    label: 'a hand-written language table or parser',
    files: CODE,
    test: (text, path) => {
      const code = codeOf(text, path);
      const ranges = (code.match(/\\u[0-9a-fA-F]{4}|\\U000[0-9a-fA-F]{5}|\b0x[0-9a-fA-F]{4,5}\b/g) ?? []).length >= 2;
      const months = /\b(January|February|March)\b[^\n]*\b(April|May|June)\b/.test(code);
      const days = /\b(Monday|Tuesday)\b[^\n]*\b(Wednesday|Thursday)\b/.test(code);
      const parser = /\b(def|function)\s+\w*(parse|tokeni[sz]e|unescape)\w*\s*\(/i.test(code) && !TEST.test(path);
      return ranges || months || days || parser;
    },
  },
  {
    id: 'M5',
    label: 'a failure swallowed or a default returned in its place',
    files: CODE,
    test: (text) =>
      /^\s*except\b[^:]*:\s*(pass|return None|return \[\]|return \{\}|continue)\s*$/.test(text) ||
      /\bcatch\s*(\([^)]*\))?\s*\{\s*\}/.test(text) ||
      /\.catch\(\s*\(\s*\w*\s*\)\s*=>\s*(undefined|null|\{\s*\}|\[\s*\])\s*\)/.test(text),
  },
  {
    id: 'Q2',
    label: 'a nested ternary or conditional expression',
    files: CODE,
    test: (text, path) => {
      const code = codeOf(text, path).replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""');
      if (PY.test(path)) return /\bif\b[^:]*\belse\b[^:]*\bif\b[^:]*\belse\b/.test(code) && !/^\s*(if|elif|while)\b/.test(code);
      const ternary = code.replace(/\?\.|\?\?=?|\?\s*[),:]/g, '');
      return (ternary.match(/\?/g) ?? []).length >= 2 && ternary.includes(':');
    },
  },
  {
    id: 'Q3',
    label: 'a TODO or FIXME with no issue link',
    files: CODE,
    test: (text, path) => {
      const comment = commentOf(text, path);
      return /\b(TODO|FIXME|XXX)\b/.test(comment) && !/https?:\/\/|#\d+|\b[A-Z]{2,}-\d+\b|<issue/.test(comment);
    },
  },
  {
    id: 'Q14',
    label: 'an object type with 3 or more boolean fields, a possible state machine',
    files: TS,
    test: (text, path) => (codeOf(text, path).match(/\??:\s*boolean\b/g) ?? []).length >= BOOLEAN_FIELDS_MIN,
  },
  {
    id: 'C1',
    label: 'an old path kept beside its replacement',
    files: CODE,
    test: (text, path) => /\b\w*(legacy|Legacy|LEGACY|_old_|_old\b|Old[A-Z])\w*|\b\w*(compat|Compat|COMPAT)(?![iI][bB])\w*/.test(codeOf(text, path)),
  },
  {
    id: 'C2',
    label: 'a flag that chooses between two implementations',
    files: CODE,
    test: (text, path) => {
      const code = codeOf(text, path);
      return (
        /\b(isFeatureEnabled|featureFlag|getFlag|feature_flag)\s*\(/.test(code) ||
        /(os\.environ\.get\(|process\.env\.)\s*['"]?[A-Z0-9_]*(ENABLED|_FLAG|USE_[A-Z_]+|_ON)\b/.test(code) ||
        /os\.environ\[\s*['"][A-Z0-9_]*(ENABLED|_FLAG|USE_[A-Z_]+|_ON)['"]\s*\](?!\s*=[^=])/.test(code)
      );
    },
  },
  {
    id: 'T2',
    label: 'a test named after the round that found its case',
    files: TEST,
    test: (text) => /\b(def|it|test|describe)\b[\s(]*['"]?\w*(round_?\d|_r\d{1,2}_|_r\d{1,2}\b|review_fixes)/i.test(text),
    path: (path) => /(^|\/)test_(r\d{1,2}|round\d*|review)_?\w*\.py$|(round|r\d{1,2})[-_]fixes\.test\./i.test(path),
  },
  {
    id: 'T3',
    label: 'a wall-clock time or a fixed sleep in a test',
    files: TEST,
    test: (text, path) => {
      const code = codeOf(text, path);
      if (/\b(setSystemTime|useFakeTimers|advanceTimers\w*)\b/.test(code)) return false;
      return (
        /\btime\.(monotonic|time|perf_counter)\(\)|\bperf_counter\(\)|\bDate\.now\(\)|\bperformance\.now\(\)/.test(code) ||
        /\b(time\.)?sleep\(\s*\d|\bsetTimeout\([^,]+,\s*\d{3,}/.test(code)
      );
    },
  },
  {
    id: 'TS1',
    label: 'outside data cast in place of a parse',
    files: TS,
    test: (text, path) => {
      const code = codeOf(text, path);
      return /JSON\.parse\(.*\)\s+as\s+(?!const\b)/.test(code) || /\.json\(\)\)?\s+as\s+(?!const\b)/.test(code) || /\bas any\b|:\s*any\b|<any>/.test(code);
    },
  },
  {
    id: 'TS2',
    label: 'an unchecked claim: as unknown as, or a non-null !',
    files: TS,
    test: (text, path) => {
      const code = codeOf(text, path).replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""');
      return /\bas unknown as\b/.test(code) || (!TEST.test(path) && /[\w)\]]!(\.|\[|\)|,|;)/.test(code));
    },
  },
  {
    id: 'TS4',
    label: 'a new enum',
    files: TS,
    test: (text) => /^\s*(export\s+)?(declare\s+)?(const\s+)?enum\s+\w+/.test(text),
  },
  {
    id: 'P5',
    label: 'a suppression with no code',
    files: PY,
    test: (text) => /#\s*type:\s*ignore(?!\[)|#\s*noqa(?!:)/.test(text),
  },
  {
    id: 'S1',
    label: 'a key, token or secret printed or put in a URL',
    files: CODE,
    test: (text, path) => {
      const code = codeOf(text, path);
      const logged = /\b(print|console\.(log|info|warn|error|debug)|log(ger)?\.(info|warn|warning|error|debug))\s*\([^)]*\b\w*(api_?key|apikey|token|secret|password)\w*/i;
      const inUrl = /[?&](api_?key|key|token|secret)=/i;
      return logged.test(code) || inUrl.test(code);
    },
  },
  {
    id: 'S3',
    label: 'a command built as a shell string',
    files: CODE,
    test: (text, path) => {
      const code = codeOf(text, path);
      return /\bshell\s*=\s*True\b/.test(code) || /\bos\.system\(/.test(code) || /\bexec(Sync)?\(\s*`[^`]*\$\{/.test(code);
    },
  },
  {
    id: 'N3',
    label: 'a comment that narrates history',
    files: CODE,
    test: (text, path) => {
      const comment = commentOf(text, path);
      if (!comment) return false;
      return (
        /\b(used to|previously|no longer|once drew|in round \d|round \d\b|was \d|was [A-Za-z_]+\(|r\d{1,2} (run|round|draft))/i.test(comment) ||
        /\b[0-9a-f]{9,40}\b/.test(comment)
      );
    },
  },
];

/**
 * N6: the most comment lines in a row that a block may hold, confirmed
 * 2026-11-26 (references/naming-writing.md, N6).
 */
export const COMMENT_BLOCK_MAX = 6;

/** Q14: the boolean fields in one type that make it a candidate state machine. */
export const BOOLEAN_FIELDS_MIN = 3;

/** Whether a line declares a field, and whether that field is a boolean. */
export function fieldLine(text, path) {
  const code = codeOf(text, path);
  if (PY.test(path)) {
    const field = /^\s+\w+\s*:\s*[^=(]+(=.*)?$/.test(code) && !/^\s*(def|class|return|if|for|while|with|elif|else)\b/.test(code);
    return [field, field && /:\s*bool\b/.test(code)];
  }
  const field = /^\s*(readonly\s+)?[\w$]+\??\s*:\s*[^=(]+[;,]?\s*$/.test(code);
  return [field, field && /:\s*boolean\b/.test(code)];
}

/**
 * Whether a line holds only a comment, given whether a Python docstring is
 * open before it. Returns [isComment, docstringOpenAfter].
 */
export function commentLine(text, path, inDoc) {
  const s = text.trim();
  if (!s) return [false, inDoc];
  if (PY.test(path)) {
    const quotes = (s.match(/"""|'''/g) ?? []).length;
    const open = quotes % 2 === 1 ? !inDoc : inDoc;
    return [inDoc || quotes > 0 || s.startsWith('#'), open];
  }
  return [/^(\/\/|\/\*|\*)/.test(s), false];
}

/** Every candidate in a unified diff: { path, line, rule, text }. */
export function scan(diff) {
  const found = [];
  let path = null;
  let line = 0;
  let inDoc = false;
  let block = null;
  const endBlock = () => {
    if (block && block.added && block.length > COMMENT_BLOCK_MAX) {
      found.push({ path: block.path, line: block.start, rule: 'N6', text: `a comment block of ${block.length} lines` });
    }
    block = null;
  };
  let fields = null;
  const endFields = () => {
    if (fields && fields.added && fields.booleans >= BOOLEAN_FIELDS_MIN) {
      found.push({ path: fields.path, line: fields.start, rule: 'Q14', text: `a type with ${fields.booleans} boolean fields` });
    }
    fields = null;
  };
  const trackFields = (text, added) => {
    if (!CODE.test(path)) return;
    if (!text.trim() || commentOf(text, path) === text.trim().replace(/^(#|\/\/)\s?/, '')) return;
    const [isField, isBoolean] = fieldLine(text, path);
    if (!isField) {
      endFields();
      return;
    }
    fields ??= { path, start: line, booleans: 0, added: false };
    if (isBoolean) fields.booleans += 1;
    fields.added ||= added;
  };
  const track = (text, added) => {
    if (!CODE.test(path)) return;
    const [isComment, open] = commentLine(text, path, inDoc);
    inDoc = open;
    if (!isComment) {
      endBlock();
      return;
    }
    block ??= { path, start: line, length: 0, added: false };
    block.length += 1;
    block.added ||= added;
  };
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ ')) {
      endBlock();
      endFields();
      inDoc = false;
      const target = raw.slice(4).trim();
      path = target === '/dev/null' ? null : target.replace(/^b\//, '');
      if (path) {
        for (const rule of RULES) {
          if (rule.path && rule.path(path)) found.push({ path, line: 0, rule: rule.id, text: '(file name)' });
        }
      }
      continue;
    }
    if (raw.startsWith('--- ') || raw.startsWith('diff --git')) continue;
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
    if (hunk) {
      endBlock();
      endFields();
      inDoc = false;
      line = Number(hunk[1]);
      continue;
    }
    if (!path) continue;
    if (raw.startsWith('+')) {
      const text = raw.slice(1);
      for (const rule of RULES) {
        if (rule.files.test(path) && rule.test(text, path)) found.push({ path, line, rule: rule.id, text: text.trim() });
      }
      track(text, true);
      trackFields(text, true);
      line += 1;
    } else if (raw.startsWith(' ')) {
      track(raw.slice(1), false);
      trackFields(raw.slice(1), false);
      line += 1;
    }
  }
  endBlock();
  endFields();
  return found;
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const found = scan(Buffer.concat(chunks).toString('utf8'));
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(found, null, 2));
    return;
  }
  for (const f of found) console.log(`${f.path}:${f.line}  ${f.rule}  ${f.text.slice(0, 160)}`);
  const counts = {};
  for (const f of found) counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  console.log(`\n${found.length} candidates: ${Object.entries(counts).map(([rule, n]) => `${rule} ${n}`).join(', ') || 'none'}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
