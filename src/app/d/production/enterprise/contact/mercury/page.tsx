import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('mercury');

/** PRODUCTION · generaltranslation.com/enterprise/contact/mercury, the partner credit offer. */
export default function ProductionMercuryCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.mercury} />;
}
