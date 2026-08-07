import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import ReassemblerDemo from '../craft/ReassemblerDemo';
import AttributeScales, { AESTHETIC, PERSONALITY } from './AttributeScales';
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import PtNav from '@/components/shared/PtNav';

import '../prototemplate.css';
import './brand.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'Brand — Prototemplate',
  description:
    'General Translation’s identity, laid out: the name, the idea, the character, the mark, color, type, language as material, and the completed reference.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** The naming system — every name, what it is, one row each. */
const NAMES = [
  ['General Translation, Inc.', 'the company'],
  ['GT', 'the short form, and the mark'],
  ['gt', 'the open-source library — you run gt translate'],
  ['gt-next · gt-react · gt-vue · gt-node · gt-python', 'the framework packages'],
  ['Locadex', 'the AI agent product'],
  ['generaltranslation.com', 'the domain — with gt.sh, generaltranslation.ai/.dev, locadex.com/.ai/.dev'],
] as const;

/** The signature devices, each with its one-line jurisdiction. */
const DEVICES = [
  ['doubled-line', 'every connector is one path stroked twice — the mark’s own grammar in every diagram'],
  ['glyph-reassembler', 'a sentence dissolves to glyph dust and reassembles in the next language — matter conserved'],
  ['glyph-field', 'rain from eight writing systems condenses into the word "language," script after script'],
  ['dither', 'density renders as 1-bit ordered Bayer — the texture of the brand, never an alpha veil'],
  ['iso', 'one 30° projection for every technical drawing, lit from the upper left, one accent per drawing'],
  ['edge-globe', 'the delivery network said once, with ink — depth as dashed hairlines, no fills'],
  ['locale-tag', 'flag print + code: the one way a locale is named, anywhere'],
  ['horizon-field', 'the lensing black hole — reserved for singular moments'],
] as const;

const SWATCHES = [
  ['is-ink', 'ink', '#070707'],
  ['is-raised', 'raised ink', '#101010'],
  ['is-titanium', 'titanium', '#8a8f98'],
  ['is-paper', 'paper', '#ffffff'],
] as const;

const SWITZER_WEIGHTS = [300, 400, 500, 600, 700, 800] as const;

const PILL_LOCS = ['en-GB', 'es', 'ja', 'ar-EG', 'ko', 'zh-Hant', 'hi', 'pt'] as const;

/**
 * The brand book — General Translation's identity laid out in one ruled
 * column, for anyone who has to build with it (including basement studio).
 * The written canon is BRAND.md (served at /docs/brand); the laws behind
 * the visuals are DESIGN.md; the engines run live on /docs; and the
 * completed reference application is the Dossier.
 */
