import type { ComponentType, SVGProps } from 'react';
import { BookOpenIcon, Squares2X2Icon, WrenchScrewdriverIcon } from '@heroicons/react/20/solid';
import { SiGithub } from '@icons-pack/react-simple-icons';

import DocsThemeButton from './DocsThemeButton';

export type DocsSidebarFooterLink = {
  label: string;
  href: string;
  icon: 'hub' | 'handbook' | 'skills' | 'github';
};

/* Heroicons 20 solid for the hub's places, the GitHub mark from the brand set */
const ICONS: Record<DocsSidebarFooterLink['icon'], ComponentType<SVGProps<SVGSVGElement>>> = {
  hub: Squares2X2Icon,
  handbook: BookOpenIcon,
  skills: WrenchScrewdriverIcon,
  github: SiGithub,
};

/**
 * The sidebar's foot, as gt-cloud's docs draw it: a short list of links
 * back into the hub, then the theme button. On phones the drawer is the
 * only place the theme can be switched, so the same footer renders there.
 * fumadocs places it in its own footer row; docs.css styles it.
 */
export default function DocsSidebarFooter({ links }: { links: readonly DocsSidebarFooterLink[] }) {
  return (
    <div data-docs-sidebar-footer='' className='flex flex-col gap-0.5 p-2 text-fd-muted-foreground'>
      {links.map((link) => {
        const Icon = ICONS[link.icon];
        const external = /^https?:/.test(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className='flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0'
          >
            <Icon aria-hidden />
            <span>{link.label}</span>
          </a>
        );
      })}
      <div className='mt-1 flex items-center justify-between gap-2 border-t border-fd-border pt-2'>
        <span className='px-2 text-[13px]'>Theme</span>
        <DocsThemeButton className='grid size-8 cursor-pointer place-items-center rounded-md text-fd-muted-foreground transition-colors hover:text-fd-foreground' />
      </div>
    </div>
  );
}
