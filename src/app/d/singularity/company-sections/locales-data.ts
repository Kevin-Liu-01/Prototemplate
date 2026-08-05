// GENERATED DATA — do not hand-edit rows.
// Source: the exact data path of the old landing page
// (apps/landing/src/components/pages/supported-locales/SupportedLocalesPage.tsx):
//   listSupportedLocales() from @generaltranslation/supported-locales@2.1.2-odysseus.5,
//   filtered like packages/locales/src/supportedLocales.ts (custom qaa-qtz out),
//   properties via generaltranslation@9.0.0-odysseus.5 getLocaleProperties(code, 'en')
//   and getLocaleDirection(code). Same rows as the toolchain ledger, minus the
//   flag column — the singularity family sets the record in type alone.

export type LocaleRow = {
  /** canonical BCP-47 code, as listed by the API */
  code: string;
  /** English display name */
  name: string;
  /** endonym — the locale named in itself */
  nativeName: string;
  /** region name; inferred from likely-subtags when the code has no region */
  region: string;
  /** true when the region subtag is written in the code itself (de-AT) */
  regionExplicit: boolean;
  /** ISO 15924 script code from the maximized locale */
  script: string;
  /** CLDR display name of the script */
  scriptName: string;
  dir: 'ltr' | 'rtl';
  /** bare language subtag, for the ledger's language-block rules */
  lang: string;
};

