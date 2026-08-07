import CraftArticle from '../craft/CraftArticle';
import DocsShell, { readDoc } from './DocsShell';

export const metadata = {
  title: 'Docs — Prototemplate',
  description:
    'The repo documents and the build log in one place: the brand and design canons, the architecture map, the ship loop, and every library running live.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

export default function DocsIndexPage() {
  return (
    <DocsShell active={null} source={readDoc('README.md')}>
      <CraftArticle />
    </DocsShell>
  );
}
