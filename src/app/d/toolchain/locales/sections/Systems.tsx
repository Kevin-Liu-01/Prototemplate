'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { LOCALES, STATS } from '../data';

/**
 * The roll-up: the same 120 rows regrouped by writing system, printed on
 * the page's one dark artifact panel. Every member code is listed — the
 * Latin row is a wall of 77 codes on purpose. Direction is carried per
 * script; the two right-to-left rows are marked by weight, not by a pill.
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

export default function Systems() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='systems' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Writing systems</h2>
        <p data-reveal>
          The {STATS.locales} locales write in {STATS.scripts} scripts —{' '}
          {LATIN} of them in Latin alone. {STATS.rtl} run right-to-left, and
          the toolchain resolves direction, numerals, and line-breaking per
          script.
        </p>
      </div>

      <div className='lcl-sys-cell' data-reveal>
        <div className='lcl-sys'>
          <div className='lcl-sys-cap'>
            <span>writing systems — ISO 15924</span>
            <span>
              {STATS.scripts} scripts · {STATS.locales} locales
            </span>
          </div>

          <div className='lcl-sys-row is-cap' aria-hidden='true'>
            <span className='lcl-sys-code'>script</span>
            <span className='lcl-sys-name'>name</span>
            <span className='lcl-sys-dir'>dir</span>
            <span className='lcl-sys-n'>n</span>
            <span className='lcl-sys-codes'>locales</span>
          </div>

          {SYSTEMS.map((s) => (
            <div
              key={s.script}
              className={s.dir === 'rtl' ? 'lcl-sys-row is-rtl' : 'lcl-sys-row'}
            >
              <span className='lcl-sys-code'>{s.script}</span>
              <span className='lcl-sys-name'>{s.scriptName}</span>
              <span className='lcl-sys-dir'>{s.dir}</span>
              <span className='lcl-sys-n'>{s.codes.length}</span>
              <span className='lcl-sys-codes'>
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
