// GENERATED DATA — do not hand-edit rows.
//
// VENDORED FIXTURE. The real page reads its roster at runtime from the
// workspace locales package, which this repo cannot install:
//   supportedLocales           @generaltranslation/locales/supportedLocales.js
//   getLocaleProperties(code)  generaltranslation
//   getLocaleFlagCountryCode   @generaltranslation/locales/utils/flag.js
// Source of truth:
//   /Users/kevinliu/gt/gt-cloud-wt-pr-routing/apps/landing
//   (packages/locales/src/supportedLocales.ts — listSupportedLocales() with
//   the custom qaa–qtz codes filtered out), properties resolved against
//   userLocale 'en'. 120 rows, in the package's own order; the page renders
//   them in exactly that order, as the real page does.
//
// Every field below is one property the real page actually reads:
//   name / nativeName / regionName  the three lines of a card
//   regionCode + emoji              the flag-or-globe branch
//   flag                            the flag-icons class suffix LocaleFlag
//                                   derives (empty where it renders nothing)
//   nameWithRegionCode / languageCode / nativeRegionName
//                                   the search path's match + sort fields
//                                   (filterLocaleCodes in packages/locales)

export type LocaleProperties = {
  /** canonical BCP-47 code, as listed by the API */
  code: string;
  /** English display name — the card's own heading, capitalized on render */
  name: string;
  /** what the search path matches and sorts on (LocaleData.name) */
  nameWithRegionCode: string;
  /** endonym — the locale named in itself */
  nativeName: string;
  /** English region name; '—' stands in when empty */
  regionName: string;
  /** region named in the locale itself — a search field only */
  nativeRegionName: string;
  /** ISO 3166-1 alpha-2, a UN M.49 number ('419'), or a bare subtag ('EL') */
  regionCode: string;
  /** bare language subtag, a search field */
  languageCode: string;
  /** the flag emoji, shown where no ISO flag exists */
  emoji: string;
  /** flag-icons suffix (`fi fi-<flag>`); '' where LocaleFlag renders null */
  flag: string;
};

