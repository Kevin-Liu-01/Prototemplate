'use client';

import { usePathname } from 'next/navigation';

import { useRef, useState } from 'react';
import type { ComponentType, FormEvent } from 'react';

import { SiDiscord, SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { CircleDot, Mail } from 'lucide-react';

import GlyphRain from '../sections/GlyphRain';
import { useQuietReveal } from '../sections/reveal';

/**
 * The contact bay — the same ink band the enterprise pages land on, kept as
 * its own composition: ambient glyphs rain through the dark, the channel
 * ledger holds the left column, and the form holds the right. The form is
 * field-for-field the one the live site renders at /contact (labels,
 * placeholders, terms line — ContactForm.tsx + contact/ContactPage.tsx);
 * the channels are the union the site's footer, nav, docs actions and
 * careers page publish today. The one honest difference: this design study
 * assembles the message and says plainly that nothing is sent from here.
 */

type FormState = {
  name: string;
  email: string;
  companyName: string;
  message: string;
};

const EMPTY: FormState = { name: '', email: '', companyName: '', message: '' };

type IconProps = {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

/** Neither icon set still ships a LinkedIn mark, so the glyph is inlined —
    the standard "in" path, drawn in currentColor like its siblings. */
function LinkedInMark({ className, size = 15 }: IconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill='currentColor'
      height={size}
      viewBox='0 0 24 24'
      width={size}
    >
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' />
    </svg>
  );
}

type Channel = {
  name: string;
  desc: string;
  addr: string;
  href: string;
  icon: ComponentType<IconProps>;
};

type ChannelGroup = { title: string; rows: readonly Channel[] };

/** Every row is a channel the current site links; none are invented here. */
const CHANNELS: readonly ChannelGroup[] = [
  {
    title: 'Community',
    rows: [
      {
        name: 'GitHub',
        desc: 'Open source libraries',
        addr: 'github.com/generaltranslation/gt',
        href: 'https://github.com/generaltranslation/gt',
        icon: SiGithub,
      },
      {
        name: 'Issues',
        desc: 'Report an issue on GitHub',
        addr: 'generaltranslation/gt/issues/new',
        href: 'https://github.com/generaltranslation/gt/issues/new',
        icon: CircleDot,
      },
      {
        name: 'Discord',
        desc: 'Join our developer community',
        addr: 'generaltranslation.com/discord',
        href: 'https://generaltranslation.com/discord',
        icon: SiDiscord,
      },
    ],
  },
  {
    title: 'Social',
    rows: [
      {
        name: 'X',
        desc: '@generaltxn',
        addr: 'x.com/generaltxn',
        href: 'https://x.com/generaltxn',
        icon: SiX,
      },
      {
        name: 'LinkedIn',
        desc: 'Company page',
        addr: 'linkedin.com/company/generaltranslation',
        href: 'https://www.linkedin.com/company/generaltranslation',
        icon: LinkedInMark,
      },
    ],
  },
  {
    title: 'Company',
    rows: [
      {
        name: 'Careers',
        desc: 'Join our growing team',
        addr: 'careers@generaltranslation.com',
        href: 'mailto:careers@generaltranslation.com',
        icon: Mail,
      },
    ],
  },
];

export default function ContactBay() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((s) => ({ ...s, [key]: value }));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // A design study never fakes a success state: submitting surfaces the
    // honest notice and points at the live form.
    e.preventDefault();
    setNoticed(true);
  }

  return (
    <section className='tc-band cp-band cpk-bay' id='form' ref={root} aria-label='Contact'>
      <GlyphRain className='cpk-rain' />
      <div className='cp-band-in cpk-in'>
        <div className='cpk-chan'>
          <h2 data-reveal>Or skip the form.</h2>
          <p data-reveal>Every channel the current site publishes, in one ledger.</p>

          <div className='cpk-chan-ledger'>
            {CHANNELS.map((group) => (
              <div className='cpk-chan-group' key={group.title}>
                <span className='cpk-chan-title' data-reveal>
                  {group.title}
                </span>
                {group.rows.map((row) => {
                  const Icon = row.icon;
                  const external = !row.href.startsWith('mailto:');
                  return (
                    <a
                      className='cpk-chanrow'
                      data-reveal
                      href={row.href}
                      key={row.name}
                      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      <Icon
                        aria-hidden
                        className='cpk-chan-glyph'
                        color='currentColor'
                        size={15}
                        strokeWidth={1.75}
                      />
                      <span className='cpk-chan-id'>
                        <b>{row.name}</b>
                        <span>{row.desc}</span>
                      </span>
                      <code className='cpk-chan-addr'>
                        {row.addr}
                        {external ? <span aria-hidden> &#8599;</span> : null}
                      </code>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <form className='cpk-form' data-reveal onSubmit={onSubmit}>
          <div className='cpk-form-pair'>
            <label className='cpk-field'>
              <span>Full Name</span>
              <input
                autoComplete='name'
                name='name'
                onChange={(e) => set('name')(e.target.value)}
                placeholder='Your name'
                required
                type='text'
                value={form.name}
              />
            </label>
            <label className='cpk-field'>
              <span>Email</span>
              <input
                autoComplete='email'
                name='email'
                onChange={(e) => set('email')(e.target.value)}
                placeholder='you@example.com'
                required
                type='email'
                value={form.email}
              />
            </label>
          </div>
          <label className='cpk-field'>
            <span>Company Name</span>
            <input
              autoComplete='organization'
              name='companyName'
              onChange={(e) => set('companyName')(e.target.value)}
              placeholder='Your company'
              required
              type='text'
              value={form.companyName}
            />
          </label>
          <label className='cpk-field'>
            <span>How can we help?</span>
            <textarea
              name='message'
              onChange={(e) => set('message')(e.target.value)}
              placeholder='Tell us what you need help with.'
              required
              rows={6}
              value={form.message}
            />
          </label>

          {noticed ? (
            <p className='cpk-notice' role='status'>
              Nothing was sent &mdash; this design study isn&rsquo;t wired to the API. The live
              form at{' '}
              <a href='https://generaltranslation.com/contact'>generaltranslation.com/contact</a>{' '}
              delivers to the team.
            </p>
          ) : null}

          <p className='cpk-terms'>
            By submitting you agree to the{' '}
            <a
              href={`${base}/legal/terms`}
              rel='noreferrer noopener'
              target='_blank'
            >
              Terms of Service
            </a>{' '}
            and acknowledge the{' '}
            <a
              href={`${base}/legal/privacy-policy`}
              rel='noreferrer noopener'
              target='_blank'
            >
              Privacy Policy
            </a>
            .
          </p>
          <button className='cpk-submit' type='submit'>
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
