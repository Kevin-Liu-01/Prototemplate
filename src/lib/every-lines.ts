export type EveryGlyph = {
  text: string;
  /** Null for whitespace, which joins the line it falls on and never starts one. */
  box: { left: number; top: number; height: number } | null;
};

export type EveryLine = { text: string; x: number };

/** Groups laid-out glyphs into the browser's own line boxes, each with the left edge of its first visible glyph. */
export function groupEveryLines(glyphs: readonly EveryGlyph[]): EveryLine[] {
  const lines: EveryLine[] = [];
  let top = 0;
  for (const { text, box } of glyphs) {
    const last = lines[lines.length - 1];
    if (!box) {
      if (last) last.text += text;
      continue;
    }
    if (!last || Math.abs(box.top - top) > box.height / 2) {
      lines.push({ text, x: box.left });
      top = box.top;
      continue;
    }
    last.text += text;
  }
  return lines.map((l) => ({ text: l.text.trim(), x: l.x }));
}

/** Reads a laid-out text element's glyph boxes relative to its own box. */
export function readEveryGlyphs(el: HTMLElement): EveryGlyph[] {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return [];
  const origin = el.getBoundingClientRect();
  const range = document.createRange();
  const glyphs: EveryGlyph[] = [];
  let i = 0;
  for (const ch of node.textContent ?? '') {
    range.setStart(node, i);
    range.setEnd(node, i + ch.length);
    i += ch.length;
    const r = /\s/.test(ch) ? undefined : range.getClientRects()[0];
    glyphs.push({
      text: ch,
      box: r ? { left: r.left - origin.left, top: r.top - origin.top, height: r.height } : null,
    });
  }
  return glyphs;
}
