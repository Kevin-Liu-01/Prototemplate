// Option lists for the survey step. The dashboard writes the labels as
// gt-next msg() literals and renders them through useMessages(); the port
// has no message catalog, so the labels are the English strings and the
// step renders them as they are. The AI tools carry their brand marks
// (thesvg.org path data, under the plate's icons) and the frameworks
// simple-icons marks or Heroicons glyphs.

import type { ComponentType } from 'react';
import { CodeBracketIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import {
  SiMarkdown,
  SiMintlify,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiSanity,
  SiTanstack,
} from '@icons-pack/react-simple-icons';

import ClaudeLogo from '@/components/plate/icons/ClaudeLogo';
import DeepSeekLogo from '@/components/plate/icons/DeepSeekLogo';
import GeminiLogo from '@/components/plate/icons/GeminiLogo';
import GrokLogo from '@/components/plate/icons/GrokLogo';
import MistralLogo from '@/components/plate/icons/MistralLogo';
import OpenAILogo from '@/components/plate/icons/OpenAILogo';
import {
  COMPANY_SIZES,
  type CompanySize,
} from '@/components/plate/lib/onboarding/companySize';
import { AI_TOOLS_REFERRAL_VALUE } from '@/components/plate/lib/onboarding/surveyValues';

type SurveyOption = {
  value: string;
  label: string;
};

// A mark drawn at a class-set size: a brand mark or a Heroicons glyph.
type MarkComponent = ComponentType<{
  className?: string;
  'aria-hidden'?: boolean | 'true';
}>;

type FrameworkOption = SurveyOption & {
  // A brand mark from simple-icons, or a Heroicons solid glyph for the
  // values that have no mark (JSON, Other).
  icon: MarkComponent;
};

type AiToolOption = SurveyOption & {
  // The tool's brand mark; Other has none.
  icon?: MarkComponent;
};

// Keyed by CompanySize so the type checker requires a label for every size
// in the settings list.
const COMPANY_SIZE_LABELS = {
  'Just Me': 'Just Me',
  '2-10': '2-10',
  '11-50': '11-50',
  '51-200': '51-200',
  '201-500': '201-500',
  '500+': '500+',
} satisfies Record<CompanySize, string>;

export const COMPANY_SIZE_OPTIONS: SurveyOption[] = COMPANY_SIZES.map(
  (value) => ({ value, label: COMPANY_SIZE_LABELS[value] })
);

// The stored values are the English labels except for AI tools, whose value
// is the AI_TOOLS_REFERRAL_VALUE constant the readers match on.
export const REFERRAL_SOURCES: SurveyOption[] = [
  { value: 'Web Search', label: 'Web Search' },
  { value: AI_TOOLS_REFERRAL_VALUE, label: 'AI Tools' },
  { value: 'Twitter / X', label: 'Twitter / X' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'GitHub', label: 'GitHub' },
  { value: 'Reddit', label: 'Reddit' },
  { value: 'Friend / Colleague', label: 'Friend / Colleague' },
  { value: 'Developer Community', label: 'Developer Community' },
  { value: 'Blog', label: 'Blog' },
  { value: 'Podcast', label: 'Podcast' },
  { value: 'Other', label: 'Other' },
];

export const AI_TOOLS: AiToolOption[] = [
  { value: 'ChatGPT', label: 'ChatGPT', icon: OpenAILogo },
  { value: 'Gemini', label: 'Gemini', icon: GeminiLogo },
  { value: 'Claude', label: 'Claude', icon: ClaudeLogo },
  { value: 'Grok', label: 'Grok', icon: GrokLogo },
  { value: 'DeepSeek', label: 'DeepSeek', icon: DeepSeekLogo },
  { value: 'Mistral', label: 'Mistral', icon: MistralLogo },
  { value: 'Other', label: 'Other' },
];

export const FRAMEWORKS: FrameworkOption[] = [
  { value: 'Next.js', label: 'Next.js', icon: SiNextdotjs },
  { value: 'React', label: 'React', icon: SiReact },
  { value: 'React Native', label: 'React Native', icon: SiReact },
  { value: 'TanStack Start', label: 'TanStack Start', icon: SiTanstack },
  { value: 'Node.js', label: 'Node.js', icon: SiNodedotjs },
  { value: 'Python', label: 'Python', icon: SiPython },
  { value: 'Sanity', label: 'Sanity', icon: SiSanity },
  { value: 'Mintlify', label: 'Mintlify', icon: SiMintlify },
  { value: 'JSON', label: 'JSON', icon: DocumentTextIcon },
  { value: 'Markdown', label: 'Markdown', icon: SiMarkdown },
  { value: 'Other', label: 'Other', icon: CodeBracketIcon },
];
