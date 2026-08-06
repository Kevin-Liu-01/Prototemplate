# Post-omnibus inline punch list — ALL EXECUTED 2026-07-30

1. **"every" morph polish** (Hero.tsx): clamp dust ring radii to the measured box so glyphs
   never escape or clip; scale dust size with the em; at narrow viewports simplify to a clean
   crossfade (26 particles cannot breathe at mobile size); tighten guide draw-in; ascender
   headroom.
2. **Slider verification** (all code-reveal dividers): no chrome, fully contained, doubled
   hairline gauge, present on the gt-translate preview cards.
3. **Stats ledger rewrite** ("Built for your next billion users" cell, Bento.tsx):
   - Copy: heading keeps "Built for your next billion users." — DELETE the redundant
     "1,000,000,000 / users you have not met yet" row (the heading already says it). Rows become:
     118 · locales, ready today | 6 · first-party SDKs | <1s · over-the-air updates | $0 · to start.
   - Presentation: two-per-row compact grid, numeral above its label, left-aligned, tabular
     numerals on a shared baseline, doubled-hairline separators at constant gauge — kill the
     value-left/label-far-right tension.
