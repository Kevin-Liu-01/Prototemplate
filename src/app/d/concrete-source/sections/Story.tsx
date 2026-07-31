'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import CodeEditor from '../components/CodeEditor';
import DemoSite from '../components/DemoSite';
import { STEP, centerIn, offsetIn, thud } from '../components/motion';
import { BEATS, STATIC_BEATS } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin);

type StoryConfig = {
  dist: number;
  z: { title: number; btn: number; copy: number; legal: number };
};

type Swap = {
  el: HTMLElement;
  prop: 'width' | 'height';
  grp: string;
  en?: number;
  es?: number;
};

export default function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const story = root.current;
      if (!story) return;
      const $ = <T extends Element>(s: string) => story.querySelector<T>(s);
      const $$ = <T extends Element>(s: string) => Array.from(story.querySelectorAll<T>(s));

      const dock = $<HTMLElement>('#dock')!;
      const dockCap = $<HTMLElement>('#dock-cap')!;
      const dockIdx = $<HTMLElement>('#dock-idx')!;
      const readout = $<HTMLElement>('#beat-readout')!;
      const win = $<HTMLElement>('#win')!;
      const winshell = $<HTMLElement>('#winshell')!;
      const stagevp = $<HTMLElement>('.stagevp')!;
      const stage = $<HTMLElement>('#site-stage')!;
      const editor = $<HTMLElement>('#editor')!;
      const edMain = $<HTMLElement>('.ed-main')!;
      const cursorEl = $<HTMLElement>('#agent-cursor')!;
      const storyPin = $<HTMLElement>('#story-pin')!;
      const ticks = $$<HTMLElement>('#dock-ticks i');

      /* [progress, caption, index-label, ticks-lit]
         Bands are ≥12 units wide, each centered on a sampled scroll depth, so every
         static frame catches exactly one held, unambiguous scene state.
         The index label is ALWAYS a clean NN — never a scramble/glitch state. */
      let lastBeat = -1;
      const setBeat = (p: number) => {
        let bi = 0;
        for (let i = 0; i < BEATS.length; i++) {
          const beat = BEATS[i];
          if (beat && p >= beat[0]) bi = i;
        }
        const beat = BEATS[bi];
        if (bi !== lastBeat && beat) {
          lastBeat = bi;
          dockCap.textContent = beat[1];
          dockIdx.textContent = beat[2] + '/09';
          ticks.forEach((t, i) => t.classList.toggle('lit', i < beat[3]));
          story.classList.toggle('notes-live', p >= 0.845);
        }
        readout.textContent = 'SCRUB ' + String(Math.round(p * 100)).padStart(2, '0') + '%';
      };

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        dock.classList.add('on');
        dockCap.textContent = 'gt helps you… → locadex opens the PR.';
        dockIdx.textContent = '09/09';
        readout.textContent = 'STATIC';
        story.classList.add('notes-live');
        return;
      }

      /* nav → dock FLIP-style morph */
      const nav = document.querySelector<HTMLElement>('#nav');
      const clone = document.querySelector<HTMLElement>('#morph-clone');
      let morphTween: gsap.core.Tween | null = null;
      const playMorph = () => {
        if (!nav || !clone) return;
        const n = nav.getBoundingClientRect();
        const d = dock.getBoundingClientRect();
        clone.style.display = 'flex';
        if (morphTween) morphTween.kill();
        morphTween = gsap.fromTo(
          clone,
          { left: n.left, top: n.top, width: n.width, height: n.height, autoAlpha: 1 },
          {
            left: d.left,
            top: d.top,
            width: d.width,
            height: d.height,
            duration: 0.5,
            ease: STEP(7),
            onComplete() {
              clone.style.display = 'none';
              dock.classList.add('on');
              thud(story);
            },
          }
        );
      };
      const reverseMorph = () => {
        if (!clone) return;
        if (morphTween) morphTween.kill();
        clone.style.display = 'none';
        gsap.set(clone, { autoAlpha: 0 });
        dock.classList.remove('on');
      };

      /* geometry helpers (transform-independent) */
      const zx = (el: HTMLElement, s: number) => s * (stagevp.clientWidth / 2 - centerIn(el, stagevp).x);
      const zy = (el: HTMLElement, s: number) => s * (stagevp.clientHeight / 2 - centerIn(el, stagevp).y);
      const swapLang = (tl: gsap.core.Timeline, sel: string, pos: number, toEs: boolean) => {
        tl.to(sel + ' .en', { opacity: toEs ? 0 : 1, duration: 0.35, ease: STEP(1) }, pos);
        tl.to(sel + ' .es', { opacity: toEs ? 1 : 0, duration: 0.35, ease: STEP(1) }, pos);
      };

      /* D1 — THE RESIZING DOM. Measure each bilingual container in both languages,
         then tween real width/height as translations land: the layout breathes.
         The target objects are created ONCE (timeline closures hold references);
         re-measurement mutates them in place so refreshed values propagate. */
      const swaps: Swap[] = [];
      const measureSwaps = () => {
        if (!swaps.length) {
          (
            [
              { el: $<HTMLElement>('#ds-btn'), prop: 'width', grp: 'btn' },
              { el: $<HTMLElement>('.ds-p'), prop: 'height', grp: 'p' },
              { el: $<HTMLElement>('#ds-copy'), prop: 'height', grp: 'copy' },
              { el: $<HTMLElement>('#ds-legal'), prop: 'height', grp: 'legal' },
            ] as Array<{ el: HTMLElement | null; prop: 'width' | 'height'; grp: string }>
          )
            .concat(
              $$<HTMLElement>('.ds-nav .bi').map((el) => ({
                el,
                prop: 'width' as const,
                grp: 'nav',
              }))
            )
            .forEach((t) => {
              if (t.el) swaps.push(t as Swap);
            });
        }
        const site = $<HTMLElement>('#demo-site');
        if (!site) return;
        swaps.forEach((s) => gsap.set(s.el, { clearProps: s.prop }));
        swaps.forEach((s) => {
          s.en = s.prop === 'width' ? s.el.offsetWidth : s.el.offsetHeight;
        });
        site.classList.add('measure-es');
        swaps.forEach((s) => {
          s.es = s.prop === 'width' ? s.el.offsetWidth : s.el.offsetHeight;
        });
        site.classList.remove('measure-es');
        swaps.forEach((s) => gsap.set(s.el, { [s.prop]: s.en }));
      };
      const resizeGrp = (
        tl: gsap.core.Timeline,
        grp: string,
        pos: number,
        toEs: boolean,
        dur?: number
      ) => {
        swaps
          .filter((s) => s.grp === grp)
          .forEach((s) => {
            tl.to(
              s.el,
              { [s.prop]: () => (toEs ? s.es : s.en), duration: dur || 0.6, ease: 'power3.inOut' },
              pos
            );
          });
      };

      /* pellets — one per numbered marker */
      const pelletEls: HTMLElement[] = [];
      const makePellets = () =>
        $$<HTMLElement>('.demo-site .mk .pin').map((pin) => {
          const p = document.createElement('i');
          p.className = 'pellet';
          winshell.appendChild(p);
          pelletEls.push(p);
          return { p, pin };
        });

      /* beat-5 webhook path */
      const layHookline = () => {
        const mkReview = $<HTMLElement>('#mk-review');
        const notif = $<HTMLElement>('#notif');
        const hookline = $<SVGPathElement>('#hookline');
        if (!mkReview || !notif || !hookline) return;
        const s = centerIn(mkReview, win);
        const o = offsetIn(notif, win);
        const t = { x: o.x, y: o.y + notif.offsetHeight / 2 };
        hookline.setAttribute(
          'd',
          'M' +
            s.x +
            ',' +
            s.y +
            ' C' +
            (s.x + 80) +
            ',' +
            (s.y - 90) +
            ' ' +
            (t.x - 90) +
            ',' +
            (t.y + 60) +
            ' ' +
            t.x +
            ',' +
            t.y
        );
      };

      const buildStory = (cfg: StoryConfig) => {
        const pellets = makePellets();
        measureSwaps();
        layHookline();

        gsap.set('#diffwin', { xPercent: 110, visibility: 'visible' });
        gsap.set(dock, { visibility: 'visible', autoAlpha: 0 });

        ScrollTrigger.create({
          trigger: story,
          start: 'top 60%',
          onEnter: () => {
            gsap.set(dock, { autoAlpha: 1 });
            playMorph();
          },
          onLeaveBack: () => {
            gsap.set(dock, { autoAlpha: 0 });
            reverseMorph();
          },
        });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: storyPin,
            start: 'top top',
            end: '+=' + cfg.dist,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setBeat(self.progress),
          },
        });
        /* spacer: total duration = 100, so positions read as scrub percentages.
           Every band is ≥12 units wide and HOLDS a composed state at its center,
           where the static 10%-step frames sample it. */
        tl.to({}, { duration: 100 }, 0);

        /* — INTRO (0–8, sampled ~2.5) · window already risen, dock reads 'gt helps you…' — */
        tl.fromTo(
          winshell,
          { y: '10vh', scale: 0.96, autoAlpha: 0.4 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 1.6 },
          0
        );

        /* — BEAT 1 · pellet ingestion (8–20, sampled ~14: several pellets mid-flight) — */
        pellets.forEach(({ p, pin }, i) => {
          const c = () => centerIn(pin, win);
          tl.fromTo(
            p,
            { x: () => c().x, y: () => c().y, opacity: 0 },
            { opacity: 1, duration: 0.35, ease: STEP(1), immediateRender: true },
            10 + i * 0.5
          );
          tl.to(
            p,
            { x: () => win.clientWidth / 2, y: () => win.clientHeight + 30, duration: 4.2 },
            10.4 + i * 0.5
          );
          tl.to(p, { opacity: 0, duration: 0.35, ease: STEP(1) }, 14.3 + i * 0.5);
        });
        tl.to('.dock .d-mark', { keyframes: { scale: [1, 1.25, 1], easeEach: STEP(1) }, duration: 1.2 }, 16.9);
        tl.to('#chip-ctx', { autoAlpha: 1, duration: 0.4, ease: STEP(1) }, 17.5);

        /* — BEAT 2 · translate in place (20–31.5, sampled ~25.5: title just landed) — */
        tl.to(
          stage,
          {
            scale: cfg.z.title,
            x: () => zx($<HTMLElement>('#ds-title-wrap')!, cfg.z.title),
            y: () => zy($<HTMLElement>('#ds-title-wrap')!, cfg.z.title),
            duration: 2.4,
          },
          20
        );
        tl.fromTo(
          '#chip-translate',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
          22.6
        );
        tl.to(
          '#ds-title',
          { duration: 2.0, scrambleText: { text: '¡Hola, mundo!', chars: '¡ñáíó<>_01', speed: 0.35 } },
          23.2
        );
        swapLang(tl, '.ds-p', 28, true);
        resizeGrp(tl, 'p', 28, true);

        /* — BEAT 3 · around any component (31.5–43, sampled ~37: <T> slider held OPEN) — */
        tl.to(
          stage,
          {
            scale: cfg.z.btn,
            x: () => zx($<HTMLElement>('#ds-btn')!, cfg.z.btn),
            y: () => zy($<HTMLElement>('#ds-btn')!, cfg.z.btn),
            duration: 2,
          },
          31.5
        );
        tl.to('#slider-t', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5 }, 33.8);
        tl.to('#slider-t', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2 }, 40.8);
        swapLang(tl, '#ds-btn', 42, true);
        resizeGrp(tl, 'btn', 42, true);

        /* — BEAT 4 · with your own context (43–54.5, sampled ~48.5: context slider + tone chip) — */
        tl.to(
          stage,
          {
            scale: cfg.z.copy,
            x: () => zx($<HTMLElement>('#ds-copy')!, cfg.z.copy),
            y: () => zy($<HTMLElement>('#ds-copy')!, cfg.z.copy),
            duration: 1.8,
          },
          43
        );
        tl.to('#slider-ctx', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 }, 45);
        tl.fromTo(
          '#chip-tone',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
          46.8
        );
        swapLang(tl, '#ds-copy', 47.4, true);
        resizeGrp(tl, 'copy', 47.4, true);
        tl.to('#slider-ctx', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2 }, 52.6);
        swapLang(tl, '.ds-nav', 53.8, true);
        resizeGrp(tl, 'nav', 53.8, true);
        swapLang(tl, '.ds-stat', 54.1, true);

        /* — BEAT 5 · with your review (54.5–66.5, sampled ~60: lawyer ping held) — */
        tl.to(
          stage,
          {
            scale: cfg.z.legal,
            x: () => zx($<HTMLElement>('#ds-legal')!, cfg.z.legal),
            y: () => zy($<HTMLElement>('#ds-legal')!, cfg.z.legal),
            duration: 1.8,
          },
          54.5
        );
        tl.to('#hooksvg', { autoAlpha: 1, duration: 0.1, ease: STEP(1) }, 56.4);
        tl.fromTo(
          '#hookline',
          { drawSVG: '0% 0%' },
          { drawSVG: '0% 100%', duration: 1.6, immediateRender: true },
          56.5
        );
        tl.fromTo(
          '#notif',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
          58.3
        );
        tl.to('#n-ok', { autoAlpha: 1, duration: 0.3, ease: STEP(1) }, 63.2);
        swapLang(tl, '#ds-legal', 64.2, true);
        resizeGrp(tl, 'legal', 64.2, true);
        tl.to(['#hooksvg', '#notif'], { autoAlpha: 0, duration: 0.25, ease: STEP(1) }, 65.7);

        /* — TRANSITION · flicker to source (66.5–77.5, sampled ~71.5: page FROZEN
             MID-FLICKER — a deliberately MIXED half-EN half-ES state) — */
        tl.to(stage, { scale: 1, x: 0, y: 0, duration: 1.6 }, 66.5);
        tl.to(
          ['#chip-translate', '#chip-ctx', '#chip-tone'],
          { autoAlpha: 0, duration: 0.25, ease: STEP(1) },
          66.9
        );
        // staggered flips back to source: some strings revert, others hold Spanish…
        swapLang(tl, '.ds-p', 68.2, false);
        resizeGrp(tl, 'p', 68.2, false, 0.5);
        swapLang(tl, '.ds-nav', 68.8, false);
        resizeGrp(tl, 'nav', 68.8, false, 0.5);
        swapLang(tl, '#ds-legal', 69.4, false);
        resizeGrp(tl, 'legal', 69.4, false, 0.5);
        // …HOLD the mixed state (69.9–74.6), then the rest snaps back…
        tl.to(
          '#ds-title',
          { duration: 0.9, scrambleText: { text: 'Hello, world!', chars: 'helo<>_01', speed: 0.6 } },
          74.7
        );
        swapLang(tl, '#ds-btn', 74.8, false);
        resizeGrp(tl, 'btn', 74.8, false, 0.5);
        swapLang(tl, '#ds-copy', 75, false);
        resizeGrp(tl, 'copy', 75, false, 0.5);
        swapLang(tl, '.ds-stat', 75.2, false);
        // …and the window flips to the code editor
        tl.fromTo(
          editor,
          { autoAlpha: 0, scale: 1.06 },
          { autoAlpha: 1, scale: 1, duration: 0.9, ease: STEP(3), immediateRender: true },
          76.4
        );

        /* — BEAT 6 · push → scan (77.5–84.5, sampled ~83.5: scanline low in the file,
             all four numbered marks already stamped by it) — */
        tl.fromTo(
          '#chip-commit',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
          77.8
        );
        tl.fromTo(
          '#chip-pr',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
          78.7
        );
        tl.fromTo(
          '#scanline',
          { autoAlpha: 1, y: 0 },
          { y: () => $<HTMLElement>('#ed-code')!.clientHeight * 0.94, duration: 5.5, immediateRender: true },
          79.5
        );
        // the scan stamps a mark as it passes each mapped line
        $$<HTMLElement>('[data-lmark]').forEach((mk, i) => {
          tl.fromTo(
            mk,
            { scale: 1.6, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.3, ease: STEP(2), immediateRender: true },
            81.2 + i * 0.6
          );
        });
        tl.to('#scanline', { autoAlpha: 0, duration: 0.25, ease: STEP(1) }, 85.2);

        /* — BEAT 7 · the marks are live notes (84.5–88.5) — */
        tl.to(
          '[data-lmark]',
          { keyframes: { scale: [1, 1.3, 1], easeEach: STEP(1) }, duration: 0.8, stagger: 0.15 },
          84.6
        );

        /* — BEAT 8 · edit code + create translations (88.5–92.2) — */
        tl.to('.cl.del .strike', { scaleX: 1, duration: 0.5, ease: STEP(3) }, 88.7);
        tl.to('.cl.del', { opacity: 0.38, duration: 0.4, ease: STEP(2) }, 89.2);
        tl.fromTo(
          '.cl.add',
          { autoAlpha: 0, x: -14 },
          { autoAlpha: 1, x: 0, duration: 0.4, ease: STEP(2), stagger: 0.35, immediateRender: true },
          89.5
        );
        tl.fromTo(
          '.tr-chip',
          { autoAlpha: 0, scale: 1.4 },
          { autoAlpha: 1, scale: 1, duration: 0.3, ease: STEP(2), stagger: 0.25, immediateRender: true },
          90.9
        );

        /* — BEAT 9 · the agent opens the PR (92.2–100, sampled ~95: diff window fully
             docked, cursor ON the button, click flash + "PULL REQUEST CREATED") — */
        tl.to('#diffwin', { xPercent: 0, duration: 1.1 }, 92.3);
        const anchor = () => offsetIn(cursorEl, edMain);
        const target = () => {
          const c = centerIn($<HTMLElement>('#openpr')!, edMain);
          const a = anchor();
          return { x: c.x - a.x - 6, y: c.y - a.y - 6 };
        };
        tl.fromTo(
          cursorEl,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25, ease: STEP(1), immediateRender: true },
          93.3
        );
        tl.to(cursorEl, { x: () => target().x * 0.55, y: () => target().y * 0.4, duration: 0.7 }, 93.5);
        tl.to(cursorEl, { x: () => target().x, y: () => target().y, duration: 0.4 }, 94.2);
        tl.to(cursorEl, { scale: 0.8, duration: 0.12, ease: STEP(1), yoyo: true, repeat: 1 }, 94.65);
        tl.fromTo(
          '#click-flash',
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.6, ease: STEP(2), immediateRender: true },
          94.7
        );
        tl.to('#pr-done', { autoAlpha: 1, duration: 0.2, ease: STEP(1) }, 94.75);
        /* click FIRST, merged caption + stamp only after (96+) */
        tl.fromTo(
          '#merged',
          { autoAlpha: 0, scale: 2.4, rotation: -6 },
          { autoAlpha: 1, scale: 1, rotation: -6, duration: 0.35, ease: STEP(2), immediateRender: true },
          96.3
        );
        /* return to the demo website — fully translated, containers re-breathing */
        tl.set('#demo-site .bi .en', { opacity: 0 }, 97.4);
        tl.set('#demo-site .bi .es', { opacity: 1 }, 97.4);
        (['p', 'nav', 'legal', 'btn', 'copy'] as const).forEach((g) => resizeGrp(tl, g, 97.4, true, 0.7));
        tl.to(
          '#ds-title',
          { duration: 0.6, scrambleText: { text: '¡Hola, mundo!', chars: '¡ñá01', speed: 0.6 } },
          97.4
        );
        tl.to(editor, { autoAlpha: 0, duration: 0.8, ease: STEP(2) }, 97.3);
        tl.fromTo(
          '#chip-live',
          { scale: 1.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: STEP(2), immediateRender: true },
          98.6
        );
      };

      const onRefreshInit = () => {
        measureSwaps();
        layHookline();
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

      const mm = gsap.matchMedia(story);
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
        buildStory({ dist: 10000, z: { title: 2.3, btn: 3.0, copy: 2.5, legal: 1.7 } });
      });
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
        buildStory({ dist: 4800, z: { title: 1.5, btn: 1.6, copy: 1.45, legal: 1.25 } });
      });

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        mm.revert();
        pelletEls.forEach((p) => p.remove());
      };
    },
    { scope: root }
  );

  return (
    <section className='story' id='story' ref={root} aria-label='How GT works'>
      <div className='story-pinwrap' id='story-pin'>
        <div className='story-head'>
          <span>
            <b>HOW IT WORKS //</b>
            <span className='sh-acts'> ACT II — THE WINDOW · ACT III — LOCADEX</span>
          </span>
          <span id='beat-readout'>SCROLL ▼</span>
        </div>

        <div className='winshell' id='winshell'>
          <div className='win' id='win'>
            <div className='win-guides' aria-hidden='true' />
            <div className='win-chip'>
              <span className='gtsq'>GT</span>DEMO — EXAMPLE APP
            </div>
            <div className='win-pill'>HOW IT WORKS</div>

            <div className='stagevp'>
              <div className='site-stage' id='site-stage'>
                <DemoSite />
              </div>
            </div>

            {/* beat 5: webhook line + lawyer ping */}
            <svg id='hooksvg' aria-hidden='true'>
              <path id='hookline' d='M0,0' />
            </svg>
            <div className='notif' id='notif'>
              <div className='n-head'>
                <span className='n-dot' />
                WEBHOOK → LEGAL REVIEW
              </div>
              <div className='n-body'>
                <b>Review this translation!</b>
                M. Alvarez — Counsel
                <div className='n-quote'>«Al continuar, aceptas los Términos del Servicio…»</div>
              </div>
              <div className='n-actions'>
                <span>EDIT</span>
                <span className='n-approve'>
                  APPROVE
                  <span className='n-ok' id='n-ok'>
                    APPROVED ✓
                  </span>
                </span>
              </div>
            </div>

            <CodeEditor />
          </div>
        </div>

        <div className='dock' id='dock' role='status'>
          <span className='d-mark'>GT</span>
          <span className='d-cap' id='dock-cap'>
            gt helps you…
          </span>
          <span className='d-idx' id='dock-idx'>
            00/09
          </span>
          <span className='d-ticks' id='dock-ticks' aria-hidden='true'>
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </div>

        <ol className='beats-static' aria-label='The story, step by step'>
          {STATIC_BEATS.map(([n, text]) => (
            <li key={n}>
              <b>{n}</b>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
