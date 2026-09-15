import Image from 'next/image';

import { Carved } from './deco/Carved';
import Inlay from './deco/Inlay';
import { BarDot } from './deco/Ornament';
import { RecessFloor } from './deco/ReliefField';
import { CASCADE, CLI_RUN, LINKS, LOCADEX_TRACE } from './content';

/**
 * The dark moment: a shadowed recess cut into the wall, the width of the
 * column, with a stepped niche head above it. The floor is black stone in
 * shadow; the inner wall on the right and the sill face the light and are
 * dithered alabaster fading into the dark. Inside stands the stele, four
 * registers as on the Rosetta Stone: the head with the Locadex mark, the
 * inscribed run beside the trace, the context cascade as three setbacks,
 * the acts. The recess never remaps with the theme.
 */
export default function Recess() {
  return (
    <section className='rr-recess' id='locadex'>
      <div className='rr-niche-head' aria-hidden='true'>
        <span className='rr-niche-step is-3' />
        <span className='rr-niche-step is-2' />
        <span className='rr-niche-step is-1' />
      </div>

      <div className='rr-recess-floor'>
        <RecessFloor />
        <div className='rr-stele-in'>
          <div className='rr-stele-reg rr-stele-head'>
            <BarDot n={5} />
            <div className='rr-stele-title'>
              <Image
                className='rr-lx is-inverted'
                src='/brand/no-bg-locadex-logo-light.png'
                alt='Locadex'
                width={36}
                height={36}
              />
              <h2>
                <Carved text='The Locadex agent' />
              </h2>
            </div>
            <p className='rr-stele-sub'>
              A commit triggers the workflow. Locadex reads the file that changed, wraps the tree in{' '}
              <code>{'<T>'}</code>, writes the translations against the file it read, and opens the
              pull request.
            </p>
          </div>

          <div className='rr-stele-reg rr-stele-body'>
            <div className='rr-stele-run'>
              <p className='rr-stele-label'>gt cli</p>
              <p className='rr-stele-line'>
                <span className='rr-term-prompt' aria-hidden='true'>
                  $
                </span>{' '}
                {CLI_RUN.command}
              </p>
              <p className='rr-stele-line is-out'>{CLI_RUN.result}</p>
              <p className='rr-stele-chips'>
                {CLI_RUN.locales.map((code) => (
                  <Inlay code={code} key={code} />
                ))}
              </p>
            </div>
            <ol className='rr-stele-trace'>
              <li className='rr-stele-label'>trace</li>
              {LOCADEX_TRACE.map((line) => (
                <li className='rr-stele-line' key={line}>
                  {line}
                </li>
              ))}
            </ol>
          </div>

          <div className='rr-stele-reg rr-cascade'>
            <div className='rr-cascade-cap'>
              <h3>{CASCADE.title}</h3>
              <p>{CASCADE.lead}</p>
            </div>
            <ol className='rr-cascade-steps'>
              <li className='rr-cascade-step'>
                <span className='rr-stele-label'>Organization</span>
                <dl className='rr-cascade-kv'>
                  <dt>Glossary</dt>
                  <dd>{CASCADE.organization.glossary}</dd>
                  <dt>Directives</dt>
                  <dd>
                    {CASCADE.organization.directive} <Inlay code={CASCADE.organization.directiveLocale} />
                  </dd>
                </dl>
              </li>
              <li className='rr-cascade-step'>
                <span className='rr-stele-label'>Project</span>
                <ol className='rr-cascade-groups'>
                  {CASCADE.project.groups.map((group) => (
                    <li key={group.name}>
                      <span className='rr-cascade-rank'>{group.rank}</span>
                      <b>{group.name}</b>
                      <span className='rr-cascade-scope'>{group.scope}</span>
                    </li>
                  ))}
                </ol>
                <p className='rr-cascade-verdict'>{CASCADE.project.verdict}</p>
              </li>
              <li className='rr-cascade-step'>
                <span className='rr-stele-label'>Component</span>
                <pre className='rr-cascade-code'>
                  <code>
                    {'<T '}
                    <span className='rr-tok-str'>{CASCADE.component.attribute}</span>
                    {'>'}
                    {'\n  '}
                    {CASCADE.component.source}
                    {'\n</T>'}
                  </code>
                </pre>
                <p className='rr-cascade-res'>
                  <Inlay code={CASCADE.component.locale} />
                  <b lang={CASCADE.component.locale}>{CASCADE.component.kept}</b>
                  <s lang={CASCADE.component.locale}>{CASCADE.component.dropped}</s>
                </p>
              </li>
            </ol>
          </div>

          <div className='rr-stele-reg rr-stele-acts'>
            <a className='rr-btn is-solid' href={LINKS.demo}>
              Get a Demo
            </a>
            <a className='rr-btn is-line' href={LINKS.docsLocadex}>
              Read the Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
