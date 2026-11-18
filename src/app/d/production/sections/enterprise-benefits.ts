import { PencilSquareIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { ComponentType, SVGProps } from 'react';

/**
 * The three enterprise benefits the pricing card and the enterprise
 * contact form share: gt-cloud apps/landing/src/components/pages/
 * enterprise/useEnterpriseBenefits.ts (#5977), as English strings.
 */
export const ENTERPRISE_BENEFITS: readonly {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}[] = [
  {
    id: 'engineers',
    icon: UsersIcon,
    title: 'Dedicated engineers',
    description: 'Forward-deployed engineers to build any workflow for your use case.',
  },
  {
    id: 'review',
    icon: PencilSquareIcon,
    title: 'Human review',
    description: 'Professional linguists to continually edit and review translations.',
  },
  {
    id: 'security',
    icon: ShieldCheckIcon,
    title: 'Security and governance',
    description: 'SSO, RBAC with custom permissions, SOC 2 and ISO 27001 certificates',
  },
];
