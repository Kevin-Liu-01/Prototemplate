'use client';

import CategoryMark from './CategoryMarks';
import TryHelpTip from './TryHelpTip';

import type { CSSProperties } from 'react';
import type { Report } from '@/lib/try/analyze';

export type ReportCardState =
  | 'idle'
  | 'loading'
  | 'settling'
  | 'done'
  | 'error';

const GRADES = ['A', 'B', 'C', 'D', 'F'] as const;

/* The skeleton's static row roster — the six category ids and names are
   fixed knowledge (the grader always returns exactly these, in this
   order), so the empty card can draw every row from first paint. */
const ROSTER = [
  { id: 'hreflang', name: 'hreflang tags' },
  { id: 'lang', name: 'Language declaration' },
  { id: 'routing', name: 'Locale routing' },
  { id: 'metadata', name: 'Translated metadata' },
  { id: 'content', name: 'Content language' },
  { id: 'charset', name: 'Charset and direction' },
] as const;

/* What each category measures, behind the row's info sign. */
const INFO_COPY: Record<string, string> = {
  hreflang:
    'Link tags in the page head that list every language version of a page. Search engines read them to send visitors to the right locale.',
  lang: 'The lang attribute on the html element. Browsers, screen readers, and translation tools read it to know what language the page is in.',
  routing:
    'How the site serves each language at a stable URL: a path like /es/, a subdomain, or a country domain, and whether those URLs actually respond with localized pages.',
  metadata:
    'Page titles, descriptions, and social share tags, translated per locale instead of left in the default language. This is what shows up in search results.',
  content:
    'Whether the visible text on each locale page actually reads in that language, measured from the words on the page rather than the tags.',
  charset:
    'UTF-8 encoding declared and decoded cleanly, and the right text direction for scripts such as Arabic and Hebrew.',
};

/* The meter's grade boundaries on the 0-100 run, and where each grade's
   range letter sits (the center of its run). */
const METER_TICKS = [0, 60, 70, 80, 90, 100] as const;
const METER_RANGES = [
  { grade: 'F', at: 30 },
  { grade: 'D', at: 65 },
  { grade: 'C', at: 75 },
  { grade: 'B', at: 85 },
  { grade: 'A', at: 95 },
] as const;

/* The overall score's grade letter — the meter's own boundaries. */
function gradeOf(score: number): (typeof GRADES)[number] {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/* A fix line that opens with "Nothing" is a clean bill — its sub-row
   mark is a check in the row's grade colour instead of the action
   arrow. The grader writes these lines in English by contract (the
   footnote says so), so the prefix test is stable. */
function isCleanFix(fix: string): boolean {
  return /^Nothing\b/.test(fix);
}

/* The fix sub-row's marks, house-drawn at 16px: a check for rows with
   nothing to do, a right-angle action arrow for rows with work. */
function FixMark({ clean }: { clean: boolean }) {
  return (
    <svg
      viewBox='0 0 16 16'
      width={16}
      height={16}
      fill='none'
      stroke='currentColor'
      strokeWidth={1.25}
      strokeLinecap='square'
      strokeLinejoin='miter'
      aria-hidden='true'
    >
      {clean ? (
        <path d='m3 8.5 3.6 3.6L13 4.9' />
      ) : (
        <>
          <path d='M4.5 3v6.5h6.6' />
          <path d='m8.9 6.2 3.3 3.3-3.3 3.3' />
        </>
      )}
    </svg>
  );
}

/* The overall score as a ruled instrument: a 0-100 meter with hairline
   ticks at the grade boundaries, the below-score run filled in the
   working accent, and the score position marked. Decorative twin of the
   numeric score beside it. Empty (score null) it shows only the rule,
   ticks and range letters; when the score lands the fill GROWS to it
   (a width transition on the always-mounted fill element). */
function ScoreMeter({ score }: { score: number | null }) {
  const at = score === null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <div className='try-meter' aria-hidden='true'>
      <span className='try-meter-base' />
      <span className='try-meter-fill' style={{ width: `${at}%` }} />
      {METER_TICKS.map((tick) => (
        <span
          key={tick}
          className='try-meter-tick'
          style={{ left: `${tick}%` }}
        >
          <i>{tick}</i>
        </span>
      ))}
      {METER_RANGES.map((range) => (
        <span
          key={range.grade}
          className='try-meter-range'
          style={{ left: `${range.at}%` }}
        >
          {range.grade}
        </span>
      ))}
      {/* the mark rides a transform (container-width units), not `left`,
          so its glide never registers as a layout shift */}
      <span
        className='try-meter-mark'
        style={{ '--try-mark-at': at } as CSSProperties}
      />
    </div>
  );
}

