import Reveal from '../components/Reveal';
import SectionHead from '../components/SectionHead';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    note: 'from $0 · pay as you go',
    items: [
      'Unlimited projects, unlimited users, unlimited languages',
      'Translation APIs, CDN delivery, and the Translation Editor',
      'Locadex agent runs on your repos',
    ],
    cta: { label: 'Get Started', solid: true },
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'custom pricing · talk to us',
    items: ['SSO, SOC 2 Type II & ISO 27001', 'Forward-deployed engineers', 'Dedicated Slack support'],
    cta: { label: 'Contact Us', solid: false },
  },
];

export default function Pricing() {
  return (
    <section className='kv-sect' id='pricing' aria-label='Pricing'>
      <div className='kv-sect-inner'>
        <SectionHead
          title='Start free. Upgrade anytime.'
          body='Full-stack localization across buildtime, runtime, and review. Usage-based — you pay for translation, not for seats.'
        />
        <Reveal className='kv-pricing' stagger='[data-plan]'>
          {PLANS.map((plan) => (
            <div className='kv-plan' data-plan key={plan.name}>
              <p className='kv-plan-name'>{plan.name}</p>
              <p className={`kv-plan-price${plan.price === 'Custom' ? ' kv-plan-price-sm' : ''}`}>
                {plan.price}
              </p>
              <p className='kv-plan-note'>{plan.note}</p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className={`kv-btn ${plan.cta.solid ? 'kv-btn-solid' : 'kv-btn-ghost'}`} href='#cta'>
                {plan.cta.solid ? <span className='kv-iri' aria-hidden /> : null}
                {plan.cta.label}
              </a>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
