/**
 * The landing engine's layout numbers as functions of the viewport width,
 * read from the stylesheets that ship them: src/app/d/toolchain/styles.css
 * (the engine), src/app/d/_v0/v0-pages.css (the production home layer),
 * src/app/d/toolchain/sections/darkband-v3.css (the full-bleed band) and
 * src/app/d/production/prod-shell.css (the 1104px column). Each
 * clamp(min, n vw, max) resolves against the modelled width, so a plate
 * can lay a page out at any width inside the docs column.
 */

const REM = 16;

/** clamp(min, n vw, max) at a viewport `width` pixels wide. */
export function clampVw(min: number, vw: number, max: number, width: number): number {
  return Math.min(max, Math.max(min, (vw * width) / 100));
}

/** The two columns: the production mirror's 1104px, and the toolchain engine's and the hub article's 1170px. */
export type RailId = '1104' | '1170';

export const RAIL_PX: Record<RailId, number> = { '1104': 1104, '1170': 1170 };

export type LandingMetrics = {
  /** the drawn column: min(rail, 100%) */
  column: number;
  /** the column's two lines; border-inline drops to 0 at 620px and under */
  lines: boolean;
  /** --tc-gut, the inline padding of every band */
  gut: number;
  /** the mobile type ladder and its paddings apply (720px and under) */
  phone: boolean;
  /** bento rows stack to one column (1023px and under) */
  stacked: boolean;
  heroTop: number;
  heroBottom: number;
  heroH1: number;
  heroLh: number;
  /** the Cta row's margin under the hero copy */
  ctaGap: number;
  headTop: number;
  headBottom: number;
  h2: number;
  h2Lh: number;
  /** the heading runs one line (production, 760px and up) */
  h2Nowrap: boolean;
  lead: number;
  leadLh: number;
  leadGap: number;
  hatch: number;
  btn: number;
  /** the hero's buttons fill the column up to 440px (620px and under) */
  btnFill: boolean;
  cellTop: number;
  cellBottom: number;
  bandTop: number;
  bandBottom: number;
};

/** Every number a landing band reads at `width`, for the production (1104) or toolchain (1170) family. */
export function landingMetrics(width: number, rail: RailId): LandingMetrics {
  const phone = width <= 720;
  const prod = rail === '1104';
  return {
    column: Math.min(RAIL_PX[rail], width),
    lines: width > 620,
    gut: clampVw(20, 3.1, 36, width),
    phone,
    stacked: width <= 1023,
    heroTop: clampVw(44, 5.6, 72, width),
    heroBottom: clampVw(40, 5, 64, width),
    heroH1: phone ? 2.5 * REM : clampVw(2.05 * REM, 4.9, 3.7 * REM, width),
    heroLh: 1.03,
    ctaGap: prod ? 12 : 28,
    /* production's head top: v0-pages.css clamp(26px, 2.8vw, 36px); the engine's clamp(54px, 6.4vw, 82px) */
    headTop: phone ? 72 : prod ? clampVw(26, 2.8, 36, width) : clampVw(54, 6.4, 82, width),
    headBottom: phone ? 36 : clampVw(28, 3.2, 38, width),
    h2: phone ? 36 : clampVw(1.62 * REM, 2.5, 2.2 * REM, width),
    h2Lh: phone ? 1.18 : 1.06,
    h2Nowrap: prod && width >= 760,
    lead: phone ? 17 : 15,
    leadLh: phone ? 1.55 : 1.62,
    leadGap: phone ? 18 : 13,
    /* production's mobile cut widens the spacer to 36px; the engine's late 720 block sets 40px */
    hatch: phone ? (prod ? 36 : 40) : clampVw(28, 3.4, 40, width),
    btn: phone ? 44 : 38,
    btnFill: width <= 620,
    cellTop: phone ? clampVw(34, 6, 42, width) : clampVw(26, 3, 36, width),
    cellBottom: phone ? clampVw(38, 6.5, 46, width) : clampVw(30, 3.4, 40, width),
    bandTop: phone && prod ? 36 : prod ? clampVw(28, 3, 40, width) : clampVw(60, 7, 96, width),
    bandBottom: clampVw(56, 7, 88, width),
  };
}

/** A pixel value for a readout: whole pixels, one decimal where the clamp lands between. */
export function px(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}px`;
}
