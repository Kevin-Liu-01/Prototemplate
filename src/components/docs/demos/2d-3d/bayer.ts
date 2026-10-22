/**
 * The house Bayer screens as threshold tables, for the GPU pass and the
 * canvas pieces on the 2D and 3D pages. The matrices grow by the rule in
 * src/lib/dither.ts, M(2n) = [[4M, 4M + 2], [4M + 3, 4M + 1]], so the 4 by 4
 * table reads 0 8 2 10 on its first row and the 8 by 8 table equals
 * BAYER_8. A cell is lit when its tone is over (m + 0.5) / n², so a
 * constant tone k / n² lights exactly k cells of every tile.
 */

export type MatrixSize = 2 | 4 | 8;

const BASE = [
  [0, 2],
  [3, 1],
] as const;

const tables = new Map<MatrixSize, Float32Array>();

/** The n by n thresholds, row-major, each (m + 0.5) / n². */
export function bayerThresholds(n: MatrixSize): Float32Array {
  const hit = tables.get(n);
  if (hit) return hit;
  let m: number[][] = BASE.map((row) => [...row]);
  while (m.length < n) {
    const k = m.length;
    const prev = m;
    m = Array.from({ length: k * 2 }, (_, y) =>
      Array.from({ length: k * 2 }, (_, x) => 4 * (prev[y % k]?.[x % k] ?? 0) + (BASE[Math.floor(y / k)]?.[Math.floor(x / k)] ?? 0))
    );
  }
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) out[y * n + x] = ((m[y]?.[x] ?? 0) + 0.5) / (n * n);
  tables.set(n, out);
  return out;
}

/** The 64-entry uniform the GPU pass reads: the n by n table, padded with zeros. */
export function bayerUniform(n: MatrixSize): Float32Array {
  const out = new Float32Array(64);
  out.set(bayerThresholds(n));
  return out;
}

export const MATRIX_OPTIONS = [
  { value: '2', label: '2×2' },
  { value: '4', label: '4×4' },
  { value: '8', label: '8×8' },
] as const;

export function asMatrix(value: string): MatrixSize {
  return value === '2' ? 2 : value === '4' ? 4 : 8;
}
