import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and while the page hydrates, true once its handlers
 * are attached. A form's submit button waits for it, so a press before then
 * never sends the form's fields anywhere.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
