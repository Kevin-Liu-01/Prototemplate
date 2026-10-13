import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('residency');

/** PRODUCTION · generaltranslation.com/enterprise/contact/residency, the partner credit offer. */
export default function ProductionResidencyCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.residency} />;
}
