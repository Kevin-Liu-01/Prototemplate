/* Which pair a voter sees next in one decision. Each active option needs a
   target number of matchups per voter (the decision's appearances, capped
   at the other options); the option furthest below it goes first, against
   an unvoted partner with the fewest matchups, then the closest global Elo.
   A new option starts at zero for everyone, so returning voters get its
   matchups first. The progress total is the matchups done plus the ones
   the schedule would still ask, which the ratings never change. Ties break
   on a stable per-voter hash, so voters see different orders.
   Self-contained, so node --test loads it directly: the caller passes the
   ratings in. */

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
  /** the active options */
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

/** How many of the partners nearest in Elo are tried before the plan's own; each try runs the plan ahead once. */
const CLOSEST = 3;

export function appearanceTarget(count: number, appearances = 3): number {
  return Math.max(0, Math.min(appearances, count - 1));
}

/** A pair's sides as this voter sees them, by a stable per-voter hash, so a pair shows the same way on every screen. */
export function sidesOf(voterId: string, a: string, b: string): Pair {
  const [low, high] = a < b ? [a, b] : [b, a];
  return (hash32(`${voterId}:${low}|${high}`) & 1) === 1 ? { left: high, right: low } : { left: low, right: high };
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
  /* a matchup against a hidden option still counts for the other option, so hiding never reopens a finished ballot */
  const played = new Set<string>();
  for (const vote of input.votes) {
    if (vote.winner === vote.loser || (!active.has(vote.winner) && !active.has(vote.loser))) continue;
    const id = pairKey(vote.winner, vote.loser);
    played.add(id);
    if (active.has(vote.winner) && active.has(vote.loser)) voted.add(id);
  }
  const appearances = new Map(keys.map((key) => [key, 0]));
  for (const id of played) {
    for (const key of id.split('|')) if (active.has(key)) appearances.set(key, (appearances.get(key) ?? 0) + 1);
  }
  const target = appearanceTarget(keys.length, input.appearances);
  const hashes = new Map(keys.map((key) => [key, hash32(`${voterId}:${key}`)]));
  const tie = (key: string) => hashes.get(key) ?? 0;

  /* the option to place next, fewest matchups first, then by hash, with its unvoted partners */
  const options = (taken: ReadonlySet<string>, count: ReadonlyMap<string, number>) => {
    const seen = (key: string) => count.get(key) ?? 0;
    const order = (x: string, y: string) => seen(x) - seen(y) || tie(x) - tie(y) || compare(x, y);
    for (const a of keys.filter((key) => seen(key) < target).sort(order)) {
      const partners = keys.filter((b) => b !== a && !taken.has(pairKey(a, b)));
      if (partners.length) return { a, partners, seen, order };
    }
    return null;
  };
  type Options = NonNullable<ReturnType<typeof options>>;
  /* the partner the plan takes: fewest matchups, then by hash */
  const planned = ({ a, partners, order }: Options): Pair => ({
    left: a,
    right: partners.reduce((best, key) => (order(key, best) < 0 ? key : best)),
  });

  /* how many matchups the plan still asks after `step` */
  const ahead = (step: Pair): number => {
    const taken = new Set(voted);
    const count = new Map(appearances);
    let steps = 0;
    for (let next: Pair | null = step; next; steps += 1) {
      taken.add(pairKey(next.left, next.right));
      for (const key of [next.left, next.right]) count.set(key, (count.get(key) ?? 0) + 1);
      const more = options(taken, count);
      next = more ? planned(more) : null;
    }
    return steps - 1;
  };

  const first = options(voted, appearances);
  if (!first) {
    /* an option with no unvoted partner counts as done, so a finished voter's bar is full */
    return { pair: null, progress: { done: voted.size, total: voted.size }, target, appearances };
  }
  /* The total counts the matchups the plan still asks, so it holds while
     the voter answers, whatever the ratings do. Among the partners with the
     fewest matchups, the nearest in global Elo replaces the plan's partner
     when it adds no matchup to the plan; the CLOSEST nearest are tried. */
  const plan = planned(first);
  const remaining = 1 + ahead(plan);
  let b = plan.right;
  if (input.ratings) {
    const rating = (key: string) => input.ratings?.get(key) ?? 1000;
    const base = rating(first.a);
    const fewest = first.seen(plan.right);
    const closest = first.partners
      .filter((key) => first.seen(key) === fewest)
      .sort((x, y) => Math.abs(rating(x) - base) - Math.abs(rating(y) - base) || tie(x) - tie(y) || compare(x, y))
      .slice(0, CLOSEST);
    b = closest.find((key) => key === plan.right || ahead({ left: first.a, right: key }) === remaining - 1) ?? plan.right;
  }
  return {
    pair: sidesOf(voterId, first.a, b),
    progress: { done: voted.size, total: voted.size + remaining },
    target,
    appearances,
  };
}

/** A voter owes the likes step when their latest record has not seen every active option. */
export function needsLikes(
  latest: { seen: readonly string[] } | null,
  keys: readonly string[]
): boolean {
  if (!keys.length) return false;
  if (!latest) return true;
  const seen = new Set(latest.seen);
  return keys.some((key) => !seen.has(key));
}

/**
 * Where a voter stands once the schedule is read: they owe the likes step
 * when the decision has one, their matchups are done and their latest
 * likes record has not seen every active option; they are complete when
 * neither a pair nor the likes step is left.
 */
export function standing(input: {
  sched: Pick<Schedule, 'pair'>;
  keys: readonly string[];
  latest: { seen: readonly string[] } | null;
  likes: boolean;
}): { needsLikes: boolean; complete: boolean } {
  const owes = input.likes && !input.sched.pair && needsLikes(input.latest, input.keys);
  return { needsLikes: owes, complete: !input.sched.pair && !owes };
}
