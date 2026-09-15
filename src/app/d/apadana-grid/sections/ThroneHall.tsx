'use client';

/**
 * The throne hall at night: the page's one dark moment, a full-bleed band
 * of black basalt with its own wall pair. A 3 by 3 column field in gold
 * hairline holds four rooms, the product surfaces as concrete objects:
 * the libraries (six stacks, one mounted code window), the CLI (the
 * `gt translate` session), the dashboard (the review workspace, source
 * beside translation), and Locadex (the mark and the trace of one run).
 * The floor around the field is ordered dither, one lamp's light cut into
 * tiers. The band stays dark in both themes; its tokens never remap.
 */
import Image from 'next/image';
import { useState } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import {
  CLI_LINES,
  CLI_LOCALES,
  CLI_TAIL,
  DEMO_URL,
  LOCADEX_TRACE,
  REVIEW_BAR,
  REVIEW_FOOT,
  REVIEW_ROWS,
  SIGNIN_URL,
} from '../data';
import { torchFloor, useDither } from '../fields';
import { CodeWindow } from './CodeWindow';
import { Rosette } from './deco/Rosette';
import { Bay, Hall, Row } from './deco/Hall';
import { LocaleChip } from './LocaleChip';

function Libraries() {
  const first = FRAMEWORKS[0];
  const [active, setActive] = useState(first?.id ?? 'next');
  const current = FRAMEWORKS.find((fw) => fw.id === active) ?? first;
  if (!current) return null;
  return (
    <div className='apg-room'>
      <h3 className='apg-room-h'>Libraries</h3>
      <div className='apg-tabs' role='tablist' aria-label='Frameworks'>
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            type='button'
            role='tab'
            id={`apg-tab-${fw.id}`}
            aria-selected={fw.id === current.id}
            aria-controls='apg-tabpanel'
            tabIndex={fw.id === current.id ? 0 : -1}
            className={fw.id === current.id ? 'apg-tab is-on' : 'apg-tab'}
            onClick={() => setActive(fw.id)}
          >
            {fw.name}
          </button>
        ))}
      </div>
      <div id='apg-tabpanel' role='tabpanel' aria-labelledby={`apg-tab-${current.id}`}>
        <CodeWindow file={current.file} code={current.code} className='is-dark' />
      </div>
      <p className='apg-room-cap'>
        <code>{current.install[0]}</code>
        <span aria-hidden='true'> · </span>
        <code>{current.install[1]}</code>
      </p>
    </div>
  );
}

function Cli() {
  return (
    <div className='apg-room'>
      <h3 className='apg-room-h'>CLI</h3>
      <div className='apg-term'>
        <div className='apg-term-bar'>
          <span>gt · acme/web</span>
        </div>
        <div className='apg-term-body'>
          {CLI_LINES.map((line) => (
            <div key={line.text} data-tone={line.tone}>
              {line.text}
            </div>
          ))}
          <div className='apg-term-locs'>
            <i aria-hidden='true'>✓</i>
            {CLI_LOCALES.map((loc) => (
              <LocaleChip key={loc} code={loc} className='is-term' />
            ))}
          </div>
          <div data-tone='dim'>{CLI_TAIL}</div>
        </div>
      </div>
      <p className='apg-room-cap'>
        Runs in CI or on your machine. <code>--dry-run</code> prints the plan and bills 0 tokens.
      </p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className='apg-room'>
      <h3 className='apg-room-h'>Dashboard</h3>
      <div className='apg-review'>
        <div className='apg-review-bar'>
          <span>{REVIEW_BAR.scope}</span>
          <span>{REVIEW_BAR.count}</span>
        </div>
        <div className='apg-review-head' aria-hidden='true'>
          <span className='is-source'>
            source · <LocaleTag code='en' />
          </span>
          <span>
            translation · <LocaleTag code='es' />
          </span>
        </div>
        {REVIEW_ROWS.map((row) => (
          <div className='apg-review-row' key={row.key}>
            <span className='apg-review-src' lang='en'>
              {row.source}
            </span>
            <span className='apg-review-tr' lang='es'>
              {row.previous ? <s>{row.previous}</s> : null}
              <span>{row.translation}</span>
              <b className='apg-stamp' data-kind={row.final === 'edit' ? 'chip' : 'ok'}>
                {row.final === 'edit' ? 'edited' : 'approved'}
              </b>
            </span>
          </div>
        ))}
        <div className='apg-review-foot'>
          {REVIEW_FOOT.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Locadex() {
  return (
    <div className='apg-room'>
      <h3 className='apg-room-h'>Locadex</h3>
      <div className='apg-agent'>
        <div className='apg-agent-head'>
          <Image
            className='apg-agent-mark'
            src='/brand/no-bg-locadex-logo-light.png'
            alt='Locadex'
            width={28}
            height={28}
          />
          <span>agent · locadex</span>
        </div>
        <ol className='apg-trace'>
          {LOCADEX_TRACE.map((entry) => (
            <li key={entry.step}>
              <span className='apg-trace-step'>{entry.step}</span>
              <span className='apg-trace-text'>{entry.text}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className='apg-room-cap'>
        Reads the file that changed, wraps what was never wrapped, and opens the pull request.
      </p>
    </div>
  );
}

export function ThroneHall() {
  const floor = useDither(torchFloor, { scale: 4, fps: 8 });
  return (
    <section className='apg-band' id='platform' aria-labelledby='apg-band-h'>
      <div className='apg-band-in'>
        <div className='apg-thresh is-dark'>
          <Rosette />
          <h2 id='apg-band-h'>Everything localization needs.</h2>
          <p>
            The libraries in your code, the CLI in your pipeline, the dashboard for review, and
            Locadex in your repository. One project context runs through all four.
          </p>
        </div>

        <Hall
          cols={2}
          base={96}
          aisle={0.25}
          className='is-throne'
          under={<canvas ref={floor} className='apg-floor' aria-hidden='true' />}
        >
          <Row>
            <Bay className='is-room'>
              <Libraries />
            </Bay>
            <Bay className='is-room'>
              <Cli />
            </Bay>
          </Row>
          <Row>
            <Bay className='is-room'>
              <Dashboard />
            </Bay>
            <Bay className='is-room'>
              <Locadex />
            </Bay>
          </Row>
        </Hall>

        <div className='apg-thresh is-after is-dark'>
          <div className='apg-acts'>
            <a className='apg-btn is-solid is-onDark' href={SIGNIN_URL}>
              Get Started
            </a>
            <a className='apg-btn is-line is-onDark' href={DEMO_URL}>
              Talk to an Engineer
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
