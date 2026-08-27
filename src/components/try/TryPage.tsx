'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import ReportCard from './ReportCard';
import TryField from './TryField';
import TryFigure from './TryFigure';

import type { CSSProperties, FormEvent } from 'react';
import type { Report } from '@/lib/try/analyze';
import type { Grade } from '@/lib/try/grade';

type Slot<Value> =
  | { state: 'idle' }
  | { state: 'loading' }
  /* The settle gate: the report is in hand but the reveal waits while the
     figure's satellites run their completion sweep. `from` is how many of
     the six chips the loading loop had already colored when the response
     landed — the sweep starts there. */
  | { state: 'settling'; value: Value; from: number }
  | { state: 'done'; value: Value }
  | { state: 'error'; message: string };

// Slightly above the report route's 78s maxDuration so the server's own
// verdict normally arrives before the client gives up.
const CLIENT_TIMEOUT_MS = 80000;

/* The settle gate's clock, mirrored from try.css. The loading loop enters
   chip k at k x 1.4s and its fill is fully risen ~0.5s later (6% of the
   8.4s loop); the sweep fills each remaining chip in 250ms at a 140ms
   stagger, then holds ~300ms so the last lock reads before the reveal. */
const SAT_COUNT = 6;
const LOOP_STEP_MS = 1400;
const LOOP_RISE_MS = 504;
const SWEEP_STEP_MS = 140;
const SWEEP_HOLD_MS = 550; // last chip's 250ms fill + the 300ms lock hold

/** How many chips the loading loop has visibly colored after `elapsed` ms. */
function chipsFilledAt(elapsed: number): number {
  if (elapsed < LOOP_RISE_MS) return 0;
  return Math.min(
    SAT_COUNT,
    Math.floor((elapsed - LOOP_RISE_MS) / LOOP_STEP_MS) + 1
  );
}

/** The sweep's total run for `remaining` still-unfilled chips. */
function settleMsOf(remaining: number): number {
  if (remaining <= 0) return 300; // all six already cycled: just the lock-in
  return (remaining - 1) * SWEEP_STEP_MS + SWEEP_HOLD_MS;
}

async function postJson<Value>(path: string, body: object): Promise<Value> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => null)) as
    | (Value & { error?: string })
    | null;
  if (!res.ok || !data) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

/* The typed URL's host, for the figure's favicon — the request goes only
   to the graded site itself, never a third-party favicon service. */
