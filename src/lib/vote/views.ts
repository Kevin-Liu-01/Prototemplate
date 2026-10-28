/* The answers the vote API builds from the store: the hub, a voter's state
   in one decision, the results, the admin's list and panel, and the CSV
   export. Every per-decision read re-checks the voter's access. Voters see
   a mark or image option by an opaque id (its alias, per decision), never
   by its key, because a key can name the option and the matchups are
   blind; a text option is its words, so it shows its name. */
import { CACHE_MS, defaultAccess, ELO_K, ELO_START, MIN_GROUP_VOTERS, namespace, optionSrc } from './config';
import { canOpen, headOf, newOptions, resultsOpen, visibleDecisions, visibleGroups, votingOpen } from './decisions';
import { computeElo } from './elo';
import { isAllowedEmail, optionAlias } from './identity';
import { schedule, standing, voterOrder } from './schedule';
import * as store from './store';

import type { Schedule } from './schedule';
import type { LikesRecord, OptionRecord, VoteRecord, VoterRecord } from './store';
import type {
  AdminData,
  AdminDecisionRow,
  AdminList,
  AdminVoter,
  DecisionMeta,
  HubRow,
  HubState,
  Results,
  VoteOption,
  VoteState,
} from './types';

export const EMPTY_HUB: HubState = { voter: null, decisions: [] };

/** An option voters can see: not hidden, and a mark or image needs its file. */
export function isActive(meta: DecisionMeta, option: OptionRecord): boolean {
  return !option.hidden && (meta.kind === 'text' || option.file !== null);
}

function activeOf(meta: DecisionMeta, options: OptionRecord[]): OptionRecord[] {
  return options.filter((option) => isActive(meta, option));
}

/** The opaque id an option's file address and a voter's state carry; route() has checked the secret is set. */
export function aliasOf(decisionId: string, key: string): string {
  return optionAlias(process.env.VOTE_SECRET ?? '', decisionId, key);
}

/** A decision's options by their alias. */
export function byAlias(decisionId: string, options: readonly OptionRecord[]): Map<string, OptionRecord> {
  return new Map(options.map((option) => [aliasOf(decisionId, option.key), option]));
}

function srcOf(decisionId: string, option: OptionRecord): string {
  return option.file ? optionSrc(decisionId, aliasOf(decisionId, option.key), option.version) : '';
}

function voteOption(meta: DecisionMeta, option: OptionRecord): VoteOption {
  const key = aliasOf(meta.id, option.key);
  return meta.kind === 'text' ? { key, src: '', name: option.name, text: option.text } : { key, src: srcOf(meta.id, option) };
}

/* the global ratings only break ties in the schedule, so a short-lived copy per decision per instance is enough */
const ratingsCache = new Map<string, { at: number; keys: string; value: Map<string, number> }>();

async function scheduleRatings(decisionId: string, keys: string[]): Promise<Map<string, number>> {
  const slot = `${namespace()}:${decisionId}`;
  const joined = keys.join(',');
  const cached = ratingsCache.get(slot);
  if (cached && cached.keys === joined && Date.now() - cached.at < CACHE_MS) return cached.value;
  const [votes, excluded] = await Promise.all([store.allVotes(decisionId), store.excludedVoters()]);
  const elo = computeElo(votes, { keys, excluded, start: ELO_START, k: ELO_K });
  const value = new Map([...elo.rows].map(([key, row]) => [key, row.elo]));
  ratingsCache.set(slot, { at: Date.now(), keys: joined, value });
  return value;
}

/* ------------------------------------------------------------------ */
/* one voter in one decision                                           */

export type VoterParts = {
  voter: VoterRecord;
  meta: DecisionMeta;
  options: OptionRecord[];
  votes: VoteRecord[];
  latest: LikesRecord | null;
  ratings: Map<string, number>;
  admin: boolean;
};

export type VoterContext = {
  parts: VoterParts;
  active: OptionRecord[];
  keys: string[];
  /** an active option's key by the alias the voter sent */
  keyOf: Map<string, string>;
  sched: Schedule;
  needsLikes: boolean;
  complete: boolean;
  /** the options added since the voter finished */
  fresh: string[];
};

