'use client';

import { CLI_LOCALES, CLI_SESSION, CONTEXT_STEPS, LINKS, TRACE } from '../data';
import { plazaFloor, useDitherField } from '../fields';
import { Chip } from './deco/Chip';

/**
 * The plaza: the page's one dark moment, full bleed, where the stair from
 * the top platform reaches the ground. Volcanic stone in both themes; its
 * tokens never remap. On the plaza: the gt cli session with its five locale
 * chips, the context stair (three treads, Organization to Component), the
 * timestamped trace of one commit, the two acts, and the paved floor drawn
 * by the dither engine with the stair axis continuing down its middle.
 */
export default function Plaza() {
  const floor = useDitherField(plazaFloor(), { scale: 3, fps: 20 });

  return (
    <section className='tt-plaza' id='plaza'>
      <div className='tt-plaza-in'>
        <header className='tt-head is-plaza'>
          <h2 className='tt-h2'>One project, one config, one bill</h2>
          <p>Build time, runtime, and review share one context, from the organization down to the component.</p>
        </header>

        <div className='tt-plaza-grid'>
          <div className='tt-plaza-col'>
            <div className='tt-cli'>
              <div className='tt-cli-bar'>
                <span>gt cli</span>
                <span>app/page.tsx</span>
              </div>
              <div className='tt-cli-body'>
                <code className='tt-cli-cmd'>{CLI_SESSION.command}</code>
                <span className='tt-cli-line'>{CLI_SESSION.summary}</span>
                <span className='tt-cli-chips'>
                  {CLI_LOCALES.map((code) => (
                    <Chip key={code} code={code} className='is-dark' />
                  ))}
                </span>
                <span className='tt-cli-line is-result'>{CLI_SESSION.result}</span>
              </div>
            </div>

            <ol className='tt-context' aria-label='Context, inherited down three levels'>
              {CONTEXT_STEPS.map((step, i) => (
                <li key={step.level} className='tt-context-step' data-step={i}>
                  <span className='tt-context-level'>{step.level}</span>
                  <span className='tt-context-rule'>{step.rule}</span>
                  <code className='tt-context-sample'>{step.sample}</code>
                </li>
              ))}
            </ol>
          </div>

          <div className='tt-plaza-col'>
            <div className='tt-trace'>
              <div className='tt-trace-bar'>
                <span>trace</span>
                <span>one commit, on the clock</span>
              </div>
              <ol className='tt-trace-rows'>
                {TRACE.map((row) => (
                  <li key={row.time} className='tt-trace-row'>
                    <time className='tt-trace-time'>{row.time}</time>
                    <span className='tt-trace-stage'>{row.stage}</span>
                    <span className='tt-trace-value'>
                      {row.code ? (
                        <>
                          <Chip code={row.code} className='is-dark' /> · {row.value}
                        </>
                      ) : (
                        row.value
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className='tt-acts is-plaza'>
              <a className='tt-btn tt-btn-solid is-dark' href={LINKS.getStarted}>
                Get Started
              </a>
              <a className='tt-btn tt-btn-line is-dark' href={LINKS.demo}>
                Get a Demo
              </a>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={floor} className='tt-floor' aria-hidden='true' />
    </section>
  );
}
