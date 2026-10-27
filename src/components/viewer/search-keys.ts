'use client';

import { createContext } from 'react';

/**
 * Whether a Search answers openSearch(): true for the page's own palette,
 * false inside a plate's small shell (DemoViewport), which opens its
 * palette from its own button and its own keys, so the page's Cmd K opens
 * one palette.
 */
export const SearchKeysContext = createContext(true);