export const SUPPORTED_LOCALES: LocaleProperties[] = [
  { code: "af", name: "Afrikaans", nameWithRegionCode: "Afrikaans", nativeName: "Afrikaans", regionName: "South Africa", nativeRegionName: "Suid-Afrika", regionCode: "ZA", languageCode: "af", emoji: "🇿🇦", flag: "za" },
  { code: "am", name: "Amharic", nameWithRegionCode: "Amharic", nativeName: "አማርኛ", regionName: "Ethiopia", nativeRegionName: "ኢትዮጵያ", regionCode: "ET", languageCode: "am", emoji: "🇪🇹", flag: "et" },
  { code: "ar", name: "Arabic", nameWithRegionCode: "Arabic", nativeName: "العربية", regionName: "Egypt", nativeRegionName: "مصر", regionCode: "EG", languageCode: "ar", emoji: "🇪🇬", flag: "eg" },
  { code: "ar-AE", name: "Arabic (United Arab Emirates)", nameWithRegionCode: "Arabic (AE)", nativeName: "العربية (الإمارات العربية المتحدة)", regionName: "United Arab Emirates", nativeRegionName: "الإمارات العربية المتحدة", regionCode: "AE", languageCode: "ar", emoji: "🇦🇪", flag: "ae" },
  { code: "ar-EG", name: "Arabic (Egypt)", nameWithRegionCode: "Arabic (EG)", nativeName: "العربية (مصر)", regionName: "Egypt", nativeRegionName: "مصر", regionCode: "EG", languageCode: "ar", emoji: "🇪🇬", flag: "eg" },
  { code: "ar-LB", name: "Arabic (Lebanon)", nameWithRegionCode: "Arabic (LB)", nativeName: "العربية (لبنان)", regionName: "Lebanon", nativeRegionName: "لبنان", regionCode: "LB", languageCode: "ar", emoji: "🇱🇧", flag: "lb" },
  { code: "ar-MA", name: "Arabic (Morocco)", nameWithRegionCode: "Arabic (MA)", nativeName: "العربية (المغرب)", regionName: "Morocco", nativeRegionName: "المغرب", regionCode: "MA", languageCode: "ar", emoji: "🇲🇦", flag: "ma" },
  { code: "ar-OM", name: "Arabic (Oman)", nameWithRegionCode: "Arabic (OM)", nativeName: "العربية (عُمان)", regionName: "Oman", nativeRegionName: "عُمان", regionCode: "OM", languageCode: "ar", emoji: "🇴🇲", flag: "om" },
  { code: "ar-SA", name: "Arabic (Saudi Arabia)", nameWithRegionCode: "Arabic (SA)", nativeName: "العربية (المملكة العربية السعودية)", regionName: "Saudi Arabia", nativeRegionName: "المملكة العربية السعودية", regionCode: "SA", languageCode: "ar", emoji: "🇸🇦", flag: "sa" },
  { code: "bg", name: "Bulgarian", nameWithRegionCode: "Bulgarian", nativeName: "български", regionName: "Bulgaria", nativeRegionName: "България", regionCode: "BG", languageCode: "bg", emoji: "🇧🇬", flag: "bg" },
  { code: "bn", name: "Bangla", nameWithRegionCode: "Bangla", nativeName: "বাংলা", regionName: "Bangladesh", nativeRegionName: "বাংলাদেশ", regionCode: "BD", languageCode: "bn", emoji: "🇧🇩", flag: "bd" },
  { code: "bs", name: "Bosnian", nameWithRegionCode: "Bosnian", nativeName: "bosanski", regionName: "Bosnia & Herzegovina", nativeRegionName: "Bosna i Hercegovina", regionCode: "BA", languageCode: "bs", emoji: "🇧🇦", flag: "ba" },
  { code: "ca", name: "Catalan", nameWithRegionCode: "Catalan", nativeName: "català", regionName: "Spain", nativeRegionName: "Espanya", regionCode: "ES", languageCode: "ca", emoji: "🌍", flag: "es" },
  { code: "cs", name: "Czech", nameWithRegionCode: "Czech", nativeName: "čeština", regionName: "Czechia", nativeRegionName: "Česko", regionCode: "CZ", languageCode: "cs", emoji: "🇨🇿", flag: "cz" },
  { code: "cy", name: "Welsh", nameWithRegionCode: "Welsh", nativeName: "Cymraeg", regionName: "United Kingdom", nativeRegionName: "Y Deyrnas Unedig", regionCode: "GB", languageCode: "cy", emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", flag: "gb" },
  { code: "da", name: "Danish", nameWithRegionCode: "Danish", nativeName: "dansk", regionName: "Denmark", nativeRegionName: "Danmark", regionCode: "DK", languageCode: "da", emoji: "🇩🇰", flag: "dk" },
  { code: "de", name: "German", nameWithRegionCode: "German", nativeName: "Deutsch", regionName: "Germany", nativeRegionName: "Deutschland", regionCode: "DE", languageCode: "de", emoji: "🇩🇪", flag: "de" },
  { code: "de-AT", name: "Austrian German", nameWithRegionCode: "German (AT)", nativeName: "Österreichisches Deutsch", regionName: "Austria", nativeRegionName: "Österreich", regionCode: "AT", languageCode: "de", emoji: "🇦🇹", flag: "at" },
  { code: "de-CH", name: "Swiss High German", nameWithRegionCode: "German (CH)", nativeName: "Schweizer Hochdeutsch", regionName: "Switzerland", nativeRegionName: "Schweiz", regionCode: "CH", languageCode: "de", emoji: "🇨🇭", flag: "ch" },
  { code: "de-DE", name: "German (Germany)", nameWithRegionCode: "German (DE)", nativeName: "Deutsch (Deutschland)", regionName: "Germany", nativeRegionName: "Deutschland", regionCode: "DE", languageCode: "de", emoji: "🇩🇪", flag: "de" },
  { code: "el", name: "Greek", nameWithRegionCode: "Greek", nativeName: "Ελληνικά", regionName: "Greece", nativeRegionName: "Ελλάδα", regionCode: "GR", languageCode: "el", emoji: "🇬🇷", flag: "gr" },
  { code: "el-CY", name: "Greek (Cyprus)", nameWithRegionCode: "Greek (CY)", nativeName: "Ελληνικά (Κύπρος)", regionName: "Cyprus", nativeRegionName: "Κύπρος", regionCode: "CY", languageCode: "el", emoji: "🇨🇾", flag: "cy" },
  { code: "el-EL", name: "Greek (EL)", nameWithRegionCode: "Greek (EL)", nativeName: "Ελληνικά (EL)", regionName: "EL", nativeRegionName: "EL", regionCode: "EL", languageCode: "el", emoji: "🌍", flag: "el" },
  { code: "en", name: "English", nameWithRegionCode: "English", nativeName: "English", regionName: "United States", nativeRegionName: "United States", regionCode: "US", languageCode: "en", emoji: "🇺🇸", flag: "us" },
  { code: "en-AU", name: "Australian English", nameWithRegionCode: "English (AU)", nativeName: "Australian English", regionName: "Australia", nativeRegionName: "Australia", regionCode: "AU", languageCode: "en", emoji: "🇦🇺", flag: "au" },
  { code: "en-CA", name: "Canadian English", nameWithRegionCode: "English (CA)", nativeName: "Canadian English", regionName: "Canada", nativeRegionName: "Canada", regionCode: "CA", languageCode: "en", emoji: "🇨🇦", flag: "ca" },
  { code: "en-GB", name: "British English", nameWithRegionCode: "English (GB)", nativeName: "British English", regionName: "United Kingdom", nativeRegionName: "United Kingdom", regionCode: "GB", languageCode: "en", emoji: "🇬🇧", flag: "gb" },
  { code: "en-NZ", name: "English (New Zealand)", nameWithRegionCode: "English (NZ)", nativeName: "English (New Zealand)", regionName: "New Zealand", nativeRegionName: "New Zealand", regionCode: "NZ", languageCode: "en", emoji: "🇳🇿", flag: "nz" },
  { code: "en-US", name: "American English", nameWithRegionCode: "English (US)", nativeName: "American English", regionName: "United States", nativeRegionName: "United States", regionCode: "US", languageCode: "en", emoji: "🇺🇸", flag: "us" },
  { code: "eo", name: "Esperanto", nameWithRegionCode: "Esperanto", nativeName: "Esperanto", regionName: "world", nativeRegionName: "mondo", regionCode: "001", languageCode: "eo", emoji: "🌍", flag: "" },
  { code: "es", name: "Spanish", nameWithRegionCode: "Spanish", nativeName: "español", regionName: "Spain", nativeRegionName: "España", regionCode: "ES", languageCode: "es", emoji: "🇪🇸", flag: "es" },
  { code: "es-419", name: "Latin American Spanish", nameWithRegionCode: "Spanish (419)", nativeName: "español latinoamericano", regionName: "Latin America", nativeRegionName: "Latinoamérica", regionCode: "419", languageCode: "es", emoji: "🌎", flag: "" },
  { code: "es-AR", name: "Spanish (Argentina)", nameWithRegionCode: "Spanish (AR)", nativeName: "español (Argentina)", regionName: "Argentina", nativeRegionName: "Argentina", regionCode: "AR", languageCode: "es", emoji: "🇦🇷", flag: "ar" },
  { code: "es-CL", name: "Spanish (Chile)", nameWithRegionCode: "Spanish (CL)", nativeName: "español (Chile)", regionName: "Chile", nativeRegionName: "Chile", regionCode: "CL", languageCode: "es", emoji: "🇨🇱", flag: "cl" },
  { code: "es-CO", name: "Spanish (Colombia)", nameWithRegionCode: "Spanish (CO)", nativeName: "español (Colombia)", regionName: "Colombia", nativeRegionName: "Colombia", regionCode: "CO", languageCode: "es", emoji: "🇨🇴", flag: "co" },
  { code: "es-ES", name: "European Spanish", nameWithRegionCode: "Spanish (ES)", nativeName: "español de España", regionName: "Spain", nativeRegionName: "España", regionCode: "ES", languageCode: "es", emoji: "🇪🇸", flag: "es" },
  { code: "es-MX", name: "Mexican Spanish", nameWithRegionCode: "Spanish (MX)", nativeName: "español de México", regionName: "Mexico", nativeRegionName: "México", regionCode: "MX", languageCode: "es", emoji: "🇲🇽", flag: "mx" },
  { code: "es-PE", name: "Spanish (Peru)", nameWithRegionCode: "Spanish (PE)", nativeName: "español (Perú)", regionName: "Peru", nativeRegionName: "Perú", regionCode: "PE", languageCode: "es", emoji: "🇵🇪", flag: "pe" },
  { code: "es-US", name: "Spanish (United States)", nameWithRegionCode: "Spanish (US)", nativeName: "español (Estados Unidos)", regionName: "United States", nativeRegionName: "Estados Unidos", regionCode: "US", languageCode: "es", emoji: "🇺🇸", flag: "us" },
  { code: "es-VE", name: "Spanish (Venezuela)", nameWithRegionCode: "Spanish (VE)", nativeName: "español (Venezuela)", regionName: "Venezuela", nativeRegionName: "Venezuela", regionCode: "VE", languageCode: "es", emoji: "🇻🇪", flag: "ve" },
  { code: "et", name: "Estonian", nameWithRegionCode: "Estonian", nativeName: "eesti", regionName: "Estonia", nativeRegionName: "Eesti", regionCode: "EE", languageCode: "et", emoji: "🇪🇪", flag: "ee" },
  { code: "fa", name: "Persian", nameWithRegionCode: "Persian", nativeName: "فارسی", regionName: "Iran", nativeRegionName: "ایران", regionCode: "IR", languageCode: "fa", emoji: "🇮🇷", flag: "ir" },
  { code: "fi", name: "Finnish", nameWithRegionCode: "Finnish", nativeName: "suomi", regionName: "Finland", nativeRegionName: "Suomi", regionCode: "FI", languageCode: "fi", emoji: "🇫🇮", flag: "fi" },
  { code: "fil", name: "Filipino", nameWithRegionCode: "Filipino", nativeName: "Filipino", regionName: "Philippines", nativeRegionName: "Pilipinas", regionCode: "PH", languageCode: "fil", emoji: "🇵🇭", flag: "ph" },
  { code: "fr", name: "French", nameWithRegionCode: "French", nativeName: "français", regionName: "France", nativeRegionName: "France", regionCode: "FR", languageCode: "fr", emoji: "🇫🇷", flag: "fr" },
  { code: "fr-BE", name: "French (Belgium)", nameWithRegionCode: "French (BE)", nativeName: "français (Belgique)", regionName: "Belgium", nativeRegionName: "Belgique", regionCode: "BE", languageCode: "fr", emoji: "🇧🇪", flag: "be" },
  { code: "fr-CA", name: "Canadian French", nameWithRegionCode: "French (CA)", nativeName: "français canadien", regionName: "Canada", nativeRegionName: "Canada", regionCode: "CA", languageCode: "fr", emoji: "🇨🇦", flag: "ca" },
  { code: "fr-CH", name: "Swiss French", nameWithRegionCode: "French (CH)", nativeName: "français suisse", regionName: "Switzerland", nativeRegionName: "Suisse", regionCode: "CH", languageCode: "fr", emoji: "🇨🇭", flag: "ch" },
  { code: "fr-CM", name: "French (Cameroon)", nameWithRegionCode: "French (CM)", nativeName: "français (Cameroun)", regionName: "Cameroon", nativeRegionName: "Cameroun", regionCode: "CM", languageCode: "fr", emoji: "🇨🇲", flag: "cm" },
  { code: "fr-FR", name: "French (France)", nameWithRegionCode: "French (FR)", nativeName: "français (France)", regionName: "France", nativeRegionName: "France", regionCode: "FR", languageCode: "fr", emoji: "🇫🇷", flag: "fr" },
  { code: "fr-SN", name: "French (Senegal)", nameWithRegionCode: "French (SN)", nativeName: "français (Sénégal)", regionName: "Senegal", nativeRegionName: "Sénégal", regionCode: "SN", languageCode: "fr", emoji: "🇸🇳", flag: "sn" },
  { code: "gu", name: "Gujarati", nameWithRegionCode: "Gujarati", nativeName: "ગુજરાતી", regionName: "India", nativeRegionName: "ભારત", regionCode: "IN", languageCode: "gu", emoji: "🇮🇳", flag: "in" },
  { code: "ha", name: "Hausa", nameWithRegionCode: "Hausa", nativeName: "Hausa", regionName: "Nigeria", nativeRegionName: "Nijeriya", regionCode: "NG", languageCode: "ha", emoji: "🇳🇬", flag: "ng" },
  { code: "he", name: "Hebrew", nameWithRegionCode: "Hebrew", nativeName: "עברית", regionName: "Israel", nativeRegionName: "ישראל", regionCode: "IL", languageCode: "he", emoji: "🇮🇱", flag: "il" },
  { code: "hi", name: "Hindi", nameWithRegionCode: "Hindi", nativeName: "हिन्दी", regionName: "India", nativeRegionName: "भारत", regionCode: "IN", languageCode: "hi", emoji: "🇮🇳", flag: "in" },
  { code: "hr", name: "Croatian", nameWithRegionCode: "Croatian", nativeName: "hrvatski", regionName: "Croatia", nativeRegionName: "Hrvatska", regionCode: "HR", languageCode: "hr", emoji: "🇭🇷", flag: "hr" },
  { code: "hu", name: "Hungarian", nameWithRegionCode: "Hungarian", nativeName: "magyar", regionName: "Hungary", nativeRegionName: "Magyarország", regionCode: "HU", languageCode: "hu", emoji: "🇭🇺", flag: "hu" },
  { code: "hy", name: "Armenian", nameWithRegionCode: "Armenian", nativeName: "հայերեն", regionName: "Armenia", nativeRegionName: "Հայաստան", regionCode: "AM", languageCode: "hy", emoji: "🇦🇲", flag: "am" },
  { code: "id", name: "Indonesian", nameWithRegionCode: "Indonesian", nativeName: "Indonesia", regionName: "Indonesia", nativeRegionName: "Indonesia", regionCode: "ID", languageCode: "id", emoji: "🇮🇩", flag: "id" },
  { code: "ig", name: "Igbo", nameWithRegionCode: "Igbo", nativeName: "Igbo", regionName: "Nigeria", nativeRegionName: "Naịjịrịa", regionCode: "NG", languageCode: "ig", emoji: "🇳🇬", flag: "ng" },
  { code: "is", name: "Icelandic", nameWithRegionCode: "Icelandic", nativeName: "íslenska", regionName: "Iceland", nativeRegionName: "Ísland", regionCode: "IS", languageCode: "is", emoji: "🇮🇸", flag: "is" },
  { code: "it", name: "Italian", nameWithRegionCode: "Italian", nativeName: "italiano", regionName: "Italy", nativeRegionName: "Italia", regionCode: "IT", languageCode: "it", emoji: "🇮🇹", flag: "it" },
  { code: "it-CH", name: "Italian (Switzerland)", nameWithRegionCode: "Italian (CH)", nativeName: "italiano (Svizzera)", regionName: "Switzerland", nativeRegionName: "Svizzera", regionCode: "CH", languageCode: "it", emoji: "🇨🇭", flag: "ch" },
  { code: "it-IT", name: "Italian (Italy)", nameWithRegionCode: "Italian (IT)", nativeName: "italiano (Italia)", regionName: "Italy", nativeRegionName: "Italia", regionCode: "IT", languageCode: "it", emoji: "🇮🇹", flag: "it" },
  { code: "ja", name: "Japanese", nameWithRegionCode: "Japanese", nativeName: "日本語", regionName: "Japan", nativeRegionName: "日本", regionCode: "JP", languageCode: "ja", emoji: "🇯🇵", flag: "jp" },
  { code: "ka", name: "Georgian", nameWithRegionCode: "Georgian", nativeName: "ქართული", regionName: "Georgia", nativeRegionName: "საქართველო", regionCode: "GE", languageCode: "ka", emoji: "🇬🇪", flag: "ge" },
  { code: "kk", name: "Kazakh", nameWithRegionCode: "Kazakh", nativeName: "қазақ тілі", regionName: "Kazakhstan", nativeRegionName: "Қазақстан", regionCode: "KZ", languageCode: "kk", emoji: "🇰🇿", flag: "kz" },
  { code: "kn", name: "Kannada", nameWithRegionCode: "Kannada", nativeName: "ಕನ್ನಡ", regionName: "India", nativeRegionName: "ಭಾರತ", regionCode: "IN", languageCode: "kn", emoji: "🇮🇳", flag: "in" },
  { code: "ko", name: "Korean", nameWithRegionCode: "Korean", nativeName: "한국어", regionName: "South Korea", nativeRegionName: "대한민국", regionCode: "KR", languageCode: "ko", emoji: "🇰🇷", flag: "kr" },
  { code: "la", name: "Latin", nameWithRegionCode: "Latin", nativeName: "Latin", regionName: "Vatican City", nativeRegionName: "Vatican City", regionCode: "VA", languageCode: "la", emoji: "🇻🇦", flag: "va" },
  { code: "lt", name: "Lithuanian", nameWithRegionCode: "Lithuanian", nativeName: "lietuvių", regionName: "Lithuania", nativeRegionName: "Lietuva", regionCode: "LT", languageCode: "lt", emoji: "🇱🇹", flag: "lt" },
  { code: "lv", name: "Latvian", nameWithRegionCode: "Latvian", nativeName: "latviešu", regionName: "Latvia", nativeRegionName: "Latvija", regionCode: "LV", languageCode: "lv", emoji: "🇱🇻", flag: "lv" },
  { code: "mk", name: "Macedonian", nameWithRegionCode: "Macedonian", nativeName: "македонски", regionName: "North Macedonia", nativeRegionName: "Северна Македонија", regionCode: "MK", languageCode: "mk", emoji: "🇲🇰", flag: "mk" },
  { code: "ml", name: "Malayalam", nameWithRegionCode: "Malayalam", nativeName: "മലയാളം", regionName: "India", nativeRegionName: "ഇന്ത്യ", regionCode: "IN", languageCode: "ml", emoji: "🇮🇳", flag: "in" },
  { code: "mn", name: "Mongolian", nameWithRegionCode: "Mongolian", nativeName: "монгол", regionName: "Mongolia", nativeRegionName: "Монгол", regionCode: "MN", languageCode: "mn", emoji: "🇲🇳", flag: "mn" },
  { code: "mr", name: "Marathi", nameWithRegionCode: "Marathi", nativeName: "मराठी", regionName: "India", nativeRegionName: "भारत", regionCode: "IN", languageCode: "mr", emoji: "🇮🇳", flag: "in" },
  { code: "ms", name: "Malay", nameWithRegionCode: "Malay", nativeName: "Melayu", regionName: "Malaysia", nativeRegionName: "Malaysia", regionCode: "MY", languageCode: "ms", emoji: "🇲🇾", flag: "my" },
  { code: "my", name: "Burmese", nameWithRegionCode: "Burmese", nativeName: "မြန်မာ", regionName: "Myanmar (Burma)", nativeRegionName: "မြန်မာ", regionCode: "MM", languageCode: "my", emoji: "🇲🇲", flag: "mm" },
  { code: "nb", name: "Norwegian Bokmål", nameWithRegionCode: "Norwegian Bokmål", nativeName: "norsk bokmål", regionName: "Norway", nativeRegionName: "Norge", regionCode: "NO", languageCode: "nb", emoji: "🇳🇴", flag: "no" },
  { code: "nb-NO", name: "Norwegian Bokmål (Norway)", nameWithRegionCode: "Norwegian Bokmål (NO)", nativeName: "norsk bokmål (Norge)", regionName: "Norway", nativeRegionName: "Norge", regionCode: "NO", languageCode: "nb", emoji: "🇳🇴", flag: "no" },
  { code: "nl", name: "Dutch", nameWithRegionCode: "Dutch", nativeName: "Nederlands", regionName: "Netherlands", nativeRegionName: "Nederland", regionCode: "NL", languageCode: "nl", emoji: "🇳🇱", flag: "nl" },
  { code: "nl-BE", name: "Flemish", nameWithRegionCode: "Dutch (BE)", nativeName: "Vlaams", regionName: "Belgium", nativeRegionName: "België", regionCode: "BE", languageCode: "nl", emoji: "🇧🇪", flag: "be" },
  { code: "nl-NL", name: "Dutch (Netherlands)", nameWithRegionCode: "Dutch (NL)", nativeName: "Nederlands (Nederland)", regionName: "Netherlands", nativeRegionName: "Nederland", regionCode: "NL", languageCode: "nl", emoji: "🇳🇱", flag: "nl" },
  { code: "nn", name: "Norwegian Nynorsk", nameWithRegionCode: "Norwegian Nynorsk", nativeName: "norsk nynorsk", regionName: "Norway", nativeRegionName: "Noreg", regionCode: "NO", languageCode: "nn", emoji: "🇳🇴", flag: "no" },
  { code: "nn-NO", name: "Norwegian Nynorsk (Norway)", nameWithRegionCode: "Norwegian Nynorsk (NO)", nativeName: "norsk nynorsk (Noreg)", regionName: "Norway", nativeRegionName: "Noreg", regionCode: "NO", languageCode: "nn", emoji: "🇳🇴", flag: "no" },
  { code: "no", name: "Norwegian", nameWithRegionCode: "Norwegian", nativeName: "norsk", regionName: "Norway", nativeRegionName: "Norge", regionCode: "NO", languageCode: "no", emoji: "🇳🇴", flag: "no" },
  { code: "no-NO", name: "Norwegian (Norway)", nameWithRegionCode: "Norwegian (NO)", nativeName: "norsk (Norge)", regionName: "Norway", nativeRegionName: "Norge", regionCode: "NO", languageCode: "no", emoji: "🇳🇴", flag: "no" },
  { code: "pa", name: "Punjabi", nameWithRegionCode: "Punjabi", nativeName: "ਪੰਜਾਬੀ", regionName: "India", nativeRegionName: "ਭਾਰਤ", regionCode: "IN", languageCode: "pa", emoji: "🇮🇳", flag: "in" },
  { code: "pl", name: "Polish", nameWithRegionCode: "Polish", nativeName: "polski", regionName: "Poland", nativeRegionName: "Polska", regionCode: "PL", languageCode: "pl", emoji: "🇵🇱", flag: "pl" },
  { code: "pt", name: "Portuguese", nameWithRegionCode: "Portuguese", nativeName: "português", regionName: "Brazil", nativeRegionName: "Brasil", regionCode: "BR", languageCode: "pt", emoji: "🇧🇷", flag: "br" },
  { code: "pt-BR", name: "Brazilian Portuguese", nameWithRegionCode: "Portuguese (BR)", nativeName: "português (Brasil)", regionName: "Brazil", nativeRegionName: "Brasil", regionCode: "BR", languageCode: "pt", emoji: "🇧🇷", flag: "br" },
  { code: "pt-PT", name: "European Portuguese", nameWithRegionCode: "Portuguese (PT)", nativeName: "português europeu", regionName: "Portugal", nativeRegionName: "Portugal", regionCode: "PT", languageCode: "pt", emoji: "🇵🇹", flag: "pt" },
  { code: "ro", name: "Romanian", nameWithRegionCode: "Romanian", nativeName: "română", regionName: "Romania", nativeRegionName: "România", regionCode: "RO", languageCode: "ro", emoji: "🇷🇴", flag: "ro" },
  { code: "ru", name: "Russian", nameWithRegionCode: "Russian", nativeName: "русский", regionName: "Russia", nativeRegionName: "Россия", regionCode: "RU", languageCode: "ru", emoji: "🇷🇺", flag: "ru" },
  { code: "sk", name: "Slovak", nameWithRegionCode: "Slovak", nativeName: "slovenčina", regionName: "Slovakia", nativeRegionName: "Slovensko", regionCode: "SK", languageCode: "sk", emoji: "🇸🇰", flag: "sk" },
  { code: "sl", name: "Slovenian", nameWithRegionCode: "Slovenian", nativeName: "slovenščina", regionName: "Slovenia", nativeRegionName: "Slovenija", regionCode: "SI", languageCode: "sl", emoji: "🇸🇮", flag: "si" },
  { code: "so", name: "Somali", nameWithRegionCode: "Somali", nativeName: "Soomaali", regionName: "Somalia", nativeRegionName: "Soomaaliya", regionCode: "SO", languageCode: "so", emoji: "🇸🇴", flag: "so" },
  { code: "sq", name: "Albanian", nameWithRegionCode: "Albanian", nativeName: "shqip", regionName: "Albania", nativeRegionName: "Shqipëri", regionCode: "AL", languageCode: "sq", emoji: "🇦🇱", flag: "al" },
  { code: "sr", name: "Serbian", nameWithRegionCode: "Serbian", nativeName: "српски", regionName: "Serbia", nativeRegionName: "Србија", regionCode: "RS", languageCode: "sr", emoji: "🇷🇸", flag: "rs" },
  { code: "sv", name: "Swedish", nameWithRegionCode: "Swedish", nativeName: "svenska", regionName: "Sweden", nativeRegionName: "Sverige", regionCode: "SE", languageCode: "sv", emoji: "🇸🇪", flag: "se" },
  { code: "sw", name: "Swahili", nameWithRegionCode: "Swahili", nativeName: "Kiswahili", regionName: "Tanzania", nativeRegionName: "Tanzania", regionCode: "TZ", languageCode: "sw", emoji: "🇹🇿", flag: "tz" },
  { code: "sw-KE", name: "Swahili (Kenya)", nameWithRegionCode: "Swahili (KE)", nativeName: "Kiswahili (Kenya)", regionName: "Kenya", nativeRegionName: "Kenya", regionCode: "KE", languageCode: "sw", emoji: "🇰🇪", flag: "ke" },
  { code: "sw-TZ", name: "Swahili (Tanzania)", nameWithRegionCode: "Swahili (TZ)", nativeName: "Kiswahili (Tanzania)", regionName: "Tanzania", nativeRegionName: "Tanzania", regionCode: "TZ", languageCode: "sw", emoji: "🇹🇿", flag: "tz" },
  { code: "ta", name: "Tamil", nameWithRegionCode: "Tamil", nativeName: "தமிழ்", regionName: "India", nativeRegionName: "இந்தியா", regionCode: "IN", languageCode: "ta", emoji: "🇮🇳", flag: "in" },
  { code: "te", name: "Telugu", nameWithRegionCode: "Telugu", nativeName: "తెలుగు", regionName: "India", nativeRegionName: "భారతదేశం", regionCode: "IN", languageCode: "te", emoji: "🇮🇳", flag: "in" },
  { code: "th", name: "Thai", nameWithRegionCode: "Thai", nativeName: "ไทย", regionName: "Thailand", nativeRegionName: "ไทย", regionCode: "TH", languageCode: "th", emoji: "🇹🇭", flag: "th" },
  { code: "tl", name: "Filipino", nameWithRegionCode: "Filipino", nativeName: "Filipino", regionName: "Philippines", nativeRegionName: "Pilipinas", regionCode: "PH", languageCode: "fil", emoji: "🇵🇭", flag: "ph" },
  { code: "tr", name: "Turkish", nameWithRegionCode: "Turkish", nativeName: "Türkçe", regionName: "Türkiye", nativeRegionName: "Türkiye", regionCode: "TR", languageCode: "tr", emoji: "🇹🇷", flag: "tr" },
  { code: "uk", name: "Ukrainian", nameWithRegionCode: "Ukrainian", nativeName: "українська", regionName: "Ukraine", nativeRegionName: "Україна", regionCode: "UA", languageCode: "uk", emoji: "🇺🇦", flag: "ua" },
  { code: "ur", name: "Urdu", nameWithRegionCode: "Urdu", nativeName: "اردو", regionName: "Pakistan", nativeRegionName: "پاکستان", regionCode: "PK", languageCode: "ur", emoji: "🇵🇰", flag: "pk" },
  { code: "uz", name: "Uzbek", nameWithRegionCode: "Uzbek", nativeName: "o‘zbek", regionName: "Uzbekistan", nativeRegionName: "Oʻzbekiston", regionCode: "UZ", languageCode: "uz", emoji: "🇺🇿", flag: "uz" },
  { code: "vi", name: "Vietnamese", nameWithRegionCode: "Vietnamese", nativeName: "Tiếng Việt", regionName: "Vietnam", nativeRegionName: "Việt Nam", regionCode: "VN", languageCode: "vi", emoji: "🇻🇳", flag: "vn" },
  { code: "yo", name: "Yoruba", nameWithRegionCode: "Yoruba", nativeName: "Èdè Yorùbá", regionName: "Nigeria", nativeRegionName: "Nàìjíríà", regionCode: "NG", languageCode: "yo", emoji: "🇳🇬", flag: "ng" },
  { code: "zh", name: "Chinese", nameWithRegionCode: "Chinese", nativeName: "中文", regionName: "China", nativeRegionName: "中国", regionCode: "CN", languageCode: "zh", emoji: "🇨🇳", flag: "cn" },
  { code: "zh-CN", name: "Chinese (China)", nameWithRegionCode: "Chinese (CN)", nativeName: "中文（中国）", regionName: "China", nativeRegionName: "中国", regionCode: "CN", languageCode: "zh", emoji: "🇨🇳", flag: "cn" },
  { code: "zh-HK", name: "Chinese (Hong Kong SAR China)", nameWithRegionCode: "Chinese (HK)", nativeName: "中文（中國香港特別行政區）", regionName: "Hong Kong SAR China", nativeRegionName: "中國香港特別行政區", regionCode: "HK", languageCode: "zh", emoji: "🇭🇰", flag: "hk" },
  { code: "zh-Hans", name: "Simplified Chinese", nameWithRegionCode: "Simplified Chinese", nativeName: "简体中文", regionName: "China", nativeRegionName: "中国", regionCode: "CN", languageCode: "zh", emoji: "🇨🇳", flag: "cn" },
  { code: "zh-Hant", name: "Traditional Chinese", nameWithRegionCode: "Traditional Chinese", nativeName: "繁體中文", regionName: "Taiwan", nativeRegionName: "台灣", regionCode: "TW", languageCode: "zh", emoji: "🇹🇼", flag: "tw" },
  { code: "zh-SG", name: "Chinese (Singapore)", nameWithRegionCode: "Chinese (SG)", nativeName: "中文（新加坡）", regionName: "Singapore", nativeRegionName: "新加坡", regionCode: "SG", languageCode: "zh", emoji: "🇸🇬", flag: "sg" },
  { code: "zh-TW", name: "Chinese (Taiwan)", nameWithRegionCode: "Chinese (TW)", nativeName: "中文（台灣）", regionName: "Taiwan", nativeRegionName: "台灣", regionCode: "TW", languageCode: "zh", emoji: "🇹🇼", flag: "tw" },
];
