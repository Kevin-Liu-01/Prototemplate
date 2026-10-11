/*
 * GT motion kit: the gem smoke material, seekable.
 *
 * Gem smoke is Paper Shaders' Gem Smoke family (Apache-2.0, kit/paper-shaders),
 * the GPU material Glyphfield renders and the deck uses for its Blog and
 * Developer experience openers and the designed blog covers. This module
 * mounts it on a canvas with its clock stopped (speed 0) and draws a frame
 * for any time the timeline asks for, so a frame is a pure function of time:
 * call gem.at(seconds) inside the timeline's onUpdate.
 *
 * Palettes are the deck's renders (deck/shots/OPENERS.md):
 *   blue  colorBack #2f5ce0, colors #ffffff, #86a8ff (white smoke on brand blue)
 *   fire  colorBack #000000, colors #fe5b16, #f7ff61, #ffffff (Paper's Fire preset)
 *   ink   colorBack #070707, colors #2f5ce0, #ffffff (blue smoke on ink)
 * Any uniform can be overridden through opts.params (Paper's prop names).
 *
 * A shape: opts.image names a pre-processed shape PNG under kit/gem-shapes/
 * (R = edge gradient, G = alpha, made by kit/gem-shapes/make.html from a
 * logo), so the smoke wraps a mark; without one, opts.params.shape picks
 * Paper's built-in shape (metaballs, diamond, circle, ...).
 *
 * The screen: gem.dither(grid, opts) reads the frame just drawn into a
 * GTDither grid and prints it through the 8 by 8 Bayer screen in two or
 * three tones, the look of the GT Open Source and Fumadocs covers.
 *
 *   <script type="module" src="kit/gemsmoke.js"></script>
 *   const gem = await GTGem.mount(hostDiv, { palette: 'blue', params: { shape: 'metaballs' } });
 *   onUpdate: () => gem && gem.at(tl.time())
 */
import {
  ShaderMount,
  gemSmokeFragmentShader,
  GemSmokeShapes,
  getShaderColorFromString,
  ShaderFitOptions,
  defaultObjectSizing,
} from './paper-shaders/index.js';

const PALETTES = {
  blue: { colorBack: '#2f5ce0', colors: ['#ffffff', '#86a8ff'], colorInner: '#00000000' },
  fire: { colorBack: '#000000', colors: ['#fe5b16', '#f7ff61', '#ffffff'], colorInner: '#00000000' },
  ink: { colorBack: '#070707', colors: ['#2f5ce0', '#ffffff'], colorInner: '#00000000' },
};

/* Paper's Default and Fire preset geometry and glow (shaders-react gem-smoke.js). */
const PRESET = {
  blue: { scale: 0.6, outerGlow: 0.55, innerGlow: 1, innerDistortion: 0.8, outerDistortion: 0.6, offset: 0, angle: 0, size: 0.8, shape: 'metaballs' },
  fire: { scale: 0.6, outerGlow: 1, innerGlow: 0.65, innerDistortion: 0.6, outerDistortion: 0.8, offset: 0, angle: 0, size: 0.8, shape: 'metaballs' },
  ink: { scale: 0.6, outerGlow: 0.55, innerGlow: 1, innerDistortion: 0.8, outerDistortion: 0.6, offset: 0, angle: 0, size: 0.8, shape: 'metaballs' },
};

const TRANSPARENT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'sync';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('gem smoke: could not load ' + src));
    img.src = src;
  });
}

function uniformsFrom(p, image) {
  return {
    u_colors: p.colors.map(getShaderColorFromString),
    u_colorsCount: p.colors.length,
    u_colorBack: getShaderColorFromString(p.colorBack),
    u_image: image,
    u_innerDistortion: p.innerDistortion,
    u_outerDistortion: p.outerDistortion,
    u_outerGlow: p.outerGlow,
    u_innerGlow: p.innerGlow,
    u_colorInner: getShaderColorFromString(p.colorInner),
    u_offset: p.offset,
    u_angle: p.angle,
    u_size: p.size,
    u_isImage: Boolean(p.image),
    u_shape: GemSmokeShapes[p.shape] ?? 0,
    u_fit: ShaderFitOptions[p.fit || 'contain'],
    u_scale: p.scale,
    u_rotation: p.rotation || 0,
    u_offsetX: p.offsetX || 0,
    u_offsetY: p.offsetY || 0,
    u_originX: p.originX == null ? 0.5 : p.originX,
    u_originY: p.originY == null ? 0.5 : p.originY,
    u_worldWidth: p.worldWidth || 0,
    u_worldHeight: p.worldHeight || 0,
  };
}

