'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

import type { LensFieldHandle } from '../lib/lens-field';
import LensField from './LensField';

import './hero-every.css';

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
 * never reads mechanical. Row order matters: the middle row rides the lens
 * equator where the exit chord is widest, so it carries the nav bar — the
 * longest artifact; the flanking rows carry the shorter strings, and the
 * bottom row keeps the currency/date reading — localization surface beyond
 * words.
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
      id: 'nav',
      locale: 'JA',
      en: { kind: 'nav', label: 'Home · Docs · Pricing' },
      tr: { kind: 'nav', label: 'ホーム · ドキュメント · 料金' },
    },
    {
      id: 'toast',
      locale: 'DE',
      en: { kind: 'toast', label: 'Payment received' },
      tr: { kind: 'toast', label: 'Zahlung erhalten' },
    },
  ],
  [
    {
      id: 'review',
      locale: 'KO',
      en: { kind: 'chip', label: 'Ready for review' },
      tr: { kind: 'chip', label: '검토 준비 완료' },
    },
    {
      id: 'meter',
      locale: 'DE-DE',
      en: { kind: 'meter', label: '$1,234.56 · Jul 30' },
      tr: { kind: 'meter', label: '1.234,56 € · 30. Juli' },
    },
  ],
];

/** Endonyms seated on the band's bottom rule — 12 listed of the 118 covered. */
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

/* "language" across maximally different writing systems — Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek — short tokens so the
   re-measured line never wraps. The headline hinge morphs through them; the
   band below shows the same story as traffic through the glass. Each word
   carries its BCP-47 tag so the hidden measurer and the live word shape
   with the same fonts; Arabic is flagged RTL so its run renders
   right-to-left inside the em's bidi isolate and can never reorder the
   sentence's trailing period. */
type EveryWord = { text: string; lang: string; rtl?: boolean };

