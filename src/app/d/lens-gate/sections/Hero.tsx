'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

import type { LensFieldHandle } from '../lib/lens-field';
import LensField from './LensField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

type LensCard = {
  kind: 'button' | 'toast' | 'chip' | 'nav' | 'meter';
  label: string;
};

type LensPair = {
  id: string;
  /** Locale badge stamped on the emitted card. */
  locale: string;
  rtl?: boolean;
  en: LensCard;
  tr: LensCard;
};

/**
 * Real UI artifacts with real translations (vetted in the Concrete Origin
 * prototype and the portal hero's pair data) — what leaves the glass has to be
 * correct copy, so glyph soup would break the premise. Three rule rows, two
 * artifacts each; a row's traffic alternates between its two pairs so the loop
 * never reads mechanical. Row order matters: rows nearer the lens equator have
 * the least room past the exit rim, so they carry the shortest translations;
 * the bottom row (widest exit chord) carries the nav bar and the
 * currency/date reading — localization surface beyond words.
 */
const ROWS: readonly (readonly LensPair[])[] = [
  [
    {
      id: 'cta',
      locale: 'JA',
      en: { kind: 'button', label: 'Get started →' },
      tr: { kind: 'button', label: '始める →' },
    },
    {
      id: 'greeting',
      locale: 'AR',
      rtl: true,
      en: { kind: 'chip', label: 'Welcome back!' },
      tr: { kind: 'chip', label: '!مرحبًا بعودتك' },
    },
  ],
  [
    {
      id: 'toast',
      locale: 'DE',
      en: { kind: 'toast', label: 'Payment received' },
      tr: { kind: 'toast', label: 'Zahlung erhalten' },
    },
    {
      id: 'review',
      locale: 'KO',
      en: { kind: 'chip', label: 'Ready for review' },
      tr: { kind: 'chip', label: '검토 준비 완료' },
    },
  ],
  [
    {
      id: 'nav',
      locale: 'JA',
      en: { kind: 'nav', label: 'Home · Docs · Pricing' },
      tr: { kind: 'nav', label: 'ホーム · ドキュメント · 料金' },
    },
    {
      id: 'meter',
      locale: 'DE-DE',
      en: { kind: 'meter', label: '$1,234.56 · Jul 30' },
      tr: { kind: 'meter', label: '1.234,56 € · 30. Juli' },
    },
  ],
];

/** Endonyms seated on the hero's bottom rule — 12 listed of the 118 covered. */
const ENDONYMS: readonly string[] = [
  'Español',
  '日本語',
  'Deutsch',
  '한국어',
  'Français',
  'العربية',
  'Português',
  '简体中文',
  'Italiano',
  'Türkçe',
  'Nederlands',
  'Polski',
];

/** The ruled pitch, shared with the shader — rows seat on these lines. */
const PITCH = 28;

/** Initial loop phases per row, staggered unevenly so no still reads timed. */
const SEEDS: readonly number[] = [0.15, 0.52, 0.8];

/* The glass material per theme. On paper the lifts (caustic, pool, specular)
   only have ~1.6% of headroom to pure white, so they lean on contrast with the
   body tint and on washing the rules; on dark paper the same lifts are potent,
   so their weights drop by an order of magnitude while the body tint flips
   from a density to a pale edge-light. */
const LIGHT = {
  ink: [0.059, 0.067, 0.075] as [number, number, number],
  paper: [0.984, 0.984, 0.98] as [number, number, number],
  ruleAlpha: 0.13,
  ringAlpha: 0.3,
  spectral: 0.65,
  bodyAlpha: 0.05,
  bodyTint: [0.62, 0.67, 0.66] as [number, number, number],
  specAlpha: 0.38,
  causticAlpha: 0.8,
  poolAlpha: 0.85,
  shadowAlpha: 0.07,
};

/* #16171d / #ffffff — the dark-theme remap, mirrored into the shader so the
   canvas follows the token flip instead of staying a paper rectangle. */
const DARK = {
  ink: [1, 1, 1] as [number, number, number],
  paper: [0.0863, 0.0902, 0.1137] as [number, number, number],
  ruleAlpha: 0.13,
  ringAlpha: 0.3,
  spectral: 0.34,
  bodyAlpha: 0.07,
  bodyTint: [0.34, 0.39, 0.44] as [number, number, number],
  specAlpha: 0.055,
  causticAlpha: 0.08,
  poolAlpha: 0.055,
  shadowAlpha: 0.35,
};

