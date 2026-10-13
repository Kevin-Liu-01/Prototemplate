import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('a16z');

/** PRODUCTION · generaltranslation.com/enterprise/contact/a16z, the partner credit offer. */
export default function ProductionA16zCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.a16z} />;
}
