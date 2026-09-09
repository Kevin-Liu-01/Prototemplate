'use client';

import { useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { ToolButton } from '@/components/viewer/ToolButton';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { DIRECTIONS, getDirection } from '@/lib/directions';
import type { ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import {
  compareSections,
  DEFAULT_PAIR,
  OTHER,
  PANE_KEYS,
  PANE_NAME,
  pairHash,
  parsePairHash,
} from './sections';
import type { Pair, PaneKey } from './sections';

import './compare.css';

/**
 * Two live direction pages side by side on the viewer shell, scroll-locked.
 * The panes are same-origin iframes on one fixed sheet, so each
 * contentWindow is reachable: a scroll in one maps proportionally onto the
 * other (scrollY over the scrollable run), which is what keeps two pages of
 * different heights in step. Every programmatic scroll opens a short mute
 * window on the receiving pane so the echoed scroll event cannot drive the
 * loop back. The pair mirrors into the URL hash (#a=...&b=...) so a
 * comparison is a link.
 *
 * A Both | Left | Right seg chooses the view. Both (the default) fits the
 * whole 2881px sheet in the stage so the two panes are on screen at once;
 * Left and Right fill the stage height and pan sideways to the named pane
 * (Sheet's fit 'height'), where each pane keeps legible text and the sync
 * scroll matters, and also make that pane the one the next pick fills. A
 * 28px caption over each pane names it (Left: Dossier, /d/...). The shell
 * tracks one active item: the direction in the target pane. Arrows, digits
 * and list picks all go through the shell's select, which lands in onSelect
 * and loads that pane; the count reads `Left 01 / 17`, and the list marks
 * the loaded directions L and R. The shell writes #<slug> on every
 * selection; onSelect rewrites the pair form over it.
 */

const TITLE = 'Compare';
const MODES: readonly ShellMode[] = ['slide'];

/** How long an echoed programmatic scroll stays inaudible. */
const MUTE_MS = 160;

/** Each pane is a site exhibit under a caption band; the seam between them is one hairline. */
const PANE_W = 1440;
const PANE_H = 900;
const CAPTION_H = 28;
const SEAM = 1;
const SHEET_W = PANE_W * 2 + SEAM;
const SHEET_H = PANE_H + CAPTION_H;

type Frames = Record<PaneKey, RefObject<HTMLIFrameElement | null>>;

/** What the stage shows: both panes fitted side by side, or one pane at the stage height. */
type PaneView = 'both' | PaneKey;

const PANE_OPTIONS: readonly SegOption<PaneView>[] = [
  { value: 'both', label: 'Both', title: 'Both panes side by side' },
  {
    value: 'a',
    label: PANE_NAME.a,
    icon: 'arrow-left-circle',
    title: 'The left pane at reading size; picks and arrows load it (T)',
  },
  {
    value: 'b',
    label: PANE_NAME.b,
    icon: 'arrow-right-circle',
    title: 'The right pane at reading size; picks and arrows load it (T)',
  },
];

function writeHash(pair: Pair): void {
  /* replaceState, never pushState: browsing pairs must not bury the page
     the visitor came from under a stack of hash entries */
  try {
    window.history.replaceState(null, '', pairHash(pair));
  } catch {
    // a sandboxed document: the panes still move, the address does not
  }
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/** Scroll the panning stage to one pane, on the next frame so a fit that changed with the view has laid out. */
function showPane(key: PaneKey): void {
  requestAnimationFrame(() => {
    const stage = document.querySelector<HTMLElement>('.pt-viewer[data-shell="compare"] .pt-sheet-stage');
    if (!stage) return;
    const max = stage.scrollWidth - stage.clientWidth;
    stage.scrollTo({ left: key === 'a' ? 0 : max });
  });
}

/** What the inner components need from the rig; the refs read the latest values from any listener. */
type Engine = {
  pair: Pair;
  target: PaneKey;
  view: PaneView;
  syncOn: boolean;
  readPair: () => Pair;
  readTarget: () => PaneKey;
  apply: (next: Pair) => void;
  setTarget: (next: PaneKey) => void;
  setView: (next: PaneView) => void;
  swap: () => Pair;
  toggleSync: () => void;
};

type CompareToolsProps = Pick<
  Engine,
  'pair' | 'target' | 'view' | 'syncOn' | 'setTarget' | 'setView' | 'swap' | 'toggleSync'
>;

/**
 * The toolbar slot: the Both | Left | Right seg choosing the view (a pane
 * option also names the pane the next pick fills), then Sync scroll and
 * Swap, each a labeled ToolButton with a Heroicons glyph (directive 7.2).
 * Choosing a pane or swapping moves the shell's active item to the
 * direction now in the target pane, so the list always marks the pane the
 * arrows will drive, and the stage pans to that pane. T and X are the two
 * route keys; the shell's key owner leaves both letters free.
 */
function CompareTools({ pair, target, view, syncOn, setTarget, setView, swap, toggleSync }: CompareToolsProps) {
  const shell = usePtShell();

  const pickView = (next: PaneView) => {
    setView(next);
    if (next === 'both') return;
    setTarget(next);
    shell.select(pair[next]);
    showPane(next);
  };

  const pickTarget = (next: PaneKey) => pickView(next);

  const doSwap = () => {
    const next = swap();
    shell.select(next[target]);
  };

  /* assigned every render so the mount-time listener reads current handlers */
  const actRef = useRef({ pickTarget, doSwap, target });
  actRef.current = { pickTarget, doSwap, target };

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      if (e.key.length !== 1) return;
      const act = actRef.current;
      switch (e.key.toLowerCase()) {
        case 't':
          act.pickTarget(OTHER[act.target]);
          return;
        case 'x':
          act.doSwap();
          return;
        default:
          return;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      <Seg options={PANE_OPTIONS} value={view} onChange={pickView} label='View' />
      <ToolButton
        icon='sync'
        label='Sync scroll'
        title='Scroll both panes together'
        pressed={syncOn}
        onClick={toggleSync}
      />
      <ToolButton icon='swap' label='Swap' title='Swap the left and right panes (X)' onClick={doSwap} />
    </>
  );
}

type CompareBootProps = Pick<Engine, 'readPair' | 'readTarget' | 'apply'> & {
  /** wires panes whose document finished loading before hydration */
  wireLoaded: () => void;
};

/**
 * Mount-time work that needs the shell: restore the pair from the hash and
 * point the shell's active item at the target pane. Runs before the shell's
 * own mount effect (children first), so it also honors the shell's #<slug>
 * form here, since the rewrite below hides it from the shell. Later hash
 * changes: pair hashes are handled here, #<slug> by the shell, whose select
 * lands in onSelect.
 */
function CompareBoot({ readPair, readTarget, apply, wireLoaded }: CompareBootProps) {
  const shell = usePtShell();
  const shellRef = useRef<ShellState>(shell);
  shellRef.current = shell;

  useMountEffect(() => {
    const restore = (): Pair | null => {
      const raw = window.location.hash.replace(/^#/, '');
      const current = readPair();
      const fromPair = parsePairHash(raw, current);
      if (fromPair) return fromPair;
      if (raw && getDirection(raw)) return { ...current, [readTarget()]: raw };
      return null;
    };

    const restored = restore();
    if (restored) apply(restored);
    /* select runs onSelect, which writes the pair hash over the shell's #<slug> */
    shellRef.current.select(readPair()[readTarget()]);
    wireLoaded();

    const onHash = () => {
      const next = parsePairHash(window.location.hash, readPair());
      if (!next) return;
      apply(next);
      shellRef.current.select(next[readTarget()]);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

  return null;
}

type ComparePanesProps = {
  pair: Pair;
  target: PaneKey;
  frames: Frames;
  onLoad: (key: PaneKey) => void;
};

/**
 * The two captioned panes and the seam on the 2881x928 stage. Each iframe
 * is keyed by its slug: recreating it navigates without pushing joint
 * session-history entries, so the browser's Back returns to the page the
 * visitor came from, not through every pick. The caption over a pane names
 * its side, the direction and the address; the pane the next pick fills is
 * marked.
 */
function ComparePanes({ pair, target, frames, onLoad }: ComparePanesProps) {
  const pane = (key: PaneKey) => {
    const slug = pair[key];
    const name = getDirection(slug)?.name ?? slug;
    return (
      <div className={key === target ? 'pt-cmp-col is-target' : 'pt-cmp-col'}>
        <div className='pt-cmp-caption'>
          <span>
            <b>{PANE_NAME[key]}:</b> {name}, /d/{slug}
          </span>
          <span>{key === target ? 'the next pick lands here' : ''}</span>
        </div>
        <iframe
          key={`${key}:${slug}`}
          ref={frames[key]}
          className='pt-cmp-pane'
          src={`/d/${slug}?chrome=0`}
          title={`${name}, ${PANE_NAME[key].toLowerCase()} pane`}
          onLoad={() => onLoad(key)}
        />
      </div>
    );
  };
  return (
    <div className='pt-cmp-panes'>
      {pane('a')}
      <i className='pt-cmp-seam' aria-hidden='true' />
      {pane('b')}
    </div>
  );
}

export default function CompareRig() {
  const frameA = useRef<HTMLIFrameElement>(null);
  const frameB = useRef<HTMLIFrameElement>(null);
  const frames: Frames = { a: frameA, b: frameB };
  const mute = useRef<Record<PaneKey, number>>({ a: 0, b: 0 });

  const [pair, setPairState] = useState<Pair>(DEFAULT_PAIR);
  const [target, setTargetState] = useState<PaneKey>('a');
  const [view, setView] = useState<PaneView>('both');
  const [syncOn, setSyncOn] = useState(true);

  /* the refs are written in the same call as the state so a select that
     follows in the same tick reads the new pair, not the render's */
  const pairRef = useRef<Pair>(DEFAULT_PAIR);
  const targetRef = useRef<PaneKey>('a');
  const syncRef = useRef(true);

  const sections = useMemo(() => compareSections(pair), [pair]);

  const readPair = () => pairRef.current;
  const readTarget = () => targetRef.current;

  const apply = (next: Pair) => {
    pairRef.current = next;
    setPairState(next);
    writeHash(next);
  };

  const setTarget = (next: PaneKey) => {
    targetRef.current = next;
    setTargetState(next);
  };

  const swap = (): Pair => {
    const current = pairRef.current;
    const next: Pair = { a: current.b, b: current.a };
    apply(next);
    return next;
  };

  const toggleSync = () => {
    const next = !syncRef.current;
    syncRef.current = next;
    setSyncOn(next);
  };

  /* every selection lands here: a list pick, an arrow, a digit jump, a
     #<slug> hash. The target pane takes the direction; the pair hash is
     written over the #<slug> the shell wrote a moment before */
  const onSelect = (slug: string) => {
    const key = targetRef.current;
    const current = pairRef.current;
    if (current[key] === slug) {
      writeHash(current);
      return;
    }
    apply({ ...current, [key]: slug });
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
      /* a pane that left the origin is out of reach; it scrolls free */
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

  /* a pane that finished loading before hydration already fired its load
     event into the void; onLoad covers every later one */
  const wireLoaded = () => {
    PANE_KEYS.forEach((key) => {
      if (frames[key].current?.contentDocument?.readyState === 'complete') wire(key);
    });
  };

  return (
    <ViewerShell
      id='compare'
      title={TITLE}
      mark='pt'
      count={`${DIRECTIONS.length} directions`}
      countLabel={PANE_NAME[target]}
      sections={sections}
      active={DEFAULT_PAIR.a}
      modes={MODES}
      thumb='shot'
      surfaces='site'
      keys='paged'
      noun='direction'
      onSelect={onSelect}
      toolbarSlot={
        <CompareTools
          pair={pair}
          target={target}
          view={view}
          syncOn={syncOn}
          setTarget={setTarget}
          setView={setView}
          swap={swap}
          toggleSync={toggleSync}
        />
      }
    >
      <Sheet
        variant='fixed'
        w={SHEET_W}
        h={SHEET_H}
        frame={false}
        fit={view === 'both' ? 'contain' : 'height'}
        caption={false}
      >
        <ComparePanes pair={pair} target={target} frames={frames} onLoad={wire} />
      </Sheet>
      <CompareBoot readPair={readPair} readTarget={readTarget} apply={apply} wireLoaded={wireLoaded} />
    </ViewerShell>
  );
}
