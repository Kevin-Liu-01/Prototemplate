/** Words a minute for the reading-time facts in the book heads' panels. */
const WORDS_PER_MINUTE = 238;

/**
 * The minutes a text takes to read at 238 words a minute, one at least.
 * Words are the runs between whitespace. Called on the server only, over a
 * page's sources, and the count goes to the client as a prop.
 */
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
