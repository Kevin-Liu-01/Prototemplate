import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/residency', ...partnerSeo('residency') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/residency, the partner credit offer. */
export default function ProductionResidencyCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.residency} />;
}
