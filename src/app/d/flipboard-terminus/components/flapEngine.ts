import gsap from 'gsap';

/**
 * Split-flap board engine.
 *
 * Tiles are rendered by React (so the board is real text before JS runs); this
 * module only mutates the glyph spans inside them, which React never re-renders.
 */

const CYCLE = 'AEIOUMKZ言語한ÑÉ0387·/–ΔΩ';

/** Deterministic intermediate glyph so scrubbed flips render the same at a given progress. */
function cycleGlyph(index: number, step: number): string {
  return CYCLE[(index * 5 + step * 3) % CYCLE.length] ?? '·';
}

export function faces(line: HTMLElement): HTMLElement[] {
  return Array.from(line.querySelectorAll<HTMLElement>('[data-flap-face]'));
}

function render(face: HTMLElement, char: string): void {
  const tile = face.parentElement;
  if (!tile) return;
  const blank = char === ' ';
  tile.classList.toggle('is-blank', blank);
  const text = blank ? '·' : char;
  if (face.textContent !== text) face.textContent = text;
}

/** Set a board instantly, padding or truncating to the rendered tile count. */
export function setBoard(line: HTMLElement, text: string): void {
  const list = faces(line);
  const chars = Array.from(text);
  list.forEach((face, i) => {
    render(face, chars[i] ?? ' ');
    face.style.transform = '';
  });
}

/** One-shot clacking flip, cascading left to right. */
export function flipTo(
  line: HTMLElement,
  text: string,
  options: { per?: number; cycles?: number } = {}
): gsap.core.Timeline {
  const { per = 0.018, cycles = 3 } = options;
  const list = faces(line);
  const chars = Array.from(text);
  const tl = gsap.timeline();

  list.forEach((face, i) => {
    const target = chars[i] ?? ' ';
    const tile = face.parentElement;
    const current = tile?.classList.contains('is-blank') ? ' ' : (face.textContent ?? '');
    if (current === target) return;

    const sub = gsap.timeline();
    const steps = cycles + (i % 2);
    for (let c = 0; c < steps; c++) {
      const glyph = c === steps - 1 ? target : cycleGlyph(i, c);
      sub
        .to(face, {
          scaleY: 0.1,
          duration: 0.028,
          ease: 'power1.in',
          onComplete: () => render(face, glyph),
        })
        .to(face, { scaleY: 1, duration: 0.034, ease: 'power1.out' });
    }
    tl.add(sub, i * per);
  });

  return tl;
}

/**
 * Deterministic scrub-driven flip: the same progress always renders the same
 * frame, which is what keeps the story beats legible mid-scrub.
 */
export function scrubFlap(line: HTMLElement, from: string, to: string, progress: number): void {
  const list = faces(line);
  const fromChars = Array.from(from);
  const toChars = Array.from(to);
  const window = 0.45;

  list.forEach((face, i) => {
    const start = (i / Math.max(1, list.length)) * (1 - window);
    const local = Math.max(0, Math.min(1, (progress - start) / window));
    let char: string;
    if (local <= 0) char = fromChars[i] ?? ' ';
    else if (local >= 1) char = toChars[i] ?? ' ';
    else char = cycleGlyph(i, Math.floor(local * 6));
    render(face, char);
    const fold =
      local > 0 && local < 1 ? 0.32 + 0.68 * Math.abs(Math.cos(local * Math.PI * 6)) : 1;
    face.style.transform = fold === 1 ? '' : `scaleY(${fold.toFixed(3)})`;
  });
}
