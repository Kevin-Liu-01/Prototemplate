/* Thin paper pages that bend in 3D while they turn. Each turning leaf is
   cut into vertical strips laid end to end along a curve, and every strip
   is lit by its own angle, which is what makes the bend read as paper.
   Riffled, the leaves leave one after another, as pages do under a thumb
   run down the edge. */

import { $, E, clamp, lerp, tween, type Ease } from './core';

export type PageSpec = {
  html: () => string;
  /** Classes on the page, which set its paper (--paper). */
  cls?: string;
  /** A paper of the page's own, where no class names it. */
  paper?: string;
  finish?: 'matte' | 'satin' | 'black';
  /** The folds and dust of the scanned sheet. */
  mottle?: boolean;
};

/** Runs work when the browser is idle, or soon where it has no idle callback. */
const onIdle = (fn: () => void): number =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 600 }) : window.setTimeout(fn, 60);
const cancelIdle = (id: number) => (typeof cancelIdleCallback === 'function' ? cancelIdleCallback(id) : window.clearTimeout(id));

/**
 * Puts a leaf to rest or wakes it. A leaf at rest is invisible and skipped
 * by the renderer (content-visibility), but keeps its layout, so it costs
 * nothing while another leaf moves and shows at once when its turn comes.
 */
const rest = (leaf: HTMLElement, on: boolean) => {
  leaf.style.visibility = on ? 'hidden' : '';
  leaf.style.setProperty('content-visibility', on ? 'hidden' : '');
};

const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string) => Object.assign(document.createElement(tag), { className: cls });
const smooth = (t: number) => t * t * (3 - 2 * t);

export function makePage(p: PageSpec, i: number): HTMLElement {
  const d = mk('div', ['mag-page', i === 0 ? 'is-cover' : '', p.cls ?? ''].filter(Boolean).join(' '));
  d.dataset.page = String(i);
  // which way the scanned sheet lies on this page (Atlas's magazine-view.css), so its folds change from page to page
  d.dataset.turn = String(i % 8);
  if (p.paper) d.style.setProperty('--paper', p.paper);
  if (p.finish) d.dataset.finish = p.finish;
  d.innerHTML = p.html();
  if (p.mottle && p.finish !== 'black') d.insertAdjacentHTML('beforeend', '<i class="mottle" aria-hidden="true"></i>');
  return d;
}

/* one light from the upper left, and its highlight */
const LX = -0.42;
const LZ = 0.91;
const HX = -0.215;
const HZ = 0.977;

/** The shade and the highlight of a strip turned to angle a. */
function lit(a: number, front: boolean): [number, number] {
  const nx = front ? -Math.sin(a) : Math.sin(a);
  const nz = front ? Math.cos(a) : -Math.cos(a);
  const lam = Math.max(0, nx * LX + nz * LZ);
  const spec = Math.pow(Math.max(0, nx * HX + nz * HZ), 70);
  return [clamp((0.91 - lam) * 0.8, 0, 0.64), spec * 0.3];
}

function litGrad(a0: number, a1: number, front: boolean): string {
  const [d0, s0] = lit(a0, front);
  const [d1, s1] = lit(a1, front);
  const [dl, sl, dr, sr] = front ? [d0, s0, d1, s1] : [d1, s1, d0, s0];
  return `linear-gradient(90deg, rgba(0,0,0,${dl.toFixed(3)}), rgba(0,0,0,${dr.toFixed(3)})), linear-gradient(90deg, rgba(255,255,255,${sl.toFixed(3)}), rgba(255,255,255,${sr.toFixed(3)}))`;
}

type SheetOptions = {
  pages: PageSpec[];
  /** Narrower than this, one page shows at a time. */
  breakpoint?: number;
  /** A full turn, in milliseconds. */
  dur?: number;
  /** Strips per leaf. */
  strips?: number;
  /** What a click does: riffle every page to the end (or back to the cover), or turn one page. */
  click?: 'riffle' | 'turn';
  onChange?: (state: number) => void;
  onInteract?: () => void;
};

type Strip = { st: HTMLElement; lf: HTMLElement; lb: HTMLElement };
type Pose = { minX: number; maxX: number; maxZ: number; t: number };

