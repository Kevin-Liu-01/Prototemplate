'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Braces,
  CalendarDays,
  Coins,
  Cookie,
  Globe,
  Hash,
  Languages,
  Link,
  ListTree,
  MapPin,
} from 'lucide-react';
import { useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import { prefersReducedMotion } from '@/app/d/toolchain/diagrams/lang/lang';
import SentenceWidth, { SENTENCE_SAMPLES } from '@/app/d/toolchain/diagrams/lang/SentenceWidth';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
import { BentoCell } from '@/components/shell/Bento';

import './developer.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The props lucide marks take here — 14–16px functional identification. */
type MarkIcon = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}>;

/* Fixed inputs — every displayed value is real Intl output computed at
   render, never a transcribed string. Only the plural sentences are
   hand-written (Intl renders no words), and even there the category and
   the form count come from Intl.PluralRules. */
const NUMBER_INPUT = 1234567.89;
const CURRENCY_INPUT = 1234.5;
const DATE_INPUT = new Date(Date.UTC(2026, 7, 4));
const PLURAL_COUNT = 3;

function formatNumber(locale: string): string {
  return new Intl.NumberFormat(locale).format(NUMBER_INPUT);
}

function formatCurrency(locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(CURRENCY_INPUT);
}

function formatDate(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(DATE_INPUT);
}

/** The quiet per-branch annotation: which form the count picked, out of how
    many the locale declares — both straight from Intl.PluralRules. */
function pluralNote(locale: string): string {
  const rules = new Intl.PluralRules(locale);
  const forms = rules.resolvedOptions().pluralCategories.length;
  if (forms === 1) return 'the only form';
  return `${rules.select(PLURAL_COUNT)} · one of ${forms} forms`;
}

/* ---------- the four branching minis ----------
   One raw value forking to three per-locale renderings, in the lang-cr fork
   grammar miniaturized: each branch is one path stroked twice — a full-gauge
   ink underline and a card-colored core — leaving two parallel 1px threads
   at a constant 2px gap. Landings sit at the centers of three equal rows
   (1/6, 1/2, 5/6 of the stretched drawing; non-scaling-stroke holds the
   gauge under preserveAspectRatio='none'). */

const FORK_PATHS = [
  'M0 48 H8 C20 48 17 16 28 16 H40',
  'M0 48 H40',
  'M0 48 H8 C20 48 17 80 28 80 H40',
] as const;

type ForkBranch = {
  code: string;
  value: string;
  /** plural rows carry the form-count annotation under the sentence */
  note?: string;
  lang?: string;
  rtl?: boolean;
  /** plural sentences are UI strings — the text face, not the value mono */
  sans?: boolean;
};

type ForkSpec = {
  label: string;
  icon: MarkIcon;
  source: string;
  branches: readonly [ForkBranch, ForkBranch, ForkBranch];
  /** the branch the accent resolves — the edge case worth announcing */
  featured: number;
  title: string;
};

