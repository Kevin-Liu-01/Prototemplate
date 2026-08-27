'use client';

import {
  ArrowUpRight,
  Check,
  DollarSign,
  Layers,
  LifeBuoy,
  Package,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import PricingHelp from './PricingHelp';
import { bayerTile, type ShineTier } from './pricing-bayer';
import {
  PRICING_FEATURES,
  type Cell,
  type Feature,
  type FeatureGroupId,
} from './pricing-features';
import { PLAN_CTAS } from './pricing-links';

import './pricing.css';

/* ---- the head's motif: one plan card poured from the house Bayer ramp,
   standing at the heading's right (server-drawn SVG, decoration only) ---- */

/** Coverage tiers, solid-side first: ink decaying to sparse dots. */
const RAMP: readonly ShineTier[] = [
  { cover: 16, width: 320 },
  { cover: 12, width: 64 },
  { cover: 8, width: 58 },
  { cover: 5, width: 54 },
  { cover: 3, width: 50 },
  { cover: 1, width: 44 },
];

const CELL = 3;
const TILE = CELL * 4;

function CompareDitherMotif() {
  const idBase = 'pricing-cmp-dither';

  let edge = -200;
  const bands = RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <span className='pricing-dither-type' aria-hidden='true'>
      <svg viewBox='0 0 400 150' preserveAspectRatio='xMidYMid meet'>
        <defs>
          {RAMP.map((tier) => (
            <pattern
              id={`${idBase}-${tier.cover}`}
              key={tier.cover}
              width={TILE}
              height={TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={bayerTile(tier.cover, CELL)} />
            </pattern>
          ))}
          <mask id={`${idBase}-mask`}>
            <rect width='400' height='150' fill='black' />
            {/* one plan card — a header bar and feature rows carved out,
                with the ramp fading it like the table beside it */}
            <rect x='95' y='12' width='100' height='126' rx='10' fill='white' />
            <rect x='111' y='30' width='68' height='10' fill='black' />
            <rect x='111' y='58' width='52' height='7' fill='black' />
            <rect x='111' y='78' width='60' height='7' fill='black' />
            <rect x='111' y='98' width='44' height='7' fill='black' />
          </mask>
        </defs>
        <g mask={`url(#${idBase}-mask)`}>
          <g transform='rotate(18 200 75)'>
            {bands.map((band) => (
              <rect
                fill={`url(#${idBase}-${band.cover})`}
                height='700'
                key={band.cover}
                width={band.width}
                x={band.x}
                y='-240'
              />
            ))}
          </g>
        </g>
      </svg>
    </span>
  );
}

type MarkProps = { 'aria-hidden'?: boolean | 'true' | 'false'; className?: string };

/** The group marks, keyed to the shipped hook's own group ids. */
const GROUP_MARK: Record<FeatureGroupId, ComponentType<MarkProps>> = {
  pricing: DollarSign,
  core: Package,
  platform: Layers,
  support: LifeBuoy,
};

/* The pinned group label's handoff: Chromium doesn't constrain sticky
   cells to their row group, so the pinned label would sit still while
   the next group's label glides over it. This emulates contained
   sticky — the incoming label pushes the pinned one up (they stack),
   and the outgoing one clips away at the band's top edge. Mirrors the
   CSS pin math (58 nav + 130 band − 36 CTA inset − 57/2); the nav in
   this shell stands 58px, two more than the shipped site's. */
function useGroupLabelHandoff() {
  useMountEffect(() => {
    const labels = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.pricing-compare-desktop table td[colspan]'
      )
    );
    if (labels.length === 0) return;
    const PIN = 58 + 130 - 36 - 57 / 2;
    const BAND_TOP = 58;
    const H = 57;
    let raf = 0;
    const settle = () => {
      raf = 0;
      for (const label of labels) {
        const tbody = label.closest('tbody');
        if (!tbody) continue;
        const box = tbody.getBoundingClientRect();
        /* where the sticky engine puts the label (flow until the pin
           line, pinned after), then the group's end carries it up */
        const base = box.top > PIN ? box.top : PIN;
        const desired = Math.min(base, box.bottom - H);
        const dy = desired - base;
        label.style.transform = dy < 0 ? `translateY(${dy}px)` : '';
        const clipTop = Math.max(0, BAND_TOP - desired);
        label.style.clipPath = clipTop > 0 ? `inset(${clipTop}px 0 0 0)` : '';
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(settle);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    settle();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  });
}

type Tier = {
  key: 'starter' | 'enterprise';
  name: string;
  /** The header's price line. */
  cost: ReactNode;
  cta: string;
  href: string;
  /** Enterprise is the recommended column on /pricing, so it carries the
      emphasis wash and the filled CTA. */
  featured: boolean;
};

function CellValue({ cell, usage }: { cell: Cell; usage: string }) {
  if (cell.kind === 'yes') {
    return <Check aria-label='Included' className='pc-yes' strokeWidth={2.5} />;
  }
  if (cell.kind === 'no') {
    return <X aria-label='Not included' className='pc-no' strokeWidth={2} />;
  }
  if (cell.kind === 'rates') {
    return (
      <a className='pc-rates' href={usage}>
        View Rates
        <ArrowUpRight aria-hidden='true' />
      </a>
    );
  }
  return <span className='pc-val'>{cell.value}</span>;
}

function FeatureName({ feature }: { feature: Feature }) {
  return (
    <span className='pc-name-in'>
      <span>{feature.name}</span>
      {feature.tooltip ? <PricingHelp>{feature.tooltip}</PricingHelp> : null}
      {feature.isNew ? <span className='pc-new'>New!</span> : null}
    </span>
  );
}

function PlanHead({ tier }: { tier: Tier }) {
  return (
    <div className={`pc-plan-in${tier.featured ? ' is-featured' : ''}`}>
      <div className='pc-plan-id'>
        <h3>{tier.name}</h3>
        <div className='pc-plan-cost'>{tier.cost}</div>
      </div>
      <a
        className={`pc-plan-cta${tier.featured ? ' is-solid' : ''}`}
        href={tier.href}
      >
        {tier.cta}
      </a>
    </div>
  );
}

/**
 * The compare board: "Compare plans" over the shipped feature grid, the
 * two columns /pricing mounts (Starter, then Enterprise as the featured
 * one) against the same four groups and twenty-five rows the shipped grid
 * renders. Two layouts off one data table, exactly as the shipped grid
 * does it: the ruled table on desktop, the stacked value grid on phones.
 */
export default function PricingCompare() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';
  const usage = `${base}/pricing/usage`;

  useGroupLabelHandoff();

  const tiers: readonly Tier[] = [
    {
      key: 'starter',
      name: 'Starter',
      cost: 'From $0',
      cta: 'Get Started',
      href: PLAN_CTAS.starter,
      featured: false,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      cost: 'Contact Us',
      cta: 'Contact Us',
      href: PLAN_CTAS.enterpriseContact,
      featured: true,
    },
  ];

  return (
    <section className='tc-sec pricing-compare' id='features'>
      <div className='pricing-compare-head'>
        <h2>Compare plans</h2>
        <CompareDitherMotif />
      </div>

      <div className='pricing-compare-grid'>
        {/* ---- the ruled table (desktop) ---- */}
        <div className='pricing-compare-desktop'>
          <table>
            <thead>
              <tr>
                <th className='pc-corner' />
                {tiers.map((tier) => (
                  <th className='pc-plan' key={tier.key}>
                    <PlanHead tier={tier} />
                  </th>
                ))}
              </tr>
            </thead>
            {PRICING_FEATURES.map((group) => {
              const Mark = GROUP_MARK[group.id];
              return (
                <tbody key={group.id}>
                  <tr>
                    <td className='pc-group' colSpan={tiers.length + 1}>
                      <span>
                        <Mark aria-hidden='true' />
                        {group.name}
                      </span>
                    </td>
                  </tr>
                  {group.features.map((feature) => (
                    <tr key={feature.id}>
                      <td className='pc-namecell'>
                        <FeatureName feature={feature} />
                      </td>
                      {tiers.map((tier) => (
                        <td
                          className={tier.featured ? 'is-featured' : undefined}
                          key={tier.key}
                        >
                          <CellValue cell={feature[tier.key]} usage={usage} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>

        {/* ---- the stacked grid (phones) ---- */}
        <div className='pricing-compare-mobile'>
          <div className='pc-m-plans'>
            {tiers.map((tier) => (
              <PlanHead key={tier.key} tier={tier} />
            ))}
          </div>
          {PRICING_FEATURES.map((group) => {
            const Mark = GROUP_MARK[group.id];
            return (
              <div className='pc-m-group' key={group.id}>
                <div className='pc-m-grouphead'>
                  <span>
                    <Mark aria-hidden='true' />
                    {group.name}
                  </span>
                </div>
                {group.features.map((feature) => (
                  <div className='pc-m-row' key={feature.id}>
                    <div className='pc-m-name'>
                      <FeatureName feature={feature} />
                    </div>
                    <div className='pc-m-vals'>
                      {tiers.map((tier) => (
                        <div
                          className={tier.featured ? 'is-featured' : undefined}
                          key={tier.key}
                        >
                          <CellValue cell={feature[tier.key]} usage={usage} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
