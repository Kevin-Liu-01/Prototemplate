'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Languages, Layers } from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType } from 'react';

import TcStackIso, { STACK_LAYERS } from '@/app/d/toolchain/diagrams/tc-stack-iso';

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
 * first sentence (the lead), plus the diagram planes it spotlights. Plane
 * membership is by STACK_LAYERS id, never by index, so the mapping survives
 * any reordering of the house drawing.
 */
type StackBeat = {
  id: string;
  name: string;
  lead: string;
  body: string;
  icon: ComponentType<BeatIconProps>;
  planeIds: readonly string[];
};

/**
 * The four layers, VERBATIM from the Figma spec — ordered bottom-up per the
 * spec's own directive ("start from foundations in code and build up"):
 * Code -> Context -> Translations -> Agents. Each beat lights the planes of
 * the seven-plane house stack that belong to its story: Code is the source
 * and the CLI that reads it; Context is the context plane; Translations run
 * from review through the edge to the rendered string; Agents is Locadex.
 */
const BEATS: readonly StackBeat[] = [
  {
    id: 'code',
    name: 'Code',
    lead: 'Your codebase is the source of truth.',
    body: 'GT internationalizes it to support 120+ locales. Open-source internationalization (i18n) libraries with SDKs for every stack.',
    icon: Code2,
    planeIds: ['app-code', 'gt-cli'],
  },
  {
    id: 'context',
    name: 'Context',
    lead: 'Deliver the best experience of your product in every language.',
    body: 'GT translates with full understanding of your context. Define key product terms, tone, and style to keep consistent across every surface.',
    icon: Layers,
    planeIds: ['context'],
  },
  {
    id: 'translations',
    name: 'Translations',
    lead: 'See translations in every target locale, in just minutes.',
    body: 'Review both static and dynamic content before you go live. Preview, annotate, and approve from the Dashboard.',
    icon: Languages,
    planeIds: ['review', 'edge-cdn', 'runtime'],
  },
  {
    id: 'agents',
    name: 'Agents',
    lead: 'Automate the whole process.',
    body: 'Locadex keeps your app localized with every update. The Locadex agent is the fastest way to localize your app, end-to-end. Just merge a PR.',
    icon: Bot,
    planeIds: ['locadex'],
  },
];

/** Each beat's plane set, resolved once to indices into the house drawing. */
const HOT_PLANES: readonly (readonly number[])[] = BEATS.map((beat) =>
  beat.planeIds
    .map((id) => STACK_LAYERS.findIndex((layer) => layer.id === id))
    .filter((i) => i >= 0)
);

/**
 * V0 Full Stack — "The full stack for localization."
 *
 * The house isometric stack stands sticky on the left of a full-bleed dark
 * band while the four-layer copy rail scrolls beside it. Each beat's block
 * owns a ScrollTrigger; as it crosses the read line the rail's spotlight
 * moves to it and the drawing answers — its planes rise and take full ink
 * (with the brand's doubled top edge) while the rest fall back to glass.
 * Progress-driven, never pinned, so the section composes safely inside any
 * variant's rail column. Reduced motion gets all four beats and the whole
 * drawing, static.
 */
export default function V0FullStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const planes = gsap.utils.toArray<SVGGElement>('.tcs-layer', scope);
        const beats = gsap.utils.toArray<HTMLElement>('[data-stack-beat]', scope);
        if (planes.length === 0 || beats.length === 0) return;

        const setActive = (active: number, instant: boolean) => {
          const hot = new Set(HOT_PLANES[active] ?? []);
          const dur = instant ? 0 : 0.3;
          planes.forEach((plane, i) => {
            const on = hot.has(i);
            gsap.to(plane, {
              y: on ? -5 : 0,
              opacity: on ? 1 : 0.34,
              duration: dur,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            /* the doubled top edge — the brand's line — on hot planes only */
            const dbl = plane.querySelector('.tcs-dbl');
            if (dbl) {
              gsap.to(dbl, { opacity: on ? 1 : 0, duration: dur, ease: 'power2.out', overwrite: 'auto' });
            }
          });
          beats.forEach((beat, i) => {
            beat.classList.toggle('is-hot', i === active);
            beat.classList.toggle('is-cold', i !== active);
          });
        };

        /* the story opens on its foundation: Code, before any scroll */
        setActive(0, true);

        /* contiguous windows over one read line — exactly one beat is
           active at every scroll stop, and the last one holds past the
           section's end instead of going dark */
        beats.forEach((beat, i) => {
          ScrollTrigger.create({
            trigger: beat,
            start: 'top 58%',
            end: 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setActive(i, false);
            },
          });
        });

        return () => {
          for (const beat of beats) beat.classList.remove('is-hot', 'is-cold');
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className='v0-stack' ref={root} aria-labelledby='v0-stack-title'>
      <div className='v0-stack-in'>
        <div className='v0-stack-head'>
          <h2 id='v0-stack-title'>The full stack for localization.</h2>
          <p>Everything you need to reach your next billion global users.</p>
        </div>

        <div className='v0-stack-body'>
          <div className='v0-stack-figcol'>
            <div className='v0-stack-fig'>
              <TcStackIso
                className='v0-stack-iso'
                title='The GT stack, bottom-up: app code and the GT CLI, the Locadex agent, context, review, the edge CDN, and the translated string at runtime'
              />
            </div>
          </div>

          <ol className='v0-stack-rail'>
            {BEATS.map((beat, i) => {
              const Icon = beat.icon;
              return (
                <li className='v0-stack-beat' data-stack-beat={i} key={beat.id}>
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
    </section>
  );
}
