'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { Sheet, SHEET_PAD, fitSheet } from '@/components/viewer/Sheet';
import type { ShellDensity, ShellMode } from '@/lib/shell-data';

import { Choice, Toggle } from '../controls';
import Plate from '../Plate';
import ModelShell from './ModelShell';
import ScaledModel from './ScaledModel';
import type { ModelFit } from './ScaledModel';
import { BookModel, SlideBody } from './StageContent';
import ViewerGrid, { GRID_ITEMS } from './ViewerGrid';

import './shells.css';

type Win = '1440' | '1280' | '390';

const WINDOWS: Record<Win, { w: number; h: number }> = {
  '1440': { w: 1440, h: 900 },
  '1280': { w: 1280, h: 800 },
  '390': { w: 390, h: 844 },
};

/* the shell's numbers: tokens.css, ViewerShell.css, Sidebar.css, IndexPanel.css, Progress.css */
const BAR_H = 52;
const PROGRESS_H = 2;
const PANEL_W = 460;
const NARROW_PX = 900;
const SB_W: Record<ShellDensity, number> = { outline: 208, thumbs: 256 };

type Rect = { x: number; y: number; w: number; h: number };

type Geometry = {
  narrow: boolean;
  sidebar: Rect | null;
  overlay: boolean;
  toolbar: Rect | null;
  stage: Rect;
  panel: Rect | null;
  progress: Rect | null;
};

/** Where every region of the shell sits in a window, from the shell's own rules. */
function geometry(w: number, h: number, list: boolean, panel: boolean, present: boolean, density: ShellDensity): Geometry {
  const narrow = w <= NARROW_PX;
  const listOn = list && !present;
  /* the column closes while presenting, on a narrow window, or when the list is off */
  const sbW = narrow || !listOn ? 0 : SB_W[density];
  const bar = present ? 0 : BAR_H;
  const prog = present ? 0 : PROGRESS_H;
  const mainW = w - sbW;
  const overlayW = Math.min(w * 0.84, 300);
  return {
    narrow,
    sidebar: listOn ? { x: 0, y: 0, w: narrow ? overlayW : sbW, h } : null,
    overlay: narrow && listOn,
    toolbar: present ? null : { x: sbW, y: 0, w: mainW, h: bar },
    stage: { x: sbW, y: bar, w: mainW, h: h - bar - prog },
    /* the panel runs from the toolbar's rule to the main region's foot, over the progress line */
    panel: panel && !present ? { x: w - Math.min(PANEL_W, mainW), y: BAR_H, w: Math.min(PANEL_W, mainW), h: h - BAR_H } : null,
    progress: present ? null : { x: sbW, y: h - prog, w: mainW, h: prog },
  };
}

const box = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });

