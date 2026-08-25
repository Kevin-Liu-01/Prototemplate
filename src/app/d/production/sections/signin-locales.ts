// VENDORED FIXTURE — generated, do not hand-edit rows.
//
// The sign-in footer's language selector is
// packages/ui/src/components/frame/LanguageSelector.tsx in gt-cloud: it reads
// the app's configured locale list through gt-next's useLocaleSelector(),
// drops private-use codes (BCP-47 qaa-qtz, i.e. 'qbr'), sorts by the NATIVE
// display name, and renders each row as a flag-icons span plus that name.
// gt-next is off-limits in this repo, so the exact same rows are frozen here:
//
//   codes   apps/dashboard/gt.config.json -> "locales" (85 entries, 84 after
//           the qbr filter)
//   name    getLocaleDisplayName() from packages/locales/src/utils/display.ts
//           = capitalized nativeNameWithRegionCode via
//           generaltranslation getLocaleProperties(code)
//   flag    getLocaleFlagCountryCode() from packages/locales/src/utils/flag.ts
//           = lowercased regionCode when it is an ISO 3166-1 alpha-2 pair
//   order   customLocaleNativeSort() from packages/locales/src/utils/sort.ts
//           with the rendered locale ('en') as the collator
//
// Regenerate with scratchpad/emit-fixture.mjs against the gt-cloud checkout.

export type SignInLocale = {
  /** canonical BCP-47 code the selector sets */
  code: string;
  /** native display name, exactly what the row prints */
  name: string;
  /** flag-icons class suffix (fi fi-<flag>); absent where no single country resolves */
  flag?: string;
};

/** The locale the control renders in, so its row carries the check mark. */
export const SIGNIN_LOCALE = 'en';

export const SIGNIN_LOCALES: readonly SignInLocale[] = [
  { code: 'af', name: 'Afrikaans', flag: 'za' },
  { code: 'bs', name: 'Bosanski', flag: 'ba' },
  { code: 'ca', name: 'Català', flag: 'es' },
  { code: 'cs', name: 'Čeština', flag: 'cz' },
  { code: 'cy', name: 'Cymraeg', flag: 'gb' },
  { code: 'da', name: 'Dansk', flag: 'dk' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'de-AT', name: 'Deutsch (AT)', flag: 'at' },
  { code: 'de-CH', name: 'Deutsch (CH)', flag: 'ch' },
  { code: 'et', name: 'Eesti', flag: 'ee' },
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'en-AU', name: 'English (AU)', flag: 'au' },
  { code: 'en-CA', name: 'English (CA)', flag: 'ca' },
  { code: 'en-GB', name: 'English (GB)', flag: 'gb' },
  { code: 'en-NZ', name: 'English (NZ)', flag: 'nz' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'es-419', name: 'Español (419)' },
  { code: 'es-US', name: 'Español (US)', flag: 'us' },
  { code: 'fil', name: 'Filipino', flag: 'ph' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'fr-BE', name: 'Français (BE)', flag: 'be' },
  { code: 'fr-CA', name: 'Français (CA)', flag: 'ca' },
  { code: 'fr-CH', name: 'Français (CH)', flag: 'ch' },
  { code: 'fr-CM', name: 'Français (CM)', flag: 'cm' },
  { code: 'fr-SN', name: 'Français (SN)', flag: 'sn' },
  { code: 'hr', name: 'Hrvatski', flag: 'hr' },
  { code: 'id', name: 'Indonesia', flag: 'id' },
  { code: 'is', name: 'Íslenska', flag: 'is' },
  { code: 'it', name: 'Italiano', flag: 'it' },
  { code: 'it-CH', name: 'Italiano (CH)', flag: 'ch' },
  { code: 'sw', name: 'Kiswahili', flag: 'tz' },
  { code: 'la', name: 'Latin', flag: 'va' },
  { code: 'lv', name: 'Latviešu', flag: 'lv' },
  { code: 'lt', name: 'Lietuvių', flag: 'lt' },
  { code: 'hu', name: 'Magyar', flag: 'hu' },
  { code: 'ms', name: 'Melayu', flag: 'my' },
  { code: 'nl', name: 'Nederlands', flag: 'nl' },
  { code: 'no', name: 'Norsk', flag: 'no' },
  { code: 'pl', name: 'Polski', flag: 'pl' },
  { code: 'pt', name: 'Português', flag: 'br' },
  { code: 'pt-BR', name: 'Português (BR)', flag: 'br' },
  { code: 'pt-PT', name: 'Português (PT)', flag: 'pt' },
  { code: 'ro', name: 'Română', flag: 'ro' },
  { code: 'sq', name: 'Shqip', flag: 'al' },
  { code: 'sk', name: 'Slovenčina', flag: 'sk' },
  { code: 'sl', name: 'Slovenščina', flag: 'si' },
  { code: 'so', name: 'Soomaali', flag: 'so' },
  { code: 'fi', name: 'Suomi', flag: 'fi' },
  { code: 'sv', name: 'Svenska', flag: 'se' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
  { code: 'tr', name: 'Türkçe', flag: 'tr' },
  { code: 'el', name: 'Ελληνικά', flag: 'gr' },
  { code: 'el-CY', name: 'Ελληνικά (CY)', flag: 'cy' },
  { code: 'bg', name: 'Български', flag: 'bg' },
  { code: 'kk', name: 'Қазақ тілі', flag: 'kz' },
  { code: 'mk', name: 'Македонски', flag: 'mk' },
  { code: 'mn', name: 'Монгол', flag: 'mn' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'sr', name: 'Српски', flag: 'rs' },
  { code: 'uk', name: 'Українська', flag: 'ua' },
  { code: 'ka', name: 'Ქართული', flag: 'ge' },
  { code: 'hy', name: 'Հայերեն', flag: 'am' },
  { code: 'he', name: 'עברית', flag: 'il' },
  { code: 'ur', name: 'اردو', flag: 'pk' },
  { code: 'ar', name: 'العربية', flag: 'eg' },
  { code: 'fa', name: 'فارسی', flag: 'ir' },
  { code: 'am', name: 'አማርኛ', flag: 'et' },
  { code: 'mr', name: 'मराठी', flag: 'in' },
  { code: 'hi', name: 'हिन्दी', flag: 'in' },
  { code: 'bn', name: 'বাংলা', flag: 'bd' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: 'in' },
  { code: 'gu', name: 'ગુજરાતી', flag: 'in' },
  { code: 'ta', name: 'தமிழ்', flag: 'in' },
  { code: 'te', name: 'తెలుగు', flag: 'in' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: 'in' },
  { code: 'ml', name: 'മലയാളം', flag: 'in' },
  { code: 'th', name: 'ไทย', flag: 'th' },
  { code: 'my', name: 'မြန်မာ', flag: 'mm' },
  { code: 'ko', name: '한국어', flag: 'kr' },
  { code: 'zh', name: '中文', flag: 'cn' },
  { code: 'zh-HK', name: '中文 (HK)', flag: 'hk' },
  { code: 'zh-SG', name: '中文 (SG)', flag: 'sg' },
  { code: 'zh-TW', name: '中文 (TW)', flag: 'tw' },
  { code: 'ja', name: '日本語', flag: 'jp' },
];
