'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { createGlyphGlobe, type GlyphGlobeHandle, type GlyphGlobeSettings } from '@/lib/glyph-globe';
import { glyphGlobeSettings, type GlyphGlobePreset } from '@/lib/glyph-globe-presets';
import { useLayoutWork } from '@/lib/use-layout-work';

export type GlyphGlobeProps = Partial<GlyphGlobeSettings> & {
  /** a named look; every other prop is set over it. 'launch', the globe from the launch graphics and films, by default */
  preset?: GlyphGlobePreset;
  /** spin on its own once on screen; false holds the still until play() is called on the handle */
  autoplay?: boolean;
  /** the loop time of the still shown under reduced motion, while paused and before the first frame, in seconds */
  stillTime?: number;
  /** the device pixel ratio cap, 2 by default; the screen needs whole pixels */
  dpr?: number;
  /** the face a custom glyphSet is drawn in; the page's face by default */
  glyphFont?: string;
  /** the picture shown before the first frame and without WebGL2; the launch still for the launch look by default */
  poster?: string | null;
  /** the accessible name; without one the globe is decoration and hidden from assistive technology */
  title?: string;
  className?: string;
  style?: CSSProperties;
  /** called with the running globe, and with null when it goes */
  onHandle?: (handle: GlyphGlobeHandle | null) => void;
  /** called after each frame with the milliseconds it took */
  onFrame?: (ms: number) => void;
};

/** The launch look's frame at t = 0, drawn by the engine at a pixel ratio of 2 (public/media/README.md); object-position right bottom frames it as 'launch' does. */
const LAUNCH_POSTER = '/media/glyph-globe/launch.webp';

const ENGINE_KEYS = new Set([
  'preset',
  'autoplay',
  'stillTime',
  'dpr',
  'glyphFont',
  'poster',
  'title',
  'className',
  'style',
  'onHandle',
  'onFrame',
]);

/** The settings props alone, without the component's own props. */
function settingsOf(props: GlyphGlobeProps): Partial<GlyphGlobeSettings> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ENGINE_KEYS.has(key) && value !== undefined) out[key] = value;
  }
  return out as Partial<GlyphGlobeSettings>;
}

/**
 * The glyph globe (src/lib/glyph-globe.ts): the dithered earth with glyph
 * tiles from the launch graphics and films. By default it is the launch look
 * exactly and turns a full revolution every 10 seconds, west to east.
 * Callers size it; the globe fills its box and the 'launch' framing keeps
 * the globe's upper left in view at any aspect. It is created paused, plays
 * only while on screen, and under reduced motion shows one still.
 */
export default function GlyphGlobe(props: GlyphGlobeProps) {
  const { preset = 'launch', autoplay = true, stillTime = 0, dpr, glyphFont, title, className, style, onHandle, onFrame } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GlyphGlobeHandle | null>(null);
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  const settings = glyphGlobeSettings(preset, settingsOf(props));
  const key = JSON.stringify(settings);
  const isLaunchLook = key === JSON.stringify(glyphGlobeSettings('launch'));
  const poster = props.poster === undefined ? (isLaunchLook ? LAUNCH_POSTER : null) : props.poster;

  /* one engine per mount, rebuilt only when the pixel ratio, autoplay or the still changes */
  useLayoutWork(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const handle = createGlyphGlobe(canvas, {
        settings,
        dpr,
        autoplay,
        stillTime,
        font: glyphFont,
        onFrame: (ms) => frameRef.current?.(ms),
      });
      handleRef.current = handle;
      onHandle?.(handle);
      return () => {
        handle?.destroy();
        handleRef.current = null;
        onHandle?.(null);
      };
    },
    { dependencies: [dpr, autoplay, stillTime, glyphFont] }
  );

  /* every other change goes to the running globe, so the spin keeps its clock */
  useLayoutWork(
    () => {
      handleRef.current?.setSettings(settings);
    },
    { dependencies: [key] }
  );

  const fill: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' };

  return (
    <div
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      role={title ? 'img' : undefined}
      style={{ position: 'relative', overflow: 'hidden', background: settings.palette.ground, ...style }}
    >
      {poster ? (
        <img
          alt=''
          decoding='async'
          src={poster}
          style={{ ...fill, objectFit: 'cover', objectPosition: 'right bottom' }}
        />
      ) : null}
      <canvas ref={canvasRef} style={fill} />
    </div>
  );
}
