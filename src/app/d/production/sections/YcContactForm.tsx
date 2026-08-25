'use client';

import { BadgeCheck, MessageSquareText, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type YcContactFormState = {
  email: string;
  verificationUrl: string;
  companyName: string;
  companyDescription: string;
};

const initialForm: YcContactFormState = {
  email: '',
  verificationUrl: '',
  companyName: '',
  companyDescription: '',
};

/**
 * THE SHIPPED CLAIM RECORD, reproduced.
 *
 * 1-1 with apps/landing/src/components/pages/enterprise/YcContactForm.tsx on
 * its `embedded` mount — the section /yc closes on. Heading, blurb, the
 * three assurances, every field label and placeholder, the YC verification
 * link, the terms line and the button label are the real component's, in the
 * real order, and the layout is its own Tailwind grid (the token layer those
 * classes read is mapped in yc.css).
 *
 * One behaviour cannot travel: the real form POSTs to /api/contact?type=yc,
 * which checks the founder verification link with YC before the request
 * reaches the team. This control has no such endpoint and never fakes one —
 * submitting surfaces an honest notice instead, in the place the real form
 * prints its error. The error-code table and the post-submit success panel
 * both hang off that response, so neither is reproduced.
 */
export default function YcContactForm() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';
  const [form, setForm] = useState(initialForm);
  const [noticed, setNoticed] = useState(false);
  const requiredFieldsFilled = Object.values(form).every(
    (value) => value.trim() !== ''
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoticed(true);
  }

  const submit = (
    <button
      className='tc-btn tc-btn-solid tc-btn-lg shrink-0'
      type='submit'
    >
      Claim Deal
    </button>
  );

  return (
    <section id='claim-your-yc-deal' className='tc-sec yc-claim'>
      <div className='w-full'>
        <div className='relative grid items-stretch px-8 py-14 sm:px-10 sm:py-16 md:grid-cols-2 md:px-12'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[color:var(--color-fd-border)] md:block'
          />

          <div className='flex flex-col py-6 md:py-8 md:pr-12'>
            <h2 className='text-3xl font-semibold tracking-tight md:text-4xl'>
              Claim your YC deal
            </h2>
            <p className='text-fd-muted-foreground mt-5 max-w-md text-sm leading-6 sm:text-base'>
              Verify your YC founder status to claim $5,000 in General
              Translation credits for 12 months.
            </p>

            <div className='text-fd-foreground/90 mt-10 flex flex-col gap-7 text-sm sm:text-base'>
              <div className='flex gap-3'>
                <ShieldCheck className='text-emphasis mt-0.5 size-5 shrink-0' />
                <p>
                  Your YC verification link confirms eligibility before the
                  request reaches our team.
                </p>
              </div>
              <div className='flex gap-3'>
                <MessageSquareText className='text-emphasis mt-0.5 size-5 shrink-0' />
                <p>
                  Tell us what you are building so we can prepare the right
                  onboarding path.
                </p>
              </div>
              <div className='flex gap-3'>
                <BadgeCheck className='text-emphasis mt-0.5 size-5 shrink-0' />
                <p>
                  Verified claims go directly to the team for review and
                  activation.
                </p>
              </div>
            </div>
          </div>

          <div className='border-t border-[color:var(--color-fd-border)] pt-6 md:border-t-0 md:pt-0 md:pl-12'>
            <form
              onSubmit={onSubmit}
              className='yc-contact-form bg-transparent py-6 md:py-8'
            >
              {noticed && (
                <div className='yc-contact-notice' role='status'>
                  Nothing was sent — this reproduction has no verification
                  endpoint, and the live /yc route is switched off upstream
                  today. The real form checks your founder link with YC before
                  the claim reaches the team.
                </div>
              )}

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
                    className='w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none'
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
                    className='w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none'
                  />
                  <a
                    href='https://www.ycombinator.com/verify'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-fd-muted-foreground mt-1 w-fit text-xs underline underline-offset-4 hover:text-current'
                  >
                    Get Your YC Verification Link
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
                    className='w-full rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none'
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
                    className='w-full resize-none rounded-md border bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none'
                  />
                </div>
              </div>

              <div className='yc-contact-actions mt-6 flex items-center justify-between gap-4'>
                <p className='text-fd-muted-foreground flex-1 pr-2 text-xs'>
                  By submitting you agree to the{' '}
                  <a
                    href={`${base}/legal/terms`}
                    className='underline underline-offset-4'
                  >
                    Terms of Service
                  </a>{' '}
                  and acknowledge the{' '}
                  <a
                    href={`${base}/legal/privacy-policy`}
                    className='underline underline-offset-4'
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                {/* the shipped Cta rings only once every required field is
                    filled — the ring IS the form's readiness signal */}
                {requiredFieldsFilled ? (
                  <span className='tc-cta-ring'>{submit}</span>
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
