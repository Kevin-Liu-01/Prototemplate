import DocsShell, { readDoc } from './DocsShell';

export const metadata = {
  title: 'Docs — Prototemplate',
  description:
    'The repo documents, served: the design canon, the architecture map, the ship loop, and the library index.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

export default function DocsIndexPage() {
  return <DocsShell active={null} source={readDoc('README.md')} />;
}
