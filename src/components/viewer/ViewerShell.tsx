'use client';

import { useGSAP } from '@gsap/react';
import type { ReactNode, TouchEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { cn } from '@/lib/cn';
import type {
  ShellDensity,
  ShellKeysProp,
  ShellMark,
  ShellMode,
  ShellSection,
  ShellThumb,
} from '@/lib/shell-data';
import { flattenShellItems, pagedShellItems, resolveShellKeys } from '@/lib/shell-data';
import type { SurfaceSet } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GridView } from './GridView';
import { HelpCard } from './HelpCard';
import { Icon } from './icons';
import { IndexPanel } from './IndexPanel';
import { PreviewLayer } from './PreviewLayer';
import { Progress } from './Progress';
import { ShellContext, StageContext } from './shell-context';
import type { ShellDir, ShellState, ShellTransition, StageSize, StageState } from './shell-context';
import { Sidebar, ThumbList } from './Sidebar';
import type { SidebarFilter, SubRenderer } from './Sidebar';
import { toggleTheme } from './ThemeButton';
import { Toast, useToast } from './Toast';
import { Toolbar } from './Toolbar';
import { useShellKeys } from './useShellKeys';

import './ViewerShell.css';

/** The sidebar preference, shared by every shell: '0' hides the list. */
const SIDEBAR_KEY = 'gt-shell-sb';

/** The sidebar density preference, shared by every shell. */
const DENSITY_KEY = 'gt-shell-density';

/** The route families that have shown the first-visit hint, comma separated. */
const HINT_KEY = 'gt-shell-hint';

const HINT_TEXT = 'Arrow keys move. Press ? for every shortcut.';

/** At or below this width the sidebar is an overlay and the sheet pad shrinks. */
const NARROW_PX = 900;

/** At or below this width a first visit to a paged route opens the book when the route offers one. */
const PHONE_PX = 600;

/** A touch that starts within this many pixels of the left edge and travels SWIPE_PX opens the narrow list. */
const EDGE_PX = 24;
const SWIPE_PX = 40;

/**
 * Motion lengths, matching the --pt-dur-* tokens in tokens.css (directive
 * 7.4). The code needs them to know when a transition is over: when to let
 * the list leave the DOM after its column has closed, and when to drop the
 * entering view's attribute in the fallback cross-fade.
 */
const SB_MS = 220;
const ENTER_MS = 200;

/** Why the sidebar column is moving; ViewerShell.css keys the content fade on it. */
type SidebarMotion = 'open' | 'close' | 'density';

/** The transition in flight, plus whether the browser is animating it (view transitions) or CSS is (the fallback). */
type Transition = ShellTransition & { native: boolean };

/**
 * The one frame for Prototemplate: a fixed full-viewport grid of a sidebar
 * and a main region (toolbar, an optional hint row, stage, progress line),
 * with the index panel, the help card, the toast and the preview layer
 * (directive 8.6, one for every data-preview on the page) floating over it. The
 * shell owns the state every child reads through usePtShell() and no
 * content rules at all: the route renders the stage content (a Sheet, and
 * a BookView while the mode is book) as children.
 *
 * Landing. The server renders the defaults (the list open in outline
 * density, the first item active). The mount effect applies the saved
 * state and the hash and publishes `ready`, so the sidebar spends its one
 * centering scroll on the deep-linked row and not on the SSR default; one
 * frame later the root gains data-settled and only then do the column
 * transitions apply, so a saved closed list or a saved density is a cut on
 * load, never a 220ms animation from the server's layout (directive 7.5,
 * no layout shift after the first frame).
 *
 * Motion (directive 7.4). A mode change cross-fades the stage through the
 * View Transitions API: the browser snapshots the leaving view and the
 * entering one and ViewerShell.css animates the two images (out over the
 * leave duration to 0.985, in over the enter duration from 1.015 with a
 * 60ms delay), which is the only way both views can be on screen at once
 * when every route mounts its views on the committed mode. A browser
 * without the API commits at once and the entering view fades in through
 * CSS (data-entering). The sidebar column animates its width while the
 * list's content fades (data-sb, data-sb-moving), and the list stays in the
 * DOM for the closing duration through sidebarShown. Reduced motion skips
 * all of it.
 *
 * The grid takes the whole main region: entering it closes the sidebar
 * column (spec 2.1, .is-overview) without touching the saved preference,
 * and leaving it brings the column back. The List button still opens the
 * column inside the grid for as long as the mode holds.
 */