const FORKS: readonly ForkSpec[] = [
  {
    label: 'Numbers',
    icon: Hash,
    source: '1234567.89',
    branches: [
      { code: 'en-US', value: formatNumber('en-US') },
      { code: 'de-DE', value: formatNumber('de-DE') },
      { code: 'ar-EG', value: formatNumber('ar-EG'), lang: 'ar-EG', rtl: true },
    ],
    featured: 2,
    title: 'The number 1234567.89 forking to its en-US, de-DE and ar-EG renderings',
  },
  {
    label: 'Currency',
    icon: Coins,
    source: '1234.5',
    branches: [
      { code: 'en-US', value: formatCurrency('en-US', 'USD') },
      { code: 'ja-JP', value: formatCurrency('ja-JP', 'JPY'), lang: 'ja' },
      { code: 'de-DE', value: formatCurrency('de-DE', 'EUR') },
    ],
    featured: 1,
    title: 'The amount 1234.5 forking to US dollar, Japanese yen and euro renderings',
  },
  {
    label: 'Dates',
    icon: CalendarDays,
    source: '2026-08-04',
    branches: [
      { code: 'en-US', value: formatDate('en-US') },
      { code: 'de-DE', value: formatDate('de-DE') },
      { code: 'ja-JP', value: formatDate('ja-JP'), lang: 'ja' },
    ],
    featured: 2,
    title: 'The date 2026-08-04 forking to its en-US, de-DE and ja-JP renderings',
  },
  {
    label: 'Plural forms',
    icon: ListTree,
    source: '3',
    branches: [
      { code: 'en', value: '3 files', note: pluralNote('en'), sans: true },
      { code: 'ar', value: '٣ ملفات', note: pluralNote('ar'), lang: 'ar', rtl: true, sans: true },
      { code: 'ja', value: '3個のファイル', note: pluralNote('ja'), lang: 'ja', sans: true },
    ],
    featured: 1,
    title: 'A count of 3 forking to English, Arabic and Japanese plural sentences',
  },
];

/* One shared clock: each fork takes one DWELL slot on a paused master, so
   only one diagram is ever mid-announcement; the master gates on the cell's
   viewport dwell. Same beats as the ContextResolve family. */
const DWELL = 3;
const LEAD = 0.35;
const TRAVERSE = 1.6;
const PULSE_SEG = 0.18;
const REST_DIM = 0.55;
const EASE_IN = 0.35;
const EASE_OUT = 0.45;

/* The traveling window is carved from real geometry, not a dash pattern:
   under this SVG's anisotropic stretch plus non-scaling-stroke, browsers
   disagree about which space dash distances live in. Twin of the helpers in
   toolchain/diagrams/lang/ContextResolve.tsx — duplicated because each
   diagram family owns its own file set. */

type PulseTrace = {
  length: number;
  step: number;
  points: readonly { x: number; y: number }[];
};

/** Dense user-space samples (1u apart) of a path. The source `d` is cached
    on the element the first time through: the animation blanks `d` every
    tick, so a re-run of the effect would otherwise trace an emptied path. */
function tracePath(el: SVGPathElement): PulseTrace | null {
  const source = el.dataset.traceD ?? el.getAttribute('d') ?? '';
  if (!source) return null;
  el.dataset.traceD = source;
  if (el.getAttribute('d') !== source) el.setAttribute('d', source);
  const length = el.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) return null;
  const step = 1;
  const count = Math.max(2, Math.ceil(length / step) + 1);
  const points = Array.from({ length: count }, (_, i) => {
    const p = el.getPointAtLength(Math.min(length, i * step));
    return { x: p.x, y: p.y };
  });
  return { length, step, points };
}

