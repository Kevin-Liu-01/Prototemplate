import { useMountEffect } from '@/lib/use-mount-effect';

/* the server reads this tab has painted, by their read time */
const painted = new Set<number>();

/**
 * Reads a screen's data again when its page is shown from the router's
 * cache: browser Back and Forward reuse a page's first server read, which
 * can hold a step the voter has since left. The first paint of a read
 * fetches nothing. `at` is the read's time (server.ts).
 */
export function useReread(at: number, reread: () => void): void {
  useMountEffect(() => {
    if (painted.has(at)) reread();
    else painted.add(at);
  });
}
