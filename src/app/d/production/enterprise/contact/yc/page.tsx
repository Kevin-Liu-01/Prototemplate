import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/yc', ...partnerSeo('yc') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/yc, the partner credit offer. */
export default function ProductionYcCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.yc} />;
}
