'use client';

import { useRef } from 'react';

import EdgeGlobe from '../diagrams/EdgeGlobe';
import PrismaticField from '@/components/shared/PrismaticField';
import LocaleRouting from '../diagrams/LocaleRouting';
import SdkLedger from '../diagrams/SdkLedger';
import StatRow from '../diagrams/StatRow';
import TranslationFlow from '../diagrams/TranslationFlow';
import ContextResolve from '../diagrams/lang/ContextResolve';
import ExpansionBars from '../diagrams/lang/ExpansionBars';
import PluralForms from '../diagrams/lang/PluralForms';
import RtlMirror from '../diagrams/lang/RtlMirror';
import ScriptSampler from '../diagrams/lang/ScriptSampler';
import SentenceWidth from '../diagrams/lang/SentenceWidth';
import WordMorph from '../diagrams/lang/WordMorph';
import CustomSurface from '../diagrams/surface/CustomSurface';
import GlossarySurface from '../diagrams/surface/GlossarySurface';
import LiveSurface from '../diagrams/surface/LiveSurface';
import PreviewSurface from '../diagrams/surface/PreviewSurface';

import CodeBlock from './code';
import { usePlateCascade } from './cascade';
import { useQuietReveal } from './reveal';

/* Both file buckets, not just the SDK one — the CLI reads the same config for
   loose JSON content, and saying so is also what lets this panel end level with
   the illustration beside it instead of half a card short of it. */
const CONFIG = `{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "public/_gt/[locale].json"
    },
    "json": {
      "include": ["content/[locale]/*.json"]
    }
  }
}`;

const GROUNDWORK = [
  'SEO-friendly locale paths, with no configuration',
  'ICU plurals, numbers, currencies, and dates',
  'Dev previews before anything reaches production',
  'Over-the-air updates without a redeploy',
  'Glossaries and per-locale style rules',
  'SOC 2 Type II, GDPR, ISO 27001',
];

/**
 * CURATION LEDGER — the dark directions' eight-cell feature grid
 * (archive-press/sections/Features.tsx + components/shared/diagrams), audited
 * against this page cell by cell. Decision per diagram:
 *
 *  1. <T> wrap brace          → ADAPT. The real 18-line sample in Frameworks
 *     beats the five-line abstract, but the doubled bracket binding the
 *     wrapped lines was the one thing it said that we did not. Adopted into
 *     CodeBlock (sections/code.tsx) as a thread-gauge bracket in the
 *     sample's own margin, <T> to </T>.
 *  2. Glossary/directives     → ADAPT. Our Vault pin (strikethrough against
 *     the overruled word) beats the dark table's term rows, but its
 *     directives half — per-locale style rules, the formal Sie — existed
 *     here only as a groundwork bullet. Adopted into GlossarySurface below
 *     the entries, behind the group divider.
 *  3. Translation ledger with per-locale deltas → SKIP. SentenceWidth
 *     measures live in the browser, ExpansionBars carries the ranked deltas,
 *     and TranslationFlow fans the real files; the dark five-row ledger is
 *     three of our diagrams compressed into a weaker one.
 *  4. GET /about routing trace + pathConfig → SKIP. LocaleRouting already
 *     shows six real routes with /fr/a-propos lit and the full detection
 *     ladder (which includes Accept-Language). Its pathConfig fragment would
 *     also argue against this cell's own copy — "paths you never configure".
 *  5. Edge-delivery rail with PoP latencies → SKIP. The rebuilt EdgeGlobe
 *     labels five real POPs with measured latencies on the delivery band;
 *     the flat rail carries the same five data on less structure.
 *  6. Source/preview pane pair → ADAPT. The pairing (en source beside es
 *     preview) is the feature's argument and our dev window showed only the
 *     preview half. Adopted into PreviewSurface, inside the window frame.
 *  7. Live-translation bubbles with latency → SKIP. LiveSurface shows the
 *     same round trip with the request line, the measured 38 ms, and the
 *     cache note, on the page's dark panel.
 *  8. gt.config.json → SKIP. This page ships the full file, line for line,
 *     on the inset panel ("One config file"); the dark cell is a fragment.
 *
 * The bento. Every row is a different shell — split, three-across, full-bleed
 * visual, inset panel, stat, plain text — because eight identical cards is the
 * one failure mode this direction cannot survive.
 *
 * Two devices carry the composition. Cells that hold something visual are
 * mounted in the nested frame (`is-framed` + `.tc-card`); cells that are only
 * words stay flat on the page, and that contrast is what keeps the frame from
 * reading as a uniform card grid. Between three specific rows the page stops
 * for a hatched spacer, which is where a subject changes.
 *
 * The language diagrams lead. They show what translation does to a layout,
 * which is the thing an isometric cube cannot say.
 */
