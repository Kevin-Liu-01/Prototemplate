'use client';

import { Wrench } from 'lucide-react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Euro,
  Globe,
  Hash,
  Layers,
  LayoutTemplate,
  ListOrdered,
  Route,
  SquareFunction,
  Tag,
  Type,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ComponentType, KeyboardEvent, ReactNode } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

import {
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTanstack,
} from '@icons-pack/react-simple-icons';

import LocaleTag from '../components/LocaleTag';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';
import { CAP_DEMOS, FRAMEWORKS } from './stacks';

import '../components/icons.css';
import './chip-consistency.css';
import './frameworks-ruled.css';
import './logos-icons.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

/** The real saved React Native badge — the squircle with the atom knocked
    out — mask-rendered in the tab's own ink like the SDK ledger's marks
    (alpha is the artwork). The bare SiReact atom it replaces was
    pixel-identical to the React tab's mark at rendered size; the tab strip
    is the one place the two frameworks sit adjacent, so the plated/bare
    distinction has to hold here too, not only in the ledger. */
function ReactNativeTabMark({ className }: MarkProps) {
  return (
    <i
      className={className ? `${className} is-rn-badge` : 'is-rn-badge'}
      style={{ '--mark': 'url(/logos/react-native-no-bg.svg)' }}
      aria-hidden='true'
    />
  );
}

/** The real framework marks, monochrome at text size beside each label. */
const TAB_MARKS: Record<string, ComponentType<MarkProps>> = {
  next: SiNextdotjs,
  react: SiReact,
  'react-native': ReactNativeTabMark,
  tanstack: SiTanstack,
  node: SiNodedotjs,
  python: SiPython,
};

/** One glyph per capability, the identification column of the marquee rows.
    Currencies is the € sign — its demo is the German euro price, and the
    overlapping-coins glyph read as a "link" mark at this size. */
const CAP_ICONS: Record<string, ComponentType<MarkProps>> = {
  UI: LayoutTemplate,
  Text: Type,
  Numbers: Hash,
  Currencies: Euro,
  Dates: Calendar,
  Plurals: ListOrdered,
  Functions: SquareFunction,
  Context: Tag,
  Routing: Route,
  Globals: Globe,
  Requests: ArrowLeftRight,
  Middleware: Layers,
};

/** The locale each CAP_DEMOS output is actually in, where it is one: the
    Spanish greeting, the German number and price, the French date and path,
    the Polish plural pair. The demo gets the page's one locale chip —
    LocaleTag, flag + mono code — beside it; a bare flag is ambiguous
    (de-DE vs de-AT vs de-CH), the code says which. */
const CAP_LOCALES: Record<string, string> = {
  Text: 'es',
  Numbers: 'de',
  Currencies: 'de',
  Dates: 'fr',
  Plurals: 'pl',
  Routing: 'fr',
};

/**
 * The capability rows as a slow vertical marquee (founder pick): glyph + name
 * + real output per row, the list doubled, one linear yPercent tween looping
 * it seamlessly. Hover pauses the loop; reduced motion gets the full static
 * list. The container's height comes from the pane (flex: 1), never from the
 * track, so the loop can't shift the layout around it.
 */
