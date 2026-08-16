import { SiGithub } from '@icons-pack/react-simple-icons';
import {
  Brain,
  CreditCard,
  HelpCircle,
  Landmark,
  PencilLine,
  ShieldCheck,
  UsersRound,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** The house 4×4 ordered-dither matrix (DitheredMark's BAYER4). */
const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/* ---- the strip's dithered marks: the compare motif's construction
   (a silhouette mask over the tiered Bayer coverage ramp) at tile
   scale — one mark per ∞ cell, seated on the cell's right ---- */

const INC_RAMP: readonly { cover: number; width: number }[] = [
  { cover: 16, width: 46 },
  { cover: 12, width: 16 },
  { cover: 8, width: 14 },
  { cover: 5, width: 13 },
  { cover: 3, width: 12 },
  { cover: 1, width: 11 },
];

const INC_CELL = 3;
const INC_TILE = INC_CELL * 4;

function incTilePath(cover: number): string {
  const cells: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const bayerRow = BAYER4[row];
      if (bayerRow && (bayerRow[col] ?? 16) < cover) {
        cells.push(
          `M${col * INC_CELL} ${row * INC_CELL}h${INC_CELL}v${INC_CELL}h${-INC_CELL}z`
        );
      }
    }
  }
  return cells.join('');
}

/** One dithered mark: `children` are the white mask silhouettes. */
function IncMark({ id, children }: { id: string; children: ReactNode }) {
  const idBase = `pricing-inc-${id}`;

  let edge = -6;
  const bands = INC_RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <span className='pricing-plan-inc-mark' aria-hidden='true'>
      <svg viewBox='0 0 100 100' preserveAspectRatio='xMidYMid meet'>
        <defs>
          {INC_RAMP.map((tier) => (
            <pattern
              id={`${idBase}-${tier.cover}`}
              key={tier.cover}
              width={INC_TILE}
              height={INC_TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={incTilePath(tier.cover)} />
            </pattern>
          ))}
          <mask id={`${idBase}-mask`}>
            <rect width='100' height='100' fill='black' />
            {children}
          </mask>
        </defs>
        <g mask={`url(#${idBase}-mask)`}>
          <g transform='rotate(18 50 50)'>
            {bands.map((band) => (
              <rect
                fill={`url(#${idBase}-${band.cover})`}
                height='300'
                key={band.cover}
                width={band.width}
                x={band.x}
                y='-100'
              />
            ))}
          </g>
        </g>
      </svg>
    </span>
  );
}

type UnlimitedFeature = 'projects' | 'users' | 'languages';

/** The ledger's silhouettes keyed by feature: the tabbed folder, the
    two seated figures (front one gap-stroked), and the carved globe. */
function UnlimitedMark({
  feature,
  id,
}: {
  feature: UnlimitedFeature;
  id: string;
}) {
  let silhouette: ReactNode;

  if (feature === 'projects') {
    silhouette = (
      <path
        d='M6 30 L6 78 Q6 84 12 84 L88 84 Q94 84 94 78 L94 38 Q94 32 88 32 L48 32 L40 22 Q38 19 34 19 L12 19 Q6 19 6 25 Z'
        fill='white'
      />
    );
  } else if (feature === 'users') {
    silhouette = (
      <>
        <circle cx='34' cy='26' r='13' fill='white' />
        <path d='M8 78 V68 A26 26 0 0 1 60 68 V78 Z' fill='white' />
        <circle
          cx='62'
          cy='22'
          r='16'
          fill='white'
          stroke='black'
          strokeWidth='5'
        />
        <path
          d='M30 80 V70 A31 31 0 0 1 92 70 V80 Z'
          fill='white'
          stroke='black'
          strokeWidth='5'
        />
      </>
    );
  } else {
    silhouette = (
      <>
        <circle cx='50' cy='52' r='34' fill='white' />
        <ellipse
          cx='50'
          cy='52'
          rx='14'
          ry='34'
          fill='none'
          stroke='black'
          strokeWidth='4'
        />
        <line x1='16' y1='52' x2='84' y2='52' stroke='black' strokeWidth='4' />
      </>
    );
  }

  return <IncMark id={id}>{silhouette}</IncMark>;
}