export default function Bento() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  /* Framed cells enter as machined parts — the reading-order cascade with a
     one-shot gloss sweep apiece — while flat text keeps the quiet reveal. */
  usePlateCascade(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Everything localization needs.</h2>
        <p data-reveal>
          What translation does to a layout, the libraries you write against, the platform that holds your
          context, and the edge that serves the result — one system.
        </p>
      </div>

      {/* ---- shell 1: the signature diagram, and the data behind it ---- */}
      <div className='tc-row is-lead'>
        <div className='tc-cell is-tall is-framed' data-plate>
          <div className='tc-card'>
            <h3>Every locale is a different length</h3>
            <p>
              One button in four languages, measured by the browser rather than estimated. German runs
              long, Japanese runs short, and Arabic re-anchors the whole line.
            </p>
            <div className='tc-lang is-lead'>
              <SentenceWidth title='The same sentence measured in English, German, Japanese and Arabic' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-tall is-framed' data-plate>
          <div className='tc-card'>
            <h3>Ranked against English</h3>
            <p>A layout that only fits the source string breaks somewhere near the top of this list.</p>
            <div className='tc-lang'>
              <ExpansionBars title='Text expansion by locale, relative to English' />
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 2: split row — flat copy left, mounted object right ---- */}
      <div className='tc-row is-split'>
        <div className='tc-cell is-tall' data-reveal>
          <h3>Code</h3>
          <p>
            Developer-first libraries for React, Next.js, and more, battle-tested in production apps with
            millions of users.
          </p>
          <ul className='tc-list'>
            <li>
              <code className='tc-chip'>&lt;T&gt;</code> wraps any JSX — nested elements and all
            </li>
            <li>
              <code className='tc-chip'>useGT()</code> returns strings for anything that is not JSX
            </li>
            <li>
              <code className='tc-chip'>&lt;Num&gt;</code> and <code className='tc-chip'>&lt;DateTime&gt;</code>{' '}
              format to the reader&rsquo;s locale
            </li>
          </ul>
          <div className='tc-cell-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href='#frameworks'>
              Read the docs
            </a>
          </div>
        </div>

        <div className='tc-cell is-tall is-framed' data-plate>
          <div className='tc-card'>
            <div className='tc-art-center'>
              <SdkLedger title='The four first-party SDKs, each with its runtime and the import you write' />
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 3: three narrow cells, one small visual each ---- */}
      <div className='tc-row is-three'>
        <div className='tc-cell is-short is-framed' data-plate>
          <div className='tc-card'>
            <h3>Context</h3>
            <p>One word, two meanings. A context tag decides which translation ships.</p>
            <div className='tc-lang'>
              <ContextResolve title='Save resolving to speichern or sparen by context' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-plate>
          <div className='tc-card'>
            <h3>Terminology</h3>
            <p>
              One term, six locales, decided once. Per-locale style rules keep the wording identical
              everywhere it appears.
            </p>
            <div className='tc-lang'>
              <WordMorph title='The term Settings printed in six locales' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-plate>
          <div className='tc-card'>
            <h3>Routing</h3>
            <p>Automatic detection and locale-based routing, on SEO-friendly paths you never configure.</p>
            <div className='tc-surface is-plated'>
              <LocaleRouting title='The same page routed for all six configured locales, /fr/a-propos localized, with the detection order beneath' />
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 4: full-bleed visual beside an inset code panel ---- */}
      <div className='tc-row is-wide-left'>
        <div className='tc-cell is-bleed is-framed' data-plate>
          <div className='tc-card'>
            <div className='tc-bleed-head'>
              <h3>Translation</h3>
              <p>
                AI agents that understand your project structure and localize your content in context.
              </p>
            </div>
            <div className='tc-bleed-art'>
              <TranslationFlow title='app/page.tsx fanned into public/_gt/es.json, ja.json and de.json, each holding its three real translations' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-panel is-framed' data-plate>
          <div className='tc-card'>
            <h3>One config file</h3>
            <p>Locales in, output path out. The CLI and every SDK read the same file.</p>
            <CodeBlock file='gt.config.json' code={CONFIG} numbers={false} />
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 5: stat rows beside a field of scripts, tipped off centre ---- */}
      <div className='tc-row is-tilt'>
        <div className='tc-cell is-framed' data-plate>
          <div className='tc-card'>
            <h3>Built for your next billion users</h3>
            <div className='tc-stats'>
              <StatRow value='118' label='locales, all production-ready' />
              <StatRow value='6' label='first-party SDKs' />
              <StatRow value='1,000,000,000' label='users you have not met yet' />
              <StatRow value='$0' label='to start' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-plate>
          <div className='tc-card'>
            <h3>Every writing system</h3>
            <p>
              Latin, Cyrillic, Greek, Arabic, Devanagari, Han, Hangul, Thai — joined, stacked and
              bidi-resolved by the browser, with per-script fallbacks in the SDK.
            </p>
            <div className='tc-lang'>
              <ScriptSampler title='The word “language” in eight writing systems' />
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 6: delivery as a full-bleed inverse band, the field behind it ---- */}
      <div className='tc-delivery-band'>
        <PrismaticField
          className='tc-delivery-field'
          preset='1'
          speed={0.4}
          params={{ exposureScale: 2400 }}
        />
        <div className='tc-delivery-in'>
          <div className='tc-delivery-art' data-reveal>
            <div className='tc-art-globe'>
              <EdgeGlobe title='A meridian cage with three points of presence and one serving 12 ms away' />
            </div>
            <p className='tc-night-note'>5 points of presence shown · anycast · versioned per locale</p>
          </div>

          <div className='tc-delivery-copy' data-reveal>
            <h3>Delivery</h3>
            <p>
              A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.
            </p>
            <ul className='tc-list'>
              <li>Fix a translation and ship it without touching your build</li>
              <li>Served from the edge, close to whoever asked for it</li>
              <li>Versioned per locale, so a rollback is one step</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ---- shell 7: a pair leaning left-light, both cells grammar ---- */}
      <div className='tc-row is-grammar'>
        <div className='tc-cell is-framed' data-plate>
          <div className='tc-card'>
            <h3>Counting is not concatenation</h3>
            <p>
              English has two plural forms, Polish four, Japanese one. GT ships ICU plurals, so the number
              picks the form instead of the string.
            </p>
            <div className='tc-lang'>
              <PluralForms accent={false} title='One count under English, Polish and Japanese plural rules' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-plate>
          <div className='tc-card'>
            <h3>Both directions, one markup</h3>
            <p>
              Set <code className='tc-chip'>dir</code> and the browser mirrors rows, alignment and controls.
              Nothing about the panel is written twice.
            </p>
            <div className='tc-lang'>
              <RtlMirror accent={false} title='The same panel rendered left-to-right and right-to-left' />
            </div>
          </div>
        </div>

      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 8: one ruled band, four columns ----
          These four used to be four mounted cells of identical shape in a rank,
          which is the one thing this direction cannot survive: the row read as a
          card grid and the frame stopped meaning anything. One mount now, divided
          by the page's own hairline — a spec table rather than four cards, and one
          border level shallower for the panels inside it. Each panel still carries
          a real artifact rather than a drawing: the dev window, one round trip,
          the hook you write, and a glossary entry with the translation it
          overrules. */}
      <div className='tc-row is-one'>
        <div className='tc-cell is-framed' data-plate>
          <div className='tc-card'>
            <div className='tc-quad'>
              <div>
                <h3>Previews</h3>
                <p>Preview translations in development before they go live.</p>
                <div className='tc-surface'>
                  <PreviewSurface title='The dev server showing the English page and its Spanish preview, one above the other' />
                </div>
              </div>

              <div>
                <h3>Live Translation</h3>
                <p>Translate user-generated content on demand, in full context.</p>
                <div className='tc-surface'>
                  <LiveSurface title='A user comment translated into Brazilian Portuguese in 38 milliseconds' />
                </div>
              </div>

              <div>
                <h3>Customization</h3>
                <p>Bring your own detection function, components and formats.</p>
                <div className='tc-surface'>
                  <CustomSurface title='A custom getLocale function reading a cookie, then a header' />
                </div>
              </div>

              <div>
                <h3>Glossaries</h3>
                <p>Pin a term, set per-locale style rules. Both hold on every later run.</p>
                <div className='tc-surface'>
                  <GlossarySurface title='The term Vault pinned across German, Spanish and Japanese, with the German formality directive beneath' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 9: no illustration at all ---- */}
      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <div className='tc-plain'>
            <div>
              <h3>And the parts nobody demos</h3>
              <p>Everything above assumes the unglamorous things already work. They do.</p>
            </div>
            <ul>
              {GROUNDWORK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
