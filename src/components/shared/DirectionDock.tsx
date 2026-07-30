'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DIRECTIONS } from '@/lib/directions';
import ThemeToggle from '@/components/shared/ThemeToggle';

/**
 * Floating switcher shown on every direction page so directions can be compared
 * without returning to the index. Arrow keys step, G opens the grid.
 */
export default function DirectionDock({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const index = DIRECTIONS.findIndex((d) => d.slug === slug);
  const current = DIRECTIONS[index];

  // ?chrome=0 removes the dock entirely. The screenshot harness sets it so
  // visual reviews judge the design rather than the gallery's own furniture,
  // which otherwise sits over the footer and the story timeline.
  useEffect(() => {
    setHidden(new URLSearchParams(window.location.search).get('chrome') === '0');
  }, []);

  useEffect(() => {
    const step = (delta: number) => {
      const next = DIRECTIONS[(index + delta + DIRECTIONS.length) % DIRECTIONS.length];
      router.push(`/d/${next.slug}`);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'g' || event.key === 'G') setOpen((v) => !v);
      else if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, router]);

  if (!current || hidden) return null;

  const prev = DIRECTIONS[(index - 1 + DIRECTIONS.length) % DIRECTIONS.length];
  const next = DIRECTIONS[(index + 1) % DIRECTIONS.length];

  return (
    <>
      <div
        data-dock
        className='fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/15 bg-black/80 p-1.5 text-white opacity-30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100 print:hidden'
      >
        <Link
          href={`/d/${prev.slug}`}
          className='rounded-lg px-2.5 py-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white'
          aria-label='Previous direction'
        >
          ←
        </Link>
        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          className='flex min-w-[190px] flex-col items-center rounded-lg px-3 py-1 transition-colors hover:bg-white/[0.07]'
        >
          <span className='font-mono text-[9px] uppercase tracking-[0.2em] text-white/45'>
            VERSION {current.label}
          </span>
          <span className='text-[13px] font-semibold tracking-[-0.01em]'>{current.name}</span>
        </button>
        <Link
          href={`/d/${next.slug}`}
          className='rounded-lg px-2.5 py-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white'
          aria-label='Next direction'
        >
          →
        </Link>
        <Link
          href='/'
          className='rounded-lg px-2.5 py-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white'
          aria-label='All directions'
        >
          ▦
        </Link>
        <ThemeToggle />
      </div>

      {open && (
        <div
          className='fixed inset-0 z-[9998] overflow-auto bg-black/92 p-10 backdrop-blur-2xl'
          onClick={() => setOpen(false)}
        >
          <div className='grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4'>
            {DIRECTIONS.map((direction) => (
              <Link
                key={direction.slug}
                href={`/d/${direction.slug}`}
                onClick={() => setOpen(false)}
                className={`rounded-xl border p-4 text-white transition-colors ${
                  direction.slug === slug
                    ? 'border-white'
                    : 'border-white/12 hover:border-white/45'
                }`}
              >
                <span className='font-mono text-[10px] uppercase tracking-[0.2em] text-white/40'>
                  {direction.label}
                </span>
                <div className='mt-1.5 font-semibold'>{direction.name}</div>
                <p className='mt-1 text-[12px] leading-relaxed text-white/50'>
                  {direction.concept}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
