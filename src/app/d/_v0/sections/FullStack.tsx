'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';


import StackTower, { RAIL_ORIGIN, RAIL_SCALE, SHINE_SWEEP, TOWER_LAYERS } from './StackTower';

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
 * The strokes of the tower's answer, in screen px. The hot slab rises
 * LIFT out of the tower — into the 42-unit air above its plate, so
 * nothing ever collides — and every other slab sits its seat (founder
 * round 9: all four plates are always present; the beat only moves the
 * highlight). DROP is the one-time entrance's park: until the draw-in
 * plays, each plate waits DROP above its seat at zero alpha and settles
 * in bottom-up as the rail rises.
 */
const LIFT = 12;
const DROP = 64;

/**
 * V0 Full Stack — "The full stack for localization." — recomposed in the
 * toolchain dark-band grammar: tc-band tcb → tcb-in → tcb-head → tcb-grid,
 * the same sheet DarkBand draws its seams and surfaces from. The solid
 * four-slab tower — one slab per beat — sits in one tcb-cell (sticky while
 * the copy scrolls) and the four-layer copy rail in the other; the grid's
 * interior seam is killed in fullstack.css (founder: the two halves read
 * as one composition).
 *
 * The tower's choreography is two separate hands since founder round 9.
 * THE ENTRANCE — the draw — plays ONCE, as the figure column first
 * scrolls into view: the rail's accent rises from its foot to the top
 * tap, each bend curling off the tip as the blue arrives under it, while
 * the four plates settle in from above, bottom-up, their leaders drawing
 * out of their vertices into the fill. After that nothing is ever torn
 * down: no plate hides, the rail stays lit to the top plate, and
 * scrolling back through (or out of) the section leaves the drawn tower
 * standing. THE SPOTLIGHT — each beat's block owns a ScrollTrigger; as
 * it crosses the read line the copy rail's highlight moves and the
 * beat's slab(s) take the tower's highest z, lift up the iso vertical,
 * and take the full treatment — accent contour, lit artwork, full-voice
 * leader — while every other plate holds the subordinate ghost presence
 * fullstack.css paints (founder round 9: all four layers always visible,
 * the beat only chooses the hot one). One tween set per move, never
 * pinned by JS (the figure is CSS sticky); the one JS hand on the figure
 * itself is the SETTLE below — a scroll-locked descent that lands the
 * tower on the column's floor as the band's bottom rule arrives, so the
 * rest view has no black run under the figure. Reduced motion and the
 * no-JS resting markup get the full stack with the first beat lit,
 * statically, the shimmer band parked mid-glyph as a still.
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
      if (slabs.length === 0 || beats.length === 0) return;

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
        /* the spotlight's whole state: the active beat, whether the
           one-time entrance has drawn the tower, and whether the band is
           on screen (the ambient loops' gate) */
        let hotNow = 0;
        let entered = false;
        let inView = false;

        /* the ambient loops (founder round): context's accent waves ride
           their wires into the <T>, the agents plate's orbit trace
           circles its ring, and the Locadex mark's dithered specular
           band sweeps the glyph (StackTower builds the clip windows;
           this loop only slides them, holding the markup's 60° set).
           Every plate is always present once the tower has drawn, so all
           three run whenever the band is on screen — and rest at the
           markup's static poses until first play. autoRound: false on
           the dashes, and not as a nicety: GSAP's CSSPlugin
           integer-rounds every non-transform px-unit property per tick
           (CSSPlugin's _renderRoundedCSSProp), which froze the dash for
           ~4 frames then jumped it a whole pathLength unit — the stutter.
           Fractional offsets on the 1000-unit normalization move the dash
           a steady sub-pixel step every frame; linear ease (one wire ride
           per 2.8s, one orbit per 7s, one shimmer pass per 5.2s — the
           sweep is a transform, which never quantizes). */
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
        const shineLoop =
          stripes.length > 0
            ? gsap.fromTo(
                stripes,
                { rotation: 60, x: -SHINE_SWEEP, transformOrigin: '50% 50%' },
                {
                  rotation: 60,
                  x: SHINE_SWEEP,
                  transformOrigin: '50% 50%',
                  duration: 5.2,
                  ease: 'none',
                  repeat: -1,
                  paused: true,
                }
              )
            : null;
        const loops = [
          ...waveLoops,
          ...(orbitLoop ? [orbitLoop] : []),
          ...(shineLoop ? [shineLoop] : []),
        ];
        const syncLoops = () => {
          const on = inView && entered;
          for (const loop of loops) {
            if (on) loop.play();
            else loop.pause();
          }
        };

        /* the spotlight move — the ONLY scroll behavior after the
           entrance: repaint the classes and stacking, then glide every
           slab to its seat (the hot one lifts, the rest sit). Absolute
           targets with overwrite, so a fast scrub through several
           windows just redirects mid-flight — no snap, no flicker, and
           never a hide. Before the entrance it only repaints: the
           draw-in reads hotNow and seats everything itself. */
        const setHot = (active: number) => {
          hotNow = active;
          paint(active);
          if (!entered) return;
          const set = new Set(HOT_SLABS[active] ?? []);
          slabs.forEach((slab, i) => {
            gsap.to(slab, {
              y: set.has(i) ? -LIFT : 0,
              duration: 0.5,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          });
        };

        /* park the tower undrawn for the one-time entrance: plates DROP
           above their seats at zero alpha, taps parked on the RAIL side
           (−100, so the arrival draws each bend rail-outward as the tip
           passes, never into a pre-drawn corner), the rail fill empty */
        paint(0);
        gsap.set(slabs, { y: -DROP, autoAlpha: 0 });
        if (taps.length > 0) gsap.set(taps, { strokeDashoffset: -100 });
        if (rail) gsap.set(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN });

        /* THE ENTRANCE — the draw choreography, once per page view
           (founder round 9: the build is the section's arrival, not the
           scroll behavior). The rail's accent RISES from the rail's
           bottom end over 1.0s, decelerating into the top tap; tipAt()
           inverts that power2.out to the moment the tip passes tap i, so
           each bend draws exactly as the blue arrives under it (founder
           round 8: the bend at the rail's tip must DRAW and CONNECT,
           never sit pre-drawn on the track). The plates settle in from
           above, bottom-up and staggered, each leader drawing itself —
           out of the layer, through the elbow, into the rail (founder) —
           once its plate has landed AND the tip is past. autoRound off
           on the dashes: rounded offsets step, fractional ones glide
           (see the orbit's note). A beat crossed mid-draw only repaints
           (setHot guards on `entered`), so the final call reconciles
           the hot plate's lift. */
        const entrance = () => {
          if (entered) return;
          entered = true;
          syncLoops();
          const set = new Set(HOT_SLABS[hotNow] ?? []);
          const target = RAIL_SCALE[RAIL_SCALE.length - 1] ?? 1;
          const tipAt = (i: number) =>
            1 - Math.sqrt(Math.max(0, 1 - (RAIL_SCALE[i] ?? 1) / target));
          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          if (rail) {
            tl.to(
              rail,
              { scaleY: target, svgOrigin: RAIL_ORIGIN, duration: 1.0, ease: 'power2.out' },
              0
            );
          }
          slabs.forEach((slab, i) => {
            const at = i * 0.14;
            tl.to(
              slab,
              { y: set.has(i) ? -LIFT : 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
              at
            );
            const tap = taps[i];
            if (tap) {
              tl.to(
                tap,
                { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', autoRound: false },
                Math.max(at + 0.5, tipAt(i) - 0.1)
              );
            }
          });
          tl.call(() => setHot(hotNow));
        };

        /* the entrance's gate: the figure column's top entering the lower
           viewport — early enough that the draw is underway as the tower
           meets the reader, and ONCE for good: scrolling back through the
           section tears nothing down, and a deep jump past the band plays
           the draw on the way by, so returning finds the tower standing */
        const entry = ScrollTrigger.create({
          trigger: scope.querySelector('.v0-stack-figcol') ?? scope,
          start: 'top 80%',
          once: true,
          onEnter: entrance,
        });

        /* contiguous windows over one read line, with no dead zones: the
           first beat's window starts as the section enters and the last
           one's holds until it leaves, so even an instant jump (keyboard
           End, a fast fling) always lands inside exactly one window and
           the spotlight can never go stale */
        beats.forEach((beat, i) => {
          ScrollTrigger.create({
            trigger: beat,
            start: i === 0 ? 'top bottom' : 'top 58%',
            end: i === beats.length - 1 ? 'bottom top' : 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setHot(i);
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
          },
        });
        inView = viewGate.isActive;
        syncLoops();

        return () => {
          entry.kill();
          viewGate.kill();
          for (const loop of loops) loop.kill();
          const dashed: SVGPathElement[] = orbit ? [...waves, orbit] : [...waves];
          if (dashed.length > 0) gsap.set(dashed, { clearProps: 'strokeDashoffset' });
          if (stripes.length > 0) gsap.set(stripes, { clearProps: 'transform' });
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

        /* the settle's ledger, retaken on every refresh (all terms are
           doc-space differences, so the current scroll never leaks in):
           drop   = vh − tail − (seat + figH) — the landing depth, and
                    ALSO the ride-out's scroll length, because touchdown
                    happens exactly at the rest view
           landAt = the descent's share of the trigger's full range */
        let drop = 0;
        let landAt = 1;
        const measure = () => {
          const vh = window.innerHeight;
          const seat = parseFloat(getComputedStyle(fig).top) || 0;
          /* offsetHeight, not a rect: the box height must be transform-free */
          const pinnedBottom = seat + fig.offsetHeight;
          const secBottom = scope.getBoundingClientRect().bottom;
          const tail = secBottom - figcol.getBoundingClientRect().bottom;
          drop = Math.max(0, vh - tail - pinnedBottom);
          /* descent range: from the finale window's top at 85vh down to
             the rest view (rule at the viewport bottom) */
          const approach = Math.max(1, secBottom - finale.getBoundingClientRect().top - 0.15 * vh);
          landAt = approach / (approach + drop || 1);
        };

        /* piecewise profile over the trigger's progress: sine-in-out to
           the floor, then a linear 1:1 unwind that holds the figure
           doc-fixed on the floor while the sticky box catches up */
        const apply = (p: number) => {
          if (drop <= 0) {
            setY(0);
          } else if (p <= landAt) {
            const t = landAt > 0 ? p / landAt : 1;
            setY(drop * (0.5 - 0.5 * Math.cos(Math.PI * t)));
          } else {
            setY(drop * (1 - (p - landAt) / Math.max(1 - landAt, 0.0001)));
          }
        };

        const settle = ScrollTrigger.create({
          trigger: finale,
          start: 'top 85%',
          endTrigger: scope,
          /* the native release: column bottom meets the pinned figure's
             bottom, `drop` px of scroll past the rest view */
          end: () => {
            measure();
            return `bottom bottom-=${drop}`;
          },
          onUpdate: (self) => apply(self.progress),
          onToggle: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });

        return () => {
          settle.kill();
          gsap.set(fig, { clearProps: 'y' });
        };
      });

      /* reduced motion: the full stack, statically — all four plates at
         their seats, the first beat lit and its slab lifted, the rail
         filled, and the shimmer band resting at the markup's mid-glyph
         pose (nothing here ever touches the stripes) */
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
              the copy rail beside it scrolls; the tower draws in once as
              it arrives and the spotlight lifts each beat's slab in turn.
              Born with the first beat hot so the resting frame already
              tells the story. */}
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
