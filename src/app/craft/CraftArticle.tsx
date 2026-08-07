import AuditorFigure from './AuditorFigure';
import CodeBlock from './CodeBlock';
import CornerFigure from './CornerFigure';
import LibraryDemo from './LibraryDemo';
import { AUDITS, BENTO_SNIPPET, LIBRARIES, LINT_SNIPPET, RAIL_RULES } from './libraries';
import RailFigure from './RailFigure';

import './craft.css';

/**
 * The build log, as an article fragment — everything constructed underneath
 * the sixteen directions: the laws, the tooling that enforces them, and the
 * libraries that will graduate to their own repos, each with a live plate.
 * Mounted on the /docs landing page beneath the one-paragraph tour (the old
 * /craft route redirects there); the receipts are drawn in — the auditor's
 * mock, the ownership diagram, the second-surface kit.
 */
export default function CraftArticle() {
  return (
    <article className='pt-post'>
      <div className='pt-hatch' aria-hidden='true' />

      <section className='pt-sec pt-post-sec'>
        <h2>The system under the system</h2>
        <p>
          Sixteen directions and three full sites is the visible output. Underneath them is
          the part I actually spent the time on: a set of laws about lines and color, the
          tooling that enforces those laws mechanically, and a family of visual engines built
          as standalone libraries. What follows is the inventory — with the diagrams, the
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
          The overlap is the named antipattern all of this exists to kill: two owners each
          drawing a real line along the same edge, compositing into one band darker and
          thicker than any line the system allows. This page carried one — the diagram
          above used to run the row&rsquo;s 1px ground reveal against the inner rail, so the
          reveal and the rail hairline stacked into a literal doubled border wherever the
          framed cells met the column. The fix is now drawn into the figure: where a row
          meets a line that already exists, the cell sits flush and that side&rsquo;s reveal is
          dropped. A reveal never runs beside a rail; a border never runs beside a seam.
        </p>
        <p>
          Two devices keep the law workable at junctions. Between sections, the
          diagonal-hatch spacer owns the boundary once — one hairline under a 45&deg; hatch
          band, the strip you see between every part of this page — so two closes never
          argue over the same edge. And where two hairlines must legitimately cross, a
          border cross can be added: a small plus seated exactly on the intersection, the
          way a printer&rsquo;s registration mark declares a crossing deliberate. The diagram
          wears two, where the nav&rsquo;s close meets the rails.
        </p>
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
          The signature visuals are not page code, and neither are the instruments around
          them. Each entry below is root-agnostic with a real contract — options in and a
          handle out, or one component with one prop surface — living in its own module.
          Once they are perfected they will be open-sourced on GitHub as individual
          libraries. Every plate is the real thing, mounted the way a consumer mounts it:
          engines are created when the plate first scrolls near and paused by their own
          observers when it leaves, a single still under reduced motion; the drawings are
          the actual geometry modules; the seam is the actual slider.
        </p>
        <div className='pt-craft-libs'>
          {LIBRARIES.map((lib) => (
            <div className='pt-craft-lib' id={lib.name} key={lib.name}>
              <h3>
                {lib.name} <span>{lib.role}</span>
              </h3>
              <p>{lib.body}</p>
              {lib.demo ? (
                <LibraryDemo kind={lib.demo.kind} label={lib.demo.label} tag={lib.demo.tag} />
              ) : null}
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
      </section>
    </article>
  );
}
