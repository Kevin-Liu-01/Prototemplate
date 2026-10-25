import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import BlogHero from './sections/BlogHero';
import Essays from './sections/Essays';
import Feature from './sections/Feature';
import Releases from './sections/Releases';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../sections/logos-icons.css';
import '../styles.css';
import './blog.css';

const route = seoRoute({
  path: '/d/toolchain/blog',
  title: 'Blog, Toolchain',
  kind: 'direction',
  description:
    'The blog index of the Toolchain direction: General Translation’s posts in the concept’s type and color, a study of the live page.',
});

export const metadata = route.metadata;

/**
 * The blog index, mutated into the toolchain grammar: the landing page's two
 * columns (Blogs / Updates) become two ruled ledgers in the same 1170px rail,
 * and the newest essay gets the page's one framed feature cell. Every title,
 * date, summary, tag and author is the landing content tree's frontmatter;
 * entries link to the real articles on generaltranslation.com.
 */
export default function ToolchainBlogPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <BlogHero />
          <Feature />
          <Essays />
          <Releases />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
