'use client';

import Link from 'next/link';
import { useRef, useState, type RefObject } from 'react';

import { DIRECTIONS, getDirection } from '@/lib/directions';
import { useMountEffect } from '@/lib/use-mount-effect';

import './compare.css';

/**
 * Two live direction pages, side by side, scroll-locked. The panes are
 * same-origin iframes, so each contentWindow is reachable: a scroll in one
 * maps PROPORTIONALLY onto the other (scrollY over the scrollable run) —
 * that, not a pixel copy, is what lets two pages of different heights stay
 * in step. Every programmatic scroll opens a short mute window on the
 * receiving pane so the echoed scroll event can't drive the loop back.
 * The pair mirrors into the URL hash (#a=…&b=…) so a comparison is a link.
 */

type PaneKey = 'a' | 'b';

const OTHER: Record<PaneKey, PaneKey> = { a: 'b', b: 'a' };

/** How long an echoed programmatic scroll stays inaudible. */
const MUTE_MS = 160;

const SITES = DIRECTIONS.filter((d) => d.site);
const EXPLORATIONS = DIRECTIONS.filter((d) => !d.site);

const DEFAULT_PAIR: Record<PaneKey, string> = {
  a: 'singularity-dossier',
  b: 'singularity-signal',
};

const PANE_NAME: Record<PaneKey, string> = { a: 'Left', b: 'Right' };

/** Full sites first — they're what most comparisons start from. */
function DirectionOptions() {
  return (
    <>
      <optgroup label='Full sites'>
        {SITES.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label} — {d.name}
          </option>
        ))}
      </optgroup>
      <optgroup label='Explorations'>
        {EXPLORATIONS.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label} — {d.name}
          </option>
        ))}
      </optgroup>
    </>
  );
}

export default function CompareRig() {
  const frameA = useRef<HTMLIFrameElement>(null);
  const frameB = useRef<HTMLIFrameElement>(null);
  const mute = useRef<Record<PaneKey, number>>({ a: 0, b: 0 });
  const syncRef = useRef(true);
  const [syncOn, setSyncOn] = useState(true);
  const [pair, setPair] = useState<Record<PaneKey, string>>(DEFAULT_PAIR);

  const frames: Record<PaneKey, RefObject<HTMLIFrameElement | null>> = {
    a: frameA,
    b: frameB,
  };

  /* replaceState, never pushState — browsing pairs must not bury the
     page the visitor came from under a stack of hash entries */
  const apply = (next: Record<PaneKey, string>) => {
    setPair(next);
    window.history.replaceState(null, '', `#a=${next.a}&b=${next.b}`);
  };

  const forward = (from: PaneKey) => {
    if (!syncRef.current) return;
    if (performance.now() < mute.current[from]) return;
    const src = frames[from].current?.contentWindow;
    const dst = frames[OTHER[from]].current?.contentWindow;
    if (!src || !dst) return;
    try {
      const srcRun = src.document.documentElement.scrollHeight - src.innerHeight;
      const dstRun = dst.document.documentElement.scrollHeight - dst.innerHeight;
      if (srcRun <= 0 || dstRun <= 0) return;
      const ratio = Math.min(1, Math.max(0, src.scrollY / srcRun));
      mute.current[OTHER[from]] = performance.now() + MUTE_MS;
      dst.scrollTo(0, Math.round(ratio * dstRun));
    } catch {
      /* a pane that left the origin is out of reach — it scrolls free */
    }
  };

  /* Wired per inner document: navigation replaces the inner window (and
     its listeners die with it), while the flag stops the mount pass and
     onLoad from stacking a second listener on one document. */
  const wire = (key: PaneKey) => {
    const win = frames[key].current?.contentWindow;
    if (!win) return;
    try {
      const doc = win.document as Document & { ptCmpWired?: boolean };
      if (doc.ptCmpWired) return;
      doc.ptCmpWired = true;
      win.addEventListener('scroll', () => forward(key), { passive: true });
    } catch {
      /* same-origin only */
    }
  };

  const toggleSync = () => {
    const next = !syncRef.current;
    syncRef.current = next;
    setSyncOn(next);
  };

  useMountEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const a = params.get('a');
    const b = params.get('b');
    setPair((prev) => ({
      a: a && getDirection(a) ? a : prev.a,
      b: b && getDirection(b) ? b : prev.b,
    }));
    /* a pane that finished loading before hydration already fired its
       load event into the void — wire it now; onLoad covers the rest */
    (['a', 'b'] as const).forEach((key) => {
      if (frames[key].current?.contentDocument?.readyState === 'complete') wire(key);
    });
  });

  return (
    <section className='pt-sec pt-cmp'>
      <header className='pt-cmp-head'>
        <div className='pt-cmp-lede'>
          <h1>Compare</h1>
          <p>
            Any two directions, live in one viewport — scroll either pane and the other follows
            in proportion.
          </p>
        </div>
        <div className='pt-cmp-tools'>
          <button
            aria-pressed={syncOn}
            className='pt-cmp-chip'
            onClick={toggleSync}
            type='button'
          >
            <i aria-hidden className='pt-cmp-dot' />
            sync scroll
          </button>
          <button
            className='pt-cmp-chip'
            type='button'
            onClick={() => apply({ a: pair.b, b: pair.a })}
          >
            swap ⇄
          </button>
          <Link className='pt-cmp-back' href='/'>
            ← back to the index
          </Link>
        </div>
      </header>

      <div className='pt-cmp-panes'>
        {(['a', 'b'] as const).map((key) => (
          <figure className='pt-cmp-pane' key={key}>
            <figcaption className='pt-cmp-pick'>
              <span aria-hidden className='pt-cmp-tag'>
                {key.toUpperCase()}
              </span>
              <select
                aria-label={`${PANE_NAME[key]} pane direction`}
                onChange={(e) => apply({ ...pair, [key]: e.target.value })}
                value={pair[key]}
              >
                <DirectionOptions />
              </select>
              <a className='pt-cmp-out' href={`/d/${pair[key]}`} rel='noreferrer' target='_blank'>
                open ↗
              </a>
            </figcaption>
            <div className='pt-cmp-stage'>
              {/* keyed by slug: recreating the iframe navigates it without
                  pushing joint session-history entries, so the browser's
                  Back returns to the index, not through every pick */}
              <iframe
                key={pair[key]}
                loading='lazy'
                onLoad={() => wire(key)}
                ref={frames[key]}
                src={`/d/${pair[key]}?chrome=0`}
                title={`${getDirection(pair[key])?.name ?? pair[key]} — live`}
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
