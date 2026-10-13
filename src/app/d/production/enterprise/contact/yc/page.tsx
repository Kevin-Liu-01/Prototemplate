import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('yc');

/** PRODUCTION · generaltranslation.com/enterprise/contact/yc, the partner credit offer. */
export default function ProductionYcCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.yc} />;
}
