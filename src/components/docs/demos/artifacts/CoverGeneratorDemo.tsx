'use client';

import { useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { ditherToCanvas, globe } from '@/lib/dither';
import { createGlyphField } from '@/lib/glyph-field';
import { createHorizonField, type HorizonParams } from '@/lib/horizon-field';
import { CARD_TITLE_MAX } from '@/lib/seo/card-url';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice } from '../controls';
import { useArmed } from '../hooks';
import Plate from '../Plate';

import './artifacts.css';

type FieldName = 'dither' | 'glyph' | 'horizon';
type Theme = 'dark' | 'light';
type FrameId = 'cover' | 'card' | 'banner';

const FIELDS: readonly { value: FieldName; label: string }[] = [
  { value: 'dither', label: 'Dither' },
  { value: 'glyph', label: 'Glyph field' },
  { value: 'horizon', label: 'Horizon' },
];

const THEMES: readonly { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

/** Each export's logical size in px; the files ship at twice it (the cover at 3840 by 2160, the card at 2400 by 1260, the banner at 3000 by 1000). */
const FRAMES: readonly { id: FrameId; name: string; w: number; h: number }[] = [
  { id: 'cover', name: 'Post cover', w: 1920, h: 1080 },
  { id: 'card', name: 'Social card', w: 1200, h: 630 },
  { id: 'banner', name: 'X banner', w: 1500, h: 500 },
];

/** The ink each field draws in, per theme: the frame's own ink, as rgb() for the canvas engine. */
const FIELD_INK: Record<Theme, string> = { dark: 'rgb(242, 242, 240)', light: 'rgb(7, 7, 7)' };

/**
 * The partnership globe's settings (gt-graphics, still artwork): the
 * sign-in globe at ambient 0.14, rim 0.16, landmass 0.42 and tilt 0.15,
 * drawn at gamma 1.15 at t 40, at radius 0.40 of its box.
 */
const GLOBE = { ambient: 0.14, rim: 0.16, landmass: 0.42, tilt: 0.15, radius: 0.4 };
const GLOBE_GAMMA = 1.15;
const GLOBE_TIME = 40;
/** The globe's cell in export px; the preview draws it at the frame's scale, never under 1 CSS px. */
const EXPORT_CELL = 6;

/** The careers horizon's two ink sets: white rules and an ink hole on ink, ink rules and a paper hole on paper. */
const HORIZON: Record<Theme, Partial<HorizonParams>> = {
  dark: {
    chroma: 0.82,
    doppler: 0.85,
    exposure: 2.1,
    lightGain: 1.32,
    swirl: 1.32,
    ink: [1, 1, 1],
    ringAlpha: [0, 0, 0],
    ruleAlpha: 0.1,
    core: [0.02, 0.027, 0.043],
  },
  light: {
    chroma: 0.82,
    doppler: 0.85,
    exposure: 2.1,
    lightGain: 1.32,
    swirl: 1.32,
    ink: [0.04, 0.044, 0.051],
    ringAlpha: [0, 0, 0],
    ruleAlpha: 0.1,
    core: [0.99, 0.988, 0.984],
  },
};

type FieldProps = { field: FieldName; theme: Theme; armed: boolean; exportWidth: number };

/**
 * The field in one frame's field box, drawn at the box's size on screen.
 * The dither globe is one still drawn again on a resize, its 6 export px
 * cell drawn at the frame's scale; the glyph field
 * runs and pauses itself offscreen; the horizon draws its still frame. A
 * change of field or theme remounts the engine on a new canvas (the host
 * keys it), because each engine sizes and caches its own backing store.
 */
function FieldCanvas({ field, theme, armed, exportWidth }: FieldProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || !armed) return;

      if (field === 'dither') {
        const draw = () => {
          const w = el.clientWidth;
          const h = el.clientHeight;
          const frameWidth = el.closest('.dmo-cg-frame')?.clientWidth ?? exportWidth;
          if (w < 2 || h < 2) return;
          ditherToCanvas(el, globe({ ...GLOBE, aspect: w / h }), {
            scale: Math.max(1, Math.round((EXPORT_CELL * frameWidth) / exportWidth)),
            ink: FIELD_INK[theme],
            paper: 'transparent',
            gamma: GLOBE_GAMMA,
            time: GLOBE_TIME,
            cssWidth: w,
            cssHeight: h,
          });
        };
        draw();
        const resize = new ResizeObserver(draw);
        resize.observe(el);
        return () => resize.disconnect();
      }

      if (field === 'glyph') {
        const style = getComputedStyle(el);
        const glyphs = createGlyphField({
          canvas: el,
          drift: 'rise',
          copy: 'none',
          glyphScale: 0.6,
          displayFamily: style.fontFamily,
          monoFamily: style.getPropertyValue('--pt-mono').trim() || undefined,
        });
        return () => glyphs?.destroy();
      }

      const horizon = createHorizonField(el, { speed: 0.5, params: HORIZON[theme] });
      const fit = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!horizon || w < 2 || h < 2) return;
        horizon.setParams({ center: [w / 2, h / 2], radius: Math.min(w, h) * 0.3 });
        horizon.pause();
        horizon.renderStatic();
      };
      fit();
      const resize = new ResizeObserver(fit);
      resize.observe(el);
      return () => {
        resize.disconnect();
        horizon?.destroy();
      };
    },
    { dependencies: [armed, field, theme], revertOnUpdate: true }
  );

  return <canvas aria-hidden='true' className='dmo-cg-canvas' ref={canvas} />;
}

