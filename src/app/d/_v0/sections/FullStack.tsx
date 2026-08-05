'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';


import StackTower, { RAIL_ORIGIN, RAIL_SCALE, TOWER_LAYERS } from './StackTower';

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
 * come in"). With one slab per beat this is simply beat index + 1, but it
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
 * pinned by JS (the figure is CSS sticky). Reduced motion and the no-JS
 * resting markup get the FULL stack with the first beat lit, statically —
 * four legible slabs over a truer-but-emptier one.
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
           their wires into the <T>, and the agents plate's orbit trace
           circles its ring — each runs ONLY while its plate is built and
           the band is on screen, so nothing burns frames below the fold.
           Until first play they rest at the markup's static offsets.
           autoRound: false on both, and not as a nicety: GSAP's CSSPlugin
           integer-rounds every non-transform px-unit property per tick
           (CSSPlugin's _renderRoundedCSSProp), which froze the dash for
           ~4 frames then jumped it a whole pathLength unit — the stutter.
           Fractional offsets on the 1000-unit normalization move the dash
           a steady sub-pixel step every frame; linear ease, same lap
           times as before (one wire ride per 2.8s, one orbit per 7s). */
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
        const syncLoops = () => {
          const wavesOn = inView && built >= ctxNeed;
          for (const loop of waveLoops) {
            if (wavesOn) loop.play();
            else loop.pause();
          }
          if (orbitLoop) {
            if (inView && built >= agentsNeed) orbitLoop.play();
            else orbitLoop.pause();
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

          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          let entered = 0;
          slabs.forEach((slab, i) => {
            const visible = i < count;
            const seat = set.has(i) ? -LIFT : i > top ? -(LIFT + OPEN) : 0;
            const tap = taps[i];
            if (instant) {
              gsap.set(slab, { y: visible ? seat : seat - DROP, autoAlpha: visible ? 1 : 0 });
              if (tap) gsap.set(tap, { strokeDashoffset: visible ? 0 : 100 });
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
                  at + 0.5
                );
              }
              entered += 1;
            } else if (visible) {
              /* staying: glide to the new seat, tap normalized drawn */
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 0);
              if (tap) {
                tl.to(tap, { strokeDashoffset: 0, duration: 0.3, autoRound: false }, 0);
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
              const rising = railAt === 0;
              /* the rise is 1.0s, not longer: the deepest entering tap
                 draws at ~0.78–1.08, and the fill's tip must have passed
                 every tap before its leader's rail end lands */
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
          gsap.to(rail, {
            scaleY: 0,
            svgOrigin: RAIL_ORIGIN,
            duration: 0.7,
            ease: 'power2.in',
            overwrite: 'auto',
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
          const dashed: SVGPathElement[] = orbit ? [...waves, orbit] : [...waves];
          if (dashed.length > 0) gsap.set(dashed, { clearProps: 'strokeDashoffset' });
          clear();
        };
      });

      /* reduced motion: the FULL stack, statically — all four slabs are
         more legible than one when nothing will ever animate the rest in
         — with the first beat lit and its slab lifted */
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
