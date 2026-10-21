/* The runtime the directions share: easing and tweens, coordinates, the
   title language, the 1607 page, the registry of studies, the switcher and
   the keys. The stage makes one core per mount. dispose() removes every
   listener the core added and leaves the current study, so leaving
   /press/directions leaves nothing running. */

import { dms } from '../../_press/coords';
import { JIHE, TITLE_LANGS, type Issue, type TitleLang } from './data';
import { PRESS_DIRECTIONS, directionHref } from './registry';

export type Ease = (t: number) => number;

export const E = {
  out3: (t: number) => 1 - Math.pow(1 - t, 3),
  io2: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  io3: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} satisfies Record<string, Ease>;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const p2 = (n: number) => String(n).padStart(2, '0');

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`press directions: nothing matches ${selector}`);
  return el;
}
export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

let reducedQuery: MediaQueryList | null = null;
let coarseQuery: MediaQueryList | null = null;
/** The reader asked for less motion. */
export function reduced(): boolean {
  reducedQuery ??= matchMedia('(prefers-reduced-motion: reduce)');
  return reducedQuery.matches;
}
/** A touch screen, where nothing hovers. */
export function coarse(): boolean {
  coarseQuery ??= matchMedia('(pointer: coarse)');
  return coarseQuery.matches;
}

type TweenOptions = { ease?: Ease; delay?: number; done?: () => void };

/** A requestAnimationFrame tween from 0 to 1. Returns its cancel. */
export function tween(duration: number, fn: (eased: number, t: number) => void, { ease = E.out3, delay = 0, done }: TweenOptions = {}): () => void {
  let raf = 0;
  let t0: number | null = null;
  let stopped = false;
  let dur = duration;
  if (reduced()) {
    dur = 1;
    delay = 0;
  }
  const step = (now: number) => {
    if (stopped) return;
    if (t0 === null) t0 = now + delay;
    if (now < t0) {
      raf = requestAnimationFrame(step);
      return;
    }
    const t = clamp((now - t0) / dur, 0, 1);
    fn(ease(t), t);
    if (t < 1) raf = requestAnimationFrame(step);
    else done?.();
  };
  raf = requestAnimationFrame(step);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}

/* ---------- coordinates ---------- */

type Parts = { d: number; m: number; s: string; h: string };

function parts(v: number, pos: string, neg: string, places = 0): Parts {
  const h = v >= 0 ? pos : neg;
  const a = Math.abs(v);
  let d = Math.floor(a);
  const mf = (a - d) * 60;
  let m = Math.floor(mf + 1e-9);
  let s = ((mf - m) * 60).toFixed(places);
  if (parseFloat(s) >= 60) {
    s = (0).toFixed(places);
    m += 1;
  }
  if (m >= 60) {
    m = 0;
    d += 1;
  }
  return { d, m, s, h };
}

export const coord = {
  /** The press's own reading, seconds to four places: 37° 46' 29.6400'' N. */
  site: (lat: number, lon: number): [string, string] => [dms(lat, 'lat'), dms(lon, 'lon')],
  /** Primes and whole seconds: 39°54′15″ N. */
  prime(lat: number, lon: number): [string, string] {
    const a = parts(lat, 'N', 'S');
    const b = parts(lon, 'E', 'W');
    return [`${a.d}°${p2(a.m)}′${p2(Number(a.s))}″ ${a.h}`, `${b.d}°${p2(b.m)}′${p2(Number(b.s))}″ ${b.h}`];
  },
  /** The value and its hemisphere apart, for type set large. */
  split(lat: number, lon: number): [[string, string], [string, string]] {
    const a = parts(lat, 'N', 'S');
    const b = parts(lon, 'E', 'W');
    return [
      [`${a.d}°${p2(a.m)}′${p2(Number(a.s))}″`, a.h],
      [`${b.d}°${p2(b.m)}′${p2(Number(b.s))}″`, b.h],
    ];
  },
};

/* ---------- the 1607 page ---------- */