export type ViewerShellProps = {
  /** storage namespace: gt-shell-mode:<id>; also body[data-shell] */
  id: string;
  title: string;
  mark: ShellMark;
  /** already worded: `52 slides`, `17 directions` */
  count: string;
  sections: readonly ShellSection[];
  /** the item to open when the hash names none; defaults to the first item, an empty string marks nothing */
  active?: string;
  /** the modes the route offers; the first is the default */
  modes: readonly ShellMode[];
  /** which registry the index panel opens on */
  surfaces: SurfaceSet;
  thumb: ShellThumb;
  onSelect?: (id: string) => void;
  /** the route's own controls, first in the toolbar's right group */
  toolbarSlot?: ReactNode;
  /** the key table, or a function of the mode */
  keys: ShellKeysProp;
  /** the word in the digit toast and the help rows; `slide` unless the route says otherwise */
  noun?: string;
  /** the route's own words for the mode seg where the defaults do not fit: `{ slide: 'Live' }` on the gallery */
  modeLabels?: Partial<Record<ShellMode, string>>;
  /** rows a route hangs under an item in the list */
  renderSub?: SubRenderer;
  /**
   * The site map (Pages, Documents, Sites, Explorations, Archive) rendered
   * ahead of and around the route's sections, a route section replacing the
   * group of the same name (decision 7). Defaults to true on site routes.
   */
  siteMap?: boolean;
  /** a word before the count: `Left` on /compare */
  countLabel?: string;
  /** what the current route's own Pages row does when clicked; the gallery returns its book to the top */
  onCurrentPage?: () => void;
  /** the stage content */
  children?: ReactNode;
};

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode: the choice holds for the session only
  }
}

/**
 * The boot script in layout.tsx stamps the saved list state on <html>
 * (data-shell-sb, data-shell-density) so the first paint already shows it;
 * the stamp is kept current here so a client navigation to another shell
 * route lands on the state the reader last chose, not the one at boot.
 */
function stampHtml(name: 'shellSb' | 'shellDensity', value: string | null): void {
  const data = document.documentElement.dataset;
  if (value === null) delete data[name];
  else data[name] = value;
}

