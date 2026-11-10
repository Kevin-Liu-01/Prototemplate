import type { ReactNode } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { RootProvider } from 'fumadocs-ui/provider/next';

import SidebarActiveScroll from '@/components/docs/SidebarActiveScroll';
import SidebarMotion from '@/components/docs/SidebarMotion';
import { FINALS, loadRaise, roundsByDay } from '@/lib/raise';
import type { Raise } from '@/lib/raise';

import RaiseNameplate from './RaiseNameplate';

import '../docs/docs.css';
import './raise.css';

/* every page reads the private store on its request; nothing is prerendered or cached */
export const dynamic = 'force-dynamic';

/** The sidebar: the overview, then the rounds under one separator per day, then the finals. */
function raiseTree(raise: Raise | null): Root {
  const children: Node[] = [{ type: 'page', name: 'Overview', url: '/raise' }];
  if (raise) {
    for (const day of roundsByDay(raise.data.rounds)) {
      children.push({ type: 'separator', name: day.label });
      for (const round of day.rounds) {
        children.push({
          type: 'page',
          name: (
            <>
              <span className='raise-tag'>{round.tag}</span> {round.title}
            </>
          ),
          url: `/raise/${round.id}`,
        });
      }
    }
    children.push({ type: 'separator', name: 'Finals' });
    children.push({ type: 'page', name: 'Run of show', url: `/raise/${FINALS}` });
  }
  return { name: 'Raise', children };
}

/**
 * /raise: the media history of an embargoed launch as a docs site, in the
 * notebook layout and stylesheet the docs at /docs run (src/app/docs), with
 * its own sidebar built at request time from the private store
 * (src/lib/raise.ts). It is open to anyone with the link and listed
 * nowhere: no search here, and no row in the docs tree, the sitemap, the
 * search index or /llms.txt (PRIVATE_PATHS in src/lib/seo/policy.ts).
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const raise = await loadRaise();
  return (
    <RootProvider theme={{ enabled: false }} search={{ enabled: false }}>
      <DocsLayout
        tree={raiseTree(raise)}
        containerProps={{ className: 'pt-docs pt-raise' }}
        themeSwitch={{ enabled: false }}
        searchToggle={{ enabled: false }}
        links={[{ type: 'main', text: 'Prototemplate home', url: '/', icon: <HomeIcon aria-hidden /> }]}
        nav={{ title: RaiseNameplate, url: '/raise' }}
        sidebar={{ collapsible: false }}
      >
        <SidebarActiveScroll />
        <SidebarMotion />
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