/* The report card renders its full structure from page load — empty
   meter, ghost score, six named rows with unlit scales — and the real
   values animate into it when the report lands. The skeleton is
   aria-hidden AND inert so screen readers never hear ghost rows and its
   info triggers stay out of the tab order; the hero's own live region
   narrates the run. Each row carries a stable id and tabIndex -1 so the
   figure's satellite chips can scroll to it and hand it focus. */
export default function ReportCard({
  report,
  state,
}: {
  report: Report | null;
  state: ReportCardState;
}) {
  const filled = report !== null;
  const rows = ROSTER.map((base, i) => ({
    id: report?.categories[i]?.id ?? base.id,
    name: report?.categories[i]?.name ?? base.name,
    cat: report?.categories[i] ?? null,
  }));
  return (
    <div className='try-report-band'>
      <div
        className={`try-report${filled ? ' is-filled' : ''}${
          state === 'loading' || state === 'settling' ? ' is-waiting' : ''
        }`}
        aria-hidden={filled ? undefined : true}
        inert={filled ? undefined : true}
      >
        <div className='try-overall'>
          <div className='try-overall-copy'>
            <span className='try-host'>
              {report
                ? `Localization report card for ${report.hostname}`
                : 'Localization report card'}
            </span>
            {/* the score group: the numeral anchors, /100 shares its
                baseline, and the grade letter sits beside them as a small
                framed chip tinted in the grade colour; the verdict rides
                to the group's right (below, stacked, on the narrow
                ladders), centered to the numeral */}
            <div className='try-overall-line'>
              <div className='try-score-group'>
                {report ? (
                  <>
                    <span className='try-score'>{report.overall.score}</span>
                    <span className='try-score-of' aria-hidden='true'>
                      /100
                    </span>
                    <span
                      className='try-score-chip'
                      role='img'
                      aria-label={`Grade ${gradeOf(report.overall.score)}`}
                      style={{
                        color: `var(--try-grade-${gradeOf(
                          report.overall.score
                        ).toLowerCase()})`,
                      }}
                    >
                      {gradeOf(report.overall.score)}
                    </span>
                  </>
                ) : (
                  <span className='try-ghost try-ghost-score' />
                )}
              </div>
              {report && (
                <p className='try-verdict'>{report.overall.summary}</p>
              )}
            </div>
          </div>
          <div className='try-overall-meter'>
            <ScoreMeter score={report ? report.overall.score : null} />
          </div>
        </div>
        <ul className='try-cats'>
          {rows.map((row, i) => (
            <li
              key={row.id}
              id={`try-cat-${row.id}`}
              className='try-cat'
              tabIndex={-1}
              style={{ '--try-row-i': i } as CSSProperties}
            >
              <span className='try-cat-icon'>
                <CategoryMark id={row.id} className='try-cat-mark' />
              </span>
              <div className='try-cat-copy'>
                <div className='try-cat-namerow'>
                  <h3 className='try-cat-name'>{row.name}</h3>
                  {/* the pricing pages' help affordance, in its local
                      hairline build */}
                  <span className='try-info'>
                    <TryHelpTip label='What this measures'>
                      {INFO_COPY[row.id]}
                    </TryHelpTip>
                  </span>
                </div>
                {row.cat ? (
                  <>
                    <p className='try-cat-summary'>{row.cat.summary}</p>
                    <div className='try-cat-fixrow'>
                      <span
                        className='try-cat-fixmark'
                        style={
                          isCleanFix(row.cat.fix)
                            ? {
                                color: `var(--try-grade-${row.cat.grade.toLowerCase()})`,
                              }
                            : undefined
                        }
                      >
                        <FixMark clean={isCleanFix(row.cat.fix)} />
                      </span>
                      <p className='try-cat-fix'>{row.cat.fix}</p>
                    </div>
                  </>
                ) : (
                  <span className='try-ghost try-ghost-summary' />
                )}
              </div>
              <div
                className='try-cat-scale'
                role='img'
                aria-label={row.cat ? `Grade ${row.cat.grade}` : undefined}
              >
                {GRADES.map((letter) => (
                  <span
                    key={letter}
                    className={`try-seg try-seg-${letter.toLowerCase()}${
                      letter === row.cat?.grade ? ' is-on' : ''
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className='try-footnote'>
          {report ? (
            `Graded from ${report.requests.length} live requests. Category text is generated in English.`
          ) : (
            <span className='try-ghost try-ghost-foot' />
          )}
        </p>
      </div>
    </div>
  );
}
