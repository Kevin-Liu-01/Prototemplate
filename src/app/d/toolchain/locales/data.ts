// GENERATED DATA — do not hand-edit rows.
// Source: the exact data path of the old landing page
// (apps/landing/src/components/pages/supported-locales/SupportedLocalesPage.tsx):
//   listSupportedLocales() from @generaltranslation/supported-locales@2.1.2-odysseus.5,
//   filtered like packages/locales/src/supportedLocales.ts (custom qaa-qtz out),
//   properties via generaltranslation@9.0.0-odysseus.5 getLocaleProperties(code, 'en')
//   and getLocaleDirection(code). Regenerate with scratchpad/gen-locales.cjs.

export type LocaleRow = {
  /** canonical BCP-47 code, as listed by the API */
  code: string;
  /** flag emoji getLocaleProperties resolves for the locale */
  flag: string;
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
  /** bare language subtag, for the ledger’s language-block rules */
  lang: string;
};

export const LOCALES: LocaleRow[] = [
  { code: "af", flag: "🇿🇦", name: "Afrikaans", nativeName: "Afrikaans", region: "South Africa", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "af" },
  { code: "am", flag: "🇪🇹", name: "Amharic", nativeName: "አማርኛ", region: "Ethiopia", regionExplicit: false, script: "Ethi", scriptName: "Ethiopic", dir: "ltr", lang: "am" },
  { code: "ar", flag: "🇪🇬", name: "Arabic", nativeName: "العربية", region: "Egypt", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-AE", flag: "🇦🇪", name: "Arabic (United Arab Emirates)", nativeName: "العربية (الإمارات العربية المتحدة)", region: "United Arab Emirates", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-EG", flag: "🇪🇬", name: "Arabic (Egypt)", nativeName: "العربية (مصر)", region: "Egypt", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-LB", flag: "🇱🇧", name: "Arabic (Lebanon)", nativeName: "العربية (لبنان)", region: "Lebanon", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-MA", flag: "🇲🇦", name: "Arabic (Morocco)", nativeName: "العربية (المغرب)", region: "Morocco", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-OM", flag: "🇴🇲", name: "Arabic (Oman)", nativeName: "العربية (عُمان)", region: "Oman", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "ar-SA", flag: "🇸🇦", name: "Arabic (Saudi Arabia)", nativeName: "العربية (المملكة العربية السعودية)", region: "Saudi Arabia", regionExplicit: true, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ar" },
  { code: "bg", flag: "🇧🇬", name: "Bulgarian", nativeName: "български", region: "Bulgaria", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "bg" },
  { code: "bn", flag: "🇧🇩", name: "Bangla", nativeName: "বাংলা", region: "Bangladesh", regionExplicit: false, script: "Beng", scriptName: "Bangla", dir: "ltr", lang: "bn" },
  { code: "bs", flag: "🇧🇦", name: "Bosnian", nativeName: "bosanski", region: "Bosnia & Herzegovina", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "bs" },
  { code: "ca", flag: "🌍", name: "Catalan", nativeName: "català", region: "Spain", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ca" },
  { code: "cs", flag: "🇨🇿", name: "Czech", nativeName: "čeština", region: "Czechia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "cs" },
  { code: "cy", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", name: "Welsh", nativeName: "Cymraeg", region: "United Kingdom", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "cy" },
  { code: "da", flag: "🇩🇰", name: "Danish", nativeName: "dansk", region: "Denmark", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "da" },
  { code: "de", flag: "🇩🇪", name: "German", nativeName: "Deutsch", region: "Germany", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-AT", flag: "🇦🇹", name: "Austrian German", nativeName: "Österreichisches Deutsch", region: "Austria", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-CH", flag: "🇨🇭", name: "Swiss High German", nativeName: "Schweizer Hochdeutsch", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "de-DE", flag: "🇩🇪", name: "German (Germany)", nativeName: "Deutsch (Deutschland)", region: "Germany", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "de" },
  { code: "el", flag: "🇬🇷", name: "Greek", nativeName: "Ελληνικά", region: "Greece", regionExplicit: false, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "el-CY", flag: "🇨🇾", name: "Greek (Cyprus)", nativeName: "Ελληνικά (Κύπρος)", region: "Cyprus", regionExplicit: true, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "el-EL", flag: "🌍", name: "Greek (EL)", nativeName: "Ελληνικά (EL)", region: "EL", regionExplicit: true, script: "Grek", scriptName: "Greek", dir: "ltr", lang: "el" },
  { code: "en", flag: "🇺🇸", name: "English", nativeName: "English", region: "United States", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-AU", flag: "🇦🇺", name: "Australian English", nativeName: "Australian English", region: "Australia", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-CA", flag: "🇨🇦", name: "Canadian English", nativeName: "Canadian English", region: "Canada", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-GB", flag: "🇬🇧", name: "British English", nativeName: "British English", region: "United Kingdom", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-NZ", flag: "🇳🇿", name: "English (New Zealand)", nativeName: "English (New Zealand)", region: "New Zealand", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "en-US", flag: "🇺🇸", name: "American English", nativeName: "American English", region: "United States", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "en" },
  { code: "eo", flag: "🌍", name: "Esperanto", nativeName: "Esperanto", region: "world", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "eo" },
  { code: "es", flag: "🇪🇸", name: "Spanish", nativeName: "español", region: "Spain", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-419", flag: "🌎", name: "Latin American Spanish", nativeName: "español latinoamericano", region: "Latin America", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-AR", flag: "🇦🇷", name: "Spanish (Argentina)", nativeName: "español (Argentina)", region: "Argentina", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-CL", flag: "🇨🇱", name: "Spanish (Chile)", nativeName: "español (Chile)", region: "Chile", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-CO", flag: "🇨🇴", name: "Spanish (Colombia)", nativeName: "español (Colombia)", region: "Colombia", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-ES", flag: "🇪🇸", name: "European Spanish", nativeName: "español de España", region: "Spain", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-MX", flag: "🇲🇽", name: "Mexican Spanish", nativeName: "español de México", region: "Mexico", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-PE", flag: "🇵🇪", name: "Spanish (Peru)", nativeName: "español (Perú)", region: "Peru", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-US", flag: "🇺🇸", name: "Spanish (United States)", nativeName: "español (Estados Unidos)", region: "United States", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "es-VE", flag: "🇻🇪", name: "Spanish (Venezuela)", nativeName: "español (Venezuela)", region: "Venezuela", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "es" },
  { code: "et", flag: "🇪🇪", name: "Estonian", nativeName: "eesti", region: "Estonia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "et" },
  { code: "fa", flag: "🇮🇷", name: "Persian", nativeName: "فارسی", region: "Iran", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "fa" },
  { code: "fi", flag: "🇫🇮", name: "Finnish", nativeName: "suomi", region: "Finland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fi" },
  { code: "fil", flag: "🇵🇭", name: "Filipino", nativeName: "Filipino", region: "Philippines", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fil" },
  { code: "fr", flag: "🇫🇷", name: "French", nativeName: "français", region: "France", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-BE", flag: "🇧🇪", name: "French (Belgium)", nativeName: "français (Belgique)", region: "Belgium", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CA", flag: "🇨🇦", name: "Canadian French", nativeName: "français canadien", region: "Canada", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CH", flag: "🇨🇭", name: "Swiss French", nativeName: "français suisse", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-CM", flag: "🇨🇲", name: "French (Cameroon)", nativeName: "français (Cameroun)", region: "Cameroon", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-FR", flag: "🇫🇷", name: "French (France)", nativeName: "français (France)", region: "France", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "fr-SN", flag: "🇸🇳", name: "French (Senegal)", nativeName: "français (Sénégal)", region: "Senegal", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fr" },
  { code: "gu", flag: "🇮🇳", name: "Gujarati", nativeName: "ગુજરાતી", region: "India", regionExplicit: false, script: "Gujr", scriptName: "Gujarati", dir: "ltr", lang: "gu" },
  { code: "ha", flag: "🇳🇬", name: "Hausa", nativeName: "Hausa", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ha" },
  { code: "he", flag: "🇮🇱", name: "Hebrew", nativeName: "עברית", region: "Israel", regionExplicit: false, script: "Hebr", scriptName: "Hebrew", dir: "rtl", lang: "he" },
  { code: "hi", flag: "🇮🇳", name: "Hindi", nativeName: "हिन्दी", region: "India", regionExplicit: false, script: "Deva", scriptName: "Devanagari", dir: "ltr", lang: "hi" },
  { code: "hr", flag: "🇭🇷", name: "Croatian", nativeName: "hrvatski", region: "Croatia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "hr" },
  { code: "hu", flag: "🇭🇺", name: "Hungarian", nativeName: "magyar", region: "Hungary", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "hu" },
  { code: "hy", flag: "🇦🇲", name: "Armenian", nativeName: "հայերեն", region: "Armenia", regionExplicit: false, script: "Armn", scriptName: "Armenian", dir: "ltr", lang: "hy" },
  { code: "id", flag: "🇮🇩", name: "Indonesian", nativeName: "Indonesia", region: "Indonesia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "id" },
  { code: "ig", flag: "🇳🇬", name: "Igbo", nativeName: "Igbo", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ig" },
  { code: "is", flag: "🇮🇸", name: "Icelandic", nativeName: "íslenska", region: "Iceland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "is" },
  { code: "it", flag: "🇮🇹", name: "Italian", nativeName: "italiano", region: "Italy", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "it-CH", flag: "🇨🇭", name: "Italian (Switzerland)", nativeName: "italiano (Svizzera)", region: "Switzerland", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "it-IT", flag: "🇮🇹", name: "Italian (Italy)", nativeName: "italiano (Italia)", region: "Italy", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "it" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", nativeName: "日本語", region: "Japan", regionExplicit: false, script: "Jpan", scriptName: "Japanese", dir: "ltr", lang: "ja" },
  { code: "ka", flag: "🇬🇪", name: "Georgian", nativeName: "ქართული", region: "Georgia", regionExplicit: false, script: "Geor", scriptName: "Georgian", dir: "ltr", lang: "ka" },
  { code: "kk", flag: "🇰🇿", name: "Kazakh", nativeName: "қазақ тілі", region: "Kazakhstan", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "kk" },
  { code: "kn", flag: "🇮🇳", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India", regionExplicit: false, script: "Knda", scriptName: "Kannada", dir: "ltr", lang: "kn" },
  { code: "ko", flag: "🇰🇷", name: "Korean", nativeName: "한국어", region: "South Korea", regionExplicit: false, script: "Kore", scriptName: "Korean", dir: "ltr", lang: "ko" },
  { code: "la", flag: "🇻🇦", name: "Latin", nativeName: "Latin", region: "Vatican City", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "la" },
  { code: "lt", flag: "🇱🇹", name: "Lithuanian", nativeName: "lietuvių", region: "Lithuania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "lt" },
  { code: "lv", flag: "🇱🇻", name: "Latvian", nativeName: "latviešu", region: "Latvia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "lv" },
  { code: "mk", flag: "🇲🇰", name: "Macedonian", nativeName: "македонски", region: "North Macedonia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "mk" },
  { code: "ml", flag: "🇮🇳", name: "Malayalam", nativeName: "മലയാളം", region: "India", regionExplicit: false, script: "Mlym", scriptName: "Malayalam", dir: "ltr", lang: "ml" },
  { code: "mn", flag: "🇲🇳", name: "Mongolian", nativeName: "монгол", region: "Mongolia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "mn" },
  { code: "mr", flag: "🇮🇳", name: "Marathi", nativeName: "मराठी", region: "India", regionExplicit: false, script: "Deva", scriptName: "Devanagari", dir: "ltr", lang: "mr" },
  { code: "ms", flag: "🇲🇾", name: "Malay", nativeName: "Melayu", region: "Malaysia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ms" },
  { code: "my", flag: "🇲🇲", name: "Burmese", nativeName: "မြန်မာ", region: "Myanmar (Burma)", regionExplicit: false, script: "Mymr", scriptName: "Myanmar", dir: "ltr", lang: "my" },
  { code: "nb", flag: "🇳🇴", name: "Norwegian Bokmål", nativeName: "norsk bokmål", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nb" },
  { code: "nb-NO", flag: "🇳🇴", name: "Norwegian Bokmål (Norway)", nativeName: "norsk bokmål (Norge)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nb" },
  { code: "nl", flag: "🇳🇱", name: "Dutch", nativeName: "Nederlands", region: "Netherlands", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nl-BE", flag: "🇧🇪", name: "Flemish", nativeName: "Vlaams", region: "Belgium", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nl-NL", flag: "🇳🇱", name: "Dutch (Netherlands)", nativeName: "Nederlands (Nederland)", region: "Netherlands", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nl" },
  { code: "nn", flag: "🇳🇴", name: "Norwegian Nynorsk", nativeName: "norsk nynorsk", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nn" },
  { code: "nn-NO", flag: "🇳🇴", name: "Norwegian Nynorsk (Norway)", nativeName: "norsk nynorsk (Noreg)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "nn" },
  { code: "no", flag: "🇳🇴", name: "Norwegian", nativeName: "norsk", region: "Norway", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "no" },
  { code: "no-NO", flag: "🇳🇴", name: "Norwegian (Norway)", nativeName: "norsk (Norge)", region: "Norway", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "no" },
  { code: "pa", flag: "🇮🇳", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India", regionExplicit: false, script: "Guru", scriptName: "Gurmukhi", dir: "ltr", lang: "pa" },
  { code: "pl", flag: "🇵🇱", name: "Polish", nativeName: "polski", region: "Poland", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pl" },
  { code: "pt", flag: "🇧🇷", name: "Portuguese", nativeName: "português", region: "Brazil", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "pt-BR", flag: "🇧🇷", name: "Brazilian Portuguese", nativeName: "português (Brasil)", region: "Brazil", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "pt-PT", flag: "🇵🇹", name: "European Portuguese", nativeName: "português europeu", region: "Portugal", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "pt" },
  { code: "ro", flag: "🇷🇴", name: "Romanian", nativeName: "română", region: "Romania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "ro" },
  { code: "ru", flag: "🇷🇺", name: "Russian", nativeName: "русский", region: "Russia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "ru" },
  { code: "sk", flag: "🇸🇰", name: "Slovak", nativeName: "slovenčina", region: "Slovakia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sk" },
  { code: "sl", flag: "🇸🇮", name: "Slovenian", nativeName: "slovenščina", region: "Slovenia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sl" },
  { code: "so", flag: "🇸🇴", name: "Somali", nativeName: "Soomaali", region: "Somalia", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "so" },
  { code: "sq", flag: "🇦🇱", name: "Albanian", nativeName: "shqip", region: "Albania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sq" },
  { code: "sr", flag: "🇷🇸", name: "Serbian", nativeName: "српски", region: "Serbia", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "sr" },
  { code: "sv", flag: "🇸🇪", name: "Swedish", nativeName: "svenska", region: "Sweden", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sv" },
  { code: "sw", flag: "🇹🇿", name: "Swahili", nativeName: "Kiswahili", region: "Tanzania", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "sw-KE", flag: "🇰🇪", name: "Swahili (Kenya)", nativeName: "Kiswahili (Kenya)", region: "Kenya", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "sw-TZ", flag: "🇹🇿", name: "Swahili (Tanzania)", nativeName: "Kiswahili (Tanzania)", region: "Tanzania", regionExplicit: true, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "sw" },
  { code: "ta", flag: "🇮🇳", name: "Tamil", nativeName: "தமிழ்", region: "India", regionExplicit: false, script: "Taml", scriptName: "Tamil", dir: "ltr", lang: "ta" },
  { code: "te", flag: "🇮🇳", name: "Telugu", nativeName: "తెలుగు", region: "India", regionExplicit: false, script: "Telu", scriptName: "Telugu", dir: "ltr", lang: "te" },
  { code: "th", flag: "🇹🇭", name: "Thai", nativeName: "ไทย", region: "Thailand", regionExplicit: false, script: "Thai", scriptName: "Thai", dir: "ltr", lang: "th" },
  { code: "tl", flag: "🇵🇭", name: "Filipino", nativeName: "Filipino", region: "Philippines", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "fil" },
  { code: "tr", flag: "🇹🇷", name: "Turkish", nativeName: "Türkçe", region: "Türkiye", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "tr" },
  { code: "uk", flag: "🇺🇦", name: "Ukrainian", nativeName: "українська", region: "Ukraine", regionExplicit: false, script: "Cyrl", scriptName: "Cyrillic", dir: "ltr", lang: "uk" },
  { code: "ur", flag: "🇵🇰", name: "Urdu", nativeName: "اردو", region: "Pakistan", regionExplicit: false, script: "Arab", scriptName: "Arabic", dir: "rtl", lang: "ur" },
  { code: "uz", flag: "🇺🇿", name: "Uzbek", nativeName: "o‘zbek", region: "Uzbekistan", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "uz" },
  { code: "vi", flag: "🇻🇳", name: "Vietnamese", nativeName: "Tiếng Việt", region: "Vietnam", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "vi" },
  { code: "yo", flag: "🇳🇬", name: "Yoruba", nativeName: "Èdè Yorùbá", region: "Nigeria", regionExplicit: false, script: "Latn", scriptName: "Latin", dir: "ltr", lang: "yo" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", nativeName: "中文", region: "China", regionExplicit: false, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-CN", flag: "🇨🇳", name: "Chinese (China)", nativeName: "中文（中国）", region: "China", regionExplicit: true, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-HK", flag: "🇭🇰", name: "Chinese (Hong Kong SAR China)", nativeName: "中文（中國香港特別行政區）", region: "Hong Kong SAR China", regionExplicit: true, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
  { code: "zh-Hans", flag: "🇨🇳", name: "Simplified Chinese", nativeName: "简体中文", region: "China", regionExplicit: false, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-Hant", flag: "🇹🇼", name: "Traditional Chinese", nativeName: "繁體中文", region: "Taiwan", regionExplicit: false, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
  { code: "zh-SG", flag: "🇸🇬", name: "Chinese (Singapore)", nativeName: "中文（新加坡）", region: "Singapore", regionExplicit: true, script: "Hans", scriptName: "Simplified", dir: "ltr", lang: "zh" },
  { code: "zh-TW", flag: "🇹🇼", name: "Chinese (Taiwan)", nativeName: "中文（台灣）", region: "Taiwan", regionExplicit: true, script: "Hant", scriptName: "Traditional", dir: "ltr", lang: "zh" },
];

/** Derived once from the rows above — every headline number on the page. */
export const STATS = {
  locales: 120,
  languages: 71,
  scripts: 22,
  rtl: 10,
  regionalVariants: 46,
} as const;
