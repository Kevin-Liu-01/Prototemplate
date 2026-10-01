'use client';

import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';

import FieldPicture from '@/components/plate/brand/FieldPicture';
import { useFlow } from '@/components/plate/gallery/flow';
import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { submitSurveyAction } from '@/components/plate/lib/actions';
import {
  isPlaceholderOrInternalDomain,
  isUnusableCompanyWebsiteDomain,
} from '@/components/plate/lib/onboarding/isPlaceholderDomain';
import {
  AI_TOOLS_REFERRAL_VALUE,
  LAST_SURVEY_SUBSTEP,
  surveyPayloadFrom,
  type SurveyValues,
} from '@/components/plate/lib/onboarding/surveyValues';
import { cn } from '@/components/plate/lib/utils';
import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Input } from '@/components/plate/ui/input';
import { Label } from '@/components/plate/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/plate/ui/select';

import {
  AI_TOOLS,
  COMPANY_SIZE_OPTIONS,
  FRAMEWORKS,
  REFERRAL_SOURCES,
} from './surveyConstants';

type WebsiteProblem = 'missing' | 'blocked' | 'invalid';

type SurveyStepProps = {
  values: SurveyValues;
  userEmail: string | null;
  // Weak-signal signups (non-business or disposable email) must give a
  // usable company website before leaving the survey.
  requireCompanyWebsite: boolean;
  // Takes the next answers or an updater over the current ones. The
  // website's reveal fires from a timer after later edits may have landed,
  // so it reads the answers as they stand then instead of a closure's.
  onValuesChange: Dispatch<SetStateAction<SurveyValues>>;
  onNext: () => void;
};

// The gallery state a saved survey leads to.
const NEXT_STATE = 'create-org';

// The rows after the website in reveal order, as the currentSubstep that
// shows each; answering a row raises the values to the next one.
const SIZE_ROW = 1;
const SOURCE_ROW = 2;
const FRAMEWORKS_ROW = LAST_SURVEY_SUBSTEP;

// The pause after the last keystroke before the website is checked for the
// size row's reveal.
const WEBSITE_SETTLE_MS = 250;

const WEBSITE_DOMAIN =
  /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// h-10 px-3 so the six sizes fit one 464px row, the eleven frameworks fit
// three, and the open step ends above a 900px fold; the weight is the same
// in both states so a choice does not change the row's widths. Under md
// the buttons are 44px tall, the phone's tap target.
const CHOICE_CLASS = 'h-10 px-3 font-normal max-md:h-11';
const CHOICE_OUTLINE_CLASS = `${CHOICE_CLASS} bg-transparent dark:bg-transparent`;

/** The domain typed into the website field, without a scheme or a path. */
function websiteDomainOf(website: string): string {
  return website
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim();
}

/**
 * Step 1. The company website is always shown; the rows after it open as
 * the row before is answered, with no Next: the company size row once the
 * website holds a usable domain (checked WEBSITE_SETTLE_MS after the last
 * keystroke, or at once on blur or Enter), the source row once a size is
 * chosen, the frameworks row with the Submit once a source is chosen.
 * Leaving an optional website empty, by blur or Enter, opens the size row
 * too. The AI tool select opens beside the source under the AI tools
 * source and stays optional, so the frameworks do not wait for it. Under
 * the open rows, until the last one is open, a "Skip the rest" link opens
 * the frameworks row and the Submit at once, so the size and the source
 * stay optional. `currentSubstep` is the highest row opened and never
 * falls, so a changed answer hides nothing. The website's error shows on
 * blur of a non-empty value or on Submit, not while typing, and a required
 * website that is missing still stops the Submit. Submit saves whatever
 * was answered through the survey action's stub, then moves the gallery
 * to the organization step. The wizard owns the values, so a return to
 * this step shows them, and a user with answers on file opens with every
 * row.
 */