export class Sheet {
  readonly el: HTMLElement;
  private readonly o: Required<Omit<SheetOptions, 'onChange' | 'onInteract'>> & Pick<SheetOptions, 'onChange' | 'onInteract'>;
  state = 0;
  max = 0;
  busy = false;
  peeking: false | 'l' | 'r' = false;
  drag: { x: number; y: number; moved: boolean; fwd: boolean; i: number; id: number } | null = null;
  private hinting = false;
  private ready = false;
  /** How far each leaf has turned, 0 to 1. */
  private t: number[] = [];
  private tw = new Map<number, () => void>();
  private leafEls: (HTMLElement | null)[] = [];
  private strips = new Map<HTMLElement, Strip[]>();
  private leaves: [HTMLElement, HTMLElement | null][] = [];
  private readonly pages: HTMLElement[];
  private readonly blank: HTMLElement;
  private readonly SH: HTMLElement;
  private readonly U: HTMLElement;
  private readonly LU: HTMLElement;
  private W = 0;
  private spread: boolean | undefined;
  private raf = 0;
  private pb = 0;
  private ht = 0;

  constructor(el: HTMLElement, o: SheetOptions) {
    this.el = el;
    this.o = { breakpoint: 760, dur: 1250, strips: 36, click: 'riffle', ...o };
    el.classList.add('sh');
    el.innerHTML =
      '<i class="sh-shadow" aria-hidden="true"></i><i class="sh-under" aria-hidden="true"></i><i class="sh-lunder" aria-hidden="true"></i>';
    this.SH = $('.sh-shadow', el);
    this.U = $('.sh-under', el);
    this.LU = $('.sh-lunder', el);
    const wrap = (page: HTMLElement) => {
      const w = mk('div', 'mag-pw');
      w.appendChild(page);
      el.appendChild(w);
      return page;
    };
    this.pages = this.o.pages.map((p, i) => wrap(makePage(p, i)));
    // the back of a leaf with no page of its own: blank paper, with the same grain and scan as the pages
    this.blank = wrap(mk('div', 'mag-page is-blank'));
    this.blank.innerHTML = '<i class="mottle" aria-hidden="true"></i><i class="grain" aria-hidden="true"></i>';
    this.bind();
    this.build();
  }

  /** Lays the magazine out again for the window: a spread when it is wide enough. */
  build() {
    const was = this.spread;
    this.stop();
    this.W = this.el.offsetWidth;
    this.spread = innerWidth >= this.o.breakpoint;
    this.el.classList.toggle('is-spread', this.spread);
    this.leafEls.forEach((l) => l?.remove());
    this.strips.clear();
    this.leaves = [];
    if (this.spread) for (let i = 0; i < this.pages.length; i += 2) this.leaves.push([this.pages[i]!, this.pages[i + 1] ?? null]);
    else this.pages.forEach((p) => this.leaves.push([p, null]));
    this.leafEls = this.leaves.map(() => null);
    this.max = this.spread ? Math.ceil((this.pages.length - 1) / 2) : this.pages.length - 1;
    let s = this.state;
    if (was !== undefined && was !== this.spread) s = this.spread ? Math.ceil(s / 2) : Math.max(0, 2 * s - 1);
    s = clamp(s, 0, this.max);
    this.t = this.leaves.map((_, i) => (i < s ? 1 : 0));
    this.render();
    this.emit(true);
    this.warm();
  }

  /**
   * Builds the leaves the next turns need (this one, the two after it and the
   * one before it) while the browser is idle, one leaf a slot, and lays each
   * out there and then, so a turn never stops to cut its strips or to lay
   * out their copies of the page. Nothing is built while a leaf is moving.
   */
  private warm() {
    cancelIdle(this.pb);
    const want = [this.state, this.state + 1, this.state - 1, this.state + 2].find((i) => i >= 0 && i < this.leaves.length && !this.leafEls[i]);
    if (want === undefined) return;
    this.pb = onIdle(() => {
      if (this.busy || this.drag) return this.warm();
      if (this.leaves[want] && this.W) {
        const leaf = this.leafEl(want);
        void leaf.offsetHeight;
        rest(leaf, true);
      }
      this.warm();
    });
  }

  stop() {
    this.tw.forEach((cancel) => cancel());
    this.tw.clear();
    cancelIdle(this.pb);
    clearTimeout(this.ht);
    this.busy = this.hinting = false;
    this.peeking = false;
    this.drag = null;
  }

  reset() {
    this.stop();
    this.t = this.t.map(() => 0);
    this.render();
    this.emit(true);
  }

  private emit(silent = false) {
    let st = this.t.findIndex((v) => v < 1);
    if (st < 0) st = this.t.length;
    const changed = st !== this.state || !this.ready;
    this.state = st;
    this.ready = true;
    if (changed) this.warm();
    if (this.o.onChange && (!silent || changed)) this.o.onChange(st);
  }

