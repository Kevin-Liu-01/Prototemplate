'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { ComponentType, CSSProperties } from 'react';

import {
  SiCreatereactapp,
  SiExpo,
  SiGatsby,
  SiMintlify,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiReactrouter,
  SiRedwoodjs,
  SiSanity,
  SiTanstack,
  SiVite,
} from '@icons-pack/react-simple-icons';

import { useQuietReveal } from './reveal';

type MarkProps = { className?: string; color?: string; size?: number; 'aria-hidden'?: boolean };

/** The real knockout React Native badge, mask-rendered in the row's own
    ink (the SDK-ledger metric) — never the bare atom, which is
    pixel-identical to the React row's mark at this size. */
function ReactNativeMark({ className }: MarkProps) {
  return (
    <i
      className={className ? `${className} is-rn` : 'is-rn'}
      style={{ '--mark': 'url(/logos/react-native-no-bg.svg)' } as CSSProperties}
      aria-hidden='true'
    />
  );
}

/* CONTENT LAW: the stack list is the live enterprise page's framework
   coverage — all fourteen marks, drawn with their real logos. The package
   each row maps to is the shipped one (stacks.ts, feature-inventory §33:
   gt-sanity Studio plugin, Locadex for Mintlify). Nothing invented. */
const GROUPS: readonly {
  label: string;
  count: string;
  stacks: readonly { name: string; pkg: string; Mark: ComponentType<MarkProps> }[];
}[] = [
  {
    label: 'web',
    count: '8 stacks',
    stacks: [
      { name: 'Next.js', pkg: 'gt-next', Mark: SiNextdotjs },
      { name: 'React', pkg: 'gt-react', Mark: SiReact },
      { name: 'Vite', pkg: 'gt-react', Mark: SiVite },
      { name: 'Gatsby', pkg: 'gt-react', Mark: SiGatsby },
      { name: 'React Router', pkg: 'gt-react', Mark: SiReactrouter },
      { name: 'Create React App', pkg: 'gt-react', Mark: SiCreatereactapp },
      { name: 'RedwoodJS', pkg: 'gt-react', Mark: SiRedwoodjs },
      { name: 'TanStack Start', pkg: 'gt-tanstack-start', Mark: SiTanstack },
    ],
  },
  {
    label: 'native',
    count: '2 stacks',
    stacks: [
      { name: 'React Native', pkg: 'gt-react-native', Mark: ReactNativeMark },
      { name: 'Expo', pkg: 'gt-react-native', Mark: SiExpo },
    ],
  },
  {
    label: 'server',
    count: '2 stacks',
    stacks: [
      { name: 'Node.js', pkg: 'gt-node', Mark: SiNodedotjs },
      { name: 'Python', pkg: 'gt-fastapi', Mark: SiPython },
    ],
  },
  {
    label: 'docs & cms',
    count: '2 stacks',
    stacks: [
      { name: 'Mintlify', pkg: 'locadex', Mark: SiMintlify },
      { name: 'Sanity', pkg: 'gt-sanity', Mark: SiSanity },
    ],
  },
] as const;

/**
 * Framework coverage as a coverage sheet, not a logo wall: one toolchain
 * node on the sheet's rail, the doubled thread dropping into four surface
 * columns — web, native, server, docs & CMS — and every stack the live
 * page lists filed as a row: the real mark, the name, and the first-party
 * package that serves it. Fourteen rows, all real. Static by design; the
 * sheet is the argument, so it reads the same in a still.
 */
export default function EnterpriseFrameworks() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='coverage' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Adapted to the tech stack your product already uses.</h2>
        <p data-reveal>
          Every framework on this sheet maps to a first-party package — the same toolchain
          whichever stack renders your product.
        </p>
      </div>

      <div className='sge-fw' data-reveal>
        <div className='sge-fw-rail' aria-hidden='true'>
          <span className='sge-fw-thread' />
          <span className='sge-fw-node'>
            <Image
              className='sge-fw-logo is-light'
              src='/brand/no-bg-gt-logo-light.png'
              alt=''
              width={22}
              height={22}
            />
            <Image
              className='sge-fw-logo is-dark'
              src='/brand/no-bg-gt-logo-dark.png'
              alt=''
              width={22}
              height={22}
            />
            <b>one toolchain</b>
          </span>
          <span className='sge-fw-thread' />
        </div>

        <div className='sge-fw-cols'>
          {GROUPS.map((group) => (
            <div className='sge-fw-col' key={group.label}>
              <span className='sge-fw-drop' aria-hidden='true' />
              <div className='sge-fw-colhead'>
                <b>{group.label}</b>
                <span>{group.count}</span>
              </div>
              <ul className='sge-fw-list'>
                {group.stacks.map((stack) => {
                  const Mark = stack.Mark;
                  return (
                    <li key={stack.name}>
                      <Mark className='sge-fw-mark' size={14} color='currentColor' aria-hidden />
                      <span>{stack.name}</span>
                      <code>{stack.pkg}</code>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className='sge-fw-foot'>
          <span>framework coverage</span>
          <code>14 stacks · 7 packages · 1 agent</code>
        </div>
      </div>
    </section>
  );
}
