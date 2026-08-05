'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';


import StackTower, { RAIL_ORIGIN, RAIL_SCALE, SHINE_FROM, SHINE_TO, TOWER_LAYERS } from './StackTower';

import '@/app/d/toolchain/sections/darkband-v3.css';
import './fullstack.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type BeatIconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  'aria-hidden'?: boolean;
};

/**
 * One marketing layer of the stack: the spec's verbatim copy split at its
 * first sentence (the lead), plus the tower slabs it spotlights. Slab
 * membership is by TOWER_LAYERS id, never by index, so the mapping survives
 * any reordering of the house drawing.
 */
type StackBeat = {
  id: string;
  name: string;
  lead: string;
  body: string;
  icon: ComponentType<BeatIconProps>;
  slabIds: readonly string[];
};

/**
 * The four layers, VERBATIM from the Figma spec — ordered bottom-up per the
 * spec's own directive ("start from foundations in code and build up"):
 * Code -> Context -> Translations -> Agents. The tower is these same four
 * layers, one slab per beat, so beat order IS physical order.
 */
const BEATS: readonly StackBeat[] = [
  {
    id: 'code',
    name: 'Code',
    lead: 'Your codebase is the source of truth.',
    body: 'GT internationalizes it to support 120+ locales. Open-source internationalization (i18n) libraries with SDKs for every stack.',
    icon: Code2,
    slabIds: ['code'],
  },
  {
    id: 'context',
    name: 'Context',
    lead: 'Deliver the best experience of your product in every language.',
    body: 'GT translates with full understanding of your context. Define key product terms, tone, and style to keep consistent across every surface.',
    icon: Layers,
    slabIds: ['context'],
  },
  {
    id: 'translations',
    name: 'Translations',
    lead: 'See translations in every target locale, in just minutes.',
    body: 'Review both static and dynamic content before you go live. Preview, annotate, and approve from the Dashboard.',
    icon: Languages,
    slabIds: ['translations'],
  },
  {
    id: 'agents',
    name: 'Agents',
    lead: 'Automate the whole process.',
    body: 'Locadex keeps your app localized with every update. The Locadex agent is the fastest way to localize your app, end-to-end. Just merge a PR.',
    icon: Bot,
    slabIds: ['agents'],
  },
];

/** Each beat's slab set, resolved once to indices into the tower. */
const HOT_SLABS: readonly (readonly number[])[] = BEATS.map((beat) =>
  beat.slabIds
    .map((id) => TOWER_LAYERS.findIndex((layer) => layer.id === id))
    .filter((i) => i >= 0)
);

/**
 * How much of the tower EXISTS at each beat — the stack builds (founder:
 * "when we're on a level the ones on top should not be visible and they'll
 * come in"; round 10 reversed round 9's always-visible ghosts and brought
 * this back). With one slab per beat this is simply beat index + 1, but it
 * stays a running maximum over the beats' slab peaks so any future
 * regrouping keeps working by physical height.
 */
const VISIBLE_COUNT: readonly number[] = HOT_SLABS.reduce<number[]>((acc, hot, i) => {
  const peak = hot.length > 0 ? Math.max(...hot) + 1 : 0;
  acc.push(Math.max(peak, acc[i - 1] ?? 0));
  return acc;
}, []);

/**
 * The strokes of the tower's answer, in screen px. Hot slabs rise LIFT out
 * of the tower; any VISIBLE slab above the hot block would rise LIFT +
 * OPEN, opening the stack at the active layer — with one slab per beat the
 * hot slab is always the top of the built stack, so OPEN is dormant, kept
 * only so a future regrouping keeps working. Slabs that don't exist yet
 * park DROP above their seat at zero alpha and settle in when their beat
 * arrives. LIFT + OPEN stays under the figure's 42px top pad, so nothing
 * ever clips.
 */
const LIFT = 12;
const OPEN = 26;
const DROP = 64;

