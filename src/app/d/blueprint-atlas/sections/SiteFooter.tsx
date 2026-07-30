import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className='ba-foot' id='blog'>
      <div className='ba-wrap'>
        <div className='ba-foot-grid'>
          <div className='ba-foot-brand'>
            <span className='ba-nav-logo'>
              <Image
                className='ba-logo-img'
                src='/brand/no-bg-gt-logo-dark.png'
                alt='General Translation'
                width={52}
                height={52}
              />
              General Translation
            </span>
            <p className='ba-compliance'>
              SOC 2 TYPE II · GDPR · ISO 27001
              <br />
              LANGUAGE INFRASTRUCTURE
              <br />
              FOR THE INTERNET
            </p>
          </div>
          <div className='ba-foot-col'>
            <h5>Product</h5>
            <a href='#docs'>Docs</a>
            <a href='#pricing'>Pricing</a>
            <a href='#blog'>Blog</a>
            <a href='#top'>Supported Locales</a>
          </div>
          <div className='ba-foot-col'>
            <h5>Company</h5>
            <a href='#top'>Careers</a>
            <a href='#contact'>Contact</a>
            <a href='#enterprise'>Enterprise</a>
          </div>
          <div className='ba-foot-col'>
            <h5>Community</h5>
            <a href='#top'>GitHub</a>
            <a href='#top'>𝕏</a>
            <a href='#top'>Discord</a>
            <a href='#top'>LinkedIn</a>
          </div>
          <div className='ba-foot-col'>
            <h5>Legal</h5>
            <a href='#top'>Terms of Service</a>
            <a href='#top'>Privacy</a>
            <a href='#top'>Acceptable Use</a>
          </div>
        </div>
        <div className='ba-foot-bottom'>
          <span>© 2026 GENERAL TRANSLATION, INC. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </footer>
  );
}