/** Per-row geometry measured by the hero, consumed by the conveyor builder. */
type RowGeo = {
  /** EN lane width in px — the approach run up to the lens meridian. */
  enW: number;
  /** TR lane width in px (extends past the viewport on phones). */
  trW: number;
  /** On-screen width right of the meridian — the room a card can rest in. */
  trVisW: number;
  /** Widest half-chord (px from the meridian) across the card's height. */
  chordMax: number;
  /** Tightest half-chord across the card's height — where a card traveling
      in is last visible, and a card traveling out first shows. */
  chordMin: number;
  /** Lane-x of the visible gutter — phones start their lanes off-screen. */
  enPad: number;
  phone: boolean;
};

const clampNum = (value: number, lo: number, hi: number) => Math.min(Math.max(value, lo), hi);

function CardView({ card, stamp }: { card: LensCard; stamp?: string }) {
  return (
    <span className={`lg-card is-${card.kind}`}>
      {card.kind === 'toast' ? <i className='lg-card-dot' aria-hidden /> : null}
      {card.kind === 'nav'
        ? card.label.split(' · ').map((part) => (
            <span className='lg-nav-part' key={part}>
              {part}
            </span>
          ))
        : card.label}
      {stamp ? <b className='lg-stamp'>{stamp}</b> : null}
    </span>
  );
}

