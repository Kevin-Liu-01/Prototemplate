/* The JSON the vote API answers, shared by the route handlers and the pages.
   A decision is one pairwise vote between options. */

export type DecisionKind = 'mark' | 'image' | 'text';
export type DecisionStatus = 'draft' | 'open' | 'closed' | 'archived';

/** A decision's settings, as meta.json stores them. */
export type DecisionMeta = {
  id: string;
  title: string;
  /** one line under the title; empty when unset */
  question: string;
  kind: DecisionKind;
  status: DecisionStatus;
  /** exact emails and '@domain' entries; ['*'] lets any email in */
  access: string[];
  /** matchups per option per voter, capped at the other options */
  appearances: number;
  /** whether a voter picks every option they like after the matchups */
  likes: boolean;
  createdAt: string;
  order: number;
};

/** What a voter sees of a decision. */
export type DecisionHead = {
  id: string;
  title: string;
  question: string;
  kind: DecisionKind;
  status: DecisionStatus;
  likes: boolean;
};

/**
 * An option as a voter sees it. A mark or image is blind: an opaque key and
 * its file address, no name until the results. A text option is its words,
 * so it carries its name and text and no file.
 */
export type VoteOption = { key: string; src: string; name?: string; text?: string };

export type Voter = { email: string; domain: string };

/** One decision on the hub, for the signed-in voter. */
export type HubRow = DecisionHead & {
  progress: { done: number; total: number };
  /** matchups and likes are done */
  complete: boolean;
  /** options added since the voter finished; 0 otherwise */
  fresh: number;
  /** the voter may open the results */
  results: boolean;
};

/** The hub: the voter and the decisions they can see (open and closed). */
export type HubState = { voter: Voter | null; decisions: HubRow[] };

export type VoteState = {
  voter: Voter;
  decision: DecisionHead;
  /** null when the matchups are done or the decision is closed */
  pair: { left: VoteOption; right: VoteOption } | null;
  progress: { done: number; total: number };
  needsLikes: boolean;
  /** every active option, in this voter's own order */
  options: VoteOption[];
  /** the keys of the options the voter last liked */
  likes: string[];
  complete: boolean;
  /** the voter may open the results */
  results: boolean;
};

export type ResultRow = {
  key: string;
  name: string;
  /** a text option's text; empty otherwise */
  text: string;
  /** empty for a text option */
  src: string;
  elo: number;
  wins: number;
  losses: number;
  games: number;
  /** the same count as likedBy */
  likes: number;
  likedBy: number;
  seenBy: number;
};

export type Results = {
  decision: DecisionHead;
  voters: number;
  votes: number;
  domains: { domain: string; voters: number }[];
  rows: ResultRow[];
};

/* ------------------------------------------------------------------ */
/* admin                                                               */

export type AdminDecisionRow = DecisionMeta & {
  options: number;
  active: number;
  voters: number;
  votes: number;
};

export type AdminList = {
  decisions: AdminDecisionRow[];
  /** the access list a new decision starts with */
  defaultAccess: string[];
};

export type AdminOption = {
  key: string;
  name: string;
  text: string;
  /** empty for a text option, or a mark or image whose file is missing */
  src: string;
  hidden: boolean;
  /** a mark or image option with no file: Replace adds one */
  missing: boolean;
  addedAt: string;
  order: number;
  elo: number;
  games: number;
};

export type AdminVoter = {
  voterId: string;
  email: string;
  domain: string;
  createdAt: string;
  /** the voter's email is on this decision's access list */
  access: boolean;
  votes: number;
  complete: boolean;
  /** the keys of the options the voter last liked */
  likes: string[];
  devices: string[];
  sharesDeviceWith: string[];
  /** global: an excluded voter counts in no decision */
  excluded: boolean;
  lastVoteAt: string | null;
};

export type AdminData = {
  decision: DecisionMeta;
  options: AdminOption[];
  voters: AdminVoter[];
  matrix: { keys: string[]; wins: number[][] };
  totals: {
    voters: number;
    complete: number;
    excluded: number;
    votes: number;
    counted: number;
    options: number;
    active: number;
  };
};

/** POST /api/vote/admin/d/[id]/options answers the keys it added. */
export type AddedOptions = { ok: true; added: { key: string; name: string }[] };

/** problems: one line per refused file or line of a bulk add. */
export type ApiError = { error: string; problems?: { name: string; error: string }[] };
