'use client';

import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/* CONTENT LAW (docs/research/enterprise-live-content.md): the five client
   expansion stories below are VERBATIM from the live enterprise page, and
   the two statements are the ONLY testimonials permitted anywhere on these
   routes — Lee Robinson and Andrew Milich, word for word, via X. Never add
   a quote, a customer, or a number that is not in that file. */

const STORIES: readonly {
  name: string;
  mark: string;
  line: string;
  axis: string;
}[] = [
  {
    name: 'Ramp',
    mark: 'is-ramp',
    line: 'Helped Ramp expand its AI finance platform into European markets',
    axis: 'markets · European',
  },
  {
    name: 'Cursor',
    mark: 'is-cursor',
    line: 'Worked with Cursor to internationalize their entire developer experience',
    axis: 'surface · developer experience',
  },
  {
    name: 'Profound',
    mark: 'is-profound',
    line: 'Translated Profound’s platform, docs, and education sites into 46 languages',
    axis: 'languages · 46',
  },
  {
    name: 'Partiful',
    mark: 'is-partiful',
    line: 'Localized Partiful’s event platform across web, iOS, and Android',
    axis: 'platforms · web / iOS / Android',
  },
  {
    name: 'Mintlify',
    mark: 'is-mintlify',
    line: 'Helped Mintlify offer instant documentation translation to enterprise customers',
    axis: 'docs · enterprise customers',
  },
] as const;

const QUOTES: readonly {
  text: string;
  who: string;
  title: string;
  via: string;
}[] = [
  {
    text: 'Kudos to General Translation for helping with the localization efforts (great team)',
    who: 'Lee Robinson',
    title: 'VP of Developer Experience, Cursor',
    via: 'via X',
  },
  {
    text: 'General Translation is an incredible product, we are users at @cursor_ai',
    who: 'Andrew Milich',
    title: 'Head of Engineering, Cursor',
    via: 'via X',
  },
] as const;

/**
 * The record — proven expertise, filed as a ruled expansion ledger: five
 * engagements, each row the real client mark, the live page's claim word
 * for word, and the axis the engagement expanded (markets, languages,
 * platforms) in the ledger's mono. Below the ledger, the only statements
 * on the record — both real, both via X — set as a ruled pair.
 */
export default function EnterpriseTestimony() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='record' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Trusted by the world&rsquo;s best engineering teams.</h2>
        <p data-reveal>
          Every company&rsquo;s localization needs are different. General Translation provides
          full-stack localization engineers who apply automation, design custom workflows, and
          carry launches through production.
        </p>
      </div>

      <div className='sge-stories' data-reveal>
        <div className='sge-stories-head' aria-hidden='true'>
          <span>client</span>
          <span>engagement</span>
          <span className='sge-story-axis'>expansion</span>
        </div>
        {STORIES.map((story) => (
          <div className='sge-srow' key={story.name}>
            <span className={`sge-story-wm ${story.mark}`} role='img' aria-label={story.name} />
            <p>{story.line}</p>
            <span className='sge-story-axis'>{story.axis}</span>
          </div>
        ))}
        <div className='sge-stories-foot'>
          <span>proven expertise · five engagements on the record</span>
          <a href='#contact'>Talk to us</a>
        </div>
      </div>

      <div className='sge-plates-duo'>
        {QUOTES.map((quote) => (
          <figure className='sge-plate' data-reveal key={quote.who}>
            <div className='sge-plate-rule'>
              <span>On the record</span>
              <i>{quote.via}</i>
            </div>
            <blockquote>
              <p>{quote.text}</p>
            </blockquote>
            <figcaption>
              <b>{quote.who}</b>
              <span>{quote.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
