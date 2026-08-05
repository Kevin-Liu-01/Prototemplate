import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import BlogEssays from '../../singularity/company-sections/BlogEssays';
import BlogFeature from '../../singularity/company-sections/BlogFeature';
import BlogMasthead from '../../singularity/company-sections/BlogMasthead';
import BlogReleases from '../../singularity/company-sections/BlogReleases';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../styles.css';

export const metadata = {
  title: 'Blog — Signal — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Blog — the shared company composition in the singularity grammar,
 * wearing the Signal accent sheet. The sections are built once under
 * ../../singularity/company-sections; this wrapper only sets the root.
 */
export default function SingularitySignalBlogPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgs-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <BlogMasthead />
          <BlogFeature />
          <BlogEssays />
        </div>
        <BlogReleases />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-signal' />
    </SmoothScroll>
  );
}
