'use client';

import { useGSAP } from '@gsap/react';
import { SiGithub, SiNextdotjs, SiNodedotjs, SiReact } from '@icons-pack/react-simple-icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import TcStackIso, { STACK_LAYERS } from '@/app/d/toolchain/diagrams/tc-stack-iso';
import PrismaticField from '@/components/shared/PrismaticField';

import { createInkField } from './band/inkField';

import './darkband-v3.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The band's time axis, kept from r2: one commit's journey, timestamped.
 * Every value is real product shape — the PR number is shared with the stack
 * drawing on purpose, so the two cells read as one story. Locale mentions
 * render through LocaleTag (the page's one locale system), never bare codes.
 */
const TRACE: readonly (readonly [string, string, ReactNode])[] = [
  ['09:41:02', 'committed', 'app/page.tsx'],
  ['09:41:18', 'extracted', 'hash 0f3a92'],
  ['09:41:44', 'pr opened', 'locadex · #218'],
  ['09:42:03', 'translated', '6 locales · 3.4 s'],
  ['09:44:37', 'approved', 'review · @mira'],
  ['09:45:01', 'published', 'edge · 3 regions'],
  [
    '09:45:09',
    'rendered',
    <span key='v'>
      <LocaleTag code='de' /> · 38 ms
    </span>,
  ],
];

/**
 * Caption rows for the stack, top plane first so the list mirrors the
 * geometry. The runtime row swaps its bare locale code for the LocaleTag
 * chip; every other value prints verbatim from the shared layer table.
 */
const STACK_CAPS: readonly { id: string; i: number; name: string; node: ReactNode }[] = STACK_LAYERS.map(
  (layer, i) => ({
    id: layer.id,
    i,
    name: layer.name,
    node:
      layer.id === 'runtime' ? (
        <>
          Hallo, Welt! · <LocaleTag code='de' />
        </>
      ) : (
        layer.value
      ),
  })
)
  .slice()
  .reverse();

/** The tool marks are identification, not decoration: 12px, dim, currentColor. */
const MARK = { size: 12, color: 'currentColor' } as const;

/**
 * The page's one full-bleed dark band — toolchain's calm v3 cut (every cell
 * is heading + one line + one quiet artifact; the seven-plane stack is a
 * hover/focus/tap instrument; the trace ticks on scrub) closed with this
 * fork's own material: the hero's glyph field inverted, paper glyphs rising
 * off the ink at the band's edges (the hero condenses, the closer disperses),
 * held out of the content column by a dithered clearing measured off the
 * real DOM box.
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const core = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---- the fork's signature material: the inverted glyph field ---- */
      const canvas = stage.current;
      const h2 = scope.querySelector('h2');
      const field = canvas
        ? createInkField({
            canvas,
            clearEl: core.current,
            displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
          })
        : null;

      /* ---- the stack instrument: two-way layer ↔ caption highlight ---- */
      const layers = gsap.utils.toArray<SVGGElement>('.tcs-layer', scope);
      const caps = gsap.utils.toArray<HTMLElement>('.tcb-stack-cap', scope);
      const leaders = gsap.utils.toArray<SVGPathElement>('.tcs-leader', scope);
      const dur = reduce ? 0 : 0.22;

      const setActive = (active: number | null) => {
        layers.forEach((layer, i) => {
          const hot = active === i;
          /* Rest state is full opacity — the plates are occluding glass now,
             so depth lives in their paint; opacity is spent only on the
             transient hover dim of the passed-over planes. */
          gsap.to(layer, {
            y: hot && !reduce ? -7 : 0,
            opacity: active === null || hot ? 1 : 0.38,
            duration: dur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          const dbl = layer.querySelector('.tcs-dbl');
          if (dbl) {
            gsap.to(dbl, { opacity: hot ? 1 : 0, duration: dur, ease: 'power2.out', overwrite: 'auto' });
          }
        });
        leaders.forEach((leader, i) => {
          gsap.to(leader, {
            opacity: active === i ? 1 : active === null ? 0.45 : 0.2,
            duration: dur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        for (const cap of caps) {
          const i = Number(cap.dataset.stackCap);
          cap.classList.toggle('is-hot', active === i);
          cap.classList.toggle('is-cold', active !== null && active !== i);
        }
      };

      const cleanups: (() => void)[] = [];
      const bind = (el: Element, i: number) => {
        const on = () => setActive(i);
        const off = () => setActive(null);
        el.addEventListener('pointerenter', on);
        el.addEventListener('pointerleave', off);
        el.addEventListener('focus', on);
        el.addEventListener('blur', off);
        /* tap = the same highlight, on touch */
        el.addEventListener('click', on);
        cleanups.push(() => {
          el.removeEventListener('pointerenter', on);
          el.removeEventListener('pointerleave', off);
          el.removeEventListener('focus', on);
          el.removeEventListener('blur', off);
          el.removeEventListener('click', on);
        });
      };
      for (const layer of layers) bind(layer, Number(layer.dataset.stackLayer));
      for (const cap of caps) bind(cap, Number(cap.dataset.stackCap));

      /* ---- the stack rail: full cell height, pinned to the tap line ----
         The doubled rail is an HTML element (two real 1px borders — crisp
         at any zoom) spanning the cell's top edge to its bottom edge. Its
         x is measured off the first leader's start point, so the corner
         taps always land exactly on the rail's inner line, at any width;
         the cell heading indents past it so the rail crosses clean air. */
      const stackCell = scope.querySelector<HTMLElement>('.tcb-cell-stack');
      const stackRail = scope.querySelector<HTMLElement>('.tcb-stack-rail');
      const stackCap = scope.querySelector<HTMLElement>('.tcb-cell-stack > .tcb-cap');
      const stackWrap = scope.querySelector<HTMLElement>('.tcb-stack');
      const stackCaps = scope.querySelector<HTMLElement>('.tcb-stack-caps');
      const placeStackRail = () => {
        const lead = leaders[0];
        if (!stackCell || !stackRail || !lead) return;
        const ctm = lead.getScreenCTM();
        if (!ctm) return;
        const start = lead.getPointAtLength(0);
        const x = ctm.a * start.x + ctm.c * start.y + ctm.e;
        const cellRect = stackCell.getBoundingClientRect();
        /* inner border line (rail box is 5px: 1px + 3px gap + 1px) at the tap x */
        const left = Math.round(x - cellRect.left - 4);
        stackRail.style.left = `${left}px`;
        if (stackCap) stackCap.style.paddingLeft = `${left + 25}px`;
        /* folded (drawing above, captions below) the rail stops at the
           ledger instead of striking through its rows; side-by-side it
           runs the cell's full height, top edge to bottom edge */
        const folded = stackWrap && getComputedStyle(stackWrap).flexDirection === 'column';
        stackRail.style.bottom =
          folded && stackCaps ? `${Math.round(cellRect.bottom - stackCaps.getBoundingClientRect().top)}px` : '0px';
      };
      placeStackRail();
      if (stackCell) {
        const ro = new ResizeObserver(placeStackRail);
        ro.observe(stackCell);
        cleanups.push(() => ro.disconnect());
      }

      /* ---- scroll reveals: one-shot, composed at any stop -------------- */
      if (!reduce) {
        /* 1 — the bento assembles: header, cells and CTAs rise in turn. */
        ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-cell]', scope), {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 22, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.66, stagger: 0.07, ease: 'power2.out', overwrite: true }
            ),
        });

        /* 2 — the transcript prints line by line, once, like a real run. */
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>('.tcb-term-body > div', scope),
          { autoAlpha: 0, y: 5 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.09,
            ease: 'power1.out',
            scrollTrigger: { trigger: '.tcb-cell-cli', start: 'top 78%', once: true },
          }
        );

        /* 3 — the stack builds once: planes rise bottom-first while the
           full-height rail draws itself down the cell and the leaders peel
           off it in stage order. Leader strokes are non-scaling, so dash
           lengths are measured in SCREEN units via the CTM — and cleared
           on arrival so a later resize can never re-gap them. */
        for (const path of leaders) {
          const ctm = path.getScreenCTM();
          const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
          const len = path.getTotalLength() * scale + 2;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        }
        const stackBuild = gsap
          .timeline({ scrollTrigger: { trigger: '.tcb-cell-stack', start: 'top 80%', once: true } })
          .from(
            layers,
            { autoAlpha: 0, y: 16, duration: 0.45, stagger: 0.055, ease: 'power2.out', clearProps: 'visibility' },
            0
          );
        if (stackRail) {
          stackBuild.fromTo(
            stackRail,
            { scaleY: 0, transformOrigin: 'top center' },
            { scaleY: 1, duration: 0.42, ease: 'power1.inOut' },
            0.05
          );
        }
        stackBuild.to(
          leaders,
          {
            strokeDashoffset: 0,
            duration: 0.28,
            stagger: 0.045,
            ease: 'power1.out',
            clearProps: 'strokeDasharray,strokeDashoffset',
          },
          0.16
        );

        /* 4 — the trace ticks on scrub: the doubled rail extends and each
           event lights as the reader passes it. */
        const rows = gsap.utils.toArray<HTMLElement>('.tcb-trace-row', scope);
        if (rows.length > 0) {
          gsap
            .timeline({
              scrollTrigger: { trigger: '.tcb-cell-trace', start: 'top 84%', end: 'center 55%', scrub: 0.35 },
            })
            .fromTo('.tcb-trace-rail', { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' }, 0)
            .fromTo(
              rows,
              { opacity: 0.38, x: 8 },
              { opacity: 1, x: 0, stagger: 0.11, duration: 0.45, ease: 'none' },
              0.04
            );
        }
      }

      return () => {
        field?.destroy();
        for (const undo of cleanups) undo();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-band tcb' id='toolchain' ref={root}>
      {/* the fork's material: paper glyphs rising off the ink at the edges */}
      <canvas className='tc-band-field' ref={stage} aria-hidden='true' />

      <div className='tcb-in'>
        {/* the measuring box for the field's dithered clearing: glyphs own
            the band's margins and padding strips, never the content */}
        <div className='gr-band-core' ref={core}>
        <div className='tcb-head' data-cell>
          <h2>Everything you need, in one toolchain.</h2>
          <p>Buildtime, runtime, and review — one project, one config, one bill.</p>
        </div>

        <div className='tcb-grid'>
          {/* The centerpiece: the whole toolchain as one assembly. Planes and
              caption rows highlight each other — hover, focus, or tap. */}
          <div className='tcb-cell tcb-cell-stack' data-cell>
            {/* the doubled rail: two real 1px borders, cell top edge to
                bottom edge; useGSAP pins its x to the drawing's tap line */}
            <span className='tcb-stack-rail' aria-hidden='true' />
            <div className='tcb-cap'>
              <h3>One string, source to screen</h3>
              <p>Hover a stage — the same string climbs all seven.</p>
            </div>
            <div className='tcb-stack'>
              <div className='tcb-stack-fig'>
                <TcStackIso
                  className='tcstack'
                  title='The GT stack, end to end: app code, gt cli, Locadex, context, review, edge CDN and runtime delivery — each plane taps the same doubled rail, from source code to the translated string on a user’s screen'
                />
              </div>
              <div className='tcb-stack-caps'>
                {STACK_CAPS.map((cap) => (
                  <button
                    key={cap.id}
                    type='button'
                    className='tcb-stack-cap'
                    data-stack-cap={cap.i}
                    aria-label={`Highlight the ${cap.name} layer`}
                  >
                    <b>{cap.name}</b>
                    <span>{cap.node}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The band's one light moment: a real `gt translate` run floating
              in the dark centre of the prismatic panel. Five lines, no more. */}
          <div className='tcb-cell tcb-cell-cli' data-cell>
            <PrismaticField className='tcb-cli-field' preset='1' speed={0.4} params={{ exposureScale: 1600 }} />
            <div className='tcb-term'>
              <div className='tcb-term-bar'>
                <span>gt cli</span>
                <span>acme/web</span>
              </div>
              <div className='tcb-term-body'>
                <div data-tone='prompt'>$ npx gt translate</div>
                <div data-tone='dim'>gt-next detected · Next.js App Router</div>
                <div>128 strings · 3 new · 2 changed</div>
                <div>
                  <i>✓</i>{' '}
                  {(['es', 'fr', 'ja', 'de', 'zh'] as const).map((loc, i) => (
                    <span key={loc}>
                      {i > 0 ? ' ' : null}
                      <LocaleTag code={loc} className='tc-termloc' />
                    </span>
                  ))}
                </div>
                <div data-tone='dim'>done in 8.4s · local edits preserved</div>
              </div>
            </div>
          </div>

          {/* Four services, four quiet artifacts, all flush. */}
          <div className='tcb-cell tcb-svc' data-cell>
            <div className='tcb-svc-cap'>
              <h3>Code</h3>
              <p>Mark up JSX once — every locale ships from your build.</p>
            </div>
            <div className='tcb-art'>
              <div className='tcb-art-bar'>
                <span className='is-on'>page.tsx</span>
                <span className='tcb-marks' aria-label='Next.js and React'>
                  <SiNextdotjs {...MARK} />
                  <SiReact {...MARK} />
                </span>
              </div>
              <pre className='tcb-pre'>
                <div>
                  <span className='tk-kw'>import</span> {'{ '}
                  <span className='tk-tag'>T</span>
                  {' }'} <span className='tk-kw'>from</span> <span className='tk-str'>&apos;gt-next&apos;</span>
                </div>
                <div> </div>
                <div>
                  <span className='tk-dim'>{'<'}</span>
                  <span className='tk-tag'>T</span>
                  <span className='tk-dim'>{'>'}</span>
                </div>
                <div>
                  {'  '}
                  <span className='tk-dim'>{'<h1>'}</span>
                  <span className='tk-str'>Hello, world!</span>
                  <span className='tk-dim'>{'</h1>'}</span>
                </div>
                <div>
                  <span className='tk-dim'>{'</'}</span>
                  <span className='tk-tag'>T</span>
                  <span className='tk-dim'>{'>'}</span>
                </div>
              </pre>
              <div className='tcb-out'>
                <div className='tcb-out-row'>
                  <span>
                    <LocaleTag code='es' />
                  </span>
                  <b lang='es'>¡Hola, mundo!</b>
                </div>
                <div className='tcb-out-row'>
                  <span>
                    <LocaleTag code='ja' />
                  </span>
                  <b lang='ja'>こんにちは世界！</b>
                </div>
              </div>
            </div>
          </div>

          <div className='tcb-cell tcb-svc' data-cell>
            <div className='tcb-svc-cap'>
              <h3>Content</h3>
              <p>User-generated content, translated on demand at runtime.</p>
            </div>
            <div className='tcb-art'>
              <div className='tcb-art-bar'>
                <span className='is-on'>notify.ts</span>
                <span>runtime</span>
                <span className='tcb-marks' aria-label='Node.js'>
                  <SiNodedotjs {...MARK} />
                </span>
              </div>
              <pre className='tcb-pre'>
                <div>
                  <span className='tk-kw'>await</span> <span className='tk-tag'>tx</span>(
                  <span className='tk-str'>&apos;Payment received&apos;</span>, {'{'}
                </div>
                <div>
                  {'  '}$locale: <span className='tk-str'>&apos;ja&apos;</span>,
                </div>
                <div>{'})'}</div>
              </pre>
              <div className='tcb-resp'>
                <div className='tcb-resp-status'>200 · 84 ms · cached at the edge</div>
                <div className='tcb-resp-body'>
                  {'{ "ja": '}
                  <b lang='ja'>&quot;支払いを受領しました&quot;</b>
                  {' }'}
                </div>
              </div>
            </div>
          </div>

          <div className='tcb-cell tcb-svc' data-cell>
            <div className='tcb-svc-cap'>
              <h3>Dashboard</h3>
              <p>Glossaries, directives, and review in one workspace.</p>
            </div>
            <div className='tcb-art'>
              <div className='tcb-art-bar'>
                <b>acme/web</b>
                <span>production</span>
              </div>
              <div className='tcb-chips' aria-label='enabled locales'>
                {(['en', 'es', 'fr', 'ja', 'de', 'zh'] as const).map((loc) => (
                  <span key={loc}>
                    <LocaleTag code={loc} />
                  </span>
                ))}
              </div>
              <div className='tcb-ledger'>
                <div className='tcb-out-row'>
                  <span>glossary</span>
                  <b>24 terms</b>
                </div>
                <div className='tcb-out-row'>
                  <span>directives</span>
                  <b>6 rules</b>
                </div>
                <div className='tcb-out-row'>
                  <span>review</span>
                  <b>queue empty</b>
                </div>
              </div>
              <div className='tcb-out'>
                <div className='tcb-out-row'>
                  <b>v214 · published</b>
                  <span>2 min ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className='tcb-cell tcb-svc' data-cell>
            <div className='tcb-svc-cap'>
              <h3>Locadex</h3>
              <p>The agent that internationalizes your repo in guarded PRs.</p>
            </div>
            <div className='tcb-art'>
              <div className='tcb-art-bar'>
                <span className='is-on'>PR #218</span>
                <span>locadex → main</span>
                <span className='tcb-marks' aria-label='GitHub'>
                  <SiGithub {...MARK} />
                </span>
              </div>
              <div className='tcb-diff'>
                <div className='is-hunk'>
                  <i> </i>
                  <code>@@ −4,1 +4,1 @@ app/checkout.tsx</code>
                </div>
                <div className='is-del'>
                  <i>−</i>
                  <code>{'<p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>
                    <span className='tk-dim'>{'<p><'}</span>
                    <span className='tk-tag'>T</span>
                    <span className='tk-dim'>{'>'}</span>
                    <span className='tk-str'>Payment received</span>
                    <span className='tk-dim'>{'</'}</span>
                    <span className='tk-tag'>T</span>
                    <span className='tk-dim'>{'></p>'}</span>
                  </code>
                </div>
              </div>
              <div className='tcb-out'>
                <div className='tcb-out-row'>
                  <span>merged</span>
                  <b>+38 −6 · checks passed</b>
                </div>
              </div>
            </div>
          </div>

          {/* The context cascade — the founder-mandated inheritance model,
              one cell, three levels, two doubled-thread joints. */}
          <div className='tcb-cell tcb-cell-ctx' data-cell>
            <div className='tcb-cap'>
              <h3>Context, defined once — inherited all the way down</h3>
            </div>
            <div className='tcb-ctx'>
              <div className='tcb-ctx-col'>
                <div className='tcb-ctx-tag'>organization</div>
                <div className='tcb-ctx-k'>Glossary</div>
                <p className='tcb-ctx-rule'>“Locadex is the GT agent — do not translate.”</p>
                <div className='tcb-ctx-k'>Directives</div>
                <p className='tcb-ctx-rule'>
                  “Active voice. Use formal ‘Sie.’” <LocaleTag code='de' className='tcb-ctx-loc' />
                </p>
              </div>

              <div className='tcb-ctx-joint' aria-label='inherited by'>
                <svg viewBox='0 0 30 24' width={30} height={24} aria-hidden='true'>
                  <path d='M0 10.5h20' />
                  <path d='M0 13.5h20' />
                  <path className='tcb-joint-head' d='M21 6.5L29 12L21 17.5Z' />
                </svg>
              </div>

              <div className='tcb-ctx-col'>
                <div className='tcb-ctx-tag'>project</div>
                <div className='tcb-ctx-row'>
                  <span className='tcb-pri'>1</span>
                  <b>brand-core</b>
                  <span className='tcb-scope'>org</span>
                </div>
                <div className='tcb-ctx-row'>
                  <span className='tcb-pri'>2</span>
                  <b>docs-style</b>
                  <span className='tcb-scope'>org</span>
                </div>
                <div className='tcb-ctx-row'>
                  <span className='tcb-pri'>3</span>
                  <b>checkout-copy</b>
                  <span className='tcb-scope'>project</span>
                </div>
                <p className='tcb-ctx-rule'>
                  On overlap the top group wins: formal ‘Sie’ holds, <s>casual tone</s> loses.
                </p>
              </div>

              <div className='tcb-ctx-joint' aria-label='inherited by'>
                <svg viewBox='0 0 30 24' width={30} height={24} aria-hidden='true'>
                  <path d='M0 10.5h20' />
                  <path d='M0 13.5h20' />
                  <path className='tcb-joint-head' d='M21 6.5L29 12L21 17.5Z' />
                </svg>
              </div>

              <div className='tcb-ctx-col'>
                <div className='tcb-ctx-tag'>component</div>
                <pre className='tcb-ctx-code'>
                  <div>
                    <span className='tk-dim'>{'<'}</span>
                    <span className='tk-tag'>T</span> <span className='tk-kw'>$context</span>
                    <span className='tk-dim'>=</span>
                    <span className='tk-str'>&quot;popup, not bread&quot;</span>
                    <span className='tk-dim'>{'>'}</span>
                  </div>
                  <div>{'  Click the toast to dismiss'}</div>
                  <div>
                    <span className='tk-dim'>{'</'}</span>
                    <span className='tk-tag'>T</span>
                    <span className='tk-dim'>{'>'}</span>
                  </div>
                </pre>
                <div className='tcb-ctx-res'>
                  <span className='tcb-ctx-res-loc'>
                    <LocaleTag code='es' />
                  </span>
                  <b lang='es'>la notificación</b>
                  <s lang='es'>la tostada</s>
                </div>
              </div>
            </div>
          </div>

          {/* The same journey, on the clock. */}
          <div className='tcb-cell tcb-cell-trace' data-cell>
            {/* the timeline rail: same doubled gauge, card top edge to
                bottom edge — the heading indents past it */}
            <span className='tcb-trace-rail' aria-hidden='true' />
            <div className='tcb-cap'>
              <h3>One commit, on the clock</h3>
            </div>
            <div className='tcb-trace'>
              {TRACE.map(([time, stage, value]) => (
                <div className='tcb-trace-row' key={time}>
                  <span>{time}</span>
                  <b>{stage}</b>
                  <span className='tcb-trace-val'>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='tcb-acts' data-cell>
          <a className='tc-btn tc-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#frameworks'>
            Talk to an engineer
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
