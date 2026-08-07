'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';

import GtLogoText from '@/app/d/_v0/GtLogoText';

import StackTower, {
  beamAt,
  RAIL_FOOT,
  RAIL_ORIGIN,
  RAIL_SCALE,
  RAIL_TOP,
  SHINE_FROM,
  SHINE_TO,
  TOWER_H,
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
      <>Tag user interfaces and they’re ready to ship in 120+ locales</>,
      'Open-source internationalization (i18n) libraries and SDKs for every framework',
    ],
    icon: Code2,
    slabIds: ['code'],
  },
  {
    id: 'context',
    name: 'Context',
    lead: 'Context layer, shared globally.',
    points: [
      <>
        <GtLogoText /> keeps your wording and voice consistent across app, website, docs, and
        slides
      </>,
      <>Edit, version, and approve with your team</>,
    ],
    /* BookOpen, not Layers (founder: Layers is the FULL STACK's icon
       now; context wears the knowledge glyph everywhere) */
    icon: BookOpen,
    slabIds: ['context'],
  },
  {
    id: 'translations',
    name: 'Translations',
    lead: 'The best translations of your product.',
    points: [
      <>High-quality translations that reflect your meaning</>,
      <>
        <GtLogoText /> handles every file format, and logical branches for dynamic content like
        plurals and gender forms
      </>,
    ],
    icon: Languages,
    slabIds: ['translations'],
  },
  {
    id: 'agents',
    name: 'Agents',
    lead: 'Agents connect your systems.',
    points: [
      <>Locadex connects your GitHub, CMS, Figma, and external files</>,
      <>Infrastructure built for agents across API, CLI, and MCP</>,
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
const _OPEN = 26;
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
const NARROW_MEDIA = '(max-width: 1020px)';
const STAGE_MEDIA = `${NARROW_MEDIA} and (min-height: 640px)`;

/**
 * gsap.matchMedia conditions: one callback owns every motion regime, so
 * the desktop machinery and the staged mobile scrub share the loops,
 * the build (one story timeline + the hot ledger), and the viewport
 * gate instead of forking into two systems — the branches differ only
 * in what DRIVES the story's clock.
 */
const STAGE_SPLIT = {
  motion: '(prefers-reduced-motion: no-preference)',
  stage: STAGE_MEDIA,
  narrow: NARROW_MEDIA,
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

      /* class state, shared by both motion branches: hot slabs take full
         ink and the accent edge; the hot plate's rail leader takes the
         accent with it. STACKING is deliberately NOT painted here — the
         instant z demotion at a beat change put a still-fading plate
         BEHIND the layer under it (founder) — z-order is a story event
         and rides the story timeline with everything else. */
      const paint = (active: number) => {
        const hot = new Set(HOT_SLABS[active] ?? []);
        slabs.forEach((slab, i) => {
          slab.classList.toggle('is-hot', hot.has(i));
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

      /* the STATIC pose — the full stack, first beat lit, every tap
         drawn, the channel filled to the top tap: what reduced motion
         renders, and what the one-column flow is designed around
         (fullstack.css: "full tower on top, the beats' copy readable
         below") */
      const staticPose = () => {
        paint(0);
        const hot = new Set(HOT_SLABS[0] ?? []);
        slabs.forEach((slab, i) => {
          gsap.set(slab, { y: hot.has(i) ? -LIFT : 0, autoAlpha: 1 });
        });
        for (const tap of taps) gsap.set(tap, { strokeDashoffset: 0 });
        if (rail) gsap.set(rail, { scaleY: 1, svgOrigin: RAIL_ORIGIN });
      };

      const mm = gsap.matchMedia();

      mm.add(STAGE_SPLIT, (mctx) => {
        /* reduced motion is its own add below — this callback is the
           no-preference machinery, at phone and desktop widths alike */
        if (!mctx.conditions?.motion) return;
        const staged = !!mctx.conditions?.stage;
        /* THE COMPACT CUT: a window narrow enough for the one-column
           flow but SHORTER than the stage's 640px floor (founder
           screenshot: it showed "a weird combination of the mobile
           story and the desktop scroll story" — the one-column CSS with
           the desktop machinery still scrubbing over it, slabs parked
           hidden in a layout whose figure is static by design). The
           one-column flow is designed around the static pose, so render
           exactly that and mount NO machinery. */
        if (mctx.conditions?.narrow && !staged) {
          staticPose();
          return clear;
        }
        /* the stage's layout class lands FIRST (fullstack.css keys the
           whole stage relayout on it): everything measured below — the
           arrival's px mapping, the pen's reserved line seats — must
           read the STAGE's geometry, so the class can never trail the
           story build */
        if (staged) scope.classList.add('is-stage');
        /* the one shared constant the stage narrows: see STAGE_DROP */
        const dropBy = staged ? STAGE_DROP : DROP;
        /* which slabs exist right now — the build's one piece of state,
           so entering and leaving slabs can be staged differently */

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
          /* the beam's VISIBILITY is a story event now (founder: arriving
             at the fourth beat plate by plate, the sheet appeared before
             its plate existed — the instant hot flag ran ahead of the
             story). The story fades the sheet in only after the
             capstone's drop lands and rewinds it out before the plate
             leaves; this ledger only starts and stops the SWEEP so an
             offscreen band never burns frames. */
          const scanOn = agentsOn && hotBeat === agentsBeat;
          if (sweepLoop) {
            if (scanOn) sweepLoop.play();
            else sweepLoop.pause();
          }
        };

        /* ===== THE RAIL'S REACH ON THE STAGE (founder: "make the blue
           line extend all the way towards the bottom and emerge from
           the bottom" — the desktop fill's rise starts at the figure
           CELL's bottom rule, but the stage's fig cell ends at the 60%
           zone seam, so the blue foot floated mid-screen). The text
           cell already continues the grey track to the stage's bottom
           edge (fullstack.css's ::before); the blue now continues too:
           a stage-only extension element (.v0sm-railext) in the text
           cell — same x, same gauge, same containing block as the track
           continuation, so the joint can never jog — anchored at the
           cell's foot and scaled bottom-up. ONE dial drives the whole
           arrival: it moves the line's top edge in SCREEN px from the
           stage's bottom edge up to the code tap, and maps that one
           position onto BOTH fills every frame — the extension holds
           the run from the foot to the zone seam, the overlay fill from
           the seam up (everything below the seam sits under the fig
           cell's clip) — so the two surfaces can never disagree and the
           rise crosses the joint at constant speed, one line, no seam.
           The dial is a STORY EVENT (it replaces the stage's beat-01
           rail leg at the same duration and ease), so scrubs, reversals
           and retracts play it like any other frame of the story; it
           ends at RAIL_SCALE[0] algebraically, so the tap junctions
           above never move, and beats 02–04 tween the overlay fill
           exactly as on desktop. */
        const railExt = staged
          ? scope.querySelector<HTMLElement>('.v0sm-railext')
          : null;
        const railCell = scope.querySelector<HTMLElement>('.v0-stack-cell-rail');
        const railSvg = scope.querySelector<SVGSVGElement>('.v0s-railsvg');
        const RAIL_UNITS = RAIL_FOOT - RAIL_TOP;
        /* px measurements as same-frame DIFFERENCES only, so the scroll
           position can never leak into the mapping; re-measured on every
           ScrollTrigger refresh (the stage re-lays with dvh) */
        const arrGeo = { ppu: 0, footDy: 0, extH: 0, ready: false };
        const measureArrival = () => {
          if (!railSvg || !railCell) return;
          const svgR = railSvg.getBoundingClientRect();
          const cellR = railCell.getBoundingClientRect();
          if (svgR.height <= 0 || cellR.height <= 0) return;
          arrGeo.ppu = svgR.height / TOWER_H;
          arrGeo.footDy = cellR.bottom - svgR.top;
          arrGeo.extH = cellR.height;
          arrGeo.ready = true;
        };
        const arrival = { t: 0 };
        const applyArrival = () => {
          if (!rail || !railExt) return;
          if (!arrGeo.ready) measureArrival();
          if (!arrGeo.ready) return;
          /* the code tap's screen seat, derived from RAIL_SCALE[0]
             itself, so t = 1 lands the leg exactly where the desktop
             leg lands */
          const tapDy = (RAIL_FOOT - (RAIL_SCALE[0] ?? 1) * RAIL_UNITS) * arrGeo.ppu;
          const dy = arrGeo.footDy + (tapDy - arrGeo.footDy) * arrival.t;
          gsap.set(rail, {
            scaleY: (RAIL_FOOT - dy / arrGeo.ppu) / RAIL_UNITS,
            svgOrigin: RAIL_ORIGIN,
          });
          gsap.set(railExt, {
            scaleY: gsap.utils.clamp(0, 1, (arrGeo.footDy - dy) / arrGeo.extH),
          });
        };
        if (railExt) {
          gsap.set(railExt, { transformOrigin: '50% 100%', scaleY: 0 });
        }

        /* THE STORY (founder, five round-trips, closing with: "stop
           having these weird instances where the line is just moving
           around but doesn't commit… make everything more perfectly
           storylined, even the fading, instead of having gates to show
           layers and extend lines"). The ENTIRE build is authored once,
           as a single paused timeline — for each beat, in order: the
           previous hot plate settles, the beat's plate fades in and
           drops, the blue rises its leg (the first haul long and
           decelerating, later legs accelerating into the junction), and
           the bend flows out of the landed tip. The scroll never touches
           an element and never plays anything at its own tempo: it IS
           the story's clock (founder: "as you scroll, the rail is coming
           up, connecting to the layer, and as you keep going it just
           keeps going and extends to connecting to a new layer").
           Every frame anyone can ever see is therefore a frame OF the
           story — scrolling back up plays the same story backward (bend
           folds into the line before the line leaves; the plate lifts
           away as its fade rewinds),
           and an uncommitted stub or a line/fade disagreement is
           structurally impossible. Bends park at −101, NOT −100: the tap
           path is authored plate-first (its overshot end buries in the
           hull), and a NEGATIVE offset reveals from the path's END — the
           rail stub — so the bend grows out of the landed leg's junction,
           through the elbow, into the plate (founder: "reverse the
           direction they fill in" — the draw continues the leg's own
           travel instead of meeting it head-on). At exactly −100 a dash
           boundary sits exactly on the path's rail end, and Chromium's
           dash rounding bled a sub-pixel fleck of accent onto the track
           at the takeoff (founder, zoomed screenshot: a ~2px blue tick
           where a FOLDED bend emerges) — the one-unit overshoot, with
           the dash gap padded past the path length (StackTower's
           '100 200'), parks every dash edge clear of both path ends, and
           the visible draw still starts exactly at the junction the
           moment the offset crosses −100. */
        const story = gsap.timeline({ paused: true });
        /** the story time at which beat k stands complete (bend drawn) */
        const beatEnd: number[] = [];
        if (rail) gsap.set(rail, { scaleY: 0, svgOrigin: RAIL_ORIGIN });
        slabs.forEach((slab, k) => {
          gsap.set(slab, { y: -LIFT - dropBy, autoAlpha: 0 });
          const tap = taps[k];
          if (tap) gsap.set(tap, { strokeDashoffset: -101 });

          const base = k === 0 ? 0 : beatEnd[k - 1] ?? 0;
          const legDur = k === 0 ? 1.0 : 0.45;
          const prev = k > 0 ? slabs[k - 1] : undefined;
          if (prev) {
            story.to(prev, { y: 0, duration: 0.35, ease: 'power2.out' }, base);
            /* seated again — back to the painter's base order */
            story.set(prev, { zIndex: k }, base);
          }
          /* AIRBORNE plates ride above everything: the z change is a
             story event (a gsap set restores its prior value when the
             story plays backward), so a plate rewinding out of its fade
             lifts back OVER the layer under it — never behind (founder).
             It settles to the hot tier once its drop lands. */
          story.set(slab, { zIndex: slabs.length * 2 + 2 }, base);
          story.to(slab, { y: -LIFT, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, base);
          story.set(slab, { zIndex: slabs.length + 1 + k }, base + 0.5);
          if (rail) {
            if (railExt && k === 0) {
              /* the staged arrival: the dial, not a bare scaleY — same
                 duration, same first-haul ease, so the story's beat
                 boundaries and every later leg stand untouched */
              story.to(
                arrival,
                { t: 1, duration: legDur, ease: 'power2.out', onUpdate: applyArrival },
                base
              );
            } else {
              story.to(
                rail,
                {
                  scaleY: RAIL_SCALE[k] ?? 1,
                  svgOrigin: RAIL_ORIGIN,
                  duration: legDur,
                  ease: k === 0 ? 'power2.out' : 'power2.in',
                },
                base
              );
            }
          }
          if (tap) {
            /* the bend leaves the junction ONLY once the leg lands
               (founder, round 2: "still broken and glitchy" — the old
               0.12s head start against a power2.in leg lit the elbow and
               its rail-overlap stub while the tip was still half a leg
               below the junction, so the rail read lit-dark-lit with a
               floating bend). A hair of overlap keeps the handoff seamed,
               and the ease matches the leg's ARRIVAL SPEED at the seam:
               later legs accelerate in (power2.in ends fast), so their
               bends leave fast and decelerate into the plate; the first
               haul decelerates in, so its bend eases out just as gently. */
            story.to(
              tap,
              {
                strokeDashoffset: 0,
                duration: 0.5,
                ease: k === 0 ? 'sine.inOut' : 'power2.out',
                autoRound: false,
              },
              base + legDur - 0.02
            );
          }
          /* the scan sheet enters the story with its plate (founder: the
             scanner may never precede the fourth layer): it rises after
             the capstone's drop lands and a rewind carries it out before
             the plate goes */
          if (scan && k === slabs.length - 1) {
            story.to(scan, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, base + 0.5);
          }
          /* the beat stands complete exactly when its bend seats */
          beatEnd[k] = base + legDur + 0.48;
        });

        /* THE CREST: once the capstone locks in and the reader keeps
           going, the channel runs the REST of the rail — past the top
           tap, up through the figure cell's top rule (founder: "once we
           get to bottom, after scrolling for a sec, the blue rail line
           should extend fully to top instead of having it still be
           empty"). The overscan is deliberate: the rect is foot-anchored
           and the figure cell's crop ends the fill exactly at the top
           rule, so precision lives in the crop, not the scale — but it
           is SIZED to the travel a viewport can actually expose (~1.5
           tower heights), and the ease is LINEAR, so the visible rise
           tracks the scroll honestly instead of popping (founder: "make
           the blue rail line that goes up less instant — should be
           timed better with scroll"; the crest gap's own wide phase
           window below is the other half of that fix). */
        const crestFrom = beatEnd[beatEnd.length - 1] ?? 0;
        const CREST_END = crestFrom + 0.75;
        if (rail) {
          story.to(
            rail,
            {
              scaleY: 1 + (2 * TOWER_H) / RAIL_UNITS,
              svgOrigin: RAIL_ORIGIN,
              duration: 0.7,
              ease: 'none',
            },
            crestFrom + 0.05
          );
        }

        /* THE CLOCK (founder: "as you scroll, the rail is coming up,
           connecting to the layer, and as you keep going it just keeps
           going and extends to connecting to a new layer — make this
           logic a lot simpler and just achieve this"): scroll maps
           STRAIGHT to story time. No playhead to retarget, no beat
           windows to toggle, no retract wiring — scrolling back up runs
           the clock backward and the same story plays in reverse. The
           only per-beat state left is the hot ledger: the copy
           spotlight, the loop gates and the scan flag, flipped when the
           clock crosses a beat's lock-in. */
        const setHot = (active: number) => {
          if (active === hotBeat) return;
          paint(active);
          built = VISIBLE_COUNT[active] ?? slabs.length;
          hotBeat = active;
          syncLoops();
        };
        /* each read gap (desktop) or runway segment (stage) runs three
           phases: HOLD the standing pose through the first half, spend
           the middle stretch on the next layer's BUILD, then LOCK — the
           new layer stands settled for the gap's last stretch before
           the next section takes the read line (founder: "lock into the
           other for a sec before we scroll to the next") */
        const HOLD = 0.5;
        const LOCK = 0.82;
        /* the crest's gap runs its own phases: a short breath after the
           capstone's lock-in, then the rise rides nearly the WHOLE dwell
           (founder: the instant crest — the run gets the scroll room its
           travel deserves) */
        const CREST_HOLD = 0.12;
        const CREST_LOCK = 0.95;
        const gapTime = (
          fromT: number,
          toT: number,
          gp: number,
          hold: number = HOLD,
          lock: number = LOCK
        ): number => {
          if (gp <= hold) return fromT;
          if (gp >= lock) return toT;
          return fromT + ((gp - hold) / (lock - hold)) * (toT - fromT);
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
            /* parked at 101, not 100 — the taps' fleck rule (see the
               story build): at exactly ±100 a dash boundary sits on a
               path end and Chromium bleeds a sub-pixel dot there */
            const wire = capWires[i];
            if (wire) {
              capTl.fromTo(
                wire,
                { strokeDashoffset: 101 },
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

        /* set by the staged branch: puts every sliced text node, hidden
           inline mark and reserved line seat back — the pen writes Text
           data and min-heights no revert owns */
        let restoreTyped: (() => void) | null = null;
        /* the staged branch's refresh listener, unhooked at cleanup */
        let onStageRefresh: (() => void) | null = null;
        /* the staged branch's damped scrub clock, detached at cleanup */
        let killScrub: (() => void) | null = null;

        if (!staged) {
          /* one scrubbed dial spans the whole read — from the first
             beat's entry to the last beat's lock-in at the read line —
             and a piecewise map (measured lock-ins in, beatEnd[] out)
             converts it to story time, so every bend still seats exactly
             as its beat's copy reaches the read line, whatever the
             beats' real heights are. Re-anchored on every refresh. */
          const anchors: number[] = beats.map(() => 1);
          const dial = { p: 0 };
          /* A beat's LOCK-IN is its COPY BLOCK's center taking the 55%
             read line — the line the figure's seat centers the tower on
             (fullstack.css) — never the beat WINDOW's top crossing 58%:
             the window is half a viewport of air with the copy centered
             inside, so its top runs nearly a half-window ahead of the
             copy, and every anchor fired that much early — with the
             build spending the gap's last stretch, a plate was mid-drop
             exactly while the PREVIOUS copy sat on the read line
             (founder, screenshot: "each layer arrives too early — by the
             time the layer is finally centered with the text, the 2nd
             layer is already appearing over it. Make the layers start
             moving later."). Anchored on the copy itself, the gap's
             hold → build → lock shape lands where it was written to:
             the arrival begins only once the previous copy has left the
             line, runs while its own copy climbs the lower half, and
             stands LOCKED before that copy takes the read line.
             Measured from FLOW geometry: the finale is sticky, so its
             own rect would read the STUCK pose on a mid-dwell refresh —
             its flow top is the previous beat's (never-sticky) bottom,
             and the copy's offset inside its beat reads the same stuck
             or not. For the finale this lock-in IS the pin-engage
             scroll: the pin seats the copy center on the same 55% line
             (fullstack.css), so the last build completes exactly as the
             dwell begins. */
          const READ_LINE = 0.55;
          const lockInAt = (k: number): number => {
            const beat = beats[k];
            if (!beat) return 0;
            const rect = beat.getBoundingClientRect();
            const kids = Array.from(beat.children);
            let copyMid = rect.height / 2;
            if (kids.length > 0) {
              const tops = kids.map((el) => el.getBoundingClientRect().top);
              const bottoms = kids.map((el) => el.getBoundingClientRect().bottom);
              copyMid = (Math.min(...tops) + Math.max(...bottoms)) / 2 - rect.top;
            }
            const prev = beats[k - 1];
            const flowTop = prev
              ? prev.getBoundingClientRect().bottom + window.scrollY
              : rect.top + window.scrollY;
            return flowTop + copyMid - window.innerHeight * READ_LINE;
          };
          const timeAt = (p: number): number => {
            /* the clock HOLDS at each beat's lock-in (founder: "it
               should only be the first layer showing up for the first
               section"): while a row is being read the tower stands at
               exactly that row's layers; the gap to the next row runs
               hold → build → lock (gapTime above). The floor is beat
               01's lock-in, so the foundation and its connector stand
               before any scroll; the run past the LAST anchor is the
               dwell's gap, whose build is the crest — the channel's
               final run to the rail's top. */
            let fromP = anchors[0] ?? 0;
            let fromT = beatEnd[0] ?? 0;
            if (p <= fromP) return fromT;
            for (let k = 1; k <= anchors.length; k++) {
              const crest = k === anchors.length;
              const toP = crest ? 1 : (anchors[k] ?? 1);
              const toT = crest ? CREST_END : (beatEnd[k] ?? CREST_END);
              if (p <= toP) {
                const span = toP - fromP;
                const gp = span > 0 ? (p - fromP) / span : 1;
                return crest
                  ? gapTime(fromT, toT, gp, CREST_HOLD, CREST_LOCK)
                  : gapTime(fromT, toT, gp);
              }
              fromP = toP;
              fromT = toT;
            }
            return CREST_END;
          };
          const apply = () => {
            let active = 0;
            for (let k = anchors.length - 1; k > 0; k--) {
              if (dial.p >= (anchors[k] ?? 1)) {
                active = k;
                break;
              }
            }
            setHot(active);
            story.time(timeAt(dial.p));
          };
          const master = ScrollTrigger.create({
            animation: gsap.to(dial, { p: 1, duration: 1, ease: 'none', paused: true, onUpdate: apply }),
            trigger: beats[0] ?? scope,
            start: 'top bottom',
            /* the span runs THROUGH the agents dwell to the band's rest
               view: the stretch past the last lock-in is the crest's
               scroll room */
            endTrigger: scope,
            end: 'bottom bottom',
            scrub: 0.35,
            onRefresh: (self) => {
              const span = self.end - self.start;
              beats.forEach((_, k) => {
                anchors[k] = span > 0 ? gsap.utils.clamp(0, 1, (lockInAt(k) - self.start) / span) : 1;
              });
              apply();
            },
          });
          void master;

          if (capTl) {
            ScrollTrigger.create({
              animation: capTl,
              trigger: beats[beats.length - 1],
              /* the hunk writes from beat 04's LOCK-IN — the same law as
                 the master's anchors (the copy center taking the read
                 line, which for the sticky finale is its pin-engage) —
                 never the window top's early crossing */
              start: () => lockInAt(beats.length - 1),
              endTrigger: scope,
              end: 'bottom bottom',
              scrub: 0.35,
            });
          }
        } else {
          /* ===== THE MOBILE STAGE (founder: "you see the diagram on
             top, 60% available height, and it's growing — and see the
             text for it at bottom, 40% available height for the story
             section").
             fullstack.css relayouts the band under .is-stage (set at the
             top of this callback, before anything measured): the grid
             becomes a viewport-filling CSS-sticky stage (fig zone 60%,
             text zone 40%, the beats absolutely stacked), and the
             .v0sm-runway spacer after it is the sticky travel — so the
             figure is never JS-positioned here either (the desktop's
             law). One ScrollTrigger over the runway IS the story clock:
             its 'top bottom'→'bottom bottom' window equals the sticky
             engage→release span EXACTLY (stage top + stage height =
             viewport bottom, by construction), and its progress drives
             everything — the SAME story clock builds the tower beat by
             beat (plates drop, taps draw, rail rises), THE PEN types
             the beats' copy through the boundaries (below), and the
             capstone hunk writes itself across the agents segment. */
          const runway = scope.querySelector<HTMLElement>('.v0sm-runway');
          /* each beat owns an equal share of the runway; crossing a
             boundary only RETARGETS the pen — the writing itself runs
             on its own authored tempo, never half-parked by the scrub */
          const SEG = 1 / beats.length;
          /* the hunk writes across the agents dwell: from just after the
             finale's copy starts writing to a breath before the stage
             releases */
          const CAP_FROM = (beats.length - 1) * SEG + 0.18 * SEG;
          const CAP_TO = 0.985;

          /* THE PEN's material (founder screenshots, two rounds: a beat
             frozen mid-crossfade cut off at "in ju" — "no 50% writing
             out or anything" — then a whole-block wipe that emptied the
             zone). The stage's copy TYPES: every beat's tag, lead and
             bullets are cut into LINES (one block per host, document
             order), each line into text nodes (sliced in place) and
             atomic inline marks (the GT word and the <T> chip toggle at
             their seats; the tag's NAME types under its icon — the
             icon and the LocadexMark span ride as marks, so the walk
             accepts SVG elements too). The typing never rewrites
             elements, only Text data, so the brand token survives; a
             mark costs a couple of beats of the same character clock. */
          type TypedChunk =
            | { kind: 'text'; node: Text; full: string }
            | { kind: 'mark'; el: HTMLElement | SVGElement };
          type TypedBlock = { host: HTMLElement; chunks: TypedChunk[]; len: number };
          const MARK_WEIGHT = 2;
          const chunkBlock = (host: HTMLElement): TypedBlock => {
            const chunks: TypedChunk[] = [];
            let len = 0;
            const walk = (child: ChildNode) => {
              if (child.nodeType === Node.TEXT_NODE) {
                const full = child.textContent ?? '';
                if (full.length) {
                  chunks.push({ kind: 'text', node: child as Text, full });
                  len += full.length;
                }
              } else if (
                child instanceof HTMLElement &&
                child.classList.contains('v0-stack-name')
              ) {
                /* the tag's name is TYPE, not an atom: descend to its
                   text so "Code" writes character by character */
                child.childNodes.forEach(walk);
              } else if (child instanceof HTMLElement || child instanceof SVGElement) {
                chunks.push({ kind: 'mark', el: child });
                len += MARK_WEIGHT;
              }
            };
            host.childNodes.forEach(walk);
            return { host, chunks, len };
          };
          const typedBeats = beats.map((beat) => ({
            blocks: Array.from(
              beat.querySelectorAll<HTMLElement>('.v0-stack-tag, h3, .v0-stack-points li')
            ).map(chunkBlock),
          }));
          const lineCount = Math.max(...typedBeats.map((t) => t.blocks.length));

          /* THE GHOST LAYOUT (founder: nothing may shift, the block
             never collapses): before the first character moves, every
             LINE SEAT reserves the tallest box any beat's line needs at
             that seat — full copy in, per-index max measured, pinned as
             min-height on every beat's line — so the seats stand
             rect-identical across beats and through every transition;
             typing changes glyphs, never geometry. Greedy wrapping
             (fullstack.css drops balance/pretty on the stage) keeps a
             half-written line breaking exactly where the full line
             breaks. Re-run on refresh: the stage re-lays with dvh. */
          const reserveTyped = () => {
            typedBeats.forEach(({ blocks }) =>
              blocks.forEach((block) => {
                block.host.style.removeProperty('min-height');
                block.chunks.forEach((chunk) => {
                  if (chunk.kind === 'text') chunk.node.data = chunk.full;
                });
              })
            );
            const seats: number[] = [];
            typedBeats.forEach(({ blocks }) =>
              blocks.forEach((block, k) => {
                seats[k] = Math.max(seats[k] ?? 0, block.host.getBoundingClientRect().height);
              })
            );
            typedBeats.forEach(({ blocks }) =>
              blocks.forEach((block, k) => {
                block.host.style.minHeight = `${seats[k] ?? 0}px`;
              })
            );
          };

          /* write line k of beat i at pen count n: text nodes take the
             prefix, marks show once the budget crosses them — the
             line's own box never moves (reserved above), and the
             bullets' dash leaders live on the hosts, which stay
             visible with their beat, so the zone always keeps its
             structure even at the all-empty pose */
          const writeBlock = (i: number, k: number, count: number) => {
            const block = typedBeats[i]?.blocks[k];
            if (!block) return;
            let n = Math.round(count);
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
          };

          /* ===== THE PEN (founder, two rounds): presence is spoken by
             characters, never alpha — a beat's opacity is 1 or 0,
             nothing between — and the lines move TOGETHER: a leaving
             beat's lines all erase CONCURRENTLY (one 0.35s clock, so
             they empty in the same breath), the arriving beat's lines
             write back in parallel under a small cascade, each inside
             its reserved seat. The writer is a TARGET QUEUE, the
             story's own seek grammar for text: scroll only retargets
             it; a mid-flight line finishes or reverses cleanly from its
             current character count (kill the tween, keep the pen —
             never a stale pose), and the zone changes hands only at the
             all-empty pose, so two beats' glyphs can never share a
             frame however hard the scrub storms. */
          const WRITE_CPS = 150;
          const WRITE_MIN = 0.35;
          const WRITE_STAGGER = 0.07;
          const DELETE_DUR = 0.35;
          const pens = Array.from({ length: lineCount }, () => ({ n: 0 }));
          const penTweens: gsap.core.Tween[] = [];
          let shown = 0;
          let target = 0;
          let seeded = false;
          const showOnly = (i: number) => {
            beats.forEach((beat, k) => {
              /* whole steps only — the probe's law: no frame anywhere
                 between 0 and 1. visibility keeps the parked beats out
                 of the accessibility tree and taps. */
              beat.style.opacity = k === i ? '1' : '0';
              beat.style.visibility = k === i ? 'visible' : 'hidden';
            });
          };
          const renderShown = () => {
            pens.forEach((pen, k) => writeBlock(shown, k, pen.n));
          };
          const holdPens = () => {
            for (const t of penTweens) t.kill();
            penTweens.length = 0;
          };
          const step = () => {
            penTweens.length = 0;
            const blocks = typedBeats[shown]?.blocks ?? [];
            if (shown !== target) {
              if (pens.every((pen) => pen.n <= 0)) {
                /* the all-empty pose: the ONLY frame the zone may change
                   hands — the leaving glyphs are gone before the arriving
                   beat shows, so mixed text is structurally impossible */
                shown = target;
                renderShown();
                showOnly(shown);
                step();
                return;
              }
              pens.forEach((pen, k) => {
                if (pen.n <= 0 || !blocks[k]) {
                  pen.n = 0;
                  return;
                }
                penTweens.push(
                  gsap.to(pen, {
                    n: 0,
                    duration: DELETE_DUR,
                    ease: 'none',
                    autoRound: false,
                    onUpdate: () => writeBlock(shown, k, pen.n),
                    onComplete: () => {
                      if (penTweens.every((t) => !t.isActive())) step();
                    },
                  })
                );
              });
              return;
            }
            pens.forEach((pen, k) => {
              const full = blocks[k]?.len ?? 0;
              if (pen.n >= full) {
                pen.n = full;
                return;
              }
              penTweens.push(
                gsap.to(pen, {
                  n: full,
                  duration: Math.max(WRITE_MIN, (full - pen.n) / WRITE_CPS),
                  /* the cascade belongs to FRESH writes; a resumed line
                     (a reversed delete) picks its pen back up now */
                  delay: pen.n > 0 ? 0 : k * WRITE_STAGGER,
                  ease: 'none',
                  autoRound: false,
                  onUpdate: () => writeBlock(shown, k, pen.n),
                })
              );
            });
          };
          const retype = (i: number) => {
            if (!seeded) {
              /* the first clock read seeds the pose instantly — the
                 rest view and a restored or deep-linked scroll land on
                 standing copy, like the desktop rail's rest state */
              seeded = true;
              shown = i;
              target = i;
              pens.forEach((pen, k) => {
                pen.n = typedBeats[i]?.blocks[k]?.len ?? 0;
              });
              renderShown();
              showOnly(i);
              return;
            }
            if (i === target) return;
            target = i;
            holdPens();
            step();
          };

          restoreTyped = () => {
            holdPens();
            typedBeats.forEach(({ blocks }) =>
              blocks.forEach((block) => {
                block.host.style.removeProperty('min-height');
                block.chunks.forEach((chunk) => {
                  if (chunk.kind === 'text') chunk.node.data = chunk.full;
                  else chunk.el.style.removeProperty('visibility');
                });
              })
            );
          };

          const apply = (p: number) => {
            /* the beat clock: which segment owns the playhead — the
               build, the pen, and the hunk all read the same number */
            const active = Math.min(beats.length - 1, Math.max(0, Math.floor(p / SEG)));
            retype(active);
            setHot(active);
            /* the tower HOLDS each section's standing pose — section k
               shows exactly its own layers (founder: "only the first
               layer showing up for the first section") — and the
               segment runs the shared hold → build → lock shape, so
               the next layer seats and STANDS before the next section's
               copy takes the zone. The last segment's build is the
               crest: the channel's final run to the rail's top. */
            const heldT = beatEnd[active] ?? story.duration();
            const crest = active === beats.length - 1;
            const nextT = beatEnd[active + 1] ?? CREST_END;
            const segP = gsap.utils.clamp(0, 1, p / SEG - active);
            story.time(
              crest
                ? gapTime(heldT, nextT, segP, CREST_HOLD, CREST_LOCK)
                : gapTime(heldT, nextT, segP)
            );
            if (capTl) {
              capTl.progress(gsap.utils.clamp(0, 1, (p - CAP_FROM) / (CAP_TO - CAP_FROM)));
            }
          };

          reserveTyped();

          /* ===== THE SCRUB'S DAMPER (founder: "the connectors coming
             from rail lines are a little laggy … i want it to look
             seamless like it does on desktop"). Desktop's capTl rides
             scrub: 0.35 — ScrollTrigger's own damped clock between
             scroll and paint. The stage fed apply() RAW progress: every
             scroll EVENT scrubbed capTl (strokeDashoffset writes on each
             cap wire — a non-compositable SVG repaint), retyped the pen
             and stepped the rail, so a burst of touch-scroll events
             meant a burst of same-frame repaints. Now the trigger only
             moves a TARGET; one gsap.ticker lerp chases it and calls
             apply() once per FRAME — taps, capTl, typing and rail all
             ride one damped clock, the stage's equivalent of scrub:
             0.35. The ticker detaches when settled (epsilon parks it
             DEAD ON target so no residue leaks into the beat math) and
             re-attaches on new input, so a resting stage burns nothing. */
          let pCur = 0;
          let pTarget = 0;
          let scrubOn = false;
          const SCRUB_EPS = 0.0004;
          const scrubTick = () => {
            pCur += (pTarget - pCur) * 0.22;
            if (Math.abs(pTarget - pCur) < SCRUB_EPS) {
              pCur = pTarget;
              gsap.ticker.remove(scrubTick);
              scrubOn = false;
            }
            apply(pCur);
          };
          const retarget = (p: number) => {
            pTarget = p;
            if (!scrubOn && Math.abs(pTarget - pCur) >= SCRUB_EPS) {
              scrubOn = true;
              gsap.ticker.add(scrubTick);
            }
          };
          killScrub = () => {
            gsap.ticker.remove(scrubTick);
            scrubOn = false;
          };

          if (runway) {
            const master = ScrollTrigger.create({
              trigger: runway,
              start: 'top bottom',
              end: 'bottom bottom',
              onUpdate: (self) => retarget(self.progress),
            });
            /* a deep link or restored scroll lands mid-story: seed BOTH
               clocks from wherever the trigger already reads and paint
               once — never a lerp in from 0 across the whole story */
            pCur = master.progress;
            pTarget = master.progress;
            apply(pCur);
          }

          /* the stage re-lays with the real viewport (dvh: the mobile
             chrome collapses, an orientation turn): re-derive the
             arrival's px mapping and the line seats, then restate the
             standing pose from the same clocks */
          onStageRefresh = () => {
            arrGeo.ready = false;
            if (arrival.t < 1) applyArrival();
            else if (railExt) gsap.set(railExt, { scaleY: 1 });
            reserveTyped();
            if (seeded) renderShown();
          };
          ScrollTrigger.addEventListener('refresh', onStageRefresh);
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
          },
        });
        inView = viewGate.isActive;
        syncLoops();

        return () => {
          /* the stage's own residue: the layout class and the pen's
             direct style writes (no tween owns them, so no revert does) */
          if (staged) {
            scope.classList.remove('is-stage');
            /* the damper first: a ticker tick after teardown would call
               apply() into dead triggers */
            killScrub?.();
            for (const beat of beats) {
              beat.style.removeProperty('opacity');
              beat.style.removeProperty('visibility');
            }
            restoreTyped?.();
            if (railExt) gsap.set(railExt, { clearProps: 'transform' });
          }
          if (onStageRefresh) ScrollTrigger.removeEventListener('refresh', onStageRefresh);
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
        staticPose();
        return clear;
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className='tc-band tcb v0-stack' id='platform' ref={root} aria-labelledby='v0-stack-title'>
      <div className='tcb-in'>
        {/* the head wears the section-head grammar so the FULL-STACK
            watermark (the Layers glyph — founder: "use the full stack
            icon here") seats whole at the house 240 gauge, like the
            developer and context heads */}
        <div className='tc-head'>
          <Layers className='tc-head-icon' strokeWidth={1} aria-hidden />
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
            {/* THE RAIL'S LOWER REACH, stage only (founder: the blue line
                must run to the bottom and emerge from it): the accent
                fill's continuation below the fig/text zone seam — same x,
                same gauge as the cell's grey track continuation, anchored
                at the cell's foot and scaled bottom-up by the story's
                arrival dial. display: none everywhere the stage isn't
                (fullstack.css), so desktop and the static fallbacks never
                see it. */}
            <div className='v0sm-railext' aria-hidden />
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
