'use client';

import { Building2, Rocket, ShieldCheck, Workflow } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { ComponentType, FormEvent } from 'react';

/**
 * The shipped enterprise contact section.
 *
 * Three files upstream, flattened into one here because none of them holds
 * anything but props: services-landing/EnterpriseContactSection.tsx wraps
 * enterprise/EnterpriseContactForm.tsx (which supplies the heading, the
 * four pillars, the labels, the placeholders, the submit label and the
 * Milich quote), which in turn calls the shared pages/ContactForm.tsx (the
 * two-column sheet, the four fields, the terms line). The DOM below is that
 * shared form's DOM with this page's props resolved — same classes, same
 * order, same words.
 *
 * Two departures. gt-next's <T>/gt() are gone: the English resolution is
 * rendered plainly. And, following the concept's own /contact page, this
 * control assembles the message and never sends it — submitting surfaces a
 * notice that says so and points at the live form, rather than faking the
 * shipped page's "Message received" state.
 */

type FormState = {
  name: string;
  email: string;
  companyName: string;
  message: string;
};

const EMPTY: FormState = { name: '', email: '', companyName: '', message: '' };

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

type Feature = {
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
};

/** The four enterprise pillars, in the shipped order. */
const FEATURES: readonly Feature[] = [
  {
    icon: Building2,
    title: 'Enterprise Platform.',
    description:
      'Share translation context, glossaries, and custom prompts across every project and content source in your company.',
  },
  {
    icon: Workflow,
    title: 'Custom Workflows.',
    description:
      'Reliable, scalable translation workflows across any file format or framework. Custom integrations, webhooks, and tailored automation.',
  },
  {
    icon: ShieldCheck,
    title: 'Security and Governance.',
    description: 'SSO, SOC 2, ISO 27001, audit logs, and custom roles.',
  },
  {
    icon: Rocket,
    title: 'Forward-Deployed Support.',
    description:
      'Dedicated FDE hours with localization engineers to set up your system and bring localization to production.',
  },
];

const TESTIMONIAL = {
  avatar:
    'https://pbs.twimg.com/profile_images/1466472908977487881/-dym5k04_400x400.jpg',
  user: 'Andrew Milich',
  role: 'Head of Engineering, Cursor',
  message:
    'General Translation is an incredible product, we are users at @cursor_ai',
  href: 'https://x.com/milichab/status/2010496967848370412',
};

