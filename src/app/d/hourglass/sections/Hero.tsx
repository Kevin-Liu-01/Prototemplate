'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hourglass hero: two corridor walls of real product UI recede in
 * one-point perspective toward a vanishing point at screen center. The left
 * wall carries English source strings drifting INTO the point; the right wall
 * carries their locale-stamped translations drifting OUT of it — the
 * translation pipeline as motion. The negative space between the walls is the
 * hourglass: wide at the edges, pinched to a waist that holds the mark,
 * headline, CTAs, the languages row, and the customer wordmarks.
 *
 * The walls are dense mirrored grids, not drifting confetti: every string is
 * a PAIR that occupies the same row on both walls — English face left,
 * translated face right — so a row reads as entering the point on one side
 * and exiting at the same height on the other. Rows share row lines (uniform
 * cell heights), columns sit at one fixed depth pitch, and both conveyors run
 * the identical loop, so the row correspondence never drifts.
 */

type WallUi =
  | 'field'
  | 'button'
  | 'toast'
  | 'row'
  | 'chip'
  | 'comment'
  | 'banner'
  | 'invite'
  | 'status'
  | 'heading'
  | 'select'
  | 'switch'
  | 'progress'
  | 'tabs';

type Face = { text: string; detail?: string };

type Pair = {
  ui: WallUi;
  /** Component-kind label on the card's meta row. */
  kind: string;
  /** BCP-47 stamp on the emitted card; every source card is stamped en-US. */
  stamp: string;
  /** ISO tag for the lang attribute on the emitted card. */
  lang: string;
  rtl?: boolean;
  en: Face;
  tr: Face;
};

/* The pair the folded mobile hero shows — named so both layouts share it. */
const SEARCH_PAIR: Pair = {
  ui: 'field',
  kind: 'Input',
  stamp: 'ja-JP',
  lang: 'ja',
  en: { text: 'Search the docs', detail: '⌘K' },
  tr: { text: 'ドキュメントを検索', detail: '⌘K' },
};

/* Mobile-only sibling of the wall's Arabic saved-toast — the fold shows the
   Korean face of the same source string. */
const SAVED_KO_PAIR: Pair = {
  ui: 'toast',
  kind: 'Toast',
  stamp: 'ko-KR',
  lang: 'ko',
  en: { text: 'Changes saved', detail: '18 strings updated' },
  tr: { text: '변경 사항 저장됨', detail: '문자열 18개 업데이트됨' },
};

/**
 * Vetted string pairs from the PortalHero prototype — real UI components with
 * real human translations. Listed column-major: each run of ROWS_PER_COLUMN
 * pairs is one depth column, ordered so no row or column repeats a component
 * shape next to itself. Numbers, times and RTL localize too (2,814 → 2.814;
 * name@company.com → nome@azienda.it; the Arabic toast and Hebrew status
 * mirror), so the walls demonstrate the product rather than decorate.
 */
