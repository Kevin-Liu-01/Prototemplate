'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';

import GtLogoText from '@/app/d/_v0/GtLogoText';

import StackTower, {
  beamAt,
  RAIL_ORIGIN,
  RAIL_SCALE,
  SHINE_FROM,
  SHINE_TO,
  TOWER_LAYERS,
} from './StackTower';

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
 * The agents tag's icon: the Locadex mark itself, never a stock bot glyph
 * (founder) — the brand asset as an alpha mask over currentColor, the head
 * watermark's treatment (locadex.css) at tag scale, so it takes the tag's
 * accent exactly like the lucide icons do. Same lucide contract — size in,
 * square box out — and fullstack.css scales the mask so the GLYPH spans
 * the box, not the asset's padded canvas.
 */
function LocadexMark({ size = 16, className, 'aria-hidden': ariaHidden }: BeatIconProps) {
  return (
    <span
      className={className ? `v0-stack-ldx ${className}` : 'v0-stack-ldx'}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden}
    />
  );
}

/**
 * One marketing layer of the stack, in the founder's four-part grammar:
 * the eyebrow tag (icon + NAME), the h3 value prop, then the description
 * and details as scannable BULLET POINTS (founder: "we can use bullet
 * points instead of paragraphs basically for the new copy"). The points
 * are ReactNodes, not strings, so the copy can carry the inline brand
 * token (GtLogoText — founder: "anywhere we say GT, replace that with a
 * standardized gtlogotext component") and the <T> code chip. Slab
 * membership is by TOWER_LAYERS id, never by index, so the mapping
 * survives any reordering of the house drawing.
 */
type StackBeat = {
  id: string;
  name: string;
  lead: string;
  points: readonly ReactNode[];
  icon: ComponentType<BeatIconProps>;
  slabIds: readonly string[];
};

/**
 * The four layers, copy VERBATIM from the founder's round — ordered
 * bottom-up per the spec's own directive ("start from foundations in code
 * and build up"): Code -> Context -> Translations -> Agents. The tower is
 * these same four layers, one slab per beat, so beat order IS physical
 * order. Every prose "GT" is the brand token; the <T> in the code beat is
 * an inline code chip.
 */
