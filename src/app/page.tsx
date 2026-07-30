import Link from 'next/link';

import { DIRECTIONS } from '@/lib/directions';

export default function IndexPage() {
  return (
    <main className='mx-auto min-h-screen max-w-6xl px-6 py-16 sm:px-10'>
      <p className='font-mono text-[11px] uppercase tracking-[0.24em] text-white/45'>
        General Translation
      </p>
      <h1 className='mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl'>
        Redesign explorations
      </h1>
      <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55'>
        Eight art directions carried forward from the twenty-sample round. One storyboard, eight
        executions — GSAP and Lenis, black and white and metallic.
      </p>

      <Link
        href='/present'
        className='mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white hover:text-white'
      >
        ▶ Present — the full walkthrough
      </Link>

      <div className='mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {DIRECTIONS.map((direction) => (
          <Link
            key={direction.slug}
            href={`/d/${direction.slug}`}
            className='group relative rounded-xl border border-white/12 bg-white/[0.02] p-5 transition-colors hover:border-white/40'
          >
            <span className='absolute right-4 top-4 rounded-full border border-white/12 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45'>
              {direction.tone}
            </span>
            <span className='font-mono text-[10px] uppercase tracking-[0.2em] text-white/40'>
              {direction.label}
            </span>
            <h2 className='mt-2 text-lg font-semibold tracking-[-0.01em]'>{direction.name}</h2>
            <p className='mt-1.5 text-[13px] leading-relaxed text-white/55'>{direction.concept}</p>
            <p className='mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35'>
              {direction.signature}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
