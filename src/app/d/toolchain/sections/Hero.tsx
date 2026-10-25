'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import { prefersReducedMotion } from '@/lib/reduced-motion';

import LocaleTag from '../components/LocaleTag';
import { useCopied } from '../components/use-copied';

import { startEveryMorph } from './every-morph';
import RevealSeam from './RevealSeam';
import { pauseWhileHidden } from './visibility';

import './chip-consistency.css';
import './hero-every.css';
import './hero-terminal.css';

gsap.registerPlugin(useGSAP);

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* ------------------------------------------------------------------
   The gt CLI session. Two commands, replayed the way the product runs
   them: the wizard detects the framework and writes the config, then
   `gt translate` scans, translates per string, and writes public/_gt.
   Every string below is real — sources are the site's own UI copy;
   translations are verbatim from the landing demo's shipped table
   (es / fr / ja / de / zh). 128 strings × 5 locales = 640.
   ------------------------------------------------------------------ */

/** The wizard's summary block: detection, source, locale set, files written.
    `src` renders the page's one locale chip like `locs` does — the source is
    a locale token too, so it speaks the same flag+code grammar as the
    targets, in the plate's quieter neutral voice. */
const WIZARD: readonly { key: string; text?: string; src?: string; locs?: readonly string[] }[] = [
  { key: 'Detected', text: 'Next.js · App Router' },
  { key: 'Source', src: 'en' },
  { key: 'Locales', locs: ['es', 'fr', 'ja', 'de', 'zh'] },
  { key: 'Wrote', text: 'gt.config.json · .env.local' },
];

type Variant = { loc: string; text: string };

/** One translated cell; more than one variant means the cell cycles the long tail. */
type Cell = readonly Variant[];

type Row = { src: string; cells: readonly Cell[] };

const ROWS: readonly Row[] = [
  {
    src: '"Hello, world!"',
    cells: [
      [{ loc: 'es', text: '¡Hola, mundo!' }],
      [{ loc: 'ja', text: 'こんにちは、世界！' }],
      [
        { loc: 'de', text: 'Hallo, Welt!' },
        { loc: 'fr', text: 'Bonjour le monde !' },
        { loc: 'zh', text: '你好，世界！' },
      ],
    ],
  },
  {
    src: '"Get started"',
    cells: [
      [{ loc: 'es', text: 'Comenzar ahora' }],
      [{ loc: 'ja', text: '始める' }],
      [{ loc: 'de', text: 'Jetzt starten' }],
    ],
  },
  {
    src: '"Payment received"',
    cells: [
      [{ loc: 'es', text: 'Pago recibido' }],
      [{ loc: 'ja', text: '支払いを受領しました' }],
      [{ loc: 'de', text: 'Zahlung erhalten' }],
    ],
  },
];

/* ------------------------------------------------------------------
   The preview face: the same three strings rendered as UI — heading,
   button, toast — plus the demo copy's first sentence, in the three
   locales the transcript shows. Dates are real Intl output at render
   time, from a fixed day so server and client agree.
   ------------------------------------------------------------------ */

type PreviewLoc = 'es' | 'ja' | 'de';

const PREVIEW_LOCS: readonly PreviewLoc[] = ['es', 'ja', 'de'];

const PREVIEWS: Record<PreviewLoc, { title: string; body: string; button: string; toast: string }> = {
  es: {
    title: '¡Hola, mundo!',
    body: 'General Translation crea infraestructura full-stack para localizar apps, documentación y sitios web.',
    button: 'Comenzar ahora',
    toast: 'Pago recibido',
  },
  ja: {
    title: 'こんにちは、世界！',
    body: 'General Translationは、アプリ、ドキュメント、Webサイトをローカライズするためのフルスタックインフラを構築しています。',
    button: '始める',
    toast: '支払いを受領しました',
  },
  de: {
    title: 'Hallo, Welt!',
    body: 'General Translation entwickelt Full-Stack-Infrastruktur für die Lokalisierung von Apps, Dokumentation und Websites.',
    button: 'Jetzt starten',
    toast: 'Zahlung erhalten',
  },
};

const PREVIEW_DATE = new Date(2026, 6, 30);

/* ------------------------------------------------------------------
   The payload under the render: the hashed-key JSON `gt translate`
   writes to public/_gt/[locale].json (the real file shape — hash of
   the source resolves to the translated string, JSX trees keep their
   structure and only the leaves change). Keys are constant across
   locales because they hash the SOURCE. The slide-to-reveal divider
   pulls the rendered card back to this artifact.
   ------------------------------------------------------------------ */

const HASHES = {
  title: '039ccefb7f335e27',
  button: '32b8f2a917c40de6',
  toast: 'b54ce01d97f2a683',
  body: 'df0269bad214a097',
} as const;