/**
 * V0 Full Stack — "The full stack for localization." — recomposed in the
 * toolchain dark-band grammar: tc-band tcb → tcb-in → tcb-head → tcb-grid,
 * the same sheet DarkBand draws its seams and surfaces from. The solid
 * four-slab tower — one slab per beat — sits in one tcb-cell (sticky while
 * the copy scrolls) and the four-layer copy rail in the other; the grid's
 * interior seam is killed in fullstack.css (founder: the two halves read
 * as one composition). Each beat's block owns a ScrollTrigger;
 * as it crosses the read line
 * the rail's spotlight moves to it and the tower answers twice over: the
 * stack BUILDS — only the slabs up to the beat's level exist, and the next
 * level settles in from above as the story advances (and leaves again on
 * the way back up) — and the beat's slab(s) take the tower's highest z,
 * lift up the iso vertical, and light their accent edge and leader, while
 * the rest stay solid but dimmer. One timeline per transition, never
 * pinned by JS (the figure is CSS sticky); the one JS hand on the figure
 * itself is the SETTLE below — a scroll-locked descent that lands the
 * tower on the column's floor as the band's bottom rule arrives, so the
 * rest view has no black run under the figure. Reduced motion and the
 * no-JS resting markup get the FULL stack with the first beat lit,
 * statically — four legible slabs over a truer-but-emptier one — with the
 * Locadex mark's shimmer band parked mid-glyph as a still.
 */
