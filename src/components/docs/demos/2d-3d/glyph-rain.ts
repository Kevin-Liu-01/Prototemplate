import type { CanvasEngine } from './canvas-loop';
import { cssRgb, type Rgb } from './ink';
import type { Presence } from './presence';

/**
 * Glyph rain in sixteen scripts, set in fixed cells.
 *
 * Every column is set in one script and every cell holds one glyph of it,
 * so the screen is a typeset grid before anything moves. A drop is a lit
 * window that steps down its column one row at a time: the head prints at
 * full ink and the tail fades in six alpha steps. The glyphs themselves
 * never move, so nothing shimmers or lands between pixels; a cell changes
 * its glyph now and then, a quarter of the cells each second. Two layers
 * give the depth: a far grid of small glyphs at low alpha under a near
 * grid at full size. The near cells around the pointer light up by their
 * distance from it, and the plate names the script of the column under
 * the pointer.
 *
 * Every frame is a function of the clock alone (a drop's row is
 * (t·v + φ) mod its lap), so the still is any instant and the field starts
 * full. Glyphs are rasterised once per size into a white atlas; a frame
 * blits each lit cell from it at a whole device pixel, then one
 * source-in fill turns everything drawn that frame into the ink.
 */

export type RainScript = {
  /** ISO 15924 */
  code: string;
  name: string;
  /** the word for "language" in a language written in the script */
  word: string;
  lang: string;
  rtl?: boolean;
  glyphs: string;
};