function SidebarModel({ rect, density, overlay }: { rect: Rect; density: ShellDensity; overlay: boolean }) {
  const groups = [5, 6, 4, 5];
  return (
    <div className={overlay ? 'dmo-lay-sh-sb is-overlay' : 'dmo-lay-sh-sb'} style={box(rect)}>
      <div className='dmo-lay-sh-sb-head'>
        <span className='dmo-lay-sh-mark' />
        <span className='dmo-lay-sh-bar is-title' />
        <span className='dmo-lay-sh-ib' />
      </div>
      <div className='dmo-lay-sh-sb-filter'>
        <span className='dmo-lay-sh-field' />
      </div>
      <div className={density === 'thumbs' ? 'dmo-lay-sh-sb-list is-thumbs' : 'dmo-lay-sh-sb-list'}>
        {groups.map((rows, g) => (
          <div className='dmo-lay-sh-grp' key={g}>
            <span className='dmo-lay-sh-grp-head'>
              <i />
            </span>
            {Array.from({ length: rows }, (_, r) => (
              <span className='dmo-lay-sh-row' key={r}>
                {density === 'thumbs' ? <span className='dmo-lay-sh-cap' /> : <span className='dmo-lay-sh-icon' />}
                <i style={{ width: `${46 + ((r * 17 + g * 11) % 38)}%` }} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolbarModel({ rect, mode, narrow }: { rect: Rect; mode: ShellMode; narrow: boolean }) {
  return (
    <div className={narrow ? 'dmo-lay-sh-bar-row is-narrow' : 'dmo-lay-sh-bar-row'} style={box(rect)}>
      <span className='dmo-lay-sh-group'>
        <span className='dmo-lay-sh-ib' />
        {narrow ? null : <span className='dmo-lay-sh-ib' />}
        <span className='dmo-lay-sh-count' />
        {narrow ? null : <span className='dmo-lay-sh-ib' />}
      </span>
      <span className='dmo-lay-sh-group'>
        <span className='dmo-lay-sh-search' />
        <span className='dmo-lay-sh-seg'>
          {(['slide', 'grid', 'book'] as const).map((m) => (
            <span className={m === mode ? 'is-on' : undefined} key={m} />
          ))}
        </span>
        <span className='dmo-lay-sh-ib' />
        {narrow ? null : <span className='dmo-lay-sh-ib' />}
        <span className='dmo-lay-sh-ib' />
        {narrow ? null : <span className='dmo-lay-sh-ib' />}
      </span>
    </div>
  );
}

function PanelModel({ rect }: { rect: Rect }) {
  return (
    <div className='dmo-lay-sh-panel' style={box(rect)}>
      <div className='dmo-lay-sh-panel-head'>
        <span className='dmo-lay-sh-bar is-title' />
        <span className='dmo-lay-sh-ib' />
      </div>
      <div className='dmo-lay-sh-panel-tools'>
        <span className='dmo-lay-sh-field' />
      </div>
      {Array.from({ length: 9 }, (_, i) => (
        <div className='dmo-lay-sh-panel-row' key={i}>
          <span className='dmo-lay-sh-shot' />
          <span className='dmo-lay-sh-panel-copy'>
            <i style={{ width: `${54 + ((i * 13) % 34)}%` }} />
            <i style={{ width: `${30 + ((i * 7) % 24)}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The viewer shell taken apart: a faithful model of ViewerShell at a
 * window size, since the real shell is a fixed full-viewport frame that a
 * docs column cannot hold. Every region stands where the shell's CSS puts
 * it and draws only the edges the junction table gives it. The stage holds
 * the live parts: the fixed Sheet with its SheetFrame in slide mode, the
 * GridView in grid mode and the flow Sheet in book mode.
 */
export default function ShellAnatomyDemo() {
  const [win, setWin] = useState<Win>('1440');
  const [mode, setMode] = useState<ShellMode>('slide');
  const [density, setDensity] = useState<ShellDensity>('outline');
  const [list, setList] = useState(true);
  const [panel, setPanel] = useState(false);
  const [present, setPresent] = useState(false);
  const [labels, setLabels] = useState(true);
  const [index, setIndex] = useState(0);

  const { w, h } = WINDOWS[win];
  const g = geometry(w, h, list, panel, present, density);
  const pad = present ? SHEET_PAD.present : g.narrow ? SHEET_PAD.narrow : SHEET_PAD.wide;
  const sheet = fitSheet({ aw: g.stage.w, ah: g.stage.h, w: 1600, h: 900, pad });
  const step = (delta: number) => setIndex((i) => Math.max(0, Math.min(GRID_ITEMS.length - 1, i + delta)));
  /* a phone opens with the list closed, since there it floats over the stage until it is asked for */
  const pickWindow = (next: Win) => {
    setWin(next);
    setList(next !== '390');
  };

  const regions: { key: string; name: string; rect: Rect | null }[] = [
    { key: 'sb', name: g.overlay ? `List ${Math.round(g.sidebar?.w ?? 0)}px` : `Sidebar ${g.sidebar?.w ?? 0}px`, rect: g.sidebar },
    { key: 'bar', name: `Toolbar ${BAR_H}px`, rect: g.toolbar },
    { key: 'stage', name: `Stage ${g.stage.w} × ${g.stage.h}`, rect: g.panel ? { ...g.stage, w: g.stage.w - g.panel.w } : g.stage },
    { key: 'panel', name: `Index ${g.panel?.w ?? 0}px`, rect: g.panel },
    { key: 'prog', name: `Progress ${PROGRESS_H}px`, rect: g.progress },
  ];

  const overlay = ({ scale, left }: ModelFit) =>
    labels
      ? regions.map(({ key, name, rect }) =>
          rect ? (
            <span
              className={`dmo-lay-sh-label is-${key}`}
              key={key}
              style={{
                left: left + (rect.x + (key === 'prog' || key === 'bar' ? rect.w / 2 : 8)) * scale,
                top: key === 'prog' ? (rect.y - 2) * scale - 26 : (rect.y + (key === 'bar' ? rect.h / 2 : 64)) * scale,
              }}
            >
              {name}
            </span>
          ) : null
        )
      : null;

  let content: ReactNode = null;
  if (mode === 'slide') {
    content = (
      <Sheet frame variant='fixed'>
        <SlideBody item={GRID_ITEMS[index]} />
      </Sheet>
    );
  } else if (mode === 'grid') {
    content = <ViewerGrid active={GRID_ITEMS[index]?.id} />;
  } else {
    content = (
      <Sheet variant='flow'>
        <BookModel narrow={g.narrow} />
      </Sheet>
    );
  }

  const status = present
    ? `Presenting: the chrome is gone and the ${g.stage.w} × ${g.stage.h} stage is the window.`
    : `Stage ${g.stage.w} × ${g.stage.h}${mode === 'slide' ? `, the sheet at ${sheet.width} × ${sheet.height} (scale ${sheet.scale.toFixed(3)}, ${pad}px pad)` : ''}.`;

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Window'
            options={[
              { value: '1440', label: '1440 × 900' },
              { value: '1280', label: '1280 × 800' },
              { value: '390', label: '390 × 844' },
            ]}
            value={win}
            onChange={pickWindow}
          />
          <Choice
            label='Stage'
            options={[
              { value: 'slide', label: 'Slide' },
              { value: 'grid', label: 'Grid' },
              { value: 'book', label: 'Book' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Choice
            label='List density'
            options={[
              { value: 'outline', label: 'Outline' },
              { value: 'thumbs', label: 'Thumbnails' },
            ]}
            value={density}
            onChange={setDensity}
          />
          <Toggle label='List' pressed={list} onChange={setList} />
          <Toggle label='Index' pressed={panel} onChange={setPanel} />
          <Toggle label='Present' pressed={present} onChange={setPresent} />
          <Toggle label='Labels' pressed={labels} onChange={setLabels} />
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`A model of the viewer shell in a ${w} by ${h} window, the stage in ${mode} mode. ${status}`}
      stageClassName='dmo-lay-stage'
      tag='<ViewerShell>'
    >
      <ScaledModel
        className={g.narrow ? 'dmo-lay-shell is-narrow' : 'dmo-lay-shell'}
        height={h}
        maxHeight={560}
        overlay={overlay}
        width={w}
      >
        {g.sidebar && !g.overlay ? <SidebarModel density={density} overlay={false} rect={g.sidebar} /> : null}
        {g.toolbar ? <ToolbarModel mode={mode} narrow={g.narrow} rect={g.toolbar} /> : null}
        <div className='dmo-lay-sh-stage' style={box(g.stage)}>
          <ModelShell
            density={density}
            index={index}
            items={GRID_ITEMS}
            mode={mode}
            narrow={g.narrow}
            present={present}
            stage={{ width: g.stage.w, height: g.stage.h }}
            onStep={step}
          >
            {content}
          </ModelShell>
          {g.panel ? <span className='dmo-lay-sh-scrim' /> : null}
        </div>
        {g.panel ? <PanelModel rect={g.panel} /> : null}
        {g.progress ? (
          <div className='dmo-lay-sh-progress' style={box(g.progress)}>
            <i style={{ width: `${((index + 1) / GRID_ITEMS.length) * 100}%` }} />
          </div>
        ) : null}
        {g.overlay && g.sidebar ? (
          <>
            <span className='dmo-lay-sh-scrim is-list' />
            <SidebarModel density={density} overlay rect={g.sidebar} />
          </>
        ) : null}
      </ScaledModel>
    </Plate>
  );
}
