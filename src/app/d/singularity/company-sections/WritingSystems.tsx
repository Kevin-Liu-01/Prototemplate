'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { LOCALES, STATS } from './locales-data';

/**
 * The roll-up: the same 120 rows regrouped by writing system, filed on the
 * page's dark band. Every member code is listed — the Latin row is a wall
 * of 77 codes on purpose. Direction is carried per script; the two
 * right-to-left rows are marked by weight, not by a pill.
 */

type SystemRow = {
  script: string;
  scriptName: string;
  dir: 'ltr' | 'rtl';
  codes: string[];
};

function buildSystems(): SystemRow[] {
  const map = new Map<string, SystemRow>();
  for (const r of LOCALES) {
    const existing = map.get(r.script);
    if (existing) {
      existing.codes.push(r.code);
    } else {
      map.set(r.script, {
        script: r.script,
        scriptName: r.scriptName,
        dir: r.dir,
        codes: [r.code],
      });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.codes.length - a.codes.length || a.script.localeCompare(b.script)
  );
}

const SYSTEMS = buildSystems();
const LATIN = SYSTEMS.find((s) => s.script === 'Latn')?.codes.length ?? 0;

export default function WritingSystems() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band cp-band' id='systems' ref={root} aria-label='Writing systems'>
      <div className='cp-band-in'>
        <header className='cp-band-head' data-reveal>
          <h2>{STATS.scripts} writing systems.</h2>
          <p>
            The {STATS.locales} locales write in {STATS.scripts} scripts &mdash; {LATIN} of
            them in Latin alone. {STATS.rtl} run right-to-left, and the toolchain resolves
            direction, numerals, and line-breaking per script.
          </p>
        </header>

        <div className='cpl-sys' data-reveal>
          <div className='cpl-sys-row is-cols' aria-hidden='true'>
            <span className='cpl-sys-code'>script</span>
            <span className='cpl-sys-name'>name</span>
            <span className='cpl-sys-dir'>dir</span>
            <span className='cpl-sys-n'>n</span>
            <span className='cpl-sys-codes'>locales</span>
          </div>

          {SYSTEMS.map((s) => (
            <div
              className={s.dir === 'rtl' ? 'cpl-sys-row is-rtl' : 'cpl-sys-row'}
              key={s.script}
            >
              <span className='cpl-sys-code'>{s.script}</span>
              <span className='cpl-sys-name'>{s.scriptName}</span>
              <span className='cpl-sys-dir'>{s.dir}</span>
              <span className='cpl-sys-n'>{s.codes.length}</span>
              <span className='cpl-sys-codes'>
                {s.codes.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
