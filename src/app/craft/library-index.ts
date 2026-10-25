/**
 * The libraries by name and role, in the order the build log shows them:
 * the one list the index panel's rows read (src/lib/surfaces.ts), kept
 * apart from libraries.ts so the panel ships these lines and not every
 * entry's prose and code sample.
 */
export const LIBRARY_INDEX = [
  { name: 'horizon-field', role: 'the singularity visual' },
  { name: 'glyph-field', role: 'the glyph rain visual' },
  { name: 'ink-field', role: 'the band margins’ rising rain' },
  { name: 'prismatic-field', role: 'the chroma wash' },
  { name: 'dither', role: 'the 1-bit Bayer renderer' },
  { name: 'studio-field', role: 'the authentic Bayer family' },
  { name: 'iso', role: 'the isometric drawing kit' },
  { name: 'doubled-line', role: 'the two-thread diagram stroke' },
  { name: 'edge-globe', role: 'the delivery drawing' },
  { name: 'locale-tag', role: 'the locale pill' },
  { name: 'reveal-seam', role: 'the slide-to-reveal instrument' },
  { name: 'glyph-reassembler', role: 'the sentence-rewriting morph' },
  { name: 'locale-belt', role: 'the marquee that drives the page' },
  { name: 'nameplate-take', role: 'the landing hero’s morph' },
  { name: 'stack-story', role: 'the scroll-scrubbed stage' },
  { name: 'site-compare', role: 'the two-face compare rig' },
  { name: 'gallery-shoot', role: 'the wall’s tile shooter' },
  { name: 'mobile-type-ladder', role: 'the compact type slots' },
  { name: 'pre-boot', role: 'the before-first-paint contract' },
  { name: 'four-color', role: 'the palette everything resolves from' },
] as const;

export type LibraryName = (typeof LIBRARY_INDEX)[number]['name'];

/** One library's name and role, which its full entry in libraries.ts spreads. */
export function libraryEntry(name: LibraryName): { name: LibraryName; role: string } {
  const entry = LIBRARY_INDEX.find((lib) => lib.name === name);
  if (!entry) throw new Error(`no library named ${name}`);
  return { name: entry.name, role: entry.role };
}
