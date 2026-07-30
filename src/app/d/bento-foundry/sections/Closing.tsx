import Image from 'next/image';

import PrismaticField from '@/components/shared/PrismaticField';

import Cascade from '../components/Cascade';

/** Pricing teaser, closing CTA (the page's one spectral accent), and footer. */
export default function Closing() {
  return (
    <>
      <Cascade className='bf-sec' id='bf-pricing'>
        <div className='bf-sec-head' data-reveal>
          <h2 className='bf-h2'>Usage-based. Never per seat.</h2>
          <p>
            Pay for the translation you actually ship. Start free, add the whole team, and upgrade
            when your traffic does.
          </p>
        </div>
        <div className='bf-pricing-grid'>
          <div className='bf-pcard bf-cell bf-rim'>
            <div className='bf-sheen' aria-hidden />
            <h3>Starter</h3>
            <div className='bf-amount'>
              <span className='bf-foil'>$0</span> <small>from — pay as you go</small>
            </div>
            <p className='bf-pdesc'>Everything you need to launch in every language.</p>
            <ul>
              <li>Unlimited projects</li>
              <li>Unlimited users</li>
              <li>Unlimited languages</li>
            </ul>
            <a className='bf-btn bf-btn-solid' href='#bf-hero'>
              <span className='bf-irid' aria-hidden />
              Get Started
            </a>
          </div>
          <div className='bf-pcard bf-cell bf-rim'>
            <div className='bf-sheen' aria-hidden />
            <h3>Enterprise</h3>
            <div className='bf-amount'>
              Custom <small>tailored to your scale</small>
            </div>
            <p className='bf-pdesc'>For teams shipping to the whole world.</p>
            <ul>
              <li>SSO</li>
              <li>SOC 2 Type II &amp; ISO 27001</li>
              <li>Forward-deployed engineers</li>
              <li>Slack support</li>
            </ul>
            <a className='bf-btn bf-btn-line' href='#bf-close'>
              Contact Us
            </a>
          </div>
        </div>
      </Cascade>

      <Cascade className='bf-sec bf-closing' id='bf-close'>
        <h2 data-reveal>
          Deploy today
          <br />
          in <span className='bf-foil'>every language</span>
        </h2>
        <p data-reveal>Talk to an engineer about implementation or get started for free</p>
        <div className='bf-hero-ctas' data-reveal>
          <a className='bf-btn bf-btn-solid' href='#bf-hero'>
            <span className='bf-irid' aria-hidden />
            Get a Demo
          </a>
          <a className='bf-btn bf-btn-line' href='#bf-pricing'>
            Sign Up
          </a>
        </div>
        {/* Not a picture in a frame: a horizon of dispersed light with no edge
            of its own. Two nested masks do the falloff — the outer ellipse
            drops the light off in every direction, the inner one carries the
            vertical fade — so the field never meets the footer at full
            luminance on a straight cut. */}
        <div className='bf-cta-band' aria-hidden>
          <div className='bf-cb-in'>
            <div className='bf-cb-fallback' />
            <PrismaticField
              className='bf-cb-canvas'
              preset='2'
              dpr={1}
              speed={0.42}
              params={{ exposureScale: 2650 }}
            />
          </div>
        </div>
      </Cascade>

      <footer className='bf-footer'>
        <div className='bf-foot-in'>
          <div className='bf-foot-grid'>
            <div className='bf-foot-brand'>
              <a className='bf-logo' href='#bf-hero'>
                <span className='bf-logomark'>
                  <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={1198} height={1198} />
                </span>
                General Translation
              </a>
              <p>Language infrastructure for the internet — for your next 1,000,000,000 users.</p>
              <p className='bf-compliance'>SOC 2 Type II · GDPR · ISO 27001</p>
            </div>
            <div className='bf-foot-col'>
              <h3>Product</h3>
              <a href='#bf-features'>Docs</a>
              <a href='#bf-pricing'>Pricing</a>
              <a href='#bf-features'>Locadex Agent</a>
              <a href='#bf-workspace'>Translation Editor</a>
            </div>
            <div className='bf-foot-col'>
              <h3>Company</h3>
              <a href='#bf-close'>Blog</a>
              <a href='#bf-close'>Careers</a>
              <a href='#bf-close'>Contact</a>
              <a href='#bf-close'>Supported Locales</a>
            </div>
            <div className='bf-foot-col'>
              <h3>Connect</h3>
              <a href='#bf-close'>GitHub</a>
              <a href='#bf-close'>𝕏</a>
              <a href='#bf-close'>Discord</a>
              <a href='#bf-close'>LinkedIn</a>
            </div>
          </div>
          <div className='bf-foot-base'>
            <span>© 2026 General Translation, Inc. All rights reserved.</span>
            <span>San Francisco</span>
          </div>
        </div>
      </footer>
    </>
  );
}