export const LOCALES: LocaleRow[] = [
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", region: "South Africa", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "af" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", region: "Ethiopia", regionExplicit: false, script: "Ethi", scriptName: "Ethiopic", dir: "ltr", lang: "am" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "Egypt", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-AE", name: "Arabic (United Arab Emirates)", nativeName: "العربية (الإمارات العربية المتحدة)", region: "United Arab Emirates", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-EG", name: "Arabic (Egypt)", nativeName: "العربية (مصر)", region: "Egypt", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-LB", name: "Arabic (Lebanon)", nativeName: "العربية (لبنان)", region: "Lebanon", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-MA", name: "Arabic (Morocco)", nativeName: "العربية (المغرب)", region: "Morocco", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-OM", name: "Arabic (Oman)", nativeName: "العربية (عُمان)", region: "Oman", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-SA", name: "Arabic (Saudi Arabia)", nativeName: "العربية (المملكة العربية السعودية)", region: "Saudi Arabia", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "bg", name: "Bulgarian", nativeName: "български", region: "Bulgaria", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "bg" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা", region: "Bangladesh", regionExplicit: false, script: "Beng", scriptName: "Bangla", dir: "ltr", lang: "bn" },
  { code: "bs", name: "Bosnian", nativeName: "bosanski", region: "Bosnia & Herzegovina", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "bs" },
  { code: "ca", name: "Catalan", nativeName: "català", region: "Spain", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ca" },
  { code: "cs", name: "Czech", nativeName: "čeština", region: "Czechia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "cs" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", region: "United Kingdom", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "cy" },
  { code: "da", name: "Danish", nativeName: "dansk", region: "Denmark", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "da" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "Germany", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-AT", name: "Austrian German", nativeName: "Österreichisches Deutsch", region: "Austria", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-CH", name: "Swiss High German", nativeName: "Schweizer Hochdeutsch", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-DE", name: "German (Germany)", nativeName: "Deutsch (Deutschland)", region: "Germany", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "Greece", regionExplicit: false, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "el-CY", name: "Greek (Cyprus)", nativeName: "Ελληνικά (Κύπρος)", region: "Cyprus", regionExplicit: true, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "el-EL", name: "Greek (EL)", nativeName: "Ελληνικά (EL)", region: "EL", regionExplicit: true, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "en", name: "English", nativeName: "English", region: "United States", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-AU", name: "Australian English", nativeName: "Australian English", region: "Australia", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-CA", name: "Canadian English", nativeName: "Canadian English", region: "Canada", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-GB", name: "British English", nativeName: "British English", region: "United Kingdom", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-NZ", name: "English (New Zealand)", nativeName: "English (New Zealand)", region: "New Zealand", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-US", name: "American English", nativeName: "American English", region: "United States", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto", region: "world", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "eo" },
  { code: "es", name: "Spanish", nativeName: "español", region: "Spain", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-419", name: "Latin American Spanish", nativeName: "español latinoamericano", region: "Latin America", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-AR", name: "Spanish (Argentina)", nativeName: "español (Argentina)", region: "Argentina", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-CL", name: "Spanish (Chile)", nativeName: "español (Chile)", region: "Chile", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-CO", name: "Spanish (Colombia)", nativeName: "español (Colombia)", region: "Colombia", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-ES", name: "European Spanish", nativeName: "español de España", region: "Spain", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-MX", name: "Mexican Spanish", nativeName: "español de México", region: "Mexico", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-PE", name: "Spanish (Peru)", nativeName: "español (Perú)", region: "Peru", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-US", name: "Spanish (United States)", nativeName: "español (Estados Unidos)", region: "United States", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-VE", name: "Spanish (Venezuela)", nativeName: "español (Venezuela)", region: "Venezuela", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "et", name: "Estonian", nativeName: "eesti", region: "Estonia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "et" },
  { code: "fa", name: "Persian", nativeName: "فارسی", region: "Iran", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "fa" },
  { code: "fi", name: "Finnish", nativeName: "suomi", region: "Finland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fi" },
  { code: "fil", name: "Filipino", nativeName: "Filipino", region: "Philippines", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fil" },
  { code: "fr", name: "French", nativeName: "français", region: "France", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-BE", name: "French (Belgium)", nativeName: "français (Belgique)", region: "Belgium", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CA", name: "Canadian French", nativeName: "français canadien", region: "Canada", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CH", name: "Swiss French", nativeName: "français suisse", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CM", name: "French (Cameroon)", nativeName: "français (Cameroun)", region: "Cameroon", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-FR", name: "French (France)", nativeName: "français (France)", region: "France", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-SN", name: "French (Senegal)", nativeName: "français (Sénégal)", region: "Senegal", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "India", regionExplicit: false, script: "Gujr", scriptName: "Gujarati", dir: "ltr", lang: "gu" },
  { code: "ha", name: "Hausa", nativeName: "Hausa", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ha" },
  { code: "he", name: "Hebrew", nativeName: "עברית", region: "Israel", regionExplicit: false, script: "Hebr", scriptName: "Hebrew", dir: "rtl", lang: "he" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "India", regionExplicit: false, script: "Deva", scriptName: "Devanagari", dir: "ltr", lang: "hi" },
  { code: "hr", name: "Croatian", nativeName: "hrvatski", region: "Croatia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "hr" },
  { code: "hu", name: "Hungarian", nativeName: "magyar", region: "Hungary", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "hu" },
  { code: "hy", name: "Armenian", nativeName: "հայերեն", region: "Armenia", regionExplicit: false, script: "Armn", scriptName: "Armenian", dir: "ltr", lang: "hy" },
  { code: "id", name: "Indonesian", nativeName: "Indonesia", region: "Indonesia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "id" },
  { code: "ig", name: "Igbo", nativeName: "Igbo", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ig" },
  { code: "is", name: "Icelandic", nativeName: "íslenska", region: "Iceland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "is" },
  { code: "it", name: "Italian", nativeName: "italiano", region: "Italy", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "it-CH", name: "Italian (Switzerland)", nativeName: "italiano (Svizzera)", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "it-IT", name: "Italian (Italy)", nativeName: "italiano (Italia)", region: "Italy", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "Japan", regionExplicit: false, script: "Jpan", scriptName: "Japanese", dir: "ltr", lang: "ja" },
  { code: "ka", name: "Georgian", nativeName: "ქართული", region: "Georgia", regionExplicit: false, script: "Geor", scriptName: "Georgian", dir: "ltr", lang: "ka" },
  { code: "kk", name: "Kazakh", nativeName: "қазақ тілі", region: "Kazakhstan", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "kk" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India", regionExplicit: false, script: "Knda", scriptName: "Kannada", dir: "ltr", lang: "kn" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "South Korea", regionExplicit: false, script: "Kore", scriptName: "Korean", dir: "ltr", lang: "ko" },
  { code: "la", name: "Latin", nativeName: "Latin", region: "Vatican City", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "la" },
  { code: "lt", name: "Lithuanian", nativeName: "lietuvių", region: "Lithuania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "lt" },
  { code: "lv", name: "Latvian", nativeName: "latviešu", region: "Latvia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "lv" },
  { code: "mk", name: "Macedonian", nativeName: "македонски", region: "North Macedonia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "mk" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "India", regionExplicit: false, script: "Mlym", scriptName: "Malayalam", dir: "ltr", lang: "ml" },
  { code: "mn", name: "Mongolian", nativeName: "монгол", region: "Mongolia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "mn" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "India", regionExplicit: false, script: "Deva", scriptName: "Devanagari", dir: "ltr", lang: "mr" },
  { code: "ms", name: "Malay", nativeName: "Melayu", region: "Malaysia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ms" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", region: "Myanmar (Burma)", regionExplicit: false, script: "Mymr", scriptName: "Myanmar", dir: "ltr", lang: "my" },
  { code: "nb", name: "Norwegian Bokmål", nativeName: "norsk bokmål", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nb" },
  { code: "nb-NO", name: "Norwegian Bokmål (Norway)", nativeName: "norsk bokmål (Norge)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nb" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "Netherlands", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nl-BE", name: "Flemish", nativeName: "Vlaams", region: "Belgium", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nl-NL", name: "Dutch (Netherlands)", nativeName: "Nederlands (Nederland)", region: "Netherlands", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nn", name: "Norwegian Nynorsk", nativeName: "norsk nynorsk", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nn" },
  { code: "nn-NO", name: "Norwegian Nynorsk (Norway)", nativeName: "norsk nynorsk (Noreg)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nn" },
  { code: "no", name: "Norwegian", nativeName: "norsk", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "no" },
  { code: "no-NO", name: "Norwegian (Norway)", nativeName: "norsk (Norge)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "no" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India", regionExplicit: false, script: "Guru", scriptName: "Gurmukhi", dir: "ltr", lang: "pa" },
  { code: "pl", name: "Polish", nativeName: "polski", region: "Poland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pl" },
  { code: "pt", name: "Portuguese", nativeName: "português", region: "Brazil", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "pt-BR", name: "Brazilian Portuguese", nativeName: "português (Brasil)", region: "Brazil", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "pt-PT", name: "European Portuguese", nativeName: "português europeu", region: "Portugal", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "ro", name: "Romanian", nativeName: "română", region: "Romania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ro" },
  { code: "ru", name: "Russian", nativeName: "русский", region: "Russia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "ru" },
  { code: "sk", name: "Slovak", nativeName: "slovenčina", region: "Slovakia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sk" },
  { code: "sl", name: "Slovenian", nativeName: "slovenščina", region: "Slovenia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sl" },
  { code: "so", name: "Somali", nativeName: "Soomaali", region: "Somalia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "so" },
  { code: "sq", name: "Albanian", nativeName: "shqip", region: "Albania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sq" },
  { code: "sr", name: "Serbian", nativeName: "српски", region: "Serbia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "sr" },
  { code: "sv", name: "Swedish", nativeName: "svenska", region: "Sweden", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sv" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "Tanzania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "sw-KE", name: "Swahili (Kenya)", nativeName: "Kiswahili (Kenya)", region: "Kenya", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "sw-TZ", name: "Swahili (Tanzania)", nativeName: "Kiswahili (Tanzania)", region: "Tanzania", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India", regionExplicit: false, script: "Taml", scriptName: "Tamil", dir: "ltr", lang: "ta" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "India", regionExplicit: false, script: "Telu", scriptName: "Telugu", dir: "ltr", lang: "te" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "Thailand", regionExplicit: false, script: "Thai", scriptName: "Thai", dir: "ltr", lang: "th" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", region: "Philippines", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fil" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "Türkiye", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "tr" },
  { code: "uk", name: "Ukrainian", nativeName: "українська", region: "Ukraine", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "uk" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "Pakistan", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ur" },
  { code: "uz", name: "Uzbek", nativeName: "o‘zbek", region: "Uzbekistan", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "uz" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "Vietnam", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "vi" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "yo" },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "China", regionExplicit: false, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-CN", name: "Chinese (China)", nativeName: "中文（中国）", region: "China", regionExplicit: true, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-HK", name: "Chinese (Hong Kong SAR China)", nativeName: "中文（中國香港特別行政區）", region: "Hong Kong SAR China", regionExplicit: true, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
  { code: "zh-Hans", name: "Simplified Chinese", nativeName: "简体中文", region: "China", regionExplicit: false, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-Hant", name: "Traditional Chinese", nativeName: "繁體中文", region: "Taiwan", regionExplicit: false, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
  { code: "zh-SG", name: "Chinese (Singapore)", nativeName: "中文（新加坡）", region: "Singapore", regionExplicit: true, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-TW", name: "Chinese (Taiwan)", nativeName: "中文（台灣）", region: "Taiwan", regionExplicit: true, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
];

/** Derived once from the rows above — every headline number on the page. */
export const STATS = {
  locales: LOCALES.length,
  languages: new Set(LOCALES.map((r) => r.lang)).size,
  scripts: new Set(LOCALES.map((r) => r.script)).size,
  rtl: LOCALES.filter((r) => r.dir === 'rtl').length,
  regionalVariants: LOCALES.filter((r) => r.regionExplicit).length,
} as const;