/** The point `at` user units along a trace, interpolated between samples. */
function pointOn(trace: PulseTrace, at: number): { x: number; y: number } {
  const t = Math.min(Math.max(at, 0), trace.length) / trace.step;
  const lo = Math.min(trace.points.length - 1, Math.floor(t));
  const hi = Math.min(trace.points.length - 1, lo + 1);
  const a = trace.points[lo];
  const b = trace.points[hi];
  if (!a || !b) return { x: 0, y: 0 };
  const f = t - lo;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

/** The [from, to] slice of a trace as a path string — empty while the window
    is off either end, so each traversal enters and exits cleanly. */
function windowPath(trace: PulseTrace, from: number, to: number): string {
  const a = Math.max(0, from);
  const b = Math.min(trace.length, to);
  if (b - a < 0.5) return '';
  const start = pointOn(trace, a);
  const parts = [`M${start.x.toFixed(2)} ${start.y.toFixed(2)}`];
  for (let i = Math.ceil(a / trace.step); i * trace.step < b; i++) {
    const p = trace.points[i];
    if (p) parts.push(`L${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  const end = pointOn(trace, b);
  parts.push(`L${end.x.toFixed(2)} ${end.y.toFixed(2)}`);
  return parts.join(' ');
}

function BranchForks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const forks = gsap.utils.toArray<HTMLElement>('[data-dev-fork]', rootEl);
      if (forks.length !== FORKS.length) return;

      /* The still frame IS the static accent thread on each fork's featured
         branch; the pulses never run and stay hidden from the stylesheet. */
      if (prefersReducedMotion()) {
        forks.forEach((fork) => {
          const live = fork.querySelector('[data-dev-live]');
          if (live) gsap.set(live, { autoAlpha: 1 });
        });
        return;
      }

      const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power2.inOut' } });

      forks.forEach((fork, d) => {
        const pulse = fork.querySelector<SVGPathElement>('[data-dev-pulse]');
        const outs = gsap.utils.toArray<HTMLElement>('[data-dev-out]', fork);
        const featured = Number(fork.dataset.devFeatured ?? '0');
        const rest = outs.filter((_, i) => i !== featured);
        const t0 = d * DWELL;

        if (pulse) {
          /* Traced before the `d` is blanked — an emptied path has no
             length. Once blanked, the pulse only paints while its window
             is on-path, so no visibility gates are needed. */
          const trace = tracePath(pulse);
          pulse.setAttribute('d', '');
          gsap.set(pulse, { autoAlpha: 1 });
          if (trace) {
            const seg = trace.length * PULSE_SEG;
            const journey = trace.length + seg;
            const state = { head: 0 };
            tl.fromTo(
              state,
              { head: 0 },
              {
                head: journey,
                duration: TRAVERSE,
                ease: 'none',
                immediateRender: false,
                onUpdate: () => {
                  pulse.setAttribute('d', windowPath(trace, state.head - seg, state.head));
                },
              },
              t0 + LEAD
            );
          }
        }

        /* The resolving branch is announced by the others resting: the two
           quiet rows dim while the window travels, and everyone is back at
           full ink flush on the slot boundary — the restore's end IS the
           dwell edge, so the loop's natural length equals its declared one. */
        if (rest.length) {
          tl.to(rest, { autoAlpha: REST_DIM, duration: EASE_IN }, t0 + LEAD).to(
            rest,
            { autoAlpha: 1, duration: EASE_OUT },
            t0 + DWELL - EASE_OUT
          );
        }
      });

      ScrollTrigger.create({
        trigger: rootEl,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: root }
  );

  return (
    <div className='v0-dev-forks' ref={root}>
      {FORKS.map((spec) => {
        const Icon = spec.icon;
        return (
          <div
            className='v0-dev-fork'
            data-dev-fork=''
            data-dev-featured={spec.featured}
            role='img'
            aria-label={spec.title}
            key={spec.label}
          >
            <p className='v0-dev-fork-label'>
              <Icon className='v0-dev-fork-ic' size={15} strokeWidth={1.6} aria-hidden />
              {spec.label}
            </p>
            <div className='v0-dev-fork-body'>
              <span className='v0-dev-src'>{spec.source}</span>
              <span className='v0-dev-mid'>
                {/* lang-cr's layer order, miniaturized: threads first, the
                    pulse next, cores last — the traveling window rides
                    between its thread and the carve, so mid-travel it is two
                    accent hairlines. The static accent pair closes the stack
                    as the reduced-motion still. */}
                <svg
                  className='v0-dev-threads'
                  viewBox='0 0 40 96'
                  preserveAspectRatio='none'
                  aria-hidden='true'
                >
                  {FORK_PATHS.map((d) => (
                    <path className='v0-dev-thread' d={d} key={`thread-${d}`} />
                  ))}
                  <path className='v0-dev-pulse' data-dev-pulse='' d={FORK_PATHS[spec.featured]} />
                  {FORK_PATHS.map((d) => (
                    <path className='v0-dev-core' d={d} key={`core-${d}`} />
                  ))}
                  <g className='v0-dev-live' data-dev-live=''>
                    <path className='v0-dev-thread is-live' d={FORK_PATHS[spec.featured]} />
                    <path className='v0-dev-core' d={FORK_PATHS[spec.featured]} />
                  </g>
                </svg>
              </span>
              <div className='v0-dev-outs'>
                {spec.branches.map((branch) => (
                  <div className='v0-dev-out' data-dev-out='' key={branch.code}>
                    <LocaleTag code={branch.code} />
                    <span className='v0-dev-out-val'>
                      <span
                        className={branch.sans ? 'v0-dev-val is-sans' : 'v0-dev-val'}
                        lang={branch.lang}
                        dir={branch.rtl ? 'rtl' : undefined}
                      >
                        {branch.value}
                      </span>
                      {branch.note ? <span className='v0-dev-note'>{branch.note}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- the routing ledger ----------
   Five real ways a request lands on a locale, each row the mechanism
   itself: prefix, subdomain (with a localized pathname), ccTLD, and the
   two negotiated routes written as the headers they are. */

type Route = {
  icon: MarkIcon;
  code: string;
  path: ReactNode;
};

const ROUTES: readonly Route[] = [
  {
    icon: Link,
    code: 'es',
    path: (
      <>
        example.com<b>/es</b>/about
      </>
    ),
  },
  {
    icon: Globe,
    code: 'de',
    path: (
      <>
        <b>de.</b>example.com/über-uns
      </>
    ),
  },
  {
    icon: MapPin,
    code: 'fr',
    path: (
      <>
        example<b>.fr</b>/a-propos
      </>
    ),
  },
  {
    icon: Languages,
    code: 'ja',
    path: (
      <>
        Accept-Language: <b>ja</b>
        <span className='is-to'>→</span>/ja/about
      </>
    ),
  },
  {
    icon: Cookie,
    code: 'zh',
    path: (
      <>
        Cookie: locale=<b>zh</b>
        <span className='is-to'>→</span>/zh/about
      </>
    ),
  },
];

/**
 * Built for developers — one row of three equal framed columns: the measured
 * SentenceWidth diagram, the four branching minis, and the routing ledger.
 * The grid's 1px hair gaps own every seam; the cards pad to the section
 * gutter, so the artifacts share the header's left rule.
 */
type V0DeveloperProps = {
  /** The non-terminal home re-heads this beat as "Localization is complex." */
  heading?: string;
  sub?: string;
};

export default function V0Developer({
  heading = 'Built for the world’s developers.',
  sub = 'General Translation handles all the infrastructure, so you no longer need to think about localization.',
}: V0DeveloperProps) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec v0-dev' id='developers' ref={root}>
      <div className='tc-head'>
        <Braces className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>{heading}</h2>
        <p data-reveal>{sub}</p>
      </div>

      <div className='tc-row v0-dev-grid' data-eq-heads=''>
        <BentoCell
          cell='is-framed'
          title='GT handles component sizing and orientation.'
        >
          <div className='tc-lang is-lead'>
            <SentenceWidth
              samples={[
                ...SENTENCE_SAMPLES,
                { tag: 'he', name: 'עברית', lang: 'he', rtl: true, text: 'שמור שינויים', hint: '−18%' },
              ]}
              title='The same sentence measured in English, German, Japanese, Arabic and Hebrew'
            />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-framed'
          title='GT handles every branch and edge case.'
        >
          <BranchForks />
        </BentoCell>

        <BentoCell cell='is-framed' title='GT handles locale routing.'>
          <div className='v0-dev-routes'>
            {ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <div className='v0-dev-route' key={route.code}>
                  <Icon className='v0-dev-route-ic' size={15} strokeWidth={1.6} aria-hidden />
                  <code className='v0-dev-route-path'>{route.path}</code>
                  <LocaleTag code={route.code} />
                </div>
              );
            })}
          </div>
        </BentoCell>
      </div>
    </section>
  );
}
