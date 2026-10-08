import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Metadata } from 'next';
import Link from 'next/link';

import ReassemblerDemo from '../craft/ReassemblerDemo';
import AttributeScales, { AESTHETIC, PERSONALITY } from './AttributeScales';
import BrandFilm from './BrandFilm';
import BrandMarkFigure from './BrandMarkFigure';
import type { BrandPage } from './BrandViewer';
import BrandViewer from './BrandViewer';
import { headingId } from './brand-sections';
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import { GtWord, gtText } from '@/components/viewer/GtWord';
import { PAGE_NAMES } from '@/lib/page-names';
import { readingMinutes } from '@/lib/reading';
import { requireUpdated } from '@/lib/updated';

import '../prototemplate.css';
import './brand.css';

export const metadata: Metadata = {
  title: PAGE_NAMES.brand.name,
  description:
    'General Translation’s identity, laid out: the name, the idea, the character, the mark, color, type, language as material, and where it ships.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** The naming system: every name, what it is, one row each. The short form renders as the mark (gtText); the lowercase package names stay text. */
const NAMES = [
  ['General Translation, Inc.', 'the company'],
  ['GT', 'the short form, and the mark'],
  ['gt', 'the open-source library; you run gt translate'],
  ['gt-next · gt-react · gt-vue · gt-node · gt-python', 'the framework packages'],
  ['Locadex', 'the AI agent product'],
  ['generaltranslation.com', 'the domain, with gt.sh, generaltranslation.ai/.dev, locadex.com/.ai/.dev'],
  ['glyphfield.com', 'the companion tooling site (shader library, animation studio)'],
] as const;

/** Where the identity ships today, one row per kind of surface (BRAND.md section 8). */
const SHIPS = [
  [
    'The site',
    'generaltranslation.com, built in gt-cloud’s apps/landing; the production landing page (gt-cloud #4213) has been canonical for the site since 2026-08-11',
  ],
  [
    'Product surfaces',
    'the dashboard, onboarding, the sign-in plate and the Prototemplate shell, which have followed the brand deck since 2026-09-25',
  ],
  ['Motion', 'the films on /motion: the blog trailers, the product films and the translation-history series'],
  [
    'The marks',
    'the speed marks chosen on 2026-09-29, shown beside the doubled-line monogram, which stays the current mark; the title badges in the /brand and /marks heads cycle through a selection of the marks on /marks',
  ],
] as const;

/** The signature devices, each with its one-line jurisdiction. */
const DEVICES = [
  ['doubled-line', 'every connector is one path stroked twice, the mark’s own grammar in every diagram'],
  ['glyph-reassembler', 'a sentence dissolves to glyph dust and reassembles in the next language; matter is conserved'],
  ['glyph-field', 'rain from eight writing systems condenses into the word "language," script after script'],
  ['dither', 'density renders as 1-bit ordered Bayer, the texture of the brand, never an alpha veil'],
  ['iso', 'one 30° projection for every technical drawing, lit from the upper left, one accent per drawing'],
  ['edge-globe', 'the delivery network said once, with ink: depth as dashed hairlines, no fills'],
  ['locale-tag', 'flag print + code: the one way a locale is named, anywhere'],
  ['horizon-field', 'the lensing black hole, reserved for singular moments'],
] as const;

const SWATCHES = [
  ['is-ink', 'ink', '#070707'],
  ['is-raised', 'raised ink', '#101010'],
  ['is-titanium', 'titanium', '#8a8f98'],
  ['is-paper', 'paper', '#ffffff'],
] as const;

const INTER_WEIGHTS = [300, 400, 500, 600, 700, 800] as const;

const PILL_LOCS = ['en-GB', 'es', 'ja', 'ar-EG', 'ko', 'zh-Hant', 'hi', 'pt'] as const;

/**
 * The blog films under public/media: each post's trailer, its poster, and the
 * post on /blog with its authors as the blog prints them. All three videos in
 * the section are 1920 by 1080; the width and height attributes reserve that
 * box before the metadata arrives. The captions name no length, size or
 * sound, because later cuts replace the files at the same paths. Each
 * caption's separator follows a no-break space, so a wrapped caption never
 * starts a line with the dot.
 */
const FILMS = [
  {
    file: 'fuma-nama-film.mp4',
    poster: 'fuma-nama-poster.jpg',
    post: '/blog/fuma-nama',
    name: 'the Fuma Nama trailer',
    authors: 'Taylor Fang',
    caption:
      'the trailer for “Fuma Nama: The philosophy of an open-sourcerer”\u00a0· fire gem smoke, #fe5b16, #f7ff61 and white on ink',
  },
  {
    file: 'designing-docs-film.mp4',
    poster: 'designing-docs-poster.jpg',
    post: '/blog/designing-docs-for-humans',
    name: 'the Designing docs for humans trailer',
    authors: 'Kevin Liu and Taylor Fang',
    caption:
      'the trailer for “Designing docs for humans”\u00a0· blue gem smoke on navy, then white and #86a8ff on #2f5ce0, with the post’s blue dither',
  },
] as const;

/** The partnership globes under public/media: 2048 by 2048 on ink or on paper (`ground`), each with a -transparent twin for a ground of its own kind; the captions set their separators as FILMS does. */
const GLOBES = [
  {
    stem: 'gt-globe-dithered',
    ground: 'ink',
    name: 'the dithered globe',
    alt: 'A globe printed in pale blue Bayer dither on near-black, lit from the upper left, with land and sea told apart by the density of the dots',
    caption:
      'the dithered globe\u00a0· the dashboard sign-in globe through the 8x8 Bayer screen in #86a8ff on ink, 6\u00a0px cells',
  },
  {
    stem: 'gt-globe-dithered-mark',
    ground: 'ink',
    name: 'the globe with the mark',
    alt: 'The dithered globe with the GT monogram, drawn in doubled white lines, at its center',
    caption:
      'the globe with the mark\u00a0· the same print with the doubled-line monogram at the center in #f2f2f0, over a knocked-out halo',
  },
  {
    stem: 'gt-globe-glyphs',
    ground: 'ink',
    name: 'the glyph globe in dark',
    alt: 'A globe drawn in characters from many writing systems on near-black: land in large white and pale blue glyphs, ocean in small blue glyphs',
    caption:
      'the glyph globe in dark\u00a0· characters from twenty writing systems, land in #f2f2f0 and #86a8ff, ocean at half size in #2f5ce0',
  },
  {
    stem: 'gt-globe-glyphs-light',
    ground: 'paper',
    name: 'the glyph globe in light',
    alt: 'The glyph globe on white: the same characters from many writing systems, land in black, ocean in blue, the glyphs growing toward the shadowed side',
    caption:
      'the glyph globe in light\u00a0· the same characters on paper, land in #070707, ocean in #2f5ce0 thinning to #86a8ff in the highlight, ink carrying the shadow',
  },
] as const;

/** The head's lead: two or three lines that say what the page is. */
const LEAD =
  'General Translation’s identity, laid out: the name, the idea, the character, the mark, the color and type systems, and the devices that make it recognizable.';

/** The rest of the introduction, under the head's rule. */
const NOTE = (
  <p>
    It is written for anyone who builds with the identity, including our partners at
    basement studio. The visual laws are codified in{' '}
    <Link href='/docs/design'>the design system</Link>, and every engine runs live
    in <Link href='/docs'>the documentation</Link>.
  </p>
);

/**
 * The ten sections, each rendered on the server and handed to the viewer as
 * a page. Ids match brand-sections.ts, which the viewer reads for the list,
 * the grid, the hash and each section's divider (its title is the divider's
 * h2, so a body starts under it); the h3 ids are the rows under the active
 * section.
 * The word GT in the prose is <GtWord />; the space after it is written as
 * {' '} because the JSX transform drops the leading space of a text run
 * that also carries an HTML entity (&rsquo;, &hellip;).
 */
const PAGES: readonly BrandPage[] = [
  {
    id: 'the-name',
    body: (
      <>
        <p>
          <strong>General Translation</strong> was chosen deliberately, in this order.
          First, ambition: like General Motors or General Electric, the name says we intend
          to be the trustworthy, technologically innovative number one in the category, an
          enterprise in the old sense. Second, generality: a reference to artificial{' '}
          <em>general</em>{' '}intelligence. General models outperform specific translation
          models because they understand context and can be directed. Third, distinction:
          every other localization company seemed to begin with an &ldquo;L&rdquo;.
        </p>
        <div className='ptb-names'>
          {NAMES.map(([name, what]) => (
            <div className='ptb-name-row' key={name}>
              <b>{gtText(name)}</b>
              <span>{what}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'the-idea',
    body: (
      <>
        <p className='ptb-thesis'>Every product in every language.</p>
        <p>
          Native-level speed and quality, from day one. A simple idea, executed insanely
          hard. The positioning is <strong>the Vercel of localization</strong>: two halves
          designed together, open-source developer tools (the <code>gt</code> libraries)
          and closed-source infrastructure that is the best-in-class way to use them.
          Because we build the entire stack, we can promise what point solutions
          can&rsquo;t: consistent, high-quality translation across a whole business,
          integrated in an afternoon.
        </p>
        <p>
          Two registers, one family: the open source should feel community-owned; the
          platform should feel enterprise-grade.
        </p>
        <ul className='pt-post-rules'>
          <li>
            Engineering-first. Built by people with deep technical roots, for the
            world&rsquo;s best engineering teams.
          </li>
          <li>
            Craft. We care about the difference between drawn-once and drawn-twice lines.
            That is literal: the line law audits every page.
          </li>
          <li>
            Infrastructure-grade. Reliable, fast, secure. Something an enterprise stands
            on, not an app it tries.
          </li>
          <li>
            Cosmopolitan. Urbane, sophisticated, connecting the world and its languages.
            Language is our material, not just our market.
          </li>
          <li>
            Hand-crafted. The brand reads as made by people who care, not assembled from
            a template.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'the-character',
    body: (
      <>
        <p>
          The brand carries itself like a <strong>fullstack director</strong>: it writes
          the script and it pushes the camera. Creative and technically innovative, never
          one without the other. On time, under budget, over-delivering, always working
          with the best people, with a keen sense for making things people love.
        </p>
        <h3 id={headingId('the-character', 'personality')}>Personality</h3>
        <AttributeScales rows={PERSONALITY} />
        <h3 id={headingId('the-character', 'aesthetic')}>Aesthetic</h3>
        <AttributeScales rows={AESTHETIC} />
        <p className='ptb-scale-caption'>
          Positions are read from the completed system. They are working answers, for
          basement to confirm or push.
        </p>
        <h3 id={headingId('the-character', 'voice')}>Voice</h3>
        <p>
          Measured, declarative, precise, quietly confident. Captions state laws:
          &ldquo;the ground is the seam.&rdquo; Short sentences carry their own weight,
          with no exclamation marks doing the work, no hedging, and no marketing
          adjectives where a fact would do. Wit is allowed as precision, never as
          decoration. Technical terms are used precisely and sparingly. The register sits
          closer to a well-written spec or a good engineering blog than to marketing
          copy: product focus over performative marketing.
        </p>
        <div className='ptb-voice'>
          <div className='ptb-voice-row is-yes'>
            <span>say</span>
            <p>One pipeline. Every language ships with the deploy.</p>
          </div>
          <div className='ptb-voice-row is-no'>
            <span>not</span>
            <p>Supercharge your global growth with cutting-edge AI!</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'the-mark',
    body: (
      <>
        <p>
          Every stroke of the <GtWord />{' '}monogram is two parallel lines: the doubled-line grammar
          at brand scale, the same device that runs through every diagram in the system.
          The mark renders in one ink, either ink on paper or paper on ink. Never a third
          color, never a gradient, never a shadow. The dark surface inverts the drawn
          mark&rsquo;s ink. In illustration systems the mark renders as an alpha mask, so
          the shape takes the surface&rsquo;s ink. The one sanctioned flourish is the
          Bayer-dithered specular shimmer, never a GIF and never a glow.
        </p>
        <BrandMarkFigure />
        <div className='ptb-marks'>
          <figure className='ptb-mark is-paper'>
            <img alt='The GT monogram in ink on paper' decoding='async' loading='lazy' src='/brand/gt-logo-light.svg' />
            <figcaption>ink on paper</figcaption>
          </figure>
          <figure className='ptb-mark is-ink'>
            <img alt='The GT monogram in paper on ink' decoding='async' loading='lazy' src='/brand/gt-logo-dark.svg' />
            <figcaption>paper on ink</figcaption>
          </figure>
          <figure className='ptb-mark is-paper'>
            <img alt='The Locadex mark' decoding='async' loading='lazy' src='/brand/locadex-mark.svg' />
            <figcaption>Locadex, the agent&rsquo;s own mark</figcaption>
          </figure>
        </div>
        <p>
          At text size the wordmark sits inline with prose, at the cap height of the line
          it lives in, the way the hero on generaltranslation.com sets &ldquo;<GtWord />{' '}builds
          full-stack localization for apps, docs, and websites&rdquo;.
        </p>
        <p>
          The identity must survive compression: a favicon, a CLI banner, a README, a
          syntax-highlighted code block. Developers meet the brand in a terminal as often
          as on a website.
        </p>
      </>
    ),
  },
  {
    id: 'color',
    body: (
      <>
        <p>
          Four absolute colors, one spectral accent per page. Structural color everywhere
          derives from the four as alpha steps: every text step is ink or white at some
          alpha, every hairline titanium at some alpha. Dark mode is a pure token remap,
          one surface family in the dark, the way light mode is one white. The accent is
          a controlled edge, never a wash. Depth comes from lines and material, never
          shadows.
        </p>
        <div className='ptb-swatches'>
          {SWATCHES.map(([cls, name, hex]) => (
            <div className={`ptb-swatch ${cls}`} key={name}>
              <i />
              <b>{name}</b>
              <span>{hex}</span>
            </div>
          ))}
        </div>
        <div className='ptb-accents'>
          <div className='ptb-swatch is-accent'>
            <i />
            <b>the accent</b>
            <span>#2f5ce0</span>
          </div>
          <div className='ptb-swatch is-accent-lift'>
            <i />
            <b>its dark-band lift</b>
            <span>#86a8ff</span>
          </div>
          <p>
            One per page. The working accent is the toolchain blue; a page may choose its
            own spectral band, but it only ever gets one.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'type',
    body: (
      <>
        <p>
          One face carries the brand. <strong>Inter</strong> is the display, interface
          and text typeface: headlines, interface chrome, captions and long-form reading
          are all set in it. The build is the rsms.me variable Inter (version 4.1, roman
          and italic, with the optical size axis), self-hosted rather than loaded from
          Google Fonts. Headings use weight 500 at most. Long-form text is set at weight
          400. Monospace is an <em>instrument</em> voice for code artifacts (tokens,
          terminals, file paths, small labels in technical diagrams and product UI) and
          appears nowhere else; even those labels are avoided where possible.
        </p>
        <p>
          The identity is multilingual-first. Headlines, UI and marks must hold up in
          CJK, RTL and Indic scripts as well as in Latin; a wordmark or layout that only
          works in English contradicts the company. Inter covers Latin, Greek and
          Cyrillic, so text in other scripts falls back to the system face for that
          script, and every layout is checked in those scripts. Inter is the working
          typeface for the identity project. It is not a final decision; alternatives
          remain open if they bring credible CJK and RTL coverage or well-matched
          companion faces.
        </p>
        <div className='ptb-type'>
          <div className='ptb-face'>
            <span className='ptb-face-tag'>Inter · 300–800, headings at 500 or lighter</span>
            {INTER_WEIGHTS.map((weight) => (
              <p className='ptb-display' key={weight} style={{ fontWeight: weight }}>
                Every product in every language
              </p>
            ))}
          </div>
          <div className='ptb-face'>
            <span className='ptb-face-tag'>Inter · text, roman + italic</span>
            <p className='ptb-inter'>
              General Translation builds full-stack infrastructure for localizing apps,
              docs, and websites: i18n libraries, context-aware translation, and the
              platform that runs them.
            </p>
            <p className='ptb-inter is-italic'>
              The optical size axis adjusts the letterforms to the point size.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'language-as-material',
    body: (
      <>
        <p>
          The signature device: glyphs, characters that make up greater wholes. Writing
          systems are the raw material the brand keeps returning to. The sentence below is
          the reassembler running live. The headline dissolves into glyph dust and the
          same swarm becomes the next language.
        </p>
        <div className='ptb-plate'>
          <ReassemblerDemo />
        </div>
        <p>
          A locale is named one way, everywhere: flag print first, code in the
          surface&rsquo;s own mono. The prints are SVG, never emoji; a flag is a
          functional data chip, never decoration.
        </p>
        <div className='ptb-pills'>
          {PILL_LOCS.map((loc) => (
            <span className='ptb-pill' key={loc}>
              <LocaleTag code={loc} />
            </span>
          ))}
        </div>
        <div className='ptb-devices'>
          {DEVICES.map(([name, what]) => (
            <div className='ptb-device-row' key={name}>
              <Link href={`/docs#${name}`}>
                <b>{name}</b>
              </Link>
              <span>{what}</span>
            </div>
          ))}
        </div>
        <p>
          Every device above runs live, with its API, on{' '}
          <Link href='/docs'>the docs page</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'the-completed-reference',
    body: (
      <>
        <p>The identity is applied on four kinds of surface today.</p>
        <div className='ptb-names'>
          {SHIPS.map(([name, what]) => (
            <div className='ptb-name-row' key={name}>
              <b>{name}</b>
              <span>{what}</span>
            </div>
          ))}
        </div>
        <p className='pt-site-links'>
          <a href='https://generaltranslation.com' rel='noreferrer' target='_blank'>
            open generaltranslation.com
          </a>
          <span aria-hidden> · </span>
          <Link href='/deck'>open the deck</Link>
          <span aria-hidden> · </span>
          <Link href='/motion'>open the films</Link>
          <span aria-hidden> · </span>
          <Link href='/marks'>open the marks</Link>
        </p>
        <p>
          When in doubt about how the brand behaves, read the shipped surface the work
          belongs to.
        </p>
        <p>
          The site grew from the direction of the{' '}
          <Link href='/d/singularity-dossier'>Dossier</Link>, which stays in the gallery
          with the other directions as the working record of how we got there. From
          2026-08-06 to 2026-10-07 this section named it the completed reference for the
          brand.
        </p>
      </>
    ),
  },
  {
    id: 'made-with-the-system',
    body: (
      <>
        <p>
          Finished artwork produced with this toolchain and the Glyphfield studio,
          kept here as proof of what the identity does off the page. The whole
          identity, this page included, is also summarized as a 93-slide
          slideshow at <Link href='/deck'>/deck</Link>.
        </p>
        <div className='ptb-media'>
          <figure className='ptb-shot'>
            <BrandFilm
              name='the Open Source announcement reel'
              poster='/media/open-source-poster.jpg'
              src='/media/open-source-reel.mp4'
            />
            <figcaption>
              the Open Source announcement reel&nbsp;· twelve studio materials cut on the
              beat in the brand blue, landing on the gem smoke composition
            </figcaption>
          </figure>
          <figure className='ptb-shot'>
            <img
              alt='The X profile banner: the halftone dither globe and glyph rain beside the customer logo grid'
              height={1000}
              loading='lazy'
              src='/media/gt-banner-signin@2x.png'
              width={3000}
            />
            <figcaption>
              the X banner&nbsp;· the sign-in globe and glyph rain in the 1-bit language,
              the customer grid at right
            </figcaption>
          </figure>
        </div>
        <h3 id={headingId('made-with-the-system', 'blog-films')}>Blog films</h3>
        <p>
          Each film is a HyperFrames composition: HTML on a seekable timeline,
          rendered frame by frame at 1920 by 1080 and 60&nbsp;fps. The smoke is the gem
          smoke shader from Glyphfield, built on Paper Shaders&rsquo; Gem Smoke
          (Apache-2.0), in the colors of the post&rsquo;s own cover.
        </p>
        <div className='ptb-media'>
          {FILMS.map((film) => (
            <div className='ptb-art' key={film.file}>
              <figure className='ptb-shot'>
                <BrandFilm name={film.name} poster={`/media/${film.poster}`} src={`/media/${film.file}`} />
                <figcaption>{film.caption}</figcaption>
              </figure>
              <p className='pt-site-links ptb-send'>
                <a aria-label={`download the MP4 of ${film.name}`} download href={`/media/${film.file}`}>
                  download the MP4
                </a>
                <Link href={film.post}>read {film.authors}&rsquo;s post</Link>
              </p>
            </div>
          ))}
        </div>
        <h3 id={headingId('made-with-the-system', 'partnership-globes')}>Partnership globes</h3>
        <p>
          The globes are square graphics for laying beside a partner&rsquo;s mark,
          each 2048 by 2048&nbsp;px. The dark ones come on ink, #070707, and the light
          ones on paper, #ffffff. Each also comes as a transparent twin with the same
          art on an alpha ground: a dark twin is for a dark ground and a light twin
          for a light one.
        </p>
        <div className='ptb-globes'>
          {GLOBES.map((globe) => (
            <div className={globe.ground === 'paper' ? 'ptb-art ptb-art-paper' : 'ptb-art'} key={globe.stem}>
              <figure className='ptb-shot'>
                <img
                  alt={globe.alt}
                  height={2048}
                  loading='lazy'
                  src={`/media/${globe.stem}.png`}
                  width={2048}
                />
                <figcaption>{globe.caption}</figcaption>
              </figure>
              <p className='pt-site-links ptb-send'>
                <a aria-label={`PNG on ${globe.ground} of ${globe.name}`} download href={`/media/${globe.stem}.png`}>
                  PNG on {globe.ground}
                </a>
                <a
                  aria-label={`transparent PNG of ${globe.name}`}
                  download
                  href={`/media/${globe.stem}-transparent.png`}
                >
                  transparent PNG
                </a>
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'context-for-partners',
    body: (
      <>
        <p>
          The industry is AI developer tools: the full stack for localization, meaning
          i18n libraries, context-aware translation APIs, and the infrastructure for
          versioning, editing, and integrations. The audience is technical and product
          leadership at growth-stage companies; their engineering and growth teams are
          the users. Auth0 translates docs with <GtWord />, Sierra translates marketing and sales
          material, Ramp translates its core dashboard. Against legacy, seat-based TMS
          point solutions, <GtWord />{' '}is usage-based and owns the whole stack, so it can own the
          whole experience.
        </p>
        <h3 id={headingId('context-for-partners', 'direction')}>Direction</h3>
        <p>
          International Style discipline with Art Deco&rsquo;s future-embracing stance.
          Swiss grids, blueprints, boxes, no rounded corners. Water and ocean as the
          recurring theme, connecting the globe. Bespoke material textures, in the
          spirit of materialarchiv.ch.
        </p>
        <h3 id={headingId('context-for-partners', 'references')}>References</h3>
        <p>
          Josef Müller-Brockmann and the Swiss poster tradition. Otl Aicher&rsquo;s
          Munich 1972 pictograms. Vignelli&rsquo;s subway map. Split-flap departure
          boards. Undersea cable maps and nautical charts. The Rosetta Stone. The
          Chrysler Building. Powers of Ten. Vintage National Geographic. Borges&rsquo;
          Library of Babel. The Whole Earth Catalog. Transit signage. NYRB Classics.
          Dieter Rams. Vintage Olympics stamps.
        </p>
        <div className='ptb-brief'>
          <div className='ptb-brief-col'>
            <h3 id={headingId('context-for-partners', 'admired')}>Admired</h3>
            <ul className='pt-post-rules'>
              <li>Vercel, Resend, Stripe: reliable, developer-first infrastructure with engineering excellence.</li>
            </ul>
          </div>
          <div className='ptb-brief-col'>
            <h3 id={headingId('context-for-partners', 'avoid')}>Avoid</h3>
            <ul className='pt-post-rules'>
              <li>
                Monospace as the brand voice in headlines, body, or marketing. Small mono
                labels inside technical diagrams and product UI remain instruments; avoid
                even those where possible.
              </li>
              <li>
                Smooth scrolling, scroll-hijacking, and inertia libraries. Native scroll
                everywhere.
              </li>
              <li>Robot and sparkle iconography for AI.</li>
              <li>
                The flag-soup cliche. Flags are functional data chips only, printed as
                SVG, never emoji.
              </li>
              <li>Iridescent AI gradients and glassmorphism.</li>
              <li>
                Eyebrow text that has not earned its place. Three stacked lines saying
                the same thing is noise; functional tags and labels are fine.
              </li>
              <li>Em dashes in rendered prose.</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
];

/**
 * The brand book: General Translation's identity laid out in one ruled
 * column, for anyone who has to build with it (including basement studio),
 * read inside the viewer shell. The written canon is BRAND.md (served at
 * /docs/brand), whose reading time is the head's Reading fact; the laws
 * behind the visuals are DESIGN.md; and the engines run live on /docs.
 * The routes that used to close the article (Docs, Deck, Present) are one
 * click away in the index panel's Pages group.
 */
export default function BrandPage() {
  /* the literal file name keeps the build's file trace to BRAND.md */
  const reading = readingMinutes(readFileSync(join(process.cwd(), 'BRAND.md'), 'utf8'));
  return <BrandViewer lead={LEAD} note={NOTE} pages={PAGES} updated={requireUpdated('/brand')} readingMinutes={reading} />;
}
