/**
 * What a vote page's server read for the first paint (server.ts). 'off' is
 * a deployment without the store or a secret, where the API answers 503;
 * 'error' is a read that failed. `at` is when the server read it, which
 * tells a fresh paint from one the router replays (useReread). The data
 * shapes are the API's own, in src/lib/vote/types.ts.
 */
export type Boot<T> = { kind: 'ready'; data: T; at: number } | { kind: 'off' } | { kind: 'error' };
