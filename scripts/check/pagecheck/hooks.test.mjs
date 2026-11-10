// Tests for the page check's console allow list (scripts/check/pagecheck/hooks.mjs): a hydration error is counted and the dev server's notices are not.
//
// Usage: pnpm test:pagecheck (node --test scripts/check/pagecheck/hooks.test.mjs)
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { CONSOLE_ALLOW } from './hooks.mjs';

/** Messages a page produces. Each must stay a defect. */
const COUNTED = [
  "Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client.",
  "Hydration failed because the server rendered text didn't match the client.",
  "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up.",
  'Warning: Text content did not match. Server: "a" Client: "b"',
  'Warning: Extra attributes from the server: data-example',
  'pageerror: Error: Minified React error #418',
  'http 500: http://localhost:3005/brand',
];

/** Messages the environment produces. */
const ALLOWED = [
  'Download the React DevTools for a better development experience: https://react.dev/link/react-devtools',
  '[Fast Refresh] rebuilding',
];

describe('CONSOLE_ALLOW', () => {
  for (const message of COUNTED) {
    test(`counts: ${message.slice(0, 60)}`, () => assert.equal(CONSOLE_ALLOW.test(message), false));
  }
  for (const message of ALLOWED) {
    test(`allows: ${message.slice(0, 60)}`, () => assert.equal(CONSOLE_ALLOW.test(message), true));
  }
});
