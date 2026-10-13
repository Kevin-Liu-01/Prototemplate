import PartnerOffer from '../../../sections/PartnerOffer';
import { PARTNER_OFFERS, partnerMetadata } from '../../../sections/partner-offers';

export const metadata = partnerMetadata('slash');

/** PRODUCTION · generaltranslation.com/enterprise/contact/slash, the partner credit offer. */
export default function ProductionSlashCreditsPage() {
  return <PartnerOffer offer={PARTNER_OFFERS.slash} />;
}
