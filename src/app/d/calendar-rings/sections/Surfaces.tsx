/**
 * calendar-rings: the negative, ring two unrolled.
 *
 * The page's one high-contrast moment: ground and ink swap, and the disk
 * itself returns inverted as the band's floor, cut by the band's lower
 * edge so its rings rise from it. Four concrete objects sit in four cells
 * of one arc band, each a cartouche with a name bar, a face and a base
 * line: the libraries with their real formatted outputs, the CLI session
 * with its config, the review workspace, Locadex. Under them the nine
 * beats of the pipeline run as a second, shallower arc, one numeral per
 * beat.
 */
import Image from 'next/image';

import { CAPABILITIES, CLI_CONFIG, CLI_LOCALES, HREFS, LIBRARIES, PIPELINE, REVIEW_ROWS, SURFACES } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { Disk } from '../diagrams/Disk';
import { Chip } from './Chip';
import { SectionHead } from './SectionHead';

function Libraries() {
  return (
    <article className='cr-object'>
      <div className='cr-object-bar'>
        <span>libraries</span>
        <span className='cr-object-meta'>6 first-party SDKs</span>
      </div>
      <ul className='cr-pkgs'>
        {LIBRARIES.map((lib) => (
          <li key={lib.pkg}>
            <span>{lib.name}</span>
            <code>{lib.pkg}</code>
          </li>
        ))}
      </ul>
      {/* the outputs the components format for the locale, as the frameworks window ships them */}
      <dl className='cr-caps'>
        {CAPABILITIES.map((cap) => (
          <div key={cap.label} className='cr-caps-row'>
            <dt>{cap.label}</dt>
            <dd>
              <code>{cap.output}</code>
            </dd>
          </div>
        ))}
      </dl>
      <div className='cr-object-foot'>
        <code>npm i gt-next</code>
        <code>npx gt@latest</code>
      </div>
    </article>
  );
}

function Cli() {
  return (
    <article className='cr-object'>
      <div className='cr-object-bar'>
        <span>gt cli</span>
        <span className='cr-object-meta'>gt.config.json</span>
      </div>
      <div className='cr-term'>
        <div className='cr-term-line is-dim'>{'{'}</div>
        {CLI_CONFIG.map((line) => (
          <div key={line} className='cr-term-line is-config'>
            {line}
          </div>
        ))}
        <div className='cr-term-line is-dim'>{'}'}</div>
        <div className='cr-term-line is-cmd'>
          <span className='cr-term-prompt'>$</span> npx gt translate
        </div>
        <div className='cr-term-line is-dim'>128 strings · 3 new · 2 changed</div>
        <div className='cr-term-chips'>
          {CLI_LOCALES.map((code) => (
            <Chip key={code} code={code} />
          ))}
        </div>
        <div className='cr-term-line is-dim'>640 translations</div>
      </div>
      <div className='cr-object-foot'>
        <code>npx gt translate --dry-run</code>
      </div>
    </article>
  );
}

function Dashboard() {
  return (
    <article className='cr-object'>
      <div className='cr-object-bar'>
        <span>workspace · es-419</span>
        <span className='cr-object-meta'>4 strings</span>
      </div>
      <ol className='cr-review'>
        {REVIEW_ROWS.map((row) => (
          <li key={row.source}>
            <span className='cr-review-src' lang='en'>
              {row.source}
            </span>
            <span className='cr-review-tr' lang='es'>
              {row.translation}
            </span>
          </li>
        ))}
      </ol>
      <div className='cr-object-foot'>
        <span>⌘K search</span>
        <span>history</span>
        <span>download</span>
        <span>agent · locadex</span>
      </div>
    </article>
  );
}

function Locadex() {
  return (
    <article className='cr-object'>
      <div className='cr-object-bar'>
        <span>agent · locadex</span>
        <span className='cr-object-meta'>PR #218</span>
      </div>
      <div className='cr-locadex'>
        <Image
          className='cr-locadex-mark'
          src='/brand/no-bg-locadex-logo-light.png'
          alt='Locadex'
          width={52}
          height={52}
        />
        <p>
          Locadex reads the repository, writes the translations for every configured locale, and opens the pull
          request for review.
        </p>
      </div>
      <div className='cr-object-foot'>
        <span>128 strings</span>
        <span>6 locales</span>
        <span>640 translations</span>
      </div>
    </article>
  );
}

const OBJECTS = {
  libraries: <Libraries key='libraries' />,
  cli: <Cli key='cli' />,
  dashboard: <Dashboard key='dashboard' />,
  locadex: <Locadex key='locadex' />,
} as const;

export function Surfaces() {
  return (
    <section className='cr-negative' aria-labelledby='cr-stack-h'>
      <div className='cr-col cr-negative-in'>
        <SectionHead
          count={SURFACES.length}
          ring='Ring two, unrolled'
          id='cr-stack-h'
          title='The stack'
          lead='Libraries in the app, a CLI in the build, a dashboard for review, and Locadex in the repository. One pipeline carries a string from the source file to the translated screen.'
        />
        <ArcBand
          sag={32}
          numerals
          subdivide={3}
          className='cr-stack-arc'
          cells={SURFACES.map((surface) => OBJECTS[surface.id])}
        />

        <p className='cr-band-cap'>How a string becomes a shipped translation.</p>
        <ArcBand
          sag={22}
          numerals
          subdivide={2}
          as='ol'
          label='The pipeline'
          className='cr-pipe-arc'
          cells={PIPELINE.map((beat) => (
            <div key={beat.n} className='cr-beat'>
              <h3>{beat.title}</h3>
              <code>{beat.step}</code>
            </div>
          ))}
        />

        <div className='cr-acts is-center'>
          <a className='cr-btn is-solid' href={HREFS.demo}>
            Get a Demo
          </a>
          <a className='cr-btn is-line' href={HREFS.docs} rel='noreferrer' target='_blank'>
            Read the Docs
          </a>
        </div>

        {/* the floor: the disk inverted, cut by the band's lower edge */}
        <div className='cr-floor'>
          <Disk crown='General Translation' variant='floor' />
        </div>
      </div>
    </section>
  );
}
