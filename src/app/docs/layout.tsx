import type { ReactNode } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { RootProvider } from 'fumadocs-ui/provider/next';

import DocsNameplate from '@/components/docs/DocsNameplate';
import DocsSidebarFooter from '@/components/docs/DocsSidebarFooter';
import type { DocsSidebarFooterLink } from '@/components/docs/DocsSidebarFooter';
import SidebarActiveScroll from '@/components/docs/SidebarActiveScroll';
import SidebarMotion from '@/components/docs/SidebarMotion';
import { source } from '@/lib/source';

import './docs.css';

const FOOTER_LINKS: readonly DocsSidebarFooterLink[] = [
  { label: 'Skills', href: '/skills', icon: 'skills' },
  { label: 'GitHub', href: 'https://github.com/Kevin-Liu-01/Prototemplate', icon: 'github' },
];

/**
 * The docs site: fumadocs' notebook layout, the one generaltranslation.com
 * runs at /docs, outside the hub's viewer shell (Kevin, 2026-10-14). Its
 * own sidebar from content/docs/meta.json, whose three root folders
 * (Guide, Components, Internals) fumadocs draws as the tab dropdown, its own
 * header and its own search (the static index at /api/search). RootProvider
 * leaves the theme to the root layout's data-theme (theme.enabled false),
 * and docs.css bridges fumadocs' tokens to the site's. The layout's root
 * carries pt-docs, which joins the roots tokens.css types (DESIGN.md
 * section 4). Three ways lead back to the hub's home at /, each visible
 * at every width (Kevin, 2026-10-21:
 * "be able to go back to prototemplate main from docs"): the nameplate, the
 * labelled Prototemplate home link (the header from 1024 px, the first
 * sidebar row below), and the search dialog's links. The sidebar footer
 * links to the skills and the repository.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{ enabled: false }}
      search={{
        options: { type: 'static', api: '/api/search' },
        links: [
          ['Prototemplate home', '/'],
          ['Skills', '/skills'],
          ['Brand', '/brand'],
        ],
      }}
    >
      <DocsLayout
        tree={source.getPageTree()}
        containerProps={{ className: 'pt-docs' }}
        themeSwitch={{ enabled: false }}
        links={[{ type: 'main', text: 'Prototemplate home', url: '/', icon: <HomeIcon aria-hidden /> }]}
        nav={{ title: DocsNameplate, url: '/' }}
        sidebar={{ collapsible: false, footer: <DocsSidebarFooter links={FOOTER_LINKS} /> }}
      >
        <SidebarActiveScroll />
        <SidebarMotion />
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