function hostOf(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

/* The form affordance's stricter parse: only a host with a dotted final
   label reads as a site worth probing for a favicon — "stripe" alone
   parses as a hostname but is never one the user means yet. */
function plausibleHostOf(raw: string): string | null {
  const host = hostOf(raw);
  if (!host || !/\.[a-z0-9-]{2,}$/i.test(host)) return null;
  return host;
}

/* How long after typing stops before the affordance probes the host. */
const PREVIEW_DEBOUNCE_MS = 500;

/* The meter's own grade boundaries, resolved to the grade colour vars. */
function gradeVarOf(score: number): string {
  if (score >= 90) return 'var(--try-grade-a)';
  if (score >= 80) return 'var(--try-grade-b)';
  if (score >= 70) return 'var(--try-grade-c)';
  if (score >= 60) return 'var(--try-grade-d)';
  return 'var(--try-grade-f)';
}

export default function TryPage() {
  const [url, setUrl] = useState('');
  const [host, setHost] = useState<string | null>(null);
  const [report, setReport] = useState<Slot<Report>>({ state: 'idle' });
  /* The input affordance's debounced host, and the host whose favicon
     actually loaded — the search glass only yields to a real image. */
  const [previewHost, setPreviewHost] = useState<string | null>(null);
  const [previewFav, setPreviewFav] = useState<string | null>(null);
  const running = useRef(false);
  /* The settle gate's pending reveal, cleared on reset and unmount. */
  const settleTimer = useRef<number | null>(null);
  /* The affordance's typing debounce, cleared on unmount. */
  const previewTimer = useRef<number | null>(null);

  useMountEffect(() => () => {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current);
    }
  });

  /* The affordance's clock: PREVIEW_DEBOUNCE_MS after typing (or a
     paste) stops, parse the value — a plausible host mounts the favicon
     probe, anything else returns the affordance to the search glass. */
  function onUrlChange(value: string) {
    setUrl(value);
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current);
    }
    previewTimer.current = window.setTimeout(() => {
      previewTimer.current = null;
      setPreviewHost(plausibleHostOf(value));
    }, PREVIEW_DEBOUNCE_MS);
  }

  function clearSettle() {
    if (settleTimer.current !== null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  }

  async function run(event: FormEvent) {
    event.preventDefault();
    if (running.current || !url.trim()) return;
    running.current = true;
    clearSettle();
    setHost(hostOf(url));
    const startedAt = performance.now();
    setReport({ state: 'loading' });
    try {
      const value = await postJson<Report>('/api/try/report', { url });
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduced) {
        // reduced motion: no sweep — instant lock, instant reveal
        setReport({ state: 'done', value });
      } else {
        const from = chipsFilledAt(performance.now() - startedAt);
        setReport({ state: 'settling', value, from });
        settleTimer.current = window.setTimeout(
          () => {
            settleTimer.current = null;
            setReport({ state: 'done', value });
          },
          settleMsOf(SAT_COUNT - from)
        );
      }
    } catch (err) {
      const timedOut =
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.name === 'AbortError');
      setReport({
        state: 'error',
        message: timedOut
          ? 'The report is taking longer than expected. Give it a moment and try again.'
          : (err as Error).message,
      });
    }
    running.current = false;
  }

  const busy = report.state === 'loading' || report.state === 'settling';
  /* The report value once it exists — held back from the card until the
     settle sweep finishes, but the figure's chips need the grades now. */
  const settled =
    report.state === 'settling' || report.state === 'done'
      ? report.value
      : null;

  /* The status strip's face. The settle sweep still reads as a live run,
     so it keeps the loading face until the reveal; done holds the success
     line (built from the report's real host and score) until a new run. */
  const stripState =
    report.state === 'error'
      ? 'error'
      : busy
        ? 'loading'
        : report.state === 'done'
          ? 'done'
          : 'idle';
  const stripText =
    report.state === 'error'
      ? report.message
      : busy
        ? 'Grading six categories from live fetches, usually under a minute.'
        : report.state === 'done'
          ? `Graded ${report.value.hostname}: ${report.value.overall.score}/100. Report below.`
          : 'Enter a URL for a graded localization report card.';

  return (
    <>
      <div className='tc-sec try-hero'>
        <TryField className='try-field' canvasClassName='try-field-canvas' />
        <div className='try-hero-cols'>
          <div className='try-hero-copy'>
            <div className='tc-head try-head'>
              <h1>How localized is your site?</h1>
              <p>
                Six live checks: hreflang, language declaration, routing,
                metadata, content, and charset.
              </p>
            </div>
            <div className='try-form-zone'>
              <form className='try-form' onSubmit={run}>
                <div className='try-form-bar'>
                  <div className='try-url-wrap'>
                    <input
                      className='try-url'
                      type='text'
                      inputMode='url'
                      spellCheck={false}
                      placeholder='stripe.com'
                      value={url}
                      onChange={(e) => onUrlChange(e.target.value)}
                      aria-label='Website URL'
                    />
                    {/* the trailing affordance: a house-drawn search glass
                      that crossfades to the typed host's favicon once it
                      loads, so the user sees the target confirmed. On
                      error the glass stays — never a broken image. */}
                    <span
                      className={`try-url-affix${
                        previewFav !== null && previewFav === previewHost
                          ? ' has-fav'
                          : ''
                      }`}
                      aria-hidden='true'
                    >
                      <svg
                        className='try-url-glass'
                        viewBox='0 0 18 18'
                        width={18}
                        height={18}
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={1.25}
                        strokeLinecap='square'
                      >
                        <circle cx='8' cy='8' r='5.5' />
                        <path d='m12.1 12.1 4.4 4.4' />
                      </svg>
                      {previewHost !== null && (
                        <img
                          key={previewHost}
                          className='try-url-fav'
                          src={`https://${previewHost}/favicon.ico`}
                          alt=''
                          width={18}
                          height={18}
                          draggable={false}
                          referrerPolicy='no-referrer'
                          onLoad={() => setPreviewFav(previewHost)}
                          onError={() => {
                            setPreviewFav((prev) =>
                              prev === previewHost ? null : prev
                            );
                          }}
                        />
                      )}
                    </span>
                  </div>
                  {/* both faces stay mounted in one grid cell so the busy
                    swap never changes the button's box (zero CLS) */}
                  <button
                    className={`tc-btn tc-btn-solid try-go${
                      busy ? ' is-busy' : ''
                    }`}
                    type='submit'
                    disabled={busy}
                  >
                    <span
                      className='try-go-face'
                      aria-hidden={busy ? true : undefined}
                    >
                      Grade My Site
                    </span>
                    <span
                      className='try-go-wait'
                      aria-hidden={busy ? undefined : true}
                    >
                      <svg
                        className='try-go-arc'
                        viewBox='0 0 16 16'
                        width={14}
                        height={14}
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={1.5}
                        strokeLinecap='butt'
                        aria-hidden='true'
                      >
                        <path d='M8 1.5A6.5 6.5 0 1 1 1.5 8' />
                      </svg>
                      Grading…
                    </span>
                  </button>
                </div>
              </form>
              {/* The status strip: ONE element holding all four states at constant
                  height, on its own line below the bar. One live region. */}
              <div
                className='try-strip'
                data-state={stripState}
                role='status'
                style={
                  report.state === 'done'
                    ? ({
                        '--try-strip-grade': gradeVarOf(
                          report.value.overall.score
                        ),
                      } as CSSProperties)
                    : undefined
                }
              >
                <i className='try-strip-tick' aria-hidden='true' />
                <span className='try-strip-text'>{stripText}</span>
              </div>
            </div>
          </div>
          <div className='try-hero-fig'>
            <TryFigure
              state={report.state}
              host={host}
              gradeVar={
                report.state === 'done'
                  ? gradeVarOf(report.value.overall.score)
                  : null
              }
              grades={
                settled
                  ? Object.fromEntries(
                      settled.categories.map((cat): [string, Grade] => [
                        cat.id,
                        cat.grade,
                      ])
                    )
                  : null
              }
              settleFrom={report.state === 'settling' ? report.from : null}
            />
          </div>
        </div>
      </div>
      <div className='tc-hatch' aria-hidden='true' />
      <ReportCard
        report={report.state === 'done' ? report.value : null}
        state={report.state}
      />
    </>
  );
}
