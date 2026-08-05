import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import AuditorFigure from './AuditorFigure';
import CodeBlock from './CodeBlock';
import CornerFigure from './CornerFigure';
import LibraryDemo, { type LibraryDemoKind } from './LibraryDemo';
import RailFigure from './RailFigure';
import ThemeToggle from '@/components/shared/ThemeToggle';

import '../prototemplate.css';
import './craft.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'Craft — Prototemplate',
  description: 'Everything built under the redesign: the line law, the rail system, the shaders, and the libraries.',
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

/* The auditor's real invocation, and a finding in its real output shape
   (JSON.stringify(out, null, 1), keyed by audit width). The round is staged —
   this page audits clean — but every field is the auditor's own. */
const LINT_SNIPPET = `$ node scripts/lint-lines.mjs http://localhost:3006/craft --theme dark

{
 "1440": {
  "total": 212,
  "doubles": [
   { "orient": "h", "at": 1284, "gap": 1.5,
     "a": "pt-sec pt-post-sec", "b": "pt-hatch", "span": 1170 }
  ],
  "missing": [
   { "kind": "section", "between": "pt-sec → pt-foot", "at": 4620 }
  ],
  "selfStacks": [
   { "owner": "pt-compare-tag", "side": "top", "at": 3892, "len": 118 }
  ],
  "invisibles": []
 },
 "1280": { "total": 208, "doubles": [], "missing": [], "selfStacks": [], "invisibles": [] }
}`;

const BENTO_SNIPPET = `import { BentoCell, BentoRow, Rails } from '@/components/shell/Bento';

<section className='relative'>
  {/* the wrapper draws the page rails — once */}
  <Rails />

  {/* the row owns the seams: gap-px cells over the one hair ground */}
  <BentoRow cols='7fr 5fr'>
    <BentoCell title='Ship in every language' sub='One pipeline'>
      <LocaleLedger />
    </BentoCell>
    <BentoCell framed={false} cell='is-terminal'>
      <Terminal />
    </BentoCell>
  </BentoRow>
</section>`;

const HORIZON_SNIPPET = `import { createHorizonField } from '@/lib/horizon-field';

const field = createHorizonField(canvas, {
  speed: 0.5,
  params: { ink: [1, 1, 1], exposure: 2.6 },
});

/* the shader draws nothing until it is given a geometry */
const fit = () => {
  field?.setParams({
    center: [canvas.clientWidth / 2, canvas.clientHeight / 2],
    radius: Math.min(canvas.clientWidth, canvas.clientHeight) * 0.32,
  });
};
fit();
new ResizeObserver(fit).observe(canvas);

/* handle: setParams · pause · resume · renderStatic · destroy */`;

const GLYPH_SNIPPET = `import { createGlyphField } from '@/lib/glyph-field';

const field = createGlyphField({
  canvas,
  displayFamily: getComputedStyle(canvas).fontFamily,
  monoFamily: getComputedStyle(canvas).getPropertyValue('--pt-mono'),
  onScript: (index) => setActive(index),
});

/* the whole teardown — observers, loop, theme watcher */
field?.destroy();`;

const PRISMATIC_SNIPPET = `import PrismaticField from '@/components/shared/PrismaticField';

<PrismaticField
  preset='2'
  speed={0.5}
  params={{ exposureScale: 4200 }}
  className='plate-field'
/>

/* presets: '1' wide burst · '2' arc over a dark core.
   exposureScale is the dimmer — raise it under content. */`;

type Library = {
  name: string;
  role: string;
  body: string;
  demo: LibraryDemoKind;
  tag: string;
  demoLabel: string;
  file: string;
  snippet: string;
};

