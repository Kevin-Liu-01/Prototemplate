/* The magazine view's page turner. Each leaf is one rigid sheet, its page
   on the front and the next page on the back, turned about the spine by a
   single transform animation that the compositor runs; the shade that
   crosses each face as it turns is an opacity animation beside it. Nothing
   is cloned and nothing runs on the main thread while a page turns, so a
   turn starts at once and every frame is cheap. Only the leaves around the
   open spread are rendered. A click on the right turns forward and one on
   the left turns back; a click during a turn reverses it or starts the next
   leaf at once. */

import { makePage, type PageSpec } from '../../directions/_directions/sheet';

type Options = {
  pages: PageSpec[];
  /** From this window width two pages show at once. */
  breakpoint: number;
  /** One turn, in milliseconds. */
  dur: number;
  onChange?: (state: number) => void;
};

type Leaf = { el: HTMLElement; faces: [HTMLElement, HTMLElement]; shades: [HTMLElement, HTMLElement]; turns: Animation[]; fwd: boolean };

const EASE = 'cubic-bezier(0.45, 0.05, 0.2, 1)';
// each leaf sits half a pixel over the spine, so the two pages of a spread overlap there and no hairline of the hall shows
// between them
const FLAT = 'perspective(2600px) rotateY(0deg) translateX(-0.5px)';
const OVER = 'perspective(2600px) rotateY(-180deg) translateX(-0.5px)';

const mk = (cls: string) => Object.assign(document.createElement('div'), { className: cls });

export class Flip {
  readonly el: HTMLElement;
  state = 0;
  max = 0;
  private readonly o: Options;
  private readonly pages: HTMLElement[];
  private leaves: Leaf[] = [];
  private spread = false;

  constructor(el: HTMLElement, o: Options) {
    this.el = el;
    this.o = o;
    el.classList.add('fl');
    el.replaceChildren(Object.assign(document.createElement('i'), { className: 'fl-shadow', ariaHidden: 'true' }));
    this.pages = o.pages.map((p, i) => makePage(p, i));
    el.addEventListener('click', this.onClick);
    this.build();
  }

  /** Lays the leaves out for the window: two pages a leaf on a spread, one page and a blank back on a phone. */
  build() {
    const was = this.spread;
    const first = !this.leaves.length;
    this.stop();
    this.spread = innerWidth >= this.o.breakpoint;
    this.el.classList.toggle('is-spread', this.spread);
    this.leaves.forEach((leaf) => leaf.el.remove());
    const pairs: [HTMLElement, HTMLElement | null][] = [];
    if (this.spread) for (let i = 0; i < this.pages.length; i += 2) pairs.push([this.pages[i]!, this.pages[i + 1] ?? null]);
    else this.pages.forEach((p) => pairs.push([p, null]));
    this.leaves = pairs.map(([front, back]) => this.leaf(front, back));
    // on a spread the last leaf turns too, to close the magazine on its back cover; on a phone the back cover is the last page
    this.max = this.spread ? this.leaves.length : this.leaves.length - 1;
    if (!first && was !== this.spread) this.state = this.spread ? Math.ceil(this.state / 2) : Math.max(0, 2 * this.state - 1);
    this.state = Math.min(Math.max(this.state, 0), this.max);
    this.leaves.forEach((leaf, i) => {
      leaf.el.style.transform = i < this.state ? OVER : FLAT;
      leaf.fwd = i < this.state;
    });
    this.settle();
    this.o.onChange?.(this.state);
  }

  private leaf(front: HTMLElement, back: HTMLElement | null): Leaf {
    const el = mk('fl-leaf');
    const f = mk('fl-face f');
    const b = mk('fl-face b');
    const sf = mk('fl-shade');
    const sb = mk('fl-shade');
    f.append(front, sf);
    if (back) b.append(back);
    else {
      // the back of a leaf with no page of its own: blank paper, with the grain and folds of the pages
      const blank = mk('mag-page is-blank');
      blank.innerHTML = '<i class="mottle" aria-hidden="true"></i><i class="grain" aria-hidden="true"></i>';
      const paper = front.style.getPropertyValue('--paper');
      if (paper) blank.style.setProperty('--paper', paper);
      b.append(blank);
    }
    b.append(sb);
    el.append(f, b);
    this.el.append(el);
    return { el, faces: [f, b], shades: [sf, sb], turns: [], fwd: false };
  }

