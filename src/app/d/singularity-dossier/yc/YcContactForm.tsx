'use client';

import { useState } from 'react';
import {
  BadgeCheck,
  MailCheck,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react';

type YcContactFormState = {
  email: string;
  verificationUrl: string;
  companyName: string;
  companyDescription: string;
};

type YcContactFormProps = {
  embedded?: boolean;
};

const initialForm: YcContactFormState = {
  email: '',
  verificationUrl: '',
  companyName: '',
  companyDescription: '',
};

/**
 * The gt-cloud YC claim form, flattened into a static section for the
 * prototype: same DOM, same copy, the submit completes in place without
 * a backend (the enterprise contact port's precedent). The rainbow ring
 * still answers a fully filled form the way the live variant swap does.
 */
export default function YcContactForm({
  embedded = false,
}: YcContactFormProps) {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);
  const requiredFieldsFilled = Object.values(form).every(
    (value) => value.trim() !== ''
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(true);
  }

  return (
    <section
      id={embedded ? 'claim-your-yc-deal' : undefined}
      className={embedded ? 'tc-sec yc-claim' : 'px-6'}
    >
      <div className='w-full'>
        <div className='yc-contact-layout relative grid items-stretch px-8 py-14 sm:px-10 sm:py-16 md:grid-cols-2 md:px-12'>
          <div
            aria-hidden='true'
            className='yc-contact-divider pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 md:block'
          />

          <div className='flex flex-col py-6 md:py-8 md:pr-12'>
            <h2 className='yc-contact-title text-3xl font-semibold tracking-tight md:text-4xl'>
              Claim your YC deal
            </h2>
            <p className='yc-contact-muted mt-5 max-w-md text-sm leading-6 sm:text-base'>
              Verify your YC founder status to claim $5,000 in General
              Translation credits for 12 months.
            </p>

            <div className='mt-10 flex flex-col gap-7 text-sm sm:text-base'>
              <div className='flex gap-3'>
                <ShieldCheck className='yc-contact-icon mt-0.5 size-5 shrink-0' />
                <p>
                  Your YC verification link confirms eligibility before the
                  request reaches our team.
                </p>
              </div>
              <div className='flex gap-3'>
                <MessageSquareText className='yc-contact-icon mt-0.5 size-5 shrink-0' />
                <p>
                  Tell us what you are building so we can prepare the right
                  onboarding path.
                </p>
              </div>
              <div className='flex gap-3'>
                <BadgeCheck className='yc-contact-icon mt-0.5 size-5 shrink-0' />
                <p>
                  Verified claims go directly to the team for review and
                  activation.
                </p>
              </div>
            </div>
          </div>

          <div className='yc-contact-formcol border-t pt-6 md:border-t-0 md:pt-0 md:pl-12'>
            {success ? (
              <div
                className='flex flex-col items-center justify-center py-12 text-center md:h-full'
                aria-live='polite'
                data-testid='yc-contact-success'
              >
                <div className='yc-contact-badge mb-6 flex size-12 items-center justify-center rounded-full border'>
                  <MailCheck className='yc-contact-icon size-6' />
                </div>
                <h2 className='yc-contact-title text-2xl font-semibold tracking-tight'>
                  Claim received
                </h2>
                <p className='yc-contact-muted mt-3 text-sm'>
                  Your YC status is verified. We will be in touch soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className='bg-transparent py-6 md:py-8'
                data-testid='yc-contact-form'
              >
                <div className='flex flex-col gap-6'>
                  <div className='flex flex-col gap-1.5'>
                    <label htmlFor='yc-email' className='text-sm font-medium'>
                      Email
                    </label>
                    <input
                      id='yc-email'
                      name='email'
                      type='email'
                      autoComplete='email'
                      required
                      value={form.email}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          email: event.target.value,
                        }))
                      }
                      placeholder='you@company.com'
                      className='yc-contact-input w-full rounded-md border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label
                      htmlFor='yc-verification-url'
                      className='text-sm font-medium'
                    >
                      YC verification link
                    </label>
                    <input
                      id='yc-verification-url'
                      name='verificationUrl'
                      type='url'
                      inputMode='url'
                      required
                      value={form.verificationUrl}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          verificationUrl: event.target.value,
                        }))
                      }
                      placeholder='https://www.ycombinator.com/verify/...'
                      className='yc-contact-input w-full rounded-md border bg-transparent px-3 py-2 outline-none'
                    />
                    <a
                      href='https://www.ycombinator.com/verify'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='yc-contact-muted mt-1 w-fit text-xs underline underline-offset-4 hover:text-current'
                    >
                      Get your YC verification link
                    </a>
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label
                      htmlFor='yc-company-name'
                      className='text-sm font-medium'
                    >
                      Company name
                    </label>
                    <input
                      id='yc-company-name'
                      name='companyName'
                      type='text'
                      autoComplete='organization'
                      required
                      value={form.companyName}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          companyName: event.target.value,
                        }))
                      }
                      placeholder='Your company'
                      className='yc-contact-input w-full rounded-md border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label
                      htmlFor='yc-company-description'
                      className='text-sm font-medium'
                    >
                      What does your company do?
                    </label>
                    <textarea
                      id='yc-company-description'
                      name='companyDescription'
                      rows={5}
                      required
                      value={form.companyDescription}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          companyDescription: event.target.value,
                        }))
                      }
                      placeholder='Tell us what you are building and who it is for.'
                      className='yc-contact-input w-full resize-none rounded-md border bg-transparent px-3 py-2 outline-none'
                    />
                  </div>
                </div>

                <div className='mt-6 flex items-center justify-between gap-4'>
                  <p className='yc-contact-muted flex-1 pr-2 text-xs'>
                    By submitting you agree to the Terms of Service and
                    acknowledge the Privacy Policy.
                  </p>
                  <span
                    className={`yc-cta-ring shrink-0${requiredFieldsFilled ? ' is-on' : ''}`}
                  >
                    <button
                      type='submit'
                      className='tc-btn tc-btn-solid'
                      data-testid='yc-contact-submit'
                    >
                      Claim deal
                    </button>
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