/** Whether this voter may open this decision: the admin always, else its status and access list. */
export function mayOpen(meta: DecisionMeta, voter: VoterRecord, admin: boolean): boolean {
  return canOpen(meta.status, isAllowedEmail(voter.email, meta.access), admin);
}

/**
 * Everything a voter's state in one decision needs; null when the voter
 * has no record, the decision does not exist, or it does not open for
 * them (a draft, archived, or their email is not on its list). The status
 * decides whether a vote is taken, so a decision this instance lists has
 * its meta read again past the instance's copy: a decision the admin just
 * closed takes no vote on any instance.
 */
export async function loadVoter(voterId: string, decisionId: string, admin = false): Promise<VoterParts | null> {
  const [voter, listed] = await Promise.all([store.getVoter(voterId), store.decision(decisionId)]);
  const meta = listed ? await store.decision(decisionId, true) : null;
  if (!voter || !meta || !mayOpen(meta, voter, admin)) return null;
  const registry = await store.registry(decisionId);
  const keys = activeOf(meta, registry.options).map((option) => option.key);
  const [votes, latest, ratings] = await Promise.all([
    store.voterVotes(decisionId, voterId),
    meta.likes ? store.latestLikes(decisionId, voterId) : Promise.resolve(null),
    scheduleRatings(decisionId, keys),
  ]);
  return { voter, meta, options: registry.options, votes, latest, ratings, admin };
}

export function contextOf(parts: VoterParts): VoterContext {
  const { meta } = parts;
  const active = activeOf(meta, parts.options);
  const keys = active.map((option) => option.key);
  const sched = schedule({
    voterId: parts.voter.voterId,
    keys,
    votes: parts.votes,
    ratings: parts.ratings,
    appearances: meta.appearances,
  });
  const stand = standing({ sched, keys, latest: parts.latest, likes: meta.likes });
  const keyOf = new Map(active.map((option) => [aliasOf(meta.id, option.key), option.key]));
  const fresh = newOptions({
    keys,
    addedAt: new Map(active.map((option) => [option.key, option.addedAt])),
    lastVoteAt: parts.votes.reduce((max, vote) => Math.max(max, vote.ts), 0),
    latestSeen: parts.latest?.seen ?? null,
    likes: meta.likes,
    finishedAmong: (old) =>
      schedule({ voterId: parts.voter.voterId, keys: old, votes: parts.votes, appearances: meta.appearances }).pair === null,
  });
  return { parts, active, keys, keyOf, sched, needsLikes: stand.needsLikes, complete: stand.complete, fresh };
}

export function stateOf(ctx: VoterContext): VoteState {
  const { meta, voter } = ctx.parts;
  const shown = new Map(ctx.active.map((option): [string, VoteOption] => [option.key, voteOption(meta, option)]));
  const option = (key: string): VoteOption => shown.get(key) ?? { key: aliasOf(meta.id, key), src: '' };
  const open = votingOpen(meta.status);
  const pair = open ? ctx.sched.pair : null;
  return {
    voter: { email: voter.email, domain: voter.domain },
    decision: headOf(meta),
    pair: pair ? { left: option(pair.left), right: option(pair.right) } : null,
    progress: ctx.sched.progress,
    needsLikes: open && ctx.needsLikes,
    options: voterOrder(voter.voterId, ctx.keys).map(option),
    likes: (ctx.parts.latest?.liked ?? []).filter((key) => shown.has(key)).map((key) => option(key).key),
    complete: ctx.complete,
    results: resultsOpen(meta.status, ctx.complete, ctx.parts.admin),
  };
}

export async function voterState(voterId: string, decisionId: string, admin = false): Promise<VoteState | null> {
  const parts = await loadVoter(voterId, decisionId, admin);
  return parts ? stateOf(contextOf(parts)) : null;
}

/* ------------------------------------------------------------------ */
/* the hub                                                             */

/** The decisions an email may see: open or closed, with the email on the list. */
export function visibleTo(email: string, metas: readonly DecisionMeta[]): DecisionMeta[] {
  return visibleDecisions(metas, (access) => isAllowedEmail(email, access));
}