/**
 * The hero IS the ruled page. Its own hairlines run as a WebGL field, and one
 * circular glass lens sits right-of-center: rules magnify and bow through it,
 * snap perfectly straight outside it, and carry the page's single chroma
 * moment as a sub-pixel fringe on the rim. The headline sits on the flat pane
 * to the left — the one region the glass never crosses.
 *
 * Translation is continuous traffic: English artifacts travel along the rule
 * lines, slip under the rim (each lane is masked by the true lens disc, so a
 * card follows the curve of the glass as it disappears), and emerge on the far
 * side translated and locale-stamped. Three rows loop out of phase, each
 * alternating two artifacts, so any still frame catches at least one pair
 * mid-story. The GT mark holds the core — the product is the glass — and a
 * quiet endonym ledger seats on the hero's bottom rule.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<LensFieldHandle | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      const hero = heroRef.current;
      const core = coreRef.current;
      if (!hero || !core) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rowEls = gsap.utils.toArray<HTMLElement>('.lg-row', hero);
      const conveyors: gsap.core.Timeline[] = [];
      let rowGeos: RowGeo[] = [];
      let gate: ScrollTrigger | null = null;
      let buildTimer: ReturnType<typeof setTimeout> | undefined;

      /* Lens placement policy. Everything derives from two measured boxes:
         the hero (canvas) and the flat pane. The glass must clear the pane by
         layout, the whole circle must stay inside the hero, and every traffic
         row must be a rule line whose full card height crosses the glass —
         the constraint order below (rows first, then center from the last
         row) is what keeps all three true at every viewport. */
      const measure = () => {
        const hb = hero.getBoundingClientRect();
        const cb = core.getBoundingClientRect();
        if (hb.width < 2 || cb.width < 2) return;
        const w = hb.width;
        const h = hb.height;
        const flatRight = cb.right - hb.left;
        const flatBottom = cb.bottom - hb.top;

        /* Below this the flat pane and the glass cannot share a band, so the
           lens drops under the copy and the traffic rows cross it there. */
        const narrow = w < 1060;
        /* Below the rail's borderless cut, cards may enter and exit through
           the screen edges; inside a bordered rail they never cross it. */
        const phone = w <= 620;
        hero.dataset.lensNarrow = narrow ? 'true' : 'false';

        const px = (value: number) => `${Math.round(value * 100) / 100}px`;
        const setVar = (name: string, value: number) => {
          hero.style.setProperty(name, px(value));
        };

        const heroIn = hero.querySelector<HTMLElement>('.lg-hero-in');
        const gut = heroIn ? parseFloat(getComputedStyle(heroIn).paddingLeft) || 24 : 24;
        const cardH = phone ? 28 : 34;
        const laneH = cardH + 14;

        let cx: number;
        let cy: number;
        let r: number;
        const rowYs: number[] = [];

        if (narrow) {
          r = Math.min(
            clampNum(w * 0.3, 104, 148),
            h * 0.28,
            Math.max((h - flatBottom - 120) / 2, 60)
          );
          cx = w / 2;
          cy = clampNum(flatBottom + 40 + r, r + 24, h - r - 60);
          /* Two rows hugging the equator (one rule out), snapped to rules —
             near the equator the rim crossing is steep, so a traveling card
             cuts cleanly under the glass instead of smearing along a
             near-tangent arc. */
          const cyRule = Math.round(cy / PITCH) * PITCH;
          rowYs.push(cyRule - PITCH, cyRule + PITCH);
        } else {
          r = Math.min(clampNum(w * 0.205, 200, 250), h * 0.37);
          /* Rows are rule indices two apart (56px). The first row clears the
             flat pane by a full lane, so every approach run starts at the
             gutter and passes beneath the pane's baseline — never under it. */
          const first = Math.ceil((flatBottom + laneH + 6) / PITCH);
          rowYs.push(first * PITCH, (first + 2) * PITCH, (first + 4) * PITCH);
          cx = clampNum(flatRight + r + 28, w * 0.56, w - r - 120);
          const lastRow = rowYs[rowYs.length - 1] ?? flatBottom + 112;
          /* Pull the center down until the bottom row still cuts the glass. */
          cy = clampNum(Math.max(h * 0.47, lastRow + 24 - r), r + 24, h - r - 26);
        }

        setVar('--lg-cx', cx);
        setVar('--lg-cy', cy);
        setVar('--lg-r', r);
        /* The endonym ledger seats on the last drawn rule of the hero. */
        setVar('--lg-ledger-b', h - Math.floor((h - 18) / PITCH) * PITCH);

        const geos: RowGeo[] = [];
        rowYs.forEach((y, i) => {
          const rowEl = rowEls[i];
          if (!rowEl) return;
          const laneTop = y - laneH;

          /* Chords across the card's height: chordMax is the rim x where an
             emerging card is fully clear of the glass at every point;
             chordMin is where an approaching card is last visible. */
          const dRule = Math.abs(y - cy);
          const dTop = Math.abs(y - cardH - cy);
          const dMin = y - cardH <= cy && cy <= y ? 0 : Math.min(dRule, dTop);
          const dMax = Math.max(dRule, dTop);
          const chordMax = Math.sqrt(Math.max(r * r - dMin * dMin, 0));
          const chordMin = Math.sqrt(Math.max(r * r - dMax * dMax, 144));

          const enL = phone ? -70 : gut;
          const enW = cx - enL;
          /* +14 of slack past the gutter so a resting card's locale stamp
             (which overhangs its top-right corner) never clips at the lane
             edge; the cards themselves still rest inside trVisW. */
          const trW = phone ? w + 70 - cx : w - gut - cx + 14;
          const trVisW = w - gut - cx;

          const set = (el: HTMLElement, name: string, value: number) => {
            el.style.setProperty(name, px(value));
          };
          set(rowEl, '--lane-t', laneTop);
          set(rowEl, '--lane-h', laneH);
          set(rowEl, '--en-l', enL);
          set(rowEl, '--en-w', enW);
          set(rowEl, '--tr-l', cx);
          set(rowEl, '--tr-w', trW);
          set(rowEl, '--my', cy - laneTop);
          set(rowEl, '--rr', r);
          set(rowEl, '--mx-en', cx - enL);
          set(rowEl, '--mx-tr', 0);

          geos.push({ enW, trW, trVisW, chordMax, chordMin, enPad: gut - enL, phone });
        });

        /* Rows beyond this breakpoint's count (the third row on narrow) park
           off-canvas; the builder also zeroes their travelers. */
        for (let i = rowYs.length; i < rowEls.length; i++) {
          const spare = rowEls[i];
          if (spare) spare.style.setProperty('--lane-t', '-500px');
        }

        rowGeos = geos;
        /* The rim assembly (dispersion fringes, spectral band) is authored in
           CSS px against the desktop radius; on small glass the same gauges
           read as a heavy tube, so they scale down with the disc. */
        const glassScale = clampNum(r / 250, 0.6, 1);
        fieldRef.current?.setParams({
          center: [cx, cy],
          radius: r,
          fringe: 2.4 * glassScale,
          ringWidth: 3 * glassScale,
        });
      };

      /* The conveyor: per row, a looping timeline in which each artifact
         fades onto the approach rule, travels under the rim (the lane's disc
         mask swallows it along the true curve of the glass), holds a beat in
         the glass, then emerges translated on the far side, rests with its
         locale stamp, and yields to the row's other artifact. Rebuilt on
         resize because every distance is measured. */
      const buildConveyor = () => {
        for (const tl of conveyors) tl.kill();
        conveyors.length = 0;

        rowEls.forEach((rowEl, i) => {
          const geo = rowGeos[i];
          const enEls = gsap.utils.toArray<HTMLElement>('.lg-lane.is-en .lg-traveler', rowEl);
          const trEls = gsap.utils.toArray<HTMLElement>('.lg-lane.is-tr .lg-traveler', rowEl);
          const all = [...enEls, ...trEls];
          if (!all.length) return;
          gsap.set(all, { x: 0, autoAlpha: 0 });
          if (!geo) return;

          if (reduced) {
            /* Composed still: the row's first pair parked mid-story — EN
               seated against the entry rim, its translation resting stamped
               past the exit rim. */
            const en = enEls[0];
            const tr = trEls[0];
            if (!en || !tr) return;
            gsap.set(en, {
              x: Math.max(geo.enW - geo.chordMax - en.offsetWidth - 18, geo.enPad + 4),
              autoAlpha: 1,
            });
            gsap.set(tr, {
              x: clampNum(geo.chordMax + 12, 14, Math.max(geo.trVisW - tr.offsetWidth - 8, 14)),
              autoAlpha: 1,
            });
            return;
          }

          const tl = gsap.timeline({ repeat: -1, paused: gate ? !gate.isActive : false });
          let t = 0;

          enEls.forEach((en, k) => {
            const tr = trEls[k];
            if (!tr) return;
            const enWidth = en.offsetWidth;
            const trWidth = tr.offsetWidth;
            /* The approach ends the moment the card is fully swallowed — the
               tightest chord across its height — so the row never spends a
               beat pushing an invisible card toward the meridian. */
            const enEnd = geo.enW - geo.chordMin + 12;
            const enStart = geo.phone ? -enWidth - 12 : 0;
            const durIn = clampNum((enEnd - enStart) / (geo.phone ? 130 : 220), 1.5, 3.4) + i * 0.2;
            /* Rest just clear of the rim; when the viewport is tight the card
               instead rests right-aligned with its tail still under the glass
               — half-emerged is still the story. */
            const restX = clampNum(
              geo.chordMax + 12,
              14,
              Math.max(geo.trVisW - trWidth - 8, 14)
            );
            /* Emerge from just inside the exit rim, not from the meridian. */
            const emergeX = clampNum(
              geo.chordMin - 8 - trWidth,
              16 - trWidth,
              Math.max(restX - 40, 16 - trWidth)
            );

            const beat = geo.phone ? 0.25 : 0.45;
            const emerge = geo.phone ? 1.2 : 1.5;

            if (geo.phone) {
              tl.set(en, { x: enStart, autoAlpha: 1 }, t);
              tl.to(en, { x: enEnd, duration: durIn, ease: 'power1.inOut' }, t);
            } else {
              tl.set(en, { x: enStart, autoAlpha: 0 }, t);
              tl.to(en, { autoAlpha: 1, duration: 0.5, ease: 'none' }, t);
              tl.to(en, { x: enEnd, duration: durIn, ease: 'power1.inOut' }, t);
            }
            t += durIn + beat;

            tl.set(tr, { x: emergeX, autoAlpha: 1 }, t);
            tl.to(tr, { x: restX, duration: emerge, ease: 'power2.out' }, t);
            t += emerge;

            if (geo.phone) {
              /* No rest inside a borderless rail — a slow drift through the
                 visible zone, then out through the screen edge. */
              tl.to(tr, { x: '+=26', duration: 3, ease: 'none' }, t);
              t += 3;
              tl.to(tr, { x: geo.trW + 24, duration: 1.15, ease: 'power1.in' }, t);
              t += 1.15;
              tl.set(tr, { autoAlpha: 0 }, t);
            } else {
              tl.to(tr, { x: '+=10', duration: 2.1, ease: 'none' }, t);
              t += 2.1;
              tl.to(tr, { autoAlpha: 0, x: '+=14', duration: 0.55, ease: 'power1.in' }, t);
              t += 0.55;
            }
            /* The next artifact enters while this one is still leaving —
               the rule reads as continuous traffic, not a shuttle. */
            t -= geo.phone ? 1.6 : 1.4;
          });

          tl.add(() => {}, t);
          tl.progress(SEEDS[i] ?? 0);
          conveyors.push(tl);
        });
      };

      const scheduleBuild = () => {
        clearTimeout(buildTimer);
        buildTimer = setTimeout(buildConveyor, 160);
      };

      const applyTheme = () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        fieldRef.current?.setParams(dark ? DARK : LIGHT);
      };

      measure();
      applyTheme();
      buildConveyor();

      const observer = new ResizeObserver(() => {
        measure();
        scheduleBuild();
      });
      observer.observe(hero);
      observer.observe(core);
      void document.fonts?.ready.then(() => {
        measure();
        scheduleBuild();
      });

      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      if (!reduced) {
        /* The loops are cheap, but there is no reason to run them while the
           hero is scrolled away. */
        gate = ScrollTrigger.create({
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            for (const tl of conveyors) {
              if (self.isActive) tl.play();
              else tl.pause();
            }
          },
        });

        gsap.from('[data-hero-in]', {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power2.out',
        });

        gsap.from('.lg-lens-core', {
          autoAlpha: 0,
          scale: 0.86,
          duration: 0.9,
          delay: 0.3,
          ease: 'power2.out',
        });

        /* The ledger's quiet pulse: one endonym at a time takes ink. */
        const items = gsap.utils.toArray<HTMLElement>('.lg-ledger-item', hero);
        if (items.length) {
          const step = 1.9;
          const rot = gsap.timeline({ repeat: -1 });
          items.forEach((el, k) => {
            rot.call(
              () => {
                for (const other of items) other.classList.remove('is-on');
                el.classList.add('is-on');
              },
              [],
              k * step
            );
          });
          rot.add(() => {}, items.length * step);
        }
      }

      return () => {
        observer.disconnect();
        themeObserver.disconnect();
        clearTimeout(buildTimer);
        for (const tl of conveyors) tl.kill();
        conveyors.length = 0;
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='lg-hero' ref={heroRef} data-lens-narrow='false'>
        <LensField
          className='lg-hero-field'
          speed={1}
          onField={(field) => {
            fieldRef.current = field;
          }}
        />

        <span className='lg-hero-tag is-in' data-hero-in>
          in — English source
        </span>
        <span className='lg-hero-tag is-out' data-hero-in>
          out — 118 locales
        </span>

        <div className='lg-hero-in'>
          {/* The flat pane: the one region of the page the glass never
              crosses, so the type sits on optically straight rules. */}
          <div className='lg-hero-core' ref={coreRef}>
            <h1 data-hero-in>
              <span>Launch in</span>
              <span>
                <em>every</em> language.
              </span>
            </h1>

            <p className='lg-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>

            <div className='lg-hero-acts' data-hero-in>
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
        </div>

        {/* The traffic: EN in on the left rules, translated out on the right,
            every lane clipped by the true disc of the glass. Decorative to
            AT — the Transit strip below carries the same narrative as text. */}
        <div className='lg-pairs' aria-hidden='true'>
          {ROWS.map((pairs, i) => (
            <div className='lg-row' data-row={i} key={pairs[0]?.id ?? i}>
              <div className='lg-lane is-en'>
                {pairs.map((pair) => (
                  <span className='lg-traveler' key={pair.id}>
                    <CardView card={pair.en} />
                  </span>
                ))}
              </div>
              <div className='lg-lane is-tr'>
                {pairs.map((pair) => (
                  <span className='lg-traveler' dir={pair.rtl ? 'rtl' : undefined} key={pair.id}>
                    <CardView card={pair.tr} stamp={pair.locale} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className='lg-sr'>
          English UI strings pass through the lens and come out translated — buttons, toasts,
          navigation, dates and currency — locale-stamped for 118 locales.
        </p>

        {/* The product's mark holds the core of the glass. */}
        <div className='lg-lens-core' aria-hidden>
          <Image src='/brand/no-bg-gt-logo-light.png' alt='' width={38} height={38} />
        </div>

        {/* The coverage ledger, seated on the hero's last rule: endonyms with
            their ticks, the long tail counted. */}
        <div className='lg-ledger' data-hero-in>
          <span className='lg-ledger-cap'>coverage</span>
          <span className='lg-ledger-list'>
            {ENDONYMS.map((name) => (
              <span className='lg-ledger-item' key={name}>
                <i aria-hidden>✓</i>
                {name}
              </span>
            ))}
          </span>
          <span className='lg-ledger-count'>+ 106 more</span>
        </div>
      </div>

      <div className='tc-trust'>
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
