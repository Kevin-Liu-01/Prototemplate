'use client';

import type { ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ShellKeys, ShellMark, ShellMode, ShellSection, ShellThumb } from '@/lib/shell-data';
import { flattenShellItems } from '@/lib/shell-data';
import type { SurfaceSet } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GridView } from './GridView';
import { HelpCard } from './HelpCard';
import { IndexPanel } from './IndexPanel';
import { Progress } from './Progress';
import { ShellContext } from './shell-context';
import type { ShellState, StageSize } from './shell-context';
import { Sidebar, ThumbList } from './Sidebar';
import type { MiniResolver, SubRenderer } from './Sidebar';
import { toggleTheme } from './ThemeButton';
import { Toast, useToast } from './Toast';
import { Toolbar } from './Toolbar';
import { useShellKeys } from './useShellKeys';

import './ViewerShell.css';

/** The sidebar preference, shared by every shell: '0' hides the list. */
const SIDEBAR_KEY = 'gt-shell-sb';

/** At or below this width the sidebar is an overlay and the sheet pad shrinks. */
const NARROW_PX = 900;

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
  /** the item to open when the hash names none; defaults to the first item */
  active?: string;
  /** the modes the route offers; the first is the default */
  modes: readonly ShellMode[];
  /** which registry the index panel lists */
  surfaces: SurfaceSet;
  thumb: ShellThumb;
  onSelect?: (id: string) => void;
  /** the route's own controls, first in the toolbar's right group */
  toolbarSlot?: ReactNode;
  keys: ShellKeys;
  /** the word in the digit toast and the help rows; `slide` unless the route says otherwise */
  noun?: string;
  /** how a 'mini' thumb finds its source nodes; the default reads the deck stage */
  mini?: MiniResolver;
  /** rows a route hangs under an item in the list */
  renderSub?: SubRenderer;
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

function isNarrow(): boolean {
  return window.innerWidth <= NARROW_PX;
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
  mini,
  renderSub,
  children,
}: ViewerShellProps) {
  const items = useMemo(() => flattenShellItems(sections), [sections]);
  const defaultMode = modes[0] ?? 'slide';

  const [mode, setModeState] = useState<ShellMode>(defaultMode);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [present, setPresentState] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [active, setActive] = useState<string>(() => initialActive ?? items[0]?.id ?? '');
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  const [panelWidth, setPanelWidth] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toast = useToast();

  /* the mount-time listeners read the latest values through these refs;
     the assignments run every render so no listener sees a stale closure */
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const activeRef = useRef(active);
  activeRef.current = active;
  const narrowRef = useRef(narrow);
  narrowRef.current = narrow;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const modesRef = useRef(modes);
  modesRef.current = modes;

  const index = items.findIndex((item) => item.id === active);
  const total = items.length;

  const select = (next: string) => {
    if (!itemsRef.current.some((item) => item.id === next)) return;
    setActive(next);
    try {
      window.history.replaceState(null, '', `#${encodeURIComponent(next)}`);
    } catch {
      // a sandboxed document: the state still moves, the address does not
    }
    onSelectRef.current?.(next);
  };

  const step = (delta: number) => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    const at = list.findIndex((item) => item.id === activeRef.current);
    const next = Math.max(0, Math.min(list.length - 1, (at < 0 ? 0 : at) + delta));
    const target = list[next];
    if (target && target.id !== activeRef.current) select(target.id);
  };

  const setMode = (next: ShellMode) => {
    if (!modesRef.current.includes(next)) return;
    setModeState(next);
    store(`gt-shell-mode:${id}`, next);
  };

  const setSidebar = (open: boolean) => {
    setSidebarOpen(open);
    /* the overlay at narrow widths is a passing state, not a preference */
    if (!narrowRef.current) store(SIDEBAR_KEY, open ? '1' : '0');
  };

  const setPanel = (open: boolean) => setPanelOpen(open);
  const setHelp = (open: boolean) => setHelpOpen(open);

  const setPresent = (on: boolean) => {
    if (on) {
      setModeState(modesRef.current[0] ?? 'slide');
      setPanelOpen(false);
    }
    setPresentState(on);
  };

  useMountEffect(() => {
    document.body.dataset.shell = id;

    /* persisted mode, the hash, the width, the sidebar preference */
    const savedMode = load(`gt-shell-mode:${id}`);
    if (savedMode && modesRef.current.some((m) => m === savedMode)) setModeState(savedMode as ShellMode);
    const fromHash = readHash();
    if (fromHash && itemsRef.current.some((item) => item.id === fromHash)) setActive(fromHash);
    const startNarrow = isNarrow();
    setNarrow(startNarrow);
    narrowRef.current = startNarrow;
    setSidebarOpen(startNarrow ? false : load(SIDEBAR_KEY) !== '0');

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
      keys,
      noun,
      items,
      mode,
      sidebarOpen,
      panelOpen,
      helpOpen,
      present,
      narrow,
      active,
      index,
      total,
      stageSize,
      panelWidth,
      setMode,
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
    [id, modes, keys, noun, items, mode, sidebarOpen, panelOpen, helpOpen, present, narrow, active, index, total, stageSize, panelWidth, toast.say]
  );

  useShellKeys(state, { toggleTheme });

  const grid = mode === 'grid';

  return (
    <ShellContext value={state}>
      <div
        className={cn(
          'pt-viewer',
          !sidebarOpen && !narrow && 'no-sb',
          grid && 'is-overview',
          present && 'is-present',
          narrow && sidebarOpen && 'sb-open'
        )}
        data-shell={id}
      >
        <Sidebar
          title={title}
          mark={mark}
          count={count}
          sections={sections}
          thumb={thumb}
          mini={mini}
          renderSub={renderSub}
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
                  mini={mini}
                  renderSub={renderSub}
                  onSelect={(next) => {
                    setMode(defaultMode);
                    select(next);
                  }}
                />
              </GridView>
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