export const RAIN_SCRIPTS: readonly RainScript[] = [
  { code: 'Latn', name: 'Latin', word: 'language', lang: 'en', glyphs: 'abcdefghijklmnopqrstuvwxyz' },
  { code: 'Grek', name: 'Greek', word: 'γλώσσα', lang: 'el', glyphs: 'αβγδεζηθικλμνξοπρστυφχψω' },
  { code: 'Cyrl', name: 'Cyrillic', word: 'язык', lang: 'ru', glyphs: 'абвгдежзийклмнопрстуфхцчшщыэюя' },
  { code: 'Armn', name: 'Armenian', word: 'լեզու', lang: 'hy', glyphs: 'աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցփքօֆ' },
  { code: 'Geor', name: 'Georgian', word: 'ენა', lang: 'ka', glyphs: 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ' },
  { code: 'Hebr', name: 'Hebrew', word: 'שפה', lang: 'he', rtl: true, glyphs: 'אבגדהוזחטיכלמנסעפצקרשת' },
  { code: 'Arab', name: 'Arabic', word: 'لغة', lang: 'ar', rtl: true, glyphs: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي' },
  { code: 'Deva', name: 'Devanagari', word: 'भाषा', lang: 'hi', glyphs: 'कखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह' },
  { code: 'Beng', name: 'Bengali', word: 'ভাষা', lang: 'bn', glyphs: 'কখগঘচছজঝটঠডঢণতথদধনপফবভমযরলশষসহ' },
  { code: 'Taml', name: 'Tamil', word: 'மொழி', lang: 'ta', glyphs: 'அஆஇஈஉஊஎஏஐஒஓகஙசஞடணதநபமயரலவழளறன' },
  { code: 'Thai', name: 'Thai', word: 'ภาษา', lang: 'th', glyphs: 'กขคฆงจฉชซญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ' },
  { code: 'Ethi', name: 'Ethiopic', word: 'ቋንቋ', lang: 'am', glyphs: 'ሀለሐመሠረሰሸቀበተቸኀነኘአከኸወዐዘዠየደጀገጠጨጰጸፀፈፐ' },
  { code: 'Khmr', name: 'Khmer', word: 'ភាសា', lang: 'km', glyphs: 'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអ' },
  { code: 'Hani', name: 'Han', word: '语言', lang: 'zh', glyphs: '语言文字世界翻译书写人大中国日月山水火木金土天地' },
  { code: 'Kana', name: 'Kana', word: 'げんご', lang: 'ja', glyphs: 'あいうえおかきくけこさしすせそたちつてとなにぬねのアイウエオカキクケコ' },
  { code: 'Hang', name: 'Hangul', word: '언어', lang: 'ko', glyphs: '가나다라마바사아자차카타파하언어한글말글' },
];

const SCRIPT_GLYPHS = RAIN_SCRIPTS.map((script) => Array.from(script.glyphs));

type Layer = {
  size: number;
  col: number;
  row: number;
  alpha: number;
  /** rows a second, the slowest and the fastest drop */
  speed: readonly [number, number];
  tail: readonly [number, number];
};

const LAYERS: readonly Layer[] = [
  { size: 10.5, col: 15, row: 14, alpha: 0.34, speed: [2.2, 4.6], tail: [7, 14] },
  { size: 15, col: 22, row: 20, alpha: 1, speed: [3.4, 7.5], tail: [8, 18] },
];
const PHONE: readonly Layer[] = [
  { size: 9.5, col: 13, row: 12, alpha: 0.34, speed: [2.2, 4.6], tail: [6, 12] },
  { size: 13, col: 19, row: 17, alpha: 1, speed: [3.4, 7.5], tail: [7, 15] },
];
const STEPS = 6;
const MUTATE = 0.25;
const LAMP = 72;

function hash(a: number, b: number, c = 0): number {
  let h = Math.imul(a + 0x9e37, 374761393) ^ Math.imul(b + 0x85eb, 668265263) ^ Math.imul(c + 0xc2b2, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Atlas = { canvas: HTMLCanvasElement | ImageBitmap; cellW: number; cellH: number; per: number; offsets: number[] };

export type RainOptions = {
  canvas: HTMLCanvasElement;
  /** drops per column */
  drops: number;
  ink: Rgb;
  family: string;
};

export type RainEngine = CanvasEngine & {
  /** lights the near cells around a point in CSS pixels, or none with null; returns the script under it */
  point: (x: number | null, y: number) => RainScript | null;
  set: (patch: Partial<Pick<RainOptions, 'drops' | 'ink'>>) => void;
  /** glyph blits in the last paint */
  blits: () => number;
};

export function createGlyphRain(options: RainOptions): RainEngine | null {
  const { canvas, family } = options;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  let drops = options.drops;
  let ink = options.ink;
  let width = 1;
  let height = 1;
  let dpr = 1;
  let layers = LAYERS;
  let atlases: Atlas[] = [];
  let time = 9;
  let lamp: { x: number; y: number } | null = null;
  let count = 0;
  let disposed = false;

  function buildAtlas(layer: Layer): Atlas {
    const cellW = Math.ceil(layer.col * dpr);
    const cellH = Math.ceil(layer.row * dpr);
    const total = SCRIPT_GLYPHS.reduce((sum, list) => sum + list.length, 0);
    const per = Math.max(1, Math.floor(2048 / cellW));
    const rows = Math.ceil(total / per);
    const surface = document.createElement('canvas');
    surface.width = per * cellW;
    surface.height = rows * cellH;
    const g = surface.getContext('2d');
    const offsets: number[] = [];
    if (g) {
      g.fillStyle = 'white';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `400 ${layer.size * dpr}px ${family}`;
      let n = 0;
      SCRIPT_GLYPHS.forEach((list) => {
        offsets.push(n);
        for (const glyph of list) {
          const x = (n % per) * cellW;
          const y = Math.floor(n / per) * cellH;
          g.fillText(glyph, x + cellW / 2, y + cellH / 2);
          n++;
        }
      });
    }
    return { canvas: surface, cellW, cellH, per, offsets };
  }

  function build() {
    for (const atlas of atlases) if (atlas.canvas instanceof ImageBitmap) atlas.canvas.close();
    atlases = layers.map(buildAtlas);
    /* blit from a bitmap snapshot once it exists; a canvas source stays usable meanwhile */
    atlases.forEach((atlas, i) => {
      if (typeof createImageBitmap === 'undefined' || atlas.canvas instanceof ImageBitmap) return;
      createImageBitmap(atlas.canvas).then(
        (bitmap) => {
          if (disposed || atlases[i] !== atlas) {
            bitmap.close();
            return;
          }
          atlas.canvas = bitmap;
        },
        () => undefined
      );
    });
  }

  /* the atlas is drawn with the page's faces; draw it again once they have loaded */
  if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
    document.fonts.ready.then(
      () => {
        if (!disposed && atlases.length) build();
      },
      () => undefined
    );
  }

  function scriptOf(layer: number, col: number): number {
    return Math.floor(hash(col, layer, 77) * RAIN_SCRIPTS.length);
  }

  function blit(atlas: Atlas, script: number, glyph: number, x: number, y: number) {
    const list = SCRIPT_GLYPHS[script];
    if (!list) return;
    const n = (atlas.offsets[script] ?? 0) + (glyph % list.length);
    const sx = (n % atlas.per) * atlas.cellW;
    const sy = Math.floor(n / atlas.per) * atlas.cellH;
    ctx.drawImage(atlas.canvas, sx, sy, atlas.cellW, atlas.cellH, x, y, atlas.cellW, atlas.cellH);
    count++;
  }

  function glyphAt(script: number, col: number, row: number): number {
    const list = SCRIPT_GLYPHS[script];
    const len = list ? list.length : 1;
    const turn = Math.floor(time * MUTATE + hash(col, row, 5) * 8);
    return Math.floor(hash(col, row, turn) * len);
  }

  function paint() {
    count = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer, li) => {
      const atlas = atlases[li];
      if (!atlas) return;
      const cols = Math.ceil(width / layer.col) + 1;
      const rows = Math.ceil(height / layer.row) + 1;
      const shift = li === 0 ? layer.col / 2 : 0;
      for (let c = 0; c < cols; c++) {
        const script = scriptOf(li, c);
        const x = Math.round((c * layer.col - shift) * dpr);
        const v = layer.speed[0] + (layer.speed[1] - layer.speed[0]) * hash(c, li, 1);
        const tail = Math.round(layer.tail[0] + (layer.tail[1] - layer.tail[0]) * hash(c, li, 2));
        const lap = rows + tail + Math.round(rows * (0.3 + 0.9 * hash(c, li, 3)));
        for (let k = 0; k < drops; k++) {
          const phase = hash(c, li, 4 + k) * lap + (k * lap) / drops;
          const head = Math.floor((time * v + phase) % lap) - 1;
          const from = Math.max(0, head - tail + 1);
          const to = Math.min(rows - 1, head);
          for (let r = from; r <= to; r++) {
            const age = head - r;
            const level = Math.ceil((1 - age / tail) * STEPS) / STEPS;
            ctx.globalAlpha = layer.alpha * (age === 0 ? 1 : level * 0.82);
            blit(atlas, script, glyphAt(script, c, r), x, Math.round(r * layer.row * dpr));
          }
        }
      }
    });
    const near = layers[layers.length - 1];
    const atlas = atlases[atlases.length - 1];
    if (lamp && near && atlas) {
      const reach = Math.ceil(LAMP / near.col);
      const c0 = Math.floor(lamp.x / near.col);
      const r0 = Math.floor(lamp.y / near.row);
      for (let c = c0 - reach; c <= c0 + reach; c++) {
        if (c < 0) continue;
        for (let r = r0 - reach; r <= r0 + reach; r++) {
          if (r < 0) continue;
          const d = Math.hypot((c + 0.5) * near.col - lamp.x, (r + 0.5) * near.row - lamp.y) / LAMP;
          if (d >= 1) continue;
          ctx.globalAlpha = Math.ceil((1 - d) * 4) / 4 * 0.55;
          const script = scriptOf(layers.length - 1, c);
          blit(atlas, script, glyphAt(script, c, r), Math.round(c * near.col * dpr), Math.round(r * near.row * dpr));
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = cssRgb(ink);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  return {
    resize(state: Presence) {
      width = Math.max(1, state.width);
      height = Math.max(1, state.height);
      const nextDpr = state.dpr;
      const nextLayers = width < 520 ? PHONE : LAYERS;
      canvas.width = Math.round(width * nextDpr);
      canvas.height = Math.round(height * nextDpr);
      if (nextDpr !== dpr || nextLayers !== layers || !atlases.length) {
        dpr = nextDpr;
        layers = nextLayers;
        build();
      }
    },
    step(delta) {
      time += delta;
    },
    paint,
    still() {
      time = 9;
    },
    point(x, y) {
      if (x === null) {
        lamp = null;
        return null;
      }
      lamp = { x, y };
      const near = layers[layers.length - 1];
      if (!near) return null;
      return RAIN_SCRIPTS[scriptOf(layers.length - 1, Math.floor(x / near.col))] ?? null;
    },
    set(patch) {
      if (patch.drops) drops = patch.drops;
      if (patch.ink) ink = patch.ink;
    },
    blits: () => count,
    dispose() {
      disposed = true;
      for (const atlas of atlases) if (atlas.canvas instanceof ImageBitmap) atlas.canvas.close();
      atlases = [];
    },
  };
}