function CapMarquee({ caps }: { caps: readonly string[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = wrap.current;
      const track = el?.querySelector<HTMLElement>('[data-caps-track]');
      if (!el || !track) return;

      /* A stepped ticker, not a continuous crawl: the track rests on whole
         rows for ~2.1s, then advances one row in 0.45s. A continuous loop
         meant almost every still caught rows sliced mid-height at the masked
         edges — read as a leaking scroll mask, not a marquee — so the ledger
         now spends ~80% of its time at a clean rest where the top row meets
         the panel edge whole. After caps.length steps the doubled copy sits
         exactly where the first list started, so the repeat snap is
         invisible. Runs only while the panel is on screen. */
      const row = 50 / caps.length;
      const loop = gsap.timeline({ repeat: -1, paused: true });
      caps.forEach((_, i) => {
        loop.to(
          track,
          { yPercent: -row * (i + 1), duration: 0.45, ease: 'power2.inOut' },
          '+=2.1'
        );
      });
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) loop.play();
          else loop.pause();
        },
      });
      const pause = () => loop.pause();
      const play = () => loop.play();
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', play);
      return () => {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', play);
      };
    },
    { dependencies: [caps], revertOnUpdate: true, scope: wrap }
  );

  const list = (hidden: boolean) => (
    <div className='tc-caps-list' aria-hidden={hidden || undefined}>
      {caps.map((cap) => {
        const Ico = CAP_ICONS[cap];
        const loc = CAP_LOCALES[cap];
        return (
          <div className='tc-cap' key={cap}>
            {Ico ? <Ico className='tc-cap-ico' aria-hidden /> : null}
            <b>{cap}</b>
            <code>
              {loc ? <LocaleTag code={loc} /> : null}
              {CAP_DEMOS[cap]}
            </code>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className='tc-caps is-marquee' ref={wrap}>
      <div className='tc-caps-view'>
        <div className='tc-caps-track' data-caps-track>
          {list(false)}
          {list(true)}
        </div>
      </div>
    </div>
  );
}

/**
 * The oxc pattern: one row of stacks, an underline that slides to the active
 * one, and a sample plus capability list that swap beneath it. The underline is
 * the only thing that travels — the panel below resolves in place.
 *
 * A fork mounts this section with its own rescoped `icons.css`,
 * `chip-consistency.css` and `logos-icons.css`; `title` replaces the heading's
 * text and `href` is the in-page anchor of the closing link.
 */
export default function Frameworks({
  title = 'One toolchain, every stack.',
  href = '#platform',
}: {
  title?: ReactNode;
  href?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  const [active, setActive] = useState(0);
  /* the active tab for the resize listener, which subscribes once */
  const current = useRef(0);

  useQuietReveal(root);

  /** Moves the underline under tab `index`, gliding or at once. */
  const place = (index: number, animate: boolean) => {
    const list = tabs.current;
    const bar = list?.querySelector<HTMLElement>('[data-underline]');
    if (!list || !bar) return;
    const buttons = list.querySelectorAll<HTMLButtonElement>('[data-tab]');
    const button = buttons[index];
    const last = buttons[buttons.length - 1];
    if (!button || !last) return;
    /* On a phone the strip wraps (chip-consistency.css), so the bar rises
       from the last row to the active tab's row; on one row y is 0. */
    const to = {
      x: button.offsetLeft - list.scrollLeft,
      y: button.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom,
      width: button.offsetWidth,
    };
    if (animate) gsap.to(bar, { ...to, duration: 0.42, ease: 'power3.out' });
    else gsap.set(bar, to);
  };

  /* Inter loads after first paint and the strip reflows on resize; the
     underline is measured type, so it is measured again after either. */
  useGSAP(() => {
    const settle = () => place(current.current, false);
    void document.fonts?.ready.then(settle);
    window.addEventListener('resize', settle);
    return () => window.removeEventListener('resize', settle);
  });

  useGSAP(
    () => {
      current.current = active;
      place(active, settled.current);
      if (settled.current && panel.current) {
        gsap.fromTo(
          panel.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }
        );
      }
      settled.current = true;
    },
    { dependencies: [active] }
  );

  /* Arrow keys, Home and End move the selection along the strip and take
     focus with it, so one Tab stop reaches every framework. */
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = FRAMEWORKS.length;
    const targets: Partial<Record<string, number>> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1 + count,
      Home: 0,
      End: count - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    const next = target % count;
    event.preventDefault();
    setActive(next);
    tabs.current?.querySelectorAll<HTMLButtonElement>('[data-tab]')[next]?.focus();
  };

  const framework = FRAMEWORKS[active] ?? FRAMEWORKS[0];
  if (!framework) return null;

  return (
    <section className='tc-sec' id='frameworks' ref={root}>
      <div className='tc-head'>
        <Wrench className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>{title}</h2>
        <p data-reveal>
          Developer-first SDKs to translate everything from simple sites to complex user experiences.
        </p>
      </div>

      <div className='tc-tabs' ref={tabs} role='tablist' aria-label='Frameworks' onKeyDown={onTabKey}>
        {FRAMEWORKS.map((item, i) => {
          const Mark = TAB_MARKS[item.id];
          return (
            <button
              className='tc-tab'
              data-tab
              data-on={i === active}
              key={item.id}
              id={`tc-tab-${item.id}`}
              type='button'
              role='tab'
              aria-selected={i === active}
              aria-controls='tc-fw-panel'
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              {Mark ? <Mark className='tc-tab-mark' color='currentColor' aria-hidden /> : null}
              {item.name}
            </button>
          );
        })}
        <span className='tc-tab-bar' data-underline aria-hidden />
      </div>

      <div
        className='tc-fw'
        id='tc-fw-panel'
        ref={panel}
        role='tabpanel'
        aria-labelledby={`tc-tab-${framework.id}`}
      >
        {/* Mounted, like every other code surface on the page: the mat with its
            2px reveal, then the card, then the sample on the page's own paper. */}
        <div className='tc-fw-code'>
          <div className='tc-mount'>
            <div className='tc-card'>
              <CodeBlock file={framework.file} code={framework.code} />
            </div>
          </div>
        </div>

        {/* The split is a rule of its own rather than a cell border, so the two
            panes can each end where their content ends instead of the shorter
            one being stretched to the taller one's bottom. */}
        <span className='tc-fw-rule' aria-hidden />

        <div className='tc-fw-side'>
          <div className='tc-fw-pkg'>{framework.pkg}</div>
          <p>{framework.blurb}</p>

          {/* The two commands that precede the sample. They also give the pane
              enough to say that it reaches the bottom of the code beside it
              instead of stopping a third of the way up. */}
          <div className='tc-fw-run'>
            {framework.install.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>

          {/* Each capability row carries a real output beside its name — the
              formatted number, the shipped pathname, the plural pair — and
              the rows loop as a slow marquee at the density of the sample
              beside them. */}
          <CapMarquee caps={framework.caps} />

          <a className='tc-fw-link' href={href}>
            {framework.pkg} reference
            <ArrowUpRight className='tc-ico-arrow' aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
