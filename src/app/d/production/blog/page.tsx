import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import BlogList from '../sections/BlogList';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/blog-index.css';

export const metadata = {
  title: 'Blog — Shipped — GT Redesign',
  description: 'News and notes from the field',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · BLOG — the shipped blog index, not a direction.
 *
 * The real page is three sections deep and nothing more
 * (apps/landing/src/components/pages/blog/BlogPage.tsx → BlogList): a
 * terminus masthead whose two ticker canvases clack "news" through the
 * catalog's scripts while the word "Blog" lands on flap cells; the
 * changelog as a horizontal departures board carrying all 52 devlog
 * releases, newest first; and the essays deck — filter pills, a search
 * box, an RSS button — leading with the content tree's one blog post at
 * feature size. That last count is not an abbreviation: content/blog/en-US
 * holds exactly one post today, so the real index shows exactly one card
 * and announces "1 post shown".
 *
 * CHROME. The shipped blog route wraps its content in the same site
 * Header and SiteFooterMount as the landing page, so this page mounts the
 * production final's reproductions of those — V0Nav and V0Footer — rather
 * than the singularity TopNav/SiteFooter the proposal subpages use. The
 * root also carries `blog-root`, exactly as the real
 * app/[locale]/blog/layout.tsx does, because the blog sheet is scoped to
 * that class.
 */
export default function ProductionBlogPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root blog-root' id='top'>
        <V0Nav />

        <main className='tc-rail blog-index'>
          <BlogList />
          {/* the shipped page hangs its footer off the layout, in its own
              rail below main; this concept's other pages all close the
              rail with V0Footer inside main, and the seam is identical */}
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
