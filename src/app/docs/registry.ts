/**
 * The docs registry — which repo documents the /docs route serves. Files
 * are read from the app root at build time (this app builds from its own
 * directory in the monorepo and from the repo root in the Prototemplate
 * mirror; both keep the same relative layout, and the ship loop rsyncs the
 * root docs alongside src/).
 */
export type DocEntry = {
  slug: string;
  file: string;
  title: string;
  blurb: string;
};

export const DOCS: readonly DocEntry[] = [
  {
    slug: 'brand',
    file: 'BRAND.md',
    title: 'The brand',
    blurb:
      'The identity canon: the name, the idea, the character and voice, the mark, color, type, language as material, and the Dossier as the completed reference.',
  },
  {
    slug: 'design',
    file: 'DESIGN.md',
    title: 'The design system',
    blurb:
      'The canon: the four-color system, the line law, rails and seams, the doubled line, iso, the 1-bit language, moving type, motion discipline.',
  },
  {
    slug: 'architecture',
    file: 'ARCHITECTURE.md',
    title: 'Architecture',
    blurb:
      'The code map: the direction registry, the toolchain SSOT and fork rescoping, the componentized instruments, the mirror.',
  },
  {
    slug: 'ship-loop',
    file: 'docs/SHIP-LOOP.md',
    title: 'The ship loop',
    blurb:
      'The verify-and-ship procedure every round runs: the line audit, the practices ratchet, types, filming, the backup branch, the mirror build.',
  },
  {
    slug: 'libraries',
    file: 'docs/LIBRARIES.md',
    title: 'The libraries',
    blurb:
      'The index of the componentized instruments — the living version, with plates running, is the craft page.',
  },
] as const;

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}
