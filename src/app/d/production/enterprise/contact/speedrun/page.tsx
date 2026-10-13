import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('speedrun');

/** PRODUCTION · generaltranslation.com/enterprise/contact/speedrun, the partner credit offer. */
export default function ProductionSpeedrunCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.speedrun} />;
}
