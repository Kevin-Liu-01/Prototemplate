/**
 * Canonical company-size options for the onboarding survey, copied from the
 * dashboard's packages/settings/src/companySize.ts. Defined as an `as const`
 * tuple so the values stay plain strings at the form boundary while still
 * yielding a precise `CompanySize` union type.
 */
export const COMPANY_SIZES = [
  'Just Me',
  '2-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];
