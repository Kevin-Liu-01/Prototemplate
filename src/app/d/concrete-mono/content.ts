/**
 * Static content for the Concrete Mono direction.
 *
 * Every translated string here is a real translation of the English string it
 * is paired with — the hero's whole claim is that the wall on the right is the
 * wall on the left, in another language, so placeholder glyph soup would break
 * the premise. Each component carries four locales it cycles through; the
 * eighteen components start on eighteen different locales, so the wall shows
 * the full spread at any single frame.
 */

export type WallKind =
  | 'search'
  | 'button'
  | 'toast'
  | 'checkbox'
  | 'card'
  | 'progress'
  | 'select'
  | 'switch'
  | 'tabs'
  | 'textarea'
  | 'api'
  | 'field'
  | 'banner'
  | 'stat'
  | 'nav'
  | 'quote'
  | 'segment'
  | 'actions';

/** One rendering of a component. `a`/`b`/`c` mean whatever the kind needs. */
export type WallStrings = {
  /** Uppercase locale stamp shown on the translated side. */
  locale: string;
  /** BCP-47 tag, for the `lang` attribute. */
  lang: string;
  rtl?: boolean;
  a: string;
  b?: string;
  c?: string;
};

export type WallSpec = {
  id: string;
  kind: WallKind;
  en: WallStrings;
  /** Cycled in place, resizing the container as the text length changes. */
  tr: WallStrings[];
};

