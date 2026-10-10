# Borrowing the grammar for another surface

`SKILL.md` points here. Moved from it on 2026-10-10, unchanged.

## What the dashboard took from the deck

Kevin judged the first dashboard, onboarding and auth pass against the deck on 2026-09-25: "this is bad, it does not feel like our style and is too busy, not intuitive, kerning needs to be adjusted, no ugly border lines, it needs to follow the principles of contrast better ... check this out: prototemplate.vercel.app/deck". The corrective grammar took these from `head.html`:

- the tokens in section 4, with the dark theme as a remap;
- the type ladder with tracking on Inter's curve: headings at -0.025em with cv11 and ss01, smaller headings closer to zero, running text at 0, and small counters slightly positive;
- weight 500 as the ceiling;
- one rule per seam and ruled rows, with no boxed tiles, shadows, chevrons or eyebrow labels.

The rails, the rules and the registration crosses belong to the 1600 by 900 sheet; crosses floating in the app were among what read as wrong in that pass. Icons and dither material follow the host repository. gt-cloud's gt-ui lint accepts only Heroicons 24 solid and 16 solid for meaning and Lucide for controls (`tooling/oxlint-plugins/gt-ui.ts`), so the deck's 20 solid sprite stays in the deck, and the dashboard's dither comes from the landing hero's studio field. gt-aesthetic holds Kevin's verdicts across surfaces.