type FrameProps = {
  id: FrameId;
  name: string;
  w: number;
  h: number;
  title: string;
  field: FieldName;
  theme: Theme;
  armed: boolean;
};

/**
 * One export at its aspect ratio. Every length inside is written in the
 * export's own px through --u (one export px as a share of the frame's
 * width), so the type, the mark and the rules keep their export sizes at
 * any preview width.
 */
function Frame({ id, name, w, h, title, field, theme, armed }: FrameProps) {
  const style: CSSProperties = { aspectRatio: `${w} / ${h}`, '--cg-w': w };
  const words = title.trim() || 'Untitled';
  return (
    <figure className='dmo-cg-figure'>
      <div aria-label={`${name}, ${w} by ${h}: ${words}`} className={`dmo-cg-frame is-${id} is-${theme}`} role='img' style={style}>
        <div className='dmo-cg-field'>
          <FieldCanvas armed={armed} exportWidth={w} field={field} key={`${field}-${theme}`} theme={theme} />
        </div>
        {id === 'card' ? (
          <>
            <span aria-hidden='true' className='dmo-cg-rule is-rail-l' />
            <span aria-hidden='true' className='dmo-cg-rule is-rail-r' />
            <span aria-hidden='true' className='dmo-cg-rule is-rule-t' />
            <span aria-hidden='true' className='dmo-cg-rule is-rule-b' />
            <span aria-hidden='true' className='dmo-cg-foot'>
              generaltranslation.com
            </span>
          </>
        ) : null}
        <div aria-hidden='true' className='dmo-cg-head'>
          <span className='dmo-cg-mark'>
            <GtMark />
          </span>
          <span className='dmo-cg-name'>General Translation</span>
        </div>
        <div aria-hidden='true' className='dmo-cg-copy'>
          <span className='dmo-cg-double' />
          <p className='dmo-cg-title'>{words}</p>
        </div>
      </div>
      <figcaption className='dmo-cg-caption'>
        {name} <span className='dmo-num'>{w} × {h}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Covers, social cards and the X banner from one title: the reader types
 * the title and picks the field and the theme, and each export shows at
 * its own aspect ratio with the GT mark, the name and the title set by
 * the rules (Inter at 500, display tracking, two lines at most, nothing
 * under 22 export px). The field takes one side of each frame and the
 * type sits on solid ground.
 */
export default function CoverGeneratorDemo() {
  const inputId = useId();
  const frames = useRef<HTMLDivElement>(null);
  const armed = useArmed(frames);
  const [title, setTitle] = useState('Every product in every language');
  const [field, setField] = useState<FieldName>('dither');
  const [theme, setTheme] = useState<Theme>('dark');

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={inputId}>
              Title
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={inputId}
              maxLength={CARD_TITLE_MAX}
              spellCheck={false}
              type='text'
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
            />
          </div>
          <Choice label='Field' options={FIELDS} value={field} onChange={setField} />
          <Choice label='Theme' options={THEMES} value={theme} onChange={setTheme} />
        </>
      }
      fit
      label='A post cover, a social card and an X banner generated from one title'
      tag='1920 × 1080, 1200 × 630, 1500 × 500'
    >
      <div className='dmo-cg' ref={frames}>
        {FRAMES.map((frame) => (
          <Frame armed={armed} field={field} key={frame.id} theme={theme} title={title} {...frame} />
        ))}
      </div>
    </Plate>
  );
}
