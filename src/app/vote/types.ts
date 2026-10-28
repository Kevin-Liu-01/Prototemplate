/**
 * What a vote page's server read for the first paint (server.ts). 'off' is
 * a deployment without the store or a secret, where the API answers 503;
 * 'error' is a read that failed. The data shapes are the API's own, in
 * src/lib/vote/types.ts.
 */
export type Boot<T> = { kind: 'ready'; data: T } | { kind: 'off' } | { kind: 'error' };
