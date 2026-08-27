import { SiGithub } from '@icons-pack/react-simple-icons';
import { GitBranch, Globe } from 'lucide-react';

/**
 * THE SHIPPED "HOW IT WORKS" BAND, reproduced.
 *
 * 1-1 with the `mintlify-flow` section of MintlifyPage.tsx: the section head
 * and its sub, then the three steps in order — 01 Connect your repo,
 * 02 Select languages, 03 Review and merge — each with the shipped mark and
 * the shipped sentence.
 */
export default function MintlifyFlow() {
  return (
    <section className='tc-sec mintlify-flow'>
      <div className='mintlify-section-head'>
        <h2>How it works</h2>
        <p>
          Add multilingual support to your Mintlify docs in three steps — no
          code changes required.
        </p>
      </div>

      <div className='mintlify-flow-diagram'>
        <article>
          <span className='mintlify-step-mark'>01</span>
          <SiGithub aria-hidden='true' />
          <h3>Connect your repo</h3>
          <p>
            Link your GitHub repository containing your Mintlify docs with one
            click.
          </p>
        </article>
        <article>
          <span className='mintlify-step-mark'>02</span>
          <Globe aria-hidden='true' />
          <h3>Select languages</h3>
          <p>
            Choose which languages you want to support. We handle the rest
            automatically.
          </p>
        </article>
        <article>
          <span className='mintlify-step-mark'>03</span>
          <GitBranch aria-hidden='true' />
          <h3>Review and merge</h3>
          <p>
            Locadex opens PRs with translations. Review the changes and merge
            when ready.
          </p>
        </article>
      </div>
    </section>
  );
}