export default function V0FullStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const slabs = gsap.utils.toArray<HTMLElement>('[data-tower-slab]', scope);
      const beats = gsap.utils.toArray<HTMLElement>('[data-stack-beat]', scope);
      const taps = gsap.utils.toArray<SVGGElement>('[data-rail-tap]', scope);
      const rail = scope.querySelector<SVGGElement>('[data-rail-line]');
      const waves = gsap.utils.toArray<SVGPathElement>('[data-ctx-wave]', scope);
      const orbit = scope.querySelector<SVGPathElement>('[data-agent-orbit]');
      const stripes = gsap.utils.toArray<SVGRectElement>('[data-ldx-stripe]', scope);
      const stripes2 = gsap.utils.toArray<SVGRectElement>('[data-ldx-stripe2]', scope);
      if (slabs.length === 0 || beats.length === 0) return;

      /* how many slabs must exist for each ambient loop's plate */
      const ctxNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'context') + 1;
      const agentsNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'agents') + 1;

      /* class + stacking state, shared by both motion branches: hot slabs
         take full ink, the accent edge, and the tower's highest z — above
         even the slab overhead, so the whole plate reads when it pops. The
         hot plate's rail leader takes the accent with it. */
      const paint = (active: number) => {
        const hot = new Set(HOT_SLABS[active] ?? []);
        slabs.forEach((slab, i) => {
          slab.classList.toggle('is-hot', hot.has(i));
          slab.style.zIndex = String(hot.has(i) ? slabs.length + 1 + i : i + 1);
        });
        taps.forEach((tap, i) => tap.classList.toggle('is-hot', hot.has(i)));
        beats.forEach((beat, i) => {
          beat.classList.toggle('is-hot', i === active);
          beat.classList.toggle('is-cold', i !== active);
        });
      };

      const clear = () => {
        slabs.forEach((slab, i) => {
          slab.classList.remove('is-hot');
          slab.style.zIndex = String(i + 1);
          gsap.set(slab, { clearProps: 'y,opacity,visibility' });
        });
        for (const tap of taps) {
          tap.classList.remove('is-hot');
          gsap.set(tap, { clearProps: 'opacity,visibility,strokeDashoffset' });
        }
        if (rail) gsap.set(rail, { clearProps: 'transform' });
        for (const beat of beats) beat.classList.remove('is-hot', 'is-cold');
      };

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* which slabs exist right now — the build's one piece of state,
           so entering and leaving slabs can be staged differently */
        const shown = slabs.map(() => false);

        /* the ambient loops (founder round): context's accent waves ride
           their wires into the <T>, the agents plate's orbit trace
           circles its ring, and the Locadex mark's dithered specular
           bands sweep the glyph (StackTower builds the clip windows;
           these loops only slide them, holding the markup's 60° set) —
           each runs ONLY while its plate is built and the band is on
           screen, so nothing burns frames below the fold. Until first
           play they rest at the markup's static poses. autoRound: false
           on the dashes, and not as a nicety: GSAP's CSSPlugin
           integer-rounds every non-transform px-unit property per tick
           (CSSPlugin's _renderRoundedCSSProp), which froze the dash for
           ~4 frames then jumped it a whole pathLength unit — the stutter.
           Fractional offsets on the 1000-unit normalization move the dash
           a steady sub-pixel step every frame; linear ease (one wire ride
           per 2.8s, one orbit per 7s; the shimmer is a transform, which
           never quantizes). */
        let built = 0;
        let inView = false;
        const waveLoops = waves.map((wave, i) =>
          gsap.fromTo(
            wave,
            { strokeDashoffset: 1000 },
            {
              strokeDashoffset: 0,
              duration: 2.8,
              ease: 'none',
              repeat: -1,
              delay: i * 0.9,
              paused: true,
              autoRound: false,
            }
          )
        );
        const orbitLoop = orbit
          ? gsap.fromTo(
              orbit,
              { strokeDashoffset: 300 },
              {
                strokeDashoffset: -700,
                duration: 7,
                ease: 'none',
                repeat: -1,
                paused: true,
                autoRound: false,
              }
            )
          : null;
        /* the shimmer's lap runs the full derived travel at a constant
           ~56 units/s, so the band always enters from clear of the mark,
           crosses ALL of it, and exits past its right edge before the
           loop restarts (founder round 10: "make it cross the whole
           locadex all the way to the right") — the speed holds and the
           lap length breathes with the geometry */
        const shineLap = (SHINE_TO - SHINE_FROM) / 56;
        const shineBand = (targets: SVGRectElement[]) =>
          gsap.fromTo(
            targets,
            { rotation: 60, x: SHINE_FROM, transformOrigin: '50% 50%' },
            {
              rotation: 60,
              x: SHINE_TO,
              transformOrigin: '50% 50%',
              duration: shineLap,
              ease: 'none',
              repeat: -1,
              paused: true,
            }
          );
        const shineLoop = stripes.length > 0 ? shineBand(stripes) : null;
        /* the counter-sheen rides half a lap behind the primary (founder:
           the metal must read alive, never a texture between passes) —
           time(), not progress(): a repeat:-1 tween's total progress is
           unbounded, but the playhead time within one lap is exact */
        const shineLoop2 =
          stripes2.length > 0 ? shineBand(stripes2).time(shineLap / 2) : null;
        const shineLoops = [
          ...(shineLoop ? [shineLoop] : []),
          ...(shineLoop2 ? [shineLoop2] : []),
        ];
        const syncLoops = () => {
          const wavesOn = inView && built >= ctxNeed;
          for (const loop of waveLoops) {
            if (wavesOn) loop.play();
            else loop.pause();
          }
          const agentsOn = inView && built >= agentsNeed;
          if (orbitLoop) {
            if (agentsOn) orbitLoop.play();
            else orbitLoop.pause();
          }
          for (const loop of shineLoops) {
            if (agentsOn) loop.play();
            else loop.pause();
          }
        };

        /* the channel's ledger: the fill's current scaleY target, so beat
           01's ARRIVAL (the rise from the rail's empty foot) can be told
           apart from an ordinary between-beats move */
        let railAt = 0;

        /* One timeline per beat change coordinates the whole answer:
           slabs the beat brings in settle from DROP above their seat,
           bottom-up and staggered; slabs the beat removes (scrolling
           back) rise out; slabs that stay glide to their new seat (the
           lift, or the opening above the hot block). Every tween aims at
           an absolute target with overwrite, so a fast scrub through
           several windows just redirects mid-flight — no snap, no
           flicker. */
        const setActive = (active: number, instant: boolean) => {
          paint(active);
          const count = VISIBLE_COUNT[active] ?? slabs.length;
          built = count;
          syncLoops();
          const hot = HOT_SLABS[active] ?? [];
          const set = new Set(hot);
          const top = hot.length > 0 ? Math.max(...hot) : -1;

          /* is this the arrival — the fill rising from the rail's empty
             foot? Every tap then waits for the tip (founder round 8: the
             bend at the rail's tip must DRAW and CONNECT, never sit
             pre-drawn on the track). tipAt() inverts the rise's 1.0s
             power2.out to the moment the tip passes tap i, so each bend
             draws exactly as the blue arrives under it. */
          const rising = rail !== null && railAt === 0;
          const target = RAIL_SCALE[count - 1] ?? 1;
          const tipAt = (i: number) =>
            1 - Math.sqrt(Math.max(0, 1 - (RAIL_SCALE[i] ?? 1) / target));

          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          let entered = 0;
          slabs.forEach((slab, i) => {
            const visible = i < count;
            const seat = set.has(i) ? -LIFT : i > top ? -(LIFT + OPEN) : 0;
            const tap = taps[i];
            if (instant) {
              /* the instant path always parks the rail EMPTY, so visible
                 plates' taps park hidden on the RAIL side (−100): the
                 arrival draws each bend rail-outward as the tip passes,
                 instead of the fill rising into a pre-drawn corner */
              gsap.set(slab, { y: visible ? seat : seat - DROP, autoAlpha: visible ? 1 : 0 });
              if (tap) gsap.set(tap, { strokeDashoffset: visible ? -100 : 100 });
            } else if (visible && !shown[i]) {
              /* arriving: the plate drops in from above its seat,
                 bottom-up; once it settles, its tap DRAWS itself — out of
                 the layer, through the elbow, into the rail (founder) —
                 timed so the fill's tip has passed this tap before the
                 draw lands on it. autoRound off: rounded dash offsets
                 step, fractional ones glide (see the orbit's note). */
              const at = entered * 0.14;
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, at);
              if (tap) {
                tl.to(
                  tap,
                  { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', autoRound: false },
                  rising ? Math.max(at + 0.5, tipAt(i) - 0.1) : at + 0.5
                );
              }
              entered += 1;
            } else if (visible) {
              /* staying: glide to the new seat. The tap normalizes drawn
                 — parked at −100 it draws RAIL-OUTWARD (the bend turning
                 off the tip and connecting), and on the arrival that draw
                 waits for the tip to pass its tap point */
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 0);
              if (tap) {
                tl.to(
                  tap,
                  { strokeDashoffset: 0, duration: 0.3, autoRound: false },
                  rising ? tipAt(i) : 0
                );
              }
            } else {
              /* leaving: the tap retracts the reverse way — rail end
                 first, back into the layer — as the plate rises out */
              tl.to(slab, { y: seat - DROP, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0);
              if (tap) {
                tl.to(
                  tap,
                  { strokeDashoffset: 100, duration: 0.25, ease: 'power2.in', autoRound: false },
                  0
                );
              }
            }
            shown[i] = visible;
          });

          /* the rail's accent channel, inside the cell-height strokes.
             Born EMPTY (the instant path parks it at 0): beat 01's
             lock-in is what draws the arrival — the blue RISES from the
             rail's bottom end, decelerating into the code plate's tap —
             and because the rise and the build channel are one rect, the
             arrival hands off to the ordinary extend/retract moves with
             no seam. Even a deep link rises: the landing beat's trigger
             fires right after creation and finds the rail at 0. */
          if (rail) {
            if (instant) {
              gsap.set(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN });
              railAt = 0;
            } else {
              const scaleY = RAIL_SCALE[count - 1] ?? 1;
              /* the rise is 1.0s: entering taps park their draws at 0.8+
                 (above), so the fill's tip has passed every tap before
                 its leader's rail end lands */
              tl.to(
                rail,
                {
                  scaleY,
                  svgOrigin: RAIL_ORIGIN,
                  duration: rising ? 1.0 : 0.6,
                  ease: rising ? 'power2.out' : 'power2.inOut',
                },
                0
              );
              railAt = scaleY;
            }
          }
        };

        /* the story opens on its foundation: the code slab, alone, before
           any scroll — the rest of the stack builds in beat by beat */
        setActive(0, true);

        /* contiguous windows over one read line, with no dead zones: the
           first beat's window starts as the section enters and the last
           one's holds until it leaves, so even an instant jump (keyboard
           End, a fast fling) always lands inside exactly one window and
           the state can never go stale */
        /* scrolled back out above the band: the arrival reverses — the
           line retracts down the rail to its foot, ready to rise again on
           the next lock-in. Wired to BOTH exits that can pass the band's
           top: beat 01's window (the gradual scroll-up, while the figure
           is still partly on screen) and the view gate below (an instant
           jump from a deeper beat, which never re-toggles beat 01). */
        const retract = () => {
          if (!rail) return;
          const from = railAt;
          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          tl.to(
            rail,
            { scaleY: 0, svgOrigin: RAIL_ORIGIN, duration: 0.7, ease: 'power2.in' },
            0
          );
          /* the bends leave WITH the line (founder round 8, "the reverse
             on retract"): each still-shown tap collapses into the tip as
             it descends past — vertex end first, curling off through the
             elbow — never an orphan corner on the grey track. The timing
             inverts the 0.7s power2.in fall to the tip's pass. */
          taps.forEach((tap, i) => {
            if (!shown[i]) return;
            const down =
              from > 0 ? 0.7 * Math.sqrt(Math.max(0, 1 - (RAIL_SCALE[i] ?? 1) / from)) : 0;
            tl.to(
              tap,
              { strokeDashoffset: -100, duration: 0.25, ease: 'power1.in', autoRound: false },
              Math.max(0, down - 0.2)
            );
          });
          railAt = 0;
        };

        beats.forEach((beat, i) => {
          ScrollTrigger.create({
            trigger: beat,
            start: i === 0 ? 'top bottom' : 'top 58%',
            end: i === beats.length - 1 ? 'bottom top' : 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setActive(i, false);
              else if (i === 0 && self.progress === 0) retract();
            },
          });
        });

        /* the loops' viewport gate: everything ambient pauses the moment
           the band leaves the screen */
        const viewGate = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            inView = self.isActive;
            syncLoops();
            /* the jump exit: left upward without re-entering beat 01 */
            if (!self.isActive && self.progress === 0 && railAt > 0) retract();
          },
        });
        inView = viewGate.isActive;
        syncLoops();

        return () => {
          viewGate.kill();
          for (const loop of waveLoops) loop.kill();
          orbitLoop?.kill();
          for (const loop of shineLoops) loop.kill();
          const dashed: SVGPathElement[] = orbit ? [...waves, orbit] : [...waves];
          if (dashed.length > 0) gsap.set(dashed, { clearProps: 'strokeDashoffset' });
          const bands = [...stripes, ...stripes2];
          if (bands.length > 0) gsap.set(bands, { clearProps: 'transform' });
          clear();
        };
      });

      /* THE SETTLE (founder: "we literally need that black space gone").
         The seat centers the figure at ~50vh, so at the band's rest view
         — bottom rule at the viewport bottom — a pinned figure is stranded
         mid-viewport over a seat-sized black run (~197px at 900, ~286px
         at 1080; it grows with the display). No sticky geometry can close
         it: while pinned, the figure's bottom can never ride below
         seat + figure height. So the figure LANDS instead: across the
         finale's approach a scroll-locked translate carries it from the
         seat down to the column's floor, touching down exactly as the
         rule meets the viewport bottom; from touchdown it holds the floor
         doc-fixed — riding beside the finale copy — until the native
         sticky release takes over at the same velocity, so seated → riding
         has no jump. Descent is sine-eased (zero slope at both ends): it
         begins after beat 03's read completes and is ~85% down by beat
         04's lock-in — the founder trades that dwell for the void.
         Gated to the two-column, motion-allowed world: below 1021px the
         figure is static and needs no settle. */
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1021px)', () => {
        const fig = scope.querySelector<HTMLElement>('.v0-stack-fig');
        const figcol = scope.querySelector<HTMLElement>('.v0-stack-figcol');
        const finale = beats[beats.length - 1];
        if (!fig || !figcol || !finale) return;

        const setY = gsap.quickSetter(fig, 'y', 'px');

        /* THE SETTLE OWNS ITS MATH (founder: "step 4 works the same as
           steps 1–3" — and a debugging round proved ScrollTrigger's
           parsed start drifted from the intended read-passed moment, so
           the profile now runs on explicit doc-space landmarks and the
           trigger is only a lifecycle net). Landmarks, retaken on every
           refresh:
           S0   = beat 04's copy line (the finale window's center)
                  crossing 51% of the viewport — the 55% read line has
                  just passed, so the read itself always happens SEATED;
           REST = the band's rest view (bottom rule at the viewport
                  bottom) — touchdown, fig bottom on the column's floor;
           END  = REST + drop — the native sticky release meets the
                  unwound figure at the same point and velocity;
           drop = vh − tail − (seat + figH) — the landing depth. The
                  descent window REST − S0 is bought by the rail cell's
                  post-read runway (fullstack.css) — keep the two in
                  step: rate = drop / (REST − S0) must stay ≲ 1.2. */
        let S0 = 0;
        let REST = 0;
        let END = 1;
        let drop = 0;
        const measure = () => {
          const vh = window.innerHeight;
          const sy = window.scrollY;
          const seat = parseFloat(getComputedStyle(fig).top) || 0;
          /* offsetHeight, not a rect: the box height must be transform-free */
          const pinnedBottom = seat + fig.offsetHeight;
          const secBottom = scope.getBoundingClientRect().bottom + sy;
          const tail = secBottom - (figcol.getBoundingClientRect().bottom + sy);
          const fr = finale.getBoundingClientRect();
          const copyLine = fr.top + fr.height / 2 + sy;
          drop = Math.max(0, vh - tail - pinnedBottom);
          S0 = copyLine - 0.51 * vh;
          REST = secBottom - vh;
          END = REST + drop;
        };

        /* piecewise profile in scroll space: sine-in-out from the seat
           to the floor across [S0, REST], then a linear unwind across
           [REST, END] that holds the figure doc-fixed on the floor
           while the sticky box catches up; outside the window the seat
           (y = 0) owns the figure */
        const apply = () => {
          const sy = window.scrollY;
          if (drop <= 0 || sy <= S0 || sy >= END) {
            setY(0);
          } else if (sy <= REST) {
            const t = (sy - S0) / Math.max(REST - S0, 1);
            setY(drop * (0.5 - 0.5 * Math.cos(Math.PI * t)));
          } else {
            setY(drop * (1 - (sy - REST) / Math.max(drop, 1)));
          }
        };

        const settle = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: apply,
          onToggle: apply,
          onRefresh: () => {
            measure();
            apply();
          },
        });
        measure();
        apply();

        return () => {
          settle.kill();
          gsap.set(fig, { clearProps: 'y' });
        };
      });

      /* reduced motion: the FULL stack, statically — all four slabs are
         more legible than one when nothing will ever animate the rest in
         — with the first beat lit and its slab lifted, and the shimmer
         band resting at the markup's mid-glyph pose (nothing here ever
         touches the stripes) */
      mm.add('(prefers-reduced-motion: reduce)', () => {
        paint(0);
        const hot = new Set(HOT_SLABS[0] ?? []);
        slabs.forEach((slab, i) => {
          gsap.set(slab, { y: hot.has(i) ? -LIFT : 0, autoAlpha: 1 });
        });
        for (const tap of taps) gsap.set(tap, { strokeDashoffset: 0 });
        if (rail) gsap.set(rail, { scaleY: 1, svgOrigin: RAIL_ORIGIN });
        return clear;
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className='tc-band tcb v0-stack' id='platform' ref={root} aria-labelledby='v0-stack-title'>
      <div className='tcb-in'>
        <div className='tcb-head' data-cell>
          <h2 id='v0-stack-title' data-reveal>
            The full stack for localization.
          </h2>
        </div>

        <div className='tcb-grid'>
          {/* The drawing's cell: the solid four-slab tower, sticky while
              the copy rail beside it scrolls; the stack builds and the
              spotlight lifts each beat's slab in turn. Born with the first
              beat hot so the resting frame already tells the story. */}
          <div className='tcb-cell v0-stack-cell-fig' data-cell>
            {/* the rail itself: two 1px strokes spanning the COMPLETE
                height of the figure cell, top rule to bottom rule — the
                sticky figure's leaders and accent channel tap into it at
                whatever height they ride (founder: the rail must reach
                the column's top and bottom) */}
            <div className='v0s-cellrail' aria-hidden />
            <div className='v0-stack-figcol'>
              <div className='v0-stack-fig' data-reveal>
                <StackTower
                  hot={HOT_SLABS[0] ?? []}
                  title='The GT stack, built bottom-up: code, context, translations, and the Locadex agents layer'
                />
              </div>
            </div>
          </div>

          {/* The copy rail's cell: four beats read bottom-up — Code,
              Context, Translations, Agents — separated by rhythm alone.
              Beats 1–3 center their copy in their scroll windows; the
              LAST beat rides its window's floor (fullstack.css), so the
              band ends a breath after the finale instead of trailing
              the pin's runway as a black void. */}
          <div className='tcb-cell v0-stack-cell-rail' data-cell>
            <ol className='v0-stack-rail'>
              {BEATS.map((beat, i) => {
                const Icon = beat.icon;
                return (
                  <li
                    className={i === 0 ? 'v0-stack-beat is-hot' : 'v0-stack-beat is-cold'}
                    data-stack-beat={i}
                    data-reveal
                    key={beat.id}
                  >
                    <div className='v0-stack-tag'>
                      <Icon className='v0-stack-ic' size={16} strokeWidth={1.6} aria-hidden />
                      <span className='v0-stack-name'>{beat.name}</span>
                    </div>
                    <h3>{beat.lead}</h3>
                    <p>{beat.body}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
