import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import PrismaticField from '@/components/shared/PrismaticField';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { DIRECTIONS } from '@/lib/directions';

import PrototemplateHero from './PrototemplateHero';
import SiteCompare from './SiteCompare';

import './prototemplate.css';

/* The nameplate speaks two voices, neither of them Switzer: Fraunces for the
   working model, Space Grotesk for the reusable form. The POST below it runs
   TWK Lausanne (locally installed or dropped into public/fonts/lausanne),
   falling back to Inter. */
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

/* Titles, descriptions, OG card, canonical, and icons all come from the root
   layout's defaults — this page IS the site root. Only the structured data
   below is page-specific. */

const SITE_URL = 'https://prototemplate.vercel.app';

/**
 * JSON-LD for search and answer engines: the site, and the index as a
 * collection of the curated directions. Serialized server-side; `<` is
 * escaped so page content can never close the script tag.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Prototemplate',
      alternateName: 'GT Website Redesign Explorations',
      description:
        'Prototype × template — the working index of General Translation website redesign directions.',
      publisher: {
        '@type': 'Organization',
        name: 'General Translation',
        url: 'https://generaltranslation.com',
      },
    },
    {
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/#collection`,
      url: `${SITE_URL}/`,
      name: 'Prototemplate — GT Website Redesign Explorations',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      description:
        'Eighteen art directions for the General Translation website, each running live: five full site concepts and thirteen single-page explorations.',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: DIRECTIONS.length,
        itemListElement: DIRECTIONS.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'CreativeWork',
            name: d.name,
            description: d.concept,
            url: `${SITE_URL}/d/${d.slug}`,
          },
        })),
      },
    },
  ],
};

/** The five full site concepts vs the single-page explorations. */
const SITES = DIRECTIONS.filter((d) => d.site);
const EXPLORATIONS = DIRECTIONS.filter((d) => !d.site);

/** The presenter's actual running order. */
const DECK = [
  { n: '01', name: 'Intro', note: 'the nameplate' },
  { n: '02', name: 'Why', note: 'the case for a redesign' },
  { n: '03', name: 'Principles', note: 'the rules the system runs on' },
  { n: '04', name: 'Craft', note: 'the details, measured' },
  { n: '05', name: 'Type detail', note: 'letterforms at working size' },
  { n: '06', name: 'Prototypes', note: 'every direction, live' },
  { n: '07', name: 'Scoreboard', note: 'how each round was judged' },
] as const;

