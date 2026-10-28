/* Elo over the vote log: every vote replayed in time order, the first vote
   per voter per unordered pair only, excluded voters and logos outside the
   active set skipped. Self-contained, so node --test loads it directly. */

export type EloVote = { voterId: string; ts: number; winner: string; loser: string };

export type EloRow = { key: string; elo: number; wins: number; losses: number; games: number };

export type EloResult = {
  rows: Map<string, EloRow>;
  /** wins[i][j] is how often keys[i] beat keys[j] */
  matrix: { keys: string[]; wins: number[][] };
  /** the votes that counted, in replay order */
  counted: EloVote[];
};

export type EloOptions = {
  /** the logos that count, in display order */
  keys: readonly string[];
  /** voters whose votes never count */
  excluded?: ReadonlySet<string>;
  /** when given, only these voters count (a domain filter) */
  voters?: ReadonlySet<string>;
  start?: number;
  k?: number;
};

/** One id per unordered pair. Keys never hold '|'. */
export function pairId(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function byTime(a: EloVote, b: EloVote): number {
  return (
    a.ts - b.ts ||
    (a.voterId < b.voterId ? -1 : a.voterId > b.voterId ? 1 : 0) ||
    (a.winner < b.winner ? -1 : a.winner > b.winner ? 1 : 0) ||
    (a.loser < b.loser ? -1 : a.loser > b.loser ? 1 : 0)
  );
}

/** The first vote per voter per unordered pair, in time order. */
export function dedupeVotes<T extends EloVote>(votes: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const vote of [...votes].sort(byTime)) {
    if (vote.winner === vote.loser) continue;
    const id = `${vote.voterId}:${pairId(vote.winner, vote.loser)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(vote);
  }
  return out;
}

export function expectedScore(rating: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - rating) / 400));
}

export function computeElo(votes: readonly EloVote[], options: EloOptions): EloResult {
  const start = options.start ?? 1000;
  const k = options.k ?? 32;
  const keys = [...options.keys];
  const index = new Map(keys.map((key, i) => [key, i]));
  const rows = new Map<string, EloRow>(
    keys.map((key) => [key, { key, elo: start, wins: 0, losses: 0, games: 0 }])
  );
  const wins = keys.map(() => keys.map(() => 0));
  const eligible = votes.filter(
    (vote) =>
      index.has(vote.winner) &&
      index.has(vote.loser) &&
      !options.excluded?.has(vote.voterId) &&
      (!options.voters || options.voters.has(vote.voterId))
  );
  const counted = dedupeVotes(eligible);
  for (const vote of counted) {
    const winner = rows.get(vote.winner);
    const loser = rows.get(vote.loser);
    const i = index.get(vote.winner);
    const j = index.get(vote.loser);
    if (!winner || !loser || i === undefined || j === undefined) continue;
    const delta = k * (1 - expectedScore(winner.elo, loser.elo));
    winner.elo += delta;
    loser.elo -= delta;
    winner.wins += 1;
    winner.games += 1;
    loser.losses += 1;
    loser.games += 1;
    wins[i][j] += 1;
  }
  return { rows, matrix: { keys, wins }, counted };
}
