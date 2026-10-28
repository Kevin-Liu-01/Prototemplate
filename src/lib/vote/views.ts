/* The answers the vote API builds from the store: a voter's state, the
   results and the admin data, and the CSV export. Voters see each logo by
   an opaque id (its alias), never by its key, because a key can name the
   logo and the matchups are blind. */
import { APPEARANCES, CACHE_MS, ELO_K, ELO_START, logoSrc, MIN_GROUP_VOTERS, namespace, voteAllowList } from './config';
import { computeElo } from './elo';
import { isAllowedEmail, logoAlias } from './identity';
import { needsLikes, schedule, voterOrder } from './schedule';
import * as store from './store';

import type { Schedule } from './schedule';
import type { LikesRecord, LogoRecord, VoteRecord, VoterRecord } from './store';
import type { AdminData, AdminVoter, Results, VoteLogo, VoteState } from './types';

export const EMPTY_STATE: VoteState = {
  voter: null,
  pair: null,
  progress: { done: 0, total: 0 },
  needsLikes: false,
  logos: [],
  likes: [],
  complete: false,
};

function activeOf(logos: LogoRecord[]): LogoRecord[] {
  return logos.filter((logo) => !logo.hidden);
}

/** The opaque id a logo's image address and a voter's state carry; route() has checked the secret is set. */
export function aliasOf(key: string): string {
  return logoAlias(process.env.VOTE_SECRET ?? '', key);
}

/** The logos by their alias. */
export function byAlias(logos: readonly LogoRecord[]): Map<string, LogoRecord> {
  return new Map(logos.map((logo) => [aliasOf(logo.key), logo]));
}

function srcOf(logo: LogoRecord): string {
  return logoSrc(aliasOf(logo.key), logo.version);
}

/* the global ratings only break ties in the schedule, so a short-lived copy per instance is enough */
let ratingsCache: { at: number; id: string; value: Map<string, number> } | null = null;

async function scheduleRatings(keys: string[]): Promise<Map<string, number>> {
  const id = `${namespace()}:${keys.join(',')}`;
  if (ratingsCache && ratingsCache.id === id && Date.now() - ratingsCache.at < CACHE_MS) return ratingsCache.value;
  const [votes, excluded] = await Promise.all([store.allVotes(), store.excludedVoters()]);
  const elo = computeElo(votes, { keys, excluded, start: ELO_START, k: ELO_K });
  const value = new Map([...elo.rows].map(([key, row]) => [key, row.elo]));
  ratingsCache = { at: Date.now(), id, value };
  return value;
}

/* ------------------------------------------------------------------ */
/* one voter                                                           */

export type VoterParts = {
  voter: VoterRecord;
  logos: LogoRecord[];
  votes: VoteRecord[];
  latest: LikesRecord | null;
  ratings: Map<string, number>;
};

export type VoterContext = {
  parts: VoterParts;
  active: LogoRecord[];
  keys: string[];
  /** an active logo's key by the alias the voter sent */
  keyOf: Map<string, string>;
  sched: Schedule;
  needsLikes: boolean;
  complete: boolean;
};

/** Everything a voter's state needs; null when the voter has no record or their email is no longer on the vote. */
export async function loadVoter(voterId: string): Promise<VoterParts | null> {
  const voter = await store.getVoter(voterId);
  if (!voter || !isAllowedEmail(voter.email, voteAllowList())) return null;
  const registry = await store.registry();
  const keys = activeOf(registry.logos).map((logo) => logo.key);
  const [votes, latest, ratings] = await Promise.all([
    store.voterVotes(voterId),
    store.latestLikes(voterId),
    scheduleRatings(keys),
  ]);
  return { voter, logos: registry.logos, votes, latest, ratings };
}

export function contextOf(parts: VoterParts): VoterContext {
  const active = activeOf(parts.logos);
  const keys = active.map((logo) => logo.key);
  const sched = schedule({ voterId: parts.voter.voterId, keys, votes: parts.votes, ratings: parts.ratings, appearances: APPEARANCES });
  const owesLikes = !sched.pair && needsLikes(parts.latest, keys);
  const keyOf = new Map(active.map((logo) => [aliasOf(logo.key), logo.key]));
  return { parts, active, keys, keyOf, sched, needsLikes: owesLikes, complete: !sched.pair && !owesLikes };
}