const LIBRARIES: readonly Library[] = [
  {
    name: 'horizon-field',
    role: 'the singularity visual',
    body:
      'The lensing black hole: a photon ring, wrapped accretion arcs, and the page’s own ruled lines bending into the mass — one WebGL fragment shader on one quad. Twenty-one tunable parameters (geometry, doppler, chroma, exposure, breathing), a full runtime handle (setParams, pause, resume, renderStatic, destroy), and GLSL kept comment-free by design so the shipped source stays a fraction of the page it lights.',
    demo: 'horizon',
    tag: 'createHorizonField()',
    demoLabel:
      'Live demo: a small event horizon — a bright photon ring around a dark core, with faint ruled lines bending into it.',
    file: 'src/lib/horizon-field.ts',
    snippet: HORIZON_SNIPPET,
  },
  {
    name: 'glyph-field',
    role: 'the glyph rain visual',
    body:
      'A canvas-2D particle field of 1,280 glyphs from eight writing systems that condenses into the word "language" in script after script. One preallocated typed-array pool, a 1-bit Bayer-dithered atlas, and morphs that conserve matter: the outgoing word’s dust is the next word’s material, deficits are recruited from visible rain, and nothing ever spawns mid-air or vanishes mid-flight.',
    demo: 'glyph',
    tag: 'createGlyphField()',
    demoLabel:
      'Live demo: glyphs from eight writing systems rain down and condense into the word "language" in one script after another, each word measured by a caliper.',
    file: 'src/lib/glyph-field.ts',
    snippet: GLYPH_SNIPPET,
  },
  {
    name: 'prismatic-field',
    role: 'the chroma wash',
    body:
      'The spectral light behind every dark terminal and band — a flowing wide-gamut wash with presets, speed and exposure control, masked so the light owns the edges and the content owns the dark center.',
    demo: 'prismatic',
    tag: '<PrismaticField />',
    demoLabel:
      'Live demo: a flowing spectral light field arcing over a dark center, streaks of thin-film color converging and drifting.',
    file: 'src/components/shared/PrismaticField.tsx',
    snippet: PRISMATIC_SNIPPET,
  },
] as const;

/**
 * The build log: everything constructed underneath the eighteen directions —
 * the laws, the tooling that enforces them, and the libraries that will
 * graduate to their own repos. Article-set like the index post, with the
 * receipts drawn in: the auditor's mock, the ownership diagram, the
 * second-surface kit, and a live plate per library.
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
              as standalone libraries. This page is the inventory — with the diagrams, the
              invocations, and the engines themselves running live.
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
            <AuditorFigure />
            <p>
              One command audits a page; a finding names the two owners, the gap between their
              strokes, and the span over which they run in parallel. The round below is staged —
              this page audits clean in both themes — but the shape is the auditor&rsquo;s own:
            </p>
            <CodeBlock code={LINT_SNIPPET} label='scripts/lint-lines.mjs — a staged failing round' />
            <p>
              Deliberate devices — the brand&rsquo;s doubled threads, marquee rails, terminal frames —
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
              The page&rsquo;s spine is a ruled column with doubled rails — an outer hairline pair
              running the full height, the inner pair drawn once by the column&rsquo;s own edges. What
              looks like a simple frame is an ownership system:
            </p>
            <ul className='pt-post-rules'>
              {RAIL_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <RailFigure />
            <p>
              The ownership system is not a convention to remember — it is componentized, so the
              wrong line is impossible to draw. A rails wrapper renders the page pair; the row
              renders one hair-colored ground under 1px gaps; cells have no border props at all:
            </p>
            <CodeBlock code={BENTO_SNIPPET} label='src/components/shell/Bento.tsx — the primitives in use' />
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
            <CornerFigure />
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>The libraries</h2>
            <p>
              The signature visuals are not page code. Each one is a root-agnostic engine with a
              real API — options in, a handle out, no framework assumptions — living in its own
              module. Once they are perfected they will be open-sourced on GitHub as individual
              libraries. Each plate below is the real engine, mounted the way a consumer mounts
              it: created when the plate first scrolls near, paused by its own observer when it
              leaves, a single still under reduced motion.
            </p>
            <div className='pt-craft-libs'>
              {LIBRARIES.map((lib) => (
                <div className='pt-craft-lib' key={lib.name}>
                  <h3>
                    {lib.name} <span>{lib.role}</span>
                  </h3>
                  <p>{lib.body}</p>
                  <LibraryDemo kind={lib.demo} label={lib.demoLabel} tag={lib.tag} />
                  <CodeBlock code={lib.snippet} label={lib.file} />
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
              the orbit&rsquo;s tangent and rolls words over at the sides so text never inverts, with
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
