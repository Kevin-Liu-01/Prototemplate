import type { SVGProps } from 'react';

/* The landing's share icons, trimmed to the kinds the article's share
   row uses. Icons taken from: https://simpleicons.org/ */

const components = {
  linkedin: Linkedin,
  x: X,
};

type SocialIconProps = {
  kind: keyof typeof components;
  href: string | undefined;
  /** Accessible name for the link. */
  label: string;
};

const SocialIcon = ({ kind, href, label }: SocialIconProps) => {
  if (!href) return null;

  const SocialSvg = components[kind];

  return (
    <a
      className='transition'
      target='_blank'
      rel='noopener noreferrer'
      href={href}
      aria-label={label}
    >
      <SocialSvg className='fill-current' aria-hidden='true' />
    </a>
  );
};

export default SocialIcon;

export function Linkedin(svgProps: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...svgProps}>
      <title>Linkedin</title>
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'></path>
    </svg>
  );
}

export function X(svgProps: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...svgProps}>
      <title>X</title>
      <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' />
    </svg>
  );
}
