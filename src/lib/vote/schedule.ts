/* Which pair a voter sees next. Each active logo needs a target number of
   matchups per voter (APPEARANCES, capped at the other logos); the logo
   furthest below it goes first, against an unvoted partner with the fewest
   matchups, then the closest global Elo. A fresh upload starts at zero for
   everyone, so returning voters get its matchups first. Ties break on a
   stable per-voter hash, so voters see different orders. Self-contained, so
   node --test loads it directly: the caller passes the ratings in. */

export type ScheduleVote = { winner: string; loser: string };
export type Pair = { left: string; right: string };
export type Progress = { done: number; total: number };
export type Schedule = {
  pair: Pair | null;
  progress: Progress;
  target: number;
  appearances: Map<string, number>;
};

export type ScheduleInput = {
  voterId: string;
  /** the active logos */
  keys: readonly string[];
  /** this voter's votes, any order, duplicates allowed */
  votes: readonly ScheduleVote[];
  /** global Elo by key; a missing key rates 1000 */
  ratings?: ReadonlyMap<string, number>;
  appearances?: number;
};

/** FNV-1a, 32 bits: a stable hash that needs no crypto module. */
export function hash32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function appearanceTarget(count: number, appearances = 3): number {
  return Math.max(0, Math.min(appearances, count - 1));
}

/** The keys in this voter's own stable order. */
export function voterOrder(voterId: string, keys: readonly string[]): string[] {
  const tie = (key: string) => hash32(`${voterId}:${key}`);
  return [...keys].sort((a, b) => tie(a) - tie(b) || compare(a, b));
}

export function schedule(input: ScheduleInput): Schedule {
  const { voterId, keys } = input;
  const active = new Set(keys);
  const voted = new Set<string>();
  for (const vote of input.votes) {
    if (vote.winner === vote.loser || !active.has(vote.winner) || !active.has(vote.loser)) continue;
    voted.add(pairKey(vote.winner, vote.loser));
  }
  const appearances = new Map(keys.map((key) => [key, 0]));
  for (const id of voted) {
    for (const key of id.split('|')) appearances.set(key, (appearances.get(key) ?? 0) + 1);
  }
  const target = appearanceTarget(keys.length, input.appearances);
  const seen = (key: string) => appearances.get(key) ?? 0;
  const deficit = keys.reduce((sum, key) => sum + Math.max(0, target - seen(key)), 0);
  const progress = { done: voted.size, total: voted.size + Math.ceil(deficit / 2) };
  const rating = (key: string) => input.ratings?.get(key) ?? 1000;
  const tie = (key: string) => hash32(`${voterId}:${key}`);

  const open = keys
    .filter((key) => seen(key) < target)
    .sort((a, b) => seen(a) - seen(b) || tie(a) - tie(b) || compare(a, b));
  for (const a of open) {
    const partners = keys.filter((b) => b !== a && !voted.has(pairKey(a, b)));
    if (!partners.length) continue;
    const base = rating(a);
    partners.sort(
      (x, y) =>
        seen(x) - seen(y) ||
        Math.abs(rating(x) - base) - Math.abs(rating(y) - base) ||
        tie(x) - tie(y) ||
        compare(x, y)
    );
    const b = partners[0] as string;
    const [low, high] = a < b ? [a, b] : [b, a];
    const flip = (hash32(`${voterId}:${low}|${high}`) & 1) === 1;
    return {
      pair: flip ? { left: high, right: low } : { left: low, right: high },
      progress,
      target,
      appearances,
    };
  }
  /* a logo with no unvoted partner counts as done, so a finished voter's bar is full */
  return { pair: null, progress: { done: voted.size, total: voted.size }, target, appearances };
}

/** A voter owes the likes step when their latest record has not seen every active logo. */
export function needsLikes(
  latest: { seen: readonly string[] } | null,
  keys: readonly string[]
): boolean {
  if (!keys.length) return false;
  if (!latest) return true;
  const seen = new Set(latest.seen);
  return keys.some((key) => !seen.has(key));
}
