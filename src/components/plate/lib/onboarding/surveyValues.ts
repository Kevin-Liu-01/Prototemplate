// The survey step's answers and their storage form. Kept free of React so
// the gallery's fixtures and the client step share one encoding of the
// referring source and one rule for where a returning user's survey opens.
// Copied from the dashboard's src/lib/onboarding/surveyValues.ts; the user
// row type and the action's payload type are restated here instead of
// imported from the database client and the server action.

/** The "How did you find us" value that reveals the AI tool question. */
export const AI_TOOLS_REFERRAL_VALUE = 'llms';

// A referral through an AI tool is stored as one string, `llm-<tool>`, in
// `referring_source`; the Slack, Attio and admin readers take it as is.
const AI_TOOL_SOURCE_PREFIX = 'llm-';

// The survey opens its rows one after the other as they are answered: the
// website first, then company size, then the source (with the AI tool
// beside it), then the frameworks with the Submit. `currentSubstep` is the
// highest row opened, counted past the website; answers raise it and
// nothing lowers it, so a changed answer never hides a later row. The last
// value shows every row.
export const LAST_SURVEY_SUBSTEP = 3;

/** The answers as the step edits them: the AI tool is its own field. */
export type SurveyValues = {
  companyWebsite: string;
  companySize: string;
  hearAboutUs: string;
  aiTool: string;
  frameworks: string[];
  currentSubstep: number;
};

export const EMPTY_SURVEY_VALUES: SurveyValues = {
  companyWebsite: '',
  companySize: '',
  hearAboutUs: '',
  aiTool: '',
  frameworks: [],
  currentSubstep: 0,
};

/**
 * The survey action's data: the dashboard derives it from
 * submitSurveyAction's parameter; the port states it, and lib/actions.ts's
 * stub takes the same shape.
 */
export type SurveyPayload = {
  companyWebsite?: string;
  companySize?: string;
  hearAboutUs?: string;
  frameworks?: string[];
};

/**
 * The survey's columns on the user row, as the profile read returns them.
 * `frameworks` is a JSON column; the step stores a string array and reads
 * any other shape as no answer.
 */
export type SurveyProfile = {
  company_website: string | null;
  company_size: string | null;
  referring_source: string | null;
  frameworks: string[] | string | number | boolean | object | null;
};

/**
 * Splits a stored referring source into the step's two fields: `llm-Gemini`
 * becomes the AI tools source with `Gemini` as the tool; any other value is
 * the source itself with no tool.
 */
function splitReferringSource(source: string | null): {
  hearAboutUs: string;
  aiTool: string;
} {
  if (!source) return { hearAboutUs: '', aiTool: '' };
  if (source.startsWith(AI_TOOL_SOURCE_PREFIX)) {
    return {
      hearAboutUs: AI_TOOLS_REFERRAL_VALUE,
      aiTool: source.slice(AI_TOOL_SOURCE_PREFIX.length),
    };
  }
  return { hearAboutUs: source, aiTool: '' };
}

/**
 * The stored referring source for a set of answers: `llm-<tool>` when the
 * source is AI tools and a tool is named, else the source as chosen.
 */
export function referringSourceFrom(values: SurveyValues): string {
  return values.hearAboutUs === AI_TOOLS_REFERRAL_VALUE && values.aiTool
    ? `${AI_TOOL_SOURCE_PREFIX}${values.aiTool}`
    : values.hearAboutUs;
}

/**
 * Reads the step's answers back out of the user row; null columns read as
 * empty. A user with any answer on file opens on the last substep, so every
 * row is shown and prefilled instead of opening again one at a time.
 */
export function surveyValuesFromProfile(
  profile: SurveyProfile | null | undefined
): SurveyValues {
  if (!profile) return EMPTY_SURVEY_VALUES;
  const frameworks = Array.isArray(profile.frameworks)
    ? profile.frameworks.filter(
        (framework): framework is string => typeof framework === 'string'
      )
    : [];
  const companyWebsite = profile.company_website ?? '';
  const companySize = profile.company_size ?? '';
  const source = splitReferringSource(profile.referring_source);
  const hasAnswer =
    companyWebsite !== '' ||
    companySize !== '' ||
    source.hearAboutUs !== '' ||
    frameworks.length > 0;
  return {
    companyWebsite,
    companySize,
    ...source,
    frameworks,
    currentSubstep: hasAnswer ? LAST_SURVEY_SUBSTEP : 0,
  };
}

/**
 * The action's data for a set of answers. Empty answers are left out so the
 * action does not overwrite a stored value with an empty string. Returns null
 * when there is nothing to send.
 */
export function surveyPayloadFrom(values: SurveyValues): SurveyPayload | null {
  const website = values.companyWebsite.trim();
  const referringSource = referringSourceFrom(values);
  if (
    !website &&
    !values.companySize &&
    !referringSource &&
    values.frameworks.length === 0
  ) {
    return null;
  }
  return {
    companyWebsite: website || undefined,
    companySize: values.companySize || undefined,
    hearAboutUs: referringSource || undefined,
    frameworks: values.frameworks.length ? values.frameworks : undefined,
  };
}