const PAIRS: readonly Pair[] = [
  /* ---- depth column one ---- */
  SEARCH_PAIR,
  {
    ui: 'row',
    kind: 'Card',
    stamp: 'it-IT',
    lang: 'it',
    en: { text: 'Arrives tomorrow', detail: 'Order #1842 · 9:30' },
    tr: { text: 'Arriva domani', detail: 'Ordine #1842 · 9:30' },
  },
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'pt-BR',
    lang: 'pt',
    en: { text: 'Track package' },
    tr: { text: 'Rastrear pacote' },
  },
  {
    ui: 'status',
    kind: 'Status',
    stamp: 'th-TH',
    lang: 'th',
    en: { text: 'Locales deployed', detail: 'v2.4.0 · Global' },
    tr: { text: 'เผยแพร่ภาษาแล้ว', detail: 'v2.4.0 · ทั่วโลก' },
  },
  {
    ui: 'comment',
    kind: 'Comment',
    stamp: 'es-MX',
    lang: 'es',
    en: { text: 'Looks great — ship it', detail: '@mira · just now' },
    tr: { text: '¡Listo para enviar!', detail: '@mira · ahora mismo' },
  },
  {
    ui: 'chip',
    kind: 'Badge',
    stamp: 'fr-FR',
    lang: 'fr',
    en: { text: 'Talk to sales', detail: 'Enterprise' },
    tr: { text: 'Contacter les ventes', detail: 'Entreprise' },
  },
  {
    ui: 'row',
    kind: 'Checkbox',
    stamp: 'de-DE',
    lang: 'de',
    en: { text: 'Ready for review', detail: '12 strings · Legal' },
    tr: { text: 'Bereit zur Prüfung', detail: '12 Strings · Rechtliches' },
  },
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'zh-CN',
    lang: 'zh-Hans',
    en: { text: 'Open workspace' },
    tr: { text: '打开工作区' },
  },

  /* ---- depth column two ---- */
  {
    ui: 'banner',
    kind: 'Banner',
    stamp: 'nl-NL',
    lang: 'nl',
    en: { text: 'Built for every market' },
    tr: { text: 'Gebouwd voor elke markt' },
  },
  {
    ui: 'heading',
    kind: 'Heading',
    stamp: 'hi-IN',
    lang: 'hi',
    en: { text: 'Welcome back', detail: 'Dashboard' },
    tr: { text: 'वापसी पर स्वागत है', detail: 'डैशबोर्ड' },
  },
  {
    ui: 'toast',
    kind: 'Toast',
    stamp: 'ar-SA',
    lang: 'ar',
    rtl: true,
    en: { text: 'Changes saved', detail: '18 strings updated' },
    tr: { text: 'تم حفظ التغييرات', detail: 'تم تحديث 18 سلسلة' },
  },
  {
    ui: 'progress',
    kind: 'Progress',
    stamp: 'pt-BR',
    lang: 'pt',
    en: { text: 'Translation coverage', detail: '2,814 of 2,993 strings' },
    tr: { text: 'Cobertura da tradução', detail: '2.814 de 2.993 strings' },
  },
  {
    ui: 'invite',
    kind: 'Input + button',
    stamp: 'it-IT',
    lang: 'it',
    en: { text: 'Invite teammate', detail: 'name@company.com' },
    tr: { text: 'Invita un collega', detail: 'nome@azienda.it' },
  },
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'de-DE',
    lang: 'de',
    en: { text: 'Start building', detail: 'Primary action' },
    tr: { text: 'Jetzt loslegen', detail: 'Primäre Aktion' },
  },
  {
    ui: 'select',
    kind: 'Select',
    stamp: 'zh-CN',
    lang: 'zh-Hans',
    en: { text: 'English (US)', detail: 'Source locale' },
    tr: { text: '简体中文', detail: '目标语言' },
  },
  {
    ui: 'switch',
    kind: 'Switch',
    stamp: 'nl-NL',
    lang: 'nl',
    en: { text: 'Auto-detect locale', detail: 'Browser language' },
    tr: { text: 'Taal automatisch detecteren', detail: 'Browsertaal' },
  },

  /* ---- depth column three ---- */
  {
    ui: 'tabs',
    kind: 'Tabs',
    stamp: 'id-ID',
    lang: 'id',
    en: { text: 'Desktop preview', detail: 'Live preview' },
    tr: { text: 'Pratinjau desktop', detail: 'Pratinjau langsung' },
  },
  {
    ui: 'chip',
    kind: 'Glossary',
    stamp: 'tr-TR',
    lang: 'tr',
    en: { text: 'Keep Locadex untranslated', detail: 'Glossary rule' },
    tr: { text: 'Locadex çevrilmeden kalır', detail: 'Sözlük kuralı' },
  },
  {
    ui: 'switch',
    kind: 'Webhook',
    stamp: 'uk-UA',
    lang: 'uk',
    en: { text: 'Notify localization channel', detail: 'Webhook connected' },
    tr: { text: 'Сповістити канал локалізації', detail: 'Вебхук підключено' },
  },
  {
    ui: 'row',
    kind: 'Card',
    stamp: 'da-DK',
    lang: 'da',
    en: { text: '8 collaborators', detail: 'Localization workspace' },
    tr: { text: '8 samarbejdspartnere', detail: 'Lokaliseringsarbejdsområde' },
  },
  {
    ui: 'button',
    kind: 'API action',
    stamp: 'sv-SE',
    lang: 'sv',
    en: { text: 'Publish changes', detail: 'POST /v1/translations' },
    tr: { text: 'Publicera ändringar', detail: 'POST /v1/translations' },
  },
  {
    ui: 'status',
    kind: 'QA status',
    stamp: 'he-IL',
    lang: 'he',
    rtl: true,
    en: { text: 'All checks passed', detail: '0 localization issues' },
    tr: { text: 'כל הבדיקות עברו', detail: '0 בעיות לוקליזציה' },
  },
  {
    ui: 'chip',
    kind: 'Tone',
    stamp: 'pl-PL',
    lang: 'pl',
    en: { text: 'Friendly and concise', detail: 'Voice directive' },
    tr: { text: 'Przyjazny i zwięzły', detail: 'Dyrektywa głosu' },
  },
  {
    ui: 'row',
    kind: 'Checkbox',
    stamp: 'vi-VN',
    lang: 'vi',
    en: { text: 'Legal review required', detail: 'Workflow rule' },
    tr: { text: 'Cần xem xét pháp lý', detail: 'Quy tắc quy trình' },
  },
];

