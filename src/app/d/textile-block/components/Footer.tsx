import Image from 'next/image';
import type { ComponentType } from 'react';

import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import { FOOTER_COLUMNS, FOOTER_COMPLIANCE, FOOTER_COPYRIGHT, FOOTER_LEAD } from '../data';
import type { FooterMark } from '../data';
import { Block, Course } from './Wall';

/**
 * textile-block: the footer course.
 *
 * The last course of the wall: the brand block with both drawn GT marks
 * (CSS shows the one the theme calls for) and one sentence, four link
 * blocks, and the closing bar with the copyright and the compliance line.
 * Brand marks appear only where a cell names a tool.
 */

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

function LocadexMark({ className }: MarkProps) {
  return (
    <Image
      alt=''
      aria-hidden
      className={`${className ?? ''} tb-ldx-mark`}
      height={14}
      src='/brand/no-bg-locadex-logo-light.png'
      width={14}
    />
  );
}

const MARKS: Record<FooterMark, ComponentType<MarkProps>> = {
  locadex: LocadexMark,
  next: SiNextdotjs,
  react: SiReact,
  github: SiGithub,
  discord: SiDiscord,
};

export default function Footer() {
  return (
    <Course className='is-footer' label='Footer'>
      <Block className='tb-foot-brand' span={{ c: 4, r: 2, cMd: 8, rMd: 1, cSm: 6, rSm: 1 }}>
        <div className='tb-foot-marks'>
          <Image
            alt='General Translation'
            className='tb-foot-logo is-light'
            height={30}
            src='/brand/no-bg-gt-logo-light.png'
            width={30}
          />
          <Image alt='' className='tb-foot-logo is-dark' height={30} src='/brand/no-bg-gt-logo-dark.png' width={30} />
        </div>
        <p>{FOOTER_LEAD}</p>
      </Block>

      {FOOTER_COLUMNS.map((column) => (
        <Block className='tb-foot-col' key={column.title} span={{ c: 2, r: 2, cMd: 2, rMd: 2, cSm: 3, rSm: 2 }}>
          <h4>{column.title}</h4>
          <ul>
            {column.links.map((link) => {
              const Mark = link.mark ? MARKS[link.mark] : null;
              return (
                <li key={link.label}>
                  <a href={link.href}>
                    {Mark ? <Mark aria-hidden className='tb-foot-mark' color='currentColor' /> : null}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </Block>
      ))}

      <Block className='tb-foot-bar' span={{ c: 12, r: 1, cMd: 8, cSm: 6 }}>
        <span>{FOOTER_COPYRIGHT}</span>
        <span>{FOOTER_COMPLIANCE}</span>
      </Block>
    </Course>
  );
}
