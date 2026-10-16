import { seoRoute } from '@/lib/seo/route';

import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerSeo } from '../../../sections/partner-offers';

const route = seoRoute({ path: '/d/production/enterprise/contact/speedrun', ...partnerSeo('speedrun') });

export const metadata = route.metadata;

/** PRODUCTION · generaltranslation.com/enterprise/contact/speedrun, the partner credit offer. */
export default function ProductionSpeedrunCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.speedrun} />;
}
