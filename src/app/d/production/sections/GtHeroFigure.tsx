import { LOGO } from '@/lib/logo';

/**
 * The General Translation logo, LOGO in src/lib/logo.ts, as a bare path:
 * the shipped component at apps/landing/src/components/blog/BlogHeroFigure.tsx,
 * which the real /contact page mounts inside its `.contact-gt-mark` slot. The
 * dotted-outline stroke is applied by the `.contact-gt-mark .gt-hero-figure`
 * rules in contact.css, exactly as the shipped page applies it.
 */
export default function GtHeroFigure() {
  return (
    <svg className='gt-hero-figure' aria-hidden='true' viewBox={LOGO.viewBox}>
      <path d={LOGO.d} />
    </svg>
  );
}
