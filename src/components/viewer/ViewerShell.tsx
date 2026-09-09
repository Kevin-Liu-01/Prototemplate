'use client';

import type { ReactNode, TouchEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

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
import { IndexPanel } from './IndexPanel';
import { Progress } from './Progress';
import { ShellContext } from './shell-context';
import type { ShellState, StageSize } from './shell-context';
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
const HINT_HOLD_MS = 3600;

/** At or below this width the sidebar is an overlay and the sheet pad shrinks. */
const NARROW_PX = 900;

/** A touch that starts within this many pixels of the left edge and travels SWIPE_PX opens the narrow list. */
const EDGE_PX = 24;
const SWIPE_PX = 40;

/**
 * The one frame for Prototemplate: a fixed full-viewport grid of a sidebar
 * and a main region (toolbar, stage, progress line), with the index panel,
 * the help card and the toast floating over it. The shell owns the state
 * every child reads through usePtShell() and no content rules at all: the
 * route renders the stage content (a Sheet, and a BookView while the mode
 * is book) as children.
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
  const [density, setDensityState] = useState<ShellDensity>('outline');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [present, setPresentState] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [active, setActive] = useState<string>(() => initialActive ?? items[0]?.id ?? '');
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  const [panelWidth, setPanelWidth] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const filter = useRef<SidebarFilter>({ active: false, clear: () => {} });
  const toast = useToast();

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

  /* the slide shows one paged item, so entering it with nothing paged marked
     (the gallery's book at its top, or an archived capture) opens the first */
  const setMode = (next: ShellMode) => {
    if (!modesRef.current.includes(next)) return;
    setModeState(next);
    store(`gt-shell-mode:${id}`, next);
    if (next === 'slide') {
      const list = pagedRef.current;
      const first = list[0];
      if (first && !list.some((item) => item.id === activeRef.current)) select(first.id);
    }
  };

  const setDensity = (next: ShellDensity) => {
    setDensityState(next);
    store(DENSITY_KEY, next);
  };

  const setSidebar = (open: boolean) => {
    setSidebarOpen(open);
    /* the overlay at narrow widths is a passing state, not a preference */
    if (!narrowRef.current) store(SIDEBAR_KEY, open ? '1' : '0');
  };

  const setPanel = (open: boolean) => setPanelOpen(open);
  const setHelp = (open: boolean) => setHelpOpen(open);

  /* presenting keeps the sheet that is up: only the grid, which has no sheet,
     hands over to the slide (or the default when the route has none) */
  const setPresent = (on: boolean) => {
    if (on) {
      if (modeRef.current === 'grid') {
        setModeState(modesRef.current.includes('slide') ? 'slide' : (modesRef.current[0] ?? 'slide'));
      }
      setPanelOpen(false);
    }
    setPresentState(on);
  };

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

    /* persisted mode, density, the hash, the width, the sidebar preference */
    const savedMode = load(`gt-shell-mode:${id}`);
    if (savedMode && modesRef.current.some((m) => m === savedMode)) setModeState(savedMode as ShellMode);
    const savedDensity = load(DENSITY_KEY);
    if (isDensity(savedDensity)) setDensityState(savedDensity);
    const fromHash = readHash();
    if (fromHash && itemsRef.current.some((item) => item.id === fromHash)) setActive(fromHash);
    const startNarrow = isNarrow();
    setNarrow(startNarrow);
    narrowRef.current = startNarrow;
    setSidebarOpen(startNarrow ? false : load(SIDEBAR_KEY) !== '0');

    /* the first visit to a route family: one toast naming the arrows and the help key */
    const seen = (load(HINT_KEY) ?? '').split(',').filter(Boolean);
    if (!seen.includes(id)) {
      store(HINT_KEY, [...seen, id].join(','));
      toast.say(HINT_TEXT, HINT_HOLD_MS);
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
    window.addEventListener('hashchange', onHash);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('resize', onResize);

    /* the stage box, and the panel's: the panel keeps its layout width while
       it is off screen (translated, visibility hidden), so the sheet's fit can
       read what an open panel will take without a token copied into code */
    const stage = stageRef.current;
    const panel = panelRef.current;
    const measure = () => {
      if (stage) {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        setStageSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
      }
      if (panel) setPanelWidth(panel.offsetWidth);
    };
    measure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      if (stage) observer.observe(stage);
      if (panel) observer.observe(panel);
    }

    return () => {
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      if (document.body.dataset.shell === id) delete document.body.dataset.shell;
    };
  });

  const state: ShellState = useMemo(
    () => ({
      id,
      modes,
      keys: resolvedKeys,
      noun,
      items,
      paged,
      mode,
      density,
      sidebarOpen,
      panelOpen,
      helpOpen,
      present,
      narrow,
      active,
      index,
      total,
      countLabel,
      stageSize,
      panelWidth,
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
      density,
      sidebarOpen,
      panelOpen,
      helpOpen,
      present,
      narrow,
      active,
      index,
      total,
      countLabel,
      stageSize,
      panelWidth,
      toast.say,
    ]
  );

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
  const overlayOpen = narrow && sidebarOpen;

  return (
    <ShellContext value={state}>
      <div
        className={cn(
          'pt-viewer',
          !sidebarOpen && !narrow && 'no-sb',
          present && 'is-present',
          overlayOpen && 'sb-open',
          density === 'thumbs' && 'is-thumbs'
        )}
        data-shell={id}
        data-dir={dir}
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
          <Toolbar title={title} mark={mark} slot={toolbarSlot} />
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
            {panelOpen ? (
              <button
                type='button'
                className='pt-panel-scrim'
                aria-label='Close the index (Esc)'
                onClick={() => setPanel(false)}
              />
            ) : null}
          </div>
          {/* a child of .pt-main, not of the stage: its top and bottom are written against the toolbar and the progress line */}
          <IndexPanel ref={panelRef} set={surfaces} />
          <Progress />
        </section>
      </div>
      <HelpCard />
      <Toast message={toast.message} on={toast.on} />
    </ShellContext>
  );
}