export const WALL_SPECS: WallSpec[] = [
  {
    id: 'search',
    kind: 'search',
    en: { locale: 'EN', lang: 'en', a: 'Search documentation' },
    tr: [
      { locale: 'ID', lang: 'id', a: 'Cari dokumentasi' },
      { locale: 'JA', lang: 'ja', a: 'ドキュメントを検索' },
      { locale: 'DE', lang: 'de', a: 'Dokumentation durchsuchen' },
      { locale: 'PT', lang: 'pt', a: 'Pesquisar documentação' },
    ],
  },
  {
    id: 'plan',
    kind: 'card',
    en: { locale: 'EN', lang: 'en', a: 'Pro', b: '$20 / month', c: 'Unlimited projects' },
    tr: [
      { locale: 'PL', lang: 'pl', a: 'Pro', b: '20 $ / miesiąc', c: 'Nielimitowane projekty' },
      { locale: 'JA', lang: 'ja', a: 'プロ', b: '月額 2,900円', c: 'プロジェクト無制限' },
      { locale: 'FR', lang: 'fr', a: 'Pro', b: '20 $ / mois', c: 'Projets illimités' },
      { locale: 'PT', lang: 'pt', a: 'Pro', b: 'US$ 20 / mês', c: 'Projetos ilimitados' },
    ],
  },
  {
    id: 'toast',
    kind: 'toast',
    en: { locale: 'EN', lang: 'en', a: 'Payment received', b: 'just now' },
    tr: [
      { locale: 'FR', lang: 'fr', a: 'Paiement reçu', b: 'à l’instant' },
      { locale: 'KO', lang: 'ko', a: '결제가 완료되었습니다', b: '방금' },
      { locale: 'IT', lang: 'it', a: 'Pagamento ricevuto', b: 'adesso' },
      { locale: 'SV', lang: 'sv', a: 'Betalning mottagen', b: 'just nu' },
    ],
  },
  {
    id: 'remember',
    kind: 'checkbox',
    en: { locale: 'EN', lang: 'en', a: 'Remember me on this device' },
    tr: [
      { locale: 'DE', lang: 'de', a: 'Auf diesem Gerät angemeldet bleiben' },
      { locale: 'NL', lang: 'nl', a: 'Onthoud mij op dit apparaat' },
      { locale: 'ES', lang: 'es', a: 'Recuérdame en este dispositivo' },
      { locale: 'TR', lang: 'tr', a: 'Bu cihazda beni hatırla' },
    ],
  },
  {
    id: 'nav',
    kind: 'nav',
    en: { locale: 'EN', lang: 'en', a: 'Home · Docs · Pricing' },
    tr: [
      { locale: 'VI', lang: 'vi', a: 'Trang chủ · Tài liệu · Bảng giá' },
      { locale: 'KO', lang: 'ko', a: '홈 · 문서 · 요금제' },
      { locale: 'JA', lang: 'ja', a: 'ホーム · ドキュメント · 料金' },
      { locale: 'IT', lang: 'it', a: 'Home · Documenti · Prezzi' },
    ],
  },
  {
    id: 'users',
    kind: 'stat',
    en: { locale: 'EN', lang: 'en', a: 'Active users', b: '1,284' },
    tr: [
      { locale: 'TH', lang: 'th', a: 'ผู้ใช้ที่ใช้งานอยู่', b: '1,284' },
      { locale: 'SV', lang: 'sv', a: 'Aktiva användare', b: '1 284' },
      { locale: 'ES', lang: 'es', a: 'Usuarios activos', b: '1.284' },
      { locale: 'PL', lang: 'pl', a: 'Aktywni użytkownicy', b: '1 284' },
    ],
  },

  {
    id: 'email',
    kind: 'field',
    en: { locale: 'EN', lang: 'en', a: 'Email address', b: 'you@company.com' },
    tr: [
      { locale: 'TR', lang: 'tr', a: 'E-posta adresi', b: 'siz@sirket.com' },
      { locale: 'KO', lang: 'ko', a: '이메일 주소', b: 'you@company.com' },
      { locale: 'DA', lang: 'da', a: 'E-mailadresse', b: 'dig@firma.dk' },
      { locale: 'FR', lang: 'fr', a: 'Adresse e-mail', b: 'vous@entreprise.com' },
    ],
  },
  {
    id: 'theo',
    kind: 'quote',
    en: {
      locale: 'EN',
      lang: 'en',
      a: 'Internationalization went from “$%!# this” to “trivial”.',
      b: 'Theo',
      c: 'CEO, T3 Chat',
    },
    tr: [
      {
        locale: 'JA',
        lang: 'ja',
        a: '国際化が「$%!# this」から「trivial」になりました。',
        b: 'Theo',
        c: 'T3 Chat CEO',
      },
      {
        locale: 'ES',
        lang: 'es',
        a: 'La internacionalización pasó de «$%!# this» a «trivial».',
        b: 'Theo',
        c: 'CEO, T3 Chat',
      },
      {
        locale: 'DE',
        lang: 'de',
        a: 'Internationalisierung ging von „$%!# this“ zu „trivial“.',
        b: 'Theo',
        c: 'CEO, T3 Chat',
      },
      {
        locale: 'FR',
        lang: 'fr',
        a: 'L’internationalisation est passée de « $%!# this » à « trivial ».',
        b: 'Theo',
        c: 'PDG, T3 Chat',
      },
    ],
  },
  {
    id: 'tabs',
    kind: 'tabs',
    en: { locale: 'EN', lang: 'en', a: 'Overview / Usage / Settings' },
    tr: [
      { locale: 'ZH', lang: 'zh', a: '概览 / 用量 / 设置' },
      { locale: 'DA', lang: 'da', a: 'Oversigt / Forbrug / Indstillinger' },
      { locale: 'FR', lang: 'fr', a: 'Aperçu / Utilisation / Réglages' },
      { locale: 'TR', lang: 'tr', a: 'Genel bakış / Kullanım / Ayarlar' },
    ],
  },
  {
    id: 'notify',
    kind: 'switch',
    en: { locale: 'EN', lang: 'en', a: 'Email notifications' },
    tr: [
      { locale: 'PT', lang: 'pt', a: 'Notificações por e-mail' },
      { locale: 'TH', lang: 'th', a: 'การแจ้งเตือนทางอีเมล' },
      { locale: 'KO', lang: 'ko', a: '이메일 알림' },
      { locale: 'NL', lang: 'nl', a: 'E-mailmeldingen' },
    ],
  },
  {
    id: 'upload',
    kind: 'progress',
    en: { locale: 'EN', lang: 'en', a: 'Uploading translations', b: '68%' },
    tr: [
      { locale: 'AR', lang: 'ar', rtl: true, a: 'جارٍ رفع الترجمات', b: '٦٨٪' },
      { locale: 'ZH', lang: 'zh', a: '正在上传翻译', b: '68%' },
      { locale: 'VI', lang: 'vi', a: 'Đang tải bản dịch lên', b: '68%' },
      { locale: 'ES', lang: 'es', a: 'Subiendo traducciones', b: '68 %' },
    ],
  },
  {
    id: 'cta',
    kind: 'button',
    en: { locale: 'EN', lang: 'en', a: 'Get started' },
    tr: [
      { locale: 'ES', lang: 'es', a: 'Comenzar ahora' },
      { locale: 'JA', lang: 'ja', a: '始める' },
      { locale: 'DE', lang: 'de', a: 'Jetzt starten' },
      { locale: 'KO', lang: 'ko', a: '시작하기' },
    ],
  },

  {
    id: 'country',
    kind: 'select',
    en: { locale: 'EN', lang: 'en', a: 'Country', b: 'United States' },
    tr: [
      { locale: 'IT', lang: 'it', a: 'Paese', b: 'Stati Uniti' },
      { locale: 'HI', lang: 'hi', a: 'देश', b: 'संयुक्त राज्य अमेरिका' },
      { locale: 'JA', lang: 'ja', a: '国', b: 'アメリカ合衆国' },
      { locale: 'DE', lang: 'de', a: 'Land', b: 'Vereinigte Staaten' },
    ],
  },
  {
    id: 'trial',
    kind: 'banner',
    en: { locale: 'EN', lang: 'en', a: 'Your trial ends in 3 days' },
    tr: [
      { locale: 'HI', lang: 'hi', a: 'आपका ट्रायल 3 दिनों में समाप्त हो रहा है' },
      { locale: 'DE', lang: 'de', a: 'Ihre Testphase endet in 3 Tagen' },
      { locale: 'PT', lang: 'pt', a: 'Seu teste termina em 3 dias' },
      { locale: 'ZH', lang: 'zh', a: '您的试用将在 3 天后结束' },
    ],
  },
  {
    id: 'comment',
    kind: 'textarea',
    en: { locale: 'EN', lang: 'en', a: 'Leave a comment…' },
    tr: [
      { locale: 'NL', lang: 'nl', a: 'Laat een reactie achter…' },
      { locale: 'ID', lang: 'id', a: 'Tinggalkan komentar…' },
      { locale: 'ES', lang: 'es', a: 'Deja un comentario…' },
      { locale: 'IT', lang: 'it', a: 'Lascia un commento…' },
    ],
  },
  {
    id: 'deploy',
    kind: 'api',
    en: { locale: 'EN', lang: 'en', a: 'Deploy', b: 'POST /v1/translations' },
    tr: [
      { locale: 'SV', lang: 'sv', a: 'Distribuera', b: 'POST /v1/translations' },
      { locale: 'JA', lang: 'ja', a: 'デプロイ', b: 'POST /v1/translations' },
      { locale: 'PL', lang: 'pl', a: 'Wdróż', b: 'POST /v1/translations' },
      { locale: 'VI', lang: 'vi', a: 'Triển khai', b: 'POST /v1/translations' },
    ],
  },
  {
    id: 'billing',
    kind: 'segment',
    en: { locale: 'EN', lang: 'en', a: 'Monthly / Yearly' },
    tr: [
      { locale: 'DA', lang: 'da', a: 'Månedligt / Årligt' },
      { locale: 'SV', lang: 'sv', a: 'Månadsvis / Årsvis' },
      { locale: 'ID', lang: 'id', a: 'Bulanan / Tahunan' },
      { locale: 'ES', lang: 'es', a: 'Mensual / Anual' },
    ],
  },
  {
    id: 'dialog',
    kind: 'actions',
    en: { locale: 'EN', lang: 'en', a: 'Cancel', b: 'Save changes' },
    tr: [
      { locale: 'KO', lang: 'ko', a: '취소', b: '변경사항 저장' },
      { locale: 'PL', lang: 'pl', a: 'Anuluj', b: 'Zapisz zmiany' },
      { locale: 'TH', lang: 'th', a: 'ยกเลิก', b: 'บันทึกการเปลี่ยนแปลง' },
      { locale: 'HI', lang: 'hi', a: 'रद्द करें', b: 'बदलाव सहेजें' },
    ],
  },

  {
    id: 'signin',
    kind: 'button',
    en: { locale: 'EN', lang: 'en', a: 'Sign in' },
    tr: [
      { locale: 'FR', lang: 'fr', a: 'Se connecter' },
      { locale: 'JA', lang: 'ja', a: 'ログイン' },
      { locale: 'ZH', lang: 'zh', a: '登录' },
      { locale: 'PT', lang: 'pt', a: 'Entrar' },
    ],
  },
  {
    id: 'password',
    kind: 'field',
    en: { locale: 'EN', lang: 'en', a: 'Password', b: '••••••••' },
    tr: [
      { locale: 'DA', lang: 'da', a: 'Adgangskode', b: '••••••••' },
      { locale: 'TR', lang: 'tr', a: 'Parola', b: '••••••••' },
      { locale: 'PL', lang: 'pl', a: 'Hasło', b: '••••••••' },
      { locale: 'HI', lang: 'hi', a: 'पासवर्ड', b: '••••••••' },
    ],
  },
  {
    id: 'review',
    kind: 'banner',
    en: { locale: 'EN', lang: 'en', a: '2 strings require review' },
    tr: [
      { locale: 'NL', lang: 'nl', a: '2 teksten vereisen controle' },
      { locale: 'SV', lang: 'sv', a: '2 strängar kräver granskning' },
      { locale: 'ES', lang: 'es', a: '2 cadenas requieren revisión' },
      { locale: 'KO', lang: 'ko', a: '2개 문자열 검토 필요' },
    ],
  },

  {
    id: 'seats',
    kind: 'stat',
    en: { locale: 'EN', lang: 'en', a: 'Seats used', b: '42 / 50' },
    tr: [
      { locale: 'DE', lang: 'de', a: 'Belegte Plätze', b: '42 / 50' },
      { locale: 'JA', lang: 'ja', a: '使用中のシート', b: '42 / 50' },
      { locale: 'PT', lang: 'pt', a: 'Assentos usados', b: '42 / 50' },
      { locale: 'TR', lang: 'tr', a: 'Kullanılan koltuk', b: '42 / 50' },
    ],
  },
  {
    id: 'locale',
    kind: 'select',
    en: { locale: 'EN', lang: 'en', a: 'Language', b: 'English (US)' },
    tr: [
      { locale: 'ZH', lang: 'zh', a: '语言', b: '简体中文' },
      { locale: 'AR', lang: 'ar', rtl: true, a: 'اللغة', b: 'العربية' },
      { locale: 'NL', lang: 'nl', a: 'Taal', b: 'Nederlands' },
      { locale: 'SV', lang: 'sv', a: 'Språk', b: 'Svenska' },
    ],
  },
  {
    id: 'invite',
    kind: 'actions',
    en: { locale: 'EN', lang: 'en', a: 'Decline', b: 'Send invite' },
    tr: [
      { locale: 'IT', lang: 'it', a: 'Rifiuta', b: 'Invia invito' },
      { locale: 'ID', lang: 'id', a: 'Tolak', b: 'Kirim undangan' },
      { locale: 'DA', lang: 'da', a: 'Afvis', b: 'Send invitation' },
      { locale: 'VI', lang: 'vi', a: 'Từ chối', b: 'Gửi lời mời' },
    ],
  },
];