export default function SurveyStep({
  values,
  userEmail,
  requireCompanyWebsite,
  onValuesChange,
  onNext,
}: SurveyStepProps) {
  const gt = useGT();
  const flow = useFlow();
  const [saving, setSaving] = useState(false);
  const [websiteError, setWebsiteError] = useState<WebsiteProblem | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // The rows on the page at mount take no fade; only rows opened after it.
  const [mountSubstep] = useState(values.currentSubstep);
  const websiteTimer = useRef<number | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useMountEffect(() => () => {
    if (websiteTimer.current !== null) {
      window.clearTimeout(websiteTimer.current);
    }
  });

  const {
    companyWebsite,
    companySize,
    hearAboutUs,
    aiTool,
    frameworks,
    currentSubstep,
  } = values;
  const showAiTool = hearAboutUs === AI_TOOLS_REFERRAL_VALUE;
  const open = currentSubstep >= FRAMEWORKS_ROW;

  function rowClass(row: number, base: string): string {
    return cn(base, row > mountSubstep && 'plate-row-in');
  }

  function update(patch: Partial<SurveyValues>) {
    onValuesChange((prev) => ({ ...prev, ...patch }));
  }

  // Applies `patch` and opens the row at `reveals` when it is not open yet.
  function answer(patch: Partial<SurveyValues>, reveals: number) {
    onValuesChange((prev) => ({
      ...prev,
      ...patch,
      currentSubstep: Math.max(prev.currentSubstep, reveals),
    }));
    if (reveals === FRAMEWORKS_ROW && currentSubstep < FRAMEWORKS_ROW) {
      // The Submit arrives with the frameworks; on a viewport shorter than
      // the open step it would land under the fold. Runs on the next frame,
      // after the commit; nearest keeps the page still when it already fits.
      requestAnimationFrame(() => {
        actionsRef.current?.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  function toggleFramework(value: string) {
    update({
      frameworks: frameworks.includes(value)
        ? frameworks.filter((framework) => framework !== value)
        : [...frameworks, value],
    });
  }

  // The quiet exit: opens the frameworks row and the Submit without a size
  // or a source, through the same monotonic step an answer takes.
  function skipTheRest() {
    answer({}, FRAMEWORKS_ROW);
  }

  // Where the dashboard's wizard routes to the next step, the gallery
  // moves to the organization state.
  function next() {
    onNext();
    flow.go(NEXT_STATE);
  }

  // Rejects placeholder and internal domains, and when the website is
  // required (weak-signal signups) free consumer-email domains too. A user
  // whose verified email domain matches the website owns it, so that passes.
  function validateWebsite(website: string): WebsiteProblem | null {
    const websiteDomain = websiteDomainOf(website);
    if (websiteDomain === '') {
      return requireCompanyWebsite ? 'missing' : null;
    }
    if (!WEBSITE_DOMAIN.test(websiteDomain)) return 'invalid';
    const emailDomain = userEmail?.split('@')[1];
    const blocked = requireCompanyWebsite
      ? isUnusableCompanyWebsiteDomain(websiteDomain, emailDomain)
      : isPlaceholderOrInternalDomain(websiteDomain, emailDomain);
    return blocked ? 'blocked' : null;
  }

  // An empty website passes validation when it is optional, but typing
  // opens nothing until a domain is there; leaving the field empty on
  // purpose opens the size row on blur or Enter (see continueFromWebsite),
  // the allowance main's Next gave an optional website.
  function holdsUsableWebsite(website: string): boolean {
    return websiteDomainOf(website) !== '' && validateWebsite(website) === null;
  }

  // Whether leaving the website moves on to the size row: a usable domain,
  // or an optional field left empty. A non-empty value that fails stays
  // put; its error is the caller's to show.
  function websiteContinues(website: string): boolean {
    return websiteDomainOf(website) === ''
      ? !requireCompanyWebsite
      : holdsUsableWebsite(website);
  }

  function clearWebsiteTimer() {
    if (websiteTimer.current !== null) {
      window.clearTimeout(websiteTimer.current);
      websiteTimer.current = null;
    }
  }

  // The typing debounce's reveal: only a usable domain opens the size row.
  function revealSizeRow() {
    onValuesChange((prev) =>
      prev.currentSubstep < SIZE_ROW && holdsUsableWebsite(prev.companyWebsite)
        ? { ...prev, currentSubstep: SIZE_ROW }
        : prev
    );
  }

  // Leaving the website, by blur or by Enter before the Submit exists,
  // settles it at once: the pending debounce is cleared and the size row
  // opens when websiteContinues allows it.
  function continueFromWebsite() {
    clearWebsiteTimer();
    onValuesChange((prev) =>
      prev.currentSubstep < SIZE_ROW && websiteContinues(prev.companyWebsite)
        ? { ...prev, currentSubstep: SIZE_ROW }
        : prev
    );
  }

  function handleWebsiteChange(website: string) {
    setWebsiteError(null);
    update({ companyWebsite: website });
    clearWebsiteTimer();
    websiteTimer.current = window.setTimeout(() => {
      websiteTimer.current = null;
      revealSizeRow();
    }, WEBSITE_SETTLE_MS);
  }

  function handleWebsiteBlur() {
    continueFromWebsite();
    if (websiteDomainOf(companyWebsite) !== '') {
      setWebsiteError(validateWebsite(companyWebsite));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const websiteProblem = validateWebsite(companyWebsite);
    setWebsiteError(websiteProblem);
    if (websiteProblem) return;

    if (!open) {
      // Enter in the website field before the Submit exists: the browser
      // submits a form with one text field on its own. The press leaves
      // the website the way blur does and saves nothing; the value is
      // known usable, or empty and optional, by this line.
      continueFromWebsite();
      return;
    }

    const payload = surveyPayloadFrom(values);
    if (!payload) {
      next();
      return;
    }

    setSaving(true);
    try {
      const result = await submitSurveyAction(payload);
      if (!result.success) {
        setSubmitError(result.error ?? gt('Something went wrong'));
        return;
      }
      next();
    } catch {
      // A rejected action (network drop, server crash) reads as a failure
      // the user can retry; the answers stay in place.
      setSubmitError(gt('Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    // The gaps are the frame's height tokens (plate.css .plate-root): 40px
    // between the heading, the questions and the Submit and 16px between
    // questions, so the open step with every question shown ends above a
    // 900px fold, foot included; under 880px tall they compress to 24 and
    // 12, and the same step ends above an 814px fold.
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-(--plate-section-gap)'
    >
      <FieldPicture name='earth' />
      <h1 className='typo-page-heading'>
        <T>Tell us about yourself</T>
      </h1>

      <div className='flex flex-col gap-(--plate-question-gap)'>
        <div className='flex flex-col gap-2.5'>
          <Label htmlFor='company-website'>
            <T>Company website</T>
            {requireCompanyWebsite && (
              <span className='text-destructive' aria-hidden='true'>
                *
              </span>
            )}
          </Label>
          <Input
            id='company-website'
            type='text'
            inputMode='url'
            autoComplete='url'
            autoCapitalize='none'
            autoCorrect='off'
            spellCheck={false}
            value={companyWebsite}
            onChange={(e) => handleWebsiteChange(e.target.value)}
            onBlur={handleWebsiteBlur}
            placeholder={gt('mycompany.com')}
            className='h-11'
            required={requireCompanyWebsite}
            aria-invalid={websiteError ? true : undefined}
            aria-describedby={
              websiteError ? 'company-website-error' : undefined
            }
          />
          {websiteError === 'missing' ? (
            <p id='company-website-error' className='typo-error'>
              <T>Please enter your company website to continue</T>
            </p>
          ) : websiteError === 'blocked' ? (
            <p id='company-website-error' className='typo-error'>
              <T>Please enter your real company website</T>
            </p>
          ) : websiteError === 'invalid' ? (
            <p id='company-website-error' className='typo-error'>
              <T>Please enter a valid website</T>
            </p>
          ) : null}
        </div>

        {currentSubstep >= SIZE_ROW && (
          <div
            className={rowClass(SIZE_ROW, 'flex flex-col gap-2.5')}
            role='group'
            aria-labelledby='company-size-label'
          >
            <Label id='company-size-label'>
              <T>Company size</T>
            </Label>
            <div
              className='flex flex-wrap gap-2'
              data-testid='survey-company-size'
            >
              {COMPANY_SIZE_OPTIONS.map((size) => {
                const pressed = companySize === size.value;
                return (
                  <Button
                    key={size.value}
                    type='button'
                    variant={pressed ? 'default' : 'outline'}
                    className={pressed ? CHOICE_CLASS : CHOICE_OUTLINE_CLASS}
                    aria-pressed={pressed}
                    onClick={() =>
                      answer({ companySize: size.value }, SOURCE_ROW)
                    }
                  >
                    {size.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {currentSubstep >= SOURCE_ROW && (
          // The AI tool question opens as a second column beside the source
          // (stacked under it below sm) instead of a row under it, so the
          // step with every question open still ends above the fold.
          <div
            className={rowClass(
              SOURCE_ROW,
              showAiTool
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-3'
                : 'grid grid-cols-1'
            )}
            data-testid='survey-source'
          >
            <div className='flex flex-col gap-2.5'>
              <Label htmlFor='hear-about-us'>
                <T>How did you find us?</T>
              </Label>
              <Select
                value={hearAboutUs}
                onValueChange={(value) =>
                  answer(
                    {
                      hearAboutUs: value,
                      // The tool only means something under the AI tools
                      // source.
                      aiTool: value === AI_TOOLS_REFERRAL_VALUE ? aiTool : '',
                    },
                    FRAMEWORKS_ROW
                  )
                }
              >
                <SelectTrigger id='hear-about-us' className='h-11'>
                  <SelectValue placeholder={gt('Select an option')} />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showAiTool && (
              <div
                className='flex flex-col gap-2.5'
                data-testid='survey-ai-tool'
              >
                <Label htmlFor='ai-tool'>
                  <T>Which AI tool?</T>
                </Label>
                <Select
                  value={aiTool}
                  onValueChange={(value) => update({ aiTool: value })}
                >
                  <SelectTrigger id='ai-tool' className='h-11'>
                    <SelectValue placeholder={gt('Select a tool')} />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TOOLS.map((tool) => {
                      const Mark = tool.icon;
                      // Radix renders the chosen item's children in the
                      // trigger too, so the mark shows in both places.
                      return (
                        <SelectItem key={tool.value} value={tool.value}>
                          <span className='flex items-center gap-2'>
                            {Mark ? (
                              <Mark className='size-4 shrink-0' />
                            ) : (
                              // Other has no mark; the spacer keeps its
                              // label at the x the marks give the rest.
                              <span
                                className='size-4 shrink-0'
                                aria-hidden='true'
                              />
                            )}
                            <span>{tool.label}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {!open && (
          // The quiet exit. The link sits where the next row would appear,
          // right aligned in a row of its own, and goes once the last row
          // is open, so nothing else moves. type='button' keeps it off the
          // form's default submit, so Enter in the website field still
          // reaches handleSubmit as the form's implicit submission. Under
          // md it is 44px tall, the phone's tap target.
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='link'
              className='h-auto px-0 font-normal text-(--ink-2) max-md:min-h-11'
              onClick={skipTheRest}
            >
              <T>Skip the rest</T>
            </Button>
          </div>
        )}

        {open && (
          <div
            className={rowClass(FRAMEWORKS_ROW, 'flex flex-col gap-2.5')}
            role='group'
            aria-labelledby='frameworks-label'
          >
            <Label id='frameworks-label'>
              <T>Which frameworks are you using?</T>
            </Label>
            <div
              className='flex flex-wrap gap-2'
              data-testid='survey-frameworks'
            >
              {FRAMEWORKS.map((framework) => {
                const pressed = frameworks.includes(framework.value);
                const Icon = framework.icon;
                return (
                  <Button
                    key={framework.value}
                    type='button'
                    variant={pressed ? 'default' : 'outline'}
                    className={pressed ? CHOICE_CLASS : CHOICE_OUTLINE_CLASS}
                    aria-pressed={pressed}
                    onClick={() => toggleFramework(framework.value)}
                  >
                    <Icon aria-hidden='true' className='size-4' />
                    {framework.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {open && (
        <div
          ref={actionsRef}
          className={rowClass(FRAMEWORKS_ROW, 'flex flex-col gap-3')}
        >
          {submitError && <p className='typo-error'>{submitError}</p>}
          <Button type='submit' loading={saving} className='h-11 w-full'>
            <T>Submit</T>
          </Button>
        </div>
      )}
    </form>
  );
}
