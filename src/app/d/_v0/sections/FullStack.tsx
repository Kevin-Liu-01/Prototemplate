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

        /* the channel's ledger: the fill's current scaleY target, so beat
           01's ARRIVAL (the rise from the rail's empty foot) can be told
           apart from an ordinary between-beats move */
        let railAt = 0;

        /* THE PEN (founder, four round-trips: "blue line comes up; as
           soon as it is done, the connector comes out of the blue line —
           into code, into context, and so on. Flowing motions, never two
           disjoint things" — and its mirror on the way back down). The
           rail fill and the bends are ONE pen driven as a state machine:
           the scroll only ever moves the TARGET; the pen makes one
           atomic move at a time — a rise to the next junction, a bend
           out of the landed tip, a fold back into the line, a descent to
           the junction below — and consults the newest target only when
           a move COMPLETES. No move is ever killed mid-flight, so a fast
           up-and-down scrub can never shred a half-drawn stroke into
           jitter: direction changes wait at the next move boundary
           (≤0.45s) and the pen always draws whole lines. Momentum
           grammar at every junction: the leg INTO a turn ends fast
           (power2.in), the leg OUT of it leaves fast and decelerates
           (power2.out). Bends park at −100, the RAIL side, and draw
           rail-outward — the layer side (+100) grew connectors out of
           the plates toward the line, the disjoint read this replaced.
           The plates keep their own independent timeline below: the
           layers were right; only the stroke is choreographed. */
        let strokeTarget = 0;
        let strokeBusy = false;

        const strokeOff = (i: number) => {
          const tap = taps[i];
          return tap ? Number(gsap.getProperty(tap, 'strokeDashoffset')) || 0 : -100;
        };

        const pump = (): void => {
          if (!rail || strokeBusy) return;
          const count = strokeTarget;
          const at = Number(gsap.getProperty(rail, 'scaleY')) || 0;
          const home = count > 0 ? (RAIL_SCALE[count - 1] ?? 0) : 0;
          /* one LEG is the atomic unit — a mini-timeline that always runs
             to completion; the pen re-consults the target only at leg
             boundaries. A leg spans EVERY pending junction at once
             (founder: after a fast scroll the catch-up must not visit
             third then fourth — "these should happen at the same time"):
             one rail move, with the passed bends flowing out of (or
             folding into) the tip AS IT PASSES — the arrival's own
             grammar, generalized. */
          const leg = (build: (tl: gsap.core.Timeline) => void) => {
            strokeBusy = true;
            const tl = gsap.timeline({
              onComplete: () => {
                strokeBusy = false;
                pump();
              },
            });
            build(tl);
          };

          /* -------- reverse: fold what stands above, sweep down once */
          const above: number[] = [];
          for (let k = taps.length - 1; k >= count; k -= 1) {
            if (taps[k] && strokeOff(k) > -99) above.push(k);
          }
          if (above.length > 0 && at <= home + 0.0005) {
            /* strays from an interrupted state — the line is already
               home, the orphan bends just fold */
            leg((tl) => {
              above.forEach((k, i) => {
                const tap = taps[k];
                if (tap) tl.to(tap, { strokeDashoffset: -100, duration: 0.3, ease: 'power2.in', autoRound: false }, 0.06 * i);
              });
            });
            return;
          }
          if (at > home + 0.0005) {
            leg((tl) => {
              /* the top bend folds first — the approved corner — then ONE
                 descent sweeps to the target landing, the remaining bends
                 collapsing into the tip as it passes them (the retract's
                 inverse-eased grammar) */
              const [top, ...rest] = above;
              let t0 = 0;
              const topTap = top !== undefined ? taps[top] : undefined;
              if (topTap) {
                tl.to(topTap, { strokeDashoffset: -100, duration: 0.3, ease: 'power2.in', autoRound: false }, 0);
                t0 = 0.3;
              }
              const dist = at - home;
              const dur = Math.min(0.7, Math.max(0.4, dist * 0.9));
              tl.to(rail, { scaleY: home, svgOrigin: RAIL_ORIGIN, duration: dur, ease: 'power2.in' }, t0);
              rest.forEach((k) => {
                const tap = taps[k];
                if (!tap) return;
                /* the power2.in fall covers fraction p² of the distance at
                   progress p — invert it for the tip's pass of junction k */
                const frac = Math.max(0, Math.min(1, (at - (RAIL_SCALE[k] ?? 1)) / dist));
                const when = t0 + dur * Math.sqrt(frac);
                tl.to(tap, { strokeDashoffset: -100, duration: 0.25, ease: 'power1.in', autoRound: false }, Math.max(0, when - 0.15));
              });
            });
            railAt = home;
            return;
          }

          /* -------- forward: one rise to the newest landing, bends
             flowing out of the tip as it passes their junctions; a
             single-junction hop keeps the strict corner (accelerate in,
             bend leaves on the landing) */
          if (at < home - 0.0005) {
            leg((tl) => {
              const dist = home - at;
              const arrival = at === 0;
              const single = !arrival && count > 1 && at >= (RAIL_SCALE[count - 2] ?? 0) - 0.0005;
              const dur = arrival ? 1.0 : single ? 0.45 : Math.min(1.0, Math.max(0.5, dist * 1.1));
              tl.to(
                rail,
                { scaleY: home, svgOrigin: RAIL_ORIGIN, duration: dur, ease: single ? 'power2.in' : 'power2.out' },
                0
              );
              for (let k = 0; k < count; k += 1) {
                const tap = taps[k];
                if (!tap || Math.abs(strokeOff(k)) <= 1) continue;
                /* the power2.out rise covers 1−(1−p)² at progress p —
                   invert for the pass; a single hop's one bend leaves at
                   the landing itself */
                const frac = Math.max(0, Math.min(1, ((RAIL_SCALE[k] ?? 1) - at) / dist));
                const when = single ? dur : dur * (1 - Math.sqrt(1 - frac));
                tl.to(tap, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', autoRound: false }, when + 0.02);
              }
            });
            railAt = home;
            return;
          }

          /* -------- line already home: only strays can be undrawn */
          const undrawn: number[] = [];
          for (let k = 0; k < count; k += 1) {
            if (taps[k] && Math.abs(strokeOff(k)) > 1) undrawn.push(k);
          }
          if (undrawn.length > 0) {
            leg((tl) => {
              undrawn.forEach((k, i) => {
                const tap = taps[k];
                if (tap) tl.to(tap, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', autoRound: false }, 0.06 * i);
              });
            });
          }
        };

        const strokeTo = (count: number) => {
          strokeTarget = count;
          pump();
        };

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
          hotBeat = active;
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
              /* the instant path always parks the rail EMPTY and every
                 bend on the RAIL side (−100): the stroke queue draws each
                 one rail-outward as the blue reaches its junction */
              gsap.set(slab, { y: visible ? seat : seat - dropBy, autoAlpha: visible ? 1 : 0 });
              if (tap) gsap.set(tap, { strokeDashoffset: -100 });
            } else if (visible && !shown[i]) {
              /* arriving: the plate drops in from above its seat,
                 bottom-up — the plate is furniture and answers its beat
                 immediately; its bend belongs to the stroke queue and
                 arrives when the blue does */
              const at = entered * 0.14;
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, at);
              entered += 1;
            } else if (visible) {
              /* staying: glide to the new seat — the bend is the queue's */
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 0);
            } else {
              /* leaving: the plate rises out; its bend folds back into
                 the line in the queue's reverse chain */
              tl.to(slab, { y: seat - dropBy, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0);
            }
            shown[i] = visible;
          });

          /* the stroke — rail fill and bends — is one serialized pen */
          if (instant) {
            gsap.killTweensOf([rail, ...taps].filter(Boolean));
            strokeBusy = false;
            strokeTarget = 0;
            if (rail) gsap.set(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN });
            railAt = 0;
          } else {
            strokeTo(count);
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
          /* the exit speaks the pen's own reverse grammar — fold the top
             bend into the line, descend, fold the next, descend — down to
             the empty foot, so the way out is the same flowing stroke the
             way in was (founder: the undraw must connect too) */
          strokeTo(0);
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

        /* set by the staged branch: puts every sliced text node and
           hidden inline mark back — the typing writes Text data no
           revert owns */
        let restoreTyped: (() => void) | null = null;

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
          /* each beat owns an equal share of the runway; the transition
             band straddles each boundary — the leaving beat UNTYPES in
             its first half, the arriving one TYPES in its second
             (founder: type transition itself instead of fading) */
          const SEG = 1 / beats.length;
          const FADE = 0.36 * SEG;
          /* the hunk writes across the agents dwell: from the moment its
             text is fully in to a breath before the stage releases */
          const CAP_FROM = (beats.length - 1) * SEG + FADE / 2;
          const CAP_TO = 0.985;

          /* THE TYPED TRANSITION's material: every beat's lead and
             bullets, cut into text nodes (sliced in place) and atomic
             inline marks (the GT word toggles at its seat) — the brand
             token survives because the typing never rewrites elements,
             only Text data. Weighted so a mark costs a couple of beats
             of the same clock. */
          type TypedChunk =
            | { kind: 'text'; node: Text; full: string }
            | { kind: 'mark'; el: HTMLElement };
          type TypedBlock = { host: HTMLElement; chunks: TypedChunk[]; len: number };
          const MARK_WEIGHT = 2;
          const typedBeats = beats.map((beat) => {
            const hosts = Array.from(
              beat.querySelectorAll<HTMLElement>('h3, .v0-stack-points li')
            );
            const blocks: TypedBlock[] = hosts.map((host) => {
              const chunks: TypedChunk[] = [];
              let len = 0;
              host.childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                  const full = child.textContent ?? '';
                  if (full.length) {
                    chunks.push({ kind: 'text', node: child as Text, full });
                    len += full.length;
                  }
                } else if (child instanceof HTMLElement) {
                  chunks.push({ kind: 'mark', el: child });
                  len += MARK_WEIGHT;
                }
              });
              return { host, chunks, len };
            });
            return { blocks, total: blocks.reduce((n, b) => n + b.len, 0) };
          });

          restoreTyped = () => {
            typedBeats.forEach(({ blocks }) => {
              blocks.forEach((block) => {
                block.host.style.removeProperty('visibility');
                block.chunks.forEach((chunk) => {
                  if (chunk.kind === 'text') chunk.node.data = chunk.full;
                  else chunk.el.style.removeProperty('visibility');
                });
              });
            });
          };

          /* write beat i at reveal fraction f: blocks consume the budget
             in document order, so the lead types before the bullets and
             a reversed scroll untypes them back in reverse */
          const writeBeat = (i: number, f: number) => {
            const typed = typedBeats[i];
            if (!typed) return;
            let n = Math.round(f * typed.total);
            typed.blocks.forEach((block) => {
              block.host.style.visibility = n > 0 ? '' : 'hidden';
              block.chunks.forEach((chunk) => {
                if (chunk.kind === 'text') {
                  const take = Math.max(0, Math.min(n, chunk.full.length));
                  const next = chunk.full.slice(0, take);
                  if (chunk.node.data !== next) chunk.node.data = next;
                  n -= chunk.full.length;
                } else {
                  chunk.el.style.visibility = n > 0 ? '' : 'hidden';
                  n -= MARK_WEIGHT;
                }
              });
            });
          };

          const apply = (p: number) => {
            beats.forEach((beat, i) => {
              /* sequential ramps, not a crossfade: the leaving beat's
                 text is gone before the arriving one starts — the two
                 are absolutely stacked, and typed fragments of both at
                 once would overprint */
              const grow = i === 0 ? 1 : (p - i * SEG) / (FADE / 2);
              const hold =
                i === beats.length - 1 ? 1 : ((i + 1) * SEG - p) / (FADE / 2);
              const f = gsap.utils.clamp(0, 1, Math.min(grow, hold));
              /* direct style writes, not tweens: the scrub owns the
                 value absolutely, every frame — visibility keeps the
                 hidden beats out of the accessibility tree and taps */
              beat.style.opacity = f > 0 ? '1' : '0';
              beat.style.visibility = f > 0 ? 'visible' : 'hidden';
              writeBeat(i, f);
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
            restoreTyped?.();
          }
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