/**
 * Three columns per side, eight components deep, so the wall fills the frame
 * top to bottom instead of leaving holes at either end. Column 1 survives to
 * the narrowest viewport, column 2 drops below 1200px, column 3 below 900px.
 */
export const WALL_COLUMNS: string[][] = [
  ['search', 'plan', 'toast', 'remember', 'nav', 'users', 'seats', 'signin'],
  ['email', 'theo', 'tabs', 'notify', 'upload', 'locale', 'cta', 'password'],
  ['country', 'trial', 'comment', 'deploy', 'billing', 'dialog', 'invite', 'review'],
];

/**
 * The language strip. Concrete mono is black / white / metallic, so a locale is
 * stamped as its BCP-47 code in a hairline cell — full-colour flag emoji were
 * the only saturated pixels on the page and read as pasted in.
 */
export const FLAGS: { code: string; name: string }[] = [
  { code: 'ES', name: 'Español' },
  { code: 'FR', name: 'Français' },
  { code: 'JA', name: '日本語' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'ZH', name: '中文' },
  { code: 'KO', name: '한국어' },
  { code: 'PT', name: 'Português' },
  { code: 'IT', name: 'Italiano' },
  { code: 'HI', name: 'हिन्दी' },
  { code: 'AR', name: 'العربية' },
  { code: 'NL', name: 'Nederlands' },
  { code: 'PL', name: 'Polski' },
  { code: 'SV', name: 'Svenska' },
  { code: 'TR', name: 'Türkçe' },
  { code: 'VI', name: 'Tiếng Việt' },
  { code: 'TH', name: 'ไทย' },
  { code: 'DA', name: 'Dansk' },
  { code: 'ID', name: 'Bahasa' },
];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

export const STATS: { value: string; label: string }[] = [
  { value: '118', label: 'Languages' },
  { value: '1,000,000,000', label: 'Users to reach' },
  { value: '6', label: 'Frameworks' },
  { value: '$0', label: 'To start' },
];

/** Dock captions for the shared story, in this direction's uppercase voice. */
export const STORY_CAPTIONS: string[] = [
  'GT HELPS YOU…',
  'GT KNOWS YOUR CONTEXT.',
  'GT DOES YOUR TRANSLATING.',
  'AROUND ANY COMPONENT.',
  'WITH YOUR OWN CONTEXT.',
  'WITH YOUR REVIEW.',
  'THIS IS WHERE LOCADEX COMES IN.',
  'CODE IS PUSHED — LOCADEX SCANS.',
  'LOCADEX MAPS WHAT CHANGED.',
  'IT EDITS CODE, THEN TRANSLATES IN CONTEXT.',
  'IT OPENS THE PR. REVIEW, MERGE, LIVE.',
];
