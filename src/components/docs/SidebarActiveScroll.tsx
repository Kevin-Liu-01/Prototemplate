'use client';

import { usePathname } from 'next/navigation';

import { useMountEffect } from '@/lib/use-mount-effect';

// Scrolls the desktop sidebar's own viewport (never the window) by writing
// scrollTop so the active item is visible, on first load and on client
// navigation. It must not call viewport.scroll(): SidebarMotion makes that a
// no-op on desktop.
export default function SidebarActiveScroll() {
  const pathname = usePathname();
  // Keyed by pathname so the inner effect re-runs on every navigation
  // (the docs layout doesn't remount between pages).
  return <ScrollActiveIntoView key={pathname} />;
}

function ScrollActiveIntoView() {
  useMountEffect(() => {
    // Defer a frame so the new page's active link (data-active) is committed.
    const raf = requestAnimationFrame(() => {
      // Scope to the desktop sidebar; the mobile drawer is closed on nav and
      // the TOC marks active items differently.
      const active = document.querySelector<HTMLElement>(
        '#nd-sidebar [data-active="true"]'
      );
      if (!active) return;

      const viewport = active.closest<HTMLElement>(
        '[data-radix-scroll-area-viewport]'
      );
      // Hidden sidebar (collapsed / mobile) has no laid-out viewport.
      if (!viewport || viewport.offsetParent === null) return;

      const itemRect = active.getBoundingClientRect();
      const viewRect = viewport.getBoundingClientRect();

      // Only move if the item isn't already fully in view; then center it so
      // its surrounding section is visible too.
      if (itemRect.top < viewRect.top || itemRect.bottom > viewRect.bottom) {
        viewport.scrollTop +=
          itemRect.top - viewRect.top - (viewRect.height - itemRect.height) / 2;
      }
    });

    return () => cancelAnimationFrame(raf);
  });

  return null;
}
