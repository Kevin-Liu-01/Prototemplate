import type { Metadata } from 'next';

import { getCatalog } from './_press/content';
import Landing from './_press/Landing';

export const metadata: Metadata = {
  title: { absolute: 'GT Atlas' },
};

export default function PressPage() {
  return <Landing catalog={getCatalog()} />;
}
