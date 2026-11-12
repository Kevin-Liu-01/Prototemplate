import { LOGO } from '@/lib/logo';

/* The shipped landing app's blog hero figure
   (apps/landing/src/components/blog/BlogHeroFigure.tsx): the General
   Translation logo, LOGO in src/lib/logo.ts, as a bare path; the
   dotted-outline stroke is applied by the .blog-hero-figure rules in
   blog-index.css. */
export default function BlogHeroFigure() {
  return (
    <svg className='blog-hero-figure' aria-hidden='true' viewBox={LOGO.viewBox}>
      <path d={LOGO.d} />
    </svg>
  );
}
