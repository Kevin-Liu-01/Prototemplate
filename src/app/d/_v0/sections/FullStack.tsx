'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';

import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';

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
 * the copy scrolls) and the four-layer copy rail in the other; the grid
 * owns the one seam between them. Each beat's block owns a ScrollTrigger;
 * as it crosses the read line
 * the rail's spotlight moves to it and the tower answers twice over: the
 * stack BUILDS — only the slabs up to the beat's level exist, and the next
 * level settles in from above as the story advances (and leaves again on
 * the way back up) — and the beat's slab(s) take the tower's highest z,
 * lift up the iso vertical, and light their accent edge and label, while
 * the rest stay solid but dimmer. One timeline per transition, never
 * pinned by JS (the figure is CSS sticky). Reduced motion and the no-JS
 * resting markup get the FULL stack with the first beat lit, statically —
 * four legible slabs over a truer-but-emptier one.
 */
type V0FullStackProps = {
  /** The non-terminal home's subhead differs per its spec. */
  sub?: string;
};

export default function V0FullStack({ sub = 'Everything you need to reach your next billion global users.' }: V0FullStackProps) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const slabs = gsap.utils.toArray<HTMLElement>('[data-tower-slab]', scope);
      const beats = gsap.utils.toArray<HTMLElement>('[data-stack-beat]', scope);
      const taps = gsap.utils.toArray<SVGGElement>('[data-rail-tap]', scope);
      const rail = scope.querySelector<SVGGElement>('[data-rail-line]');
      if (slabs.length === 0 || beats.length === 0) return;

      /* class + stacking state, shared by both motion branches: hot slabs
         take full ink, the accent edge, and the tower's highest z — above
         even the slab overhead, so the whole plate reads when it pops. The
         hot plate's rail tap takes the accent with it. */
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
          gsap.set(tap, { clearProps: 'opacity,visibility' });
        }
        if (rail) gsap.set(rail, { clearProps: 'transform' });
        for (const beat of beats) beat.classList.remove('is-hot', 'is-cold');
      };

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* which slabs exist right now — the build's one piece of state,
           so entering and leaving slabs can be staged differently */
        const shown = slabs.map(() => false);

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
              if (tap) gsap.set(tap, { autoAlpha: visible ? 1 : 0 });
            } else if (visible && !shown[i]) {
              /* arriving: drop in from above its seat, bottom-up; the
                 plate's rail tap fades in with it */
              const at = entered * 0.14;
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, at);
              if (tap) tl.to(tap, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, at + 0.1);
              entered += 1;
            } else if (visible) {
              /* staying: glide to the new seat */
              tl.to(slab, { y: seat, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 0);
              if (tap) tl.to(tap, { autoAlpha: 1, duration: 0.3 }, 0);
            } else {
              /* leaving: rise back out and fade, tap first */
              tl.to(slab, { y: seat - DROP, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0);
              if (tap) tl.to(tap, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0);
            }
            shown[i] = visible;
          });

          /* the rail extends to the newest plate's tap (or retracts),
             threading the built stack together as it settles */
          if (rail) {
            const scaleY = RAIL_SCALE[count - 1] ?? 1;
            if (instant) gsap.set(rail, { scaleY, svgOrigin: RAIL_ORIGIN });
            else {
              tl.to(rail, { scaleY, svgOrigin: RAIL_ORIGIN, duration: 0.6, ease: 'power2.inOut' }, 0);
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
        beats.forEach((beat, i) => {
          ScrollTrigger.create({
            trigger: beat,
            start: i === 0 ? 'top bottom' : 'top 58%',
            end: i === beats.length - 1 ? 'bottom top' : 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setActive(i, false);
            },
          });
        });

        return clear;
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
        for (const tap of taps) gsap.set(tap, { autoAlpha: 1 });
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
          <p data-reveal>{sub}</p>
        </div>

        <div className='tcb-grid'>
          {/* The drawing's cell: the solid four-slab tower, sticky while
              the copy rail beside it scrolls; the stack builds and the
              spotlight lifts each beat's slab in turn. Born with the first
              beat hot so the resting frame already tells the story. */}
          <div className='tcb-cell v0-stack-cell-fig' data-cell>
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
              each block's copy centered in its scroll window. */}
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
                      <span className='v0-stack-idx'>{String(i + 1).padStart(2, '0')}</span>
                      <Icon className='v0-stack-ic' size={14} strokeWidth={1.75} aria-hidden />
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