/** Book I's first page, typeset after the Beijing edition, each character in its own span for the inking. */
export function jihe(caption = ''): string {
  let k = 0;
  const cols = JIHE.map((p) => `<p class="${p.cls}">${[...p.text].map((ch) => `<i style="--k:${k++}">${ch}</i>`).join('')}</p>`).join('');
  return (
    `<div class="jp" lang="zh-Hant"><div class="jp-frame" aria-hidden="true"><div class="jp-text">${cols}</div></div>` +
    `<p class="sr-only">Book I, first page: title, translators Matteo Ricci and Xu Guangqi, and Definition 1, a point has no part.</p>` +
    (caption ? `<p class="jp-cap" lang="en">${caption}</p>` : '') +
    `</div>`
  );
}

/** One span per word, each word rising on its own (--i is its order). */
export function splitWords(el: HTMLElement): HTMLElement {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(' ');
  return el;
}

/** Sets an element's language, direction and script for a title. */
export function applyLang(el: HTMLElement, l: TitleLang) {
  el.lang = l.code;
  el.dir = l.dir;
  el.dataset.script = l.script;
}

/* ---------- page turns ---------- */

type FlipOptions = {
  pages: (() => string)[];
  perspective?: number;
  dur?: number;
  onChange?: (state: number) => void;
};

/** Single pages that turn over on a hinge at the left edge. */
export class Flip {
  readonly el: HTMLElement;
  private readonly o: Required<Omit<FlipOptions, 'onChange'>> & Pick<FlipOptions, 'onChange'>;
  state = 0;
  private busy = false;
  private leaves: HTMLElement[] = [];
  private cast: HTMLElement;
  private readonly max: number;

  constructor(el: HTMLElement, o: FlipOptions) {
    this.el = el;
    this.o = { perspective: 2600, dur: 1150, ...o };
    el.innerHTML = '';
    this.leaves = this.o.pages.map((page, i) => {
      const leaf = document.createElement('div');
      leaf.className = 'flip-leaf';
      leaf.innerHTML =
        `<div class="flip-face flip-front" data-page="${i}">${page()}<i class="flip-sh"></i></div>` +
        `<div class="flip-face flip-back" data-page="-1"><i class="flip-sh"></i></div>`;
      el.appendChild(leaf);
      return leaf;
    });
    this.cast = Object.assign(document.createElement('i'), { className: 'flip-cast r' });
    el.append(this.cast);
    this.max = this.o.pages.length - 1;
    this.set(0);
  }

  private z(i: number, turned: boolean) {
    return turned ? 10 + i : 10 + this.leaves.length * 2 - i;
  }

  set(s: number) {
    this.state = s;
    this.leaves.forEach((leaf, i) => {
      const turned = i < s;
      leaf.style.transform = `perspective(${this.o.perspective}px) rotateY(${turned ? -180 : 0}deg)`;
      leaf.style.zIndex = String(this.z(i, turned));
      leaf.classList.toggle('is-turned', turned);
      leaf.querySelectorAll<HTMLElement>('.flip-sh').forEach((sh) => (sh.style.opacity = '0'));
    });
    this.cast.style.opacity = '0';
    this.o.onChange?.(s);
  }

  go(target: number): boolean {
    target = clamp(target, 0, this.max);
    if (this.busy || target === this.state) return false;
    const fwd = target > this.state;
    const leaf = this.leaves[fwd ? this.state : this.state - 1]!;
    const [shF, shB] = $$('.flip-sh', leaf) as [HTMLElement, HTMLElement];
    const from = fwd ? 0 : -180;
    const to = fwd ? -180 : 0;
    this.busy = true;
    leaf.style.zIndex = '1000';
    this.cast.style.zIndex = '999';
    tween(
      this.o.dur,
      (e) => {
        const a = lerp(from, to, e);
        const k = Math.sin((-a * Math.PI) / 180);
        leaf.style.transform = `perspective(${this.o.perspective}px) rotateY(${a}deg)`;
        shF.style.opacity = String(a > -90 ? k * 0.95 : 0);
        shB.style.opacity = String(a <= -90 ? k * 0.95 : 0);
        this.cast.style.opacity = String(a > -90 ? Math.pow(k, 0.7) * (1 - (-a / 90) * 0.35) : 0);
      },
      {
        ease: E.io3,
        done: () => {
          this.busy = false;
          this.set(this.state + (fwd ? 1 : -1));
          if (this.state !== target) this.go(target);
        },
      }
    );
    return true;
  }

  next() {
    return this.go(this.state + 1);
  }

  prev() {
    return this.go(this.state - 1);
  }
}