function hubRow(ctx: VoterContext): HubRow {
  const { meta } = ctx.parts;
  return {
    ...headOf(meta),
    progress: ctx.sched.progress,
    complete: ctx.complete,
    fresh: votingOpen(meta.status) ? ctx.fresh.length : 0,
    results: resultsOpen(meta.status, ctx.complete, false),
  };
}

/** The voter and every decision they may see, with their progress in each; null when the voter has no record. */
export async function hubView(voterId: string, fresh = false): Promise<HubState | null> {
  const [voter, metas] = await Promise.all([store.getVoter(voterId), store.decisions(fresh)]);
  if (!voter) return null;
  const rows = await store.mapLimit(visibleTo(voter.email, metas), 4, async (meta) => {
    const registry = await store.registry(meta.id);
    const [votes, latest] = await Promise.all([
      store.voterVotes(meta.id, voterId),
      meta.likes ? store.latestLikes(meta.id, voterId) : Promise.resolve(null),
    ]);
    /* the hub shows progress only, and the ratings never change the total, so they are not read */
    return hubRow(contextOf({ voter, meta, options: registry.options, votes, latest, ratings: new Map(), admin: false }));
  });
  return { voter: { email: voter.email, domain: voter.domain }, decisions: rows };
}

/* ------------------------------------------------------------------ */
/* results                                                             */

/**
 * Whether a reader may open a decision's results: 'missing' when it does
 * not exist or does not open for them, 'denied' until a voter finishes an
 * open decision, 'ok' otherwise.
 */
export async function resultsAccess(voterId: string | null, decisionId: string, admin: boolean): Promise<'ok' | 'denied' | 'missing'> {
  if (admin) return (await store.decision(decisionId)) ? 'ok' : 'missing';
  if (!voterId) return 'denied';
  const parts = await loadVoter(voterId, decisionId);
  if (!parts) return 'missing';
  return resultsOpen(parts.meta.status, contextOf(parts).complete, false) ? 'ok' : 'denied';
}

/**
 * One decision's ranking over every counted voter, or only one domain's
 * voters. For anyone but the admin, a domain is listed and filterable only
 * as visibleGroups allows (MIN_GROUP_VOTERS or more, and no smaller rest
 * that All minus the groups would show); null when the decision is gone or
 * the asked domain is not listed.
 */
