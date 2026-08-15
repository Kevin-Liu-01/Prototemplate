'use client';

import { useState } from 'react';
import { Building2, MailCheck, Rocket, Workflow } from 'lucide-react';

import Cta from './Cta';

import type { LucideIcon } from 'lucide-react';

type FormState = {
  name: string;
  email: string;
  companyName: string;
  message: string;
};

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** The gt-cloud enterprise ask, word for word. */
const FEATURES: FeatureItem[] = [
  {
    icon: Building2,
    title: 'Enterprise platform.',
    description:
      'Share translation context, glossaries, and custom prompts across every project and content source in your company.',
  },
  {
    icon: Workflow,
    title: 'Customized workflows.',
    description:
      'Reliable, scalable translation workflows across any file format or framework.',
  },
  {
    icon: Rocket,
    title: 'Forward-deployed setup.',
    description:
      'Dedicated hours with forward-deployed engineers to bring localization to production.',
  },
];

type EnterpriseContactFormProps = {
  showColumnDivider?: boolean;
  sectionClassName?: string;
  containerClassName?: string;
  headingLevel?: 'h1' | 'h2';
};

/**
 * The gt-cloud contact composition (EnterpriseContactForm over the shared
 * ContactForm), flattened into one static section for the prototype: same
 * DOM, same classes, the submit completes in place without a backend.
 */
export default function EnterpriseContact({
  showColumnDivider = true,
  sectionClassName = 'px-6',
  containerClassName = '',
  headingLevel = 'h2',
}: EnterpriseContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    companyName: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const Heading = headingLevel;
  const filled =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.companyName.trim() !== '' &&
    form.message.trim() !== '';

  return (
    <section className={sectionClassName}>
      <div className={`contact-shell ${containerClassName}`}>
        <div className='contact-layout relative grid items-stretch px-8 py-14 sm:px-10 sm:py-16 md:grid-cols-2 md:px-12'>
          {showColumnDivider && (
            <div
              aria-hidden
              className='pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 md:block'
            />
          )}
          <div className='contact-intro flex flex-col py-6 md:py-8 md:pr-12'>
            <Heading className='contact-title text-3xl font-semibold tracking-tight md:text-4xl'>
              Talk to our team about enterprise deployment
            </Heading>

            <div className='contact-features flex flex-col gap-y-6 text-sm sm:gap-y-8 sm:text-base'>
              {FEATURES.map((feature) => (
                <div key={feature.title} className='contact-feature flex gap-2'>
                  <feature.icon className='mt-1 size-4 shrink-0' />
                  <p className='m-0'>
                    <span className='font-semibold'>{feature.title}</span>{' '}
                    <span className='contact-feature-desc'>
                      {feature.description}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className='contact-testimonial flex items-center justify-center md:mt-auto'>
              <a
                href='https://x.com/milichab/status/2010496967848370412'
                target='_blank'
                rel='noopener noreferrer'
                className='contact-testimonial-link'
              >
                <div className='contact-testimonial-card flex flex-col gap-3 border p-4'>
                  <p className='flex-1 text-sm whitespace-pre-wrap'>
                    General Translation is an incredible product, we are users
                    at @cursor_ai
                  </p>
                  <div className='flex items-center gap-3'>
                    <img
                      src='https://pbs.twimg.com/profile_images/1466472908977487881/-dym5k04_400x400.jpg'
                      alt='Andrew Milich'
                      width={32}
                      height={32}
                      className='size-8 rounded-full'
                    />
                    <div className='text-sm'>
                      <p className='font-medium'>Andrew Milich</p>
                      <p className='contact-feature-desc'>
                        Head of Engineering, Cursor
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className='contact-form-panel pt-6 md:pt-0 md:pl-12'>
            {success ? (
              <div
                className='flex flex-col items-center justify-center py-12 text-center md:h-full'
                role='status'
              >
                <div className='contact-success-badge mb-6 flex size-12 items-center justify-center rounded-full border'>
                  <MailCheck className='size-6' />
                </div>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  Message received
                </h2>
                <p className='contact-feature-desc mt-3 text-sm'>
                  Thank you for reaching out. We&rsquo;ll be in touch soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSuccess(true);
                }}
                className='contact-form bg-transparent py-6 md:py-8'
              >
                <div className='flex flex-col gap-6'>
                  <div className='contact-field flex flex-col gap-1.5'>
                    <label htmlFor='name' className='text-sm font-medium'>
                      Full Name
                    </label>
                    <input
                      id='name'
                      name='name'
                      type='text'
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      placeholder='Your name'
                      className='contact-input w-full border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>

                  <div className='contact-field flex flex-col gap-1.5'>
                    <label htmlFor='email' className='text-sm font-medium'>
                      Company Email
                    </label>
                    <input
                      id='email'
                      name='email'
                      type='email'
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, email: e.target.value }))
                      }
                      placeholder='you@yourcompany.com'
                      className='contact-input w-full border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>

                  <div className='contact-field flex flex-col gap-1.5'>
                    <label
                      htmlFor='companyName'
                      className='text-sm font-medium'
                    >
                      Company Name
                    </label>
                    <input
                      id='companyName'
                      name='companyName'
                      type='text'
                      required
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, companyName: e.target.value }))
                      }
                      placeholder='Your company'
                      className='contact-input w-full border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>
                </div>

                <div className='contact-field mt-6 flex flex-col gap-1.5'>
                  <label htmlFor='message' className='text-sm font-medium'>
                    How can we help?
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    rows={6}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, message: e.target.value }))
                    }
                    placeholder='Tell us how we can help with localization, including timeline and requirements.'
                    className='contact-input w-full resize-none border bg-transparent px-3 py-2 outline-none'
                  />
                </div>

                <div className='mt-6 flex items-center justify-between gap-4'>
                  <p className='contact-feature-desc flex-1 pr-2 text-xs'>
                    By submitting you agree to the{' '}
                    <a
                      href='https://generaltranslation.com/legal/terms'
                      className='underline underline-offset-4'
                    >
                      Terms of Service
                    </a>{' '}
                    and acknowledge the{' '}
                    <a
                      href='https://generaltranslation.com/legal/privacy-policy'
                      className='underline underline-offset-4'
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <span className='shrink-0'>
                    <Cta variant='solid' size='lg' type='submit' ring={filled}>
                      Continue
                    </Cta>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
