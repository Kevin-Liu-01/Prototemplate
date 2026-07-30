'use client';

import { useGSAP } from '@gsap/react';
import { SiGithub, SiNextdotjs, SiNodedotjs, SiReact } from '@icons-pack/react-simple-icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import TcStackIso from '../diagrams/tc-stack-iso';

import './darkband-v2.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The band's time axis, kept from r2: one commit's journey, timestamped.
 * Every value is real product shape — the PR number is shared with the stack
 * drawing on purpose, so the two cells read as one story.
 */
const TRACE: readonly (readonly [string, string, string])[] = [
  ['09:41:02', 'committed', 'app/page.tsx'],
  ['09:41:18', 'extracted', 'hash 0f3a92'],
  ['09:41:44', 'pr opened', 'locadex · #218'],
  ['09:42:03', 'translated', '6 locales · 3.4 s'],
  ['09:44:37', 'approved', 'review · @mira'],
  ['09:45:01', 'published', 'edge · 3 regions'],
  ['09:45:09', 'rendered', 'de · paint 38 ms'],
];

/** The tool marks are identification, not decoration: 12px, dim, currentColor. */
const MARK = { size: 12, color: 'currentColor' } as const;

/**
 * The page's one full-bleed dark band, recut as a dark bento: cards on a
 * darker ground with 1px seams and the light bentos' 12px radius. Copy is
 * heading + one line everywhere; the artifacts — a real `gt translate`
 * transcript on the prismatic panel, the axonometric stack, four service
 * plates, the context cascade, and the timestamped trace — carry the rest.
 * Scroll animation is GSAP: staggered cell reveals, the stack drawing in,
 * the trace ticking, all legible at any stop.
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;

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

      /* 3 — the stack draws in on scrub: planes and labels rise in stage
         order while the doubled thread strokes itself up the flank. Scrub is
         soft so any stop is a composed still. */
      const stackSvg = scope.querySelector<SVGSVGElement>('.tcb-stack svg');
      if (stackSvg) {
        const parts = Array.from(stackSvg.querySelectorAll<SVGGraphicsElement>(':scope > g > *:not(.tcstack-thread)'));
        const threads = Array.from(stackSvg.querySelectorAll<SVGPathElement>('path.tcstack-thread'));
        for (const thread of threads) {
          const len = thread.getTotalLength();
          gsap.set(thread, { strokeDasharray: len, strokeDashoffset: len });
        }
        gsap
          .timeline({
            scrollTrigger: { trigger: '.tcb-cell-stack', start: 'top 84%', end: 'center 42%', scrub: 0.35 },
          })
          .fromTo(parts, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.5, ease: 'none' }, 0)
          .to(threads, { strokeDashoffset: 0, duration: 0.7, ease: 'none' }, 0.2);
      }

      /* 4 — the trace ticks on scrub: the doubled rail extends and each
         event lights as the reader passes it. */
      const rows = gsap.utils.toArray<HTMLElement>('.tcb-trace-row', scope);
      if (rows.length > 0) {
        gsap
          .timeline({
            scrollTrigger: { trigger: '.tcb-cell-trace', start: 'top 82%', end: 'center 45%', scrub: 0.35 },
          })
          .fromTo('.tcb-trace-rail', { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' }, 0)
          .fromTo(
            rows,
            { opacity: 0.24, x: 8 },
            { opacity: 1, x: 0, stagger: 0.11, duration: 0.45, ease: 'none' },
            0.04
          );
      }
    },
    { scope: root }
  );

  return (
    <section className='tc-band tcb' id='toolchain' ref={root}>
      <div className='tcb-in'>
        <div className='tcb-head' data-cell>
          <h2>Everything you need, in one toolchain.</h2>
          <p>Buildtime, runtime, and review — one project, one config, one bill.</p>
        </div>

        <div className='tcb-grid'>
          {/* The centerpiece: the whole toolchain as one assembly, the
              doubled thread climbing it from source code to rendered string. */}
          <div className='tcb-cell tcb-cell-stack' data-cell>
            <div className='tcb-cap'>
              <h3>One string, source to screen</h3>
            </div>
            <div className='tcb-stack'>
              <TcStackIso
                className='tcstack'
                title='The GT stack, end to end: app code, gt cli, Locadex, context, review, edge CDN and runtime delivery, connected by one thread from source code to the translated string on a user’s screen'
              />
            </div>
          </div>

          {/* The band's one light moment: a real `gt translate` run floating
              in the dark centre of the prismatic panel. */}
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
                <div>
                  scanning <span className='tk-str'>src/**/*.{'{'}ts,tsx{'}'}</span> · 214 files
                </div>
                <div>128 strings · 3 new · 2 changed</div>
                <div>
                  translating 5 entries → <span className='tk-str'>es fr ja de zh</span>
                </div>
                <div>
                  <i>✓</i> es 1.2s <i>✓</i> fr 1.1s <i>✓</i> ja 1.4s
                </div>
                <div>
                  <i>✓</i> de 1.2s <i>✓</i> zh 1.3s
                </div>
                <div>
                  wrote <span className='tk-str'>public/_gt/es.json</span> <span className='tk-dim'>… +4 more</span>
                </div>
                <div data-tone='dim'>done in 8.4s · local edits preserved</div>
              </div>
            </div>
          </div>

          {/* Four services, four different real artifacts, all flush. */}
          <div className='tcb-cell tcb-svc' data-cell>
            <div className='tcb-svc-cap'>
              <h3>Code</h3>
              <p>Mark up JSX once — every locale ships from your build.</p>
            </div>
            <div className='tcb-art'>
              <div className='tcb-art-bar'>
                <span className='is-on'>page.tsx</span>
                <span>checkout.tsx</span>
                <span className='tcb-marks' aria-label='Next.js and React'>
                  <SiNextdotjs {...MARK} />
                  <SiReact {...MARK} />
                </span>
              </div>
              <pre className='tcb-pre'>
                <div>
                  <span className='tcb-ln'>1</span>
                  <span className='tk-kw'>import</span> {'{ '}
                  <span className='tk-tag'>T</span>
                  {' }'} <span className='tk-kw'>from</span> <span className='tk-str'>&apos;gt-next&apos;</span>
                </div>
                <div>
                  <span className='tcb-ln'>2</span>
                </div>
                <div>
                  <span className='tcb-ln'>3</span>
                  <span className='tk-kw'>export default function</span> Page() {'{'}
                </div>
                <div>
                  <span className='tcb-ln'>4</span>
                  {'  '}
                  <span className='tk-kw'>return</span> (
                </div>
                <div>
                  <span className='tcb-ln'>5</span>
                  {'    '}
                  <span className='tk-dim'>{'<'}</span>
                  <span className='tk-tag'>T</span>
                  <span className='tk-dim'>{'>'}</span>
                </div>
                <div>
                  <span className='tcb-ln'>6</span>
                  {'      '}
                  <span className='tk-dim'>{'<h1>'}</span>
                  <span className='tk-str'>Hello, world!</span>
                  <span className='tk-dim'>{'</h1>'}</span>
                </div>
                <div>
                  <span className='tcb-ln'>7</span>
                  {'    '}
                  <span className='tk-dim'>{'</'}</span>
                  <span className='tk-tag'>T</span>
                  <span className='tk-dim'>{'>'}</span>
                </div>
                <div>
                  <span className='tcb-ln'>8</span>
                  {'  '})
                </div>
              </pre>
              <div className='tcb-out'>
                <div className='tcb-out-row'>
                  <span>es</span>
                  <b lang='es'>¡Hola, mundo!</b>
                </div>
                <div className='tcb-out-row'>
                  <span>ja</span>
                  <b lang='ja'>こんにちは世界！</b>
                </div>
                <div className='tcb-out-row'>
                  <span>fr</span>
                  <b lang='fr'>Bonjour le monde&nbsp;!</b>
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
                  <span className='tk-kw'>import</span> {'{ '}
                  <span className='tk-tag'>tx</span>
                  {' }'} <span className='tk-kw'>from</span> <span className='tk-str'>&apos;gt-node&apos;</span>
                </div>
                <div> </div>
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
                <span>en</span>
                <span>es</span>
                <span>fr</span>
                <span>ja</span>
                <span>de</span>
                <span>zh</span>
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
                  <span>context groups</span>
                  <b>3 applied</b>
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
                  <code>@@ −4,2 +4,3 @@ app/checkout.tsx</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>
                    <span className='tk-kw'>import</span> {'{ '}
                    <span className='tk-tag'>T</span>
                    {' }'} <span className='tk-kw'>from</span> <span className='tk-str'>&apos;gt-next&apos;</span>
                  </code>
                </div>
                <div className='is-del'>
                  <i>−</i>
                  <code>{'<p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>
                    <span className='tk-dim'>{'<p>'}</span>
                  </code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>
                    {'  '}
                    <span className='tk-dim'>{'<'}</span>
                    <span className='tk-tag'>T</span>
                    <span className='tk-dim'>{'>'}</span>
                    <span className='tk-str'>Payment received</span>
                    <span className='tk-dim'>{'</'}</span>
                    <span className='tk-tag'>T</span>
                    <span className='tk-dim'>{'>'}</span>
                  </code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>
                    <span className='tk-dim'>{'</p>'}</span>
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
                <p className='tcb-ctx-rule'>“Active voice. Use formal ‘Sie’ in German.”</p>
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
                    <span className='tk-tag'>T</span> <span className='tk-kw'>context</span>
                    <span className='tk-dim'>=</span>
                    <span className='tk-str'>&quot;notification, not bread&quot;</span>
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
                  <span>toast · es →</span>
                  <b lang='es'>la notificación</b>
                  <s lang='es'>la tostada</s>
                </div>
              </div>
            </div>
          </div>

          {/* The same journey, on the clock. */}
          <div className='tcb-cell tcb-cell-trace' data-cell>
            <div className='tcb-cap'>
              <h3>One commit, on the clock</h3>
            </div>
            <div className='tcb-trace'>
              <span className='tcb-trace-rail' aria-hidden='true' />
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
    </section>
  );
}
