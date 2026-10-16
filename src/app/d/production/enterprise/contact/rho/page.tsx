import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/rho', ...partnerSeo('rho') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/rho, the partner credit offer. */
export default function ProductionRhoCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.rho} />;
}
