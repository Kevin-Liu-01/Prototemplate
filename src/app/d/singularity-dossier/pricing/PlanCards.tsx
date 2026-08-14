import { SiGithub } from '@icons-pack/react-simple-icons';
import {
  Brain,
  Check,
  CreditCard,
  FolderGit2,
  Languages,
  PencilLine,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

/**
 * The two plans, side by side on the full-bleed grid: Starter carries
 * the accent ground, its Bayer wash in the corner, and the
 * Most-popular tag seated on the card's own padding; Enterprise is the
 * plain twin. Static data — this direction ships no billing.
 */

type PlanFeature = { icon: React.ReactNode; label: string };

function FeatureList({ items }: { items: readonly PlanFeature[] }) {
  return (
    <ul className='pricing-plan-features'>
      {items.map((f) => (
        <li key={f.label}>
          {f.icon}
          <span>{f.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PlanCards() {
  return (
    <section className='tc-sec pricing-plans'>
      <div className='pricing-plan-grid'>
        <article className='pricing-plan-card is-starter'>
          <span className='pricing-plan-badge'>Most popular</span>
          <div className='pricing-plan-head'>
            <div className='pricing-plan-name'>
              <Zap aria-hidden='true' />
              <h3>Starter</h3>
            </div>
            <div className='pricing-plan-price'>$0</div>
            <p>For individuals and small teams</p>
          </div>
          <FeatureList
            items={[
              { icon: <Users aria-hidden='true' />, label: 'Unlimited users' },
              {
                icon: <FolderGit2 aria-hidden='true' />,
                label: 'Unlimited projects',
              },
              {
                icon: <Languages aria-hidden='true' />,
                label: 'Unlimited languages',
              },
              {
                icon: <CreditCard aria-hidden='true' />,
                label: 'Per-workflow pricing',
              },
            ]}
          />
          <div className='pricing-plan-rule' aria-hidden='true' />
          <FeatureList
            items={[
              {
                icon: <PencilLine aria-hidden='true' />,
                label: 'Translation Editor',
              },
              {
                icon: <SiGithub aria-hidden='true' />,
                label: 'GitHub Integration',
              },
              { icon: <Brain aria-hidden='true' />, label: 'Locadex AI Agent' },
            ]}
          />
          <Link
            className='pricing-plan-cta is-solid'
            href='/d/singularity-dossier'
          >
            Get Started
          </Link>
        </article>

        <article className='pricing-plan-card'>
          <div className='pricing-plan-head'>
            <div className='pricing-plan-name'>
              <Brain aria-hidden='true' />
              <h3>Enterprise</h3>
            </div>
            <div className='pricing-plan-price'>Contact us</div>
            <p>For large teams with complex localization needs</p>
          </div>
          <FeatureList
            items={[
              { icon: <Users aria-hidden='true' />, label: 'Unlimited users' },
              {
                icon: <FolderGit2 aria-hidden='true' />,
                label: 'Unlimited projects',
              },
              {
                icon: <Languages aria-hidden='true' />,
                label: 'Unlimited languages',
              },
              {
                icon: <CreditCard aria-hidden='true' />,
                label: 'Custom pricing',
              },
            ]}
          />
          <div className='pricing-plan-rule' aria-hidden='true' />
          <p className='pricing-plan-plus'>Everything in Starter, plus:</p>
          <FeatureList
            items={[
              {
                icon: <Check aria-hidden='true' />,
                label: 'Custom Integrations',
              },
              { icon: <Check aria-hidden='true' />, label: 'Custom SLA' },
              {
                icon: <Check aria-hidden='true' />,
                label: 'Forward-Deployed Engineers',
              },
            ]}
          />
          <Link
            className='pricing-plan-cta'
            href='/d/singularity-dossier/contact'
          >
            Contact Us
          </Link>
        </article>
      </div>
    </section>
  );
}
