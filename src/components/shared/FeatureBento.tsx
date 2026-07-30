'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import CodeWrapDiagram from '@/components/shared/diagrams/CodeWrapDiagram';
import ConfigSlidersDiagram from '@/components/shared/diagrams/ConfigSlidersDiagram';
import EdgeDeliveryDiagram from '@/components/shared/diagrams/EdgeDeliveryDiagram';
import GlossaryDiagram from '@/components/shared/diagrams/GlossaryDiagram';
import PreviewPanesDiagram from '@/components/shared/diagrams/PreviewPanesDiagram';
import RoutingTreeDiagram from '@/components/shared/diagrams/RoutingTreeDiagram';
import RuntimeSwapDiagram from '@/components/shared/diagrams/RuntimeSwapDiagram';
import TranslationFlowDiagram from '@/components/shared/diagrams/TranslationFlowDiagram';

import './FeatureBento.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type FeatureBentoItem = {
  key: string;
  /** Small line above the title inside the cell, e.g. `Libraries`. */
  category: string;
  title: string;
  body: string;
  diagram: ReactNode;
};

export type FeatureBentoProps = {
  className?: string;
  id?: string;
  heading: ReactNode;
  /** One supporting line under the heading. */
  subheading?: ReactNode;
  items?: FeatureBentoItem[];
  /** Cells per row on wide viewports. Default 4. */
  columns?: 2 | 3 | 4;
  /** Pointer-tracked light wash inside each cell. Default true. */
  spotlight?: boolean;
};

/** The canonical eight modules, each carrying its line-art technical diagram. */
export const DEFAULT_FEATURE_BENTO_ITEMS: FeatureBentoItem[] = [
  {
    key: 'code',
    category: 'Libraries',
    title: 'Code',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.',
    diagram: <CodeWrapDiagram />,
  },
  {
    key: 'context',
    category: 'Platform',
    title: 'Context',
    body: 'Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance.',
    diagram: <GlossaryDiagram />,
  },
  {
    key: 'translation',
    category: 'AI',
    title: 'Translation',
    body: 'AI agents that understand your project structure and localize your content in context.',
    diagram: <TranslationFlowDiagram />,
  },
  {
    key: 'routing',
    category: 'Middleware',
    title: 'Routing',
    body: 'Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration.',
    diagram: <RoutingTreeDiagram />,
  },
  {
    key: 'delivery',
    category: 'Edge',
    title: 'Delivery',
    body: 'A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.',
    diagram: <EdgeDeliveryDiagram />,
  },
  {
    key: 'previews',
    category: 'Dashboard',
    title: 'Previews',
    body: 'Preview translations in development before they go live. Catch issues early and ship with confidence.',
    diagram: <PreviewPanesDiagram />,
  },
  {
    key: 'runtime',
    category: 'Runtime',
    title: 'Live Translation',
    body: 'Translate user-generated content on demand, with low latency and full context.',
    diagram: <RuntimeSwapDiagram />,
  },
  {
    key: 'config',
    category: 'Config',
    title: 'Customization',
    body: 'Build your own language detection functions, locale-specific components, and formatting logic.',
    diagram: <ConfigSlidersDiagram />,
  },
];

/**
 * The eight-module platform grid. Each cell is a heading and its drawing —
 * no index marks, no badges, no kicker.
 */
export default function FeatureBento({
  className,
  id,
  heading,
  subheading,
  items = DEFAULT_FEATURE_BENTO_ITEMS,
  columns = 4,
  spotlight = true,
}: FeatureBentoProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current), {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 34, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.07,
              duration: 0.9,
              ease: 'power3.out',
              overwrite: true,
            }
          ),
      });

      if (!spotlight) return;
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const cells = gsap.utils.toArray<HTMLElement>('.gtb-cell', root.current);
      const cleanups = cells.map((cell) => {
        let rect: DOMRect | undefined;
        const enter = () => (rect = cell.getBoundingClientRect());
        const move = (e: PointerEvent) => {
          if (!rect) return;
          cell.style.setProperty('--gtb-mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
          cell.style.setProperty('--gtb-my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        };
        cell.addEventListener('pointerenter', enter);
        cell.addEventListener('pointermove', move);
        return () => {
          cell.removeEventListener('pointerenter', enter);
          cell.removeEventListener('pointermove', move);
        };
      });
      return () => cleanups.forEach((c) => c());
    },
    { scope: root, dependencies: [spotlight] }
  );

  return (
    <section className={className ? `gtb ${className}` : 'gtb'} id={id} ref={root}>
      <div className='gtb-wrap'>
        <h2 data-reveal>{heading}</h2>
        {subheading && (
          <p className='gtb-sub' data-reveal>
            {subheading}
          </p>
        )}

        <div className='gtb-grid' data-columns={columns}>
          {items.map((item) => (
            <div className='gtb-cell' data-reveal key={item.key}>
              <h3>
                <small>{item.category}</small>
                {item.title}
              </h3>
              <p>{item.body}</p>
              <div className='gtb-mock' aria-hidden>
                {item.diagram}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
