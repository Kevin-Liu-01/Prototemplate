'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import SignalPathDiagram from '@/components/shared/diagrams/SignalPathDiagram';
import StoryCodePanel, { type StorySliderMode } from '@/components/shared/story/StoryCodePanel';
import StoryCodeScene from '@/components/shared/story/StoryCodeScene';
import StoryDemoSite from '@/components/shared/story/StoryDemoSite';

import './StorySection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

export type StoryBeat = { title: string; body: string };

export type StorySectionProps = {
  className?: string;
  id?: string;
  /** The section heading. Nothing is rendered above it. */
  heading?: ReactNode;
  /** One supporting line under the heading. */
  subheading?: ReactNode;
  /**
   * How the code reveal is staged around a zoomed component.
   * `slide` wipes a full-bleed code surface across the frame (the default);
   * `popup` floats an overlay panel beside the component.
   */
  sliderMode?: StorySliderMode;
  /** Dock captions, one per beat. Eleven entries drive the built-in timeline. */
  captions?: string[];
  /** Static storyboard rendered instead of the stage under reduced motion. */
  beats?: StoryBeat[];
  /** A page nav to fade out while the story is pinned, e.g. `[data-ba-nav]`. */
  navSelector?: string;
  /** Scrub distance of the pin, in px. */
  scrollLength?: { desktop: number; mobile: number };
  /** Draw the prismatic field behind the code act. */
  field?: boolean;
  /** Domain shown on the window chip. */
  siteName?: string;
  logoSrc?: string;
};

const DEFAULT_CAPTIONS = [
  'gt helps you…',
  'GT knows your context.',
  'GT does your translating.',
  'Around any component.',
  'With your own context.',
  'With your review.',
  'This is where Locadex comes in.',
  'Code is pushed. Locadex scans.',
  'Locadex maps what changed.',
  'It edits code — and translates in context.',
  '…and opens the PR. Review, merge, live.',
];

const DEFAULT_BEATS: StoryBeat[] = [
  {
    title: 'GT knows your context.',
    body: 'Every translatable text node carries a <T> marker. Context pellets stream from each one into the GT core.',
  },
  {
    title: 'GT does your translating.',
    body: 'The Locadex cursor hops node to node, translating in place. Every container re-measures as the text changes length.',
  },
  {
    title: 'Around any component.',
    body: 'The code behind the button is JSX wrapped in <T>…</T>. The label renders translated and the button widens.',
  },
  {
    title: 'With your own context.',
    body: '<T context="Playful, upbeat marketing tone"> — GT reads your context and the translation lands with the right tone.',
  },
  {
    title: 'With your review.',
    body: 'A node tagged “requires review” fires a webhook to legal counsel: “Review this translation!” — approve, and it ships.',
  },
  {
    title: 'This is where Locadex comes in.',
    body: 'The translated text flickers back to source and the website flips into a code editor.',
  },
  {
    title: 'Code is pushed.',
    body: 'A commit triggers the workflow; a pull request appears and Locadex scans the file line by line.',
  },
  {
    title: 'Locadex maps what changed.',
    body: 'Lint marks land on the exact lines that need i18n work — hover them to read the notes.',
  },
  {
    title: 'It edits code.',
    body: 'The agent wraps JSX in <T>, swaps the raw date for <DateTime>, then creates translations in context.',
  },
  {
    title: 'It opens the PR.',
    body: 'A diff window slides in and the Locadex cursor clicks “Open PR”. Merged — and the site returns fully translated.',
  },
];

type Box = { x: number; y: number; enW: number; enH: number; esW: number; esH: number };