export async function resultsView(decisionId: string, domain: string | null, admin: boolean): Promise<Results | null> {
  const meta = await store.decision(decisionId, admin);
  if (!meta) return null;
  const [registry, votes, excluded, voters, likes] = await Promise.all([
    store.registry(decisionId, admin),
    store.allVotes(decisionId),
    store.excludedVoters(),
    store.allVoters(),
    meta.likes ? store.allLatestLikes(decisionId) : Promise.resolve(new Map<string, LikesRecord>()),
  ]);
  const active = activeOf(meta, registry.options);
  const keys = active.map((option) => option.key);
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
  const groups = visibleGroups(byDomain, admin, MIN_GROUP_VOTERS);
  if (domain && !admin && !groups.some(([name]) => name === domain)) return null;

  const rows = active.map((option) => {
    const row = elo.rows.get(option.key) ?? { elo: ELO_START, wins: 0, losses: 0, games: 0 };
    let likedBy = 0;
    let seenBy = 0;
    for (const [voterId, record] of likes) {
      if (!allowed.has(voterId)) continue;
      if (record.liked.includes(option.key)) likedBy += 1;
      if (record.seen.includes(option.key)) seenBy += 1;
    }
    return {
      key: admin ? option.key : aliasOf(meta.id, option.key),
      name: option.name,
      text: meta.kind === 'text' ? option.text : '',
      src: srcOf(meta.id, option),
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
    decision: headOf(meta),
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

/** Every decision, any status, with its counts; read past this instance's copy. */
export async function adminList(): Promise<AdminList> {
  const metas = await store.decisions(true);
  const rows = await store.mapLimit(metas, 4, async (meta): Promise<AdminDecisionRow> => {
    const [registry, votes, likes] = await Promise.all([
      store.registry(meta.id, true),
      store.allVotes(meta.id),
      store.allLatestLikes(meta.id),
    ]);
    const voters = new Set([...votes.map((vote) => vote.voterId), ...likes.keys()]);
    return {
      ...meta,
      options: registry.options.length,
      active: activeOf(meta, registry.options).length,
      voters: voters.size,
      votes: votes.length,
    };
  });
  return { decisions: rows, defaultAccess: defaultAccess() };
}

/**
 * One decision's options, voters and head-to-head counts for the admin;
 * null when it does not exist. The voters are everyone on its access list
 * and everyone who voted or liked in it.
 */
export async function adminView(decisionId: string): Promise<AdminData | null> {
  /* read past this instance's copy, so the panel shows a change another instance just made */
  const meta = await store.decision(decisionId, true);
  if (!meta) return null;
  const [registry, votes, excluded, everyVoter, likes, links] = await Promise.all([
    store.registry(decisionId, true),
    store.allVotes(decisionId),
    store.excludedVoters(),
    store.allVoters(),
    store.allLatestLikes(decisionId),
    store.deviceLinks(),
  ]);
  const active = activeOf(meta, registry.options);
  const keys = active.map((option) => option.key);
  /* the same voters the results count: a record of their own, not excluded */
  const known = new Set(everyVoter.map((voter) => voter.voterId));
  const ranked = computeElo(votes, { keys, excluded, voters: known, start: ELO_START, k: ELO_K });
  /* a hidden option shows what it scored before it was hidden */
  const everyone = computeElo(votes, {
    keys: registry.options.map((option) => option.key),
    excluded,
    voters: known,
    start: ELO_START,
    k: ELO_K,
  });

  const devicesOf = new Map<string, Set<string>>();
  const votersOn = new Map<string, Set<string>>();
  for (const { deviceId, voterId } of links) {
    if (!devicesOf.has(voterId)) devicesOf.set(voterId, new Set());
    devicesOf.get(voterId)?.add(deviceId);
    if (!votersOn.has(deviceId)) votersOn.set(deviceId, new Set());
    votersOn.get(deviceId)?.add(voterId);
  }
  const emailOf = new Map(everyVoter.map((voter) => [voter.voterId, voter.email]));
  const votesBy = new Map<string, VoteRecord[]>();
  for (const vote of votes) {
    if (!votesBy.has(vote.voterId)) votesBy.set(vote.voterId, []);
    votesBy.get(vote.voterId)?.push(vote);
  }
  const voters = everyVoter.filter(
    (voter) => isAllowedEmail(voter.email, meta.access) || votesBy.has(voter.voterId) || likes.has(voter.voterId)
  );

  const rows: AdminVoter[] = voters.map((voter) => {
    const own = votesBy.get(voter.voterId) ?? [];
    const latest = likes.get(voter.voterId) ?? null;
    const sched = schedule({ voterId: voter.voterId, keys, votes: own, appearances: meta.appearances });
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
      access: isAllowedEmail(voter.email, meta.access),
      votes: own.length,
      complete: standing({ sched, keys, latest, likes: meta.likes }).complete,
      likes: latest?.liked ?? [],
      devices,
      sharesDeviceWith: [...shared].sort(),
      excluded: excluded.has(voter.voterId),
      lastVoteAt: last ? new Date(last).toISOString() : null,
    };
  });
  rows.sort((a, b) => (b.lastVoteAt ?? '').localeCompare(a.lastVoteAt ?? '') || a.email.localeCompare(b.email));

  return {
    decision: meta,
    options: registry.options.map((option) => {
      const row = (option.hidden ? everyone : ranked).rows.get(option.key);
      return {
        key: option.key,
        name: option.name,
        text: option.text,
        src: srcOf(meta.id, option),
        hidden: option.hidden,
        missing: meta.kind !== 'text' && option.file === null,
        addedAt: option.addedAt,
        order: option.order,
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
      options: registry.options.length,
      active: keys.length,
    },
  };
}

/* a cell a spreadsheet could read as a formula starts with a quote */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Every vote ever written in one decision, oldest first; null when it does not exist. */
export async function exportCsv(decisionId: string): Promise<string | null> {
  if (!(await store.decision(decisionId, true))) return null;
  const [votes, voters, excluded] = await Promise.all([store.allVotes(decisionId), store.allVoters(), store.excludedVoters()]);
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