function UnlimitedPlanFeatureItems({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <li>
        <UnlimitedMark feature='projects' id={`${idPrefix}-projects`} />
        Unlimited projects
      </li>
      <li>
        <UnlimitedMark feature='users' id={`${idPrefix}-users`} />
        Unlimited users
      </li>
      <li>
        <UnlimitedMark feature='languages' id={`${idPrefix}-languages`} />
        Unlimited languages
      </li>
    </>
  );
}

/**
 * Every-plan allowances live directly in both cards with the same
 * dithered marks. Starter carries every item in one continuous ledger;
 * Enterprise follows the shared allowances with its three weighted
 * pillars. Both cards ride one subgrid skeleton (name, price, blurb,
 * body, CTA), so every beat lands on a shared line no matter how the
 * copy wraps.
 */
export default function PlanCards() {
  return (
    <section className='tc-sec pricing-plans'>
      <div className='pricing-plan-grid'>
        <article className='pricing-plan-card'>
          <div className='pricing-plan-top'>
            <div className='pricing-plan-name'>
              <Zap aria-hidden='true' />
              <h3>Starter</h3>
            </div>
          </div>
          <div className='pricing-plan-price'>$0</div>
          <p className='pricing-plan-blurb'>For individuals and small teams</p>
          <div className='pricing-plan-body'>
            <ul className='pricing-plan-features'>
              <UnlimitedPlanFeatureItems idPrefix='starter' />
              <li>
                <PencilLine aria-hidden='true' />
                Translation Editor
              </li>
              <li>
                <SiGithub aria-hidden='true' />
                GitHub Integration
              </li>
              <li>
                <Brain aria-hidden='true' />
                Locadex AI Agent
              </li>
              <li>
                <CreditCard aria-hidden='true' />
                Per-workflow pricing
                <span className='pricing-plan-hint' tabIndex={0}>
                  <HelpCircle aria-hidden='true' />
                  <i role='tooltip'>
                    Limited free usage, then charged only for what you use.
                  </i>
                </span>
              </li>
            </ul>
          </div>
          <Link className='pricing-plan-cta' href='/d/singularity-dossier'>
            Get Started
          </Link>
        </article>

        <article className='pricing-plan-card is-reco'>
          <div className='pricing-plan-top'>
            <div className='pricing-plan-name'>
              <Landmark aria-hidden='true' />
              <h3>Enterprise</h3>
            </div>
            <span className='pricing-plan-badge'>Recommended</span>
          </div>
          <div className='pricing-plan-price'>Contact us</div>
          <p className='pricing-plan-blurb'>
            For large teams with complex localization needs
          </p>
          <div className='pricing-plan-body'>
            <ul className='pricing-plan-features pricing-plan-unlimited'>
              <UnlimitedPlanFeatureItems idPrefix='enterprise' />
            </ul>
            <div className='pricing-plan-group'>
              <UsersRound aria-hidden='true' />
              <div>
                <h4>Dedicated engineers</h4>
                <p>
                  Dedicated FDE hours to build any workflow for your use case.
                </p>
              </div>
            </div>
            <div className='pricing-plan-group'>
              <Workflow aria-hidden='true' />
              <div>
                <h4>Custom workflows</h4>
                <p>Custom integrations, webhooks, and tailored automation.</p>
              </div>
            </div>
            <div className='pricing-plan-group'>
              <ShieldCheck aria-hidden='true' />
              <div>
                <h4>Security and governance</h4>
                <p>
                  SSO, RBAC with custom permissions, SOC 2 and ISO 27001
                  certificates
                </p>
              </div>
            </div>
          </div>
          <Link
            className='pricing-plan-cta is-solid'
            href='/d/singularity-dossier/contact'
          >
            Contact Us
          </Link>
        </article>
      </div>
    </section>
  );
}