export default function IndexPage() {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
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
            <Link href='/craft'>Craft</Link>
            {/* the toolchain family as a previewing dropdown: the SSOT and
                the five sites built on it, each with its live capture */}
            <div className='pt-menu'>
              <button className='pt-menu-trigger' type='button'>
                Toolchain <span aria-hidden>▾</span>
              </button>
              <div className='pt-menu-panel'>
                <div className='pt-menu-card'>
                  {[{ slug: 'toolchain', name: 'Toolchain' }, ...SITES].map((d) => (
                    <Link className='pt-menu-item' href={`/d/${d.slug}`} key={d.slug}>
                      <span aria-hidden className='pt-menu-shot'>
                        <img alt='' className='is-light' loading='lazy' src={`/shots/light/${d.slug}.jpg`} />
                        <img alt='' className='is-dark' loading='lazy' src={`/shots/dark/${d.slug}.jpg`} />
                      </span>
                      <span>{d.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link className='pt-nav-present' href='/present'>
              Present <span aria-hidden>▶</span>
            </Link>
            <a
              aria-label='View the source on GitHub'
              className='pt-nav-github'
              href='https://github.com/Kevin-Liu-01/Prototemplate'
              rel='noreferrer'
              target='_blank'
            >
              <svg aria-hidden fill='currentColor' height='20' viewBox='0 0 16 16' width='20'>
                <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z' />
              </svg>
            </a>
          </div>
        </header>

        <section className='pt-sec'>
          <PrototemplateHero />
        </section>

        <div className='pt-hatch' aria-hidden='true' />

        {/* ---- the post: a short article — motivation, research, discovery,
             sharing — set in Lausanne at reading scale. No eyebrows, no
             display sizes; the rails, hatches and hairlines carry the
             structure the way they do everywhere else. ---- */}
        <article className='pt-post'>
          <section className='pt-sec pt-post-sec pt-opener'>
            <div className='pt-opener-copy'>
              <h1>Redesigning General Translation</h1>
              <p className='pt-post-byline'>Kevin Liu · August 2026</p>
              <p>
                This site is the working file of a redesign: every direction I tried, the tooling
                that judged them, and the five full sites that came out the other end. Everything
                here is live — real pages, not mockups.
              </p>
              <p>
                The current site grew the way most startup sites do — section by section, launch
                by launch, each addition reasonable and the whole slowly losing its argument. I
                wanted to stop patching and ask the question properly: what should this company
                look like when the answer is built from the ground up?
              </p>
              <p>
                So instead of one redesign, I built many, made them compete, and built the tooling
                to judge them — down to a pixel auditor that walks every rendered line on every
                page and fails a round on a single doubled rule.
              </p>
            </div>

            {/* the distillation, held in a crop frame: the four rules extend
                from the diagram's edges to the section's own — the nameplate's
                frame grammar, one more time */}
            <figure className='pt-opener-fig' aria-hidden>
              <i className='pt-xline is-h is-top' />
              <i className='pt-xline is-h is-bot' />
              <i className='pt-xline is-v is-l' />
              <i className='pt-xline is-v is-r' />
              <svg className='pt-funnel' viewBox='0 0 320 268'>
                <g className='pt-funnel-box'>
                  <rect x='10' y='10' width='300' height='58' />
                  <rect x='40' y='105' width='240' height='58' />
                  <rect x='70' y='200' width='180' height='58' />
                </g>
                <g className='pt-funnel-drop'>
                  <line x1='160' y1='68' x2='160' y2='105' />
                  <line x1='160' y1='163' x2='160' y2='200' />
                </g>
                <g className='pt-funnel-n'>
                  <text x='34' y='46'>20+</text>
                  <text x='64' y='141'>13</text>
                  <text x='94' y='236'>5</text>
                </g>
                <g className='pt-funnel-t'>
                  <text x='94' y='45'>directions built</text>
                  <text x='110' y='140'>survived review</text>
                  <text x='128' y='235'>full sites</text>
                </g>
              </svg>
            </figure>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-feature-sec'>
            <div className='pt-feature'>
              <PrismaticField className='pt-feature-field' preset='1' speed={0.4} params={{ exposureScale: 4600 }} />
              <div>
                <h2>Walk the whole thing</h2>
                <p>
                  The full deck — the storyboard, the principles, every live prototype, and the
                  scoreboard that picked the winners.
                </p>
                <Link className='pt-feature-cta' href='/present'>
                  ▶ Open the deck
                </Link>
              </div>
              <div className='pt-deck'>
                {DECK.map((slide) => (
                  <div className='pt-deck-row' key={slide.n}>
                    <b>
                      {slide.n} {slide.name}
                    </b>
                    <span>{slide.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec pt-sites-intro'>
            <h2>The five sites</h2>
            <p>
              The strongest ideas grew into complete sites: a home built on the toolchain system,
              each with its own take on the hero terminal, over an enterprise page built on the
              singularity gate. The two faces of each site are overlaid below — drag the seam to
              sweep between them.
            </p>
            {/* the five captures fanned at the right edge, absolutely placed
                and cut off by the section's own corner */}
            <span aria-hidden className='pt-sites-fan'>
              {SITES.map((site, i) => (
                <span className='pt-sites-fan-shot' key={site.slug} style={{ ['--i' as never]: i }}>
                  <img alt='' className='is-light' draggable={false} loading='lazy' src={`/shots/light/${site.slug}.jpg`} />
                  <img alt='' className='is-dark' draggable={false} loading='lazy' src={`/shots/dark/${site.slug}.jpg`} />
                </span>
              ))}
            </span>
          </section>

          <div className='pt-sites'>
            {SITES.map((site) => (
              <section className='pt-sec pt-site' key={site.slug}>
                <h3>{site.name}</h3>
                <p>{site.signature}</p>
                <SiteCompare slug={site.slug} name={site.name} />
                <p className='pt-site-links'>
                  <Link href={`/d/${site.slug}`}>open the home</Link>
                  <span aria-hidden> · </span>
                  <Link href={`/d/${site.slug}/enterprise`}>open the enterprise page</Link>
                </p>
              </section>
            ))}
          </div>

          <div className='pt-hatch' aria-hidden='true' />

          <section className='pt-sec pt-post-sec'>
            <h2>Every direction</h2>
            <p>
              Twenty-plus directions got built; thirteen survived review. Some are quiet
              evolutions of the current site, some are physics experiments with type. Each row
              below is a live page.
            </p>
          </section>

          <div className='pt-rows pt-post-rows'>
            {EXPLORATIONS.map((direction) => (
              <Link className='pt-row' href={`/d/${direction.slug}`} key={direction.slug}>
                <span className='pt-row-label'>{direction.label}</span>
                <span className='pt-row-main'>
                  <h3>{direction.name}</h3>
                  <p>{direction.concept}</p>
                </span>
                <span aria-hidden='true' className='pt-row-shot'>
                  <img alt='' className='is-light' loading='lazy' src={`/shots/light/${direction.slug}.jpg`} />
                  <img alt='' className='is-dark' loading='lazy' src={`/shots/dark/${direction.slug}.jpg`} />
                </span>
              </Link>
            ))}
          </div>
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
          <span className='pt-foot-right'>
            prototype × template
            <a
              href='https://x.com/sabosugi/status/2081742206847828171'
              rel='noreferrer'
              target='_blank'
            >
              prismatic shader by @sabosugi ↗
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
