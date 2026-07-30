/**
 * Content for the Field Magnet direction.
 *
 * Every non-English string here is a real translation of the English above it —
 * the hero's lens emits genuine localized copy, never placeholder glyphs.
 */

export type ArtifactKind = 'button' | 'toast' | 'field' | 'price' | 'nav' | 'copy' | 'theo' | 'chip';

export type Artifact = {
  id: string;
  kind: ArtifactKind;
  /** Ray angle off the horizontal band, in degrees — shapes the plate's
   *  horizontal approach curve and its far-radius cap only. */
  angle: number;
  /**
   * The plate's altitude lane, in px off the band's centre line. Altitude is
   * engineered, not derived from the ray: the r2 fan converged every plate
   * toward the centre line near the well, which mathematically guaranteed
   * card-on-card collisions (a still caught 'Docs Pricing Blog' printed over
   * the email field mid-word). Lanes are assigned so every band
   * (lane ± plate half-height, times its fan spread) is disjoint from its
   * neighbours — plates can never overlap, at any pair of cycle positions.
   */
  lane: number;
  /** How far the lane fans outward at the ray's far end (0 = constant lane,
   *  0.2 = 20% farther from the band at full radius). */
  fan: number;
  /** Seconds for one full left-edge → lens → right-edge crossing. */
  period: number;
  /** Starting position on that crossing, 0–2 (1 = inside the lens). */
  phase: number;
  /** BCP-47 tag of the language this artifact emerges in. */
  lang: string;
  /** Locale of the emerged face (lowercase, §2). */
  locale: string;
  rtl?: boolean;
  /**
   * Closest approach to the lens, in px. The gate is opaque hardware with an
   * ambient shadow disc around it, so a plate that turns around inside that
   * radius is read as smeared grey rather than as a component. Each plate's
   * turn radius is therefore its own half-width plus the shadow — wide plates
   * (Theo's card, the price card) swing wider than the small ones.
   */
  near: number;
  /** Keep this plate in front of every other artifact and of the gate's shadow. */
  front?: boolean;
};

/** Radius of the gate's bezel plus its ambient shadow disc, in scene px. */
const GATE_CLEAR = 178;

/* Five plates, five disjoint lanes — the measured hero envelope at 1440×900
   runs from the sub-headline's baseline (−169 off the band's centre line) to
   the language band's thread rule (+188), and resend's hero composition has
   no overlapping or clipped objects, so plate count buys composure. The lane
   table, verified against measured plate heights
   (band = |lane|·(1+fan) ± height/2):

     button  h≈43   13..59      price  h≈76   14..90
     field   h≈56   64..120     theo   h≈89   94..183
     nav     h≈40  122..162

   every band is disjoint from its neighbours and inside the envelope, so no
   pair of plates can overlap at ANY pair of cycle positions, and none can
   cross the sub-headline or the thread rule. (The lanes scale down with the
   band on short viewports — see laneScale in sections/Hero.tsx.) */
export const ARTIFACTS: Artifact[] = [
  { id: 'button', kind: 'button', angle: -8, lane: -34, fan: 0.1, period: 13.5, phase: 0.15, lang: 'ja', locale: 'ja', near: GATE_CLEAR + 62 },
  { id: 'field', kind: 'field', angle: -20, lane: -92, fan: 0, period: 14, phase: 1.05, lang: 'es', locale: 'es', near: GATE_CLEAR + 110 },
  { id: 'nav', kind: 'nav', angle: -27, lane: -142, fan: 0, period: 13, phase: 0.62, lang: 'ar', locale: 'ar', rtl: true, near: GATE_CLEAR + 80 },
  { id: 'price', kind: 'price', angle: 25, lane: 52, fan: 0, period: 17, phase: 1.4, lang: 'de', locale: 'de', near: GATE_CLEAR + 112 },
  /* the widest plate on the page: a lane of its own, well outside the gate */
  { id: 'theo', kind: 'theo', angle: 32, lane: 136, fan: 0, period: 19, phase: 0.3, lang: 'es', locale: 'es', near: GATE_CLEAR + 244, front: true },
];

export const LANGUAGES: { flag: string; name: string }[] = [
  { flag: '🇪🇸', name: 'Español' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇨🇳', name: '中文' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇮🇹', name: 'Italiano' },
  { flag: '🇮🇳', name: 'हिन्दी' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇳🇱', name: 'Nederlands' },
  { flag: '🇸🇪', name: 'Svenska' },
  { flag: '🇵🇱', name: 'Polski' },
  { flag: '🇹🇷', name: 'Türkçe' },
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇹🇭', name: 'ไทย' },
];

export const TRUSTED = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

export const STATS: { value: string; label: string }[] = [
  { value: '118', label: 'languages' },
  { value: '1,000,000,000', label: 'users reached' },
  { value: '6', label: 'frameworks' },
  { value: '$0', label: 'to start' },
];

export const DOCK_CAPTIONS = [
  'gt helps you…',
  'GT knows your context.',
  'GT does your translating.',
  'Around any component.',
  'With your own context.',
  'With your review.',
  'This is where Locadex comes in.',
  'Code pushed — Locadex scans.',
  'Locadex maps what changed.',
  'It edits your code.',
  'It opens the PR — your site ships translated.',
  'Your site — in every language.',
];

