'use client';

import { ArrowUpRight, Globe } from 'lucide-react';
import { Fragment, useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';
import { BentoCell } from '@/components/shell/Bento';

import '@/app/d/toolchain/sections/pricing-v2.css';

import './global.css';

/**
 * V0Global — "Ship to the world."
 *
 * The global/enterprise beat, seated in the shell's own grammar: a tc-head
 * header band, then one is-lead bento row — the EdgeGlobe on toolchain's
 * is-night card (the card IS the dark plate; the row owns the frame) beside
 * a framed cell stacking the three claims as a ruled rail — and the real
 * Theo post as one quiet full-width night cell. Only the artifacts inside
 * the cells (globe mount, locale panel, post type) are v0-styled.
 */

type VariantCell = {
  code: string;
  /** Native name rendered in the UI face — only where the mock shows one. */
  native?: string;
};

type FamilyRow = {
  base: string;
  native: string;
  variants: readonly VariantCell[];
  /** The ar row flips the whole reading direction, not just its label. */
  rtl?: boolean;
};

/** Base languages fanning into regional locale tags, per the mock's rows. */
const FAMILY_ROWS: readonly FamilyRow[] = [
  {
    base: 'zh',
    native: '中文',
    variants: [
      { code: 'zh-HK', native: '中文（香港）' },
      { code: 'zh-TW', native: '中文（台灣）' },
    ],
  },
  {
    base: 'en',
    native: 'English',
    variants: [{ code: 'en-GB' }, { code: 'en-AU' }],
  },
  {
    base: 'ar',
    native: 'العربية',
    variants: [{ code: 'ar-EG' }, { code: 'ar-SA' }],
    rtl: true,
  },
];

/** The script belt: four more writing systems close the panel. */
const SCRIPT_BELT: readonly { code: string; native: string }[] = [
  { code: 'hi', native: 'हिन्दी' },
  { code: 'el', native: 'Ελληνικά' },
  { code: 'he', native: 'עברית' },
  { code: 'ko', native: '한국어' },
];

/* ---- the globe's dithered atmosphere ------------------------------------
   Founder: a low-opacity ordered-dither field behind the globe, in the
   house Bayer language (glyph-field's 1-bit falloffs; StackTower's mark
   shimmer) — a radial density falloff hugging the sphere's silhouette and
   fading out, reading as atmosphere rather than noise. Density carries the
   whole ramp: four NON-overlapping annuli, each filled with one coverage
   tier of the 4×4 ordered Bayer matrix, all tiles on one shared grid — so
   crossing a ring boundary only ever turns dots off (ordered tiers nest by
   construction) and no cell is painted twice (the ink is translucent, so a
   doubled cell would brighten into a second grey — the alpha-veil failure
   the 1-bit language exists to avoid). Static by design, so it is
   reduced-motion safe by construction; crispEdges keeps the ~1.8px cells
   1-bit at 1x and 2x alike. */

/** Ordered 4×4 Bayer matrix — glyph-field's, verbatim (StackTower's copy). */
const ATMO_BAYER: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Dither cell edge in the globe's viewBox units: ~1.8px on screen at the
    card's ~1.44x render of the 360-unit drawing — inside the founder's
    1–2px dot spec at every width this cell reaches. */
const ATMO_CELL = 1.25;
const ATMO_TILE = ATMO_CELL * 4;

/** One pattern tile at coverage k/16: every cell whose Bayer threshold
    sits under k, as one path of squares. */
function atmoTile(cover: number): string {
  const cells: string[] = [];
  ATMO_BAYER.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < cover) {
        cells.push(
          `M${x * ATMO_CELL} ${y * ATMO_CELL}h${ATMO_CELL}v${ATMO_CELL}h${-ATMO_CELL}Z`
        );
      }
    });
  });
  return cells.join('');
}

/** The sphere's projection, mirrored from EdgeGlobe.tsx (R/CX/CY are module
    constants there, not exported): limb radius 92 centred at (179, 126) in
    the 360×240 viewBox — 179 is the optically-balanced seat between the
    two label rails (founder round); keep this in step with EdgeGlobe's CX
    whenever the sphere moves. The overlay shares that viewBox, so the two
    coordinate systems coincide exactly at any rendered size. */
const ATMO_CX = 179;
const ATMO_CY = 126;

