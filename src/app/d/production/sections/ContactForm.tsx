'use client';

import { usePathname } from 'next/navigation';

import { useState } from 'react';
import type { ComponentType, FormEvent } from 'react';

import { HelpCircle, MessageSquare } from 'lucide-react';

import GtHeroFigure from './GtHeroFigure';

import './contact.css';

/**
 * THE CONTACT PAGE, whole.
 *
 * The shipped /contact route is a single section: apps/landing renders the
 * shared ContactForm (components/pages/ContactForm.tsx) with the props
 * components/pages/contact/ContactPage.tsx hands it, dressed by that folder's
 * contact.css. There is no hero above it and no band below it — the two-column
 * split IS the page. This reproduction carries that exactly: the same heading,
 * the same GT figure, the same two feature rows in the same order, the same
 * four fields with the same labels and placeholders, the same terms line, the
 * same Submit.
 *
 * Copy sources, verbatim:
 * - heading / features / placeholders: contact/ContactPage.tsx
 * - labels, message label, terms line: ContactForm.tsx
 * - the GT figure:                     blog/BlogHeroFigure.tsx (vendored next door)
 *
 * The ONE honest difference, following the study precedent: this control
 * assembles the message and never sends it. Submitting surfaces a notice that
 * says so and points at the live form, rather than faking the shipped page's
 * "Message received" state.
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

/** The shipped feature pair, in the shipped order. */
const FEATURES: readonly Feature[] = [
  {
    icon: HelpCircle,
    title: 'Technical support.',
    description:
      'Need help with integration or troubleshooting? Reach out to our team.',
  },
  {
    icon: MessageSquare,
    title: 'General inquiries.',
    description:
      'Have a question about General Translation? We’re here to help.',
  },
];

export default function ContactForm() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  /* The shipped form rings its submit once every required field is filled
     (ContactForm.tsx: `ring={requiredFieldsFilled && !submitting}`), and this
     page passes allFieldsRequired — so all four fields count. */
  const requiredFieldsFilled =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.companyName.trim() !== '' &&
    form.message.trim() !== '';

  const set = (key: keyof FormState) => (value: string) =>
    setForm((state) => ({ ...state, [key]: value }));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // A control never fakes a success state: submitting surfaces the honest
    // notice and points at the live form.
    event.preventDefault();
    setNoticed(true);
  }

  const submit = (
    <button className='tc-btn tc-btn-solid contact-submit' type='submit'>
      Submit
    </button>
  );

  return (
    <section className='tc-sec prod-contact' id='contact'>
      <div className='contact-shell'>
        <div className='contact-layout'>
          <div className='contact-intro'>
            <h1 aria-label='Get in touch' className='contact-title'>
              Get in <span>touch</span>
            </h1>

            <div className='contact-intro-visual'>
              <div className='contact-gt-mark'>
                <GtHeroFigure />
              </div>
            </div>

            <div className='contact-features'>
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div className='contact-feature' key={feature.title}>
                    <Icon aria-hidden size={16} strokeWidth={1.7} />
                    <p>
                      <span className='contact-feature-lead'>
                        {feature.title}
                      </span>{' '}
                      <span className='contact-feature-desc'>
                        {feature.description}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='contact-form-panel'>
            <form className='contact-form' onSubmit={onSubmit}>
              <div className='contact-fields'>
                <div className='contact-field'>
                  <label htmlFor='name'>Full Name</label>
                  <input
                    autoComplete='name'
                    className='contact-input'
                    id='name'
                    name='name'
                    onChange={(event) => set('name')(event.target.value)}
                    placeholder='Your name'
                    required
                    type='text'
                    value={form.name}
                  />
                </div>

                <div className='contact-field'>
                  <label htmlFor='email'>Email</label>
                  <input
                    autoComplete='email'
                    className='contact-input'
                    id='email'
                    name='email'
                    onChange={(event) => set('email')(event.target.value)}
                    placeholder='you@example.com'
                    required
                    type='email'
                    value={form.email}
                  />
                </div>

                <div className='contact-field'>
                  <label htmlFor='companyName'>Company Name</label>
                  <input
                    autoComplete='organization'
                    className='contact-input'
                    id='companyName'
                    name='companyName'
                    onChange={(event) => set('companyName')(event.target.value)}
                    placeholder='Your company'
                    required
                    type='text'
                    value={form.companyName}
                  />
                </div>
              </div>

              <div className='contact-field is-message'>
                <label htmlFor='message'>How can we help?</label>
                <textarea
                  className='contact-input'
                  id='message'
                  name='message'
                  onChange={(event) => set('message')(event.target.value)}
                  placeholder='Tell us what you need help with.'
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
                    href='https://generaltranslation.com/contact'
                    rel='noreferrer'
                    target='_blank'
                  >
                    generaltranslation.com/contact
                  </a>{' '}
                  delivers to the team.
                </p>
              ) : null}

              <div className='contact-close'>
                <p className='contact-terms'>
                  By submitting you agree to the{' '}
                  <a href={`${base}/legal/terms`}>Terms of Service</a> and
                  acknowledge the{' '}
                  <a href={`${base}/legal/privacy-policy`}>Privacy Policy</a>.
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
  );
}
