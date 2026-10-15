import { svgMarkup } from '@/components/blog/FumadocsArchitecture';

/**
 * PRODUCTION · the Fumadocs architecture diagram in the Fuma Nama post, in
 * live's frame (apps/landing/src/components/blog/FumadocsArchitecture.tsx).
 * The SVG is the one this repository's blog already carries, where the
 * brand fills are classes rather than literals; blog-article.css paints
 * them with live's colors.
 */
export default function PostFumadocsArchitecture() {
  return (
    <figure
      className='fumadocs-architecture not-prose'
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      id='fumadocs-architecture'
    />
  );
}
