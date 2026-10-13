import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('rho');

/** PRODUCTION · generaltranslation.com/enterprise/contact/rho, the partner credit offer. */
export default function ProductionRhoCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.rho} />;
}
