/* What a voter may change once they have voted in one decision: the
   winner of a matchup they voted on, while the decision is open, up to
   MAX_CASTS votes on one pair; and their likes, once the new set differs
   from their latest record, up to MAX_LIKES records. A change is a new
   vote or a new likes record; the latest counts (elo.dedupeVotes,
   store.latestLikes). Self-contained, so node --test loads it directly. */

/** The most votes one voter casts on one pair: the first and nine changes. */
export const MAX_CASTS = 10;

/** The most likes records one voter writes in one decision before a change of likes is refused; a record a new option owes is always taken. */
export const MAX_LIKES = 10;

export type ChangeInput = {
  /** the decision takes votes */
  open: boolean;
  /** the two options sent, as active keys; undefined for an alias that names no active option */
  left: string | undefined;
  right: string | undefined;
  /** the side the voter picks now */
  pick: 'left' | 'right';
  /** the winner of the voter's counted vote on this pair; null when they have none */
  counted: string | null;
  /** how many votes the voter has cast on this pair */
  casts: number;
};

/** The vote a change writes (its sides as sent), or the sentence that refuses it (a 409). */
export type ChangeCheck = { ok: true; left: string; right: string; winner: string; loser: string } | { ok: false; error: string };

export function checkChange(input: ChangeInput): ChangeCheck {
  const { left, right } = input;
  if (!input.open) return { ok: false, error: 'This vote is not open.' };
  if (!left || !right || left === right) return { ok: false, error: 'That pair is no longer open.' };
  if (input.counted === null) return { ok: false, error: 'You have not voted on this pair.' };
  const winner = input.pick === 'left' ? left : right;
  if (winner === input.counted) return { ok: false, error: 'That is already your vote.' };
  if (input.casts >= MAX_CASTS) return { ok: false, error: 'This pair takes no more changes.' };
  return { ok: true, left, right, winner, loser: winner === left ? right : left };
}

export type LikesInput = {
  /** the active options the voter likes now, by key */
  liked: readonly string[];
  /** every active option */
  keys: readonly string[];
  latest: { liked: readonly string[]; seen: readonly string[] } | null;
  /** the voter owes the likes step: their latest record has not seen every active option */
  owes: boolean;
  /** how many likes records the voter has written in this decision */
  records: number;
};

/** The record a likes post writes, or the sentence that refuses it. */
export type LikesCheck =
  | { ok: true; liked: string[]; seen: string[] }
  | { ok: false; status: 400 | 409; error: string };

/**
 * A voter who owes the likes step sends their likes; one who does not may
 * send them again once the set differs from their latest record, while
 * they have written fewer than MAX_LIKES records. The new record has seen
 * every active option, and keeps what the latest one held for options
 * outside the active set (hidden ones), so showing an option again
 * restores the voter's pick on it.
 */
export function checkLikes(input: LikesInput): LikesCheck {
  const active = new Set(input.keys);
  const liked = [...new Set(input.liked)].filter((key) => active.has(key));
  if (!liked.length) return { ok: false, status: 400, error: 'Pick at least one you like.' };
  const before = (input.latest?.liked ?? []).filter((key) => active.has(key));
  const same = before.length === liked.length && liked.every((key) => before.includes(key));
  if (!input.owes && input.latest && same) return { ok: false, status: 409, error: 'Your likes are in.' };
  if (!input.owes && input.latest && input.records >= MAX_LIKES) return { ok: false, status: 409, error: 'Your likes take no more changes.' };
  const kept = (keys: readonly string[] | undefined) => (keys ?? []).filter((key) => !active.has(key));
  return {
    ok: true,
    liked: [...liked, ...new Set(kept(input.latest?.liked))],
    seen: [...input.keys, ...new Set(kept(input.latest?.seen))],
  };
}