/**
 * Mounts gem smoke in `host` (a sized block element). Resolves to a handle:
 *   at(seconds)      draws the frame for that time (plus opts.offset seconds)
 *   set(params)      changes Paper params (colors, glow, shape, scale...) and redraws
 *   dither(grid, o)  prints the last frame through the Bayer screen into a GTDither grid
 *   canvas           the WebGL canvas
 * opts: palette ('blue' | 'fire' | 'ink'), params (Paper prop overrides),
 * image (a processed shape PNG url), width/height (css px, default the host's),
 * pixelRatio (backing pixels per css px, default 1), offset (seconds added to
 * every at(), to pick a phase of the motion), rate (time multiplier, default 1).
 */
async function mount(host, opts) {
  const o = opts || {};
  const palette = o.palette || 'blue';
  const p = Object.assign({}, defaultObjectSizing, PRESET[palette], PALETTES[palette], o.params || {});
  if (o.image) p.image = o.image;
  const image = await loadImage(o.image || TRANSPARENT);
  const width = o.width || host.clientWidth || 1920;
  const height = o.height || host.clientHeight || 1080;
  host.style.width = width + 'px';
  host.style.height = height + 'px';
  const ratio = o.pixelRatio || 1;
  const sm = new ShaderMount(host, gemSmokeFragmentShader, uniformsFrom(p, image), { preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: true }, 0, 0, ratio, width * height * ratio * ratio + 1, ['u_image']);
  // Size synchronously: the mount's own ResizeObserver reports later than the
  // first seek, so set the box it would read and apply it now.
  sm.devicePixelsSupported = false;
  sm.parentWidth = width;
  sm.parentHeight = height;
  sm.handleResize();
  const offset = o.offset || 0;
  const rate = o.rate == null ? 1 : o.rate;
  const sample = document.createElement('canvas');
  const sctx = sample.getContext('2d', { willReadFrequently: true });
  const handle = {
    canvas: sm.canvasElement,
    mount: sm,
    at(seconds) {
      sm.setFrame((offset + seconds * rate) * 1000);
    },
    async set(params) {
      Object.assign(p, params || {});
      let img = image;
      if (params && params.image) img = await loadImage(params.image);
      sm.setUniforms(uniformsFrom(p, img));
    },
    /**
     * Prints the frame just drawn into a GTDither grid (window.GTDither.grid).
     * tones: two or three hex colors from dark to light; the frame's
     * luminance picks between them through the anchored Bayer screen (three
     * tones use two nested thresholds). gain and gamma shape the tone first.
     */
    dither(grid, d) {
      const opt = d || {};
      const D = window.GTDither;
      const tones = (opt.tones || ['#2f5ce0', '#ffffff']).map((c) => D.parseColor(c));
      sample.width = grid.cols;
      sample.height = grid.rows;
      sctx.imageSmoothingEnabled = true;
      sctx.clearRect(0, 0, grid.cols, grid.rows);
      sctx.drawImage(sm.canvasElement, 0, 0, grid.cols, grid.rows);
      const px = sctx.getImageData(0, 0, grid.cols, grid.rows).data;
      const out = grid.image.data;
      const gain = opt.gain == null ? 1 : opt.gain;
      const gamma = opt.gamma || 1;
      const amount = opt.amount == null ? 1 : opt.amount;
      const B = D.B8;
      for (let y = 0, i = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols; x++, i++) {
          const k = i * 4;
          let v = (0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]) / 255;
          v = Math.min(1, Math.pow(Math.max(0, v), gamma) * gain) * amount;
          const th = (B[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
          let c;
          if (tones.length >= 3) c = v * 2 > 1 + th ? tones[2] : v * 2 > th ? tones[1] : tones[0];
          else c = v > th ? tones[1] : tones[0];
          out[k] = c[0];
          out[k + 1] = c[1];
          out[k + 2] = c[2];
          out[k + 3] = 255;
        }
      }
      grid.octx.putImageData(grid.image, 0, 0);
      grid.ctx.imageSmoothingEnabled = false;
      grid.ctx.clearRect(0, 0, grid.width, grid.height);
      grid.ctx.drawImage(grid.off, 0, 0, grid.cols * grid.cell, grid.rows * grid.cell);
    },
  };
  return handle;
}

window.GTGem = { mount, PALETTES, PRESET, shapes: Object.keys(GemSmokeShapes) };
window.dispatchEvent(new Event('gtgem-ready'));