export default function BrandPage() {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <div className='pt-rail'>
        <PtNav />

        <article className='pt-post'>
          <section className='pt-sec pt-post-sec'>
            <h1>The brand</h1>
            <p className='pt-post-byline'>General Translation · the identity, laid out</p>
            <p>
              This page is the brand in one place — the name, the idea, the character, the
              mark, the color and type systems, and the devices that make the identity
              recognizable — written for anyone who has to build with it, including our
              partners at basement studio. The visual laws behind everything here are codified
              in <Link href='/docs/design'>the design system</Link>; every engine runs live on{' '}
              <Link href='/docs'>the docs page</Link>; and the completed reference
              application is <Link href='/d/singularity-dossier'>the Dossier</Link> — treat it
              as the finished statement of this identity, not a concept.
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='the-name'>
            <h2>The name</h2>
            <p>
              <strong>General Translation</strong> was chosen deliberately, in this order.
              First, ambition: like General Motors or General Electric, the name says we intend
              to be the trustworthy, technologically innovative number one in the category — an
              enterprise, in the old sense. Second, generality: a reference to artificial{' '}
              <em>general</em> intelligence — general models outperform specific translation
              models because they understand context and can be directed. Third, distinction:
              every other localization company seemed to begin with an &ldquo;L&rdquo;.
            </p>
            <div className='ptb-names'>
              {NAMES.map(([name, what]) => (
                <div className='ptb-name-row' key={name}>
                  <b>{name}</b>
                  <span>{what}</span>
                </div>
              ))}
            </div>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='the-idea'>
            <h2>The idea</h2>
            <p className='ptb-thesis'>Every product in every language.</p>
            <p>
              Native-level speed and quality, from day one — a simple idea, executed insanely
              hard. The positioning is <strong>the Vercel of localization</strong>: two halves
              designed together — open-source developer tools (the <code>gt</code> libraries)
              and closed-source infrastructure that is the best-in-class way to use them.
              Because we build the entire stack, we can promise what point solutions
              can&rsquo;t: consistent, high-quality translation across a whole business,
              integrated in an afternoon.
            </p>
            <ul className='pt-post-rules'>
              <li>
                Engineering-first — built by people with deep technical roots, for the
                world&rsquo;s best engineering teams.
              </li>
              <li>
                Craft — we care about the difference between drawn-once and drawn-twice lines.
                Literally: the line law audits every page.
              </li>
              <li>
                Infrastructure-grade — reliable, fast, secure. Something an enterprise stands
                on, not an app it tries.
              </li>
              <li>
                Cosmopolitan — urbane, sophisticated, connecting the world and its languages.
                Language is our material, not just our market.
              </li>
            </ul>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='the-character'>
            <h2>The character</h2>
            <p>
              The brand carries itself like a <strong>fullstack director</strong>: it writes
              the script and it pushes the camera — creative and technically innovative, never
              one without the other. On time, under budget, over-delivering, always working
              with the best people, with a keen sense for making things people love.
            </p>
            <h3>Personality</h3>
            <AttributeScales rows={PERSONALITY} />
            <h3>Aesthetic</h3>
            <AttributeScales rows={AESTHETIC} />
            <p className='ptb-scale-caption'>
              Positions are read from the completed system — the working answers, for basement
              to confirm or push.
            </p>
            <h3>Voice</h3>
            <p>
              Declarative, precise, quietly confident. Captions state laws — &ldquo;the ground
              is the seam.&rdquo; Sentences carry their own weight: no exclamation marks doing
              the work, no hedging, no marketing adjectives where a fact would do. Wit is
              allowed as precision, never as decoration.
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
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='the-mark'>
            <h2>The mark</h2>
            <p>
              Every stroke of the GT monogram is two parallel lines — the doubled-line grammar
              at brand scale, the same device that runs through every diagram in the system.
              The mark renders in one ink: ink on paper, or paper on ink. Never a third color,
              never a gradient, never a shadow. The dark surface inverts the drawn mark&rsquo;s
              ink; in illustration systems the mark renders as an alpha mask so the shape takes
              the surface&rsquo;s ink, and the one sanctioned flourish is the Bayer-dithered
              specular shimmer — never a GIF, never a glow.
            </p>
            <div className='ptb-marks'>
              <figure className='ptb-mark is-paper'>
                <img alt='The GT monogram in ink on paper' src='/brand/gt-logo-light.svg' />
                <figcaption>ink on paper</figcaption>
              </figure>
              <figure className='ptb-mark is-ink'>
                <img alt='The GT monogram in paper on ink' src='/brand/gt-logo-dark.svg' />
                <figcaption>paper on ink</figcaption>
              </figure>
              <figure className='ptb-mark is-paper'>
                <img alt='The Locadex mark' src='/brand/locadex-mark.svg' />
                <figcaption>Locadex — the agent&rsquo;s own mark</figcaption>
              </figure>
            </div>
            <p>
              At text size the wordmark sits inline with prose, at the cap height of the line
              it lives in — the way the Dossier&rsquo;s hero sets &ldquo;GT builds full-stack
              infrastructure&hellip;&rdquo;.
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='color'>
            <h2>Color</h2>
            <p>
              Four absolute colors, one spectral accent per page. Structural color everywhere
              derives from the four as alpha steps — every text step is ink or white at some
              alpha, every hairline titanium at some alpha — and dark mode is a pure token
              remap: one surface family in the dark, the way light mode is one white. The
              accent is a controlled edge, never a wash; depth comes from lines and material,
              never shadows.
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
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='type'>
            <h2>Type</h2>
            <p>
              Two faces carry the brand. <strong>Switzer</strong> is the display and UI voice —
              headlines, interface chrome, the declarative captions. <strong>Inter</strong> is
              the text companion — the real rsms.me variable Inter with the optical-size axis,
              not the Google Fonts build — for long-form reading. Monospace is an{' '}
              <em>instrument</em> voice, not a brand voice: it appears where code artifacts
              appear — tokens, terminals, file paths — and nowhere else. The serif and grotesk
              on this page are the lab&rsquo;s own stationery, not the product brand.
            </p>
            <div className='ptb-type'>
              <div className='ptb-face'>
                <span className='ptb-face-tag'>Switzer · 300–800</span>
                {SWITZER_WEIGHTS.map((weight) => (
                  <p className='ptb-switzer' key={weight} style={{ fontWeight: weight }}>
                    Every product in every language
                  </p>
                ))}
              </div>
              <div className='ptb-face'>
                <span className='ptb-face-tag'>Inter · variable, roman + italic</span>
                <p className='ptb-inter'>
                  General Translation builds full-stack infrastructure for localizing apps,
                  docs, and websites — i18n libraries, context-aware translation, and the
                  platform that runs them.
                </p>
                <p className='ptb-inter is-italic'>
                  The optical-size axis keeps text honest at every scale.
                </p>
              </div>
            </div>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='language-as-material'>
            <h2>Language as material</h2>
            <p>
              The signature device: glyphs — characters that make up greater wholes. Writing
              systems are the raw material the brand keeps returning to. The sentence below is
              the reassembler running live: the headline dissolves into glyph dust and the same
              swarm becomes the next language.
            </p>
            <div className='ptb-plate'>
              <ReassemblerDemo />
            </div>
            <p>
              A locale is named one way, everywhere: flag print first, code in the
              surface&rsquo;s own mono.
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
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='the-completed-reference'>
            <h2>The completed reference</h2>
            <p>
              <strong>The Dossier is the completed version of this identity in application</strong>{' '}
              — the belt-driven morphing headline, the translate window, the stack tower
              wearing the Locadex shimmer, the edge globe over its dithered atmosphere, the
              four-color dark band. When in doubt about how the brand behaves in product, the
              Dossier is the answer; the other directions are the working record of how we got
              there.
            </p>
            <div className='ptb-shots'>
              <figure className='ptb-shot'>
                <img alt='The Dossier home, light theme' loading='lazy' src='/shots/light/singularity-dossier.jpg' />
                <figcaption>the home · light</figcaption>
              </figure>
              <figure className='ptb-shot'>
                <img alt='The Dossier home, dark theme' loading='lazy' src='/shots/dark/singularity-dossier.jpg' />
                <figcaption>the home · dark</figcaption>
              </figure>
              <figure className='ptb-shot'>
                <img alt='The Dossier enterprise page, light theme' loading='lazy' src='/shots/light/singularity-dossier-enterprise.jpg' />
                <figcaption>the enterprise page</figcaption>
              </figure>
            </div>
            <p className='pt-site-links'>
              <Link href='/d/singularity-dossier'>open the home</Link>
              <span aria-hidden> · </span>
              <Link href='/d/singularity-dossier/enterprise'>open the enterprise page</Link>
            </p>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec' id='context-for-partners'>
            <h2>Context for partners</h2>
            <p>
              AI developer tools: the full stack for localization — i18n libraries,
              context-aware translation APIs, and the infrastructure for versioning, editing,
              and integrations. The audience is technical and product leadership at
              growth-stage companies; their engineering and growth teams are the users. Auth0
              translates docs with GT, Sierra translates marketing and sales material, Ramp
              translates its core dashboard. Against legacy, seat-based TMS point solutions,
              GT is usage-based and owns the whole stack — so it can own the whole experience.
            </p>
            <div className='ptb-brief'>
              <div className='ptb-brief-col'>
                <h3>Admired</h3>
                <ul className='pt-post-rules'>
                  <li>Vercel, Resend, Stripe — reliable, developer-first infrastructure with engineering excellence.</li>
                </ul>
              </div>
              <div className='ptb-brief-col'>
                <h3>Avoid</h3>
                <ul className='pt-post-rules'>
                  <li>Monospace as brand typography — mono is for code artifacts only.</li>
                  <li>Smooth scrolling.</li>
                  <li>The generic robot icon.</li>
                </ul>
              </div>
            </div>
            <p className='pt-site-links'>
              <Link href='/docs/brand'>read the written canon</Link>
              <span aria-hidden> · </span>
              <Link href='/docs/design'>read the design system</Link>
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
