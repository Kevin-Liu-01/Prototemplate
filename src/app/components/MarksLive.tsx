'use client';

import { useState } from 'react';

import { MarksPlate } from '@/components/docs/demos/lazy';
import type { MarkEntry } from '@/components/docs/demos/MarksPlate';
import { useMountEffect } from '@/lib/use-mount-effect';

/** Where the marks picker's entries are served, prerendered from public/marks (marks.json/route.ts). */
const ENTRIES = '/components/marks.json';

/**
 * MarksDemo on /components: the same client plate with the same entries,
 * which its row fetches when it mounts instead of the page carrying every
 * mark inline. Until they arrive it renders nothing, and the row holds its
 * reserved height.
 */
export default function MarksLive() {
  const [entries, setEntries] = useState<readonly MarkEntry[] | null>(null);
  useMountEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(ENTRIES, { signal: controller.signal });
        if (!response.ok) return;
        const body = (await response.json()) as { entries: MarkEntry[] };
        setEntries(body.entries);
      } catch {
        /* an aborted or failed load leaves the row at its reserved height */
      }
    };
    void load();
    return () => controller.abort();
  });
  return entries ? <MarksPlate entries={entries} /> : null;
}
