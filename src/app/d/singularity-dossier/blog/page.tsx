import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';
import BlogHeroBoard from '../blog-landing/BlogHeroBoard';
import ChangelogBoard from '../blog-landing/ChangelogBoard';
import EssaysBoard from '../blog-landing/EssaysBoard';
import FlapPhrase from '../blog-landing/FlapPhrase';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import '../blog-landing/blog-landing.css';

export const metadata = {
  title: 'Blog — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Blog landing — the shipped gt-cloud redesign, mirrored as the
 * Dossier direction's blog page: the terminus ticker masthead ("news"
 * across fifteen languages over the dotted GT), the changelog as a
 * five-slab departures hall, and the essays board with its slug-keyed
 * blue Bayer motif covers on one shared three-column grid.
 */
export default function SingularityDossierBlogPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root sgd-blog' id='top'>
        <V0Nav />
        <div className='tc-rail'>
          <section className='tc-sec blog-hero'>
            <BlogHeroBoard>
              <h1 id='blog-index-title'>
                <FlapPhrase text='Blog' flash={false} />
              </h1>
            </BlogHeroBoard>
          </section>
          <ChangelogBoard />
          <EssaysBoard />
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
