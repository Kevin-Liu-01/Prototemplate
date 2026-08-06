'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Braces, Download, History, Search, Table2, TerminalSquare } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';

import LocaleTag from '../components/LocaleTag';

import { useQuietReveal } from './reveal';

import './review-workspace.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  /** A regenerated row keeps the line it replaced, struck through above the current one. */
  previous?: string;
  /** The settled stamp: `approved` retires the row, `edit` stays as the quiet affordance. */
  final: 'approved' | 'edit';
};

/** The regenerated star row, named so the surfaces faces can tell the
    SAME edit the table shows — one review, three doors. */
const META_ROW: ReviewRow = {
  key: 'meta',
  source: "End-to-end localization for the world's best companies",
  previous: 'Localización de extremo a extremo para las mejores empresas del mundo.',
  translation: 'Localización integral para las mejores empresas del mundo.',
  final: 'edit',
};

/**
 * Four strong rows, all real GT copy: the demo app's canonical string, the
 * hero headline, the meta description (as the regenerated star row) and the
 * demo's terms line — each beside its Spanish translation.
 */
const ROWS: readonly ReviewRow[] = [
  {
    key: 'hello',
    source: 'Hello, world!',
    translation: '¡Hola, mundo!',
    final: 'approved',
  },
  {
    key: 'hero',
    source: 'Launch in every language',
    translation: 'Lanza en todos los idiomas',
    final: 'approved',
  },
  META_ROW,
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    final: 'approved',
  },
];

/* Typing pace: the agent writes steadily, the translation trailing the
   source by a beat and finishing after it. Seconds per character. */
const SRC_PACE = 0.038;
const TR_PACE = 0.046;

type Surface = 'web' | 'api' | 'cli';

/** The three doors into the same review (surfaces mode). Every detail
    line is the real product: the dashboard host, the OpenAPI endpoint
    local edits sync through (POST /v2/project/files/diffs), and the CLI
    verb that submits them (gt save-local) — never invented syntax. */
const DOORS: readonly { key: Surface; name: string; line: string; icon: typeof Table2 }[] = [
  { key: 'web', name: 'Workspace', line: 'dash.generaltranslation.com', icon: Table2 },
  { key: 'api', name: 'API', line: 'POST /v2/project/files/diffs', icon: Braces },
  { key: 'cli', name: 'CLI', line: 'npx gt save-local', icon: TerminalSquare },
];

/**
 * The review workspace: source beside translation on the page's mount, with
 * a GSAP loop in which one row at a time writes itself — source first, its
 * translation lagging under its own caret — and a stamp settles from
 * `translated` to `approved`. The star row regenerates instead: the old line
 * is struck through and the new translation types beneath it. Every other
 * row sits complete, so the workspace reads as a finished still at any
 * frame; under reduced motion the resting DOM *is* that still.
 */
type ReviewWorkspaceProps = {
  /** Left-card copy overrides — hosts that reframe the workspace (the v0
      flow's "Review from one surface" beat) swap the words, never the
      workspace itself. Defaults are toolchain's own card, verbatim. */
  heading?: string;
  /** Pass null to drop the sub paragraph entirely. */
  sub?: string | null;
  /** Pass null to drop the notes list entirely. */
  notes?: readonly string[] | null;
  /** 'product' dresses the frame as the dashboard itself: lucide glyphs in
      the bar and footer, the Locadex mark on the agent credit, and the two
      aura hooks the host styles into a dither field around the mat. The
      default renders byte-identical to the original terminal chrome. */
  chrome?: 'terminal' | 'product';
  /** The "over web, API, or CLI" beat: a rail of three door nodes wired
      into the frame, each swapping its face to that surface's real text —
      the workspace table, the diffs call, the save-local session. Off by
      default; the default mount renders no rail and no faces. */
  surfaces?: boolean;
};

const DEFAULT_NOTES: readonly string[] = [
  'Side-by-side source and translation view',
  'See diffs when translations are regenerated',
  'Edit translations before or after they go live',
];