export default function EnterpriseContact() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  /* The shipped form rings its submit once every required field is filled
     (ContactForm.tsx: `ring={requiredFieldsFilled && !submitting}`), and
     this page passes allFieldsRequired — so all four fields count. */
  const requiredFieldsFilled =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.companyName.trim() !== '' &&
    form.message.trim() !== '';

  const set = (key: keyof FormState) => (value: string) =>
    setForm((state) => ({ ...state, [key]: value }));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // A control never fakes a success state.
    event.preventDefault();
    setNoticed(true);
  }

  const submit = (
    <button
      className='tc-btn tc-btn-solid tc-btn-lg shrink-0'
      type='submit'
    >
      Continue
    </button>
  );

  return (
    <div className='tce-contact-wrap'>
      <section className='tc-sec enterprise-contact'>
        <div className='contact-shell'>
          <div className='contact-layout relative grid items-stretch border-x px-8 py-14 sm:px-10 sm:py-16 md:grid-cols-2 md:px-12'>
            <div className='contact-intro flex flex-col py-6 md:py-8 md:pr-12'>
              <h2 className='contact-title text-3xl font-semibold tracking-tight md:text-4xl'>
                Talk to our team about enterprise deployment
              </h2>

              {/* the shipped markup's inline offset, kept: on the shipped
                  page this 2.5rem BEATS the sheet's plain 34px (the build
                  drops that rule's importance flag), so the shipped
                  computed value is 40px. Reproduced by carrying the same
                  inline style over the same sheet. */}
              <div
                className='contact-features flex flex-col gap-y-6 text-sm sm:gap-y-8 sm:text-base'
                style={{ marginTop: '2.5rem' }}
              >
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div className='contact-feature flex gap-2' key={feature.title}>
                      <Icon aria-hidden className='mt-1 size-4 shrink-0' />
                      <p className='m-0'>
                        <span className='font-semibold'>{feature.title}</span>{' '}
                        <span>{feature.description}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* the same inline offset rides the quote upstream, but there
                  the sheet's `margin-top: 0` KEEPS its importance flag and
                  wins — computed 0px. This repo's practices lint bans that
                  flag, so the port drops the inline value instead: same
                  sheet, same computed 0px, no flagged override. */}
              <div className='contact-testimonial flex items-center justify-center md:mt-auto'>
                <a
                  className='contact-testimonial-link'
                  href={TESTIMONIAL.href}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <div className='contact-testimonial-card flex flex-col gap-3 rounded-md border p-4 shadow-sm'>
                    <p className='contact-testimonial-quote flex-1 text-sm whitespace-pre-wrap'>
                      {TESTIMONIAL.message}
                    </p>
                    <div className='flex items-center gap-3'>
                      <img
                        alt={TESTIMONIAL.user}
                        className='size-8 rounded-full'
                        height={32}
                        src={TESTIMONIAL.avatar}
                        width={32}
                      />
                      <div className='text-sm'>
                        <p className='contact-testimonial-name font-medium'>
                          {TESTIMONIAL.user}
                        </p>
                        <p className='contact-testimonial-role'>
                          {TESTIMONIAL.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className='contact-form-panel pt-6 md:pt-0 md:pl-12'>
              <form
                className='contact-form bg-transparent py-6 md:py-8'
                onSubmit={onSubmit}
              >
                <div className='flex flex-col gap-6'>
                  <div className='contact-field flex flex-col gap-1.5'>
                    <label className='text-sm font-medium' htmlFor='name'>
                      Full Name
                    </label>
                    <input
                      className='contact-input w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-3'
                      id='name'
                      name='name'
                      onChange={(event) => set('name')(event.target.value)}
                      placeholder='Your name'
                      required
                      type='text'
                      value={form.name}
                    />
                  </div>

                  <div className='contact-field flex flex-col gap-1.5'>
                    <label className='text-sm font-medium' htmlFor='email'>
                      Company Email
                    </label>
                    <input
                      className='contact-input w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-3'
                      id='email'
                      name='email'
                      onChange={(event) => set('email')(event.target.value)}
                      placeholder='you@yourcompany.com'
                      required
                      type='email'
                      value={form.email}
                    />
                  </div>

                  <div className='contact-field flex flex-col gap-1.5'>
                    <label
                      className='text-sm font-medium'
                      htmlFor='companyName'
                    >
                      Company Name
                    </label>
                    <input
                      className='contact-input w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-3'
                      id='companyName'
                      name='companyName'
                      onChange={(event) =>
                        set('companyName')(event.target.value)
                      }
                      placeholder='Your company'
                      required
                      type='text'
                      value={form.companyName}
                    />
                  </div>
                </div>

                <div className='contact-field mt-6 flex flex-col gap-1.5'>
                  <label className='text-sm font-medium' htmlFor='message'>
                    How can we help?
                  </label>
                  <textarea
                    className='contact-input w-full resize-none rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-3'
                    id='message'
                    name='message'
                    onChange={(event) => set('message')(event.target.value)}
                    placeholder='Tell us how we can help with localization, including timeline and requirements.'
                    required
                    rows={6}
                    value={form.message}
                  />
                </div>

                {noticed ? (
                  <p className='contact-notice' role='status'>
                    Nothing was sent. This reproduction isn&rsquo;t wired to the
                    API; the live form at{' '}
                    <a
                      href='https://generaltranslation.com/enterprise'
                      rel='noreferrer'
                      target='_blank'
                    >
                      generaltranslation.com/enterprise
                    </a>{' '}
                    delivers to the team.
                  </p>
                ) : null}

                <div className='mt-6 flex items-center justify-between gap-4'>
                  <p className='contact-consent flex-1 pr-2 text-xs'>
                    By submitting you agree to the{' '}
                    <a
                      className='underline underline-offset-4'
                      href={`${base}/legal/terms`}
                    >
                      Terms of Service
                    </a>{' '}
                    and acknowledge the{' '}
                    <a
                      className='underline underline-offset-4'
                      href={`${base}/legal/privacy-policy`}
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                  {requiredFieldsFilled ? (
                    <span className='tch-cta'>{submit}</span>
                  ) : (
                    submit
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
