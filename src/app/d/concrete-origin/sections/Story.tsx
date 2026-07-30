'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import CodeSplit from '../components/CodeSplit';
import CodeWindow from '../components/CodeWindow';
import DemoSite from '../components/DemoSite';
import { STATIC_BEATS, STORY_BEATS } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin);

const STEP = (n: number) => `steps(${n})`;

/** Offsets accumulated from the layout box tree, so a live transform on an
 *  ancestor never poisons the measurement mid-scrub. */
function offsetIn(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}
function centerIn(el: HTMLElement, ancestor: HTMLElement) {
  const o = offsetIn(el, ancestor);
  return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 };
}
/** Marker pins carry translate(-50%,-50%), so their layout offset IS the point. */
function pinPoint(el: HTMLElement, ancestor: HTMLElement) {
  return offsetIn(el, ancestor);
}

type Swap = { el: HTMLElement; prop: 'width' | 'height'; grp: string; en: number; es: number };

type StoryConfig = {
  dist: number;
  zoom: { title: number; btn: number; copy: number; review: number; hop: number };
};

export default function Story() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const pinEl = pin.current;
      if (!section || !pinEl) return;

      const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
        section.querySelector<T>(sel);
      const qa = <T extends HTMLElement = HTMLElement>(sel: string) =>
        Array.from(section.querySelectorAll<T>(sel));

      const win = q<HTMLDivElement>('[data-win]');
      const vp = q<HTMLDivElement>('[data-vp]');
      const camera = q<HTMLDivElement>('[data-camera]');
      const demo = q<HTMLDivElement>('[data-demo]');
      const cursor = q<HTMLDivElement>('[data-cursor]');
      const halo = q<HTMLDivElement>('[data-halo]');
      const dock = q<HTMLDivElement>('[data-dock]');
      const dockCap = q<HTMLSpanElement>('[data-dock-cap]');
      const dockIdx = q<HTMLSpanElement>('[data-dock-idx]');
      const readout = q<HTMLSpanElement>('[data-readout]');
      const editor = q<HTMLDivElement>('[data-editor]');
      const edMain = q<HTMLDivElement>('[data-ed-main]');
      const edCode = q<HTMLDivElement>('[data-ed-code]');
      const notif = q<HTMLDivElement>('[data-notif]');
      const morph = q<HTMLDivElement>('[data-morph]');
      if (!win || !vp || !camera || !demo || !cursor || !halo || !dock || !editor) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---------- dock ticks ---------- */
      const ticksWrap = q<HTMLSpanElement>('[data-dock-ticks]');
      if (ticksWrap && !ticksWrap.childElementCount) {
        for (let i = 0; i < 10; i += 1) ticksWrap.appendChild(document.createElement('i'));
      }
      const ticks = qa<HTMLElement>('[data-dock-ticks] i');

      let lastBeat = -1;
      const setBeat = (p: number) => {
        let index = 0;
        STORY_BEATS.forEach((beat, i) => {
          if (p >= beat[0]) index = i;
        });
        if (index !== lastBeat) {
          lastBeat = index;
          const beat = STORY_BEATS[index];
          if (beat && dockCap && dockIdx) {
            dockCap.textContent = beat[1];
            dockIdx.textContent = `${beat[2]}/09`;
            ticks.forEach((tick, i) => tick.classList.toggle('lit', i < beat[3]));
          }
          section.classList.toggle('notes-live', p >= 0.755);
        }
        if (readout) {
          readout.textContent = `SCRUB ${String(Math.round(p * 100)).padStart(2, '0')}%`;
        }
      };

      if (reduced) {
        setBeat(1);
        if (dockCap) dockCap.textContent = 'gt helps you… → locadex opens the PR.';
        if (dockIdx) dockIdx.textContent = '09/09';
        if (readout) readout.textContent = 'STATIC';
        return;
      }

      /* ---------- nav → dock morph ---------- */
      let morphTween: gsap.core.Tween | null = null;
      const playMorph = () => {
        const nav = document.querySelector<HTMLElement>('[data-cm-nav]');
        if (!nav || !morph) return;
        const n = nav.getBoundingClientRect();
        const d = dock.getBoundingClientRect();
        morph.style.display = 'flex';
        morphTween?.kill();
        morphTween = gsap.fromTo(
          morph,
          { left: n.left, top: n.top, width: n.width, height: n.height, autoAlpha: 1 },
          {
            left: d.left,
            top: d.top,
            width: d.width,
            height: d.height,
            duration: 0.5,
            ease: STEP(7),
            onComplete: () => {
              morph.style.display = 'none';
              gsap.to(dock, { autoAlpha: 1, duration: 0.2, ease: STEP(1) });
            },
          }
        );
      };
      const reverseMorph = () => {
        morphTween?.kill();
        if (morph) {
          morph.style.display = 'none';
          gsap.set(morph, { autoAlpha: 0 });
        }
        gsap.set(dock, { autoAlpha: 0 });
      };

      /* ---------- D1: measure every bilingual container in both languages ---------- */
      const swaps: Swap[] = [];
      const collect = () => {
        if (swaps.length) return;
        const push = (el: HTMLElement | null, prop: 'width' | 'height', grp: string) => {
          if (el) swaps.push({ el, prop, grp, en: 0, es: 0 });
        };
        push(q('[data-node="btn"]'), 'width', 'btn');
        push(q('[data-node="para"]'), 'height', 'para');
        push(q('[data-node="copy"]'), 'height', 'copy');
        push(q('[data-node="legal"]'), 'height', 'legal');
        push(q('[data-node="cta"] .cm-bi'), 'width', 'nav');
        qa('[data-grp="nav"] .cm-bi').forEach((el) => push(el, 'width', 'nav'));
        qa('[data-node="stat"] .cm-bi').forEach((el) => push(el, 'width', 'stat'));
      };
      const measure = () => {
        collect();
        swaps.forEach((s) => gsap.set(s.el, { clearProps: s.prop }));
        swaps.forEach((s) => {
          s.en = s.prop === 'width' ? s.el.offsetWidth : s.el.offsetHeight;
        });
        demo.classList.add('measure-es');
        swaps.forEach((s) => {
          s.es = s.prop === 'width' ? s.el.offsetWidth : s.el.offsetHeight;
        });
        demo.classList.remove('measure-es');
        swaps.forEach((s) => gsap.set(s.el, { [s.prop]: s.en }));
      };

      const resizeGrp = (
        tl: gsap.core.Timeline,
        grp: string,
        pos: number,
        toEs: boolean,
        dur = 0.6
      ) => {
        swaps
          .filter((s) => s.grp === grp)
          .forEach((s) => {
            tl.to(
              s.el,
              {
                [s.prop]: () => (toEs ? s.es : s.en),
                duration: dur,
                ease: 'power3.inOut',
              },
              pos
            );
          });
      };

      const swapLang = (tl: gsap.core.Timeline, sel: string, pos: number, toEs: boolean) => {
        tl.to(`${sel} .cm-bi > .en`, { opacity: toEs ? 0 : 1, duration: 0.34, ease: STEP(1) }, pos);
        tl.to(`${sel} .cm-bi > .es`, { opacity: toEs ? 1 : 0, duration: 0.34, ease: STEP(1) }, pos);
      };

      /* ---------- camera: real moves, with focus falling off the subject ---------- */
      const camX = (el: HTMLElement, s: number) => s * (vp.clientWidth / 2 - centerIn(el, camera).x);
      const camY = (el: HTMLElement, s: number) =>
        s * (vp.clientHeight / 2 - centerIn(el, camera).y);

      const blocks = qa<HTMLElement>('[data-blk]');
      const focusPull = (
        tl: gsap.core.Timeline,
        subject: string | null,
        pos: number,
        amount: number,
        dur = 1.4
      ) => {
        blocks.forEach((block) => {
          const isSubject = subject !== null && block.dataset.blk === subject;
          tl.to(
            block,
            {
              filter: isSubject || amount === 0 ? 'blur(0px)' : `blur(${amount}px)`,
              opacity: isSubject || amount === 0 ? 1 : 0.72,
              duration: dur,
              ease: 'power2.inOut',
            },
            pos
          );
        });
      };

      const push = (
        tl: gsap.core.Timeline,
        target: HTMLElement | null,
        scale: number,
        pos: number,
        dur = 2.2
      ) => {
        if (!target) return;
        tl.to(
          camera,
          {
            scale,
            x: () => camX(target, scale),
            y: () => camY(target, scale),
            duration: dur,
            ease: 'power2.inOut',
            force3D: false,
          },
          pos
        );
        tl.to(cursor, { scale: 1 / scale, duration: dur, ease: 'power2.inOut' }, pos);
        tl.to(
          '[data-vignette]',
          { opacity: scale > 1.2 ? 0.85 : 0, duration: dur, ease: 'power2.inOut' },
          pos
        );
      };

      /* the labelled agent cursor lands on a node while the camera holds still */
      const hop = (
        tl: gsap.core.Timeline,
        node: HTMLElement | null,
        focus: HTMLElement | null,
        scale: number,
        pos: number
      ) => {
        if (!node || !focus) return;
        const at = () => {
          const c = centerIn(node, camera);
          const f = centerIn(focus, camera);
          return {
            x: vp.clientWidth / 2 + scale * (c.x - f.x),
            y: vp.clientHeight / 2 + scale * (c.y - f.y),
          };
        };
        tl.to(
          cursor,
          {
            x: () => at().x - node.offsetWidth * scale * 0.2,
            y: () => at().y + node.offsetHeight * scale * 0.24,
            duration: 0.7,
            ease: 'power2.out',
          },
          pos
        );
        tl.to(
          halo,
          {
            autoAlpha: 1,
            width: () => node.offsetWidth * scale + 12,
            height: () => node.offsetHeight * scale + 10,
            x: () => at().x - (node.offsetWidth * scale + 12) / 2,
            y: () => at().y - (node.offsetHeight * scale + 10) / 2,
            duration: 0.55,
            ease: 'power2.out',
          },
          pos
        );
      };

      /* ---------- pellets, one per numbered marker ---------- */
      const pellets = qa<HTMLElement>('[data-mk]').map((mark) => {
        const dot = document.createElement('i');
        dot.className = 'cm-pellet';
        win.appendChild(dot);
        return { dot, mark };
      });

      /* ---------- beat-5 webhook path ---------- */
      const layHook = () => {
        const marker = q<HTMLElement>('[data-mk="5"]');
        const line = section.querySelector<SVGPathElement>('[data-hookline]');
        const wrap = q<HTMLElement>('[data-demo-wrap]');
        if (!marker || !line || !notif || !wrap) return;
        const s = pinPoint(marker, wrap);
        const t = {
          x: offsetIn(notif, wrap).x,
          y: offsetIn(notif, wrap).y + notif.offsetHeight / 2,
        };
        line.setAttribute(
          'd',
          `M${s.x},${s.y} C${s.x + 70},${s.y - 80} ${t.x - 80},${t.y + 60} ${t.x},${t.y}`
        );
      };

      measure();
      layHook();
      ScrollTrigger.addEventListener('refreshInit', () => {
        measure();
        layHook();
      });

      const config: StoryConfig =
        window.innerWidth < 768
          ? { dist: 4200, zoom: { title: 2.0, btn: 2.4, copy: 2.0, review: 1.35, hop: 1.15 } }
          : { dist: 7200, zoom: { title: 3.4, btn: 4.2, copy: 3.2, review: 1.9, hop: 1.55 } };

      gsap.set('[data-diffwin]', { xPercent: 112 });
      gsap.set(dock, { autoAlpha: 0 });
      gsap.set(cursor, { x: vp.clientWidth * 0.2, y: vp.clientHeight * 0.3 });
      gsap.set(halo, { width: 12, height: 12, autoAlpha: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 20%',
        onEnter: playMorph,
        onLeaveBack: reverseMorph,
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: `+=${config.dist}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setBeat(self.progress),
        },
      });
      // total duration 100 so every position below reads as a scrub percentage
      tl.to({}, { duration: 100 }, 0);

      const node = (name: string) => q<HTMLElement>(`[data-node="${name}"]`);
      const blk = (name: string) => q<HTMLElement>(`[data-blk="${name}"]`);
      const title = node('title');
      const bodyFocus = q<HTMLElement>('[data-focus="body"]');
      const reviewFocus = q<HTMLElement>('[data-focus="review"]');

      /* ===== INTRO (0–6 · sampled ~3) ===== */
      tl.fromTo(
        win,
        { scale: 1.12, autoAlpha: 0.25 },
        { scale: 1, autoAlpha: 1, duration: 2.4, ease: 'power2.out', force3D: false },
        0
      );

      /* ===== BEAT 1 · pellet ingestion (6–19 · sampled ~14) ===== */
      pellets.forEach(({ dot, mark }, i) => {
        const from = () => pinPoint(mark, camera);
        tl.fromTo(
          dot,
          { x: () => from().x, y: () => from().y, opacity: 0 },
          { opacity: 1, duration: 0.4, ease: STEP(1), immediateRender: true },
          7 + i * 0.55
        );
        tl.to(
          dot,
          {
            x: () => vp.clientWidth / 2,
            y: () => vp.clientHeight * 0.95 - 26,
            duration: 5,
            ease: 'power1.in',
          },
          7.4 + i * 0.55
        );
        tl.to(dot, { opacity: 0, duration: 0.3, ease: STEP(1) }, 12.2 + i * 0.55);
      });
      tl.to(
        '[data-dock] .d-mark',
        { keyframes: { scale: [1, 1.22, 1], easeEach: STEP(1) }, duration: 1.4 },
        16.4
      );
      tl.to('[data-chip="ctx"]', { autoAlpha: 1, duration: 0.4, ease: STEP(1) }, 17.4);

      /* ===== BEAT 2 · translate in place (19–30 · sampled ~25) ===== */
      push(tl, title, config.zoom.title, 19, 2.4);
      focusPull(tl, 'title', 19, 3.4, 2.4);
      tl.fromTo(
        '[data-chip="translate"]',
        { scale: 1.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
        21.6
      );
      tl.fromTo(cursor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: STEP(1) }, 21.8);
      hop(tl, title, title, config.zoom.title, 21.9);
      tl.to(
        title,
        { duration: 2.1, scrambleText: { text: '¡Hola, mundo!', chars: '¡ñáíó<>_01', speed: 0.35 } },
        22.8
      );

      /* D1 · the cursor hops on and the containers re-measure under it */
      push(tl, bodyFocus, config.zoom.hop, 26, 1.8);
      focusPull(tl, null, 26, 0, 1.6);
      hop(tl, node('para'), bodyFocus, config.zoom.hop, 27.1);
      swapLang(tl, '[data-node="para"]', 27.6, true);
      resizeGrp(tl, 'para', 27.6, true);
      hop(tl, q('[data-grp="nav"]'), bodyFocus, config.zoom.hop, 28.6);
      swapLang(tl, '[data-blk="nav"]', 29, true);
      resizeGrp(tl, 'nav', 29, true);

      /* ===== BEAT 3 · around any component (30–41 · sampled ~36) ===== */
      push(tl, node('btn'), config.zoom.btn, 30, 2.2);
      focusPull(tl, 'action', 30, 4, 2.2);
      hop(tl, node('btn'), node('btn'), config.zoom.btn, 31.4);
      tl.fromTo(
        '[data-split="btn"]',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: STEP(3), immediateRender: true },
        32.2
      );
      tl.fromTo(
        '[data-split="btn"]',
        { '--split': '0%' },
        { '--split': '72%', duration: 3.4, ease: 'power2.out', immediateRender: true },
        32.6
      );
      tl.to('[data-split="btn"]', { '--split': '100%', duration: 1.4 }, 38.4);
      tl.to('[data-split="btn"]', { autoAlpha: 0, y: -18, duration: 0.5, ease: STEP(3) }, 39.9);
      swapLang(tl, '[data-node="btn"]', 40.1, true);
      resizeGrp(tl, 'btn', 40.1, true);

      /* ===== BEAT 4 · with your own context (41–53 · sampled ~47.5) ===== */
      push(tl, node('copy'), config.zoom.copy, 41, 2);
      focusPull(tl, 'copy', 41, 4, 2);
      hop(tl, node('copy'), node('copy'), config.zoom.copy, 42.4);
      tl.fromTo(
        '[data-split="ctx"]',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: STEP(3), immediateRender: true },
        43
      );
      tl.fromTo(
        '[data-split="ctx"]',
        { '--split': '0%' },
        { '--split': '70%', duration: 3.2, ease: 'power2.out', immediateRender: true },
        43.4
      );
      tl.fromTo(
        '[data-chip="tone"]',
        { scale: 1.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
        46.4
      );
      swapLang(tl, '[data-node="copy"]', 48.4, true);
      resizeGrp(tl, 'copy', 48.4, true);
      tl.to('[data-split="ctx"]', { '--split': '100%', duration: 1.2 }, 50.2);
      tl.to('[data-split="ctx"]', { autoAlpha: 0, y: -18, duration: 0.5, ease: STEP(3) }, 51.6);
      swapLang(tl, '[data-node="stat"]', 52.2, true);
      resizeGrp(tl, 'stat', 52.2, true);

      /* ===== BEAT 5 · with your review (53–63 · sampled ~58.6) ===== */
      push(tl, reviewFocus, config.zoom.review, 53, 2);
      focusPull(tl, 'legal', 53, 2.6, 2);
      hop(tl, node('legal'), reviewFocus, config.zoom.review, 54.4);
      tl.to('[data-hook]', { autoAlpha: 1, duration: 0.1, ease: STEP(1) }, 55);
      tl.fromTo(
        '[data-hookline]',
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: 1.6, immediateRender: true },
        55.1
      );
      tl.fromTo(
        notif,
        { scale: 1.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
        56.8
      );
      tl.to('[data-nok]', { autoAlpha: 1, duration: 0.3, ease: STEP(1) }, 60.4);
      swapLang(tl, '[data-node="legal"]', 61.2, true);
      resizeGrp(tl, 'legal', 61.2, true);
      tl.to(['[data-hook]', notif], { autoAlpha: 0, duration: 0.25, ease: STEP(1) }, 62.4);

      /* ===== TRANSITION · flicker back to source, then flip to the editor ===== */
      tl.to(
        camera,
        { scale: 1, x: 0, y: 0, duration: 1.8, ease: 'power2.inOut', force3D: false },
        62.8
      );
      tl.to('[data-vignette]', { opacity: 0, duration: 1.6, ease: 'power2.inOut' }, 62.8);
      focusPull(tl, null, 62.8, 0, 1.6);
      tl.to(
        ['[data-chip="translate"]', '[data-chip="ctx"]', '[data-chip="tone"]', halo, cursor],
        { autoAlpha: 0, duration: 0.25, ease: STEP(1) },
        63
      );
      swapLang(tl, '[data-node="para"]', 63.8, false);
      resizeGrp(tl, 'para', 63.8, false, 0.5);
      swapLang(tl, '[data-blk="nav"]', 64.2, false);
      resizeGrp(tl, 'nav', 64.2, false, 0.5);
      swapLang(tl, '[data-node="legal"]', 64.6, false);
      resizeGrp(tl, 'legal', 64.6, false, 0.5);
      tl.to(
        title,
        { duration: 0.8, scrambleText: { text: 'Hello, world!', chars: 'helo<>_01', speed: 0.6 } },
        65.2
      );
      swapLang(tl, '[data-node="btn"]', 65.4, false);
      resizeGrp(tl, 'btn', 65.4, false, 0.5);
      swapLang(tl, '[data-node="copy"]', 65.6, false);
      resizeGrp(tl, 'copy', 65.6, false, 0.5);
      swapLang(tl, '[data-node="stat"]', 65.8, false);
      resizeGrp(tl, 'stat', 65.8, false, 0.5);
      tl.fromTo(
        editor,
        { autoAlpha: 0, scale: 1.08 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: STEP(3),
          immediateRender: true,
          force3D: false,
        },
        66.6
      );

      /* ===== BEAT 6 · push → scan (68–73.5 · sampled ~69.7) ===== */
      tl.fromTo(
        '[data-chip="commit"]',
        { scale: 1.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
        67.8
      );
      tl.fromTo(
        '[data-chip="pr"]',
        { scale: 1.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
        68.2
      );
      tl.fromTo(
        '[data-scanline]',
        { autoAlpha: 1, y: 0 },
        {
          y: () => (edCode ? edCode.clientHeight * 0.92 : 400),
          duration: 5.2,
          immediateRender: true,
        },
        68.4
      );
      qa('[data-lmark]').forEach((mark, i) => {
        tl.fromTo(
          mark,
          { scale: 1.7, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
          69.2 + i * 0.7
        );
      });
      tl.to('[data-scanline]', { autoAlpha: 0, duration: 0.25, ease: STEP(1) }, 73.6);

      /* ===== BEAT 7 · the marks become live notes (73.5–78) ===== */
      tl.to(
        '[data-lmark]',
        { keyframes: { scale: [1, 1.3, 1], easeEach: STEP(1) }, duration: 0.9, stagger: 0.2 },
        73.8
      );
      tl.to('[data-ltip="3"]', { autoAlpha: 1, duration: 0.3, ease: STEP(1) }, 75);
      tl.to('[data-ltip="3"]', { autoAlpha: 0, duration: 0.3, ease: STEP(1) }, 79.6);

      /* ===== BEAT 8 · it edits the code (78–86 · sampled ~80.8) ===== */
      tl.to('.cm-cl.del .strike', { scaleX: 1, duration: 0.5, ease: STEP(3) }, 78.2);
      tl.to('.cm-cl.del', { opacity: 0.34, duration: 0.4, ease: STEP(2) }, 78.7);
      tl.fromTo(
        '.cm-cl.add',
        { autoAlpha: 0, x: -16 },
        { autoAlpha: 1, x: 0, duration: 0.45, ease: STEP(2), stagger: 0.5, immediateRender: true },
        79
      );
      tl.fromTo(
        '.cm-tr-chip',
        { autoAlpha: 0, scale: 1.4 },
        { autoAlpha: 1, scale: 1, duration: 0.3, ease: STEP(2), stagger: 0.35, immediateRender: true },
        81.4
      );

      /* ===== BEAT 9 · the agent opens the PR (86–100 · sampled ~92) ===== */
      tl.to('[data-diffwin]', { xPercent: 0, duration: 1.3, ease: 'power3.out' }, 86.2);
      /* the cursor lives in window space, so the button's layout centre inside
         the window is already the coordinate it has to reach */
      const target = () => {
        const button = q<HTMLElement>('[data-openpr]');
        if (!button) return { x: 0, y: 0 };
        const c = centerIn(button, win);
        return { x: c.x - 7, y: c.y - 6 };
      };
      tl.set(cursor, { scale: 1 }, 88);
      tl.fromTo(
        cursor,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: STEP(1), immediateRender: true },
        88.2
      );
      tl.to(
        cursor,
        {
          x: () => target().x - vp.clientWidth * 0.18,
          y: () => target().y - vp.clientHeight * 0.24,
          duration: 1,
        },
        88.5
      );
      tl.to(cursor, { x: () => target().x, y: () => target().y, duration: 0.8 }, 89.8);
      tl.to(
        cursor,
        { scale: 0.82, duration: 0.14, ease: STEP(1), yoyo: true, repeat: 1 },
        90.8
      );
      tl.fromTo(
        '[data-click-flash]',
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 0.7, ease: STEP(2), immediateRender: true },
        90.9
      );
      tl.to('[data-pr-done]', { autoAlpha: 1, duration: 0.2, ease: STEP(1) }, 91);
      tl.fromTo(
        '[data-merged]',
        { autoAlpha: 0, scale: 2.4, rotation: -6, xPercent: -50 },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: -6,
          xPercent: -50,
          duration: 0.4,
          ease: STEP(2),
          immediateRender: true,
        },
        94
      );

      /* the site returns, fully translated, containers breathing one last time */
      tl.to(editor, { autoAlpha: 0, duration: 0.9, ease: STEP(2) }, 95.6);
      tl.set('[data-demo] .cm-bi > .en', { opacity: 0 }, 95.8);
      tl.set('[data-demo] .cm-bi > .es', { opacity: 1 }, 95.8);
      ['para', 'nav', 'legal', 'btn', 'copy', 'stat'].forEach((grp) =>
        resizeGrp(tl, grp, 95.8, true, 0.8)
      );
      tl.to(
        title,
        { duration: 0.7, scrambleText: { text: '¡Hola, mundo!', chars: '¡ñá01', speed: 0.6 } },
        95.8
      );
      tl.fromTo(
        '[data-chip="live"]',
        { scale: 1.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
        97.6
      );
    },
    { scope: root }
  );

  return (
    <section className='cm-story' id='story' ref={root} aria-label='How GT works'>
      <div className='cm-morph' data-morph aria-hidden>
        GT — HOW IT WORKS
      </div>

      <div className='cm-story-pin' ref={pin}>
        <div className='cm-win' data-win>
          <div className='cm-win-guides' aria-hidden />
          <div className='cm-win-chip'>
            <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={30} height={30} />
            DEMO — EXAMPLE APP
          </div>
          <div className='cm-win-pill'>HOW IT WORKS</div>
          <div className='cm-story-head'>
            <span>
              <b>HOW IT WORKS //</b> ACT II — THE WINDOW · ACT III — LOCADEX
            </span>
            <span data-readout>SCROLL ▼</span>
          </div>

          <div className='cm-vp' data-vp>
            <div className='cm-camera' data-camera>
              <div className='cm-demo-wrap' data-demo-wrap>
                <DemoSite />

                <span className='cm-focus' data-focus='body' />
                <span className='cm-focus' data-focus='review' />

                <svg className='cm-hooksvg' data-hook aria-hidden>
                  <path className='cm-hookline' data-hookline d='M0,0' />
                </svg>

                <div className='cm-notif' data-notif>
                  <div className='n-head'>
                    <span className='n-dot' />
                    WEBHOOK → LEGAL REVIEW
                  </div>
                  <div className='n-body'>
                    <b>Review this translation!</b>
                    M. Alvarez — Counsel
                    <div className='n-quote'>
                      «Al continuar, aceptas los Términos del Servicio…»
                    </div>
                  </div>
                  <div className='n-actions'>
                    <span>EDIT</span>
                    <span className='n-approve'>
                      APPROVE
                      <span className='n-ok' data-nok>
                        APPROVED ✓
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='cm-halo' data-halo />
          <div className='cm-cursor' data-cursor>
            <svg viewBox='0 0 24 24'>
              <path d='M4 2 L20 12 L12 13.5 L9 21 Z' fill='#fff' stroke='#090909' strokeWidth='1.5' />
            </svg>
            <span className='tag'>LOCADEX</span>
          </div>

          <div className='cm-vignette' data-vignette />

          <CodeSplit
            id='btn'
            file='BUTTON.TSX'
            note='THE CODE BEHIND IT'
            style={{ bottom: '18%' }}
            foot={['<T> WRAPS THE COMPONENT', 'NO KEYS · NO JSON FILES']}
            preview={
              <button className='cm-ds-btn' type='button'>
                Get started
              </button>
            }
            code={
              <>
                <span className='tok-tag'>&lt;</span>
                <span className='tok-cmp'>T</span>
                <span className='tok-tag'>&gt;</span>
                {'\n  '}
                <span className='tok-tag'>&lt;</span>
                <span className='tok-kw'>button</span>
                <span className='tok-tag'>&gt;</span>
                <span className='tok-txt'>Get started</span>
                <span className='tok-tag'>&lt;/</span>
                <span className='tok-kw'>button</span>
                <span className='tok-tag'>&gt;</span>
                {'\n'}
                <span className='tok-tag'>&lt;/</span>
                <span className='tok-cmp'>T</span>
                <span className='tok-tag'>&gt;</span>
              </>
            }
          />

          <CodeSplit
            id='ctx'
            file='TAGLINE.TSX'
            note='YOUR OWN CONTEXT'
            style={{ bottom: '18%' }}
            foot={['CONTEXT ATTACHED', 'TONE: PLAYFUL, UPBEAT']}
            preview={
              <p style={{ maxWidth: '30ch', fontSize: 13, lineHeight: 1.5, padding: '0 18px' }}>
                <b>Ship it everywhere.</b> Your app, in every language your users speak.
              </p>
            }
            code={
              <>
                <span className='tok-tag'>&lt;</span>
                <span className='tok-cmp'>T</span>{' '}
                <span className='tok-attr'>context</span>
                <span className='tok-tag'>=</span>
                <span className='tok-str'>&quot;Playful, upbeat marketing tone&quot;</span>
                <span className='tok-tag'>&gt;</span>
                {'\n  '}
                <span className='tok-tag'>&lt;</span>
                <span className='tok-kw'>p</span>
                <span className='tok-tag'>&gt;</span>
                <span className='tok-txt'>Ship it everywhere. …</span>
                <span className='tok-tag'>&lt;/</span>
                <span className='tok-kw'>p</span>
                <span className='tok-tag'>&gt;</span>
                {'\n'}
                <span className='tok-tag'>&lt;/</span>
                <span className='tok-cmp'>T</span>
                <span className='tok-tag'>&gt;</span>
              </>
            }
          />

          <CodeWindow />

          <div className='cm-dock' data-dock role='status'>
            <span className='d-mark'>
              <Image src='/brand/no-bg-gt-logo-light.png' alt='GT' width={48} height={48} />
            </span>
            <span className='d-cap' data-dock-cap>
              gt helps you…
            </span>
            <span className='d-idx' data-dock-idx>
              00/09
            </span>
            <span className='d-ticks' data-dock-ticks aria-hidden />
          </div>

          <ol className='cm-beats-static' aria-label='The story, step by step'>
            {STATIC_BEATS.map((beat) => (
              <li key={beat}>{beat}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
