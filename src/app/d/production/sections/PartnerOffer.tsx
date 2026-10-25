import type { ReactNode } from 'react';

import Image from 'next/image';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import PlateRoot from '@/components/plate/frame/PlateRoot';
import GtMark from '@/components/plate/icons/GtMark';

import ProdFooter from './ProdFooter';

import ProdNav from './ProdNav';
import type { PartnerOffer as Offer } from './partner-offers';

import '@/components/plate/plate.css';
import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import './partner-offer.css';

/*
 * Apply for Credits opens the dashboard's sign-in with the billing page
 * as its callback, the address gt-cloud's getDashboardBillingHref builds
 * for en-US (apps/landing/src/lib/dashboard.ts). It is a plain link: the
 * live button's PostHog location is not ported, as on HomeHero.
 */
const BILLING_HREF =
  'https://dash.generaltranslation.com/en-US/signin?callback_url=%2Fbilling';

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** One ruled row, as on the dashboard's consent ledger. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid gap-x-3 gap-y-1 py-2 text-sm sm:grid-cols-[6.875rem_minmax(0,1fr)]'>
      <dt className='typo-key pt-0.5'>{label}</dt>
      <dd className='text-foreground min-w-0'>{children}</dd>
    </div>
  );
}

/**
 * PRODUCTION · PARTNER CREDITS: one partner credit offer, as gt-cloud's
 * apps/landing/src/components/pages/partners/PartnerOfferPage.tsx renders
 * it (#5216): the sign-in plate as a section under the site header, its
 * column beside the Blue Marble, with the GT mark and the partner's logo,
 * the offer, a ruled list of its terms, one full-width Apply for Credits
 * button and the fine print. The live page sits in the (home) route group,
 * so it wears the site header and footer; here that is ProdNav and ProdFooter,
 * the pair every /d/production page mounts. gt-cloud gives PlateRoot an
 * `inset` prop for this; the mirror's plate fork is frozen, so main's
 * .prpo-plate class (partner-offer.css) sets the same inset rules on the
 * plate root from outside, reading the nav's height from --plate-inset-top.
 */
export default function PartnerOffer({ offer }: { offer: Offer }) {
  const validFor = `${offer.term.charAt(0).toUpperCase()}${offer.term.slice(1)} after activation`;

  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root prpo-root' id='top'>
        <ProdNav />

        <main className='prpo-plate'>
          <PlateRoot scene={1} picture='earth'>
            <div className='relative flex flex-1 flex-col px-4 pt-[max(0px,calc(clamp(24px,9svh,88px)_-_var(--plate-inset-top)))] sm:px-6 md:px-0'>
              <div className='plate-column mx-auto flex w-full max-w-[560px] flex-col gap-10 px-5 py-8 sm:px-12 sm:py-12 md:gap-(--plate-mark-gap) md:pt-(--plate-column-pt) md:pb-(--plate-column-pb)'>
                <div
                  role='img'
                  aria-label={offer.partnershipLabel}
                  className='text-foreground flex h-4 w-fit items-center gap-2.5'
                >
                  <GtMark className='h-4 w-[25px]' />
                  <span
                    aria-hidden='true'
                    className='text-[13px] leading-none text-(--titanium)'
                  >
                    ×
                  </span>
                  <Image
                    src={offer.logo.src}
                    alt=''
                    width={offer.logo.width}
                    height={16}
                    unoptimized
                    className={offer.logo.inverts ? 'brightness-0 dark:invert' : undefined}
                  />
                </div>
                <div className='flex flex-col gap-9'>
                  <div className='flex flex-col gap-4'>
                    <h1 className='typo-page-heading'>{offer.heading}</h1>
                    <p className='typo-lede'>
                      General Translation translates your app, documentation
                      and website into other languages, and the credits pay
                      for that usage.
                    </p>
                  </div>
                  <div className='flex flex-col gap-7'>
                    <dl className='ruled'>
                      <Row label='Credits'>{USD.format(offer.amount)}</Row>
                      <Row label='Valid for'>{validFor}</Row>
                      <Row label='How to apply'>
                        Sign in and add a payment method, then open Billing,
                        choose Redeem Code and enter {offer.code}.
                      </Row>
                    </dl>
                    <a
                      className='tc-btn tc-btn-solid tc-btn-lg w-full'
                      href={BILLING_HREF}
                    >
                      Apply for Credits
                    </a>
                  </div>
                  <p className='text-xs leading-normal tracking-[0.01em] text-(--titanium)/85 dark:text-(--titanium)/80'>
                    Credits expire {offer.term} after activation and cannot be
                    combined with another GT partner credit offer. Standard
                    usage charges apply after promotional credits are depleted
                    or expire. Limited to one grant per company and subject to
                    review.
                  </p>
                </div>
              </div>
            </div>
          </PlateRoot>
        </main>

        <div className='tc-rail'>
          <ProdFooter />
        </div>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
