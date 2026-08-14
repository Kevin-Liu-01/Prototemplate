import { SiGithub } from '@icons-pack/react-simple-icons';
import {
  Brain,
  CreditCard,
  FolderGit2,
  Landmark,
  Languages,
  PencilLine,
  ShieldCheck,
  Users,
  UsersRound,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

/**
 * The plans: what EVERY plan carries rides one shared strip above the
 * grid, so the two cards spend their space on what actually differs —
 * Starter's flat toolkit against Enterprise's three weighted pillars.
 * Enterprise wears the recommendation: the accent ground, the corner
 * Bayer wash, and the Recommended plate on the card's padding grid.
 */
export default function PlanCards() {
  return (
    <section className='tc-sec pricing-plans'>
      <div className='pricing-plans-included'>
        <h2>Included in every plan</h2>
        <ul>
          <li>
            <Users aria-hidden='true' />
            Unlimited users
          </li>
          <li>
            <FolderGit2 aria-hidden='true' />
            Unlimited projects
          </li>
          <li>
            <Languages aria-hidden='true' />
            Unlimited languages
          </li>
        </ul>
      </div>

      <div className='pricing-plan-grid'>
        <article className='pricing-plan-card'>
          <div className='pricing-plan-head'>
            <div className='pricing-plan-name'>
              <Zap aria-hidden='true' />
              <h3>Starter</h3>
            </div>
            <div className='pricing-plan-price'>$0</div>
            <p>For individuals and small teams</p>
          </div>
          <ul className='pricing-plan-features'>
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
            </li>
          </ul>
          <Link className='pricing-plan-cta' href='/d/singularity-dossier'>
            Get Started
          </Link>
        </article>

        <article className='pricing-plan-card is-reco'>
          <span className='pricing-plan-badge'>Recommended</span>
          <div className='pricing-plan-head'>
            <div className='pricing-plan-name'>
              <Landmark aria-hidden='true' />
              <h3>Enterprise</h3>
            </div>
            <div className='pricing-plan-price'>Contact us</div>
            <p>For large teams with complex localization needs</p>
          </div>
          <div className='pricing-plan-group'>
            <ShieldCheck aria-hidden='true' />
            <h4>Security and governance</h4>
            <p>
              SSO, custom roles, and support for SOC 2 and ISO 27001
              requirements.
            </p>
          </div>
          <div className='pricing-plan-group'>
            <UsersRound aria-hidden='true' />
            <h4>Dedicated engineers</h4>
            <p>Dedicated FDE hours to build any workflow for your use case.</p>
          </div>
          <div className='pricing-plan-group'>
            <Workflow aria-hidden='true' />
            <h4>Custom workflows</h4>
            <p>Custom integrations, webhooks, and tailored automation.</p>
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