const BEATS: readonly StackBeat[] = [
  {
    id: 'code',
    name: 'Code',
    lead: 'Your code is the source of truth.',
    points: [
      <>
        Tag user interfaces, and they’re ready to ship in 120+ locales. No
        translation files needed.
      </>,
      'Open-source internationalization (i18n) libraries and SDKs for every framework.',
    ],
    icon: Code2,
    slabIds: ['code'],
  },
  {
    id: 'context',
    name: 'Context',
    lead: 'The best experience of your product.',
    points: [
      <>
        <GtLogoText /> keeps your terminology, voice, and style consistent across every surface
        and language.
      </>,
      <>
        Define key product terms, brand voice, and style once. <GtLogoText /> applies them
        everywhere it translates: app, website, documentation, slides.
      </>,
    ],
    icon: Layers,
    slabIds: ['context'],
  },
  {
    id: 'translations',
    name: 'Translations',
    lead: 'Translations that just work.',
    points: [
      <>
        See your content and components translated in just minutes. <GtLogoText /> handles
        dynamic content and user inputs.
      </>,
      <>Built-in components for numbers, currencies, dates, plurals, and more.</>,
    ],
    icon: Languages,
    slabIds: ['translations'],
  },
  {
    id: 'agents',
    name: 'Agents',
    lead: 'Automate it.',
    points: [
      <>Locadex keeps your app localized with every update. Just merge a PR.</>,
      <>
        The Locadex agent internationalizes your system end to end, then keeps every surface
        localized as your code changes.
      </>,
    ],
    icon: LocadexMark,
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
 * The pen-stroke chain's tempo (founder: each beat must read as ONE
 * continuous stroke — "blue line comes up; as soon as blue line is done,
 * the connector comes out of the blue line into code"). RAIL_RISE is the
 * arrival's haul up from the rail's empty foot; RAIL_HOP is one beat's
 * segment between junctions; BEND_DRAW/BEND_FOLD are the connector
 * leaving/rejoining the landed tip. The chain is STRICTLY SERIALIZED —
 * a bend never starts before its segment completes and the rail never
 * moves under a drawing bend — so these also set each beat's total
 * answer time (hop + draw ≈ 0.9s).
 */
const RAIL_RISE = 1.0;
const RAIL_HOP = 0.6;
const BEND_DRAW = 0.3;
const BEND_FOLD = 0.25;

/**
 * THE MOBILE STAGE's cut (founder: on phones the story band read as a
 * plain text list with the diagram off screen — "you see the diagram on
 * top, 60% available height, and it's growing — and see the text for it
 * at bottom, 40% available height … the text just fades in and out of
 * each other with the layers growing"). The width is the band's own
 * one-column cut (fullstack.css's 1020px media); the height floor keeps
 * the 40% text zone tall enough for the longest beat at the tightened
 * stage type — shorter viewports keep the one-column flow, which never
 * clips copy. fullstack.css keys the stage relayout on BOTH this exact
 * query and the .is-stage class the staged branch sets, so the CSS
 * layout and the JS choreography can never disagree; reduced motion
 * never sets the class, so it keeps the static flow too.
 */
const STAGE_MEDIA = '(max-width: 1020px) and (min-height: 640px)';

/**
 * gsap.matchMedia conditions: one callback owns every motion regime, so
 * the desktop machinery and the staged mobile scrub share the loops,
 * the build (setActive), and the viewport gate instead of forking into
 * two systems — the branches differ only in what DRIVES the beats.
 */
const STAGE_SPLIT = {
  motion: '(prefers-reduced-motion: no-preference)',
  stage: STAGE_MEDIA,
} as const;

/** The staged drop: the stage's fig zone reserves only this much
    headroom above the tower (the --v0sm-tw budget in fullstack.css
    subtracts pads + this + a breath), so an arriving plate's whole fall
    happens INSIDE the clipping cell — the desktop's 64px fall has
    hundreds of px of cell above it during the pin, the stage does not. */
const STAGE_DROP = 32;

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
 * the rest stay solid but dimmer. On the agents beat the capstone also
 * hangs its scan beam down onto the translations plate and sweeps it —
 * the Locadex iso's device, ported (founder: "when we get to this layer,
 * we can have it start 'scanning' the below layer"). One timeline per
 * transition, never pinned by JS (the figure is CSS sticky) — and NO JS
 * touches the figure at all (founder: "the diagram keeps moving down as
 * i scroll past agents, which is wrong"): the figure holds its read-line
 * seat through beat 04's lock-in and then through the rail cell's
 * post-read runway — the AGENTS DWELL, where the scan beam is the show —
 * before the native sticky release carries it up and out with the band
 * (founder: "stay on agents a lil longer as we scroll to show the
 * scanning ... and then be able to see next section"). The figure never
 * translates down. Reduced motion and the no-JS resting markup get the
 * FULL stack with the first beat lit, statically — four legible slabs
 * over a truer-but-emptier one — with the Locadex mark's shimmer band
 * parked mid-glyph as a still and the beam hidden.
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
      const codeWrap = scope.querySelector<SVGPathElement>('[data-code-wrap]');
      const fanPulses = gsap.utils.toArray<SVGPathElement>('[data-fan-pulse]', scope);
      const orbit = scope.querySelector<SVGPathElement>('[data-agent-orbit]');
      const stripes = gsap.utils.toArray<SVGPathElement>('[data-ldx-stripe]', scope);
      const stripes2 = gsap.utils.toArray<SVGPathElement>('[data-ldx-stripe2]', scope);
      const scan = scope.querySelector<SVGGElement>('[data-agents-scan]');
      const scanSweep = scope.querySelector<SVGGElement>('[data-agents-sweep]');
      const capDiffs = gsap.utils.toArray<SVGGElement>('[data-cap-diff]', scope);
      const capWires = gsap.utils.toArray<SVGPathElement>('[data-cap-wire]', scope);
      if (slabs.length === 0 || beats.length === 0) return;

      /* how many slabs must exist for each ambient loop's plate */
      const codeNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'code') + 1;
      const ctxNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'context') + 1;
      const transNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'translations') + 1;
      const agentsNeed = TOWER_LAYERS.findIndex((layer) => layer.id === 'agents') + 1;
      /* the scan beam answers the STORY, not the build: it hangs only
         while the agents BEAT is the hot one (founder: "when we get to
         this layer, we can have it start 'scanning' the below layer") */
      const agentsBeat = BEATS.findIndex((beat) => beat.id === 'agents');

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

      mm.add(STAGE_SPLIT, (mctx) => {
        /* reduced motion is its own add below — this callback is the
           no-preference machinery, at phone and desktop widths alike */
        if (!mctx.conditions?.motion) return;
        const staged = !!mctx.conditions?.stage;
        /* the one shared constant the stage narrows: see STAGE_DROP */
        const dropBy = staged ? STAGE_DROP : DROP;
        /* which slabs exist right now — the build's one piece of state,
           so entering and leaving slabs can be staged differently */
        const shown = slabs.map(() => false);

        /* the ambient loops (founder round): context's accent waves ride
           their wires into the <T>, the agents plate's orbit trace
           circles its ring, and the Locadex mark's dithered specular
           bands sweep the glyph (StackTower builds the clip windows
           with the 60° set baked into their geometry; these loops only
           slide them horizontally) — each runs ONLY while its plate is
           built and the band is on screen, so nothing burns frames
           below the fold. Until first
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
        let hotBeat = 0;
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
        /* the code plate's wrap glint: one accent segment lapping the
           component boundary — the agents orbit's device at block scale */
        const wrapLoop = codeWrap
          ? gsap.fromTo(
              codeWrap,
              { strokeDashoffset: 210 },
              {
                strokeDashoffset: -790,
                duration: 6,
                ease: 'none',
                repeat: -1,
                paused: true,
                autoRound: false,
              }
            )
          : null;
        /* the translations fan's delivery pulses: the waves' ride, source
           string OUTWARD to each locale run */
        const fanLoops = fanPulses.map((pulse, i) =>
          gsap.fromTo(
            pulse,
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
        /* the glints' loop starts from the markup's parked pose (offset
           180, each dash centered mid-edge) and travels one whole
           normalized lap — four pattern periods of the '110 140' dashes,
           so the wrap is seamless */
        const orbitLoop = orbit
          ? gsap.fromTo(
              orbit,
              { strokeDashoffset: 180 },
              {
                strokeDashoffset: -820,
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
           lap length breathes with the geometry. A PURE x translate:
           the windows' 60° set is baked into their path geometry
           (StackTower.shineWindow), because rotating them here proved
           origin-fragile — GSAP's SVG origin compensation shifted the
           whole sweep ~180 units off the mark. */
        const shineLap = (SHINE_TO - SHINE_FROM) / 56;
        const shineBand = (targets: SVGPathElement[]) =>
          gsap.fromTo(
            targets,
            { x: SHINE_FROM },
            {
              x: SHINE_TO,
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
        /* the agents scan beam: the Locadex iso's sweep (v0-ldx-beam),
           ported to the tower — the sheet hangs from the capstone's
           underside to the translations plate's top face (StackTower
           draws it in its own seated layer between those two slabs) and
           sweeps along world +y, which projects to the constant screen
           vector (−cos30, +sin30) per unit, so the whole pass is one x/y
           transform tween (transforms never quantize — no autoRound
           needed). It rides the founder's dwell: the beat stays hot and
           the tower seated through the post-read runway, so this IS what
           the dwell shows. 2.5s a pass, quicker than the iso's 3.6
           (founder: "make it go up and down a little more than it
           currently is, and a lil faster" — the amplitude lives in
           StackTower's BEAM_SWEEP_Y). */
        /* the trapezoid LEANS through the pass (founder: the Locadex
           cone's grammar): one dial drives all four paths through
           StackTower's beamAt — the aperture pivots under the capstone
           while the land line runs the plate */
        const sweepPaths = scanSweep
          ? {
              body: scanSweep.querySelector<SVGPathElement>('.v0s-beam'),
              edges: scanSweep.querySelectorAll<SVGPathElement>('.v0s-beam-edge'),
              land: scanSweep.querySelector<SVGPathElement>('.v0s-beam-land'),
            }
          : null;
        const sweepDial = { t: 1 };
        const setSweep = () => {
          if (!sweepPaths) return;
          const g = beamAt(sweepDial.t);
          sweepPaths.body?.setAttribute('d', g.quad);
          sweepPaths.edges[0]?.setAttribute('d', g.edgeL);
          sweepPaths.edges[1]?.setAttribute('d', g.edgeR);
          sweepPaths.land?.setAttribute('d', g.land);
        };
        const sweepLoop = scanSweep
          ? gsap.fromTo(sweepDial, { t: 1 }, {
              t: -1,
              duration: 2.5,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              paused: true,
              onUpdate: setSweep,
            })
          : null;
        /* the beam's shown/hidden ledger, so repeated syncs never restart
           a fade mid-flight */
        let scanShown = false;
        const syncLoops = () => {
          const codeOn = inView && built >= codeNeed;
          if (wrapLoop) {
            if (codeOn) wrapLoop.play();
            else wrapLoop.pause();
          }
          const wavesOn = inView && built >= ctxNeed;
          for (const loop of waveLoops) {
            if (wavesOn) loop.play();
            else loop.pause();
          }
          const transOn = inView && built >= transNeed;
          for (const loop of fanLoops) {
            if (transOn) loop.play();
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
          /* the beam is gated a step tighter than the plate loops: the
             agents beat must be the HOT one (not merely built) and the
             band on screen. It fades in only after the capstone's 0.5s
             lift has landed, so the sheet never shears against a moving
             underside; going cold it fades fast and pauses the sweep
             once hidden. CSS parks it hidden for no-JS and reduced
             motion. */
          const scanOn = agentsOn && hotBeat === agentsBeat;
          if (scan && sweepLoop && scanOn !== scanShown) {
            scanShown = scanOn;
            /* EVERY transition clears the sheet's slate first: a rapid
               up-and-down story scrub stacks delayed risers, running
               fade-outs and their pause callbacks in every order, and
               any survivor is a ghost sheet (or a frozen sweep) later */
            gsap.killTweensOf(scan);
            if (scanOn) {
              const riser = gsap.to(scan, {
                autoAlpha: 1,
                duration: 0.35,
                delay: 0.45,
                ease: 'power2.out',
                /* the gate is RE-READ the instant the delayed riser
                   actually fires — whatever slipped through the ledger
                   during the delay, the sheet can never rise cold; and
                   the sweep starts only WITH the visible sheet, so a
                   stale pause can never freeze a lit sheet */
                onStart: () => {
                  if (!(inView && built >= agentsNeed && hotBeat === agentsBeat)) {
                    riser.kill();
                    gsap.set(scan, { autoAlpha: 0 });
                    sweepLoop.pause();
                    return;
                  }
                  sweepLoop.play();
                },
              });
            } else {
              gsap.to(scan, {
                autoAlpha: 0,
                duration: 0.22,
                delay: 0,
                ease: 'power2.in',
                onComplete: () => sweepLoop.pause(),
              });
            }
          }
        };

        /* the channel's ledger: 0 means the rail rests EMPTY — the
           arrival hasn't drawn yet, or retract() has drained it — which
           is what the view gate keys the staged arrival and the jump
           exit off; any built state records the current goal scale */
        let railAt = 0;
        /* the chain in flight: each beat change kills the previous chain
           outright and re-derives from wherever the stroke actually is
           (the fill's current scale, each bend's current offset) — a
           stale chain's QUEUED links must never fire under the new one,
           and overwrite-on-start alone cannot stop links that haven't
           started yet */
        let flight: gsap.core.Timeline | null = null;

        /* One timeline per beat change coordinates the whole answer as a
           PEN-STROKE CHAIN (founder: "blue line comes up; as soon as
           blue line is done, the connector comes out of the blue line
           into code" — one continuous stroke per beat, never two
           disjoint things). Advancing: the beat's rail segment rises
           FIRST, and the bend starts the INSTANT the tip lands — drawn
           rail-outward from the exact junction (the bend's stub lies ON
           the fill at the rail's own x and gauge, so the joint is
           pixel-seamless) — one stroke running up the rail, turning, and
           entering the plate. The plate itself settles during its
           segment, so the bend always enters a seated surface. Receding
           reverses the same chain: the bend folds back into the tip,
           THEN the segment descends. STRICTLY SERIALIZED both ways — no
           bend before its segment completes, no rail motion under a
           drawing bend, no gap between the two — and every link aims at
           an absolute target, so a fast scrub just rebuilds the chain
           mid-flight from the stroke's actual position. */
        const setActive = (active: number, instant: boolean) => {
          paint(active);
          const count = VISIBLE_COUNT[active] ?? slabs.length;
          built = count;
          hotBeat = active;
          syncLoops();
          const hot = HOT_SLABS[active] ?? [];
          const set = new Set(hot);
          const top = hot.length > 0 ? Math.max(...hot) : -1;
          const seatOf = (i: number) => (set.has(i) ? -LIFT : i > top ? -(LIFT + OPEN) : 0);
          /* a bend's dash offset right now: 0 = threaded into its plate,
             −100 = folded into the rail, between = mid-stroke */
          const bendAt = (tap: SVGGElement) => Number(gsap.getProperty(tap, 'strokeDashoffset'));

          flight?.kill();

          if (instant) {
            /* the instant path always parks the rail EMPTY and every
               bend FOLDED at its rail side (−100), so the arrival draws
               the whole chain in sequence — never a pre-drawn corner
               waiting on the grey track for the fill to reach it */
            slabs.forEach((slab, i) => {
              const visible = i < count;
              gsap.set(slab, {
                y: visible ? seatOf(i) : seatOf(i) - dropBy,
                autoAlpha: visible ? 1 : 0,
              });
              const tap = taps[i];
              if (tap) gsap.set(tap, { strokeDashoffset: -100 });
              shown[i] = visible;
            });
            if (rail) gsap.set(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN });
            flight = null;
            railAt = 0;
            return;
          }

          const goal = RAIL_SCALE[count - 1] ?? 1;
          /* where the stroke actually is right now — a redirect chains
             on from here, never from the last call's target */
          const from = rail ? Number(gsap.getProperty(rail, 'scaleY')) : goal;
          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          flight = tl;
          /* the chain's clock, and the tip's last landing */
          let pos = 0;
          let cursor = from;

          if (goal >= from - 1e-4) {
            /* ADVANCING, bottom-up: every visible beat whose bend is
               still folded is a chain stop — the segment rises to its
               junction, lands, and only then the bend continues out of
               the tip into the plate. Beat 01's arrival is simply the
               first link, rising from the empty foot (even a deep link
               rises: the landing beat's trigger fires right after
               creation and finds the rail at 0, and the whole chain
               plays through, beat by beat). The rise and the build
               channel are one rect, so arrival and hops share the seam-
               free fill. */
            slabs.forEach((slab, i) => {
              if (i >= count) return;
              const entering = !shown[i];
              const tap = taps[i];
              const folded = tap ? Math.abs(bendAt(tap)) > 0.5 : false;
              if (rail && tap && folded) {
                const stop = RAIL_SCALE[i] ?? goal;
                /* the arrival's haul decelerates up from the empty foot;
                   ordinary hops ease out of and into a landing */
                const haul = cursor <= 1e-3;
                const segDur = Math.abs(stop - cursor) < 1e-4 ? 0 : haul ? RAIL_RISE : RAIL_HOP;
                if (segDur > 0) {
                  tl.to(
                    rail,
                    {
                      scaleY: stop,
                      svgOrigin: RAIL_ORIGIN,
                      duration: segDur,
                      ease: haul ? 'power2.out' : 'power2.inOut',
                    },
                    pos
                  );
                }
                /* the plate settles DURING its segment (its 0.5s drop is
                   shorter than any segment, so it is seated before the
                   bend enters it); a staying plate glides from the
                   chain's start */
                tl.to(
                  slab,
                  {
                    y: seatOf(i),
                    autoAlpha: 1,
                    duration: entering ? 0.5 : 0.55,
                    ease: entering ? 'power2.out' : 'power3.out',
                  },
                  entering ? pos : 0
                );
                pos += segDur;
                /* the bend: out of the landed tip, into the plate — no
                   gap, no overlap. autoRound off: rounded dash offsets
                   step, fractional ones glide (see the orbit's note) */
                tl.to(
                  tap,
                  { strokeDashoffset: 0, duration: BEND_DRAW, ease: 'power2.out', autoRound: false },
                  pos
                );
                pos += BEND_DRAW;
                cursor = stop;
              } else {
                /* already threaded: just glide to the beat's new seat */
                tl.to(
                  slab,
                  {
                    y: seatOf(i),
                    autoAlpha: 1,
                    duration: entering ? 0.5 : 0.55,
                    ease: entering ? 'power2.out' : 'power3.out',
                  },
                  0
                );
                /* no rail in the markup (degenerate): the bend still has
                   to reach its drawn state once the plate has seated */
                if (!rail && tap && folded) {
                  tl.to(
                    tap,
                    { strokeDashoffset: 0, duration: BEND_DRAW, ease: 'power2.out', autoRound: false },
                    0.5
                  );
                }
              }
              shown[i] = true;
            });
            /* crossfire only — a forward redirect catching plates mid-
               teardown above the new count: their junctions sit above
               the goal, so fold the bends and let the plates rise out in
               parallel with the chain below */
            slabs.forEach((slab, i) => {
              if (i < count || !shown[i]) return;
              const tap = taps[i];
              if (tap && bendAt(tap) > -99.5) {
                tl.to(
                  tap,
                  { strokeDashoffset: -100, duration: BEND_FOLD, ease: 'power1.in', autoRound: false },
                  0
                );
              }
              tl.to(
                slab,
                { y: seatOf(i) - dropBy, autoAlpha: 0, duration: 0.35, ease: 'power2.in' },
                BEND_FOLD
              );
              shown[i] = false;
            });
          } else {
            /* RECEDING, top-down — the same chain read backward, beat by
               beat (founder: scroll-back reverses the stroke): the bend
               folds back into the tip FIRST, and only then does the
               segment descend to the junction below, the plate rising
               out alongside the descent — never an orphan corner on the
               grey track, never a bend under a moving rail */
            for (let i = slabs.length - 1; i >= count; i -= 1) {
              const slab = slabs[i];
              const tap = taps[i];
              if (slab && shown[i]) {
                if (tap && bendAt(tap) > -99.5) {
                  tl.to(
                    tap,
                    {
                      strokeDashoffset: -100,
                      duration: BEND_FOLD,
                      ease: 'power1.in',
                      autoRound: false,
                    },
                    pos
                  );
                  pos += BEND_FOLD;
                }
                tl.to(
                  slab,
                  { y: seatOf(i) - dropBy, autoAlpha: 0, duration: 0.35, ease: 'power2.in' },
                  pos
                );
                if (rail) {
                  const stop = RAIL_SCALE[i - 1] ?? 0;
                  if (Math.abs(stop - cursor) > 1e-4) {
                    tl.to(
                      rail,
                      {
                        scaleY: stop,
                        svgOrigin: RAIL_ORIGIN,
                        duration: RAIL_HOP,
                        ease: 'power2.inOut',
                      },
                      pos
                    );
                    pos += RAIL_HOP;
                    cursor = stop;
                  }
                }
              }
              shown[i] = false;
            }
            /* the beats that stay glide to their new seats; a bend a
               redirect left folded re-threads only after the chain's
               rail motion has ended (its junction is inside the fill) */
            slabs.forEach((slab, i) => {
              if (i >= count) return;
              tl.to(slab, { y: seatOf(i), autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 0);
              const tap = taps[i];
              if (tap && Math.abs(bendAt(tap)) > 0.5) {
                tl.to(
                  tap,
                  { strokeDashoffset: 0, duration: BEND_DRAW, ease: 'power2.out', autoRound: false },
                  pos
                );
              }
              shown[i] = true;
            });
          }

          /* the tip's last leg, when no stop carried it to the goal (a
             redirect that left the rail short of an already-threaded
             junction) — scheduled after every bend, never under one */
          if (rail && Math.abs(goal - cursor) > 1e-4) {
            tl.to(
              rail,
              { scaleY: goal, svgOrigin: RAIL_ORIGIN, duration: RAIL_HOP, ease: 'power2.inOut' },
              pos
            );
          }
          railAt = goal;
        };

        /* the story opens on its foundation: the code slab, alone, before
           any scroll — the rest of the stack builds in beat by beat */
        setActive(0, true);

        /* contiguous windows over one read line, with no dead zones: the
           first beat's window starts as the section enters and the last
           one's holds until it leaves, so even an instant jump (keyboard
           End, a fast fling) always lands inside exactly one window and
           the state can never go stale */
        /* scrolled back out above the band: the arrival reverses as the
           SAME chain read backward — each threaded bend folds into the
           tip FIRST, then the rail descends to the junction below and
           folds there too, and after the lowest bend the line dives off
           its empty foot, ready to rise again on the next lock-in. The
           plates stay; only the blue leaves. Serialized like every other
           chain: no rail motion under a folding bend. Wired to BOTH
           exits that can pass the band's top: beat 01's window (the
           gradual scroll-up, while the figure is still partly on screen)
           and the view gate below (an instant jump from a deeper beat,
           which never re-toggles beat 01). */
        const retract = () => {
          if (!rail) return;
          flight?.kill();
          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
          flight = tl;
          let pos = 0;
          for (let i = taps.length - 1; i >= 0; i -= 1) {
            /* unthreaded rows have nothing to fold */
            if (!shown[i]) continue;
            const tap = taps[i];
            if (tap && Number(gsap.getProperty(tap, 'strokeDashoffset')) > -99.5) {
              tl.to(
                tap,
                { strokeDashoffset: -100, duration: BEND_FOLD, ease: 'power1.in', autoRound: false },
                pos
              );
              pos += BEND_FOLD;
            }
            if (i > 0 && shown[i - 1]) {
              /* descend to the next threaded junction — a step quicker
                 than the story's hops; the drain plays at the band's
                 edge, not under the read line */
              tl.to(
                rail,
                { scaleY: RAIL_SCALE[i - 1] ?? 0, svgOrigin: RAIL_ORIGIN, duration: 0.4, ease: 'power2.inOut' },
                pos
              );
              pos += 0.4;
            }
          }
          /* the last dive: down the track and off the empty foot */
          tl.to(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN, duration: 0.7, ease: 'power2.in' }, pos);
          railAt = 0;
        };

        /* the capstone's diff hunk, GENERATED BY SCROLL (founder: "a
           bunch of diffs being generated as we scroll on it"): a scrubbed
           timeline, not a free-running loop — from beat 04's lock-in to
           the band's rest view the hunk grows slat by slat (deepest into
           the dwell = most slats) and scroll-back regenerates it in
           reverse. The slats live inside the capstone's slab SVG, so the
           build's own alpha hides them until the capstone exists. The
           timeline is built here, once for both regimes; what scrubs it
           differs — desktop hangs it on beat 04's window below, the
           stage drives its progress from the master scrub's agents
           segment. */
        const capTl = capDiffs.length > 0 ? gsap.timeline({ paused: true }) : null;
        if (capTl) {
          capDiffs.forEach((slat, i) => {
            /* the write wire leads its slat: the hairline draws OUT of
               the mark's chip first, then the diff lands at its far end
               — the agent visibly writing each line (founder). Scrubbed,
               so scroll-back unwrites in reverse. */
            const wire = capWires[i];
            if (wire) {
              capTl.fromTo(
                wire,
                { strokeDashoffset: 100 },
                { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut', autoRound: false },
                i * 0.8
              );
            }
            capTl.fromTo(
              slat,
              { autoAlpha: 0, y: -6 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
              i * 0.8 + 0.3
            );
          });
        }

        if (!staged) {
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

          if (capTl) {
            ScrollTrigger.create({
              animation: capTl,
              trigger: beats[beats.length - 1],
              start: 'top 58%',
              endTrigger: scope,
              end: 'bottom bottom',
              scrub: 0.35,
            });
          }
        } else {
          /* ===== THE MOBILE STAGE (founder: "you see the diagram on
             top, 60% available height, and it's growing — and see the
             text for it at bottom, 40% available height … the text just
             fades in and out of each other with the layers growing").
             fullstack.css relayouts the band under .is-stage: the grid
             becomes a viewport-filling CSS-sticky stage (fig zone 60%,
             text zone 40%, the beats absolutely stacked), and the
             .v0sm-runway spacer after it is the sticky travel — so the
             figure is never JS-positioned here either (the desktop's
             law). One ScrollTrigger over the runway IS the story clock:
             its 'top bottom'→'bottom bottom' window equals the sticky
             engage→release span EXACTLY (stage top + stage height =
             viewport bottom, by construction), and its progress drives
             everything — the SAME setActive builds the tower beat by
             beat (plates drop, taps draw, rail rises), the beats' copy
             crossfades through the boundaries, and the capstone hunk
             writes itself across the agents segment. */
          scope.classList.add('is-stage');
          const runway = scope.querySelector<HTMLElement>('.v0sm-runway');
          /* each beat owns an equal share of the runway; the crossfade
             band straddles each boundary — wide enough that the ride
             between beats reads as one text dissolving into the next,
             narrow enough that every beat holds a clean solo dwell */
          const SEG = 1 / beats.length;
          const FADE = 0.36 * SEG;
          /* the hunk writes across the agents dwell: from the moment its
             text is fully in to a breath before the stage releases */
          const CAP_FROM = (beats.length - 1) * SEG + FADE / 2;
          const CAP_TO = 0.985;

          const apply = (p: number) => {
            beats.forEach((beat, i) => {
              /* a beat's alpha is the meet of its two boundary ramps;
                 the first never fades in, the last never fades out */
              const grow = i === 0 ? 1 : (p - (i * SEG - FADE / 2)) / FADE;
              const hold =
                i === beats.length - 1 ? 1 : ((i + 1) * SEG + FADE / 2 - p) / FADE;
              const alpha = gsap.utils.clamp(0, 1, Math.min(grow, hold));
              /* direct style writes, not tweens: the scrub owns the
                 value absolutely, every frame — visibility keeps the
                 hidden beats out of the accessibility tree and taps */
              beat.style.opacity = String(alpha);
              beat.style.visibility = alpha > 0 ? 'visible' : 'hidden';
            });
            /* the build switches at the boundary centers — the new
               plate settles in exactly as its text crosses 50% */
            const active = Math.min(beats.length - 1, Math.max(0, Math.floor(p / SEG)));
            if (active !== hotBeat) setActive(active, false);
            if (capTl) {
              capTl.progress(gsap.utils.clamp(0, 1, (p - CAP_FROM) / (CAP_TO - CAP_FROM)));
            }
          };

          if (runway) {
            const master = ScrollTrigger.create({
              trigger: runway,
              start: 'top bottom',
              end: 'bottom bottom',
              onUpdate: (self) => apply(self.progress),
            });
            /* a deep link or restored scroll lands mid-story: seed the
               state from wherever the clock already reads */
            apply(master.progress);
          }
        }

        /* the loops' viewport gate: everything ambient pauses the moment
           the band leaves the screen */
        const viewGate = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            inView = self.isActive;
            syncLoops();
            /* the staged arrival: the stage has no beat windows, so the
               view gate is what draws the rise when the band enters with
               the rail at its empty foot (the desktop's beat-01 window,
               relocated) — re-entries from below find railAt > 0 */
            if (staged && self.isActive && railAt === 0) setActive(hotBeat, false);
            /* the jump exit: left upward without re-entering beat 01 */
            if (!self.isActive && self.progress === 0 && railAt > 0) retract();
          },
        });
        inView = viewGate.isActive;
        syncLoops();
        /* born in view (a deep link into the band): the gate's toggle
           never fired, so the staged arrival draws here instead */
        if (staged && inView && railAt === 0) setActive(hotBeat, false);

        return () => {
          /* the stage's own residue: the layout class and the scrub's
             direct style writes (no tween owns them, so no revert does) */
          if (staged) {
            scope.classList.remove('is-stage');
            for (const beat of beats) {
              beat.style.removeProperty('opacity');
              beat.style.removeProperty('visibility');
            }
          }
          flight?.kill();
          capTl?.kill();
          viewGate.kill();
          for (const loop of waveLoops) loop.kill();
          wrapLoop?.kill();
          for (const loop of fanLoops) loop.kill();
          orbitLoop?.kill();
          for (const loop of shineLoops) loop.kill();
          sweepLoop?.kill();
          if (scan) gsap.set(scan, { clearProps: 'opacity,visibility' });
          if (scanSweep) gsap.set(scanSweep, { clearProps: 'transform' });
          if (capDiffs.length > 0)
            gsap.set(capDiffs, { clearProps: 'opacity,visibility,transform' });
          const dashed: SVGPathElement[] = [
            ...waves,
            ...fanPulses,
            ...(codeWrap ? [codeWrap] : []),
            ...(orbit ? [orbit] : []),
          ];
          if (dashed.length > 0) gsap.set(dashed, { clearProps: 'strokeDashoffset' });
          const bands = [...stripes, ...stripes2];
          if (bands.length > 0) gsap.set(bands, { clearProps: 'transform' });
          clear();
        };
      });

      /* NO SETTLE, NO DESCENT — EVER (founder: "the diagram keeps moving
         down as i scroll past agents, which is wrong"). No JS touches the
         figure: the read-line seat (fullstack.css) holds it through beat
         04's lock-in, the rail cell's post-read runway is the AGENTS
         DWELL — the tower stays seated while the capstone's scan beam
         plays (founder: "stay on agents a lil longer as we scroll to
         show the scanning") — and then the NATIVE sticky release carries
         the tower up and out with the band, which is what lets the next
         section arrive. The figure never translates down. */

      /* reduced motion: the FULL stack, statically — all four slabs are
         more legible than one when nothing will ever animate the rest in
         — with the first beat lit and its slab lifted, the shimmer band
         resting at the markup's mid-glyph pose, and the scan beam parked
         hidden by the stylesheet (nothing here ever touches either) */
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
              Context, Translations, Agents — separated by rhythm alone,
              each centered in its uniform scroll window. Below the last
              beat the cell carries the agents dwell (fullstack.css): the
              runway that keeps the tower seated and the scan beam
              running after beat 04's read. */}
          <div className='tcb-cell v0-stack-cell-rail' data-cell>
            <ol className='v0-stack-rail'>
              {BEATS.map((beat, i) => {
                const Icon = beat.icon;
                /* the FINALE wears its own hook (is-finale): the runway
                   spacer below is the list's literal :last-child, so the
                   sticky-dwell rule needs a name, not a position */
                const spotlight = i === 0 ? 'is-hot' : 'is-cold';
                const finale = i === BEATS.length - 1 ? ' is-finale' : '';
                return (
                  <li
                    className={`v0-stack-beat ${spotlight}${finale}`}
                    data-stack-beat={i}
                    data-reveal
                    key={beat.id}
                  >
                    <div className='v0-stack-tag'>
                      <Icon className='v0-stack-ic' size={16} strokeWidth={1.6} aria-hidden />
                      <span className='v0-stack-name'>{beat.name}</span>
                    </div>
                    <h3>{beat.lead}</h3>
                    {/* the description and details as bullet points (founder:
                        scannable, not paragraph blocks) — quiet accent dashes,
                        never browser discs (fullstack.css) */}
                    <ul className='v0-stack-points'>
                      {beat.points.map((point, p) => (
                        <li key={`${beat.id}-${p}`}>{point}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
              {/* the agents dwell's runway, as structural flow INSIDE the
                  rail list — never cell padding: the finale beat is sticky
                  (fullstack.css) and sticky travel is bounded by the
                  PARENT'S content box, so this spacer is the room "Automate
                  it." spends staying with the viewer while the scan
                  beam plays (founder: "make the 'make it automatic'
                  section stay with you for that 260 px"). */}
              <li className='v0-stack-runway' aria-hidden />
            </ol>
          </div>
        </div>

        {/* THE MOBILE STAGE's runway: the sticky travel below the pinned
            grid — display: none everywhere except under .is-stage
            (fullstack.css), so desktop and the static fallbacks never
            feel it. It sits INSIDE .tcb-in because sticky travel is
            bounded by the PARENT'S content box (the agents dwell's own
            lesson): the grid releases exactly when its bottom meets this
            spacer's end. Its height is the whole story's scroll length. */}
        <div className='v0sm-runway' aria-hidden />
      </div>
    </section>
  );
}