  /** Stacks the leaves, shows only the ones that can be seen, and moves a closed cover to the middle. */
  private settle() {
    const n = this.leaves.length;
    this.leaves.forEach((leaf, i) => {
      const moving = leaf.turns.length > 0;
      // the turning leaf over everything; then the nearest turned leaf on the left and the nearest unturned on the right
      leaf.el.style.zIndex = String(moving ? 3 * n : leaf.fwd ? n + i : 2 * n - i);
      // on a phone a turned leaf has gone off the page's left, so it is not drawn at all
      leaf.el.hidden = !moving && (i < this.state - 2 || i > this.state + 1 || (!this.spread && leaf.fwd));
      // only the faces a reader sees take focus or reach a screen reader: the right page's front, and on a spread the
      // left page's back; a leaf in a turn is neither
      leaf.faces[0].inert = moving || i !== this.state;
      leaf.faces[1].inert = moving || !this.spread || i !== this.state - 1;
    });
    this.el.dataset.open = !this.spread || this.state === 0 ? 'false' : this.state > this.max - 1 ? 'back' : 'true';
  }

  private turn(i: number, fwd: boolean) {
    const leaf = this.leaves[i];
    if (!leaf) return;
    if (leaf.turns.length) {
      // a click against a turn in flight sends the leaf back the way it came
      if (leaf.fwd !== fwd) {
        leaf.fwd = fwd;
        leaf.turns.forEach((a) => a.reverse());
      }
      return;
    }
    leaf.fwd = fwd;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      leaf.el.style.transform = fwd ? OVER : FLAT;
      return;
    }
    leaf.el.hidden = false;
    const opts: KeyframeAnimationOptions = { duration: this.o.dur, easing: EASE, fill: 'forwards' };
    const frames = fwd ? [{ transform: FLAT }, { transform: OVER }] : [{ transform: OVER }, { transform: FLAT }];
    // the front darkens as it turns away from the light and the back lightens as it lands
    const front = [{ opacity: 0 }, { opacity: 0.38, offset: 0.5 }, { opacity: 0.38 }];
    const back = [{ opacity: 0.38 }, { opacity: 0.38, offset: 0.5 }, { opacity: 0 }];
    leaf.turns = [
      leaf.el.animate(frames, opts),
      leaf.shades[0].animate(fwd ? front : [...front].reverse(), opts),
      leaf.shades[1].animate(fwd ? back : [...back].reverse(), opts),
    ];
    const main = leaf.turns[0]!;
    main.onfinish = () => {
      leaf.el.style.transform = leaf.fwd ? OVER : FLAT;
      leaf.turns.forEach((a) => a.cancel());
      leaf.turns = [];
      this.settle();
    };
    this.settle();
  }

  next() {
    if (this.state >= this.max) return;
    this.turn(this.state, true);
    this.state++;
    this.settle();
    this.o.onChange?.(this.state);
  }

  prev() {
    if (this.state <= 0) return;
    this.state--;
    this.turn(this.state, false);
    this.settle();
    this.o.onChange?.(this.state);
  }

  /** Ends every turn where it was going and lets go of the clicks. */
  stop() {
    this.leaves.forEach((leaf) => {
      leaf.turns.forEach((a) => a.finish());
    });
  }

  destroy() {
    this.stop();
    this.el.removeEventListener('click', this.onClick);
  }

  private onClick = (e: MouseEvent) => {
    if ((e.target as Element).closest('a')) return;
    const box = this.el.getBoundingClientRect();
    const back = this.spread ? e.clientX < box.left : e.clientX < box.left + box.width * 0.3;
    if (back) this.prev();
    else this.next();
  };
}
