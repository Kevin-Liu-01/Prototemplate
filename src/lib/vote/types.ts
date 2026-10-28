/* The JSON the vote API answers, shared by the route handlers and the pages. */

/** A mark as a voter sees it: no name until the results. */
export type VoteLogo = { key: string; src: string };

export type VoteState = {
  voter: { email: string; domain: string } | null;
  pair: { left: VoteLogo; right: VoteLogo } | null;
  progress: { done: number; total: number };
  needsLikes: boolean;
  logos: VoteLogo[];
  likes: string[];
  complete: boolean;
};

export type ResultRow = {
  key: string;
  name: string;
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
  voters: number;
  votes: number;
  domains: { domain: string; voters: number }[];
  rows: ResultRow[];
};

export type AdminLogo = {
  key: string;
  name: string;
  src: string;
  hidden: boolean;
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
  votes: number;
  complete: boolean;
  likes: string[];
  devices: string[];
  sharesDeviceWith: string[];
  excluded: boolean;
  lastVoteAt: string | null;
};

export type AdminData = {
  logos: AdminLogo[];
  voters: AdminVoter[];
  matrix: { keys: string[]; wins: number[][] };
  totals: {
    voters: number;
    complete: number;
    excluded: number;
    votes: number;
    counted: number;
    logos: number;
    active: number;
  };
};

export type ApiError = { error: string };
