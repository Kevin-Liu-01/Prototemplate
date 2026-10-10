/**
 * The docs registry: which repository documents the /docs route serves,
 * after the readme. Files are read from the repository root at build time.
 * The handbook's documents have their own registry
 * (src/app/handbook/registry.ts) and route.
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
    title: 'Brand',
    blurb:
      'The identity canon: the name, the idea, the character and voice, the mark, color, type, language as material, and where the identity ships.',
  },
  {
    slug: 'design',
    file: 'DESIGN.md',
    title: 'Design system',
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
    title: 'Ship loop',
    blurb:
      'The verify-and-ship procedure every round runs: the line audit, the page check, the ratchets, types, captures, the backup branch and the gated push to main.',
  },
  {
    slug: 'libraries',
    file: 'docs/LIBRARIES.md',
    title: 'Libraries',
    blurb:
      'The index of the componentized instruments. The living version, with plates running, is the build log under the readme.',
  },
  {
    slug: 'graphics',
    file: 'docs/GRAPHICS.md',
    title: 'Graphics pipeline',
    blurb:
      'How the blog illustrations are made with the toolchain in graphics/: captures at 3 to 5x, labelled crops on glyphfield exports, the sizing rules, clips, export and hand-off to a post.',
  },
  {
    slug: 'artifact-pictures',
    file: 'docs/ARTIFACT-PICTURES.md',
    title: 'Artifact pictures',
    blurb:
      'The standard for the dithered photographs on the plate, the deck and the docs: the rules, the tone grid and screen of the Blue Marble, the cutter, adding a picture and the lint that holds them.',
  },
  {
    slug: 'tools',
    file: 'docs/TOOLS.md',
    title: 'Tools',
    blurb:
      'Every pnpm command in the repository and the scripts the skills bundle, each with what it does, and the environment the tools read. Written by pnpm build:tools.',
  },
  {
    slug: 'agents',
    file: 'AGENTS.md',
    title: 'Agent guide',
    blurb:
      'The entry point for an agent: the read order, the principles in brief, which skill to load for a task, the handbook, the house rules, and how to use the hub in another project.',
  },
] as const;

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}
