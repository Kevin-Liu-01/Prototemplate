/**
 * THE SHIPPED SETUP BAND, reproduced.
 *
 * 1-1 with the `mintlify-setup` section of MintlifyPage.tsx: the sticky
 * section head — "Set up Mintlify translations in 5 minutes" — and the
 * four-step ordered ledger, numbered 01 to 04, in the shipped order and
 * wording.
 */
export default function MintlifySetup() {
  return (
    <section className='tc-sec mintlify-setup'>
      <div className='mintlify-section-head'>
        <h2>Set up Mintlify translations in 5 minutes</h2>
        <p>
          No configuration files. No CLI tools. Connect your repo and Locadex
          handles full-stack internationalization.
        </p>
      </div>

      <ol className='mintlify-setup-ledger'>
        <li>
          <span>01</span>
          <h3>Sign in to General Translation</h3>
          <p>
            Create a free account on the General Translation dashboard and
            navigate to the Locadex section.
          </p>
        </li>
        <li>
          <span>02</span>
          <h3>Authorize GitHub and select your repository</h3>
          <p>
            Install the General Translation GitHub App and choose the repository
            that contains your Mintlify documentation.
          </p>
        </li>
        <li>
          <span>03</span>
          <h3>Choose your target languages</h3>
          <p>
            Select the languages you want your documentation available in and
            confirm your default locale.
          </p>
        </li>
        <li>
          <span>04</span>
          <h3>Review and merge the pull request</h3>
          <p>
            Locadex creates a pull request on your main branch with the
            translated files and updated Mintlify configuration. Review the
            changes and merge when ready.
          </p>
        </li>
      </ol>
    </section>
  );
}
