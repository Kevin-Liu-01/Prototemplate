import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { RootProvider } from 'fumadocs-ui/provider/next';

import DocsSidebarFooter from '@/components/docs/DocsSidebarFooter';
import type { DocsSidebarFooterLink } from '@/components/docs/DocsSidebarFooter';
import SidebarActiveScroll from '@/components/docs/SidebarActiveScroll';
import SidebarMotion from '@/components/docs/SidebarMotion';
import { source } from '@/lib/source';

import './docs.css';

const FOOTER_LINKS: readonly DocsSidebarFooterLink[] = [
  { label: 'Hub', href: '/', icon: 'hub' },
  { label: 'Handbook', href: '/docs/handbook', icon: 'handbook' },
  { label: 'Skills', href: '/skills', icon: 'skills' },
  { label: 'GitHub', href: 'https://github.com/Kevin-Liu-01/Prototemplate', icon: 'github' },
];

/**
 * The docs site: fumadocs' notebook layout, the one generaltranslation.com
 * runs at /docs, outside the hub's viewer shell (Kevin, 2026-10-14). Its
 * own sidebar from content/docs/meta.json, its own header and its own
 * search (the static index at /api/search). RootProvider leaves the theme
 * to the root layout's data-theme (theme.enabled false), and docs.css
 * bridges fumadocs' tokens to the site's. The sidebar footer links back to
 * the hub, the handbook, the skills and the repository.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }} search={{ options: { type: 'static', api: '/api/search' } }}>
      <DocsLayout
        tree={source.getPageTree()}
        themeSwitch={{ enabled: false }}
        nav={{
          title: (
            <span className='flex items-center gap-2' data-docs-nameplate=''>
              {/* a decorative mark beside the name the link already carries */}
              <img src='/pt-mark.svg' alt='' width={20} height={20} />
              <span>Prototemplate</span>
              <span className='text-fd-muted-foreground'>Docs</span>
            </span>
          ),
          url: '/docs',
        }}
        sidebar={{ collapsible: false, footer: <DocsSidebarFooter links={FOOTER_LINKS} /> }}
      >
        <SidebarActiveScroll />
        <SidebarMotion />
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