/** One locale's _gt payload, tokenized with the plate's own restraint:
    keys dim, punctuation faint, translated leaves lit. */
function PayloadJson({ loc }: { loc: PreviewLoc }) {
  const p = PREVIEWS[loc];
  const K = ({ k }: { k: string }) => <span className='pl-k'>&quot;{k}&quot;</span>;
  const S = ({ s }: { s: string }) => <span className='pl-s'>&quot;{s}&quot;</span>;
  return (
    <pre className='tct-payload-code'>
      {'{\n  '}
      <K k={HASHES.title} />
      {': '}
      <S s={p.title} />
      {',\n  '}
      <K k={HASHES.button} />
      {': '}
      <S s={p.button} />
      {',\n  '}
      <K k={HASHES.toast} />
      {': '}
      <S s={p.toast} />
      {',\n  '}
      <K k={HASHES.body} />
      {': { "c": [{\n    "c": '}
      <S s={p.body} />
      {',\n    "i": 5, "t": "p"\n  }] }\n}'}
    </pre>
  );
}

/** Command lines type in character by character; static DOM stays complete. */
function Cmd({ text, mark }: { text: string; mark: string }) {
  return (
    <div className='tct-line'>
      <span className='tct-dollar'>$ </span>
      <span className={`tct-type ${mark}`}>
        {[...text].map((ch, i) => (
          <span key={`c${i}`}>{ch}</span>
        ))}
      </span>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { copied, copy } = useCopied('npx gt@latest');

  /* the terminal window's two faces + the preview's locale */
  const [view, setView] = useState<'term' | 'preview'>('term');
  const [ploc, setPloc] = useState<PreviewLoc>('es');
  /* One guided pass flips to the preview and walks the locales; the first
     manual interaction kills it for good — the reader has taken the controls. */
  const tour = useRef<gsap.core.Timeline | null>(null);
  const endTour = () => {
    tour.current?.kill();
    tour.current = null;
  };
  const pickView = (next: 'term' | 'preview') => {
    endTour();
    setView(next);
  };
  const pickLoc = (next: PreviewLoc) => {
    endTour();
    setPloc(next);
  };

  /* ---- the slide-to-reveal cut ----
     Lives in a CSS var on the app card, so the seam's own drag/keys and
     the one-time intro tween all turn the same dial without re-rendering.
     The payload layer is pinned full-width under the render; the var only
     moves its clip boundary (hero-terminal.css), never its content. */
  const app = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const setCut = (pct: number) => {
    const el = app.current;
    if (!el) return;
    const next = Math.min(100, Math.max(0, pct));
    el.style.setProperty('--seam-cut', `${next}%`);
    el.querySelector('.tc-seam')?.setAttribute('aria-valuenow', String(Math.round(next)));
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        /* the still must carry the whole argument: divider parked mid, both
           panes of the reveal legible */
        setCut(50);
        return;
      }

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      /* ---- the terminal session replays ----
         The DOM is complete before any tween runs (every animation is a
         `from`), so reduced motion and the no-JS still both show the whole
         finished transcript. The replay settles inside ~2.5s: any screenshot
         taken three seconds in reads as a finished run, completion line,
         timing and all. */
      const counter = (sel: string, to: number, duration: number, decimals: number) => {
        const el = root.current?.querySelector<HTMLElement>(sel);
        if (!el) return gsap.to({}, { duration: 0 });
        const state = { v: 0 };
        el.textContent = (0).toFixed(decimals);
        return gsap.to(state, {
          v: to,
          duration,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = state.v.toFixed(decimals);
          },
        });
      };

      /* One run, one clock: the ✓ timing here is the same 12.4s the Content
         section's terminal reports for this exact 640-translation run. */
      const run = gsap.timeline({ delay: 0.25, defaults: { ease: 'none' } });
      run
        .from('.tct-cmd1 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 })
        .from('[data-tw]', { autoAlpha: 0, duration: 0.16, stagger: 0.07 }, '+=0.06')
        .from('.tct-cmd2 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 }, '+=0.07')
        .from('[data-ts]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-scan]', 128, 0.4, 0), '<')
        .from('[data-tr-src]', { autoAlpha: 0, duration: 0.14, stagger: 0.06 }, '+=0.05')
        .from('.tct-cell', { autoAlpha: 0, y: 5, duration: 0.22, ease: 'power1.out', stagger: 0.05 }, '<+=0.08')
        .from('[data-td]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-time]', 12.4, 0.4, 1), '<');

      /* ---- the long tail keeps arriving ----
         One cell cycles de → fr → zh: the outgoing variant is fully gone
         before the incoming one lands, so a still never catches two scripts
         printed through each other. */
      const variants = gsap.utils.toArray<HTMLElement>('[data-cyc]', root.current);
      if (variants.length > 1) {
        const cyc = gsap.timeline({ repeat: -1, delay: run.duration() + 2.2 });
        variants.forEach((el, i) => {
          const next = variants[(i + 1) % variants.length];
          if (!next) return;
          cyc
            .to(el, { autoAlpha: 0, duration: 0.24, ease: 'power1.in' }, '+=2.7')
            .to(next, { autoAlpha: 1, duration: 0.28, ease: 'power1.out' }, '>');
        });
        /* the cycle holds still while the hero is off screen */
        if (root.current) pauseWhileHidden(root.current, [cyc]);
      }

      /* ---- one guided pass through the preview ----
         After the run settles — and after the finished transcript has owned
         the window long enough to be the first fold's still — the window
         shows the result as UI once, es → ja → de, then hands the terminal
         back. Any manual input kills this timeline before it acts. */
      const guided = gsap.timeline({ delay: run.duration() + 4.2 });
      guided
        .call(() => setView('preview'))
        .to({}, { duration: 2.1 })
        .call(() => setPloc('ja'))
        .to({}, { duration: 2.1 })
        .call(() => setPloc('de'))
        .to({}, { duration: 2.3 })
        .call(() => {
          setView('term');
          setPloc('es');
          tour.current = null;
        });
      tour.current = guided;

      /* The headline hinge (every-morph.ts): the word after "every" cycles
         through eight scripts while the hero is on screen. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      return em && word ? startEveryMorph(em, word) : undefined;
    },
    { scope: root }
  );

  /* The preview strings re-settle when the locale changes — a short rise from
     dim, never a crossfade of two scripts. Skipped under reduced motion. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-swap]',
        { autoAlpha: 0.25 },
        { autoAlpha: 1, duration: 0.32, ease: 'power1.out' }
      );
    },
    { scope: root, dependencies: [ploc] }
  );

  /* The reveal announces itself once per entry: the payload pane eases open
     to its 70/30 rest. Skipped after the reader has taken the divider, and
     under reduced motion (where the cut is parked mid, statically). */
  useGSAP(
    () => {
      if (view !== 'preview' || dragged.current) return;
      if (prefersReducedMotion()) return;
      const dial = { v: 96 };
      gsap.to(dial, {
        v: 70,
        duration: 0.85,
        delay: 0.25,
        ease: 'power3.out',
        onUpdate: () => setCut(dial.v),
      });
    },
    { scope: root, dependencies: [view] }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        <Image
          className='tc-hero-mark'
          data-hero-in
          src='/brand/no-bg-gt-logo-light.png'
          alt='General Translation'
          width={34}
          height={34}
        />

        {/* Two authored lines rather than a wrap. "Launch in every / language"
            hung a nine-character line under a fifteen-character one and left the
            accent trailing off the end of line one; here the measures are close
            and the accented word opens line two, on the hinge of the sentence. */}
        <h1 data-hero-in>
          <span>Your product speaks</span>
          <span>
            every{' '}
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                language
              </span>
            </em>
            .
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <a className='tc-btn tc-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#frameworks'>
            Docs
          </a>
          <button className='tc-copy' type='button' onClick={copy}>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* The first viewport commits to a material the way the references do:
          the terminal band is a dark plate washed with the prismatic field —
          lit at the flanks, dark in the centre column where the transcript
          sits (the viteplus grammar: a #101010 terminal flanked by lit panels).
          The band itself stays square and full-width; only the window inside
          it keeps the measured top corners and ring. exposureScale is raised
          (= dimmer) so the flanks wash rather than saturate. */}
      <div className='tc-hero-cell tch-band'>
        <PrismaticField className='tc-hero-field tch-field' preset='1' speed={0.5} params={{ exposureScale: 3400 }} />
        <div className='tct-win' data-hero-in>
          <div className='tct-bar'>
            <span className='tct-title'>gt — translate</span>
            <div className='tct-seg' role='group' aria-label='Show the run as'>
              <button type='button' data-on={view === 'term'} onClick={() => pickView('term')}>
                terminal
              </button>
              <button type='button' data-on={view === 'preview'} onClick={() => pickView('preview')}>
                preview
              </button>
            </div>
          </div>

          <div className='tct-stage'>
            {/* face 1 — the session */}
            <div className='tct-face tct-face-term' data-on={view === 'term'} aria-hidden={view !== 'term'}>
              <div className='tct-body'>
                <Cmd text='npx gt@latest' mark='tct-cmd1' />
                <div className='tct-gap' />
                {WIZARD.map((line) => (
                  <div className='tct-line' data-tw key={line.key}>
                    <span className='tct-key'>{`  ${line.key.padEnd(11)}`}</span>
                    {line.locs ? (
                      <span className='tct-locset'>
                        {line.locs.map((loc) => (
                          <i className='tct-chip' key={loc}>
                            <LocaleTag code={loc} />
                          </i>
                        ))}
                      </span>
                    ) : line.src ? (
                      <span className='tct-locset'>
                        <i className='tct-chip is-src'>
                          <LocaleTag code={line.src} />
                        </i>
                      </span>
                    ) : (
                      line.text
                    )}
                  </div>
                ))}
                <div className='tct-gap' />

                <Cmd text='npx gt translate' mark='tct-cmd2' />
                <div className='tct-gap' />
                <div className='tct-line tct-meta' data-ts>
                  {'  Scanning src — '}
                  <b className='tct-strong' data-count-scan>
                    128
                  </b>
                  {' strings found'}
                </div>
                <div className='tct-line tct-meta' data-ts>
                  {'  Translating with project context'}
                </div>
                <div className='tct-gap' />

                <div className='tct-table'>
                  {ROWS.map((row) => (
                    <div className='tct-row' key={row.src}>
                      <span className='tct-src' data-tr-src>
                        {row.src}
                      </span>
                      {row.cells.map((cell, c) => {
                        const only = cell.length === 1 ? cell[0] : undefined;
                        return only ? (
                          <span className='tct-cell' key={only.loc}>
                            <i className='tct-chip'>
                              <LocaleTag code={only.loc} />
                            </i>
                            <b className='tct-tr'>{only.text}</b>
                          </span>
                        ) : (
                          <span className='tct-cell tct-cyc' key={`cyc${c}`}>
                            {cell.map((v, i) => (
                              <span data-cyc key={v.loc} style={{ opacity: i === 0 ? 1 : 0 }}>
                                <i className='tct-chip'>
                                  <LocaleTag code={v.loc} />
                                </i>
                                <b className='tct-tr'>{v.text}</b>
                              </span>
                            ))}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className='tct-gap' />

                <div className='tct-line tct-meta' data-td>
                  {'  Wrote public/_gt/'}
                  <span className='tct-glob'>{'{es,fr,ja,de,zh}'}</span>
                  {'.json'}
                </div>
                <div className='tct-line tct-meta' data-td>
                  {'  '}
                  <span className='tct-ok'>✓</span>
                  {' '}
                  <b className='tct-strong'>640</b>
                  {' translations · 5 locales · '}
                  <span className='tct-ok'>
                    <b data-count-time>12.4</b>s
                  </span>
                </div>
                <div className='tct-gap' />
                <div className='tct-line' data-td>
                  <span className='tct-dollar'>$ </span>
                  <span className='tct-caret' />
                </div>
              </div>
            </div>

            {/* face 2 — the same strings, rendered */}
            <div className='tct-face tct-face-prev' data-on={view === 'preview'} aria-hidden={view !== 'preview'}>
              <div className='tct-tabs' role='group' aria-label='Preview locale'>
                {PREVIEW_LOCS.map((loc) => (
                  <button type='button' data-on={ploc === loc} key={loc} onClick={() => pickLoc(loc)}>
                    <LocaleTag code={loc} />
                  </button>
                ))}
              </div>

              {/* The rendered card carries the house slide-to-reveal: the
                  payload gt wrote sits pinned full-width UNDER the render,
                  and the seam (the logo's doubled line, each thread in its
                  surface's own ink) only moves the clip boundary — dragging
                  reveals the artifact in place, edge to edge. */}
              <div className='tct-app' ref={app} style={{ '--seam-cut': '70%' }}>
                <div className='tct-app-addr'>
                  example.com/<b data-swap>{ploc}</b>
                </div>
                <div className='tct-app-main'>
                  <h3 className='tct-app-h' data-swap lang={ploc}>
                    {PREVIEWS[ploc].title}
                  </h3>
                  <p className='tct-app-date' data-swap suppressHydrationWarning>
                    {new Intl.DateTimeFormat(ploc, { dateStyle: 'medium' }).format(PREVIEW_DATE)}
                  </p>
                  <p className='tct-app-copy' data-swap lang={ploc}>
                    {PREVIEWS[ploc].body}
                  </p>
                  <span className='tct-app-btn' data-swap lang={ploc}>
                    {PREVIEWS[ploc].button}
                  </span>
                  <div className='tct-app-toast' data-swap lang={ploc}>
                    <i>✓</i>
                    {PREVIEWS[ploc].toast}
                  </div>
                </div>

                <div className='tct-payload' data-swap aria-hidden>
                  <div className='tct-payload-file'>public/_gt/{ploc}.json</div>
                  <PayloadJson loc={ploc} />
                </div>

                <RevealSeam
                  boxRef={app}
                  ariaLabel='Reveal the served translation file'
                  onInteract={() => {
                    endTour();
                    dragged.current = true;
                  }}
                />
              </div>

              <p className='tct-prev-note'>
                served from <b>public/_gt/{ploc}.json</b> — drag the seam
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
