import { getCatalog } from './_press/content';
import Landing from './_press/Landing';

export default function PressPage() {
  return <Landing catalog={getCatalog()} />;
}