/** Layout-space offset of `el` inside `root` — immune to the camera transform. */
function getLocal(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * The pinned, full-bleed scroll story: a real marketing page is translated in
 * place, flips into an editor, and Locadex opens the PR that ships it.
 *
 * Every colour, rule and radius comes from `--gts-*` custom properties, so a
 * direction skins the whole nine-beat sequence from its own stylesheet.
 */
export default function StorySection({
  className,
  id = 'story',
  heading,
  subheading,
  sliderMode = 'slide',
  captions = DEFAULT_CAPTIONS,
  beats = DEFAULT_BEATS,
  navSelector,
  scrollLength = { desktop: 8200, mobile: 5400 },
  field = true,
  siteName = 'example.com',
  logoSrc = '/brand/no-bg-gt-logo-dark.png',
}: StorySectionProps) {
  const root = useRef<HTMLElement>(null);
  const popup = sliderMode === 'popup';

  useGSAP(
    () => {
      const stage = root.current?.querySelector<HTMLElement>('[data-stage]');
      if (!stage || !root.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const q = gsap.utils.selector(root);
      const one = <T extends Element>(sel: string) => root.current?.querySelector<T>(sel) ?? null;

      const styles = getComputedStyle(root.current);
      const paperColor = styles.getPropertyValue('--gts-paper').trim() || '#f2f1ec';
      const codeColor = styles.getPropertyValue('--gts-code-bg').trim() || '#0b0d10';

      const win = one<HTMLElement>('[data-window]');
      const cam = one<HTMLElement>('[data-cam]');
      const dock = one<HTMLElement>('[data-dock]');
      const proxy = one<HTMLElement>('[data-proxy]');
      const code = one<HTMLElement>('[data-code]');
      const codeBody = one<HTMLElement>('[data-codebody]');
      const cursor = one<HTMLElement>('[data-cursor]');
      const hilite = one<HTMLElement>('[data-hilite]');
      const reviewPath = one<SVGPathElement>('[data-reviewpath]');
      const reviewCard = one<HTMLElement>('[data-reviewcard]');
      const delLine = one<HTMLElement>('[data-delline]');
      const delTxt = one<HTMLElement>('[data-deltxt]');
      const prBtn = one<HTMLElement>('[data-openpr]');
      const agent = one<HTMLElement>('[data-agentcursor]');
      const fieldEl = one<HTMLElement>('.gts-field');
      if (!win || !cam || !dock || !proxy || !code || !codeBody || !cursor || !hilite) return;
      if (!reviewPath || !reviewCard || !delLine || !delTxt || !prBtn || !agent) return;

      /* narrowed aliases so the closures below never re-check for null */
      const winEl = win;
      const camEl = cam;
      const codeEl = code;
      const cardEl = reviewCard;
      const pathEl = reviewPath;
      const proxyEl = proxy;
      const prEl = prBtn;
      const codeBodyEl = codeBody;

      const nav = navSelector ? document.querySelector<HTMLElement>(navSelector) : null;
      const caps = q('[data-cap]') as HTMLElement[];
      const blocks = q('[data-block]') as HTMLElement[];
      const resizers = q('[data-resize]') as HTMLElement[];
      const esAll = q('.gts-es') as HTMLElement[];
      const enAll = q('.gts-en') as HTMLElement[];
      const markerNodes = q('[data-mk] .gts-mk-n') as HTMLElement[];

      const isMobile = () => window.innerWidth < 900;

      /* ---------- strike bar + pellets built once ---------- */
      delTxt.style.position = 'relative';
      const strike = document.createElement('i');
      strike.style.cssText =
        'position:absolute;left:0;right:0;top:52%;height:1.5px;background:rgba(255,255,255,.5);transform:scaleX(0);transform-origin:0 50%';
      delTxt.appendChild(strike);

      const pelletLayer = one<HTMLElement>('[data-pellets]');
      const pellets = markerNodes.map(() => {
        const p = document.createElement('div');
        p.className = 'gts-pellet';
        pelletLayer?.appendChild(p);
        return p;
      });

      /* Context threads (THREAD_MOTIF): each <T> pin is joined to the dock by
         a DOUBLED line at constant gauge — the fan the pellets ride. Without
         the drawn fan, a scrubbed still catches the pellets as unanchored ink
         dots floating over the paper. */
      const ctxLayer = one<SVGSVGElement>('[data-ctxlines]');
      const SVGNS = 'http://www.w3.org/2000/svg';
      const threadPairs = markerNodes.map(() => {
        const a = document.createElementNS(SVGNS, 'path');
        const b = document.createElementNS(SVGNS, 'path');
        ctxLayer?.append(a, b);
        return [a, b] as const;
      });
      const ctxThreads = threadPairs.flat();

      /* ---------- geometry, re-measured on every refresh ---------- */
      const boxes = new Map<HTMLElement, Box>();
      const mk: { x: number; y: number }[] = [];
      const focus: Record<string, { x: number; y: number }> = {};

      const target = (sel: string) => one<HTMLElement>(`${sel} [data-resize]`);
      const h1Sw = target('[data-h1]');
      const paraSw = target('[data-para]');
      const btnSw = target('[data-btn]');
      const tagSw = target('[data-tag]');
      const toastSw = target('[data-toast]');
      const navSws = q('[data-nav] [data-resize]') as HTMLElement[];

      function positions() {
        for (const el of resizers) {
          const ens = el.querySelectorAll<HTMLElement>('.gts-en');
          const ess = el.querySelectorAll<HTMLElement>('.gts-es');
          const w = el.style.width;
          const h = el.style.height;
          el.style.width = '';
          el.style.height = '';
          const enW = el.offsetWidth;
          const enH = el.offsetHeight;
          ens.forEach((n) => (n.style.display = 'none'));
          ess.forEach((n) => {
            n.style.position = 'static';
            n.style.opacity = '1';
          });
          const esW = el.offsetWidth;
          const esH = el.offsetHeight;
          ens.forEach((n) => (n.style.display = ''));
          ess.forEach((n) => {
            n.style.position = '';
            n.style.opacity = '';
          });
          const local = getLocal(el, camEl);
          boxes.set(el, { x: local.x, y: local.y, enW, enH, esW, esH });
          el.style.width = w;
          el.style.height = h;
        }

        mk.length = 0;
        for (const node of markerNodes) {
          const o = getLocal(node, winEl);
          /* the marker is a chip now, not a fixed circle — centre on its box */
          mk.push({ x: o.x + node.offsetWidth / 2, y: o.y + node.offsetHeight / 2 });
        }

        const centre = (sel: string) => {
          const el = one<HTMLElement>(sel);
          if (!el) return { x: 0, y: 0 };
          const o = getLocal(el, camEl);
          return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 };
        };
        focus.left = centre('.gts-site-left');
        focus.right = centre('.gts-site-right');
        focus.btn = centre('[data-btn]');
        focus.tag = centre('[data-tag]');

        /* webhook path: from the “requires review” pin to the counsel card */
        const legalMk = one<HTMLElement>('[data-legal] .gts-mk-n');
        if (legalMk) {
          const l = getLocal(legalMk, winEl);
          const sx = l.x + legalMk.offsetWidth / 2;
          const sy = l.y + legalMk.offsetHeight / 2;
          const ex = winEl.offsetWidth - (isMobile() ? 14 : 46) - cardEl.offsetWidth;
          const ey = (isMobile() ? 70 : 96) + 56;
          pathEl.setAttribute(
            'd',
            `M${sx},${sy} C${sx + 120},${sy + 70} ${ex - 160},${ey + 120} ${ex},${ey}`
          );
        }

        /* the context fan: straight doubled threads from every pin to the dock */
        const dp = dockPt();
        threadPairs.forEach((pair, i) => {
          const m = mk[i];
          if (!m) return;
          const dx = dp.x - m.x;
          const dy = dp.y - m.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          pair.forEach((p, j) => {
            const o = j === 0 ? -2.25 : 2.25;
            p.setAttribute(
              'd',
              `M${m.x + nx * o},${m.y + ny * o} L${dp.x + nx * o},${dp.y + ny * o}`
            );
          });
        });

        gsap.set(proxyEl, { width: dockW(), height: dockH(), borderRadius: 14 });
      }

      const winW = () => winEl.offsetWidth;
      const winH = () => winEl.offsetHeight;
      const dockW = () => Math.min(560, stage.clientWidth * 0.84);
      const dockH = () => (isMobile() ? 48 : 56);
      const dockBottom = () => (isMobile() ? 20 : 40);
      const dockPt = () => ({ x: winW() / 2, y: winH() - dockBottom() - dockH() / 2 });

      positions();
      ScrollTrigger.addEventListener('refreshInit', positions);

      /* camera: place a point of the site at (ax, ay) of the viewport at scale z */
      const camX = (k: string, z: number, ax = 0.5) => () => winW() * ax - (focus[k]?.x ?? 0) * z;
      const camY = (k: string, z: number, ay = 0.5) => () => winH() * ay - (focus[k]?.y ?? 0) * z;

      /* ---------- initial states ---------- */
      gsap.set(dock, { autoAlpha: 0 });
      gsap.set(proxy, { transformOrigin: '0 0', autoAlpha: 0 });
      gsap.set(cam, { transformOrigin: '0 0' });
      gsap.set(blocks, { filter: 'blur(0px)', opacity: 1 });
      gsap.set('[data-diff]', { x: 0, xPercent: 110 });
      gsap.set(pathEl, { drawSVG: '0% 0%', autoAlpha: 0 });
      if (ctxThreads.length) gsap.set(ctxThreads, { drawSVG: '0% 0%', autoAlpha: 0 });
      gsap.set('[data-tbadge]', { autoAlpha: 0 });
      gsap.set('[data-xray]', { '--gts-split': '0' });

      const pulse = gsap.fromTo(
        '[data-ppulse]',
        { drawSVG: '0% 12%', autoAlpha: 1 },
        { drawSVG: '88% 100%', duration: 2.4, repeat: -1, ease: 'none', paused: true }
      );

      let trigger: ScrollTrigger | undefined;
      const hud = (p: number, active: boolean) => {
        codeBodyEl.classList.toggle('gts-notes', p >= 0.795);
        codeBodyEl.classList.toggle('gts-tip2', p >= 0.805 && p <= 0.845);
        pulse.paused(!(active && p > 0.71 && p < 0.97));
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${isMobile() ? scrollLength.mobile : scrollLength.desktop}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle(self) {
            trigger = self;
            if (!self.isActive) pulse.paused(true);
          },
        },
        defaults: { ease: 'none' },
      });
      tl.eventCallback('onUpdate', () => hud(tl.progress(), trigger ? trigger.isActive : false));

      type Vars = gsap.TweenVars;
      const ft = (tgt: gsap.TweenTarget, from: Vars, to: Vars, pos: number) =>
        tl.fromTo(tgt, from, { ...to, immediateRender: false }, pos);

      /* Caption swaps are ATOMIC — a zero-duration set, not a crossfade. The
         spans are stacked, so any overlap prints two captions superimposed on
         a scrubbed still ('It edits ybur Pcode…' was a real screenshot), and
         even a sequential fade leaves a window where a still catches the dock
         empty or a caption at 15% opacity. A set() means every possible frame
         shows exactly one caption at full contrast (§6, the still-frame law). */
      const cap = (i: number, t: number) => {
        const prev = caps[i - 1];
        const next = caps[i];
        if (prev) tl.set(prev, { opacity: 0 }, t);
        if (next) tl.set(next, { opacity: 1 }, t);
      };

      const lit = (n: number, t: number) => {
        tl.to(`[data-pipeline] [data-pn="${n}"]`, { stroke: '#f0f0f0', duration: 0.4 }, t);
        tl.to(
          `[data-pipeline] text[data-pn="${n}"]`,
          { fill: 'rgba(255,255,255,.92)', duration: 0.4 },
          t
        );
      };

      /** The code reveal, in whichever structure this direction asked for. */
      const openPanel = (sel: string, t: number, split: string) => {
        if (popup) {
          ft(
            sel,
            { autoAlpha: 0, y: 30, scale: 0.965 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' },
            t
          );
          return;
        }
        ft(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, t);
        /* a fast wipe: the sampled scroll depths land on the panel OPEN, not
           mid-swipe with a line amputated by the split edge */
        ft(sel, { '--gts-split': '0' }, { '--gts-split': split, duration: 1.2 }, t + 0.2);
      };

      const closePanel = (sel: string, t: number) => {
        if (popup) {
          tl.to(sel, { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power2.in' }, t);
          return;
        }
        /* fast, like the open: a scrubbed still should catch the panel open
           or gone, almost never mid-swipe with a line amputated by the edge */
        tl.to(sel, { '--gts-split': '0', duration: 0.7 }, t);
        tl.to(sel, { autoAlpha: 0, duration: 0.25 }, t + 0.7);
      };

      /* Depth of field — blur is what makes a zoom read as focus, not scale.
         Shallow on purpose: the out-of-focus blocks stay legible as rendered
         UI (nav, cards, copy), never Gaussian smudges — at composite scale a
         heavy blur reads as a defect, not as composed depth (§1.5). The
         filter runs in the camera's LOCAL space, so the visual radius is
         amount × zoom: callers pass an amount already divided by the zoom
         they drive the camera to. */
      let prevKeep: HTMLElement[] = blocks;
      const dof = (t: number, keep: HTMLElement[], amount = 1.8) => {
        for (const b of blocks) {
          const from = prevKeep.includes(b) ? 0 : amount;
          const to = keep.includes(b) ? 0 : amount;
          if (from === to) continue;
          ft(
            b,
            { filter: `blur(${from}px)`, opacity: from ? 0.9 : 1 },
            { filter: `blur(${to}px)`, opacity: to ? 0.9 : 1, duration: 1.2 },
            t
          );
        }
        prevKeep = keep;
      };

      const inColumn = (sel: string) => blocks.filter((b) => b.closest(sel));

      /* ---------- SETUP (0–8): the sheet rises, nav becomes the dock ---------- */
      ft(win, { scale: 1.09, y: 40, autoAlpha: 0.4 }, { scale: 1, y: 0, autoAlpha: 1, duration: 4 }, 0);
      if (nav) tl.to(nav, { autoAlpha: 0, y: -18, duration: 1.2 }, 0.2);
      ft(proxy, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.7);
      ft(
        proxy,
        { x: 0, y: 0, scaleX: () => window.innerWidth / dockW(), scaleY: () => 64 / dockH() },
        {
          x: () => (window.innerWidth - dockW()) / 2,
          y: () => stage.clientHeight - dockBottom() - dockH(),
          scaleX: 1,
          scaleY: 1,
          duration: 2.8,
        },
        0.9
      );
      tl.to(dock, { autoAlpha: 1, duration: 0.6 }, 3.6);
      tl.to(proxy, { autoAlpha: 0, duration: 0.5 }, 3.9);

      /* ---------- Beat 1 (8–20): pellets ingest from every marker ---------- */
      cap(1, 8);
      if (ctxThreads.length) {
        ft(
          ctxThreads,
          { autoAlpha: 0, drawSVG: '0% 0%' },
          { autoAlpha: 1, drawSVG: '0% 100%', duration: 1.7, stagger: 0.07 },
          8.1
        );
        tl.to(ctxThreads, { autoAlpha: 0, duration: 0.6 }, 19.1);
      }
      pellets.forEach((p, i) => {
        for (let w = 0; w < 3; w++) {
          const t0 = 8.4 + w * 3.4 + i * 0.28;
          ft(p, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t0);
          ft(
            p,
            { x: () => mk[i]?.x ?? 0, y: () => mk[i]?.y ?? 0 },
            { x: () => dockPt().x, y: () => dockPt().y, duration: 2.3, ease: 'power1.in' },
            t0
          );
          tl.to(p, { opacity: 0, duration: 0.25 }, t0 + 2.05);
        }
      });

      /* ---------- Beat 2 (20–34): the cursor hops; the DOM resizes ---------- */
      cap(2, 20);
      tl.to(cam, { x: camX('left', 1.5), y: camY('left', 1.5), scale: 1.5, duration: 2.2 }, 20);
      dof(20, inColumn('.gts-site-left'));
      ft(cursor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 20.2);
      ft('[data-flagchip]', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 20.4);

      /* Every swap is measured in both languages, so containers really move.
         The fades are SEQUENTIAL — source out, then translation in — because a
         scrubbed timeline can freeze on any frame, and a still must never
         catch two languages double-exposed (§6, the still-frame law). */
      const swap = (el: HTMLElement | null, t: number, mode: 'w' | 'h') => {
        if (!el) return;
        const b = () => boxes.get(el);
        const ens = Array.from(el.querySelectorAll<HTMLElement>('.gts-en'));
        const ess = Array.from(el.querySelectorAll<HTMLElement>('.gts-es'));
        tl.to(ens, { opacity: 0, duration: 0.26 }, t);
        ft(ess, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.3);
        if (mode === 'w') {
          ft(
            el,
            { width: () => b()?.enW ?? 0 },
            { width: () => b()?.esW ?? 0, duration: 0.55, ease: 'power3.inOut' },
            t
          );
        } else {
          ft(
            el,
            { height: () => b()?.enH ?? 0 },
            { height: () => b()?.esH ?? 0, duration: 0.55, ease: 'power3.inOut' },
            t
          );
        }
      };

      const hop = (el: HTMLElement | null, t: number) => {
        if (!el) return;
        const b = () => boxes.get(el);
        tl.to(
          cursor,
          {
            x: () => (b()?.x ?? 0) + (b()?.enW ?? 0) * 0.55,
            y: () => (b()?.y ?? 0) + (b()?.enH ?? 0) + 4,
            duration: 0.85,
            ease: 'power2.inOut',
          },
          t
        );
        ft(hilite, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 0.5);
        ft(
          hilite,
          { left: () => (b()?.x ?? 0) - 4, top: () => (b()?.y ?? 0) - 4 },
          {
            left: () => (b()?.x ?? 0) - 4,
            top: () => (b()?.y ?? 0) - 4,
            width: () => (b()?.enW ?? 0) + 8,
            height: () => (b()?.enH ?? 0) + 8,
            duration: 0.4,
          },
          t + 0.5
        );
        ft(
          hilite,
          { width: () => (b()?.enW ?? 0) + 8, height: () => (b()?.enH ?? 0) + 8 },
          {
            width: () => (b()?.esW ?? 0) + 8,
            height: () => (b()?.esH ?? 0) + 8,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          t + 1.1
        );
      };

      hop(h1Sw, 20.6);
      swap(h1Sw, 21.7, 'w');
      swap(target('[data-date]'), 21.9, 'w');

      hop(paraSw, 23.4);
      swap(paraSw, 24.5, 'h');
      swap(target('[data-legal]'), 24.8, 'h');

      hop(navSws[0] ?? null, 26.4);
      navSws.forEach((el, i) => swap(el, 27.5 + i * 0.18, 'w'));

      tl.to(cam, { x: camX('right', 1.5), y: camY('right', 1.5), scale: 1.5, duration: 1.6 }, 29.4);
      dof(29.4, inColumn('.gts-site-right'));
      hop(toastSw, 29.8);
      swap(toastSw, 30.9, 'w');
      swap(target('[data-form]'), 31.2, 'w');
      tl.to('[data-flagchip]', { autoAlpha: 0, duration: 0.4 }, 32.4);
      tl.to(cursor, { autoAlpha: 0, duration: 0.4 }, 32.8);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 32.8);

      /* ---------- Beat 3 (34–45): the <T> reveal around a component ----------
         The zoom stays wide enough that the button keeps its rendered context —
         nav row above, legal line and stats below — so the un-covered half of
         the frame carries a real page region, not one component in a blur. */
      cap(3, 34);
      tl.to(cam, { x: camX('btn', 2.35, 0.76), y: camY('btn', 2.35), scale: 2.35, duration: 2.2 }, 34);
      dof(
        34,
        blocks.filter((b) => b.matches('[data-btn]')),
        1.05
      );
      openPanel('[data-xray="btn"]', 36, '0.6');
      closePanel('[data-xray="btn"]', 42.4);
      swap(btnSw, 41.4, 'w');

      /* ---------- Beat 4 (45–56): <T context="…"> and the tone lands ----------
         Wide enough that the toast and the form card stay in frame under the
         tagline — the localized specimen sits in its rendered page, not
         between two empty paper bands. */
      cap(4, 45);
      /* framed so the whole card column clears the split edge: tagline card,
         tone chip, toast and form all keep their text inside the open pane */
      tl.to(
        cam,
        { x: camX('tag', 1.6, 0.885), y: camY('tag', 1.6, 0.34), scale: 1.6, duration: 2.2 },
        45
      );
      dof(
        45,
        blocks.filter((b) => b.matches('[data-tag]')),
        1.05
      );
      openPanel('[data-xray="tag"]', 47, '0.58');
      swap(tagSw, 50, 'h');
      ft('[data-tonechip]', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 51);
      closePanel('[data-xray="tag"]', 54.4);
      tl.to('[data-tonechip]', { autoAlpha: 0, duration: 0.4 }, 55.2);

      /* ---------- Beat 5 (56–65): requires review → counsel ping ---------- */
      cap(5, 56);
      tl.to(cam, { x: 0, y: 0, scale: 1, duration: 2 }, 56);
      dof(56, blocks);
      ft('[data-legal] .gts-mk-n', { scale: 1 }, { scale: 1.45, duration: 0.3, yoyo: true, repeat: 3 }, 58);
      ft(pathEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 58.3);
      ft(pathEl, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.7 }, 58.4);
      ft(cardEl, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 1 }, 60);
      ft('[data-approved]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 62.8);

      /* ---------- Transition (65–69): flicker to source, flip to code ----------
         The sheet turns into the editor's dark plate BEFORE the code fades up,
         so no scroll position ever catches paper and code dissolved together. */
      cap(6, 65);
      /* the flicker back to source is staged, not crossfaded — no frame ever
         holds both languages at half opacity */
      tl.to(esAll, { opacity: 0, duration: 0.45, ease: 'steps(3)' }, 65.2);
      tl.to(enAll, { opacity: 1, duration: 0.45, ease: 'steps(3)' }, 65.7);
      resizers.forEach((el) => {
        const b = () => boxes.get(el);
        tl.to(el, { width: () => b()?.enW ?? 0, height: () => b()?.enH ?? 0, duration: 0.8 }, 65.3);
      });
      tl.to([cardEl, '[data-approved]', pathEl], { autoAlpha: 0, duration: 0.6 }, 65.3);
      tl.to('[data-mk]', { autoAlpha: 0, duration: 0.5 }, 65.6);
      tl.to(win, { rotationX: 9, scale: 0.955, duration: 1 }, 66.4);
      tl.to(cam, { autoAlpha: 0, duration: 0.45 }, 66.5);
      tl.to('[data-paperfx]', { autoAlpha: 0, duration: 0.45 }, 66.5);
      ft(win, { backgroundColor: paperColor }, { backgroundColor: codeColor, duration: 0.5 }, 66.6);
      tl.to('[data-winchip]', { autoAlpha: 0, duration: 0.4 }, 66.5);
      ft(code, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55 }, 67.1);
      tl.to(win, { rotationX: 0, scale: 1, duration: 1 }, 67.4);
      ft('[data-pipeline]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1 }, 67.8);

      /* ---------- Beat 6 (70–78): push → PR → scan ---------- */
      cap(7, 70);
      ft('[data-pwire]', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.6 }, 70);
      lit(0, 70.3);
      ft('[data-commit]', { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 70.5);
      ft('[data-pr]', { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 71.8);
      lit(1, 72.6);
      ft('[data-scanline]', { autoAlpha: 0, y: -60 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 72.4);
      tl.to('[data-scanline]', { y: () => codeBodyEl.clientHeight - 50, duration: 4 }, 72.8);
      tl.to('[data-scanline]', { autoAlpha: 0, duration: 0.4 }, 77);

      /* ---------- Beat 7 (78–84): the notes land ---------- */
      cap(8, 78);
      ft('.gts-lmk', { scale: 0 }, { scale: 1, duration: 0.7, stagger: 0.5 }, 78.4);

      /* ---------- Beat 8 (84–90): the agent edits + translates ---------- */
      cap(9, 84);
      lit(2, 84.2);
      ft('.gts-cl.gts-add', { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.4 }, 84.3);
      ft(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 85);
      tl.to(delLine, { opacity: 0.55, duration: 0.6 }, 85.2);
      tl.to(delTxt, { color: 'rgba(255,255,255,.34)', duration: 0.6 }, 85.2);
      lit(3, 87.4);
      ft('[data-tbadge]', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 87.6);
      if (fieldEl) ft(fieldEl, { autoAlpha: 0 }, { autoAlpha: 0.2, duration: 2.4 }, 86.2);

      /* ---------- Beat 9 (90–100): diff, cursor, merge, translated site ---------- */
      cap(10, 90);
      tl.to('[data-diff]', { xPercent: 0, duration: 2 }, 90.3);
      lit(4, 92.3);
      if (fieldEl) tl.to(fieldEl, { autoAlpha: 0.5, duration: 3 }, 91);
      const prPt = () => {
        const p = getLocal(prEl, codeEl);
        return { x: p.x + prEl.offsetWidth / 2 - 5, y: p.y + prEl.offsetHeight / 2 - 8 };
      };
      ft(agent, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 92.5);
      ft(
        agent,
        { x: () => prPt().x + 150, y: () => prPt().y - 200 },
        { x: () => prPt().x, y: () => prPt().y, duration: 2.2 },
        92.5
      );
      tl.to(prBtn, { scale: 0.9, duration: 0.22 }, 94.8);
      tl.to(prBtn, { scale: 1, duration: 0.22 }, 95.05);
      ft('[data-prtoast]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 95.3);
      tl.to(agent, { autoAlpha: 0, y: '+=26', duration: 0.7 }, 96.2);

      tl.to(code, { autoAlpha: 0, duration: 0.6 }, 96.6);
      tl.to('[data-pipeline]', { autoAlpha: 0, duration: 0.6 }, 96.5);
      tl.to(win, { backgroundColor: paperColor, duration: 0.5 }, 96.9);
      tl.to('[data-paperfx]', { autoAlpha: 1, duration: 0.5 }, 96.9);
      tl.to(cam, { autoAlpha: 1, duration: 0.7 }, 97);
      tl.to('[data-winchip]', { autoAlpha: 1, duration: 0.7 }, 97);
      tl.to(enAll, { opacity: 0, duration: 0.4 }, 97.2);
      tl.to(esAll, { opacity: 1, duration: 0.45 }, 97.65);
      resizers.forEach((el) => {
        const b = () => boxes.get(el);
        tl.to(el, { width: () => b()?.esW ?? 0, height: () => b()?.esH ?? 0, duration: 0.9 }, 97.2);
      });
      if (nav) tl.to(nav, { autoAlpha: 1, y: 0, duration: 1 }, 98.8);
      tl.to({}, { duration: 0.4 }, 99.6);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', positions);
        pulse.kill();
      };
    },
    { scope: root, dependencies: [popup] }
  );

  return (
    <section className={className ? `gts ${className}` : 'gts'} id={id} ref={root}>
      <div className='gts-proxy' data-proxy aria-hidden />

      {(heading || subheading) && (
        <div className='gts-head'>
          {heading && <h2>{heading}</h2>}
          {subheading && <p>{subheading}</p>}
        </div>
      )}

      <div className='gts-stage' data-stage>
        {field && (
          <PrismaticField
            className='gts-field'
            preset='2'
            speed={0.7}
            params={{ exposureScale: 2300 }}
          />
        )}

        <div className='gts-window' data-window>
          <div className='gts-win-dots' data-paperfx aria-hidden />
          <div className='gts-win-guides' data-paperfx aria-hidden />

          <div className='gts-cam' data-cam>
            <StoryDemoSite />

            <div className='gts-hilite' data-hilite />
            <div className='gts-cursor' data-cursor>
              <svg width='18' height='23' viewBox='0 0 17 22'>
                <path
                  d='M1 1 L1 17 L5.5 13.4 L8.4 20 L11.4 18.7 L8.6 12.3 L14.4 12 Z'
                  fill='#16181a'
                  stroke='#f2f1ec'
                  strokeWidth='1.2'
                />
              </svg>
              <span className='gts-cursor-label'>LOCADEX</span>
            </div>
          </div>

          <svg className='gts-review-line' width='100%' height='100%' aria-hidden>
            <path
              data-reviewpath
              d=''
              fill='none'
              stroke='currentColor'
              strokeWidth='1.4'
              strokeDasharray='5 5'
            />
          </svg>

          <div className='gts-review-card' data-reviewcard>
            <div className='gts-r-head'>
              <span className='gts-r-ava'>LC</span>
              <span>
                <span className='gts-r-name'>Legal counsel</span>
                <br />
                <span className='gts-r-sub'>webhook · requires review</span>
              </span>
            </div>
            <p className='gts-r-msg'>
              Review this translation! “Al continuar, aceptas nuestros Términos de Servicio.”
            </p>
            <div className='gts-r-btns'>
              <span className='gts-r-btn gts-ok'>Approve</span>
              <span className='gts-r-btn'>Edit</span>
            </div>
            <div className='gts-r-approved' data-approved>
              Approved — shipped
            </div>
          </div>

          <svg className='gts-ctx-lines' data-ctxlines width='100%' height='100%' aria-hidden />

          <div className='gts-pellet-layer' data-pellets aria-hidden />

          <StoryCodeScene />

          <StoryCodePanel
            id='btn'
            mode={sliderMode}
            file='app/page.tsx'
            note='Wrap any component. GT reads the JSX, extracts the string, and renders the locale build in place — the button re-measures to fit its new label.'
            artifact={
              <>
                <div className='gts-gen-cap'>generated · public/_gt/</div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>es.json</span>
                  <span>&quot;Get started&quot;: &quot;Comenzar ahora&quot;</span>
                  <span className='gts-gen-m'>118 → 152 px</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>fr.json</span>
                  <span>&quot;Get started&quot;: &quot;Commencer&quot;</span>
                  <span className='gts-gen-m'>118 → 139 px</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>ja.json</span>
                  <span lang='ja'>&quot;Get started&quot;: &quot;始める&quot;</span>
                  <span className='gts-gen-m'>118 → 74 px</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>de.json</span>
                  <span lang='de'>&quot;Get started&quot;: &quot;Loslegen&quot;</span>
                  <span className='gts-gen-m'>118 → 121 px</span>
                </div>
              </>
            }
          >
            <span className='gts-tok-kw'>import</span> {'{ '}
            <span className='gts-tok-t'>T</span>
            {' } '}
            <span className='gts-tok-kw'>from</span>{' '}
            <span className='gts-tok-str'>&apos;gt-next&apos;</span>;{'\n\n'}
            <span className='gts-tok-kw'>export default function</span>{' '}
            <span className='gts-tok-fn'>Cta</span>() {'{\n  '}
            <span className='gts-tok-kw'>return</span> ({'\n    '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-t'>T</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>button</span>{' '}
            <span className='gts-tok-attr'>className</span>
            <span className='gts-tok-p'>=</span>
            <span className='gts-tok-str'>&quot;cta&quot;</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n        '}
            <span className='gts-tok-txt'>Get started</span>
            {'\n      '}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>button</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n    '}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-t'>T</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n  '});{'\n}'}
          </StoryCodePanel>

          <StoryCodePanel
            id='tag'
            mode={sliderMode}
            file='app/page.tsx'
            note='context="" is passed straight to the translation agent. Same string, different voice — the tone you wrote for is the tone that ships.'
            artifact={
              <>
                <div className='gts-gen-cap'>prompt · translation agent</div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>string</span>
                  <span>&quot;Translation that just works.&quot;</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>context</span>
                  <span>&quot;Playful, upbeat marketing tone&quot;</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>locale</span>
                  <span>es-419</span>
                  <span className='gts-gen-m'>tone matched</span>
                </div>
                <div className='gts-gen-cap'>same string · two prompts</div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>without</span>
                  <span lang='es'>&quot;Traducción que funciona.&quot;</span>
                  <span className='gts-gen-m'>−14%</span>
                </div>
                <div className='gts-gen-row'>
                  <span className='gts-gen-file'>context</span>
                  <span lang='es'>&quot;Traducciones que simplemente funcionan.&quot;</span>
                  <span className='gts-gen-m'>+39%</span>
                </div>
              </>
            }
          >
            <span className='gts-tok-kw'>import</span> {'{ '}
            <span className='gts-tok-t'>T</span>
            {' } '}
            <span className='gts-tok-kw'>from</span>{' '}
            <span className='gts-tok-str'>&apos;gt-next&apos;</span>;{'\n\n'}
            <span className='gts-tok-kw'>export default function</span>{' '}
            <span className='gts-tok-fn'>Tagline</span>() {'{\n  '}
            <span className='gts-tok-kw'>return</span> ({'\n    '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-t'>T</span> <span className='gts-tok-attr'>context</span>
            <span className='gts-tok-p'>=</span>
            <span className='gts-tok-str'>&quot;Playful, upbeat marketing tone&quot;</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>h3</span>
            <span className='gts-tok-p'>&gt;</span>
            <span className='gts-tok-txt'>Translation that just works.</span>
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>h3</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n    '}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-t'>T</span>
            <span className='gts-tok-p'>&gt;</span>
            {'\n  '});{'\n}'}
          </StoryCodePanel>

          <div className='gts-win-chip' data-winchip>
            <Image src={logoSrc} alt='' width={38} height={38} />
            {siteName}
          </div>
          <div className='gts-win-frame' aria-hidden />
        </div>

        <div className='gts-pipeline' data-pipeline aria-hidden>
          <SignalPathDiagram />
        </div>

        <div className='gts-dock' data-dock>
          <Image src={logoSrc} alt='' width={44} height={44} />
          <div className='gts-dock-cap'>
            {captions.map((c) => (
              <span data-cap key={c}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className='gts-static'>
        {beats.map((beat) => (
          <div className='gts-static-beat' key={beat.title}>
            <h3>{beat.title}</h3>
            <p>{beat.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