/** The falloff, centre-out: ring bounds (viewBox units) and Bayer coverage.
    The innermost ring clears the limb by 2 units so the atmosphere never
    touches the drawing's strongest line; the outermost fade completes at
    112 — inside the viewBox's 114-unit floor clearance, so no ring is ever
    cut flat by the viewport edge. */
const ATMO_RINGS: readonly { cover: number; rIn: number; rOut: number }[] = [
  { cover: 6, rIn: 94, rOut: 98.5 },
  { cover: 4, rIn: 98.5, rOut: 103 },
  { cover: 2, rIn: 103, rOut: 107.5 },
  { cover: 1, rIn: 107.5, rOut: 112 },
];

/** A full circle as two arcs; outer + inner subpaths under evenodd make
    each ring an annulus, so the four tiers tile the halo without overlap. */
function atmoRing(r: number): string {
  return `M${ATMO_CX - r} ${ATMO_CY}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}

function GlobeAtmosphere() {
  return (
    <svg
      aria-hidden='true'
      className='v0-glob-atmo-field'
      focusable='false'
      viewBox='0 0 360 240'
    >
      <defs>
        {ATMO_RINGS.map(({ cover }) => (
          <pattern
            height={ATMO_TILE}
            id={`v0ga-${cover}`}
            key={cover}
            patternUnits='userSpaceOnUse'
            width={ATMO_TILE}
          >
            <path
              className='v0-glob-atmo-dots'
              d={atmoTile(cover)}
              shapeRendering='crispEdges'
            />
          </pattern>
        ))}
      </defs>
      {ATMO_RINGS.map(({ cover, rIn, rOut }) => (
        <path
          d={atmoRing(rOut) + atmoRing(rIn)}
          fill={`url(#v0ga-${cover})`}
          fillRule='evenodd'
          key={cover}
        />
      ))}
    </svg>
  );
}


/* ---------- the quote plate's dither field ----------
   Founder: "a big dither in the right of this specific quote box." The
   house 1-bit language at plate scale: cells on one grid, the 4x4
   ordered Bayer matrix thresholded by a radial falloff from the right
   edge's midpoint — a half-halo of density, dense at the edge, dead
   before the words. Deterministic (module-level), so SSR and client
   agree byte-for-byte; ink is currentColor so each theme re-inks the
   same dots. */
const QD_BAYER: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const QD_CELL = 4;
const QD_W = 480;
const QD_H = 320;

const QD_PATH: string = (() => {
  const parts: string[] = [];
  const cx = QD_W;
  const cy = QD_H / 2;
  const rMax = Math.hypot(QD_W * 0.92, QD_H * 0.8);
  for (let y = 0; y < QD_H / QD_CELL; y += 1) {
    for (let x = 0; x < QD_W / QD_CELL; x += 1) {
      const px = x * QD_CELL + QD_CELL / 2;
      const py = y * QD_CELL + QD_CELL / 2;
      const cover = Math.max(0, 16 * (1 - Math.hypot(px - cx, py - cy) / rMax));
      const row = QD_BAYER[y % 4];
      if (row && (row[x % 4] ?? 16) < cover) {
        parts.push(`M${x * QD_CELL} ${y * QD_CELL}h${QD_CELL}v${QD_CELL}h${-QD_CELL}Z`);
      }
    }
  }
  return parts.join('');
})();

