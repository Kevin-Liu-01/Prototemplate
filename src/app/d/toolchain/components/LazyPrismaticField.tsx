'use client';

import { useRef, useState, type ComponentProps, type ComponentType } from 'react';

import type PrismaticField from '@/components/shared/PrismaticField';
import { useMountEffect } from '@/lib/use-mount-effect';

type Props = ComponentProps<typeof PrismaticField>;

/**
 * PrismaticField for a band far below the fold. The server renders the
 * field's empty canvas with the same class, and the field with its engine
 * (about 10 KB compressed) loads once that canvas comes within one screen of
 * the viewport, then draws into the same box.
 */
export default function LazyPrismaticField(props: Props) {
  const holder = useRef<HTMLCanvasElement>(null);
  const [Field, setField] = useState<ComponentType<Props> | null>(null);

  useMountEffect(() => {
    const el = holder.current;
    if (!el) return;
    let live = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        void import('@/components/shared/PrismaticField').then((module) => {
          if (live) setField(() => module.default);
        });
      },
      { rootMargin: '100% 0px' }
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  });

  if (Field) return <Field {...props} />;
  return <canvas ref={holder} className={props.className} aria-hidden />;
}
