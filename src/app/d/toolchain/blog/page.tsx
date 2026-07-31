import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import BlogHero from './sections/BlogHero';
import Essays from './sections/Essays';
import Feature from './sections/Feature';
import Releases from './sections/Releases';

import '../styles.css';
import './blog.css';

export const metadata = {
  title: 'Blog — Toolchain — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The blog index, mutated into the toolchain grammar: the old landing page's
 * two columns (Blogs / Updates) become two ruled ledgers in the same 1170px
 * rail, and the newest essay gets the page's one framed feature cell. Every
 * title, date, summary, tag and author is the old content tree's frontmatter;
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
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
