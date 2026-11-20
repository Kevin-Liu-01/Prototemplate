/**
 * The /raise names the server model (model.ts) and the client viewers
 * share. Pure, with no imports, so a client component that reads them never
 * bundles the store reader in src/lib/raise.ts.
 */

/** The shell section ids, prefixed so none names a site map group and each fold state is this page's. */
export const SECTION = { finals: 'raise-finals', history: 'raise-history', rounds: 'raise-rounds', method: 'raise-method' } as const;

export const SECTION_LABEL = { finals: 'Finals', history: 'History', rounds: 'Rounds', method: 'Method' } as const;

/** A round's row id on the index and its item id in the list. */
export function roundId(slug: string): string {
  return `round-${slug}`;
}

export const METHOD_ID = 'method';

const STATE_WORDS: Readonly<Record<string, string>> = { done: 'Done', stopped: 'Stopped', 'in-progress': 'In progress' };

/** A round's state as a word. */
export function stateWord(state: string): string {
  return STATE_WORDS[state] ?? state;
}
