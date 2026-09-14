/**
 * calendar-rings: the fourth ring, the negative.
 *
 * The page's one high-contrast moment: the ring inverted, ground and ink
 * swapped. Four concrete objects in four cells of one arc band, each a
 * cartouche with a name bar, a face and a base line: the libraries, the
 * CLI session, the review workspace, Locadex. The floor is the second
 * dither surface, the bottom of a larger ring in stepping density.
 */
import Image from 'next/image';

import { CLI_LOCALES, HREFS, LIBRARIES, REVIEW_ROWS } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { NegativeFloor } from '../diagrams/NegativeFloor';
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
        <div className='cr-term-line'>
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

export function Surfaces() {
  return (
    <section className='cr-negative' aria-labelledby='cr-stack-h'>
      <div className='cr-col cr-negative-in'>
        <SectionHead
          n={4}
          id='cr-stack-h'
          title='The stack'
          lead='Libraries in the app, a CLI in the build, a dashboard for review, and Locadex in the repository. One pipeline carries a string from the source file to the translated screen.'
        />
        <ArcBand
          sag={32}
          className='cr-stack-arc'
          cells={[<Libraries key='lib' />, <Cli key='cli' />, <Dashboard key='dash' />, <Locadex key='agent' />]}
        />
        <div className='cr-acts is-center'>
          <a className='cr-btn is-solid' href={HREFS.demo}>
            Get a Demo
          </a>
          <a className='cr-btn is-line' href={HREFS.docs} rel='noreferrer' target='_blank'>
            Read the Docs
          </a>
        </div>
      </div>
      <NegativeFloor />
    </section>
  );
}
