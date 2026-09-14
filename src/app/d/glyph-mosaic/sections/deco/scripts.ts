/**
 * GLYPH MOSAIC: the tessera material.
 *
 * C1 homes served: the hero crown and the hero plate (C1.4), the section
 * heads (C1.1), the hatch dividers (C1.2), the dark band floor (C1.5).
 *
 * Every ornament on the page is laid from the same seven pools of real
 * glyphs. A tessera is one character; its script is chosen by an integer
 * hash of the cell it occupies, so the same floor is laid on the server, on
 * the client, and on every visit. The hash uses only 32-bit integer
 * arithmetic (Math.imul, shifts), never Math.sin, so no engine rounds it
 * differently and hydration never disagrees with the server render.
 */

export type ScriptKey =
  | 'latin'
  | 'greek'
  | 'cyrillic'
  | 'arabic'
  | 'devanagari'
  | 'hangul'
  | 'han';

export type Script = {
  key: ScriptKey;
  /** The script's English name, as the legend prints it. */
  name: string;
  /** One representative glyph for the legend. */
  sample: string;
  /** BCP-47 tag for the sample glyph and the legend's LocaleTag chip. */
  lang: string;
  rtl?: boolean;
  /** The pool the tesserae are drawn from. */
  glyphs: readonly string[];
};

export const SCRIPTS: readonly Script[] = [
  { key: 'latin', name: 'Latin', sample: 'A', lang: 'en', glyphs: [...'AEGKMNRSTaegkmnrst'] },
  { key: 'greek', name: 'Greek', sample: 'Ω', lang: 'el', glyphs: [...'ΓΔΘΛΞΠΣΦΨΩαδθλξπφω'] },
  { key: 'cyrillic', name: 'Cyrillic', sample: 'Ж', lang: 'ru', glyphs: [...'БГДЖЗИЛПФЦЧШЮЯбджя'] },
  { key: 'arabic', name: 'Arabic', sample: 'ع', lang: 'ar', rtl: true, glyphs: [...'ابجحدرسشصطعفقكلمنهوي'] },
  { key: 'devanagari', name: 'Devanagari', sample: 'अ', lang: 'hi', glyphs: [...'अआइउकखगचजटतदनपबमयरलवशस'] },
  { key: 'hangul', name: 'Hangul', sample: '한', lang: 'ko', glyphs: [...'가나다라마바사아자차카타파하한글'] },
  { key: 'han', name: 'Han', sample: '語', lang: 'zh', glyphs: [...'文字言語译世界读書写话词句'] },
];

/** Deterministic 0..1 noise from integer coordinates and a seed. */
export function hash32(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export type Pick = { script: Script; glyph: string };

/** The tessera for a cell: its script and the glyph drawn from that script's pool. */
export function pickGlyph(x: number, y: number, seed: number): Pick {
  const s = hash32(x, y, seed);
  const g = hash32(y, x, seed + 101);
  const script = SCRIPTS[Math.floor(s * SCRIPTS.length) % SCRIPTS.length] ?? SCRIPTS[0]!;
  const glyph = script.glyphs[Math.floor(g * script.glyphs.length) % script.glyphs.length] ?? script.sample;
  return { script, glyph };
}

/** The house 8x8 screen as 0..1 thresholds, indexed by cell coordinates. */
export function bayerThreshold(matrix: readonly (readonly number[])[], x: number, y: number): number {
  const row = matrix[((y % 8) + 8) % 8];
  const v = row?.[((x % 8) + 8) % 8] ?? 0;
  return (v + 0.5) / 64;
}
