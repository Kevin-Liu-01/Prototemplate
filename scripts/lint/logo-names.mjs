/**
 * The names half of the logo lock (pnpm lint:logo rule 16). Kevin,
 * 2026-11-18: "dont call the final the refined logo. its just the logo
 * logo. refine all naming conventions and rename any deviants throughout
 * app". General Translation's logo is "the logo" (catalog id `logo`), the
 * 11-06 globe "the previous logo", the doubled-line monogram "the previous
 * mark", the lockups "the lockup"; the hub's lambda in doubled lines is "the
 * Locadex logo" (catalog id `locadex-logo`) and gt-cloud's lambda "the
 * shipped Locadex mark" (docs/handbook/decisions.md, 2026-11-18).
 *
 * NAMES are the names that call one of these by another name; QUOTES are
 * the words of Kevin's that use one, which stay as he wrote them. A match
 * inside a quote passes; a quote is found whatever whitespace, comment star
 * or comment slashes break its lines.
 */

/** Each deviant name, what it names and what to write instead. */
export const NAMES = [
  { pattern: /\brefined[- ](?:logo|globe|lockup|construction|drawing|symbol|progression)s?\b/gi, say: 'the logo (or the lockup, or "the logo\'s construction")' },
  { pattern: /\brefined-1112\b/g, say: "the catalog id 'logo'" },
  { pattern: /\bnew logos?\b/gi, say: 'the logo, or the Locadex logo' },
  { pattern: /\bglobe logo\b/gi, say: 'the logo' },
  { pattern: /\bdoubled[- ]lambda\b/gi, say: "the Locadex logo (catalog id 'locadex-logo')" },
  { pattern: /\btraced lambda\b/gi, say: 'the shipped Locadex mark' },
];

/** Kevin's words that use a deviant name, kept verbatim wherever they are quoted. */
export const QUOTES = [
  "i'm using a refined logo, which incorporates the construction improvements",
  'Refined logo only',
  'the new logo is set. lets just make the 4 globe version',
  'also note our new logos on everything including kb videos',
  'dont call the final the refined logo. its just the logo logo. refine all naming conventions and rename any deviants throughout app',
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* a quote's words, with any run of whitespace, comment stars or slashes between them */
const QUOTE_PATTERNS = QUOTES.map((quote) => new RegExp(quote.split(/\s+/).map(escape).join('(?:\\s|\\*|//|#)+'), 'g'));

/** The deviant names in `text` outside Kevin's quotes, each with its index, the words and what to write instead. */
export function deviantNames(text) {
  const spans = QUOTE_PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((m) => [m.index, m.index + m[0].length]));
  const inQuote = (start, end) => spans.some(([a, b]) => start >= a && end <= b);
  const out = [];
  for (const { pattern, say } of NAMES) {
    for (const m of text.matchAll(pattern)) {
      if (!inQuote(m.index, m.index + m[0].length)) out.push({ index: m.index, words: m[0], say });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}
