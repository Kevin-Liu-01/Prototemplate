#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes src/lib/previous-mark.json from the logo manifest's history
 * (scripts/lint/logo.json): the films that end on the previous mark, the
 * films that end on the logo but show captures from before it, and the
 * pictures under public/ that show it, as manifest paths. src/lib/previous-mark.ts
 * reads it, so every page and client component that shows such a picture
 * labels it without loading the manifest. Run it after any change to the
 * manifest's history; pnpm lint:logo fails while the file is stale.
 *
 * Usage:
 *   node scripts/build/previous-mark.mjs   (pnpm build:previous-mark)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { PREVIOUS_MARK, previousMarkLists, previousMarkText, readManifest } from '../lib/logo-lock.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const manifest = readManifest(ROOT);
writeFileSync(join(ROOT, PREVIOUS_MARK), previousMarkText(manifest));
const { films, filmCaptures, pictures } = previousMarkLists(manifest);
console.log(`build:previous-mark: ${PREVIOUS_MARK}: ${films.length} films that end on the previous mark, ${filmCaptures.length} with captures from before it, ${pictures.length} pictures`);