export function stateOf(ctx: VoterContext): VoteState {
  const shown = new Map(ctx.active.map((logo): [string, VoteLogo] => [logo.key, { key: aliasOf(logo.key), src: srcOf(logo) }]));
  const logo = (key: string): VoteLogo => shown.get(key) ?? { key: aliasOf(key), src: '' };
  const pair = ctx.sched.pair;
  return {
    voter: { email: ctx.parts.voter.email, domain: ctx.parts.voter.domain },
    pair: pair ? { left: logo(pair.left), right: logo(pair.right) } : null,
    progress: ctx.sched.progress,
    needsLikes: ctx.needsLikes,
    logos: voterOrder(ctx.parts.voter.voterId, ctx.keys).map(logo),
    likes: (ctx.parts.latest?.liked ?? []).filter((key) => shown.has(key)).map((key) => logo(key).key),
    complete: ctx.complete,
  };
}

export async function voterState(voterId: string): Promise<VoteState | null> {
  const parts = await loadVoter(voterId);
  return parts ? stateOf(contextOf(parts)) : null;
}

/* ------------------------------------------------------------------ */
/* results                                                             */

/**
 * The ranking over every counted voter, or only one domain's voters. For
 * anyone but the admin, a domain is listed and filterable only with
 * MIN_GROUP_VOTERS voters or more; null when the asked domain is not.
 */
export async function resultsView(domain: string | null, admin: boolean): Promise<Results | null> {
  const [registry, votes, excluded, voters, likes] = await Promise.all([
    store.registry(),
    store.allVotes(),
    store.excludedVoters(),
    store.allVoters(),
    store.allLatestLikes(),
  ]);
  const active = activeOf(registry.logos);
  const keys = active.map((logo) => logo.key);
  const activeSet = new Set(keys);
  /* a voter counts when they have a record and are not excluded */
  const counting = voters.filter((voter) => !excluded.has(voter.voterId));
  const allowed = new Set(counting.filter((voter) => !domain || voter.domain === domain).map((voter) => voter.voterId));
  const elo = computeElo(votes, { keys, voters: allowed, start: ELO_START, k: ELO_K });

  const took = new Set<string>();
  for (const vote of votes) if (activeSet.has(vote.winner) && activeSet.has(vote.loser)) took.add(vote.voterId);
  for (const voterId of likes.keys()) took.add(voterId);
  const byDomain = new Map<string, number>();
  for (const voter of counting) {
    if (took.has(voter.voterId)) byDomain.set(voter.domain, (byDomain.get(voter.domain) ?? 0) + 1);
  }
  const groups = [...byDomain].filter(([, count]) => admin || count >= MIN_GROUP_VOTERS);
  if (domain && !admin && !groups.some(([name]) => name === domain)) return null;

  const rows = active.map((logo) => {
    const row = elo.rows.get(logo.key) ?? { elo: ELO_START, wins: 0, losses: 0, games: 0 };
    let likedBy = 0;
    let seenBy = 0;
    for (const [voterId, record] of likes) {
      if (!allowed.has(voterId)) continue;
      if (record.liked.includes(logo.key)) likedBy += 1;
      if (record.seen.includes(logo.key)) seenBy += 1;
    }
    return {
      key: logo.key,
      name: logo.name,
      src: srcOf(logo),
      elo: Math.round(row.elo),
      rating: row.elo,
      wins: row.wins,
      losses: row.losses,
      games: row.games,
      likes: likedBy,
      likedBy,
      seenBy,
    };
  });
  rows.sort((a, b) => b.rating - a.rating || b.games - a.games || a.key.localeCompare(b.key));
  return {
    voters: [...allowed].filter((voterId) => took.has(voterId)).length,
    votes: elo.counted.length,
    domains: groups
      .map(([name, count]) => ({ domain: name, voters: count }))
      .sort((a, b) => b.voters - a.voters || a.domain.localeCompare(b.domain)),
    rows: rows.map(({ rating: _rating, ...row }) => row),
  };
}

/* ------------------------------------------------------------------ */
/* admin                                                               */

