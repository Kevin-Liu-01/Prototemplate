'use client';

import { usePathname } from 'next/navigation';

/**
 * The current final's own route prefix. The company sections are mounted by
 * several concepts (dossier, signal, orbit), so every internal link has to
 * resolve against the one the reader is actually in — the same resolution
 * TopNav does, spelled once so a section never hardcodes /d/singularity-*.
 */
export function useConceptBase(): string {
  const pathname = usePathname();
  return pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';
}
