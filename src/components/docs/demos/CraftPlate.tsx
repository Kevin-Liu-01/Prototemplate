'use client';

import type { ComponentProps } from 'react';

import LibraryDemo from '@/app/craft/LibraryDemo';

import '@/app/craft/craft.css';

/**
 * A build log plate (src/app/craft/LibraryDemo.tsx) as a handbook page
 * mounts it between two sections of its file. The plate brings the build
 * log's stylesheet with it, so through lazy.tsx neither the plate's
 * engines nor craft.css load on a docs page that shows no plate.
 */
export default function CraftPlate(props: ComponentProps<typeof LibraryDemo>) {
  return <LibraryDemo {...props} />;
}
