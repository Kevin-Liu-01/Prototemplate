import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import PresenterApp from './PresenterApp';
import { googleInter, instrument, sora } from './fonts';

import './presenter.css';

const route = seoRoute({
  path: '/present',
  title: PAGE_NAMES.present.name,
  kind: 'page',
  description:
    'Full-screen walkthrough of the website redesign: why, what we need, how it was built, and the prototypes.',
});

export const metadata = route.metadata;

export default function PresentPage() {
  return (
    <div className={`${sora.variable} ${instrument.variable} ${googleInter.variable}`}>
      <JsonLd nodes={route.jsonLd} />
      <PresenterApp />
    </div>
  );
}