  /** The turning leaf, built on first use: N strips, each holding a slice of both faces. */
  private leafEl(i: number): HTMLElement {
    const built = this.leafEls[i];
    if (built) return built;
    const N = this.o.strips;
    const W = this.W;
    const w = W / N;
    // each strip runs a pixel into the next, so no seam of the page under it shows between them
    const ov = 1;
    const [front, back0] = this.leaves[i]!;
    let back = back0;
    if (!back) {
      back = this.blank;
      const paper = getComputedStyle(front).getPropertyValue('--paper').trim();
      if (paper) back.style.setProperty('--paper', paper);
      else back.style.removeProperty('--paper');
    }
    // invisible until it turns, but laid out, so the turn does not wait for it (warm, rest)
    const leaf = mk('div', 'sh-leaf');
    leaf.style.visibility = 'hidden';
    const strips: Strip[] = [];
    for (let k = 0; k < N; k++) {
      const st = mk('div', 'sh-strip');
      st.style.width = `${(w + ov).toFixed(2)}px`;
      const ff = mk('div', 'sh-face f');
      const bf = mk('div', 'sh-face b');
      const fc = front.cloneNode(true) as HTMLElement;
      const bc = back.cloneNode(true) as HTMLElement;
      fc.classList.add('clone');
      bc.classList.add('clone');
      fc.style.left = `${(-k * w).toFixed(2)}px`;
      fc.style.width = `${W}px`;
      bc.style.left = `${(-(W - (k + 1) * w - ov)).toFixed(2)}px`;
      bc.style.width = `${W}px`;
      const lf = mk('i', 'sh-lit');
      const lb = mk('i', 'sh-lit');
      ff.append(fc, lf);
      bf.append(bc, lb);
      st.append(ff, bf);
      leaf.appendChild(st);
      strips.push({ st, lf, lb });
    }
    this.strips.set(leaf, strips);
    this.el.appendChild(leaf);
    this.leafEls[i] = leaf;
    return leaf;
  }

  /** The bend at turn t: the angle at each distance s from the spine. Both ends lead, the middle lags. */
  private phi(t: number) {
    const W = this.W;
    const a0 = Math.PI * t * t;
    const a1 = Math.PI * (1 - (1 - t) * (1 - t));
    return (s: number) => a0 + (a1 - a0) * Math.pow(s / W, 1.25);
  }

  /** Where the leaf's free edge is at turn t. */
  private handle(t: number) {
    const phi = this.phi(t);
    const N = 24;
    const w = this.W / N;
    let x = 0;
    for (let k = 0; k < N; k++) x += w * Math.cos(phi((k + 0.5) * w));
    return x;
  }

  /** The turn that puts the free edge at x. */
  private tFromX(x: number) {
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 18; k++) {
      const m = (lo + hi) / 2;
      if (this.handle(m) > x) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }

  private pose(i: number): Pose {
    const leaf = this.leafEl(i);
    const S = this.strips.get(leaf)!;
    const N = S.length;
    const w = this.W / N;
    const t = this.t[i]!;
    const phi = this.phi(t);
    const zoff = 0.8 + lerp(this.leaves.length - i, i, t) * 0.5;
    let x = 0;
    let z = 0;
    let minX = 0;
    let maxX = 0;
    let maxZ = 0;
    let a0 = phi(0);
    for (let k = 0; k < N; k++) {
      const a1 = phi((k + 1) * w);
      const a = phi((k + 0.5) * w);
      const s = S[k]!;
      s.st.style.transform = `translate3d(${x.toFixed(2)}px,0,${(z + zoff).toFixed(2)}px) rotateY(${(-a * 57.29578).toFixed(3)}deg)`;
      s.lf.style.background = litGrad(a0, a1, true);
      s.lb.style.background = litGrad(a0, a1, false);
      x += w * Math.cos(a);
      z += w * Math.sin(a);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z > maxZ) maxZ = z;
      a0 = a1;
    }
    return { minX, maxX, maxZ, t };
  }

  private schedule() {
    if (!this.raf) this.raf = requestAnimationFrame(() => this.render());
  }

  private render() {
    this.raf = 0;
    const W = this.W;
    const n = this.t.length;
    let li = -1;
    let ri = -1;
    for (let i = 0; i < n; i++) if (this.t[i]! >= 1) li = i;
    for (let i = 0; i < n; i++)
      if (this.t[i]! <= 0) {
        ri = i;
        break;
      }
    const lp = this.spread && li >= 0 ? this.leaves[li]![1] : null;
    const rp = ri >= 0 ? this.leaves[ri]![0] : null;
    const roles = new Map<HTMLElement, string>();
    if (lp) roles.set(lp, 'L');
    if (rp) roles.set(rp, 'R');
    [...this.pages, this.blank].forEach((p) => {
      const r = roles.get(p) ?? '';
      const w = p.parentElement!;
      if (w.dataset.role !== r) w.dataset.role = r;
    });
    let top: Pose | null = null;
    let first: Pose | null = null;
    let minX = 0;
    let moving = false;
    this.t.forEach((t, i) => {
      const l = this.leafEls[i];
      if (t > 0 && t < 1) {
        const el = this.leafEl(i);
        if (el.style.visibility) rest(el, false);
        const r = this.pose(i);
        moving = true;
        first ??= r;
        top = r;
        if (r.minX < minX) minX = r.minX;
      } else if (l && !l.style.visibility) rest(l, true);
    });
    // the shading on the page underneath, and on the page the sheet lands on
    const over = top as Pose | null;
    if (over && rp) {
      const k = clamp(0.3 + over.maxZ / (W * 0.35), 0, 1);
      const fp = Math.max(0, over.maxX);
      this.U.style.opacity = '1';
      this.U.style.background = `linear-gradient(90deg, rgba(0,0,0,${(0.42 * k).toFixed(3)}) 0, rgba(0,0,0,${(0.3 * k).toFixed(3)}) ${fp.toFixed(1)}px, rgba(0,0,0,0) ${(fp + W * 0.2 + over.maxZ * 0.3).toFixed(1)}px)`;
    } else this.U.style.opacity = '0';
    const lead = first as Pose | null;
    if (lead && lp && lead.minX < 0) {
      const k = Math.sin(Math.PI * lead.t);
      const d = -lead.minX;
      this.LU.style.opacity = '1';
      this.LU.style.background = `linear-gradient(270deg, rgba(0,0,0,${(0.4 * k).toFixed(3)}) 0, rgba(0,0,0,${(0.22 * k).toFixed(3)}) ${d.toFixed(1)}px, rgba(0,0,0,0) ${(d + W * 0.18).toFixed(1)}px)`;
    } else this.LU.style.opacity = '0';
    const shift = this.spread ? 0.5 * smooth(clamp(this.t[0] ?? 0, 0, 1)) : 0;
    this.el.style.setProperty('--shift', shift.toFixed(4));
    const l = Math.min(lp ? -W : 0, minX);
    const r = rp || moving ? W : 0;
    this.SH.style.left = `${l.toFixed(1)}px`;
    this.SH.style.width = `${Math.max(0, r - l).toFixed(1)}px`;
  }

  private animT(i: number, to: number, dur: number, ease: Ease, done?: () => void) {
    this.tw.get(i)?.();
    this.tw.delete(i);
    const from = this.t[i]!;
    if (Math.abs(to - from) < 1e-4) {
      this.t[i] = to;
      this.schedule();
      done?.();
      return;
    }
    this.tw.set(
      i,
      tween(
        dur,
        (e) => {
          this.t[i] = lerp(from, to, e);
          this.schedule();
        },
        {
          ease,
          done: () => {
            this.tw.delete(i);
            this.t[i] = to;
            this.schedule();
            done?.();
          },
        }
      )
    );
  }

  /** Settles every leaf in motion except one. */
  private calm(except: number) {
    this.t.forEach((t, i) => {
      if (i !== except && t > 0 && t < 1) this.animT(i, i < this.state ? 1 : 0, 300, E.out3);
    });
  }

  turn(fwd: boolean, then?: () => void): boolean {
    if (this.hinting) this.unhint();
    if (this.busy) return false;
    if (fwd ? this.state >= this.max : this.state <= 0) return false;
    const i = fwd ? this.state : this.state - 1;
    this.busy = true;
    this.peeking = false;
    this.calm(i);
    const left = fwd ? 1 - this.t[i]! : this.t[i]!;
    this.animT(i, fwd ? 1 : 0, Math.max(320, this.o.dur * left), E.io3, () => {
      this.busy = false;
      this.emit();
      then?.();
    });
    return true;
  }

  go(target: number) {
    if (this.hinting) this.unhint();
    const t = clamp(target, 0, this.max);
    if (t === this.state || this.busy) return;
    if (Math.abs(t - this.state) > 1) return this.riffle(t);
    this.turn(t > this.state, () => this.go(t));
  }

  next() {
    this.go(this.state + 1);
  }

  prev() {
    this.go(this.state - 1);
  }

  /** Turns every leaf between here and the target, each a beat after the last. */
  riffle(target: number) {
    if (this.busy) return;
    const to = clamp(target, 0, this.max);
    if (to === this.state) return;
    const fwd = to > this.state;
    const idx: number[] = [];
    if (fwd) for (let i = this.state; i < to; i++) idx.push(i);
    else for (let i = this.state - 1; i >= to; i--) idx.push(i);
    this.busy = true;
    this.peeking = false;
    let left = idx.length;
    idx.forEach((i, n) => {
      const run = () =>
        this.animT(i, fwd ? 1 : 0, 760, E.io2, () => {
          if (--left === 0) {
            this.busy = false;
            this.emit();
          }
        });
      if (n) window.setTimeout(run, n * 120);
      else run();
    });
  }

  /** Lifts the next three leaves a little, as a thumb fans the edge. */
  private fan(on: boolean) {
    const ts = [0.12, 0.075, 0.04];
    for (let k = 0; k < 3; k++) {
      const i = this.state + k;
      if (i >= this.max) break;
      this.animT(i, on ? ts[k]! : 0, on ? 420 + k * 70 : 380, E.out3);
    }
  }

  hint() {
    if (this.busy || this.drag || this.state >= this.max) return;
    this.hinting = true;
    this.fan(true);
    this.ht = window.setTimeout(() => {
      this.fan(false);
      this.hinting = false;
    }, 1200);
  }

  private unhint() {
    clearTimeout(this.ht);
    this.hinting = false;
  }

  /** The pointer's distance from the spine, in the page's own pixels. */
  private localX(e: PointerEvent): number {
    const r = this.el.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * this.W;
  }

  private hover(x: number) {
    const W = this.W;
    const nearR = x > W * 0.82 && x <= W + 4;
    const nearL = this.spread && x < -W * 0.82 && x >= -W - 4;
    if (nearR && this.state < this.max) {
      if (this.peeking !== 'r') {
        this.peeking = 'r';
        this.fan(true);
      }
    } else if (nearL && this.state > 0) {
      if (this.peeking !== 'l') {
        this.peeking = 'l';
        this.animT(this.state - 1, 0.94, 420, E.out3);
      }
    } else if (this.peeking) this.unpeek();
  }

  private unpeek() {
    const side = this.peeking;
    this.peeking = false;
    if (side === 'r') this.fan(false);
    else if (side === 'l') this.animT(this.state - 1, 1, 340, E.out3);
  }

  private bind() {
    const el = this.el;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || (e.target as Element).closest('a, button')) return;
      if (this.hinting) this.unhint();
      if (this.busy) return;
      const x = this.localX(e);
      // on a phone there is no left page, so the left edge of the page turns back
      const fwd = x >= 0 && !(!this.spread && x < this.W * 0.25 && this.state > 0);
      if (fwd ? this.state >= this.max : this.state <= 0) return;
      const i = fwd ? this.state : this.state - 1;
      this.peeking = false;
      this.drag = { x: e.clientX, y: e.clientY, moved: false, fwd, i, id: e.pointerId };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* a pointer that already ended */
      }
      this.o.onInteract?.();
    });
    el.addEventListener('pointermove', (e) => {
      const d = this.drag;
      if (d) {
        if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) {
          d.moved = true;
          this.calm(d.i);
          this.tw.get(d.i)?.();
          this.tw.delete(d.i);
        }
        if (d.moved) {
          this.t[d.i] = this.tFromX(this.localX(e));
          this.schedule();
        }
        return;
      }
      if (e.pointerType === 'mouse' && !this.busy) this.hover(this.localX(e));
    });
    const up = () => {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      try {
        el.releasePointerCapture(d.id);
      } catch {
        /* released already */
      }
      if (!d.moved) {
        this.calm(-1);
        if (this.o.click === 'turn') this.turn(d.fwd);
        else this.riffle(d.fwd ? this.max : 0);
        return;
      }
      const t = this.t[d.i]!;
      const done = d.fwd ? t > 0.4 : t < 0.6;
      this.busy = true;
      this.animT(d.i, done ? (d.fwd ? 1 : 0) : d.fwd ? 0 : 1, 560, E.out3, () => {
        this.busy = false;
        this.emit();
      });
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', () => {
      if (!this.drag && this.peeking && !this.busy) this.unpeek();
    });
  }
}