export default function V0Global() {
  const root = useRef<HTMLElement>(null);

  return (
    <section className='tc-sec v0-glob' id='infrastructure' ref={root}>
      <div className='tc-head'>
        <Globe className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Ship to the world.</h2>
      </div>

      {/* ---- row 1: the globe on its night card, the ruled rail of claims ---- */}
      <div className='tc-row is-lead' data-eq-heads>
        {/* The delivery network as the section's object: the night card is
            the dark plate itself, so the artifact draws no frame of its own —
            the row's mat ground is the one line around it. */}
        <BentoCell cell='is-tall is-framed is-night'>
          <div className='v0-glob-art'>
            {/* The atmosphere and the globe share one box (and one viewBox),
                so the dither's rings stay registered on the sphere's limb at
                every rendered size; the field sits behind the drawing. */}
            <div className='v0-glob-atmo'>
              <GlobeAtmosphere />
              <EdgeGlobe title='A wireframe globe with five points of presence, the nearest serving a translation 12 ms away' />
            </div>
          </div>
        </BentoCell>

        <BentoCell cell='is-tall is-framed'>
          <div className='v0-glob-rail'>
            <article className='v0-glob-item'>
              <h3>120+ languages, in every writing system.</h3>

              {/* The combined artifact: base tags fan into regional variants,
                  every row in the language's own writing system. It draws no
                  perimeter — only the single hairlines between its rows. */}
              <div className='v0-glob-locales'>
                {FAMILY_ROWS.map((row) => (
                  <div
                    className='v0-glob-lrow'
                    dir={row.rtl ? 'rtl' : undefined}
                    key={row.base}
                  >
                    <span className='v0-glob-lbase'>
                      <span className='v0-glob-chip'>
                        <LocaleTag code={row.base} />
                      </span>
                      <span className='v0-glob-native is-base' lang={row.base}>
                        {row.native}
                      </span>
                    </span>
                    <span className='v0-glob-larrow' aria-hidden='true'>
                      {row.rtl ? '←' : '→'}
                    </span>
                    <span className='v0-glob-lvars'>
                      {row.variants.map((variant, i) => (
                        <Fragment key={variant.code}>
                          {i > 0 ? (
                            <span className='v0-glob-ldot' aria-hidden='true'>
                              ·
                            </span>
                          ) : null}
                          <span className='v0-glob-lvar'>
                            <code className='v0-glob-chip'>{variant.code}</code>
                            {variant.native ? (
                              <span className='v0-glob-native' lang={variant.code}>
                                {variant.native}
                              </span>
                            ) : null}
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  </div>
                ))}

                <p className='v0-glob-belt'>
                  {SCRIPT_BELT.map((token, i) => (
                    <Fragment key={token.code}>
                      {i > 0 ? (
                        <span className='v0-glob-ldot' aria-hidden='true'>
                          ·
                        </span>
                      ) : null}
                      <span className='v0-glob-lvar'>
                        <span className='v0-glob-chip'>
                          <LocaleTag code={token.code} />
                        </span>
                        <span className='v0-glob-native' lang={token.code}>
                          {token.native}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </article>

            <article className='v0-glob-item'>
              <h3>Served from the edge.</h3>
              <p>
                Low-latency CDN, versioned per locale. Fix a string or roll it back without
                touching your code.
              </p>
            </article>

            <article className='v0-glob-item'>
              <h3>Built for the enterprise.</h3>
              <p>
                Custom FDE hours to build any workflow for your use case. Plus SSO, SOC 2 Type
                II, ISO 27001, and audit logs.
              </p>
            </article>
          </div>
        </BentoCell>
      </div>

      {/* ---- row 2: the pricing proof plate (tcpq), verbatim grammar —
          meta link, oversized mark, accented phrases, avatar attribution —
          compressed vertically by the v0 overrides in global.css. */}
      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <figure className='tcpq-mat'>
            <div className='tcpq-plate'>
              <svg
                aria-hidden='true'
                className='v0-glob-qd'
                preserveAspectRatio='xMaxYMid slice'
                viewBox={`0 0 ${QD_W} ${QD_H}`}
              >
                <path d={QD_PATH} fill='currentColor' shapeRendering='crispEdges' />
              </svg>
              <blockquote className='tcpq-quote'>
                <p>Every once in awhile, I see a snippet of code that makes me a bit emotional.</p>
                <p>
                  Now is one of those moments. Internationalization went from <em>&ldquo;$%!#
                  this&rdquo;</em> to <em>&ldquo;trivial&rdquo;</em>.
                </p>
              </blockquote>
              <figcaption className='tcpq-attr'>
                <img
                  alt='Theo'
                  className='tcpq-face'
                  height={48}
                  loading='lazy'
                  src='/brand/theo.png'
                  width={48}
                />
                <span className='tcpq-who'>
                  <span className='tcpq-name'>Theo</span>
                  <span className='tcpq-role'>CEO, T3 Chat</span>
                </span>
                <a
                  href='https://x.com/theo/status/2008302190168019187'
                  rel='noreferrer'
                  target='_blank'
                >
                  View the post
                  <ArrowUpRight aria-hidden />
                </a>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
