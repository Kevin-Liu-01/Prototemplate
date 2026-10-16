import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/a16z', ...partnerSeo('a16z') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/a16z, the partner credit offer. */
export default function ProductionA16zCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.a16z} />;
}