export async function adminView(): Promise<AdminData> {
  /* read past this instance's copy, so the panel shows a change another instance just made */
  const [registry, votes, excluded, voters, likes, links] = await Promise.all([
    store.registry(true),
    store.allVotes(),
    store.excludedVoters(),
    store.allVoters(),
    store.allLatestLikes(),
    store.deviceLinks(),
  ]);
  const active = activeOf(registry.logos);
  const keys = active.map((logo) => logo.key);
  /* the same voters the results count: a record of their own, not excluded */
  const known = new Set(voters.map((voter) => voter.voterId));
  const ranked = computeElo(votes, { keys, excluded, voters: known, start: ELO_START, k: ELO_K });
  /* a hidden logo shows what it scored before it was hidden */
  const everyone = computeElo(votes, { keys: registry.logos.map((logo) => logo.key), excluded, voters: known, start: ELO_START, k: ELO_K });

  const devicesOf = new Map<string, Set<string>>();
  const votersOn = new Map<string, Set<string>>();
  for (const { deviceId, voterId } of links) {
    if (!devicesOf.has(voterId)) devicesOf.set(voterId, new Set());
    devicesOf.get(voterId)?.add(deviceId);
    if (!votersOn.has(deviceId)) votersOn.set(deviceId, new Set());
    votersOn.get(deviceId)?.add(voterId);
  }
  const emailOf = new Map(voters.map((voter) => [voter.voterId, voter.email]));
  const votesBy = new Map<string, VoteRecord[]>();
  for (const vote of votes) {
    if (!votesBy.has(vote.voterId)) votesBy.set(vote.voterId, []);
    votesBy.get(vote.voterId)?.push(vote);
  }

  const rows: AdminVoter[] = voters.map((voter) => {
    const own = votesBy.get(voter.voterId) ?? [];
    const latest = likes.get(voter.voterId) ?? null;
    const finished = !schedule({ voterId: voter.voterId, keys, votes: own, appearances: APPEARANCES }).pair;
    const devices = [...(devicesOf.get(voter.voterId) ?? [])].sort();
    const shared = new Set<string>();
    for (const deviceId of devices) {
      for (const other of votersOn.get(deviceId) ?? []) {
        if (other !== voter.voterId) shared.add(emailOf.get(other) ?? other);
      }
    }
    const last = own.reduce((max, vote) => Math.max(max, vote.ts), 0);
    return {
      voterId: voter.voterId,
      email: voter.email,
      domain: voter.domain,
      createdAt: voter.createdAt,
      votes: own.length,
      complete: finished && !needsLikes(latest, keys),
      likes: latest?.liked ?? [],
      devices,
      sharesDeviceWith: [...shared].sort(),
      excluded: excluded.has(voter.voterId),
      lastVoteAt: last ? new Date(last).toISOString() : null,
    };
  });
  rows.sort((a, b) => (b.lastVoteAt ?? '').localeCompare(a.lastVoteAt ?? '') || a.email.localeCompare(b.email));

  return {
    logos: registry.logos.map((logo) => {
      const row = (logo.hidden ? everyone : ranked).rows.get(logo.key);
      return {
        key: logo.key,
        name: logo.name,
        src: srcOf(logo),
        hidden: logo.hidden,
        addedAt: logo.addedAt,
        order: logo.order,
        elo: Math.round(row?.elo ?? ELO_START),
        games: row?.games ?? 0,
      };
    }),
    voters: rows,
    matrix: ranked.matrix,
    totals: {
      voters: rows.length,
      complete: rows.filter((row) => row.complete).length,
      excluded: rows.filter((row) => row.excluded).length,
      votes: votes.length,
      counted: ranked.counted.length,
      logos: registry.logos.length,
      active: keys.length,
    },
  };
}

/* a cell a spreadsheet could read as a formula starts with a quote */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Every vote ever written, oldest first. */
export async function exportCsv(): Promise<string> {
  const [votes, voters, excluded] = await Promise.all([store.allVotes(), store.allVoters(), store.excludedVoters()]);
  const byId = new Map(voters.map((voter) => [voter.voterId, voter]));
  const ordered = [...votes].sort((a, b) => a.ts - b.ts || a.voterId.localeCompare(b.voterId));
  const bodies = await store.mapLimit(ordered, 16, (vote) => store.voteBody(vote.pathname));
  const lines = ['ts,email,domain,winner,loser,left,right,excluded'];
  ordered.forEach((vote, i) => {
    const body = bodies[i];
    const voter = byId.get(vote.voterId);
    lines.push(
      [
        new Date(vote.ts).toISOString(),
        voter?.email ?? vote.voterId,
        voter?.domain ?? '',
        vote.winner,
        vote.loser,
        body?.left ?? vote.winner,
        body?.right ?? vote.loser,
        excluded.has(vote.voterId) ? 'yes' : 'no',
      ]
        .map(csvCell)
        .join(',')
    );
  });
  return `${lines.join('\r\n')}\r\n`;
}