/** The item id in the hash, decoded; empty when there is none. */
function readHash(): string {
  const raw = window.location.hash.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function writeHash(id: string): void {
  try {
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', id ? `${base}#${encodeURIComponent(id)}` : base);
  } catch {
    // a sandboxed document: the state still moves, the address does not
  }
}

function isNarrow(): boolean {
  return window.innerWidth <= NARROW_PX;
}

function isDensity(value: string | null): value is ShellDensity {
  return value === 'outline' || value === 'thumbs';
}

/** The reader has asked for no motion: every transition commits at once. */
function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ViewerShell({
  id,
  title,
  mark,
  count,
  sections,
  active: initialActive,
  modes,
  surfaces,
  thumb,
  onSelect,
  toolbarSlot,
  keys,
  noun = 'slide',
  modeLabels,
  renderSub,
  siteMap = surfaces === 'site',
  countLabel,
  onCurrentPage,
  children,
}: ViewerShellProps) {
  const items = useMemo(() => flattenShellItems(sections), [sections]);
  const paged = useMemo(() => pagedShellItems(sections), [sections]);
  const defaultMode = modes[0] ?? 'slide';

  const [mode, setModeState] = useState<ShellMode>(defaultMode);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [density, setDensityState] = useState<ShellDensity>('outline');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  /* the List button's override while the grid is up: the column is closed there unless the reader opens it */
  const [gridList, setGridList] = useState(false);
  const [sbMotion, setSbMotion] = useState<SidebarMotion | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [present, setPresentState] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [active, setActive] = useState<string>(() => initialActive ?? items[0]?.id ?? '');
  const [dir, setDir] = useState<ShellDir>('next');
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  /* true once the mount effect has applied the saved state and the hash */
  const [booted, setBooted] = useState(false);
  /* true one frame after that: from here on the column transitions apply */
  const [settledState, setSettledState] = useState(false);
  /* the first-visit hint row over the stage */
  const [hint, setHint] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const filter = useRef<SidebarFilter>({ active: false, clear: () => {} });
  const toast = useToast();

  /* the timers behind the two motions, and a stamp so a transition that
     was superseded never clears the one that replaced it */
  const transitionTimer = useRef(0);
  const transitionStamp = useRef(0);
  const sbTimer = useRef(0);
  /* false until the first frame after landing: a mode set while landing (the
     saved mode, a deep link) commits without a cross-fade */
  const settled = useRef(false);

  /* the column the reader sees: the preference, closed by the grid unless
     the reader opened it there; the narrow overlay follows the toggle alone */
  const listOpen = narrow ? sidebarOpen : mode === 'grid' ? gridList : sidebarOpen;

  /* the mount-time listeners read the latest values through these refs;
     the assignments run every render so no listener sees a stale closure */
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const pagedRef = useRef(paged);
  pagedRef.current = paged;
  const activeRef = useRef(active);
  activeRef.current = active;
  const narrowRef = useRef(narrow);
  narrowRef.current = narrow;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const modesRef = useRef(modes);
  modesRef.current = modes;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const sidebarRef = useRef(listOpen);
  sidebarRef.current = listOpen;
  const prefRef = useRef(sidebarOpen);
  prefRef.current = sidebarOpen;
  const presentRef = useRef(present);
  presentRef.current = present;
  const densityRef = useRef(density);
  densityRef.current = density;

  const index = paged.findIndex((item) => item.id === active);
  const total = paged.length;
  const resolvedKeys = resolveShellKeys(keys, mode);

  const select = (next: string) => {
    if (next && !itemsRef.current.some((item) => item.id === next)) return;
    const list = pagedRef.current;
    const from = list.findIndex((item) => item.id === activeRef.current);
    const to = list.findIndex((item) => item.id === next);
    if (from >= 0 && to >= 0 && from !== to) setDir(to > from ? 'next' : 'prev');
    setActive(next);
    writeHash(next);
    onSelectRef.current?.(next);
  };

  const step = (delta: number) => {
    const list = pagedRef.current;
    if (list.length === 0) return;
    const at = list.findIndex((item) => item.id === activeRef.current);
    const next = at < 0 ? (delta > 0 ? 0 : list.length - 1) : Math.max(0, Math.min(list.length - 1, at + delta));
    const target = list[next];
    if (target && target.id !== activeRef.current) select(target.id);
  };

  /* the sidebar column is moving: the content fades for the duration and the
     list stays in the DOM through a close (sidebarShown) */
  const moveSidebar = (kind: SidebarMotion) => {
    window.clearTimeout(sbTimer.current);
    if (reducedMotion()) {
      setSbMotion(null);
      return;
    }
    setSbMotion(kind);
    sbTimer.current = window.setTimeout(() => setSbMotion(null), SB_MS);
  };

  /* the slide shows one paged item, so entering it with nothing paged marked
     (the gallery's book at its top, or an archived capture) opens the first.
     The grid closes the column and hands it back on leave; `columnMotion`
     is false when present mode is about to hide the column anyway */
  const commitMode = (next: ShellMode, columnMotion = true) => {
    const from = modeRef.current;
    setModeState(next);
    if (next === 'grid' && from !== 'grid') {
      setGridList(false);
      if (columnMotion && prefRef.current && !presentRef.current && !narrowRef.current) moveSidebar('close');
    } else if (next !== 'grid' && from === 'grid') {
      if (columnMotion && prefRef.current && !presentRef.current && !narrowRef.current) moveSidebar('open');
    }
    if (next === 'slide') {
      const list = pagedRef.current;
      const first = list[0];
      if (first && !list.some((item) => item.id === activeRef.current)) select(first.id);
    }
  };

  /**
   * The cross-fade. With the View Transitions API the browser snapshots the
   * stage, the commit runs inside its callback (flushSync, so the new view
   * is in the DOM when the new snapshot is taken) and ViewerShell.css
   * animates the two images; the transition state is published until the
   * browser reports the animation finished. Without the API the commit is
   * immediate and data-entering carries the CSS fade-in for the enter
   * duration. While landing, or under reduced motion, the mode just changes.
   */
  const switchMode = (from: ShellMode, to: ShellMode) => {
    window.clearTimeout(transitionTimer.current);
    const stamp = ++transitionStamp.current;
    const done = () => {
      if (transitionStamp.current === stamp) setTransition(null);
    };
    if (!settled.current || reducedMotion()) {
      commitMode(to);
      setTransition(null);
      return;
    }
    if (typeof document.startViewTransition !== 'function') {
      setTransition({ from, to, native: false });
      commitMode(to);
      transitionTimer.current = window.setTimeout(done, ENTER_MS);
      return;
    }
    setTransition({ from, to, native: true });
    const view = document.startViewTransition(() => {
      flushSync(() => commitMode(to));
    });
    /* a skipped transition (a hidden document, a newer transition) rejects
       ready; the commit has still run, so there is nothing to report */
    view.ready.catch(() => undefined);
    view.finished.then(done, done);
  };

  const setMode = (next: ShellMode) => {
    if (!modesRef.current.includes(next)) return;
    store(`gt-shell-mode:${id}`, next);
    const from = modeRef.current;
    if (from === next) return;
    switchMode(from, next);
  };

  const setDensity = (next: ShellDensity) => {
    if (next === densityRef.current) return;
    setDensityState(next);
    store(DENSITY_KEY, next);
    stampHtml('shellDensity', next === 'thumbs' ? 'thumbs' : null);
    if (sidebarRef.current && !presentRef.current && !narrowRef.current) moveSidebar('density');
  };

  const setSidebar = (open: boolean) => {
    if (open === sidebarRef.current) return;
    /* inside the grid the toggle is an override for the mode's duration, not the preference */
    if (modeRef.current === 'grid' && !narrowRef.current) {
      setGridList(open);
      if (!presentRef.current) moveSidebar(open ? 'open' : 'close');
      return;
    }
    setSidebarOpen(open);
    /* the overlay at narrow widths is a passing state, not a preference */
    if (!narrowRef.current) {
      store(SIDEBAR_KEY, open ? '1' : '0');
      stampHtml('shellSb', open ? null : '0');
    }
    if (!presentRef.current) moveSidebar(open ? 'open' : 'close');
  };

  const setPanel = (open: boolean) => setPanelOpen(open);
  const setHelp = (open: boolean) => setHelpOpen(open);

  /* presenting keeps the sheet that is up: only the grid, which has no sheet,
     hands over to the slide (or the default when the route has none); the
     list leaves with the chrome and comes back with it */
  const setPresent = (on: boolean) => {
    if (on === presentRef.current) return;
    if (on) {
      if (modeRef.current === 'grid') {
        commitMode(modesRef.current.includes('slide') ? 'slide' : (modesRef.current[0] ?? 'slide'), false);
      }
      setPanelOpen(false);
      setHint(false);
    }
    setPresentState(on);
    if (sidebarRef.current && !narrowRef.current) moveSidebar(on ? 'close' : 'open');
  };

  const dismissHint = () => setHint(false);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches.item(0);
    touchX.current = narrow && !sidebarOpen && touch && touch.clientX <= EDGE_PX ? touch.clientX : null;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    touchX.current = null;
    const touch = e.changedTouches.item(0);
    if (start === null || !touch) return;
    if (touch.clientX - start > SWIPE_PX) setSidebar(true);
  };

  useMountEffect(() => {
    document.body.dataset.shell = id;

    /* persisted mode (a first visit on a phone opens the book where the
       route has one), density, the hash, the width, the sidebar preference */
    const savedMode = load(`gt-shell-mode:${id}`);
    if (savedMode && modesRef.current.some((m) => m === savedMode)) {
      setModeState(savedMode as ShellMode);
    } else if (!savedMode && window.innerWidth <= PHONE_PX && modesRef.current.includes('book')) {
      setModeState('book');
    }
    const savedDensity = load(DENSITY_KEY);
    if (isDensity(savedDensity)) setDensityState(savedDensity);
    const fromHash = readHash();
    if (fromHash && itemsRef.current.some((item) => item.id === fromHash)) setActive(fromHash);
    const startNarrow = isNarrow();
    setNarrow(startNarrow);
    narrowRef.current = startNarrow;
    setSidebarOpen(startNarrow ? false : load(SIDEBAR_KEY) !== '0');
    /* landed: the sidebar may spend its centering scroll; the settle follows a frame later */
    setBooted(true);

    /* the first visit to a route family: one row over the stage naming the arrows and the help key */
    const seen = (load(HINT_KEY) ?? '').split(',').filter(Boolean);
    if (!seen.includes(id)) {
      store(HINT_KEY, [...seen, id].join(','));
      setHint(true);
    }

    const onHash = () => {
      const next = readHash();
      if (next && next !== activeRef.current) select(next);
    };
    const onFullscreen = () => setPresent(Boolean(document.fullscreenElement));
    const onResize = () => {
      const now = isNarrow();
      if (now === narrowRef.current) return;
      narrowRef.current = now;
      setNarrow(now);
      setSidebarOpen(now ? false : load(SIDEBAR_KEY) !== '0');
    };
    /* any key puts the hint away */
    const onKey = () => setHint(false);
    window.addEventListener('hashchange', onHash);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);

    /* the stage box, for the fixed sheet's fit */
    const stage = stageRef.current;
    const measure = () => {
      if (!stage) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      setStageSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stage) {
      observer = new ResizeObserver(measure);
      observer.observe(stage);
    }

    return () => {
      window.clearTimeout(transitionTimer.current);
      window.clearTimeout(sbTimer.current);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      observer?.disconnect();
      if (document.body.dataset.shell === id) delete document.body.dataset.shell;
    };
  });

  /* the settle: one frame after the saved state is in the DOM, so the
     column transitions can never run from the server's layout */
  useGSAP(
    () => {
      if (!booted) return;
      const frame = requestAnimationFrame(() => {
        settled.current = true;
        setSettledState(true);
      });
      return () => cancelAnimationFrame(frame);
    },
    { dependencies: [booted] }
  );

  /* the list is in the DOM while it is wanted, and for the closing duration after */
  const sidebarShown = (listOpen && !present) || sbMotion === 'close';
  const published: ShellTransition | null = useMemo(
    () => (transition ? { from: transition.from, to: transition.to } : null),
    [transition]
  );

  const state: ShellState = useMemo(
    () => ({
      id,
      modes,
      keys: resolvedKeys,
      noun,
      items,
      paged,
      mode,
      transition: published,
      density,
      sidebarOpen: listOpen,
      sidebarShown,
      panelOpen,
      helpOpen,
      present,
      narrow,
      active,
      index,
      dir,
      total,
      countLabel,
      ready: booted,
      setMode,
      setDensity,
      setSidebar,
      setPanel,
      setHelp,
      setPresent,
      select,
      step,
      say: toast.say,
    }),
    // the handlers close over refs and setters only, so the state fields are the real dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      id,
      modes,
      resolvedKeys,
      noun,
      items,
      paged,
      mode,
      published,
      density,
      listOpen,
      sidebarShown,
      panelOpen,
      helpOpen,
      present,
      narrow,
      active,
      index,
      dir,
      total,
      countLabel,
      booted,
      toast.say,
    ]
  );

  const stage: StageState = useMemo(() => ({ stageSize }), [stageSize]);

  useShellKeys(state, {
    toggleTheme,
    /* the Escape ladder's filter rung: true when the sidebar filter had text to clear */
    clearFilter: () => {
      if (!filter.current.active) return false;
      filter.current.clear();
      return true;
    },
  });

  const grid = mode === 'grid';
  const overlayOpen = narrow && sidebarShown;
  /* the sidebar column: closed, or open at the density's width */
  const sb = present || narrow || !listOpen ? '0' : density;

  return (
    <ShellContext value={state}>
      <StageContext value={stage}>
        <div
          className={cn('pt-viewer', present && 'is-present', overlayOpen && 'sb-open')}
          data-shell={id}
          data-dir={dir}
          data-sb={sb}
          data-density={density}
          data-settled={settledState ? '' : undefined}
          data-sb-moving={sbMotion ?? undefined}
          data-entering={transition && !transition.native ? transition.to : undefined}
          onTouchStart={narrow ? onTouchStart : undefined}
          onTouchEnd={narrow ? onTouchEnd : undefined}
        >
          {overlayOpen ? (
            <button
              type='button'
              className='pt-sb-scrim'
              aria-label='Close the list (Esc)'
              onClick={() => setSidebar(false)}
            />
          ) : null}
          <Sidebar
            title={title}
            mark={mark}
            count={count}
            sections={sections}
            thumb={thumb}
            renderSub={renderSub}
            siteMap={siteMap}
            filter={filter}
            onCurrentPage={onCurrentPage}
          />
          <section className='pt-main'>
            <Toolbar title={title} mark={mark} slot={toolbarSlot} modeLabels={modeLabels} />
            {hint ? (
              <div className='pt-hint' role='status'>
                <span>{HINT_TEXT}</span>
                <button
                  type='button'
                  className='pt-hint-close'
                  title='Dismiss'
                  aria-label='Dismiss the hint'
                  onClick={dismissHint}
                >
                  <Icon name='close' />
                </button>
              </div>
            ) : null}
            <div ref={stageRef} className='pt-stagewrap'>
              {children}
              {grid ? (
                <GridView>
                  <ThumbList
                    sections={sections}
                    thumb={thumb}
                    density='thumbs'
                    renderSub={renderSub}
                    onSelect={(next) => {
                      /* a pick from the grid opens the item live where the route has a slide */
                      setMode(modes.includes('slide') ? 'slide' : defaultMode);
                      select(next);
                    }}
                  />
                </GridView>
              ) : null}
              {/* always mounted so it can fade both ways with the panel; hidden by IndexPanel.css while off */}
              <button
                type='button'
                className={cn('pt-panel-scrim', panelOpen && 'is-on')}
                aria-label='Close the index (Esc)'
                tabIndex={-1}
                onClick={() => setPanel(false)}
              />
            </div>
            {/* a child of .pt-main, not of the stage: its top and bottom are written against the toolbar and the progress line */}
            <IndexPanel set={surfaces} />
            <Progress />
          </section>
        </div>
        <HelpCard />
        <Toast message={toast.message} on={toast.on} />
        {/* the one preview layer (directive 8.6): every data-preview under the shell opens its capture here */}
        <PreviewLayer />
      </StageContext>
    </ShellContext>
  );
}
