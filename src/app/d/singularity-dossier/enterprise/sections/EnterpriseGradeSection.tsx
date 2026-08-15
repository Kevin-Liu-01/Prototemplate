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

import CoverageRain from './CoverageRain';

const frameworkGroups = [
  {
    name: 'Web',
    frameworks: [
      { name: 'Next.js', packageName: 'gt-next', icon: SiNextdotjs },
      { name: 'React', packageName: 'gt-react', icon: SiReact },
      { name: 'Vite', packageName: 'gt-react', icon: SiVite },
      { name: 'Gatsby', packageName: 'gt-react', icon: SiGatsby },
      { name: 'React Router', packageName: 'gt-react', icon: SiReactrouter },
      {
        name: 'Create React App',
        packageName: 'gt-react',
        icon: SiCreatereactapp,
      },
      { name: 'RedwoodJS', packageName: 'gt-react', icon: SiRedwoodjs },
      {
        name: 'TanStack Start',
        packageName: 'gt-tanstack-start',
        icon: SiTanstack,
      },
    ],
  },
  {
    name: 'Native',
    frameworks: [
      { name: 'React Native', packageName: 'gt-react-native', icon: SiReact },
      { name: 'Expo', packageName: 'gt-react-native', icon: SiExpo },
    ],
  },
  {
    name: 'Server',
    frameworks: [
      { name: 'Python', packageName: 'gt-fastapi', icon: SiPython },
      { name: 'Node.js', packageName: 'gt-node', icon: SiNodedotjs },
    ],
  },
  {
    name: 'Docs & CMS',
    frameworks: [
      { name: 'Mintlify', packageName: 'locadex', icon: SiMintlify },
      { name: 'Sanity', packageName: 'gt-sanity', icon: SiSanity },
    ],
  },
];

export default function EnterpriseGradeSection() {
  const frameworks = frameworkGroups.flatMap((group) => group.frameworks);

  return (
    <section className='tc-sec enterprise-grade'>
      <div className='enterprise-frameworks'>
          <h2>Framework Coverage</h2>
          <p>Adapted to the tech stack your product already uses.</p>
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
        <CoverageRain />
        <div className='tcf-core'>
          <ul className='tcf-row'>
            {frameworks.map((framework) => {
              const Icon = framework.icon;
              return (
                <li key={framework.name}>
                  <Icon aria-hidden='true' />
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
