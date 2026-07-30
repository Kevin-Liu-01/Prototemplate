/** Pricing teaser — the steel panel is the one metal surface outside the hero. */
export default function Pricing() {
  return (
    <section className='section' id='pricing' aria-label='Pricing'>
      <div className='sec-head'>
        <span className='sec-idx'>[06] PRICING //</span>
        <h2 className='sec-title slab' data-stamp>
          START FREE. UPGRADE ANYTIME.
        </h2>
        <p className='sec-sub' data-stamp>
          Usage-based, not seats. Full-stack localization across buildtime, runtime, and review.
        </p>
      </div>
      <div className='pricing-grid'>
        <div className='plan' data-stamp>
          <div className='p-name'>Starter</div>
          <div className='p-price'>
            from <b>$0</b> · pay-as-you-go
          </div>
          <ul>
            <li>Unlimited projects, unlimited users, unlimited languages</li>
            <li>Translation CDN + over-the-air updates</li>
            <li>Locadex agent workflows</li>
          </ul>
          <a className='solid' href='#signin'>
            Get Started
          </a>
        </div>
        <div className='plan steel' data-stamp>
          <div className='p-name'>Enterprise</div>
          <div className='p-price'>
            <b>Custom</b> pricing
          </div>
          <ul>
            <li>SSO · SOC 2 Type II &amp; ISO 27001</li>
            <li>Forward-deployed engineers</li>
            <li>Dedicated Slack support</li>
          </ul>
          <a className='solid' href='#contact'>
            Contact Us
          </a>
        </div>
      </div>
      <p className='pricing-note'>USAGE-BASED PRICING → /PRICING/USAGE</p>
    </section>
  );
}