/* ---------- the core ---------- */

/** What a study gives the registry. */
export type Study = {
  enter?: () => void;
  leave?: () => void;
  pause?: () => void;
  resume?: () => void;
  key?: (e: KeyboardEvent) => void;
  resize?: () => void;
};

type Registered = Study & { el: HTMLElement; slug: string };

export type CoreOptions = {
  issue: Issue;
  /** Puts the slug's route in the address bar; the stage then shows it. */
  navigate: (slug: string) => void;
};

export function createCore(host: HTMLElement, { issue, navigate }: CoreOptions) {
  const disposers: (() => void)[] = [];
  /** addEventListener, taken back by dispose(). */
  function on<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions): void;
  function on<K extends keyof DocumentEventMap>(target: Document, type: K, fn: (e: DocumentEventMap[K]) => void, opts?: AddEventListenerOptions): void;
  function on(target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) {
    target.addEventListener(type, fn, opts);
    disposers.push(() => target.removeEventListener(type, fn, opts));
  }

  /* language */
  let lang = TITLE_LANGS[0]!.code;
  const langFns = new Set<(l: TitleLang) => void>();
  const L = (): TitleLang => TITLE_LANGS.find((l) => l.code === lang) ?? TITLE_LANGS[0]!;
  function setLang(code: string) {
    const next = TITLE_LANGS.find((l) => l.code === code);
    if (!next || next.code === lang) return;
    lang = next.code;
    langFns.forEach((f) => f(next));
  }
  const onLang = (f: (l: TitleLang) => void) => {
    langFns.add(f);
  };
  /** The row of language buttons that sets the title's language. */
  function langButtons(box: HTMLElement, text: (l: TitleLang) => string = (l) => l.short) {
    box.setAttribute('role', 'radiogroup');
    box.innerHTML = TITLE_LANGS.map(
      (l) =>
        `<button type="button" role="radio" data-lang="${l.code}" lang="${l.code}" aria-checked="${l.code === lang}" aria-label="${l.label}" title="${l.label} · ${l.city}">${text(l)}</button>`
    ).join('');
    box.addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-lang]');
      if (b?.dataset.lang) setLang(b.dataset.lang);
    });
    onLang(() => $$('[data-lang]', box).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.lang === lang))));
  }

  /* studies */
  const V = new Map<string, Registered>();
  let current: string | null = null;
  const order = () => PRESS_DIRECTIONS.map((d) => d.slug).filter((slug) => V.has(slug));

  /** Adds a study's section to the stage. */
  function section(slug: string, cls: string, label: string, html = ''): HTMLElement {
    const el = document.createElement('section');
    el.className = `v ${cls}`;
    el.id = slug;
    el.setAttribute('aria-label', label);
    el.hidden = true;
    el.innerHTML = html;
    host.appendChild(el);
    return el;
  }

  function register(slug: string, el: HTMLElement, study: Study) {
    V.set(slug, { ...study, el, slug });
  }

  function show(slug: string) {
    const id = V.has(slug) ? slug : order()[0];
    if (!id || current === id) return;
    const prev = current ? V.get(current) : undefined;
    if (prev) {
      try {
        prev.leave?.();
      } catch (err) {
        console.error(err);
      }
      prev.el.classList.remove('is-in');
      prev.el.hidden = true;
    }
    current = id;
    const v = V.get(id)!;
    v.el.hidden = false;
    host.style.backgroundColor = getComputedStyle(v.el).backgroundColor;
    void v.el.offsetWidth;
    requestAnimationFrame(() => {
      if (current !== id) return;
      v.el.classList.add('is-in');
      try {
        v.enter?.();
      } catch (err) {
        console.error(err);
      }
    });
    sw.sync();
  }

  /** Shows a study at once and moves the address bar to its page. */
  function go(slug: string) {
    if (slug === current) return;
    show(slug);
    navigate(slug);
  }
  const step = (d: number) => {
    const ids = order();
    const at = current ? ids.indexOf(current) : 0;
    go(ids[(at + d + ids.length) % ids.length]!);
  };

  /* the switcher at the foot of the page */
  const sw = {
    el: document.createElement('nav'),
    menu: document.createElement('div'),
    timer: 0,
    hover: false,
    init() {
      const el = this.el;
      el.className = 'sw';
      el.setAttribute('aria-label', 'Press directions');
      el.innerHTML = `
        <button type="button" class="sw-prev" aria-label="Previous direction">←</button>
        <button type="button" class="sw-label" aria-haspopup="true" aria-expanded="false"><span class="sw-n"></span><span class="sw-name"></span></button>
        <button type="button" class="sw-next" aria-label="Next direction">→</button>
        <span class="sw-hint"></span>`;
      this.menu.className = 'sw-menu';
      this.menu.hidden = true;
      el.appendChild(this.menu);
      host.appendChild(el);
      this.menu.innerHTML = order()
        .map((id, i) => {
          const d = PRESS_DIRECTIONS.find((x) => x.slug === id)!;
          return `<a href="${directionHref(id)}" data-go="${id}"><span class="sw-n">${p2(i + 1)}</span><span>${d.name}</span><span class="sw-src">${d.source}</span></a>`;
        })
        .join('');
      $('.sw-prev', el).addEventListener('click', () => step(-1));
      $('.sw-next', el).addEventListener('click', () => step(1));
      $('.sw-label', el).addEventListener('click', () => this.toggleMenu());
      this.menu.addEventListener('click', (e) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>('[data-go]');
        if (!a?.dataset.go || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(a.dataset.go);
        this.toggleMenu(false);
      });
      const wake = () => this.wake();
      for (const t of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const) on(window, t, wake, { passive: true });
      el.addEventListener('pointerenter', () => (this.hover = true));
      el.addEventListener('pointerleave', () => {
        this.hover = false;
        this.wake();
      });
      on(document, 'click', (e) => {
        if (!el.contains(e.target as Node)) this.toggleMenu(false);
      });
      this.wake();
    },
    toggleMenu(force?: boolean) {
      const open = force ?? this.menu.hidden;
      this.menu.hidden = !open;
      $('.sw-label', this.el).setAttribute('aria-expanded', String(open));
      this.wake();
    },
    wake() {
      this.el.classList.remove('is-idle');
      clearTimeout(this.timer);
      if (coarse()) return;
      this.timer = window.setTimeout(() => {
        if (this.hover || !this.menu.hidden || this.el.contains(document.activeElement)) return this.wake();
        this.el.classList.add('is-idle');
      }, 2800);
    },
    sync() {
      if (!current) return;
      const ids = order();
      const d = PRESS_DIRECTIONS.find((x) => x.slug === current)!;
      $('.sw-n', this.el).textContent = `${p2(ids.indexOf(current) + 1)} / ${p2(ids.length)}`;
      $('.sw-name', this.el).textContent = d.name;
      $('.sw-hint', this.el).textContent = d.hint;
      $$('[data-go]', this.menu).forEach((a) => {
        if (a.dataset.go === current) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    },
  };

  /** Builds the switcher, binds the keys and shows the first study. */
  function start(slug: string) {
    sw.init();
    on(window, 'keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ids = order();
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= ids.length) {
        go(ids[n - 1]!);
        return;
      }
      if (e.key === '[') return step(-1);
      if (e.key === ']') return step(1);
      if (e.key === 'Escape') sw.toggleMenu(false);
      const v = current ? V.get(current) : undefined;
      v?.key?.(e);
    });
    let rt = 0;
    on(window, 'resize', () => {
      cancelAnimationFrame(rt);
      rt = requestAnimationFrame(() => {
        const v = current ? V.get(current) : undefined;
        v?.resize?.();
      });
    });
    on(document, 'visibilitychange', () => {
      const v = current ? V.get(current) : undefined;
      if (!v) return;
      if (document.hidden) v.pause?.();
      else v.resume?.();
    });
    show(slug);
  }

  function dispose() {
    const v = current ? V.get(current) : undefined;
    current = null;
    try {
      v?.leave?.();
    } catch (err) {
      console.error(err);
    }
    clearTimeout(sw.timer);
    for (const off of disposers.splice(0)) off();
    langFns.clear();
    host.replaceChildren();
    host.style.backgroundColor = '';
  }

  return {
    issue,
    host,
    on,
    section,
    register,
    show,
    start,
    dispose,
    get lang() {
      return lang;
    },
    get current() {
      return current;
    },
    L,
    setLang,
    onLang,
    langButtons,
  };
}

export type Core = ReturnType<typeof createCore>;
