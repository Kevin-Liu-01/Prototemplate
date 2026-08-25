import {
  SiExpo,
  SiGatsby,
  SiGoogledrive,
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

import type { ComponentType } from 'react';

import EnterpriseCoverageRain from './EnterpriseCoverageRain';

/**
 * The shipped EnterpriseGradeSection
 * (services-landing/EnterpriseGradeSection.tsx), unchanged but for gt-next.
 *
 * Head, one line, then the coverage stage: all fourteen framework marks in
 * two stacked rows with the ink rain running above and below — names and
 * package names surface on hover. The roster below is the shipped array,
 * same entries, same order, same package names.
 */

type MarkProps = { 'aria-hidden'?: boolean };

const FRAMEWORKS: readonly {
  name: string;
  packageName: string;
  icon: ComponentType<MarkProps>;
}[] = [
  { name: 'Next.js', packageName: 'gt-next', icon: SiNextdotjs },
  { name: 'React', packageName: 'gt-react', icon: SiReact },
  { name: 'Vite', packageName: 'gt-react', icon: SiVite },
  { name: 'Gatsby', packageName: 'gt-react', icon: SiGatsby },
  { name: 'React Router', packageName: 'gt-react', icon: SiReactrouter },
  { name: 'Google Drive', packageName: 'locadex', icon: SiGoogledrive },
  { name: 'RedwoodJS', packageName: 'gt-react', icon: SiRedwoodjs },
  {
    name: 'TanStack Start',
    packageName: 'gt-tanstack-start',
    icon: SiTanstack,
  },
  { name: 'React Native', packageName: 'gt-react-native', icon: SiReact },
  { name: 'Expo', packageName: 'gt-react-native', icon: SiExpo },
  { name: 'Python', packageName: 'gt-fastapi', icon: SiPython },
  { name: 'Node.js', packageName: 'gt-node', icon: SiNodedotjs },
  { name: 'Mintlify', packageName: 'locadex', icon: SiMintlify },
  { name: 'Sanity', packageName: 'gt-sanity', icon: SiSanity },
];

export default function EnterpriseGrade() {
  return (
    <section className='tc-sec enterprise-grade'>
      <div className='enterprise-frameworks'>
        <h2>Frameworks and Integrations</h2>
        <p>Built for the tech stack your company already uses.</p>
        {/* four framework marks under the dither screen, stacked as the
            head's right seal */}
        <span className='tcf-seal' aria-hidden='true'>
          <i className='tcf-seal-icon'>
            <SiNextdotjs />
          </i>
          <i className='tcf-seal-icon'>
            <SiReact />
          </i>
          <i className='tcf-seal-icon'>
            <SiPython />
          </i>
          <i className='tcf-seal-icon'>
            <SiExpo />
          </i>
        </span>
      </div>

      {/* the coverage stage: every framework mark in two stacked rows,
          the ink rain running above and below — names surface on hover */}
      <div className='tcf-stage'>
        <EnterpriseCoverageRain />
        <div className='tcf-core'>
          <ul className='tcf-row'>
            {FRAMEWORKS.map((framework) => {
              const Icon = framework.icon;
              return (
                <li key={framework.name}>
                  <Icon aria-hidden />
                  <span>{framework.name}</span>
                  <code>{framework.packageName}</code>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