const FLAGS: readonly string[] = ['🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇸🇦', '🇧🇷', '🇮🇹', '🇳🇱', '🇹🇷'];

const WORDMARKS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
];

/* Grid constants. ROWS_PER_COLUMN must match the repeat() count on .hg-col;
   the column pitch lives on .hg-col/.hg-track. Three identical sets per track
   so the conveyor loop is seamless at any frame — the track always overlaps
   the visible plane by at least one full set. */
const ROWS_PER_COLUMN = 8;
const SETS_PER_TRACK = 3;

function CardBody({ ui, text, detail }: { ui: WallUi; text: string; detail?: string }) {
  switch (ui) {
    case 'field':
      return (
        <span className='hg-field'>
          <i className='hg-glyph' aria-hidden='true' />
          {text}
          {detail ? <kbd>{detail}</kbd> : null}
        </span>
      );
    case 'select':
      return (
        <>
          <span className='hg-field'>
            {text}
            <i className='hg-chev' aria-hidden='true' />
          </span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'button':
      return (
        <>
          <span className='hg-pill'>
            {text}
            <b aria-hidden='true'>→</b>
          </span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'toast':
      return (
        <span className='hg-trow'>
          <i className='hg-check' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'row':
      return (
        <span className='hg-trow'>
          <i className='hg-box' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'switch':
      return (
        <span className='hg-trow'>
          <i className='hg-toggle' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'chip':
      return (
        <>
          <span className='hg-badge'>{detail}</span>
          <span className='hg-pill is-line'>{text}</span>
        </>
      );
    case 'comment':
      return (
        <span className='hg-trow'>
          <i className='hg-ava' aria-hidden='true'>
            M
          </i>
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'banner':
      return <span className='hg-banner'>{text}</span>;
    case 'heading':
      return (
        <>
          <span className='hg-banner'>{text}</span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'invite':
      return (
        <>
          <span className='hg-field is-dim'>{detail}</span>
          <span className='hg-pill is-line'>{text}</span>
        </>
      );
    case 'progress':
      return (
        <>
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
          <span className='hg-meter' aria-hidden='true'>
            <i />
          </span>
        </>
      );
    case 'tabs':
      return (
        <span className='hg-tabs'>
          <span className='is-on'>{text}</span>
          {detail ? <span>{detail}</span> : null}
        </span>
      );
    case 'status':
      return (
        <span className='hg-trow'>
          <i className='hg-dot' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
  }
}

function Card({ pair, face }: { pair: Pair; face: 'en' | 'tr' }) {
  const emitted = face === 'tr';
  const copy = emitted ? pair.tr : pair.en;
  const rtl = emitted && pair.rtl;
  return (
    <article className={`hg-card${rtl ? ' is-rtl' : ''}`}>
      <header className='hg-card-meta'>
        <span>{pair.kind}</span>
        <span className='hg-stamp'>{emitted ? pair.stamp : 'en-US'}</span>
      </header>
      <div className='hg-card-body' dir={rtl ? 'rtl' : undefined} lang={emitted ? pair.lang : undefined}>
        <CardBody detail={copy.detail} text={copy.text} ui={pair.ui} />
      </div>
    </article>
  );
}

function Wall({ side }: { side: 'src' | 'out' }) {
  const columns: Pair[][] = [];
  for (let i = 0; i < PAIRS.length; i += ROWS_PER_COLUMN) {
    columns.push(PAIRS.slice(i, i + ROWS_PER_COLUMN));
  }

  /* The right wall's near edge is its DOM end, so its columns run deep→near:
     first column kept, the rest reversed ([c0, c2, c1] for three). Tiled and
     phase-locked with the left conveyor, the nearest column on the right then
     carries the translations of the nearest column on the left — a pair
     enters near-left and exits near-right — and every pair keeps the same
     row index (the same height) on both planes at every frame. */
  const [firstColumn, ...restColumns] = columns;
  const ordered = side === 'out' && firstColumn ? [firstColumn, ...restColumns.reverse()] : columns;

  return (
    <div className={`hg-wall is-${side}`}>
      <div className='hg-wall-in'>
        <div className='hg-track'>
          {Array.from({ length: SETS_PER_TRACK }, (_, set) =>
            ordered.map((column, c) => (
              <div className='hg-col' key={`${set}-${c}`}>
                {column.map((pair) => (
                  <Card face={side === 'src' ? 'en' : 'tr'} key={`${set}-${c}-${pair.stamp}-${pair.en.text}`} pair={pair} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* Walls assemble from the screen edges along their own rays. */
      gsap.from('.hg-wall-in', {
        x: (i: number) => (i === 0 ? -150 : 150),
        autoAlpha: 0,
        duration: 1.15,
        stagger: 0.1,
        ease: 'power3.out',
      });

      /* The waist stack rises once the walls are moving. */
      gsap.from('[data-hg-in]', {
        y: 16,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.2,
      });

      /* The pipeline: both tracks drift in their plane's +x — which the left
         wall's rotation reads as INTO the vanishing point and the right
         wall's as OUT of it. The tweens are identical (same span, same
         duration, no ease), so the two conveyors stay phase-locked and the
         mirrored row structure never drifts. Three identical sets mean a
         one-set translate loops seamlessly and any grabbed frame is
         composed. */
      const drift = gsap.utils.toArray<HTMLElement>('.hg-track').map((track) =>
        gsap.fromTo(
          track,
          { xPercent: -100 / SETS_PER_TRACK },
          { xPercent: 0, duration: 110, ease: 'none', repeat: -1 }
        )
      );

      /* Nothing ticks while the hero is off screen. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          for (const tween of drift) {
            if (self.isActive) tween.play();
            else tween.pause();
          }
        },
      });
    },
    { scope: root }
  );

  return (
    <section className='hg-hero' id='top' ref={root}>
      <p className='sr-only'>
        English source strings on the left — search fields, toasts, buttons, review rows — stream toward the
        center and come out the right side translated and locale-stamped: French, German, Japanese, Korean,
        Spanish, Arabic, and a hundred more.
      </p>

      <div className='hg-glow' aria-hidden='true' />

      <div className='hg-stage' aria-hidden='true'>
        <Wall side='src' />
        <Wall side='out' />
      </div>

      {/* Mobile: the corridor folds into a vertical pipeline — source cards
          above the waist, their translations below it. */}
      <div className='hg-m is-src' aria-hidden='true'>
        <div className='hg-m-strip'>
          <Card face='en' pair={SEARCH_PAIR} />
          <Card face='en' pair={SAVED_KO_PAIR} />
        </div>
      </div>

      <div className='hg-core'>
        <span className='hg-core-veil' aria-hidden='true' />
        <div className='hg-core-in'>
          <Image
            className='hg-mark'
            data-hg-in
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={42}
            height={42}
          />

          <h1 data-hg-in>
            <span>Launch in</span>
            <span>
              <em>every</em> language.
            </span>
          </h1>

          <p className='hg-sub' data-hg-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>

          <div className='hg-acts' data-hg-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Start building <b aria-hidden='true'>→</b>
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Get a demo
            </a>
            <button className='tc-copy hg-copy' type='button' onClick={copy}>
              <span>$ npx gt@latest</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className='hg-langs' data-hg-in>
            <p className='hg-langs-cap'>
              <i aria-hidden='true' />
              100+ languages
            </p>
            <div className='hg-flags' aria-hidden='true'>
              {FLAGS.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
              <span className='hg-flag-more'>+88</span>
            </div>
          </div>

          <div className='hg-wms' data-hg-in>
            <p className='hg-wms-cap'>Trusted in production</p>
            <div className='hg-wms-row'>
              {WORDMARKS.map((wm) => (
                <b className={`hg-wm ${wm.mark}`} key={wm.name}>
                  {wm.name}
                </b>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='hg-m is-out' aria-hidden='true'>
        <div className='hg-m-strip'>
          <Card face='tr' pair={SEARCH_PAIR} />
          <Card face='tr' pair={SAVED_KO_PAIR} />
        </div>
      </div>
    </section>
  );
}
