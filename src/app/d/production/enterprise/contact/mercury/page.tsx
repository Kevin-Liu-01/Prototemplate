import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/mercury', ...partnerSeo('mercury') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/mercury, the partner credit offer. */
export default function ProductionMercuryCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.mercury} />;
}
