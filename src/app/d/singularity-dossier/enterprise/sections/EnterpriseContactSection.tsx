import EnterpriseContactForm from './EnterpriseContact';

import ContactRain from './ContactRain';

/**
 * The contact section's weather is the hero column's rain: contained
 * to the form column, occluded by the framed panel, alive only in the
 * slivers above and below the box.
 */
export default function EnterpriseContactSection() {
  return (
    <div className='tce-contact-wrap'>
      <ContactRain />
      <EnterpriseContactForm
        showColumnDivider={false}
        sectionClassName='tc-sec enterprise-contact'
        containerClassName=''
        headingLevel='h2'
      />
    </div>
  );
}
