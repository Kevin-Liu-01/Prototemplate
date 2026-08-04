import type { Metadata } from 'next';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import ThemeToggle from '@/components/shared/ThemeToggle';

import '../prototemplate.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

const DESCRIPTION =
  'Everything built under the redesign: the line law, the rail system, the shaders, and the libraries.';

export const metadata: Metadata = {
  title: 'Craft',
  description: DESCRIPTION,
  alternates: { canonical: '/craft' },
  openGraph: {
    siteName: 'Prototemplate',
    type: 'website',
    url: '/craft',
    title: 'Craft · Prototemplate',
    description: DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 2400,
        height: 1260,
        alt: 'Prototemplate — the build log of the General Translation website redesign.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Craft · Prototemplate',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

const AUDITS = [
  'Doubled lines — two parallel strokes from different owners within 4px of each other, including coincident strokes that composite darker than either.',
  'Missing seams — section and row junctions that no rule closes.',
  'Self-stacks — a translucent border over the element’s own translucent background, the same line drawn twice by one element.',
  'Invisible seams — rules that exist geometrically but sit within a few RGB steps of the surface they cross.',
] as const;

const RAIL_RULES = [
  'Exactly one thing draws the page rails for any section — a rail wrapper, or the section’s own full-bleed pair. Never both.',
  'The row owns every structural line; cells never draw borders that parallel a row seam.',
  'Framed rows expose the ground through a 1px padding reveal instead of drawing a border — the ground is the seam.',
  'Translucent fills never extend under translucent borders: backgrounds clip to the padding box, everywhere.',
] as const;

const LIBRARIES = [
  {
    name: 'horizon-field',
    role: 'the singularity visual',
    body:
      'The lensing black hole: a photon ring, wrapped accretion arcs, and the page’s own ruled lines bending into the mass — one WebGL fragment shader on one quad. Twenty-one tunable parameters (geometry, doppler, chroma, exposure, breathing), a full runtime handle (setParams, pause, resume, renderStatic, destroy), and GLSL kept comment-free by design so the shipped source stays a fraction of the page it lights.',
  },
  {
    name: 'glyph-field',
    role: 'the glyph rain visual',
    body:
      'A canvas-2D particle field of 1,280 glyphs from eight writing systems that condenses into the word "language" in script after script. One preallocated typed-array pool, a 1-bit Bayer-dithered atlas, and morphs that conserve matter: the outgoing word’s dust is the next word’s material, deficits are recruited from visible rain, and nothing ever spawns mid-air or vanishes mid-flight.',
  },
  {
    name: 'prismatic-field',
    role: 'the chroma wash',
    body:
      'The spectral light behind every dark terminal and band — a flowing wide-gamut wash with presets, speed and exposure control, masked so the light owns the edges and the content owns the dark center.',
  },
] as const;

/**
 * The build log: everything constructed underneath the eighteen directions —
 * the laws, the tooling that enforces them, and the libraries that will
 * graduate to their own repos. Article-set like the index post.
 */
export default function CraftPage() {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <div className='pt-rail'>
        <header className='pt-nav'>
          <Link className='pt-nav-brand' href='/'>
            <span className='pt-mark' aria-hidden>
              <i className='pt-mark-line is-h is-top' />
              <i className='pt-mark-line is-h is-bot' />
              <i className='pt-mark-line is-v is-l' />
              <i className='pt-mark-line is-v is-r' />
              <i className='pt-mark-fill' />
            </span>
            <span className='pt-brand-word'>
              <b className='pt-face-serif'>proto</b>
              <b className='pt-face-grot'>template</b>
            </span>
          </Link>
          <div className='pt-nav-right'>
            <ThemeToggle className='pt-nav-theme' />
            <Link href='/'>Index</Link>
            <Link className='pt-nav-present' href='/present'>
              Present <span aria-hidden>▶</span>
            </Link>
          </div>
        </header>

        <article className='pt-post'>
          <section className='pt-sec pt-post-sec'>
            <h1>The system under the system</h1>
            <p className='pt-post-byline'>Kevin Liu · August 2026</p>
            <p>
              Eighteen directions and five full sites is the visible output. Underneath them is
              the part I actually spent the time on: a set of laws about lines and color, the
              tooling that enforces those laws mechanically, and a family of visual engines built
              as standalone libraries. This page is the inventory.
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>The line law, and the auditors that hold it</h2>
            <p>
              Every direction runs on one typographic rule: structure comes from hairlines, and
              every line is drawn exactly once. That is easy to say and impossible to maintain by
              eye, so the repo lints its own pixels. The line auditor loads every page in a real
              browser — both themes, two widths — reconstructs every rendered line from computed
              styles (borders, outlines, spread shadows, thin filled boxes, pseudo rails clamped
              to their clipping ancestors, and the 1px ground reveals framed rows use as seams),
              then fails the round on four classes of defect:
            </p>
            <ul className='pt-post-rules'>
              {AUDITS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p>
              Deliberate devices — the brand’s doubled threads, marquee rails, terminal frames —
              live on a small allow list, so the auditor stays strict everywhere else. Two more
              linters ride along: a shell linter that bans raw color literals in the component
              layer (every stroke goes through the hairline tokens), and a practices ratchet that
              counts button types, bare effects, any-types, raw hex in markup and !important in
              CSS, and refuses any commit that adds to the count.
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>Rails, grounds, and seams</h2>
            <p>
              The page’s spine is a ruled column with doubled rails — an outer hairline pair
              running the full height, the inner pair drawn once by the column’s own edges. What
              looks like a simple frame is an ownership system:
            </p>
            <ul className='pt-post-rules'>
              {RAIL_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>Corners, spacers, and the second surface</h2>
            <p>
              The corner notches on hero cards are not drawn — they are the ground showing
              through, so a corner can never disagree with the seam that meets it. Sections
              separate with hatch spacer bands (the diagonal you see between every part of this
              page) rather than empty margin, and light diagrams sit on exactly one sanctioned
              second surface, mirroring the ink and raised-ink pair that dark mode runs on. The
              four-color palette — ink, raised ink, titanium, paper — allows one bright white,
              one spectral accent per page, and earns depth with lines and material instead of
              shadows.
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>The libraries</h2>
            <p>
              The signature visuals are not page code. Each one is a root-agnostic engine with a
              real API — options in, a handle out, no framework assumptions — living in its own
              module. Once they are perfected they will be open-sourced on GitHub as individual
              libraries.
            </p>
            <div className='pt-craft-libs'>
              {LIBRARIES.map((lib) => (
                <div className='pt-craft-lib' key={lib.name}>
                  <h3>
                    {lib.name} <span>{lib.role}</span>
                  </h3>
                  <p>{lib.body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>The moving type</h2>
            <p>
              Every animation obeys the same discipline as the lines. The morphing headline is a
              single shaped text node — never per-character spans, which would break Arabic
              joining and Devanagari matras — with its width measured from a hidden probe and
              tweened once per cycle, device-pixel snapped. The locale belt seats each glyph on
              the orbit’s tangent and rolls words over at the sides so text never inverts, with
              the flag guiding each rewrite. And the compare seams on the index are the same
              slide-to-reveal instrument the toolchain hero uses to pull its rendered app back to
              the payload underneath.
            </p>
            <p className='pt-site-links'>
              <Link href='/'>back to the index</Link>
              <span aria-hidden> · </span>
              <Link href='/present'>walk the deck</Link>
            </p>
          </section>
        </article>

        <footer className='pt-foot'>
          <span className='pt-foot-brand'>
            <span className='pt-mark' aria-hidden>
              <i className='pt-mark-line is-h is-top' />
              <i className='pt-mark-line is-h is-bot' />
              <i className='pt-mark-line is-v is-l' />
              <i className='pt-mark-line is-v is-r' />
              <i className='pt-mark-fill' />
            </span>
            Prototemplate
          </span>
          <span className='pt-foot-right'>prototype × template</span>
        </footer>
      </div>
    </main>
  );
}
