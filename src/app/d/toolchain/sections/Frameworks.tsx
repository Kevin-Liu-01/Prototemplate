'use client';

import { Wrench } from 'lucide-react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Coins,
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
import type { ComponentType } from 'react';

import {
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTanstack,
} from '@icons-pack/react-simple-icons';

import { localeFlag } from '../components/LocaleTag';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';
import { CAP_DEMOS, FRAMEWORKS } from './stacks';

import '../components/icons.css';
import './logos-icons.css';

gsap.registerPlugin(useGSAP);

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

/** The real framework marks, monochrome at text size beside each label.
    React Native ships under the React mark — that IS its mark. */
const TAB_MARKS: Record<string, ComponentType<MarkProps>> = {
  next: SiNextdotjs,
  react: SiReact,
  'react-native': SiReact,
  tanstack: SiTanstack,
  node: SiNodedotjs,
  python: SiPython,
};

/** One glyph per capability, the identification column of the marquee rows. */
const CAP_ICONS: Record<string, ComponentType<MarkProps>> = {
  UI: LayoutTemplate,
  Text: Type,
  Numbers: Hash,
  Currencies: Coins,
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
    the Polish plural pair. The demo gets that locale's flag beside it. */
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = wrap.current;
      const track = el?.querySelector<HTMLElement>('[data-caps-track]');
      if (!el || !track) return;

      /* ~2.6s per row: slow enough to read every output before it leaves.
         At yPercent -50 the doubled copy sits exactly where the first list
         started, so the repeat lands invisibly. */
      const loop = gsap.fromTo(
        track,
        { yPercent: 0 },
        { yPercent: -50, duration: caps.length * 2.6, ease: 'none', repeat: -1 }
      );
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
        const flag = loc ? localeFlag(loc) : undefined;
        return (
          <div className='tc-cap' key={cap}>
            {Ico ? <Ico className='tc-cap-ico' aria-hidden /> : null}
            <b>{cap}</b>
            <code>
              {flag ? (
                <i className='tc-cap-flag' aria-hidden='true'>
                  {flag}
                </i>
              ) : null}
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
 */
export default function Frameworks() {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  const [active, setActive] = useState(0);

  useQuietReveal(root);

  useGSAP(
    () => {
      const list = tabs.current;
      const bar = list?.querySelector<HTMLElement>('[data-underline]');
      if (!list || !bar) return;

      const place = (animate: boolean) => {
        const button = list.querySelectorAll<HTMLButtonElement>('[data-tab]')[active];
        if (!button) return;
        const to = { x: button.offsetLeft - list.scrollLeft, width: button.offsetWidth };
        if (animate) gsap.to(bar, { ...to, duration: 0.42, ease: 'power3.out' });
        else gsap.set(bar, to);
      };

      place(settled.current);

      if (settled.current && panel.current) {
        gsap.fromTo(
          panel.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }
        );
      }
      settled.current = true;

      /* Switzer loads after first paint; the underline is measured type, so it
         has to be measured again once the real face is in. */
      const settle = () => place(false);
      void document.fonts?.ready.then(settle);
      window.addEventListener('resize', settle);
      return () => window.removeEventListener('resize', settle);
    },
    { dependencies: [active] }
  );

  const framework = FRAMEWORKS[active] ?? FRAMEWORKS[0];
  if (!framework) return null;

  return (
    <section className='tc-sec' id='frameworks' ref={root}>
      <div className='tc-head'>
        <Wrench className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>One toolchain, every stack.</h2>
        <p data-reveal>
          Developer-first SDKs to translate everything from simple sites to complex user experiences.
        </p>
      </div>

      <div className='tc-tabs' ref={tabs} role='tablist' aria-label='Frameworks'>
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

          <a className='tc-fw-link' href='#platform'>
            {framework.pkg} reference
            <ArrowUpRight className='tc-ico-arrow' aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