export default function ReviewWorkspace({
  heading = 'Edit in context.',
  sub = 'Agents write translations. You review, edit, and approve in a focused workspace.',
  notes = DEFAULT_NOTES,
  chrome = 'terminal',
  surfaces = false,
}: ReviewWorkspaceProps = {}) {
  const root = useRef<HTMLElement>(null);
  const [face, setFace] = useState<Surface>('web');

  useQuietReveal(root, chrome !== 'product');

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;

      const srcCells = Array.from(scope.querySelectorAll<HTMLElement>('.tcr-cell.is-s'));
      const trCells = Array.from(scope.querySelectorAll<HTMLElement>('.tcr-cell.is-t'));

      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.2 });

      ROWS.forEach((row, i) => {
        const sCell = srcCells[i];
        const tCell = trCells[i];
        if (!sCell || !tCell) return;
        const sTyped = sCell.querySelector<HTMLElement>('[data-typed]');
        const sCaret = sCell.querySelector<HTMLElement>('[data-caret]');
        const tTyped = tCell.querySelector<HTMLElement>('[data-typed]');
        const tCaret = tCell.querySelector<HTMLElement>('[data-caret]');
        const stamp = tCell.querySelector<HTMLElement>('[data-stamp]');
        const strike = tCell.querySelector<HTMLElement>('[data-strike]');
        if (!sTyped || !sCaret || !tTyped || !tCaret || !stamp) return;

        const label = `row${i}`;
        tl.addLabel(label, i === 0 ? 0 : '+=1.05');

        const setStamp = (text: string, kind: 'chip' | 'ok') => () => {
          stamp.textContent = text;
          stamp.setAttribute('data-kind', kind);
        };
        const finalKind: 'chip' | 'ok' = row.final === 'approved' ? 'ok' : 'chip';

        /* The blink after a caret finishes: two hard on/off beats, then gone. */
        const blinkOut = (caret: HTMLElement, at: string) => {
          tl.to(caret, { opacity: 0, duration: 0.3, repeat: 2, yoyo: true, ease: 'steps(1)' }, at);
          tl.set(caret, { autoAlpha: 0 }, `>+0.02`);
        };

        const tState = { n: 0 };
        const typeTr = (at: number, duration: number) => {
          tl.set(tCaret, { autoAlpha: 1 }, `${label}+=${(at - 0.06).toFixed(3)}`);
          tl.fromTo(
            tState,
            { n: 0 },
            {
              n: row.translation.length,
              duration,
              ease: 'none',
              /* never render the from-state at build time — it would blank
                 every row that has not had its turn yet */
              immediateRender: false,
              onUpdate: () => {
                tTyped.textContent = row.translation.slice(0, Math.round(tState.n));
              },
            },
            `${label}+=${at.toFixed(3)}`
          );
        };

        /* The stamp lands as `translated`, holds a beat, then settles into its
           resting state — the press-down scale is the "stamp". */
        const stampIn = (at: number) => {
          tl.call(setStamp('translated', 'chip'), undefined, `${label}+=${at.toFixed(3)}`);
          tl.fromTo(
            stamp,
            { autoAlpha: 0, y: 4 },
            { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', immediateRender: false },
            `${label}+=${(at + 0.02).toFixed(3)}`
          );
          tl.call(setStamp(row.final, finalKind), undefined, `${label}+=${(at + 0.92).toFixed(3)}`);
          tl.fromTo(
            stamp,
            { scale: 1.14, autoAlpha: 0.4 },
            { scale: 1, autoAlpha: 1, duration: 0.34, ease: 'power3.out', immediateRender: false },
            `${label}+=${(at + 0.92).toFixed(3)}`
          );
        };

        if (row.previous && strike) {
          /* The star row regenerates: the standing line is struck through,
             the new translation writes itself beneath, the edit affordance
             settles back in. The source column never re-types here. */
          const trDur = Math.max(0.6, row.translation.length * TR_PACE);
          tl.call(() => {
            tTyped.textContent = '';
          }, undefined, label);
          tl.set(stamp, { autoAlpha: 0 }, label);
          tl.set(strike, { scaleX: 0, transformOrigin: 'left center' }, label);
          tl.to(strike, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, `${label}+=0.45`);
          typeTr(1.2, trDur);
          blinkOut(tCaret, `${label}+=${(1.2 + trDur + 0.06).toFixed(3)}`);
          stampIn(1.2 + trDur + 0.2);
          return;
        }

        /* A clean row: source types first, the translation follows a beat
           behind and finishes after it, then the stamp settles. */
        const srcDur = Math.max(0.5, row.source.length * SRC_PACE);
        const trDur = Math.max(0.6, row.translation.length * TR_PACE);
        const lag = Math.min(0.65, srcDur * 0.55);
        const trStart = 0.42 + lag;
        const trEnd = trStart + trDur;

        const sState = { n: 0 };
        tl.call(() => {
          sTyped.textContent = '';
          tTyped.textContent = '';
        }, undefined, label);
        tl.set(stamp, { autoAlpha: 0 }, label);
        tl.set(sCaret, { autoAlpha: 1 }, `${label}+=0.3`);
        tl.fromTo(
          sState,
          { n: 0 },
          {
            n: row.source.length,
            duration: srcDur,
            ease: 'none',
            immediateRender: false,
            onUpdate: () => {
              sTyped.textContent = row.source.slice(0, Math.round(sState.n));
            },
          },
          `${label}+=0.42`
        );
        blinkOut(sCaret, `${label}+=${(0.42 + srcDur + 0.08).toFixed(3)}`);
        typeTr(trStart, trDur);
        blinkOut(tCaret, `${label}+=${(trEnd + 0.06).toFixed(3)}`);
        stampIn(trEnd + 0.2);
      });

      ScrollTrigger.create({
        trigger: scope.querySelector('.tcr-mat') ?? scope,
        start: 'top 80%',
        once: true,
        onEnter: () => tl.play(),
      });

      /* GSAP reverts styles on cleanup but not text it wrote — restore the
         finished still by hand so hot reloads never strand a half-typed row. */
      return () => {
        ROWS.forEach((row, i) => {
          const sT = srcCells[i]?.querySelector<HTMLElement>('[data-typed]');
          const tT = trCells[i]?.querySelector<HTMLElement>('[data-typed]');
          const st = trCells[i]?.querySelector<HTMLElement>('[data-stamp]');
          if (sT) sT.textContent = row.source;
          if (tT) tT.textContent = row.translation;
          if (st) {
            st.textContent = row.final;
            st.setAttribute('data-kind', row.final === 'approved' ? 'ok' : 'chip');
          }
        });
      };
    },
    { scope: root }
  );

  /* The window's resting face — the workspace table with its bar and
     status strip, exactly the default mount's body. The surfaces mode
     wraps it in a face so the API and CLI stills can cover it; without
     surfaces it renders unwrapped, byte-identical to the original. */
  const webBody = (
    <>
      <div className='tcr-bar'>
              {chrome === 'product' ? (
                <span className='tcr-fact'>
                  <Table2 className='tcr-fico' aria-hidden />
                  workspace · es-419
                </span>
              ) : (
                <span>workspace · es-419</span>
              )}
              <span>{ROWS.length} strings</span>
            </div>

            <div className='tcr-cols'>
              {chrome === 'product' ? (
                <>
                  {/* the locale speaks as the house flag chip, seated at the
                      right edge of its column head (founder round) */}
                  <div className='tcr-lab tcr-lab-loc'>
                    Source
                    <span className='tcr-lab-tag'>
                      <LocaleTag code='en' />
                    </span>
                  </div>
                  <div className='tcr-lab is-t tcr-lab-loc'>
                    Translation
                    <span className='tcr-lab-tag'>
                      <LocaleTag code='es' />
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className='tcr-lab'>source — en</div>
                  <div className='tcr-lab is-t'>translation — es</div>
                </>
              )}
              {ROWS.map((row) => (
                <Fragment key={row.key}>
                  <div className='tcr-cell is-s'>
                    <span className='tcr-text'>
                      <span className='tcr-ghost' aria-hidden='true'>
                        {row.source}
                      </span>
                      <span className='tcr-live'>
                        <span data-typed=''>{row.source}</span>
                        <i className='tcr-caret' data-caret='' aria-hidden='true' />
                      </span>
                    </span>
                  </div>
                  <div className='tcr-cell is-t' data-state={row.previous ? 'revised' : 'clean'}>
                    {row.previous && (
                      <span className='tcr-prev' lang='es'>
                        {row.previous}
                        <i className='tcr-strike' data-strike='' aria-hidden='true' />
                      </span>
                    )}
                    <span className='tcr-text' lang='es'>
                      <span className='tcr-ghost' aria-hidden='true'>
                        {row.translation}
                      </span>
                      <span className='tcr-live'>
                        <span data-typed=''>{row.translation}</span>
                        <i className='tcr-caret' data-caret='' aria-hidden='true' />
                      </span>
                    </span>
                    <span
                      className='tcr-stamp'
                      data-stamp=''
                      data-kind={row.final === 'approved' ? 'ok' : 'chip'}
                    >
                      {row.final}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>

            {chrome === 'product' ? (
              <div className='tcr-foot'>
                <span className='tcr-fact'>
                  <Search className='tcr-fico' aria-hidden />
                  Search
                </span>
                <span className='tcr-fact'>
                  <History className='tcr-fico' aria-hidden />
                  History
                </span>
                <span className='tcr-fact'>
                  <Download className='tcr-fico' aria-hidden />
                  Download
                </span>
              </div>
            ) : (
              <div className='tcr-foot'>
                <span>⌘K search</span>
                <span>history</span>
                <span>download</span>
                <span className='is-right'>agent · locadex</span>
              </div>
            )}
    </>
  );

  /* The API face: the same edit as the table's regenerated row, pushed
     through the real endpoint — POST /v2/project/files/diffs with the
     x-gt-api-key header, the documented body fields, and the endpoint's
     verbatim 200 message. A still, not a typed loop: the diagram's job
     is the shape of the call. */
  const apiBody = (
    <>
      <div className='tcr-bar'>
        <span className='tcr-fact'>
          <Braces className='tcr-fico' aria-hidden />
          api2.gtx.dev
        </span>
        <span>200 ok</span>
      </div>
      <div className='tcr-code'>
        <div className='tcr-ln'>
          <b className='is-acc'>POST</b> /v2/project/files/diffs
        </div>
        <div className='tcr-ln is-dim'>x-gt-api-key: gtx-api-••••••••</div>
        <div aria-hidden='true' className='tcr-ln is-gap' />
        <div className='tcr-ln'>{'{ "diffs": [{'}</div>
        <div className='tcr-ln'>{'    "fileId": "file_ui_strings",'}</div>
        <div className='tcr-ln'>{'    "locale": "es-419",'}</div>
        <div className='tcr-ln'>{'    "diff": "@@ meta.description @@",'}</div>
        <div className='tcr-ln'>
          {'    "localContent": '}
          <span className='is-add'>&quot;{META_ROW.translation}&quot;</span>
        </div>
        <div className='tcr-ln'>{'}] }'}</div>
        <div aria-hidden='true' className='tcr-ln is-gap' />
        <div className='tcr-ln is-ok'>200 OK</div>
        <div className='tcr-ln is-dim'>
          {'{ "filesProcessed": 1, "message": "Processed 1 translation(s)" }'}
        </div>
      </div>
      <div className='tcr-foot'>
        <span className='tcr-fact'>project:files:write</span>
        <span className='tcr-fact'>gt-api-version · 2026-03-06.v1</span>
        <span className='tcr-fact is-right'>openapi.yaml</span>
      </div>
    </>
  );

  /* The CLI face: gt save-local syncing the same edit — the command's
     real name, its real preconditions (GT_API_KEY, gt.config.json), and
     the diff it submits, closed by the endpoint's own count line. */
  const cliBody = (
    <>
      <div className='tcr-bar'>
        <span className='tcr-fact'>
          <TerminalSquare className='tcr-fico' aria-hidden />
          acme — zsh
        </span>
        <span>branch main</span>
      </div>
      <div className='tcr-code'>
        <div className='tcr-ln'>
          <b className='is-acc'>$</b> npx gt save-local
        </div>
        <div aria-hidden='true' className='tcr-ln is-gap' />
        <div className='tcr-ln is-dim'>Reading gt.config.json — 3 files · branch main</div>
        <div className='tcr-ln is-dim'>Changed since last download — ui.es-419.json</div>
        <div aria-hidden='true' className='tcr-ln is-gap' />
        <div className='tcr-ln is-dim'>@@ meta.description · es-419 @@</div>
        <div className='tcr-ln is-del' lang='es'>
          {'- '}
          {META_ROW.previous}
        </div>
        <div className='tcr-ln is-add' lang='es'>
          {'+ '}
          {META_ROW.translation}
        </div>
        <div aria-hidden='true' className='tcr-ln is-gap' />
        <div className='tcr-ln'>
          <span className='is-ok'>✓</span> Processed 1 translation(s) — synced to the workspace
        </div>
      </div>
      <div className='tcr-foot'>
        <span className='tcr-fact'>GT_API_KEY · env</span>
        <span className='tcr-fact'>GT_PROJECT_ID · env</span>
        <span className='tcr-fact is-right'>--publish → CDN</span>
      </div>
    </>
  );

  return (
    <section className={surfaces ? 'tcr tc-sec tcr-doors' : 'tcr tc-sec'} id='review' ref={root}>
      <div className='tcr-grid'>
        <div className='tcr-copy'>
          <h2 data-reveal>{heading}</h2>
          {sub ? (
            <p className='tcr-sub' data-reveal>
              {sub}
            </p>
          ) : null}
          {notes && notes.length ? (
            <ul className='tcr-notes' data-reveal>
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          {surfaces ? (
            /* the doors, chained (founder sketch): three nodes in one row
               wired in series, the last wire running across the gutter
               into the frame — the caption beneath speaks the active
               surface's real address */
            <div aria-label='Review surface' className='tcr-rail' role='group'>
              <div className='tcr-rail-row'>
                {DOORS.map((door) => {
                  const Icon = door.icon;
                  return (
                    <button
                      key={door.key}
                      aria-pressed={face === door.key}
                      className='tcr-door'
                      data-on={face === door.key || undefined}
                      type='button'
                      onClick={() => setFace(door.key)}
                    >
                      <Icon aria-hidden className='tcr-door-ico' />
                      {door.name}
                    </button>
                  );
                })}
                <i aria-hidden='true' className='tcr-rail-wire' />
              </div>
              <div className='tcr-rail-line'>
                {DOORS.find((door) => door.key === face)?.line}
              </div>
            </div>
          ) : null}
        </div>

        <div className='tcr-mat' data-reveal>
          <div className={surfaces ? 'tcr-ws tcr-ws-multi' : 'tcr-ws'}>
            {chrome === 'product' ? (
              // the workspace IS the dashboard, so the frame links there —
              // a full-cover overlay; everything beneath is decorative
              <a
                aria-label='Open the GT dashboard'
                className='tcr-ws-link'
                href='https://dash.generaltranslation.com'
                rel='noreferrer'
                target='_blank'
              />
            ) : null}
            {surfaces ? (
              <>
                {/* the web face stays in flow and keeps the frame's height;
                    the other two lie over it and cover it when chosen */}
                <div className='tcr-face is-web' data-on={face === 'web' || undefined}>
                  {webBody}
                </div>
                <div
                  aria-hidden={face !== 'api'}
                  className='tcr-face is-api'
                  data-on={face === 'api' || undefined}
                >
                  {apiBody}
                </div>
                <div
                  aria-hidden={face !== 'cli'}
                  className='tcr-face is-cli'
                  data-on={face === 'cli' || undefined}
                >
                  {cliBody}
                </div>
              </>
            ) : (
              webBody
            )}
          </div>
          {chrome === 'product' ? (
            <>
              {/* the aura hooks: zero-ink here — the mounting page styles
                  them into the dither field breathing off the frame (quiet
                  bands right/top/bottom, the directional fade westward) */}
              <i aria-hidden='true' className='tcr-aura-r' />
              <i aria-hidden='true' className='tcr-aura-y' />
              <i aria-hidden='true' className='tcr-aura-l' />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