const EVERY: readonly EveryWord[] = [
  { text: 'language', lang: 'en' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', rtl: true },
  { text: 'भाषा', lang: 'hi' },
  { text: 'язык', lang: 'ru' },
  { text: '语言', lang: 'zh' },
  { text: '언어', lang: 'ko' },
  { text: 'γλώσσα', lang: 'el' },
];

const EVERY_FALLBACK: EveryWord = EVERY[0] ?? { text: 'language', lang: 'en' };

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

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

/* #0a0b0f / #ffffff — the ink-black dark remap (the one-surface family),
   mirrored into the shader so the canvas follows the token flip instead of
   staying a paper rectangle. */
const DARK = {
  ink: [1, 1, 1] as [number, number, number],
  paper: [0.0392, 0.0431, 0.0588] as [number, number, number],
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
 * The founder stack, with the lens as the band: a white hero card (mark, the
 * two authored headline lines with the morphing hinge, sub, acts) over the
 * full-width ruled band, over the trust card — three surfaces on the shell
 * ground separated by 1px seams.
 *
 * The band IS the ruled page. Its canvas draws the page's own hairlines at a
 * 28px pitch and refracts them through one breathing glass lens at the band's
 * center; rules magnify and bow through it, snap perfectly straight outside
 * it, and carry the page's single chroma moment as a sub-pixel fringe on the
 * rim. Translation is continuous traffic: English artifacts travel along the
 * rule lines, slip under the rim (each lane is masked by the true lens disc,
 * so a card follows the curve of the glass as it disappears), and emerge on
 * the far side translated and locale-stamped. Three rows loop out of phase,
 * each alternating two artifacts, so any still frame catches at least one
 * pair mid-story. The GT mark holds the core — the product is the glass —
 * and a quiet endonym ledger seats on the band's last rule.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
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
      if (!hero) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rowEls = gsap.utils.toArray<HTMLElement>('.lg-row', hero);
      const conveyors: gsap.core.Timeline[] = [];
      let rowGeos: RowGeo[] = [];
      let gate: ScrollTrigger | null = null;
      let buildTimer: ReturnType<typeof setTimeout> | undefined;
      let everyCleanup: (() => void) | undefined;

      /* Lens placement policy. With the type on its own card above, the band
         is free geometry: the glass holds the band's center, and every
         traffic row is a rule line whose full card height crosses the glass —
         desktop runs three rows (the middle one riding the equator, where the
         exit chord is widest), phones two, hugging it one rule out. */
      const measure = () => {
        const hb = hero.getBoundingClientRect();
        if (hb.width < 2 || hb.height < 2) return;
        const w = hb.width;
        const h = hb.height;
        /* Below the rail's borderless cut, cards may enter and exit through
           the screen edges; inside a bordered rail they never cross it. */
        const phone = w <= 620;

        const px = (value: number) => `${Math.round(value * 100) / 100}px`;
        const setVar = (name: string, value: number) => {
          hero.style.setProperty(name, px(value));
        };

        /* The page gutter, read off the ledger — the band's one padded child. */
        const ledger = hero.querySelector<HTMLElement>('.lg-ledger');
        const gut = ledger ? parseFloat(getComputedStyle(ledger).paddingLeft) || 24 : 24;
        const cardH = phone ? 28 : 34;
        const laneH = cardH + 14;

        const cx = w / 2;
        const cy = h / 2;
        /* Rows snap to rule lines; the equator row is the nearest rule. */
        const cyRule = Math.round(cy / PITCH) * PITCH;
        const rowYs: number[] = [];
        let r: number;
        if (phone) {
          r = Math.min(clampNum(w * 0.3, 104, 148), h * 0.3);
          /* Two rows hugging the equator (one rule out) — near the equator
             the rim crossing is steep, so a traveling card cuts cleanly
             under the glass instead of smearing along a near-tangent arc. */
          rowYs.push(cyRule - PITCH, cyRule + PITCH);
        } else {
          r = Math.min(clampNum(w * 0.205, 200, 250), h * 0.4);
          /* Three rows, rule indices two apart (56px), symmetric about the
             equator — all three cut the glass at every band height. */
          rowYs.push(cyRule - 2 * PITCH, cyRule, cyRule + 2 * PITCH);
        }

        setVar('--lg-cx', cx);
        setVar('--lg-cy', cy);
        setVar('--lg-r', r);
        /* The endonym ledger seats on the last drawn rule of the band. */
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

        /* Rows beyond this breakpoint's count (the third row on phones) park
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
           band is scrolled away. */
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

        /* ---- the headline hinge (the toolchain instrument) ----
           Each cycle: the bound guides appear around the current word; the
           word dissolves while the dust scatters; the bounds tween to the
           NEXT word's measured width first — scoping the layout shift before
           any text exists — then the dust converges and the new word forms
           inside the prepared bounds. The doubled underline re-measures with
           the em at constant gauge. Under 720px, a clean measured crossfade
           tells the same story.

           Width discipline (the founder's standard): the width the sentence
           reflows around is always the WHOLE SHAPED word — a hidden probe
           carrying the word's own lang/dir and the em's inherited type —
           never a sum of per-character boxes, which disconnects Arabic
           joining (isolated forms measure ~37% wider than the shaped word)
           and splits Devanagari matras off their consonants. The em's width
           is the only layout-affecting property that ever animates: it holds
           the shaped width at rest (never snapping back to 'auto'), glides
           through ONE continuous device-pixel-snapped tween per cycle so the
           trailing period only ever glides, and re-measures when the fonts
           arrive or the clamp()ed type resizes. */
        const em = root.current?.querySelector<HTMLElement>('[data-every]');
        const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
        const compactEvery = window.matchMedia('(max-width: 720px)').matches;
        if (em && word) {
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const snapPx = (w: number) => Math.round(w * dpr) / dpr;
          const widthCache = new Map<string, number>();
          const measureWord = (w: EveryWord) => {
            const hit = widthCache.get(w.text);
            if (hit !== undefined) return hit;
            const probe = document.createElement('span');
            probe.style.cssText =
              'visibility:hidden;position:absolute;left:-9999px;top:0;white-space:nowrap;';
            probe.setAttribute('lang', w.lang);
            probe.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
            probe.textContent = w.text;
            em.appendChild(probe);
            const width = snapPx(probe.getBoundingClientRect().width);
            probe.remove();
            widthCache.set(w.text, width);
            return width;
          };
          /* the live word is ONE shaped text node — lang for font selection,
             dir so the RTL run renders right-to-left inside its isolate */
          const showWord = (w: EveryWord) => {
            word.textContent = w.text;
            word.setAttribute('lang', w.lang);
            word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
          };
          let idx = 0;
          let morphing = false;
          const holdWidth = () => {
            em.style.width = `${measureWord(EVERY[idx] ?? EVERY_FALLBACK)}px`;
          };
          const remeasure = () => {
            if (!em.isConnected) return;
            widthCache.clear();
            if (!morphing) holdWidth();
          };
          window.addEventListener('resize', remeasure);
          void document.fonts.ready.then(remeasure);
          everyCleanup = () => window.removeEventListener('resize', remeasure);
          holdWidth();

          if (compactEvery) {
            /* At mobile scale 26 particles cannot breathe: a clean measured
               crossfade tells the same story. */
            const compactSwap = () => {
              if (!root.current || !root.current.isConnected) return;
              idx = (idx + 1) % EVERY.length;
              const next = EVERY[idx] ?? EVERY_FALLBACK;
              const w1 = measureWord(next);
              morphing = true;
              gsap.to(word, {
                autoAlpha: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                  showWord(next);
                  gsap.to(em, {
                    width: w1,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    snap: { width: 1 / dpr },
                    onComplete: () => {
                      morphing = false;
                      holdWidth();
                    },
                  });
                  gsap.to(word, { autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.18 });
                  gsap.delayedCall(2.4, compactSwap);
                },
              });
            };
            gsap.delayedCall(3.4, compactSwap);
          } else {
            const guideL = document.createElement('span');
            guideL.className = 'tc-eg is-l';
            const guideR = document.createElement('span');
            guideR.className = 'tc-eg is-r';
            const dust = document.createElement('span');
            dust.className = 'tc-edust';
            for (let i = 0; i < 26; i++) {
              const g = document.createElement('span');
              g.textContent = DUST[i % DUST.length] ?? '';
              dust.appendChild(g);
            }
            em.append(guideL, guideR, dust);
            const dustGlyphs = Array.from(dust.children) as HTMLElement[];

            /* Sample the incoming word's letterforms: draw it on an offscreen
               canvas at the em's own font and collect dark-pixel positions. The
               dust converges onto these points, so the glyphs sketch the shapes
               of the characters before the characters themselves fill in. */
            const sampleShape = (text: string, width: number, height: number, count: number) => {
              const style = getComputedStyle(word);
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(width, 10);
              canvas.height = Math.max(height, 10);
              const ctx = canvas.getContext('2d');
              if (!ctx) return [];
              ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
              ctx.textBaseline = 'middle';
              ctx.fillText(text, 0, canvas.height / 2);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
              const pts: { x: number; y: number }[] = [];
              const step = 3;
              for (let y = 0; y < canvas.height; y += step) {
                for (let x = 0; x < canvas.width; x += step) {
                  if ((img[(y * canvas.width + x) * 4 + 3] ?? 0) > 128) pts.push({ x, y });
                }
              }
              // spread the picks across the whole word rather than clustering
              const picked: { x: number; y: number }[] = [];
              if (pts.length) {
                const stride = Math.max(1, Math.floor(pts.length / count));
                for (let i = 0; i < pts.length && picked.length < count; i += stride) {
                  const pt = pts[i];
                  if (pt) picked.push(pt);
                }
              }
              return picked;
            };

            const swap = () => {
              if (!root.current || !root.current.isConnected) return;
              const w0 = measureWord(EVERY[idx] ?? EVERY_FALLBACK);
              idx = (idx + 1) % EVERY.length;
              const next = EVERY[idx] ?? EVERY_FALLBACK;
              const w1 = measureWord(next);
              morphing = true;
              const tl = gsap.timeline({
                onComplete: () => {
                  morphing = false;
                  /* re-assert from a fresh cache in case fonts or viewport
                     moved mid-morph — otherwise the same value: nothing snaps */
                  holdWidth();
                  gsap.delayedCall(2.2, swap);
                },
              });

              // 1. the instrument appears around the current word
              tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

              // 2. the word dissolves as ONE shaped run — splitting it into
              //    per-character spans would disconnect Arabic and reflow the
              //    very width the sentence is standing on — while the dust
              //    carries the scatter
              tl.to(word, {
                autoAlpha: 0,
                scale: 0.92,
                transformOrigin: '50% 60%',
                duration: 0.3,
                ease: 'power2.in',
              }, '+=0.05');
              /* the cloud separates SYMMETRICALLY about the word's centre: each
                 glyph takes an evenly-spread angle on a jittered ring, so the
                 scatter is balanced instead of clumping off to one side */
              const h0 = em.offsetHeight;
              const ring = (w: number) => (g: HTMLElement, i: number) => {
                const angle = (i / dustGlyphs.length) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2);
                const rx = gsap.utils.random(0.18, 0.44) * w;
                const ry = gsap.utils.random(6, h0 * 0.26);
                return {
                  // clamped so no glyph ever leaves the measured bounds
                  x: gsap.utils.clamp(3, w - 3, w / 2 + Math.cos(angle) * rx),
                  y: gsap.utils.clamp(-h0 * 0.02, h0 * 0.32, h0 * 0.1 + Math.sin(angle) * ry),
                };
              };
              const place0 = ring(Math.max(w0, 30));
              tl.to(dustGlyphs, {
                autoAlpha: () => gsap.utils.random(0.35, 0.8),
                x: (i, g) => place0(g as HTMLElement, i).x,
                y: (i, g) => place0(g as HTMLElement, i).y,
                duration: 0.26,
                stagger: 0.012,
                ease: 'power1.out',
              }, '<+=0.1');

              // 3. the bounds glide to the incoming word's shaped width — ONE
              //    continuous tween, quantized to device pixels, so the period
              //    and everything after it track without buzz or end snap
              tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } });
              const place1 = ring(Math.max(w1, 30));
              tl.to(dustGlyphs, {
                x: (i, g) => place1(g as HTMLElement, i).x,
                y: (i, g) => place1(g as HTMLElement, i).y,
                duration: 0.7,
                ease: 'power2.inOut',
              }, '<');

              // 4. the dust assembles the SHAPES of the incoming characters —
              //    each glyph flies to a sampled point on the new letterforms —
              //    then the word fills the silhouette in as one shaped run,
              //    behind a wipe that enters from the script's reading side.
              tl.add(() => {
                const h = em.offsetHeight;
                const pts = sampleShape(next.text, w1, h, dustGlyphs.length);
                dustGlyphs.forEach((g, i) => {
                  const pt = pts[i % Math.max(pts.length, 1)] || { x: w1 / 2, y: h / 2 };
                  gsap.to(g, {
                    x: pt.x,
                    y: pt.y - h * 0.4,
                    autoAlpha: 0.9,
                    duration: 0.38,
                    ease: 'power3.inOut',
                    delay: i * 0.008,
                  });
                });
                gsap.delayedCall(0.42, () => {
                  showWord(next);
                  gsap.fromTo(
                    word,
                    {
                      autoAlpha: 0,
                      scale: 1,
                      clipPath: next.rtl ? 'inset(-15% 0% -15% 100%)' : 'inset(-15% 100% -15% 0%)',
                    },
                    {
                      autoAlpha: 1,
                      clipPath: 'inset(-15% 0% -15% 0%)',
                      duration: 0.34,
                      ease: 'power2.out',
                      onComplete: () => {
                        gsap.set(word, { clearProps: 'clipPath' });
                      },
                    }
                  );
                  gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.26, stagger: 0.006, ease: 'power1.out', delay: 0.08 });
                });
              });
              tl.to({}, { duration: 0.85 });

              // 5. the instrument withdraws
              tl.to([guideL, guideR], { opacity: 0, duration: 0.24, ease: 'none' }, '>-0.05');
            };

            /* The first dissolve waits out the first-fold capture window: any
               still taken while the traffic settles shows the word whole. */
            gsap.delayedCall(5.6, swap);
          }
        }
      }

      return () => {
        observer.disconnect();
        themeObserver.disconnect();
        clearTimeout(buildTimer);
        everyCleanup?.();
        for (const tl of conveyors) tl.kill();
        conveyors.length = 0;
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      {/* The white hero card: mark, two authored lines with the accented word
          opening line two on the hinge of the sentence, sub, acts. */}
      <div className='tc-hero'>
        <Image
          className='tc-hero-mark'
          data-hero-in
          src='/brand/no-bg-gt-logo-light.png'
          alt='General Translation'
          width={34}
          height={34}
        />

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
          General Translation builds full-stack infrastructure for localizing apps, docs, and
          websites.
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

      {/* The full-width band between the cards: the ruled page and its glass. */}
      <div className='tc-hero-cell lg-hero' ref={heroRef}>
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

        {/* The coverage ledger, seated on the band's last rule: endonyms with
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
