'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';

import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';

import StackTower, { TOWER_LAYERS } from './StackTower';

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
 * Code -> Context -> Translations -> Agents. Each beat lights the slabs of
 * the seven-slab tower that belong to its story: Code is the source and the
 * CLI that reads it; Context is the context slab; Translations run from
 * review through the edge to the rendered string; Agents is Locadex.
 */
const BEATS: readonly StackBeat[] = [
  {
    id: 'code',
    name: 'Code',
    lead: 'Your codebase is the source of truth.',
    body: 'GT internationalizes it to support 120+ locales. Open-source internationalization (i18n) libraries with SDKs for every stack.',
    icon: Code2,
    slabIds: ['app-code', 'gt-cli'],
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
    slabIds: ['review', 'edge-cdn', 'runtime'],
  },
  {
    id: 'agents',
    name: 'Agents',
    lead: 'Automate the whole process.',
    body: 'Locadex keeps your app localized with every update. The Locadex agent is the fastest way to localize your app, end-to-end. Just merge a PR.',
    icon: Bot,
    slabIds: ['locadex'],
  },
];

/** Each beat's slab set, resolved once to indices into the tower. */
const HOT_SLABS: readonly (readonly number[])[] = BEATS.map((beat) =>
  beat.slabIds
    .map((id) => TOWER_LAYERS.findIndex((layer) => layer.id === id))
    .filter((i) => i >= 0)
);

/**
 * The two strokes of the tower's answer, in screen px. The hot slabs rise
 * LIFT out of the tower; every slab ABOVE the hot block rises LIFT + OPEN,
 * so the stack visibly opens at the active layer and a band of the hot
 * slab's accent-edged top face comes into view. The combined rise stays
 * under one rendered slab step, so the tower always reads as one stack,
 * never as parts (and under the figure's 42px top pad, so nothing clips).
 */
const LIFT = 12;
const OPEN = 26;

/**
 * V0 Full Stack — "The full stack for localization." — recomposed in the
 * toolchain dark-band grammar: tc-band tcb → tcb-in → tcb-head → tcb-grid,
 * the same sheet DarkBand draws its seams and surfaces from. The solid
 * seven-slab tower sits in one tcb-cell (sticky while the copy scrolls) and
 * the four-layer copy rail in the other; the grid owns the one seam between
 * them. Each beat's block owns a ScrollTrigger; as it crosses the read line
 * the rail's spotlight moves to it and the tower answers — the beat's
 * slab(s) take the tower's highest z, lift a few px up the iso vertical,
 * and light their accent edge and label, while the rest stay solid but
 * dimmer. One tween per transition, never pinned by JS (the figure is CSS
 * sticky). Reduced motion gets the resting composition with the first beat
 * lit, statically.
 */
export default function V0FullStack() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const slabs = gsap.utils.toArray<HTMLElement>('[data-tower-slab]', scope);
      const beats = gsap.utils.toArray<HTMLElement>('[data-stack-beat]', scope);
      if (slabs.length === 0 || beats.length === 0) return;

      /* class + stacking state, shared by both motion branches: hot slabs
         take full ink, the accent edge, and the tower's highest z — above
         even the slab overhead, so the whole plate reads when it pops. */
      const paint = (active: number) => {
        const hot = new Set(HOT_SLABS[active] ?? []);
        slabs.forEach((slab, i) => {
          slab.classList.toggle('is-hot', hot.has(i));
          slab.style.zIndex = String(hot.has(i) ? slabs.length + 1 + i : i + 1);
        });
        beats.forEach((beat, i) => {
          beat.classList.toggle('is-hot', i === active);
          beat.classList.toggle('is-cold', i !== active);
        });
      };

      /* the tower's geometry answer: hot slabs rise LIFT; everything above
         the hot block rises LIFT + OPEN, opening the stack at the active
         layer. One coordinated tween per transition (duration 0 = place). */
      const place = (active: number, duration: number) => {
        const hot = HOT_SLABS[active] ?? [];
        const set = new Set(hot);
        const top = hot.length > 0 ? Math.max(...hot) : -1;
        slabs.forEach((slab, i) => {
          gsap.to(slab, {
            y: set.has(i) ? -LIFT : i > top ? -(LIFT + OPEN) : 0,
            duration,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      };

      const clear = () => {
        slabs.forEach((slab, i) => {
          slab.classList.remove('is-hot');
          slab.style.zIndex = String(i + 1);
        });
        for (const beat of beats) beat.classList.remove('is-hot', 'is-cold');
      };

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const setActive = (active: number, instant: boolean) => {
          paint(active);
          place(active, instant ? 0 : 0.55);
        };

        /* the story opens on its foundation: Code, before any scroll */
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

      /* reduced motion: the resting composition, first beat lit, placed
         without a tween */
      mm.add('(prefers-reduced-motion: reduce)', () => {
        paint(0);
        place(0, 0);
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
          <p data-reveal>Everything you need to reach your next billion global users.</p>
        </div>

        <div className='tcb-grid'>
          {/* The drawing's cell: the solid seven-slab tower, sticky while
              the copy rail beside it scrolls; the scroll spotlight lifts
              each beat's slabs in turn. Born with the first beat hot so the
              resting frame already tells the story. */}
          <div className='tcb-cell v0-stack-cell-fig' data-cell>
            <div className='v0-stack-figcol'>
              <div className='v0-stack-fig' data-reveal>
                <StackTower
                  hot={HOT_SLABS[0] ?? []}
                  title='The GT stack, bottom-up: app code and the GT CLI, the Locadex agent, context, review, the edge CDN, and the translated string at runtime'
                />
              </div>
            </div>
          </div>

          {/* The copy rail's cell: four beats read bottom-up — Code,
              Context, Translations, Agents — divided by rules that run the
              cell edge to edge. */}
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
